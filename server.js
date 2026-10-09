'use strict';
// Dependency-free local HTTP server. Run: node server.js --open
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const root = __dirname;
const port = Number(process.env.PORT || 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be an integer between 1 and 65535.');process.exit(1);
}
const host = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1';
const pages = new Set(['index.html','hero.html','map.html','battle.html','contracts.html','inventory.html','tavern.html','journal.html']);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const server = http.createServer((req,res)=>{
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
  let pathname;
  try {pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400);return res.end('Bad request');}
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  const allowed = pages.has(relative) || /^assets\/(css|js)\/[a-zA-Z0-9_-]+\.(css|js)$/.test(relative);
  if (!allowed) {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Страница не найдена');}
  fs.readFile(path.join(root,relative),(err,data)=>{
    if(err){res.writeHead(404);return res.end('Not found');}
    res.writeHead(200,{'Content-Type':mime[path.extname(relative)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:data);
  });
});
server.on('error',err=>{
  console.error(err.code==='EADDRINUSE' ? `Port ${port} is busy. Close another game server or set PORT to another number.` : err.message);
  process.exit(1);
});
server.listen(port,host,()=>{
  const url=`http://localhost:${port}`;
  console.log(`Witcher: Hunters Path\nOpen ${url}\nKeep this window open. Ctrl+C to stop.`);
  if(host==='0.0.0.0')console.log('LAN mode: use your computer LAN IP and this port on your phone.');
  if(process.argv.includes('--open')){
    const platform=process.platform;
    const command=platform==='win32'?'cmd':platform==='darwin'?'open':'xdg-open';
    const args=platform==='win32'?['/c','start','',url]:[url];
    const child=spawn(command,args,{stdio:'ignore'});child.on('error',()=>console.log(`Open ${url} in your browser.`));
  }
});
