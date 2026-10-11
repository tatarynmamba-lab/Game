import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {readFile,writeFile,rename,rm,mkdir} from 'node:fs/promises';
import {resolve,join,dirname,sep} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
export function openStorage(dataDir,migrationsDir){
 const directory=resolve(dataDir);mkdirSync(directory,{recursive:true,mode:0o700});
 const sql=new DatabaseSync(join(directory,'arkanterium.sqlite'));
 sql.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS _app_migrations(name TEXT PRIMARY KEY,hash TEXT NOT NULL);');
 for(const name of readdirSync(migrationsDir).filter(f=>f.endsWith('.sql')).sort()){
  const source=readFileSync(join(migrationsDir,name),'utf8'),hash=createHash('sha256').update(source).digest('hex'),existing=sql.prepare('SELECT hash FROM _app_migrations WHERE name=?').get(name);
  if(existing){if(existing.hash!==hash)throw new Error('Изменена применённая миграция '+name);continue}
  sql.exec('BEGIN IMMEDIATE');try{sql.exec(source);sql.prepare('INSERT INTO _app_migrations(name,hash) VALUES(?,?)').run(name,hash);sql.exec('COMMIT')}catch(error){sql.exec('ROLLBACK');throw error}
 }
 const db={prepare(text){let args=[];return {bind(...values){args=values;return this},run(){const result=sql.prepare(text).run(...args);return {meta:{changes:Number(result.changes)}}},first(){return sql.prepare(text).get(...args)||null},all(){return {results:sql.prepare(text).all(...args)}}}},batch(statements){sql.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>s.run());sql.exec('COMMIT');return result}catch(error){sql.exec('ROLLBACK');throw error}}};
 const uploadDir=join(directory,'uploads');mkdirSync(uploadDir,{recursive:true,mode:0o700});
 function target(key){const path=resolve(uploadDir,key);if(!path.startsWith(uploadDir+sep))throw new Error('Invalid storage key');return path}
 const bucket={async put(key,body){const path=target(key);await mkdir(dirname(path),{recursive:true,mode:0o700});const temp=path+'.'+randomUUID()+'.tmp';await writeFile(temp,new Uint8Array(body),{mode:0o600});await rename(temp,path)},async get(key){try{return {body:new Uint8Array(await readFile(target(key)))}}catch(e){if(e.code==='ENOENT')return null;throw e}},async delete(key){await rm(target(key),{force:true})}};
 return {sql,db,bucket,close(){sql.close()}};
}
