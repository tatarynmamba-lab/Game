import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createApplication} from '../server/app.mjs';
import {createUser,createAuth} from '../server/auth.mjs';
const rootDir=fileURLToPath(new URL('../',import.meta.url));
test('Registration, sessions, persisted profiles and two-account privacy',async()=>{
 const dataDir=await mkdtemp(join(tmpdir(),'arkanterium-'));let app,base;
 async function start(){app=createApplication({rootDir,dataDir});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+app.server.address().port}
 const alice={cookie:''},bob={cookie:''},admin={cookie:''};
 async function request(path,user=null,method='GET',data,extra={}){const headers={...extra};if(user?.cookie)headers.cookie=user.cookie;let body;if(data instanceof FormData)body=data;else if(data!==undefined){body=JSON.stringify(data);headers['Content-Type']='application/json'}if(!['GET','HEAD'].includes(method)&&!('Origin' in headers))headers.Origin=base;const response=await fetch(base+path,{method,headers,body,redirect:'manual'});const set=response.headers.get('set-cookie');if(set&&user)user.cookie=set.split(';')[0];return response}
 async function expect(path,user,method,data,status,headers){const response=await request(path,user,method,data,headers);assert.equal(response.status,status,path+' '+method+': '+(response.status===status?'':await response.text()));return response}
 try{
  await start();
  await expect('/account.html',null,'GET',undefined,302);await expect('/profile.html',null,'GET',undefined,302);
  assert.equal((await (await request('/api/me',null,'GET',undefined,{'oai-authenticated-user-id':'fake','oai-authenticated-user-email':'admin@example.test'})).json()).user,null);
  assert.equal((await (await request('/api/auth/config')).json()).mode,'password');
  await expect('/api/auth/register',alice,'POST',{name:'Алиса',username:'alice',password:'short'},400);
  const credentials={name:'Алиса',username:'alice',password:'one very long secret password'};
  const created=await expect('/api/auth/register',alice,'POST',credentials,200);assert.match(created.headers.get('set-cookie'),/HttpOnly/);assert.match(created.headers.get('set-cookie'),/SameSite=Lax/);
  await expect('/api/auth/register',null,'POST',credentials,409);
  await expect('/api/auth/register',bob,'POST',{name:'Боб',username:'bob',password:'another long private password',role:'admin',isAdmin:true},200);
  assert.equal((await (await request('/api/me',bob)).json()).user.isAdmin,false);
  await expect('/api/admin/categories',bob,'GET',undefined,403);
  const note=await (await expect('/api/notes',alice,'POST',{title:'Планы',body:'Только для Алисы',owner_id:'bob'},201)).json();
  assert.equal((await (await request('/api/notes',bob)).json()).notes.length,0);
  await expect('/api/notes/'+note.id,bob,'PUT',{title:'Подмена',body:'Чужая заметка'},404);
  await expect('/api/notes',alice,'POST',{title:'CSRF',body:'CSRF'},403,{Origin:'https://attacker.example'});
  const fileForm=new FormData();fileForm.set('file',new File(['private content'],'secret.txt',{type:'text/plain'}));
  const file=await (await expect('/api/files',alice,'POST',fileForm,201)).json();await expect('/api/files/'+file.id,bob,'GET',undefined,404);
  const profile=await (await request('/api/profile',alice)).json();assert.equal(profile.page.profile.name,'Алиса');
  await expect('/api/profile/actions',alice,'POST',{revision:0,action:{type:'profile',data:{name:'Алиса Тест',about:'Описание моего профиля',city:'Казань'}}},200);
  await expect('/api/profile/actions',alice,'POST',{revision:0,action:{type:'profile',data:{name:'Старая форма'}}},409);
  assert.equal((await (await request('/api/profile',bob)).json()).page.profile.about,'');
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6u8AAAAASUVORK5CYII=','base64');
  const photoForm=new FormData();photoForm.set('payload',JSON.stringify({revision:1,action:{type:'photos',slot:'avatar'},photos:[{id:'alice-avatar',name:'Аватар'}]}));photoForm.set('photo_alice-avatar',new File([png],'avatar.png',{type:'image/png'}));
  await expect('/api/profile/actions',alice,'POST',photoForm,200);await expect('/api/profile/photos/alice-avatar',bob,'GET',undefined,404);await expect('/api/profile/photos/alice-avatar',null,'GET',undefined,401);
  const ownPhoto=await expect('/api/profile/photos/alice-avatar',alice,'GET',undefined,200);assert.equal(ownPhoto.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await ownPhoto.arrayBuffer()),png);
  await expect('/api/profile/actions',alice,'POST',{revision:2,action:{type:'post',id:'alice-post',text:'Первая запись',photoIds:['alice-avatar']}},200);
  const business={title:'Студия Алисы',category:'design',description:'Дизайн для людей и бизнеса',city:'Казань',website:'',published:true};
  const businessData=await (await expect('/api/businesses',alice,'POST',business,201)).json();await expect('/business/'+businessData.id,null,'GET',undefined,200);
  assert.equal((await (await request('/api/businesses/'+businessData.id)).json()).canEdit,false);
  await expect('/api/businesses/'+businessData.id+'/page',bob,'PUT',business,404);
  await createUser(app.storage.sql,{name:'Владелец',username:'owner',password:'owner separate secure phrase'},'admin');await expect('/api/auth/login',admin,'POST',{username:'owner',password:'owner separate secure phrase'},200);
  assert.equal((await (await request('/api/me',admin)).json()).user.isAdmin,true);await expect('/api/admin/categories',admin,'GET',undefined,200);
  const hash=app.storage.sql.prepare('SELECT password_hash FROM auth_users WHERE username=?').get('alice').password_hash;assert.match(hash,/^scrypt-v1\$/);assert.ok(!hash.includes(credentials.password));
  const secureAuth=createAuth(app.storage.sql,{secure:true}),secureResponse=await secureAuth.handle(new Request('https://example.test/api/auth/login',{method:'POST',body:JSON.stringify({username:'alice',password:credentials.password}),headers:{'Content-Type':'application/json'}}),'127.0.0.2');assert.match(secureResponse.headers.get('set-cookie'),/^__Host-arkanterium_session=.*; Secure$/);
  await app.close();await start();
  const persisted=await (await request('/api/profile',alice)).json();assert.equal(persisted.page.profile.name,'Алиса Тест');assert.equal(persisted.page.posts[0].text,'Первая запись');assert.equal(persisted.page.avatar,'alice-avatar');
  assert.equal((await (await request('/api/notes',alice)).json()).notes[0].body,'Только для Алисы');assert.equal(await (await request('/api/files/'+file.id,alice)).text(),'private content');
  const oldCookie=alice.cookie;await expect('/api/auth/logout',alice,'POST',{},200);assert.equal((await (await request('/api/me',{cookie:oldCookie})).json()).user,null);await expect('/api/profile',alice,'GET',undefined,401);
  await expect('/api/auth/login',alice,'POST',{username:'alice',password:'wrong'},401);await expect('/api/auth/login',alice,'POST',{username:'alice',password:credentials.password},200);
  assert.equal((await (await request('/api/profile',alice)).json()).page.profile.name,'Алиса Тест');
  await expect('/data/arkanterium.sqlite',alice,'GET',undefined,404);await expect('/.env',alice,'GET',undefined,404);await expect('/assets/../../../server/auth.mjs',alice,'GET',undefined,404);
  for(const file of ['catalog','account','profile','business','auth']){const html=await readFile(join(rootDir,'content',file+'.html'),'utf8');assert.ok(html.includes('<html lang="ru">'));assert.ok(!html.includes('сохраняются в этом браузере'))}
 }finally{if(app?.server.listening)await app.close();await rm(dataDir,{recursive:true,force:true})}
});
