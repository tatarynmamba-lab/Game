import {scrypt,randomBytes,randomUUID,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(scrypt),PARAMS={N:32768,r:8,p:3,maxmem:64*1024*1024},SESSION_MS=7*24*60*60*1000;
const digest=value=>createHash('sha256').update(value).digest('hex');
export class AuthError extends Error{constructor(status,message){super(message);this.status=status}}
export function username(value){const name=String(value??'').normalize('NFKC').trim().toLocaleLowerCase('ru');if(!/^[\p{L}\p{N}_]{3,32}$/u.test(name))throw new AuthError(400,'Логин: от 3 до 32 букв, цифр или знаков _.');return name}
export function password(value){if(typeof value!=='string'||value.length<15||value.length>128)throw new AuthError(400,'Пароль должен содержать от 15 до 128 символов.');return value}
let activeHashes=0;
async function hash(value,salt){if(activeHashes>=4)throw new AuthError(429,'Сейчас много запросов на вход. Повторите через минуту.');activeHashes++;try{return await derive(value,salt,64,PARAMS)}finally{activeHashes--}}
export async function passwordHash(value){const salt=randomBytes(16).toString('hex'),result=await hash(password(value),salt);return 'scrypt-v1$'+salt+'$'+result.toString('hex')}
async function verify(value,stored){const parts=(stored||'scrypt-v1$00000000000000000000000000000000$'+'0'.repeat(128)).split('$');if(typeof value!=='string'||value.length>128||parts.length!==3||parts[0]!=='scrypt-v1')return false;const actual=await hash(value,parts[1]),expected=Buffer.from(parts[2],'hex');return expected.length===actual.length&&timingSafeEqual(expected,actual)&&Boolean(stored)}
export function initializeAuth(sql){sql.exec(`CREATE TABLE IF NOT EXISTS auth_users(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user',created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS auth_sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS auth_session_user ON auth_sessions(user_id);`)}
export async function createUser(sql,{name,username:login,password:secret},role='user'){
 const normalized=username(login),display=String(name??'').trim();if(display.length<2||display.length>60)throw new AuthError(400,'Имя должно содержать от 2 до 60 символов.');
 if(sql.prepare('SELECT id FROM auth_users WHERE username=?').get(normalized))throw new AuthError(409,'Этот логин уже занят. Выберите другой.');
 const stored=await passwordHash(secret),id=randomUUID();
 try{sql.prepare('INSERT INTO auth_users(id,username,name,password_hash,role,created_at) VALUES(?,?,?,?,?,?)').run(id,normalized,display,stored,role==='admin'?'admin':'user',Date.now())}catch(e){if(String(e.message).includes('UNIQUE'))throw new AuthError(409,'Этот логин уже занят.');throw e}
 return {id,name:display,username:normalized,role};
}
export function createAuth(sql,{secure=false}={}){
 initializeAuth(sql);const cookieName=secure?'__Host-arkanterium_session':'arkanterium_session';const limits=new Map();
 function rate(key,max,window){const now=Date.now();if(limits.size>10000)for(const [k,v]of limits)if(v.until<now)limits.delete(k);let entry=limits.get(key);if(!entry||entry.until<now){entry={count:0,until:now+window};limits.set(key,entry)}if(entry.count>=max)throw new AuthError(429,'Слишком много попыток. Повторите позже.');entry.count++}
 function token(req){return String(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1)||''}
 function identity(req){const value=token(req);if(!/^[a-f0-9]{64}$/.test(value))return null;const row=sql.prepare('SELECT u.id,u.name,u.username,u.role FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').get(digest(value),Date.now());return row?{userId:row.id,displayName:row.name,email:'',isAdmin:row.role==='admin'}:null}
 function cookie(value,age){return `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure?'; Secure':''}`}
 function session(user,req){const old=token(req);if(old)sql.prepare('DELETE FROM auth_sessions WHERE token_hash=?').run(digest(old));const value=randomBytes(32).toString('hex');sql.prepare('DELETE FROM auth_sessions WHERE expires_at<=?').run(Date.now());sql.prepare('INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(digest(value),user.id,Date.now()+SESSION_MS);const ids=sql.prepare('SELECT token_hash FROM auth_sessions WHERE user_id=? ORDER BY expires_at DESC LIMIT -1 OFFSET 20').all(user.id);for(const id of ids)sql.prepare('DELETE FROM auth_sessions WHERE token_hash=?').run(id.token_hash);return Response.json({ok:true},{headers:{'Set-Cookie':cookie(value,SESSION_MS/1000),'Cache-Control':'no-store'}})}
 async function handle(req,ip){const action=new URL(req.url).pathname.split('/').at(-1);if(action==='config'&&req.method==='GET')return Response.json({mode:'password'});
  if(req.method!=='POST')throw new AuthError(405,'Используйте форму входа.');
  if(action==='logout'){const value=token(req);if(value)sql.prepare('DELETE FROM auth_sessions WHERE token_hash=?').run(digest(value));return Response.json({ok:true},{headers:{'Set-Cookie':cookie('',0)}})}
  if(!['register','login'].includes(action))throw new AuthError(404,'Неизвестный адрес.');
  rate(action+':ip:'+ip,action==='register'?10:60,15*60*1000);
  let data;try{data=await req.json()}catch{throw new AuthError(400,'Не удалось прочитать форму.')}if(!data||typeof data!=='object')throw new AuthError(400,'Проверьте данные.');
  const login=username(data.username);rate('account:'+login,20,15*60*1000);
  if(action==='register'){const user=await createUser(sql,data);limits.delete('account:'+login);return session(user,req)}
  const user=sql.prepare('SELECT * FROM auth_users WHERE username=?').get(login);
  if(!await verify(data.password,user?.password_hash))throw new AuthError(401,'Неверный логин или пароль.');
  limits.delete('account:'+login);return session(user,req);
 }
 return {identity,handle};
}
