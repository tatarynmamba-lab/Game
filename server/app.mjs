import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {readFile} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import {isIP} from 'node:net';
import {openStorage} from './storage.mjs';
import {createAuth,AuthError} from './auth.mjs';
import {handleApi} from './api.mjs';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.ico':'image/x-icon'};
function relative(value,fallback='/account.html'){try{const url=new URL(value||fallback,'https://internal.test');return url.origin==='https://internal.test'&&!/^\/(auth\.html|api\/|signin-with-chatgpt|signout-with-chatgpt)/.test(url.pathname)?url.pathname+url.search+url.hash:fallback}catch{return fallback}}
export function createApplication({rootDir,dataDir,origin='',production=false,trustProxy=false}){
 if(production&&(!origin||!origin.startsWith('https://')))throw new Error('Для публикации укажите APP_ORIGIN=https://ваш-домен.');
 if(origin){const u=new URL(origin);if(u.origin!==origin||!['http:','https:'].includes(u.protocol))throw new Error('APP_ORIGIN должен содержать только адрес сайта без пути и завершающего /.')}
 const storage=openStorage(dataDir,join(rootDir,'migrations')),auth=createAuth(storage.sql,{secure:origin.startsWith('https://')});
 const server=createServer(async(incoming,outgoing)=>{
  try{
   const port=server.address().port,allowed=origin?[origin]:[`http://localhost:${port}`,`http://127.0.0.1:${port}`];
   const host=String(incoming.headers.host||'');if(!allowed.some(o=>new URL(o).host===host))throw new AuthError(421,'Неверный адрес сайта.');
   const base=origin||'http://'+host,url=new URL(incoming.url,base),method=incoming.method||'GET';
   if(!['GET','HEAD','POST','PUT','DELETE'].includes(method))throw new AuthError(405,'Метод не поддерживается.');
   if(!['GET','HEAD'].includes(method)){
    if(incoming.headers.origin!==base||incoming.headers['sec-fetch-site']==='cross-site')throw new AuthError(403,'Запрос с другого сайта отклонён.');
   }
   const limit=url.pathname.startsWith('/api/auth/')?8192:21*1024*1024;
   if(Number(incoming.headers['content-length']||0)>limit)throw new AuthError(413,'Слишком большой запрос.');
   let body; if(!['GET','HEAD'].includes(method)){const chunks=[];let size=0;for await(const chunk of incoming){size+=chunk.length;if(size>limit)throw new AuthError(413,'Слишком большой запрос.');chunks.push(chunk)}body=Buffer.concat(chunks)}
   const request=new Request(url,{method,headers:incoming.headers,body});
   const user=auth.identity(request);let response;
   if(url.pathname.startsWith('/api/auth/')){const forwarded=String(incoming.headers['x-forwarded-for']||'').split(',').at(-1).trim(),ip=trustProxy&&isIP(forwarded)?forwarded:incoming.socket.remoteAddress;response=await auth.handle(request,ip)}
   else if(url.pathname.startsWith('/api/'))response=await handleApi(request,user,{db:storage.db,bucket:storage.bucket,adminUserId:user?.isAdmin?user.userId:undefined});
   else if(url.pathname==='/health')response=Response.json({ok:true});
   else if(url.pathname==='/signin-with-chatgpt')response=Response.redirect(new URL('/auth.html?return_to='+encodeURIComponent(relative(url.searchParams.get('return_to'))),base),302);
   else if(url.pathname==='/signout-with-chatgpt')response=new Response('<!doctype html><html lang="ru"><meta charset="utf-8"><title>Выход</title><p>Чтобы выйти, используйте ссылку «Выйти из аккаунта» в личном кабинете.</p><a href="/account.html">Личный кабинет</a></html>',{headers:{'Content-Type':'text/html; charset=utf-8'}});
   else if(!['GET','HEAD'].includes(method))throw new AuthError(405,'Метод не поддерживается.');
   else {
    const pages={'/':'catalog.html','/index.html':'catalog.html','/auth.html':'auth.html','/account.html':'account.html','/profile.html':'profile.html'};
    if(['/account.html','/profile.html'].includes(url.pathname)&&!user)response=Response.redirect(new URL('/auth.html?return_to='+encodeURIComponent(url.pathname+url.search),base),302);
    else {
     let file,mime;
     if(pages[url.pathname]||/^\/business\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)){file=join(rootDir,'content',pages[url.pathname]||'business.html');mime=types['.html']}
     else if(url.pathname.startsWith('/assets/')||url.pathname==='/favicon.svg'){
      const publicDir=resolve(rootDir,'public');file=resolve(publicDir,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(publicDir+sep))throw new AuthError(404,'Страница не найдена.');mime=types[extname(file)];if(!mime)throw new AuthError(404,'Файл не найден.');
     }else throw new AuthError(404,'Страница не найдена.');
     try{response=new Response(await readFile(file),{headers:{'Content-Type':mime}})}catch(error){if(error.code==='ENOENT')throw new AuthError(404,'Страница не найдена.');throw error}
    }
   }
   response=new Response(response.body,{status:response.status,headers:response.headers});
   response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy','same-origin');response.headers.set('Cache-Control','no-store');
   if(!response.headers.has('Content-Security-Policy'))response.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
   if(origin.startsWith('https://'))response.headers.set('Strict-Transport-Security','max-age=31536000');
   outgoing.writeHead(response.status,Object.fromEntries(response.headers));if(method==='HEAD'||!response.body)outgoing.end();else Readable.fromWeb(response.body).pipe(outgoing);
  }catch(error){if(!error.status)console.error('Request failed:',error.message);if(!outgoing.headersSent)outgoing.writeHead(error.status||500,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});outgoing.end(JSON.stringify({error:error.status?error.message:'Не удалось выполнить действие. Повторите попытку.'}))}
 });
 server.requestTimeout=30000;server.headersTimeout=15000;server.maxHeadersCount=100;
 return {server,storage,async close(){await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));storage.close()}};
}
