(function(){
 'use strict';
 const key='airis-member-desk-v2';
 let memory={read:[],saved:[],notes:[]},useMemory=false;
 function readMember(){
  if(useMemory)return memory;
  try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(stored&&typeof stored==='object'&&!Array.isArray(stored))memory={...stored,read:Array.isArray(stored.read)?stored.read:[],saved:Array.isArray(stored.saved)?stored.saved.filter(id=>typeof id==='string'):[],notes:Array.isArray(stored.notes)?stored.notes:[]}}
  catch{}return memory;
 }
 function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el}
 function link(text,href,className=''){const el=element('a',className,text);el.href=href;return el}
 function estimateMinutes(item){
  const text=[item.body,...(item.chapters||[]).map(ch=>`${ch.title||''} ${ch.description||''}`)].join(' ');
  const chinese=(text.match(/[\u3400-\u9fff]/g)||[]).length;
  const words=(text.replace(/[\u3400-\u9fff]/g,' ').match(/[\p{L}\p{N}]+/gu)||[]).length;
  return Math.max(1,Math.ceil(chinese/300+words/200));
 }
 function progress(host){
  const body=host.querySelector('[data-reading-text]');if(!body||!body.textContent.trim())return;
  const track=element('div','reading-progress');track.setAttribute('role','progressbar');track.setAttribute('aria-label','正文阅读位置');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.append(element('span'));document.body.append(track);
  let frame=0;
  const update=()=>{frame=0;const rect=body.getBoundingClientRect(),top=rect.top+window.scrollY,bottom=rect.bottom+window.scrollY;const start=Math.max(0,top-window.innerHeight*.25),end=Math.max(start+1,bottom-window.innerHeight*.8);const value=Math.round(Math.max(0,Math.min(1,(window.scrollY-start)/(end-start)))*100);track.firstElementChild.style.transform=`scaleX(${value/100})`;track.setAttribute('aria-valuenow',String(value))};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
  if(typeof ResizeObserver==='function')new ResizeObserver(schedule).observe(body);
  update();
 }
 function bookmark(item,section){
  const wrap=element('div','reading-keep');const copy=element('div');
  copy.append(element('h2','',item.type==='course'?'先收藏，按自己的节奏学。':'这篇先收藏，慢慢看。'),element('p','','有用的方法不必一次记住。留在“我的收藏”里，下次再接着看。'));
  const controls=element('div','reading-keep-actions'),button=element('button','reading-save'),savedLink=link('去我的收藏','lab.html#saved','reading-saved-link');button.type='button';
  const status=element('p','reading-save-status','收藏仅保存在当前浏览器。');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const paint=()=>{const saved=readMember().saved.includes(item.id);button.textContent=saved?'已收藏 · 取消收藏':'收藏这篇';button.setAttribute('aria-pressed',String(saved))};
  button.addEventListener('click',()=>{const state=readMember(),saved=state.saved.includes(item.id);memory={...state,saved:saved?state.saved.filter(id=>id!==item.id):[...state.saved,item.id]};let persisted=true;try{localStorage.setItem(key,JSON.stringify(memory))}catch{persisted=false;useMemory=true}button.textContent=saved?'收藏这篇':'已收藏 · 取消收藏';button.setAttribute('aria-pressed',String(!saved));status.textContent=persisted?(saved?'已取消收藏。':'已放进“我的收藏”，下次可以继续读。'):'浏览器暂不允许保存；本次更改只留在当前页面，刷新后可能丢失。'});
  window.addEventListener('storage',event=>{if(event.key===key){if(event.newValue===null)memory={read:[],saved:[],notes:[]};paint()}});
  controls.append(button,savedLink,status);wrap.append(copy,controls);section.append(wrap);paint();
 }
 async function related(item,container){
  const heading=element('h2','','接下来，也许你想读'),list=element('div','reading-related-list'),message=element('p','reading-related-state','正在找可以接着读的内容…');message.setAttribute('role','status');
  container.append(heading,message,list);
  async function load(){
   message.textContent='正在找可以接着读的内容…';list.replaceChildren();
   if(location.protocol==='file:'){message.textContent='打开网站服务后，可以继续浏览最新发布的文章。';list.append(link('去行业情报看看','intelligence.html'));return}
   try{
    const params=new URLSearchParams({type:'article',page_size:'8'});if(item.channel)params.set('channel',item.channel);
    const urls=['/api/public/content?'+params];if(item.channel)urls.push('/api/public/content?type=article&page_size=8');
    const responses=await Promise.all(urls.map(async url=>{const r=await window.AIRIS_CONTENT.fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);const data=await r.json();if(!Array.isArray(data.items))throw new Error('Invalid content response');return data.items}));
    const seen=new Set([item.id]),now=Date.now();
    const items=responses.flat().filter(row=>{if(!row||row.type!=='article'||row.status!=='published'||row.scheduled||typeof row.id!=='string'||seen.has(row.id))return false;if(row.publish_at&&!(Date.parse(row.publish_at)<=now))return false;seen.add(row.id);return true}).slice(0,3);
    if(!items.length){message.textContent='这里还没有其他已发布文章。你可以先去看看入门阅读。';list.append(link('从入门阅读开始','lab.html#courses'));return}
    message.textContent='从已发布的文章里，挑一篇与你有关的。';
    for(const row of items){const entry=link('','content.html?id='+encodeURIComponent(row.id),'reading-related-item');entry.append(element('small','',row.channel||'艾瑞斯精选'),element('h3','',row.title||'继续阅读'));if(row.summary)entry.append(element('p','',row.summary));entry.append(element('span','reading-related-action','接着读'));list.append(entry)}
   }catch{message.textContent='推荐暂时没加载出来，不影响阅读这篇内容。';const retry=element('button','reading-retry','再试一次');retry.type='button';retry.addEventListener('click',load);list.append(retry,link('去行业情报看看','intelligence.html'))}
  }
  await load();
 }
 function mount(item,host){
  const time=host.querySelector('[data-reading-time]');if(time){time.className='reading-time';time.textContent=`正文约 ${estimateMinutes(item)} 分钟`;time.title='按正文长度估算，不包含视频时长；按自己的节奏阅读即可。'}
  progress(host);
  const end=host.querySelector('[data-reading-end]');if(!end)return;end.className='reading-companion';bookmark(item,end);
  const next=element('div','reading-first-step');next.append(element('h3','','刚开始了解 AI 电商？'),element('p','','不用急着选很多工具。先读一份入门指南，找到眼下最想弄明白的问题。'),link('给自己找个起点','lab.html#courses'));end.append(next);
  const recommendations=element('section','reading-related');recommendations.setAttribute('aria-label','继续阅读');end.append(recommendations);related(item,recommendations);
 }
 window.AIRIS_READING={mount,estimateMinutes};
})();
