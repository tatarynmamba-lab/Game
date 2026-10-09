'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const net=require('node:net');
const path=require('node:path');
const {spawn}=require('node:child_process');
test('local server serves all pages and assets; source and traversal are blocked',async t=>{
  const reservation=net.createServer();
  await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));
  const port=reservation.address().port;
  await new Promise(resolve=>reservation.close(resolve));
  const child=spawn(process.execPath,[path.join(__dirname,'../server.js')],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
  t.after(()=>child.kill());
  await new Promise((resolve,reject)=>{
    let ready=false;
    const timeout=setTimeout(()=>reject(Error('Server startup timed out')),5000);
    child.stdout.on('data',chunk=>{if(String(chunk).includes('Open http')){ready=true;clearTimeout(timeout);resolve();}});
    child.once('error',err=>{clearTimeout(timeout);reject(err);});
    child.once('exit',code=>{if(!ready){clearTimeout(timeout);reject(Error(`Server exited: ${code}`));}});
  });
  const base=`http://127.0.0.1:${port}`;
  for(const file of ['','hero.html','map.html','battle.html','contracts.html','inventory.html','tavern.html','journal.html','assets/js/data.js','assets/js/engine.js','assets/js/app.js','assets/css/style.css']){
    const response=await fetch(`${base}/${file}`);assert.equal(response.status,200,file);
    assert.ok((await response.text()).length>100);
  }
  assert.match((await fetch(`${base}/`)).headers.get('content-type'),/text\/html/);
  assert.match((await fetch(`${base}/assets/js/engine.js`)).headers.get('content-type'),/javascript/);
  for(const file of ['server.js','README.md','missing.html','tests/game.test.js','..%2FREADME.md'])assert.equal((await fetch(`${base}/${file}`)).status,404,file);
  assert.equal((await fetch(`${base}/`,{method:'POST'})).status,405);
  const head=await fetch(`${base}/`,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
});
