// The hosted preview reads an explicit publication snapshot; the local site keeps its live CMS.
window.AIRIS_CONTENT=(()=>{
 const snapshot=window.AIRIS_PUBLIC_SNAPSHOT;
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8'}});
 const published=()=>snapshot.items.filter(item=>item.status==='published'&&!item.scheduled&&(!item.publish_at||Date.parse(item.publish_at)<=Date.now()));
 const like=(value,query)=>new RegExp([...query].map(c=>c==='%'?'.*':c==='_'?'.':c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join(''),'iu').test(value);
 return {
  mediaURL(id){return snapshot?(snapshot.media[id]||''):'/api/media/'+encodeURIComponent(id)},
  async fetch(input,options){
   if(!snapshot)return window.fetch(input,options);
   if(options?.method&&options.method!=='GET')return reply({error:'预览站仅提供已发布内容'},405);
   const url=new URL(input,location.href),prefix='/api/public/content';
   if(url.origin!==location.origin||!(url.pathname===prefix||url.pathname.startsWith(prefix+'/')))return reply({error:'接口不存在'},404);
   const items=published();
   if(url.pathname!==prefix){let id;try{id=decodeURIComponent(url.pathname.slice(prefix.length+1))}catch{return reply({error:'内容编号无效'},400)}const item=items.find(x=>x.id===id);return item?reply(item):reply({error:'内容不存在或未公开'},404)}
   const p=url.searchParams,type=p.get('type')||'',category=(p.get('channel')??p.get('category')??'').trim(),q=(p.get('q')||'').slice(0,200).trim();
   if(type&&!['article','course','video','event','report','page'].includes(type))return reply({error:'筛选值不正确'},400);
   if(category.length>100)return reply({error:'栏目最多 100 字'},400);
   const pageValue=p.get('page')||'1',sizeValue=p.get('page_size')||'20';
   if(!/^[+-]?\d+$/.test(pageValue)||!/^[+-]?\d+$/.test(sizeValue))return reply({error:'页码必须为数字'},400);
   const page=Math.max(1,Number(pageValue)),size=Math.max(1,Math.min(100,Number(sizeValue)));
   const matches=items.filter(x=>(!type||x.type===type)&&(!category||x.channel===category)&&(!q||[x.title,x.summary,x.author,x.channel].some(value=>like(String(value||''),q))));
   return reply({items:matches.slice((page-1)*size,page*size),count:matches.length,total:matches.length,page,page_size:size,as_of:snapshot.generatedAt});
  }
 };
})();
window.AIRIS_PLATFORMS=[
 {key:'international',label:'阿里国际站',category:'国际站经营',url:'international.html'},
 {key:'1688',label:'1688',category:'1688经营',url:'channel.html?platform=1688'},
 {key:'amazon',label:'亚马逊',category:'亚马逊经营',url:'channel.html?platform=amazon'},
 {key:'tiktok',label:'TikTok',category:'TikTok经营',url:'channel.html?platform=tiktok'},
 {key:'independent',label:'独立站',category:'独立站经营',url:'channel.html?platform=independent'},
 {key:'crossborder',label:'跨境经营',category:'跨境经营',url:'channel.html?platform=crossborder'},
 {key:'reception',label:'询盘与接待',category:'AI 业务接待',url:'channel.html?platform=reception'}
];
const current=(location.pathname.split('/').pop()||'index.html');
const header=document.querySelector('[data-header]');
const brandMarkup='<img class="logo-full" src="assets/logo-lockup.svg" alt="艾瑞斯 AIRIS">';
if(header)header.innerHTML=`<header class="site-head"><div class="edition-line"><div class="wrap"><span>让 AI 成为你的生意优势</span><span><a href="brand.html">关于艾瑞斯</a>　 /　 <a href="mobile/#/me">我的学习</a>　 /　 <a href="mobile/">手机端</a>${window.AIRIS_PUBLIC_SNAPSHOT?'':'　 /　 <a href="admin.html">内容管理</a>'}</span></div></div><div class="wrap head-inner"><a class="wordmark" href="index.html" aria-label="艾瑞斯首页">${brandMarkup}</a><div class="brand-descriptor"><strong>AI 电商产业门户</strong>看懂变化，陪你一起成长</div><form class="header-search" role="search" action="intelligence.html"><label class="sr-only" for="header-query">搜索本站文章</label><input id="header-query" name="q" type="search" placeholder="搜索 AI、跨境、接待、培训…" maxlength="100"><button type="submit">搜索</button></form><a class="btn btn-primary head-cta" href="partner.html">和 AI 业务合伙人聊聊</a><button class="menu-toggle" aria-label="打开导航" aria-expanded="false" aria-controls="site-nav">☰</button></div><div class="nav-row"><div class="wrap nav-wrap"><nav class="site-nav" id="site-nav" aria-label="主导航"><a href="index.html">首页</a><a href="intelligence.html">行业情报</a><a href="international.html">国际站专区</a><a href="toolkit.html">AI 工具</a><a href="academy.html">商学院</a><a href="events.html">活动与直播</a><a href="sources.html">信息源导航</a><a href="enterprise.html">企业合作</a></nav><a class="nav-utility" href="enterprise.html#panel-2">专家 / 机构合作</a></div></div></header>`;
const footer=document.querySelector('[data-footer]');
if(footer)footer.innerHTML=`<footer class="site-footer"><div class="wrap"><div class="footer-grid"><a class="wordmark" href="index.html" aria-label="艾瑞斯首页">${brandMarkup}</a><div class="footer-links"><a href="intelligence.html">行业情报</a><a href="international.html">国际站专区</a><a href="toolkit.html">AI 工具</a><a href="academy.html">商学院</a><a href="events.html">活动与直播</a><a href="sources.html">信息源导航</a><a href="enterprise.html">企业合作</a><a href="mobile/#/me">我的学习</a>　 /　 <a href="mobile/">手机端</a><a href="brand.html">品牌与 VI</a>${window.AIRIS_PUBLIC_SNAPSHOT?'':'<a href="admin.html">内容管理</a>'}</div></div><div class="footer-bottom"><span>© AIRIS 艾瑞斯 · AI 电商产业门户</span><span>和认真做生意的人，一起成长</span></div></div></footer>`;
document.querySelector('[data-review]')?.remove();
document.querySelector('.menu-toggle')?.addEventListener('click',e=>{const isOpen=document.querySelector('#site-nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',isOpen);e.currentTarget.setAttribute('aria-label',isOpen?'关闭导航':'打开导航');});
document.querySelectorAll('.site-nav a').forEach(link=>{if(link.getAttribute('href')===current){link.classList.add('active');link.setAttribute('aria-current','page');}link.addEventListener('click',()=>{document.querySelector('#site-nav')?.classList.remove('open');const toggle=document.querySelector('.menu-toggle');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','打开导航');});});
window.toast=(text)=>{document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),3800);};

const platformHost=document.querySelector('[data-platform-nav]');
if(platformHost){const selected=current==='international.html'?'international':current==='channel.html'?new URLSearchParams(location.search).get('platform'):'';platformHost.innerHTML='<div class="portal-platforms"><nav class="wrap" aria-label="平台与经营入口"><strong>你的生意，我们一起研究</strong>'+window.AIRIS_PLATFORMS.map(p=>'<a href="'+p.url+'"'+(p.key===selected?' class="platform-feature" aria-current="page"':'')+'>'+p.label+'</a>').join('')+'</nav></div>';}
