export const MAX_PHOTOS = 6;
export const makeId = () => crypto.randomUUID();
export function createPage(seed={}) {
  const text=(key,max)=>typeof seed[key]==='string'?seed[key].slice(0,max):'';
  return {version:1,revision:0,profile:{name:text('name',60),business:text('business',100),about:text('about',1000),status:'',city:'',website:''},avatar:null,cover:null,photos:[],posts:[]};
}
function value(v,max){return String(v??'').trim().slice(0,max)}
export function safeWebsite(raw) {
  if(!raw)return '';
  const s=String(raw).trim();
  if(!s)return '';
  try{const u=new URL(/^https?:\/\//i.test(s)?s:'https://'+s);return ['http:','https:'].includes(u.protocol)&&u.hostname.includes('.')&&!u.username&&!u.password?u.href:''}catch{return ''}
}
export function transition(current,action) {
  const page=structuredClone(current);
  const post=()=>{const found=page.posts.find(p=>p.id===action.id);if(!found)throw new Error('Запись уже удалена.');return found};
  switch(action.type) {
    case 'profile': {
      const data=action.data;
      if(!value(data.name,60))throw new Error('Укажите ваше имя.');
      if(data.website.trim()&&!safeWebsite(data.website))throw new Error('Введите адрес сайта, например https://example.com.');
      page.profile={...page.profile,name:value(data.name,60),business:value(data.business,100),about:value(data.about,1000),status:value(data.status,140),city:value(data.city,80),website:safeWebsite(data.website)};break;
    }
    case 'photos': {
      for(const item of action.photos)if(!page.photos.some(p=>p.id===item.id))page.photos.push({id:item.id,name:value(item.name,150),createdAt:item.createdAt});
      if(action.slot){if(!['avatar','cover'].includes(action.slot)||!action.photos[0])throw new Error('Не удалось выбрать фотографию.');page[action.slot]=action.photos[0].id}break;
    }
    case 'post': {
      const text=value(action.text,5000),photoIds=action.photoIds||[];
      if(!text&&!photoIds.length)throw new Error('Добавьте текст или фотографию.');
      if(photoIds.length>MAX_PHOTOS)throw new Error('К записи можно прикрепить не больше 6 фото.');
      if(photoIds.some(id=>!page.photos.some(p=>p.id===id)))throw new Error('Не найдена фотография для записи.');
      if(page.posts.some(p=>p.id===action.id))throw new Error('Запись уже опубликована.');
      page.posts.unshift({id:action.id,text,photoIds,createdAt:action.now,updatedAt:null,liked:false,pinned:false,comments:[]});break;
    }
    case 'editPost': {
      const item=post(),text=value(action.text,5000);if(!text&&!item.photoIds.length)throw new Error('Запись не может быть пустой.');item.text=text;item.updatedAt=action.now;break;
    }
    case 'deletePost': page.posts=page.posts.filter(p=>p.id!==action.id);break;
    case 'like': {const item=post();item.liked=!item.liked;break;}
    case 'pin': {const item=post(),next=!item.pinned;page.posts.forEach(p=>p.pinned=false);item.pinned=next;break;}
    case 'comment': {const text=value(action.text,1000);if(!text)throw new Error('Напишите комментарий.');post().comments.push({id:action.commentId,text,createdAt:action.now});break;}
    case 'deleteComment': {const item=post();item.comments=item.comments.filter(c=>c.id!==action.commentId);break;}
    case 'deletePhoto': {
      page.photos=page.photos.filter(p=>p.id!==action.id);
      if(page.avatar===action.id)page.avatar=null;if(page.cover===action.id)page.cover=null;
      page.posts.forEach(p=>p.photoIds=p.photoIds.filter(id=>id!==action.id));page.posts=page.posts.filter(p=>p.text||p.photoIds.length);break;
    }
    default:throw new Error('Неизвестное действие.');
  }
  page.revision++;
  return page;
}
export function sortedPosts(page){return [...page.posts].sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.createdAt-a.createdAt)}
