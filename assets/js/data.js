'use strict';
window.GameData = (() => {
const zones = [
  {name:'Белый Сад', icon:'🌳', min:1, description:'На заброшенных дорогах и у речных берегов бродят падальщики и утопцы.', enemies:[
    {name:'Утопец',icon:'🧟',hp:15,attack:4,xp:9,gold:6,weak:'Игни'},
    {name:'Гуль',icon:'💀',hp:18,attack:5,xp:11,gold:7,weak:'Игни'}]},
  {name:'Велен', icon:'🌫️', min:2, description:'Топи, сгнившие деревни и мрачные рощи хранят старые проклятия.', enemies:[
    {name:'Полуденница',icon:'👻',hp:25,attack:7,xp:15,gold:9,weak:'Игни'},
    {name:'Туманник',icon:'🌫️',hp:28,attack:7,xp:17,gold:10,weak:'Игни'}]},
  {name:'Окраины Новиграда', icon:'🌙', min:4, description:'Под городскими стенами ночами пропадают путники. Ведьмачьей работы хватает.', enemies:[
    {name:'Накер',icon:'👹',hp:38,attack:9,xp:24,gold:14,weak:'Игни'},
    {name:'Водяная баба',icon:'🧟',hp:42,attack:10,xp:27,gold:16,weak:'Игни'}]},
  {name:'Скеллиге', icon:'⛰️', min:6, description:'Холодные острова, штормовые скалы и чудовища, скрытые в туманах.', enemies:[
    {name:'Сирена',icon:'🦅',hp:52,attack:12,xp:34,gold:20,weak:'Игни'},
    {name:'Ледяной тролль',icon:'🗿',hp:65,attack:14,xp:42,gold:25,weak:'Игни'}]}
];
const loot = [
  {name:'Улучшенный серебряный меч',type:'weapon',bonus:4,min:1},
  {name:'Серебряный меч Школы Грифона',type:'weapon',bonus:7,min:3},
  {name:'Мастерский серебряный меч',type:'weapon',bonus:10,min:5},
  {name:'Кожаный доспех ведьмака',type:'armor',bonus:3,min:1},
  {name:'Доспех Школы Кота',type:'armor',bonus:5,min:3},
  {name:'Тяжёлый доспех Школы Медведя',type:'armor',bonus:8,min:5}
];

return {zones, loot};
})();
