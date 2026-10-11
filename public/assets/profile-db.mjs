let identity,revision=0,legacy;
async function request(path,options={}){const r=await fetch('/api/'+path,{...options,cache:'no-store'}),data=await r.json();if(!r.ok)throw new Error(data.error||'Не удалось сохранить профиль.');return data}
async function account(){if(!identity){identity=(await request('me')).user;if(!identity)throw new Error('Войдите в аккаунт, чтобы открыть профиль.')}return identity}
export async function loadPage(){await account();const data=await request('profile');revision=data.page.revision;return data}
async function submit(path,payload,photos=[]){const form=new FormData();form.set('payload',JSON.stringify({...payload,revision,photos:photos.map(p=>({id:p.id,name:p.name}))}));for(const photo of photos)form.set('photo_'+photo.id,photo.blob,photo.name||'photo.webp');const data=await request(path,{method:'POST',body:form});revision=data.page.revision;return data.page}
export async function commit(action,photos=[]){await account();return submit('profile/actions',{action:{...action,photos:undefined}},photos)}
async function readOldDatabase(name){
 if(!globalThis.indexedDB)return null;
 if(indexedDB.databases){const names=await indexedDB.databases();if(!names.some(db=>db.name===name))return null}
 return new Promise((resolve,reject)=>{const r=indexedDB.open(name);r.onupgradeneeded=()=>{r.transaction.abort();resolve(null)};r.onerror=()=>resolve(null);r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains('page')||!db.objectStoreNames.contains('photos')){db.close();resolve(null);return}const tx=db.transaction(['page','photos'],'readonly'),page=tx.objectStore('page').get('main'),photos=tx.objectStore('photos').getAll();tx.oncomplete=()=>{db.close();resolve(page.result?{page:page.result,photos:photos.result}:null)};tx.onerror=()=>{db.close();reject(tx.error)}}});
}
export async function legacyProfileAvailable(){await account();if(revision!==0)return false;try{legacy=await readOldDatabase('arkanterium-profile-'+encodeURIComponent(identity.id));if(!legacy&&localStorage.getItem('arkanterium:profile')&&!localStorage.getItem('arkanterium:legacy-profile-imported'))legacy=await readOldDatabase('arkanterium-profile');return Boolean(legacy?.page&&(legacy.page.revision||legacy.photos.length))}catch{return false}}
export async function importLegacyProfile(){if(!legacy&&!await legacyProfileAvailable())throw new Error('Прежний профиль не найден.');await submit('profile/import',{page:legacy.page},legacy.photos);try{localStorage.setItem('arkanterium:legacy-profile-imported',identity.id)}catch{}legacy=null}
