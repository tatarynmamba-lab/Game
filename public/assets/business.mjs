import {validWebsite} from './catalog-model.mjs';

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg aria-hidden="true"><use href="#i-${esc(n)}"/></svg>`;
const id=location.pathname.split('/').filter(Boolean)[1]||'';
const endpoint='businesses/'+encodeURIComponent(id);
const root=$('#business-root'),dialog=$('#business-dialog');
let state=null,categories=[],busy=false,previewing=false,postDraft='',uploadKind='gallery',toastTimer,formSnapshot=null;
const photoURL=photoId=>'/api/'+endpoint+'/media/'+encodeURIComponent(photoId);
const readableDate=n=>new Date(n).toLocaleString('ru-RU',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
const canManage=()=>Boolean(state?.canEdit&&!previewing);
const mediaOf=kind=>state.media.find(m=>m.kind===kind);
function logo(className=''){const logo=mediaOf('logo');return `<span class="business-avatar ${className}">${logo?`<img src="${photoURL(logo.id)}" alt="Логотип ${esc(state.business.title)}">`:esc(state.business.title.charAt(0).toUpperCase())}</span>`}
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,5000)}
async function api(path,options={}){
  const response=await fetch('/api/'+path,{...options,headers:{...(options.body&&!(options.body instanceof FormData)?{'Content-Type':'application/json'}:{}),...options.headers},cache:'no-store'});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Не удалось выполнить действие.');
  return data;
}
function menu(open){$('#sidebar').classList.toggle('open',open);$('#scrim').classList.toggle('visible',open);$('#menu-toggle').setAttribute('aria-expanded',String(open))}
$('#menu-toggle').onclick=()=>menu(!$('#sidebar').classList.contains('open'));
$('#scrim').onclick=()=>menu(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')menu(false)});
function setBusy(value){busy=value;document.querySelectorAll('[data-lock],#close-dialog').forEach(b=>b.disabled=value);root.setAttribute('aria-busy',String(value))}
function showDialog(title,html){formSnapshot=null;$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=html;dialog.showModal()}
function formDirty(){const form=$('#business-edit-form')||$('#post-edit-form');return formSnapshot!==null&&form&&JSON.stringify([...new FormData(form)])!==formSnapshot}
function closeDialog(){if(busy)return;if(formDirty()&&!confirm('Закрыть форму без сохранения изменений?'))return;formSnapshot=null;dialog.close()}
$('#close-dialog').onclick=closeDialog;
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog()});
$('#close-photo').onclick=()=>$('#photo-dialog').close();
$('#photo-dialog').addEventListener('click',e=>{if(e.target===$('#photo-dialog'))$('#photo-dialog').close()});
window.addEventListener('beforeunload',e=>{if(postDraft.trim()||formDirty()){e.preventDefault();e.returnValue=''}});

function ownerBar(){
  if(!state.canEdit)return '';
  const published=Boolean(state.business.published);
  return `<div class="business-owner-bar"><div>${icon(previewing?'user':'lock')}<span><strong>${previewing?'Вид страницы для посетителя':'Вы управляете этой страницей'}</strong><small>${published?'Страница опубликована в каталоге':'Черновик · виден только вам'}</small></span></div><div class="owner-actions">${previewing?'<button class="secondary" data-action="preview" data-lock>Вернуться к редактированию</button>':`<button class="text-button" data-action="preview" data-lock>Посмотреть как посетитель</button><button class="secondary" data-action="edit" data-lock>${icon('edit')}Редактировать страницу</button><button class="primary" data-action="publish" data-lock>${published?'Снять с публикации':'Опубликовать'}</button>`}</div></div>`;
}
function contacts(){
  const b=state.business,website=validWebsite(b.website);
  const items=[
    b.city||b.address?`<div class="business-contact">${icon('place')}<div><small>Где мы находимся</small><span>${esc([b.city,b.address].filter(Boolean).join(', '))}</span></div></div>`:'',
    b.hours?`<div class="business-contact">${icon('calendar')}<div><small>Часы работы</small><span>${esc(b.hours)}</span></div></div>`:'',
    b.phone?`<div class="business-contact">${icon('chat')}<div><small>Телефон</small><a href="tel:${esc(b.phone.replace(/[^+\d]/g,''))}">${esc(b.phone)}</a></div></div>`:'',
    b.email?`<div class="business-contact">${icon('note')}<div><small>Электронная почта</small><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></div></div>`:'',
    website?`<div class="business-contact">${icon('external')}<div><small>Внешний сайт</small><a href="${esc(website)}" target="_blank" rel="noopener noreferrer">${esc(new URL(website).hostname)} ↗</a></div></div>`:''
  ].filter(Boolean);
  return `<section class="business-panel contacts-panel"><div class="business-panel-heading"><h2>Контакты</h2>${canManage()?'<button class="text-button" data-action="edit" data-lock>Изменить</button>':''}</div>${items.length?items.join(''):`<p class="business-muted">${canManage()?'Добавьте телефон, адрес и часы работы — клиентам будет проще связаться с вами.':'Владелец пока не указал контакты.'}</p>`}<div class="business-joined">В Аркантериуме с ${new Date(b.created_at).toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}</div></section>`;
}
function gallery(){
  const photos=state.media.filter(m=>m.kind==='gallery');
  return `<section class="business-panel" id="business-photos"><div class="business-panel-heading"><h2>Фотографии <span>${photos.length}</span></h2>${canManage()?`<button class="text-button" data-upload="gallery" data-lock>${icon('plus')}Добавить фото</button>`:''}</div>${photos.length?`<div class="business-photo-grid">${photos.map((p,i)=>`<div class="business-photo-tile"><button class="photo-open" data-photo="${p.id}" aria-label="Открыть фотографию ${i+1}"><img src="${photoURL(p.id)}" alt="Фотография ${esc(state.business.title)} — ${i+1}" loading="lazy"></button>${canManage()?`<button class="photo-delete" data-delete-photo="${p.id}" aria-label="Удалить фотографию ${i+1}" title="Удалить фото" data-lock>${icon('close')}</button>`:''}</div>`).join('')}</div>`:`<div class="business-inline-empty">${icon('photo')}<p>${canManage()?'Покажите свои работы, товары или пространство.':'Фотографии появятся здесь, когда владелец их добавит.'}</p>${canManage()?'<button class="secondary" data-upload="gallery" data-lock>Загрузить первые фотографии</button>':''}</div>`}</section>`;
}
function posts(){
  return `<section id="business-posts"><div class="business-panel-heading posts-heading"><h2>Записи <span>${state.posts.length}</span></h2><span class="business-muted">Новости от владельца</span></div>${canManage()?`<form class="business-panel post-composer" id="post-form"><label for="post-body">Что нового в вашем бизнесе?</label><textarea id="post-body" name="body" required maxlength="5000" rows="4" placeholder="Расскажите о новинке, поделитесь историей или пригласите клиентов…">${esc(postDraft)}</textarea><div class="composer-footer"><small>${state.business.published?'Запись появится на вашей странице.':'Запись сохранится в черновике страницы.'}</small><button class="primary" type="submit" data-lock>${icon('plus')}Добавить запись</button></div><p class="form-error" id="post-error" role="alert"></p></form>`:''}<div class="business-post-list">${state.posts.length?state.posts.map(p=>`<article class="business-panel business-post"><div class="business-post-heading">${logo('post-avatar')}<div><strong>${esc(state.business.title)}</strong><time datetime="${new Date(p.created_at).toISOString()}">${readableDate(p.created_at)}${p.updated_at>p.created_at?' · изменено':''}</time></div>${canManage()?`<div class="post-tools"><button class="text-button" data-edit-post="${p.id}" title="Редактировать запись" aria-label="Редактировать запись от ${esc(readableDate(p.created_at))}" data-lock>${icon('edit')}</button><button class="text-button" data-delete-post="${p.id}" title="Удалить запись" aria-label="Удалить запись от ${esc(readableDate(p.created_at))}" data-lock>${icon('close')}</button></div>`:''}</div><p class="business-post-text">${esc(p.body)}</p></article>`).join(''):`<div class="business-panel business-inline-empty">${icon('note')}<p>${canManage()?'Здесь будет история вашего бизнеса. Начните с приветствия.':'У этого бизнеса пока нет записей.'}</p></div>`}</div></section>`;
}
function render(){
  const b=state.business,cover=mediaOf('cover'),logoImage=mediaOf('logo'),category=categories.find(c=>c.id===b.category);
  document.title=b.title+' — Аркантериум';
  $('#category-nav').innerHTML=categories.map(c=>`<a class="${c.id===b.category?'active':''}" href="/?category=${encodeURIComponent(c.id)}" title="${esc(c.description)}">${icon(c.icon)}${esc(c.name)}</a>`).join('');
  root.innerHTML=`${ownerBar()}<p class="business-upload-status" id="upload-status" role="status" hidden></p><section class="business-profile"><div class="business-cover ${cover?'has-photo':''}">${cover?`<img src="${photoURL(cover.id)}" alt="Обложка ${esc(b.title)}">`:'<div class="cover-orbit" aria-hidden="true"></div><span class="cover-wordmark" aria-hidden="true">СВОЁ ДЕЛО. СВОИ ЛЮДИ.</span>'}${canManage()?`<div class="cover-controls"><button class="secondary" data-upload="cover" data-lock>${icon('camera')}${cover?'Изменить обложку':'Добавить обложку'}</button>${cover?`<button class="secondary icon-button" data-delete-photo="${cover.id}" aria-label="Удалить обложку" title="Удалить обложку" data-lock>${icon('close')}</button>`:''}</div>`:''}</div><div class="business-identity"><div class="business-avatar-wrap">${logo()}${canManage()?`<button class="avatar-edit" data-upload="logo" title="Изменить логотип" aria-label="Изменить логотип" data-lock>${icon('camera')}</button>`:''}</div><div class="business-title-row"><div><span class="business-section-label">${icon(category?.icon||'shop')}${esc(category?.name||'Бизнес сообщества')}</span><h1>${esc(b.title)}</h1><p class="business-description">${esc(b.description)}</p></div><button class="secondary share-business" data-action="share">${icon('link')}Скопировать ссылку</button></div>${canManage()&&logoImage?`<button class="text-button remove-logo" data-delete-photo="${logoImage.id}" data-lock>Убрать логотип</button>`:''}<nav class="business-tabs" aria-label="На странице бизнеса"><a href="#business-about">О бизнесе</a><a href="#business-photos">Фотографии</a><a href="#business-posts">Записи</a></nav></div></section><div class="business-page-layout"><aside>${contacts()}${canManage()?`<div class="business-owner-tip">${icon('star')}<p>Это ваша страница.<br>Оформите её так, чтобы клиентам захотелось познакомиться с вашим делом.</p><a href="/account.html#businesses">Все мои бизнесы ${icon('arrow')}</a></div>`:''}</aside><div class="business-page-feed"><section class="business-panel" id="business-about"><div class="business-panel-heading"><h2>О бизнесе</h2>${canManage()?'<button class="text-button" data-action="edit" data-lock>Редактировать</button>':''}</div><p class="business-about-text">${esc(b.about||b.description)}</p></section>${gallery()}${posts()}</div></div><footer class="footer"><span>© ${new Date().getFullYear()} Аркантериум</span><span>Люди. Идеи. Своё дело.</span></footer>`;
  root.setAttribute('aria-busy','false');
}
async function refresh(){state=await api(endpoint);render()}
function errorPage(error){root.setAttribute('aria-busy','false');root.innerHTML=`<div class="business-loading"><span class="tag">АРКАНТЕРИУМ · БИЗНЕС</span><h1>Не удалось открыть страницу</h1><p>${esc(error.message)}</p><button class="primary" data-action="retry">Попробовать ещё раз</button><a class="secondary" href="/account.html#businesses">Личный кабинет</a></div>`}
async function load(){try{const data=await Promise.all([api(endpoint),api('categories')]);state=data[0];categories=data[1].categories;render()}catch(error){errorPage(error)}}

async function editPage(){
  if(!canManage())return;
  try{categories=(await api('categories')).categories}catch(error){toast(error.message);return}
  const b=state.business;
  const field=(name,label,max,placeholder='',type='text')=>`<div><label for="edit-${name}">${label}</label><input id="edit-${name}" name="${name}" type="${type}" maxlength="${max}" value="${esc(b[name])}" placeholder="${esc(placeholder)}"></div>`;
  showDialog('Оформление страницы',`<form id="business-edit-form"><div class="form-grid"><div class="wide"><label for="edit-title">Название бизнеса</label><input id="edit-title" name="title" required minlength="2" maxlength="100" value="${esc(b.title)}"></div><div><label for="edit-category">Раздел каталога</label><select id="edit-category" name="category" required>${categories.map(c=>`<option value="${esc(c.id)}" ${c.id===b.category?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>${field('city','Город',100,'Например, Казань')}<div class="wide"><label for="edit-description">Короткое описание для карточки</label><textarea id="edit-description" name="description" required minlength="10" maxlength="1500" rows="3">${esc(b.description)}</textarea></div><div class="wide"><label for="edit-about">Подробнее о бизнесе</label><textarea id="edit-about" name="about" maxlength="10000" rows="6" placeholder="Ваша история, услуги, преимущества и то, что делает ваш бизнес особенным">${esc(b.about)}</textarea></div>${field('phone','Телефон',40,'+7 (999) 000-00-00','tel')}${field('email','Электронная почта',200,'hello@example.com','email')}${field('address','Адрес',250,'Улица, дом, офис')}${field('hours','Часы работы',250,'Пн–Пт, 10:00–19:00')}<div class="wide"><label for="edit-website">Внешний сайт (необязательно)</label><input id="edit-website" name="website" maxlength="500" inputmode="url" value="${esc(b.website)}" placeholder="https://example.com"></div></div><p class="form-hint">Обложку, логотип и фотографии можно загрузить прямо на странице. ${b.published?'Сохранённые изменения сразу увидят посетители.':'До публикации страницу видите только вы.'}</p><p class="form-error" id="edit-error" role="alert"></p><div class="form-actions"><button class="primary" type="submit" data-lock>Сохранить страницу</button><button class="secondary" type="button" data-action="cancel-dialog" data-lock>Отмена</button></div></form>`);
  formSnapshot=JSON.stringify([...new FormData($('#business-edit-form'))]);
  $('#edit-title').focus();
}
async function savePage(form){
  setBusy(true);$('#edit-error').textContent='';
  try{
    await api(endpoint+'/page',{method:'PUT',body:JSON.stringify(Object.fromEntries(new FormData(form)))});
    formSnapshot=null;dialog.close();await refresh();toast('Страница сохранена');
  }catch(error){if(dialog.open)$('#edit-error').textContent=error.message;else toast('Изменения сохранены, но страницу не удалось обновить. Перезагрузите её.')}
  finally{setBusy(false)}
}
async function publish(){
  setBusy(true);
  try{const published=!state.business.published;await api(endpoint,{method:'PUT',body:JSON.stringify({...state.business,published})});await refresh();toast(published?'Бизнес опубликован в каталоге':'Страница переведена в черновик. Её видите только вы.')}
  catch(error){toast(error.message)}finally{setBusy(false)}
}
function chooseUpload(kind){
  if(!canManage()||busy)return;
  uploadKind=kind;const input=$('#business-photo-input');input.multiple=kind==='gallery';input.value='';input.click();
}
$('#business-photo-input').onchange=async e=>{
  const files=[...e.target.files];if(!files.length||busy||!canManage())return;
  const capacity=40-state.media.filter(m=>m.kind==='gallery').length;
  if(uploadKind==='gallery'&&files.length>capacity){toast('В галерее осталось мест: '+capacity+'. Выберите меньше фотографий.');return}
  if(files.some(f=>f.size>8*1024*1024)){toast('Каждая фотография должна быть не больше 8 МБ.');return}
  const kind=uploadKind;setBusy(true);let completed=0,errorMessage='';
  try{
    for(const file of files){
      const status=$('#upload-status');status.hidden=false;status.textContent=`Загружаем фотографию ${completed+1} из ${files.length}…`;
      const form=new FormData();form.set('kind',kind);form.set('file',file);
      await api(endpoint+'/media',{method:'POST',body:form});completed++;
    }
  }catch(error){errorMessage=error.message}
  finally{
    try{await refresh()}catch{errorMessage+=' Не удалось обновить страницу — перезагрузите её.'}
    setBusy(false);const status=$('#upload-status');if(status)status.hidden=true;
    toast(errorMessage?`Загружено: ${completed}. ${errorMessage}`:kind==='cover'?'Обложка сохранена':kind==='logo'?'Логотип сохранён':'Фотографии сохранены: '+completed);
  }
};
async function deletePhoto(photoId){
  if(!state.media.some(m=>m.id===photoId)||!confirm('Удалить эту фотографию со страницы бизнеса?'))return;
  setBusy(true);try{await api(endpoint+'/media/'+encodeURIComponent(photoId),{method:'DELETE'});await refresh();toast('Фотография удалена')}catch(error){toast(error.message)}finally{setBusy(false)}
}
function editPost(postId){
  const post=state.posts.find(p=>p.id===postId);if(!post)return;
  showDialog('Редактировать запись',`<form id="post-edit-form" data-post-id="${post.id}"><label for="edit-post-body">Текст записи</label><textarea id="edit-post-body" name="body" required maxlength="5000" rows="8">${esc(post.body)}</textarea><p class="form-error" id="edit-error" role="alert"></p><div class="form-actions"><button class="primary" data-lock>Сохранить запись</button><button class="secondary" type="button" data-action="cancel-dialog" data-lock>Отмена</button></div></form>`);
  formSnapshot=JSON.stringify([...new FormData($('#post-edit-form'))]);
}
async function savePost(form,isEdit){
  setBusy(true);const errorNode=$(isEdit?'#edit-error':'#post-error');errorNode.textContent='';
  try{
    await api(endpoint+'/posts'+(isEdit?'/'+encodeURIComponent(form.dataset.postId):''),{method:isEdit?'PUT':'POST',body:JSON.stringify(Object.fromEntries(new FormData(form)))});
    if(isEdit){formSnapshot=null;dialog.close()}else postDraft='';
    await refresh();toast(isEdit?'Запись обновлена':'Запись добавлена');
  }catch(error){errorNode.textContent=error.message;toast(error.message)}finally{setBusy(false)}
}
async function deletePost(postId){
  if(!state.posts.some(p=>p.id===postId)||!confirm('Удалить эту запись? Это действие нельзя отменить.'))return;
  setBusy(true);try{await api(endpoint+'/posts/'+encodeURIComponent(postId),{method:'DELETE'});await refresh();toast('Запись удалена')}catch(error){toast(error.message)}finally{setBusy(false)}
}
async function share(){
  const url=location.origin+'/business/'+encodeURIComponent(id);
  try{await navigator.clipboard.writeText(url);toast(state.business.published?'Ссылка скопирована':'Ссылка скопирована. Пока страницу видите только вы.')}
  catch{showDialog('Ссылка на страницу',`<label for="page-url">Скопируйте ссылку</label><input id="page-url" readonly value="${esc(url)}">`);$('#page-url').select()}
}
document.addEventListener('input',e=>{if(e.target.id==='post-body')postDraft=e.target.value});
document.addEventListener('submit',e=>{
  if(!['business-edit-form','post-form','post-edit-form'].includes(e.target.id))return;
  e.preventDefault();if(busy||!canManage())return;
  if(e.target.id==='business-edit-form')savePage(e.target);else savePost(e.target,e.target.id==='post-edit-form');
});
document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.action==='retry'){load();return}
  if(!state)return;
  if(button.dataset.action==='share'){share();return}
  if(button.dataset.photo){$('#full-photo').src=photoURL(button.dataset.photo);$('#photo-dialog').showModal();return}
  if(busy)return;
  if(button.dataset.action==='preview'&&state.canEdit){if(postDraft.trim()&&!confirm('Перейти к просмотру? Текст новой записи останется в редакторе.'))return;previewing=!previewing;render();return}
  if(!canManage())return;
  if(button.dataset.action==='edit')editPage();
  if(button.dataset.action==='publish')publish();
  if(button.dataset.action==='cancel-dialog')closeDialog();
  if(button.dataset.upload)chooseUpload(button.dataset.upload);
  if(button.dataset.deletePhoto)deletePhoto(button.dataset.deletePhoto);
  if(button.dataset.editPost)editPost(button.dataset.editPost);
  if(button.dataset.deletePost)deletePost(button.dataset.deletePost);
});
api('me').then(({user})=>{if(!user){$('#account-link').href='/signin-with-chatgpt?return_to=%2Faccount.html';$('#account-link').target='_top'}}).catch(()=>{});
load();
