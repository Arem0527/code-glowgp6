(function(){
const LS_CART_KEY = 'cg_cart_items';
const LS_FAV_KEY = 'cg_fav_items';

function read(key){
  try{
    return JSON.parse(localStorage.getItem(key) || '[]');
  }catch(e){return [];}
}
function write(key, arr){
  localStorage.setItem(key, JSON.stringify(arr));
}

function addItem(key, item){
  const items = read(key);
  if(!items.find(i=>i.id===item.id)){
     items.push(item);
     write(key, items);
  }
  updateCounts();
  populateSidebars();
}

function removeItem(key, id){
  let items = read(key).filter(i=>i.id!==id);
  write(key, items);
  updateCounts();
  populateSidebars();
}

function addToCart(item){
  addItem(LS_CART_KEY, item);
}

function addToFav(item){
  addItem(LS_FAV_KEY, item);
}

function toggleSidebar(id, show){
  const el = document.getElementById(id);
  if(!el) return;
  if(show === undefined){
    el.classList.toggle('open');
  }else if(show){
    el.classList.add('open');
  }else{
    el.classList.remove('open');
  }
}

function updateCounts(){
  const cartCnt = document.querySelector('#cgCartCount');
  const favCnt = document.querySelector('#cgFavCount');
  if(cartCnt) cartCnt.textContent = read(LS_CART_KEY).length;
  if(favCnt) favCnt.textContent = read(LS_FAV_KEY).length;
}

function createSidebar(id,title, key){
  if(document.getElementById(id)) return;
  const bar = document.createElement('div');
  bar.id = id;
  bar.className='cg-sidebar';
  bar.innerHTML = `
     <div class="cg-sidebar-header"><h3>${title}</h3><button class="cg-close-btn">✕</button></div>
     <div class="cg-sidebar-body"></div>
  `;
  document.body.appendChild(bar);
  bar.querySelector('.cg-close-btn').addEventListener('click', ()=>toggleSidebar(id,false));
}

function populateSidebars(){
  const map=[['cgCartSidebar', LS_CART_KEY], ['cgFavSidebar', LS_FAV_KEY]];
  map.forEach(([id,key])=>{
     const body=document.querySelector('#'+id+' .cg-sidebar-body');
     if(!body) return;
     const items = read(key);
     body.innerHTML = items.length? '' : '<p style="padding:10px;">No items yet.</p>';
     items.forEach(item=>{
        const div=document.createElement('div');
        div.className='cg-item';
        div.innerHTML = `<img src="${item.img}" alt="">
          <div class="cg-item-info"><span>${item.name}</span><small>${item.price||''}</small></div>
          <button class="cg-remove-btn" title="Remove">🗑</button>`;
        div.querySelector('.cg-remove-btn').addEventListener('click',()=>removeItem(key,item.id));
        body.appendChild(div);
     });
  });
}

function insertStyles(){
  if(document.getElementById('cgStyles')) return;
  const css = `
.cg-overlay{position:absolute;top:8px;right:8px;display:flex;flex-direction:column;gap:6px}
.cg-overlay button{background:#fff;border:1px solid #7a4212;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:16px;color:#7a4212;}
.cg-overlay button:hover{background:#7a4212;color:#fff}
.cg-badge{background:#7a4212;color:#fff;border-radius:50%;padding:2px 6px;font-size:12px;position:absolute;top:-6px;right:-10px}
.cg-sidebar{position:fixed;top:0;right:-400px;width:350px;height:100%;background:#a57d5a;color:#fff;z-index:2000;display:flex;flex-direction:column;transition:right 0.3s}
.cg-sidebar.open{right:0}
.cg-sidebar-header{display:flex;justify-content:space-between;align-items:center;padding:15px;font-weight:bold;font-size:18px;border-bottom:1px solid rgba(255,255,255,0.4)}
.cg-close-btn{background:none;border:none;color:#fff;font-size:24px;cursor:pointer}
.cg-sidebar-body{flex:1;overflow-y:auto;padding:10px}
.cg-item{display:flex;align-items:center;margin-bottom:10px;background:rgba(255,255,255,0.1);padding:6px;border-radius:8px}
.cg-item img{width:50px;height:50px;object-fit:contain;border-radius:6px;margin-right:8px}
.cg-item-info span{display:block;font-size:14px}
.cg-item-info small{font-size:12px;color:#ffd}
.cg-remove-btn{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;margin-left:auto}
`;
  const style = document.createElement('style');
  style.id='cgStyles';
  style.textContent = css;
  document.head.appendChild(style);
}

function insertSidebar(){
  createSidebar('cgCartSidebar','My Cart', LS_CART_KEY);
  createSidebar('cgFavSidebar','Favorites', LS_FAV_KEY);
}

function enhanceTopIcons(){
   const cartAnchor = document.querySelector('.cart');
   const favAnchor = document.querySelector('.wishlist');
   if(cartAnchor && !cartAnchor.querySelector('.cg-badge')){
       const badge=document.createElement('span');
       badge.id='cgCartCount';
       badge.className='cg-badge';
       cartAnchor.style.position='relative';
       cartAnchor.appendChild(badge);
       cartAnchor.addEventListener('click',(e)=>{e.preventDefault();toggleSidebar('cgCartSidebar');});
   }
   if(favAnchor && !favAnchor.querySelector('.cg-badge')){
       const badge=document.createElement('span');
       badge.id='cgFavCount';
       badge.className='cg-badge';
       favAnchor.style.position='relative';
       favAnchor.appendChild(badge);
       favAnchor.addEventListener('click',(e)=>{e.preventDefault();toggleSidebar('cgFavSidebar');});
   }
}

document.addEventListener('DOMContentLoaded', ()=>{
   insertStyles();
   insertSidebar();
   enhanceTopIcons();
   updateCounts();
   populateSidebars();

   document.querySelectorAll('.product-card').forEach((card,idx)=>{
      if(card.dataset.cgReady) return;
      card.dataset.cgReady='1';
      card.style.position='relative';
      const img = card.querySelector('img');
      const name = (card.querySelector('.product-name')||{}).innerText || 'Item';
      const price = (card.querySelector('.product-price')||{}).innerText || '';
      // overlay
      const overlay=document.createElement('div');
      overlay.className='cg-overlay';
      overlay.innerHTML = '<button class="cg-add-cart" title="Add to cart">🛒</button><button class="cg-add-fav" title="Add to favorites">♡</button>';
      card.appendChild(overlay);
      overlay.querySelector('.cg-add-cart').addEventListener('click',(e)=>{
          e.stopPropagation();
          addToCart({id:`cart-${name}-${idx}`, name, price, img: img?img.src:''});
      });
      overlay.querySelector('.cg-add-fav').addEventListener('click',(e)=>{
          e.stopPropagation();
          addToFav({id:`fav-${name}-${idx}`, name, price, img: img?img.src:''});
      });
   });
});
})();
