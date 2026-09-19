(()=>{'use strict';
const stream=document.querySelector('[data-home-stream]');if(!stream)return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=id=>'content.html?id='+encodeURIComponent(id);
const journeys={
 start:{note:'先不用急着选工具。从一个小问题开始，你会更容易知道自己需要什么。',steps:[['learning-with-small-steps','先找到节奏','给自己一个能完成的小起点'],['ai-brief-with-context','再试着表达','把背景和需要的结果告诉 AI'],['ai-commerce-starter','跟着做一遍','三节入门文字导读']]},
 global:{note:'做好国际站，从读懂买家、讲清产品开始。先把这几件事做扎实。',steps:[['buyer-research-notes','先认识买家','把已知、猜测和待确认分开'],['product-page-story','说清楚产品','从参数走向买家关心的使用场景'],['international-inquiry-path','接好第一封询盘','跟着四节文字课练一遍']]},
 inquiry:{note:'一次好沟通，不一定需要漂亮的话术。先让客户觉得，你认真看了他的问题。',steps:[['first-inquiry-reply','回应眼前的问题','第一封回复，先接住需求'],['follow-up-with-care','让跟进有价值','不只问“考虑得怎么样了”'],['international-inquiry-path','按小节练习','把理解、回复和下一步连起来']]},
 team:{note:'不用让每个人同时学会所有工具。一起练熟一件事，就是团队的进步。',steps:[['team-first-week','先安排一周','把共学放进大家的真实工作'],['knowledge-base','整理共同资料','让同事找到同一份有效答案'],['team-ai-week','按步骤一起学','五节文字课，带着同事开始']]}
};
let articles=[],courses=[],category='',loaded=false,loadError=false,selected='start';
try{const saved=localStorage.getItem('airis-learning-direction');if(journeys[saved])selected=saved}catch{}
function readingTime(x){return Math.max(1,Math.ceil(String(x.body||'').length/350))}
function renderJourney(){
 const panel=document.querySelector('#journey-panel');
 document.querySelectorAll('[data-journey]').forEach(b=>{const active=b.dataset.journey===selected;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});
 panel.setAttribute('aria-labelledby','journey-'+selected);
 if(!loaded){panel.innerHTML=loadError?'<p class="journey-help">学习内容暂时没有加载出来。<button type="button" data-home-retry>重新加载</button>，或先<a href="academy.html">浏览商学院</a>。</p>':'<div class="loading-state">正在整理适合你的阅读起点…</div>';return}
 const route=journeys[selected];const records=[...articles,...courses];
 const available=route.steps.map((step,i)=>({step,item:records.find(x=>x.id===step[0]),number:i+1})).filter(x=>x.item);
 panel.innerHTML=`<p class="journey-note">${esc(route.note)}</p><div class="journey-steps">${available.map(({step,item,number})=>`<a href="${url(item.id)}"><span class="step-number">${number}</span><div><small>${esc(step[1])}</small><strong>${esc(step[2])}</strong><span>${item.type==='course'?`${item.chapters.length} 节文字课`:`约 ${readingTime(item)} 分钟阅读`}</span></div><b aria-hidden="true">↗</b></a>`).join('')}</div>${available.length?'':'<p class="journey-help">这个方向的内容正在整理，可以先<a href="intelligence.html">看看全部文章</a>。</p>'}`;
}
function renderStream(){
 if(!loaded){stream.innerHTML=loadError?'<div class="error-state"><h3>内容暂时没有加载出来</h3><p>请稍后重试，或先浏览信息源导航。</p><button class="button primary" data-home-retry>重新加载</button></div>':'<div class="loading-state">正在打开编辑精选…</div>';return}
 const priorities=['alibaba-guide-storefront','amazon-guide-listing','tiktok-guide-script','shopify-guide-home-product','reception-guide-inquiry-card','first-inquiry-reply','product-page-story','ai-brief-with-context','follow-up-with-care','team-first-week','buyer-research-notes'];
 const items=category?articles.filter(x=>x.channel===category).slice(0,5):[...articles].sort((a,b)=>{let ai=priorities.indexOf(a.id),bi=priorities.indexOf(b.id);return (ai<0?99:ai)-(bi<0?99:bi)}).slice(0,5);
 if(!items.length){stream.innerHTML='<div class="empty-state"><h3>这个方向的文章正在准备</h3><p>先看看编辑精选，或换一个方向。</p><button class="button" data-reset-home>查看编辑精选</button></div>';return}
 const first=items[0];
 stream.innerHTML=`<a class="editorial-feature" href="${url(first.id)}"><div class="editorial-photo"><img src="${first.cover_media_id?window.AIRIS_CONTENT.mediaURL(first.cover_media_id):'assets/companion/learn-desk.jpg'}" alt="" loading="lazy" width="600" height="450"><span>读一点，往前走一点</span></div><div class="editorial-feature-copy"><small>${esc(first.channel)}</small><h3>${esc(first.title)}</h3><p>${esc(first.summary)}</p><div class="article-meta"><span>${esc(first.author||'艾瑞斯编辑部')}</span><span>约 ${readingTime(first)} 分钟</span></div></div></a><div class="editorial-list">${items.slice(1).map(x=>`<a href="${url(x.id)}"><div><small>${esc(x.channel)}</small><h3>${esc(x.title)}</h3><p>${esc(x.summary)}</p><span class="article-meta">约 ${readingTime(x)} 分钟阅读</span></div><span class="list-arrow" aria-hidden="true">↗</span></a>`).join('')}</div><a class="editorial-more" href="${(window.AIRIS_PLATFORMS||[]).find(p=>p.category===category)?.url||'intelligence.html'+(category?'?category='+encodeURIComponent(category):'')}">继续看看${category?esc(category):'全部'}内容 <span aria-hidden="true">↗</span></a>`;
}
function renderCourses(){
 const cards=[...document.querySelectorAll('[data-home-course]')];
 for(const card of cards){
  const item=courses.find(x=>x.id===card.dataset.homeCourse);
  card.hidden=!loaded||!item;
  if(item){card.querySelector('.lesson-format').textContent='文字小课 · '+item.chapters.length+' 节';card.querySelector('.learning-copy h3').textContent=item.title;card.querySelector('.learning-copy>p:not(.lesson-format)').textContent=item.summary.replace(/^文字课[｜|]\s*/,'');card.querySelector('.learning-copy>a').href=url(item.id)}
 }
 let message=document.querySelector('.learning-availability');
 if(!message){message=document.createElement('p');message.className='learning-availability';document.querySelector('.learning-pair').after(message)}
 message.hidden=cards.some(c=>!c.hidden);
 message.textContent=loadError?'课程暂时没有加载出来，稍后可以在商学院继续查看。':loaded?'课程内容正在调整，可以先从上方的文章开始。':'正在整理学习内容…';
}
function chooseCategory(value){category=value;document.querySelectorAll('[data-home-category]').forEach(b=>{const active=b.dataset.homeCategory===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});renderStream()}
async function load(){loaded=false;loadError=false;renderJourney();renderStream();renderCourses();try{
 if(location.protocol==='file:'){articles=(window.AIRIS_GUIDES||[]).filter(x=>x.type==='article');courses=(window.AIRIS_GUIDES||[]).filter(x=>x.type==='course')}
 else{const result=await Promise.all(['article','course'].map(async type=>{const r=await window.AIRIS_CONTENT.fetch('/api/public/content?type='+type+'&page_size=100');if(!r.ok)throw Error('HTTP '+r.status);return r.json()}));articles=result[0].items;courses=result[1].items}
 loaded=true;
 }catch{loadError=true}renderJourney();renderStream();renderCourses()}
function selectJourney(value){selected=value;try{localStorage.setItem('airis-learning-direction',selected)}catch{}renderJourney()}
document.querySelectorAll('[data-journey]').forEach(b=>{b.addEventListener('click',()=>selectJourney(b.dataset.journey));b.addEventListener('keydown',e=>{const buttons=[...document.querySelectorAll('[data-journey]')];let i=buttons.indexOf(b);if(e.key==='ArrowRight')i=(i+1)%buttons.length;else if(e.key==='ArrowLeft')i=(i-1+buttons.length)%buttons.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=buttons.length-1;else return;e.preventDefault();selectJourney(buttons[i].dataset.journey);buttons[i].focus()})});
document.querySelectorAll('[data-home-category]').forEach(b=>b.addEventListener('click',()=>chooseCategory(b.dataset.homeCategory)));
document.addEventListener('click',e=>{if(e.target.closest('[data-home-retry]'))load();if(e.target.closest('[data-reset-home]'))chooseCategory('')});
load();
})();
