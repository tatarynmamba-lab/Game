'use strict';
window.GameEngine = (() => {
  const KEY = 'witcher-hunters-path-fan-v2';
  const { zones, loot } = window.GameData;
  const integer = (v, min = 0, max = 100000000) => Number.isSafeInteger(v) && v >= min && v <= max;
  const text = v => typeof v === 'string' && v.length > 0 && v.length < 1500;
  const item = (v, type) => v && ['weapon', 'armor'].includes(v.type) && (!type || v.type === type) && text(v.name) && integer(v.bonus);
  function valid(s) {
    if (!s || typeof s !== 'object') return false;
    for (const k of ['xp','attack','defense','gold','potions','kills','contractsCompleted']) if (!integer(s[k])) return false;
    if (!integer(s.level,1,100000) || !integer(s.maxHp,1) || !integer(s.hp,1,s.maxHp) || !integer(s.maxEnergy,1,1000) || !integer(s.energy,0,s.maxEnergy)) return false;
    if (!integer(s.zone,0,zones.length-1) || s.level < zones[s.zone].min || typeof s.shield !== 'boolean') return false;
    if (!s.equipment || !item(s.equipment.weapon,'weapon') || !item(s.equipment.armor,'armor')) return false;
    if (!Array.isArray(s.bag) || s.bag.length > 5000 || !s.bag.every(v=>item(v))) return false;
    if (!Array.isArray(s.log) || s.log.length > 18 || !s.log.every(text)) return false;
    if (s.enemy !== null) {
      const e = s.enemy;
      if (!e || !text(e.name) || !text(e.icon) || !text(e.weak) || !integer(e.maxHp,1) || !integer(e.hp,1,e.maxHp) || !integer(e.attack,1) || !integer(e.gold) || !integer(e.xp)) return false;
      if (!zones[s.zone].enemies.some(t=>t.name===e.name)) return false;
    }
    if (s.contract !== null) {
      const c = s.contract;
      if (!c || !integer(c.zone,0,zones.length-1) || !zones[c.zone].enemies.some(e=>e.name===c.target) || !integer(c.gold) || !integer(c.xp)) return false;
    }
    return true;
  }
  function create({storage, random = Math.random} = {}) {
    let storageAvailable = true;
    if (storage === undefined) {
      try { storage = window.localStorage; } catch { storage = null; storageAvailable = false; }
    }
    const rnd = (a,b) => Math.floor(random()*(b-a+1))+a;
const fresh = () => ({level:1,xp:0,maxHp:35,hp:35,energy:3,maxEnergy:3,attack:5,defense:0,gold:18,potions:2,kills:0,contractsCompleted:0,zone:0,enemy:null,shield:false,contract:null,
  equipment:{weapon:{name:'Потёртый серебряный меч',type:'weapon',bonus:2},armor:{name:'Куртка Школы Волка',type:'armor',bonus:1}},bag:[],log:['🐺 Медальон дрогнул. Ты прибыл в Белый Сад. На доске объявлений ищут ведьмака.']});

    let game = fresh();
    try {
      const raw = storage ? storage.getItem(KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (valid(parsed)) game = parsed;
        else game.log.unshift('Повреждённое сохранение: начата новая история.');
      }
    } catch { game.log.unshift('Сохранение не удалось прочитать: начата новая история.'); }
    const listeners = [];
    const xpNeed = () => 16 + (game.level-1)*11;
    const strength = () => game.attack + game.equipment.weapon.bonus;
    const armor = () => game.defense + game.equipment.armor.bonus;
    const note = str => { game.log.unshift(str); game.log = game.log.slice(0,18); };
    function commit() {
      try {
        if (!storage) throw new Error('Storage unavailable');
        storage.setItem(KEY,JSON.stringify(game));
        storageAvailable = true;
      } catch { storageAvailable = false; }
      listeners.forEach(fn=>fn());
    }
function levelUp(){
  while(game.xp >= xpNeed()){
    const need=xpNeed();game.xp-=need;game.level++;game.maxHp+=8;game.attack+=2;game.hp=game.maxHp;game.energy=game.maxEnergy;
    note(`⭐ Новый уровень ${game.level}! Атака +2, здоровье +8. Силы восстановлены.`);
  }
}
function win(){
  const e=game.enemy;game.gold+=e.gold;game.xp+=e.xp;game.kills++;
  note(`🏆 ${e.name} повержен. +${e.xp} опыта, +${e.gold} крон.`);
  if(game.contract&&game.contract.zone===game.zone&&game.contract.target===e.name){
    game.gold+=game.contract.gold;game.xp+=game.contract.xp;game.contractsCompleted++;
    note(`📜 Контракт выполнен! Получено ${game.contract.gold} крон и ${game.contract.xp} опыта.`);game.contract=null;
  }
  if(random()<.42){
    const candidates=loot.filter(it=>it.min<=game.level&&(it.type==='weapon'?it.bonus>=game.equipment.weapon.bonus:it.bonus>=game.equipment.armor.bonus));
    if(candidates.length){const it={...candidates[rnd(0,candidates.length-1)]};delete it.min;game.bag.push(it);note(`🎁 Добыча: «${it.name}» (+${it.bonus})!`);}
  }
  game.enemy=null;game.shield=false;levelUp();
}
function enemyTurn(){
  if(!game.enemy)return;
  const e=game.enemy;
  if(game.shield){game.shield=false;note(`🛡️ Квен поглотил удар чудовища «${e.name}»!`);return;}
  const dmg=Math.max(1,rnd(e.attack-2,e.attack+2)-armor());game.hp=Math.max(0,game.hp-dmg);
  note(`💢 ${e.name} наносит ${dmg} урона.`);
  if(game.hp===0){
    const lost=Math.min(game.gold,6);game.gold-=lost;game.hp=Math.max(1,Math.floor(game.maxHp*.6));game.energy=game.maxEnergy;game.enemy=null;game.shield=false;
    note(`☠️ Ведьмак был побеждён. Потеряно ${lost} крон. Очнувшись в таверне, ты снова готов к охоте.`);
  }
}
function startFight(template){
  game.enemy={...template,maxHp:template.hp};game.shield=false;note(`🐺 Медальон дрожит: впереди ${template.name}!`);
}
function action(name){
  if(name==='explore'){
    if(game.enemy)return;const z=zones[game.zone];startFight(z.enemies[rnd(0,z.enemies.length-1)]);
  } else if(name==='hit'||name==='power'||name==='igni'||name==='quen'){
    if(!game.enemy)return;
    if(name==='hit'){
      const dmg=Math.max(1,rnd(strength()-2,strength()+2));game.enemy.hp=Math.max(0,game.enemy.hp-dmg);game.energy=Math.min(game.maxEnergy,game.energy+1);
      note(`⚔️ Быстрый удар: ${dmg} урона, +1 энергия знаков.`);
    } else if(name==='power'){
      if(random()<.27)note('💨 Чудовище увернулось от сильного удара!');
      else{const dmg=Math.max(1,rnd(strength()+1,strength()+6));game.enemy.hp=Math.max(0,game.enemy.hp-dmg);note(`💥 Сильный удар: ${dmg} урона.`);}
    } else if(name==='igni'){
      if(game.energy<2)return;game.energy-=2;const dmg=rnd(5+game.level,8+game.level)+(game.enemy.weak==='Игни'?5:0);game.enemy.hp=Math.max(0,game.enemy.hp-dmg);
      note(`🔥 Игни обжигает врага: ${dmg} урона${game.enemy.weak==='Игни'?' (слабость чудовища!)':''}.`);
    } else if(name==='quen'){
      if(game.energy<2||game.shield)return;game.energy-=2;game.shield=true;note('🛡️ Ты накладываешь знак Квен. Следующий удар врага будет поглощён.');
    }
    if(game.enemy.hp===0)win();else enemyTurn();
  } else if(name==='potion'){
    if(game.potions<1||game.hp>=game.maxHp)return;
    game.potions--;const heal=Math.min(20+game.level*2,game.maxHp-game.hp);game.hp+=heal;note(`🧪 «Ласточка» восстановила ${heal} здоровья.`);
    if(game.enemy)enemyTurn();
  } else if(name==='flee'){
    if(!game.enemy)return;
    if(random()<.8){note(`🏃 Ты отступил от чудовища «${game.enemy.name}».`);game.enemy=null;game.shield=false;}
    else{note('🚫 Не удалось отступить!');enemyTurn();}
  } else if(name==='rest'){
    if(game.enemy){note('Сначала закончи сражение.');return commit();}
    if(game.hp===game.maxHp&&game.energy===game.maxEnergy){note('Ты уже полностью отдохнул.');return commit();}
    if(game.gold<5){note('Нужно 5 крон для отдыха.');return commit();}
    game.gold-=5;game.hp=game.maxHp;game.energy=game.maxEnergy;game.shield=false;note('🔥 Сон у очага восстановил здоровье и энергию знаков.');
  } else if(name==='buy'){
    if(game.enemy){note('В схватке торговцы не помогают.');return commit();}
    if(game.gold<10){note('Для покупки «Ласточки» нужно 10 крон.');return commit();}
    game.gold-=10;game.potions++;note('🧪 Куплена «Ласточка».');
  } else if(name==='accept'){
    if(game.enemy||game.contract)return;const z=zones[game.zone],template=z.enemies[rnd(0,z.enemies.length-1)];
    game.contract={zone:game.zone,target:template.name,gold:12+game.zone*10,xp:7+game.zone*5};
    note(`📜 Новый контракт: уничтожить чудовище «${template.name}» в локации ${z.name}.`);
  } else if(name==='track'){
    if(game.enemy||!game.contract||game.contract.zone!==game.zone)return;
    const template=zones[game.zone].enemies.find(e=>e.name===game.contract.target);
    if(template)startFight(template);
  } else if(name==='abandon'){
    if(game.enemy||!game.contract)return;note(`📜 Контракт на «${game.contract.target}» отменён.`);game.contract=null;
  }
  commit();
}

    function chooseZone(idx) {
      if (game.enemy || !zones[idx] || game.level < zones[idx].min) return;
      game.zone=idx;note(`🗺️ Ты прибыл в ${zones[idx].name}.`);commit();
    }
    function equip(idx) {
      if (game.enemy) { note('В бою нельзя менять снаряжение.');commit();return; }
      const found = game.bag[idx]; if(!found) return;
      game.bag.splice(idx,1);game.bag.push(game.equipment[found.type]);game.equipment[found.type]=found;
      note(`✨ Снаряжено: «${found.name}».`);commit();
    }
    function importSave(raw) {
      const parsed = JSON.parse(raw);
      const candidate = parsed && parsed.format === 'hunters-path-save' ? parsed.state : parsed;
      if (parsed && parsed.format === 'hunters-path-save' && parsed.version !== 1) throw new Error('Неподдерживаемая версия сохранения.');
      if (!valid(candidate)) throw new Error('Файл не содержит корректного сохранения игры.');
      game = JSON.parse(JSON.stringify(candidate));
      note('📖 Сохранение загружено. История продолжается.');commit();
    }
    function reload() {
      try {
        const candidate = JSON.parse(storage.getItem(KEY));
        if (valid(candidate)) { game=candidate;listeners.forEach(fn=>fn()); }
      } catch {}
    }
    commit();
    return {
      get state() { return game; },
      get storageAvailable() { return storageAvailable; },
      action, chooseZone, equip, reload, xpNeed, strength, armor,
      reset() { game=fresh();commit(); },
      subscribe(fn) { listeners.push(fn); },
      exportSave() { return JSON.stringify({format:'hunters-path-save',version:1,state:game},null,2); },
      importSave
    };
  }
  return {create, valid, KEY};
})();
