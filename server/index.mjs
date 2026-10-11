import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createApplication} from './app.mjs';
const rootDir=fileURLToPath(new URL('../',import.meta.url)),port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1';
const app=createApplication({rootDir,dataDir:resolve(rootDir,process.env.DATA_DIR||'data'),origin:process.env.APP_ORIGIN||'',production:process.env.NODE_ENV==='production',trustProxy:process.env.TRUST_PROXY==='1'});
app.server.listen(port,host,()=>console.log('Аркантериум запущен: '+(process.env.APP_ORIGIN||'http://localhost:'+port)));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,async()=>{await app.close();process.exit(0)});
