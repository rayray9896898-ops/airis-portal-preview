const portalMenu=document.querySelector('.portal-menu');
portalMenu?.addEventListener('click',()=>{const nav=document.querySelector('.portal-links');const open=nav.classList.toggle('open');portalMenu.classList.toggle('open',open);portalMenu.setAttribute('aria-expanded',open);portalMenu.setAttribute('aria-label',open?'关闭门户导航':'打开门户导航');});
document.querySelectorAll('[data-partner-prompt]').forEach(btn=>btn.addEventListener('click',()=>{sessionStorage.setItem('airisPartnerPrompt',btn.dataset.partnerPrompt);location.href='partner.html';}));

const resourceQuery=document.querySelector('#resource-query');
const resourceItems=[...document.querySelectorAll('.resource-item')];
let resourceFilter='all';
function filterResources(){
  const query=(resourceQuery?.value||'').trim().toLocaleLowerCase();
  let count=0;
  resourceItems.forEach(item=>{const show=(resourceFilter==='all'||item.dataset.resourceType===resourceFilter)&&item.textContent.toLocaleLowerCase().includes(query);item.hidden=!show;if(show)count++;});
  const counter=document.querySelector('#resource-count');if(counter)counter.textContent=`${count} 项精选资源`;
  const empty=document.querySelector('.resource-empty');if(empty)empty.hidden=count>0;
}
document.querySelectorAll('[data-resource-filter]').forEach(button=>button.addEventListener('click',()=>{resourceFilter=button.dataset.resourceFilter;document.querySelectorAll('[data-resource-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});filterResources();}));
resourceQuery?.addEventListener('input',filterResources);
document.querySelector('.resource-search')?.addEventListener('submit',event=>{event.preventDefault();filterResources();});
document.querySelector('#resource-reset')?.addEventListener('click',()=>{resourceQuery.value='';document.querySelector('[data-resource-filter="all"]').click();resourceQuery.focus();});
document.querySelectorAll('.portal-links a').forEach(link=>link.addEventListener('click',()=>{document.querySelector('.portal-links')?.classList.remove('open');portalMenu?.classList.remove('open');portalMenu?.setAttribute('aria-expanded','false');portalMenu?.setAttribute('aria-label','打开门户导航');}));

// On standalone channel pages, keep the compact navigation usable on touch screens.
document.querySelectorAll('.channel-nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelector('.portal-links')?.classList.remove('open');portalMenu?.classList.remove('open');}));
