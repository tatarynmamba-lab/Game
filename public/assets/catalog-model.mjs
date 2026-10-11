export const defaultCategories=[{id:'design',name:'Дизайн и маркетинг',icon:'star',color:'violet',description:'Бренды, сайты и продвижение'},{id:'beauty',name:'Красота и здоровье',icon:'heart',color:'pink',description:'Забота о себе и своём здоровье'},{id:'retail',name:'Магазины и товары',icon:'shop',color:'amber',description:'Вещи, которые хочется найти'},{id:'education',name:'Обучение',icon:'book',color:'blue',description:'Новые знания и возможности'},{id:'food',name:'Еда и заведения',icon:'coffee',color:'orange',description:'Кофейни, рестораны и доставка'},{id:'services',name:'Услуги и ремонт',icon:'tools',color:'green',description:'Помощь с повседневными задачами'},{id:'it',name:'IT и технологии',icon:'code',color:'cyan',description:'Цифровые продукты и решения'},{id:'other',name:'Другие бизнесы',icon:'grid',color:'gray',description:'Откройте что-нибудь новое'}];
export function validWebsite(value){const raw=String(value??'').trim();if(!raw)return '';try{if(/^[a-z][a-z\d+.-]*:/i.test(raw)&&!/^https?:\/\//i.test(raw))return '';const url=new URL(/^https?:\/\//i.test(raw)?raw:'https://'+raw);if(!['http:','https:'].includes(url.protocol)||url.username||url.password||!url.hostname.includes('.')||url.hostname==='localhost')return '';return url.href}catch{return ''}}
export function normalizeBusiness(data,availableCategories=defaultCategories){const trim=(key,max)=>String(data[key]??'').trim().slice(0,max);const title=trim('title',100),description=trim('description',1500),city=trim('city',100),category=trim('category',80),website=validWebsite(data.website);if(title.length<2)throw new Error('Название должно содержать хотя бы 2 символа.');if(!availableCategories.some(c=>c.id===category))throw new Error('Выберите существующий раздел каталога.');if(description.length<10)throw new Error('Добавьте описание: хотя бы 10 символов.');if(String(data.website??'').trim()&&!website)throw new Error('Укажите корректный адрес сайта или оставьте поле пустым.');return {title,description,city,category,website,published:data.published===true?1:0}}
export function filterBusinesses(items,{query='',category='',city=''}={},availableCategories=defaultCategories){const q=query.trim().toLocaleLowerCase('ru');return items.filter(b=>(!category||b.category===category)&&(!city||b.city===city)&&(!q||[b.title,b.description,b.city,availableCategories.find(c=>c.id===b.category)?.name].join(' ').toLocaleLowerCase('ru').includes(q)))}

export const sectionIconOptions=[['star','Звезда'],['heart','Сердце'],['shop','Магазин'],['book','Обучение'],['coffee','Кофе'],['tools','Инструменты'],['code','Технологии'],['grid','Сетка'],['home','Дом'],['user','Человек'],['chat','Общение'],['calendar','Календарь'],['camera','Камера'],['photo','Фото'],['place','Место'],['link','Связи']].map(([id,label])=>({id,label}));
export const sectionIcons=sectionIconOptions.map(i=>i.id);
export const sectionColors=['violet','pink','amber','blue','orange','green','cyan','gray'];
export function normalizeSections(input){
 if(!Array.isArray(input)||input.length<1||input.length>40)throw new Error('В каталоге должно быть от 1 до 40 разделов.');
 const ids=new Set(),names=new Set();
 return input.map((item,index)=>{
  if(!item||typeof item!=='object')throw new Error('Не удалось прочитать раздел.');
  const id=String(item.id||''),name=String(item.name||'').trim().replace(/\s+/g,' '),description=String(item.description||'').trim();
  if(!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(id)||ids.has(id))throw new Error('Некорректный или повторяющийся раздел.');
  if(name.length<2||name.length>60)throw new Error('Название раздела должно содержать от 2 до 60 символов.');
  if(description.length<3||description.length>200)throw new Error('Описание раздела должно содержать от 3 до 200 символов.');
  const key=name.normalize('NFKC').toLocaleLowerCase('ru');if(names.has(key))throw new Error('Раздел с названием «'+name+'» уже есть.');
  ids.add(id);names.add(key);
  return {id,name,description,icon:sectionIcons.includes(item.icon)?item.icon:'grid',color:sectionColors.includes(item.color)?item.color:sectionColors[index%sectionColors.length]};
 });
}
