const KEYS = { cart: 'mf-cart', stock: 'mf-stock', added: 'mf-added', orders: 'mf-orders', customer: 'mf-customer' };
const BASE_PRODUCTS = [
  { id:'p-banane', name:'Bananes plantain', category:'Fruits et légumes', emoji:'🍌', price:4500, unit:'botte', stock:18, seller:'Chez Maman Grâce', location:'Matete', image:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=720&q=80', badge:'Récolte du jour' },
  { id:'p-tomate-a', name:'Tomates fraîches', category:'Fruits et légumes', emoji:'🍅', price:5500, unit:'panier', stock:12, seller:'Chez Maman Grâce', location:'Matete', image:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=720&q=80', badge:'Très frais' },
  { id:'p-tomate-b', name:'Tomates fraîches', category:'Fruits et légumes', emoji:'🍅', price:4800, unit:'panier', stock:9, seller:'Ferme Ngaliema', location:'Ngaliema', image:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=720&q=80', badge:'Bon prix' },
  { id:'p-avocat', name:'Avocats mûrs', category:'Fruits et légumes', emoji:'🥑', price:1800, unit:'pièce', stock:25, seller:'Ferme Ngaliema', location:'Ngaliema', image:'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=720&q=80', badge:'' },
  { id:'p-poisson', name:'Poisson capitaine', category:'Poissons et produits de la mer', emoji:'🐟', price:22000, unit:'kg', stock:8, seller:'Poissons du Fleuve', location:'Gombe', image:'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=720&q=80', badge:'Pêche du matin' },
  { id:'p-poulet', name:'Poulet fermier', category:'Viandes et volailles', emoji:'🍗', price:16500, unit:'pièce', stock:11, seller:'Élevage Mama Nono', location:'Limete', image:'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=720&q=80', badge:'Élevage local' },
  { id:'p-riz', name:'Riz de Kongo', category:'Céréales et produits agricoles', emoji:'🌾', price:12500, unit:'sac de 5 kg', stock:16, seller:'Coopérative Kongo', location:'Kingabwa', image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=720&q=80', badge:'Produit du pays' },
  { id:'p-haricot-a', name:'Haricots rouges', category:'Céréales et produits agricoles', emoji:'🫘', price:8500, unit:'sac de 2 kg', stock:13, seller:'Chez Maman Grâce', location:'Matete', image:'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=720&q=80', badge:'' },
  { id:'p-haricot-b', name:'Haricots rouges', category:'Céréales et produits agricoles', emoji:'🫘', price:7900, unit:'sac de 2 kg', stock:7, seller:'Coopérative Kongo', location:'Kingabwa', image:'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=720&q=80', badge:'Prix doux' },
  { id:'p-lait', name:'Lait caillé frais', category:'Produits frais et congelés', emoji:'🥛', price:3500, unit:'bouteille', stock:20, seller:'Lait du Plateau', location:'Mont-Ngafula', image:'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=720&q=80', badge:'Frais du jour' },
  { id:'p-miel', name:'Miel de forêt', category:'Autres produits alimentaires', emoji:'🍯', price:9500, unit:'pot', stock:14, seller:'Saveurs du Congo', location:'Bandalungwa', image:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=720&q=80', badge:'Artisanal' },
  { id:'p-manioc', name:'Farine de manioc', category:'Autres produits alimentaires', emoji:'🫓', price:6000, unit:'sac de 2 kg', stock:10, seller:'Chez Maman Grâce', location:'Matete', image:'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=720&q=80', badge:'' }
];
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const memoryStorage = new Map();
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { try { return JSON.parse(memoryStorage.get(key)) ?? fallback; } catch { return fallback; } } };
const write = (key, value) => { const data=JSON.stringify(value); try { localStorage.setItem(key,data); } catch { memoryStorage.set(key,data); } };
const money = amount => `${new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0))} FC`;
const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const shortCategory = category => ({'Fruits et légumes':'FRUITS & LÉGUMES','Poissons et produits de la mer':'POISSONS & MER','Viandes et volailles':'VIANDES & VOLAILLES','Céréales et produits agricoles':'CÉRÉALES & RÉCOLTES','Produits frais et congelés':'FRAIS & CONGELÉS','Autres produits alimentaires':'AUTRES PRODUITS'}[category] || category.toUpperCase());
let products = [...BASE_PRODUCTS, ...read(KEYS.added, [])];
let cart = read(KEYS.cart, {}), stockOverrides = read(KEYS.stock, {}), orders = read(KEYS.orders, []), customer = read(KEYS.customer, null);
let activeCategory = 'Tous', currentOrder = null, toastTimer;
const DELIVERY_PER_VENDOR = 2500;
const availableProducts = () => products.map(p => ({...p, stock: Number(stockOverrides[p.id] ?? p.stock)}));
const productById = id => availableProducts().find(p => p.id === id);
const unitsInCart = () => Object.values(cart).reduce((sum, qty) => sum + Number(qty || 0), 0);
const cartEntries = () => Object.entries(cart).map(([id, qty]) => ({product:productById(id), qty:Number(qty)})).filter(row => row.product && row.qty > 0);
const cartGroups = () => { const groups = new Map(); cartEntries().forEach(row => { const key=row.product.seller; if(!groups.has(key)) groups.set(key,[]); groups.get(key).push(row); }); return groups; };
function showToast(message) { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2800); }
function setView(name) {
  $$('.view').forEach(view => { const active=view.id===`view-${name}`; view.classList.toggle('active',active); view.hidden=!active; });
  $$('.nav-link').forEach(link=>link.classList.toggle('active',link.dataset.viewLink===name));
  if(name==='customer') renderCustomer(); if(name==='seller') renderSeller(); if(name==='admin') renderAdmin();
  window.scrollTo({top:0,behavior:'smooth'});
}
function getFilteredProducts() {
  const query=$('#search-input').value.trim().toLocaleLowerCase('fr');
  let list=availableProducts().filter(p=>(activeCategory==='Tous'||p.category===activeCategory) && (!query||`${p.name} ${p.seller} ${p.location} ${p.category}`.toLocaleLowerCase('fr').includes(query)));
  const sort=$('#sort-select').value; if(sort==='price-asc') list.sort((a,b)=>a.price-b.price); if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);
  return list;
}
function renderProducts() {
  const grid=$('#product-grid'), template=$('#product-card-template'), list=getFilteredProducts(); grid.replaceChildren();
  list.forEach(p=>{
    const card=template.content.firstElementChild.cloneNode(true), img=$('.product-image',card), placeholder=$('.image-placeholder',card), offers=availableProducts().filter(o=>o.name===p.name).length;
    img.alt=p.name; img.onerror=()=>{img.hidden=true; placeholder.classList.remove('has-image'); placeholder.textContent=p.emoji;}; img.onload=()=>{placeholder.classList.add('has-image');};
    if(p.image) img.src=p.image; else {img.hidden=true; placeholder.textContent=p.emoji;}
    const badge=$('.product-badge',card); badge.textContent=p.badge||''; badge.hidden=!p.badge;
    $('.product-category',card).textContent=shortCategory(p.category); $('.product-name',card).textContent=p.name; $('.seller-name',card).textContent=p.seller; $('.seller-location',card).textContent=`· ${p.location}`;
    $('.product-price',card).innerHTML=`${money(p.price)} <small>/ ${safe(p.unit)}</small>`;
    $('.product-stock',card).textContent=p.stock>0?`${p.stock} ${p.unit==='pièce'?'disponibles':'en stock'}`:'Rupture de stock';
    const compare=$('.compare-button',card); compare.hidden=offers<2; compare.addEventListener('click',()=>openComparison(p.name));
    const add=$('.add-button',card); add.disabled=p.stock<1; add.setAttribute('aria-label',`Ajouter ${p.name} au panier`); add.addEventListener('click',()=>addToCart(p.id));
    grid.append(card);
  });
  $('#empty-products').classList.toggle('hidden',list.length>0); $('#all-count').textContent=availableProducts().length;
  $('#market-feedback').textContent=$('#search-input').value.trim()?`${list.length} résultat${list.length===1?'':'s'} pour « ${$('#search-input').value.trim()} »`:'';
}
function addToCart(id) { const product=productById(id); if(!product||product.stock<1) return showToast('Ce produit n’est plus disponible.'); const next=(cart[id]||0)+1; if(next>product.stock) return showToast('La quantité disponible est atteinte.'); cart[id]=next; write(KEYS.cart,cart); renderCart(); showToast(`${product.name} ajouté au panier.`); }
function changeQuantity(id,delta) { const p=productById(id); if(!p)return; const next=(cart[id]||0)+delta; if(next<=0) delete cart[id]; else if(next<=p.stock) cart[id]=next; else showToast('La quantité disponible est atteinte.'); write(KEYS.cart,cart); renderCart(); }
function renderCart() {
  $('#cart-count').textContent=unitsInCart(); const lines=$('#cart-lines'), groups=cartGroups(); lines.replaceChildren();
  $('#cart-empty').classList.toggle('hidden',unitsInCart()>0); $('#checkout-options').classList.toggle('hidden',unitsInCart()===0);
  groups.forEach((rows,seller)=>{
    const section=document.createElement('section'); section.className='cart-vendor-group';
    section.innerHTML=`<div class="cart-vendor-heading"><strong>${safe(seller)}</strong><span>${rows.length} produit${rows.length===1?'':'s'}</span></div>`;
    rows.forEach(({product:p,qty})=>{ const row=document.createElement('div'); row.className='cart-line'; const image=p.image?`<img src="${safe(p.image)}" alt="" onerror="this.remove()">`:''; row.innerHTML=`<div class="cart-line-image"><span>${safe(p.emoji)}</span>${image}</div><div class="cart-line-main"><strong>${safe(p.name)}</strong><small>${money(p.price)} / ${safe(p.unit)}</small><div class="quantity-control"><button type="button" data-minus="${safe(p.id)}" aria-label="Retirer une unité">−</button><span>${qty}</span><button type="button" data-plus="${safe(p.id)}" aria-label="Ajouter une unité">+</button></div></div><div class="cart-line-price">${money(p.price*qty)}</div>`; section.append(row); });
    lines.append(section);
  });
  $$('[data-minus]',lines).forEach(button=>button.addEventListener('click',()=>changeQuantity(button.dataset.minus,-1)));
  $$('[data-plus]',lines).forEach(button=>button.addEventListener('click',()=>changeQuantity(button.dataset.plus,1)));
  const subtotal=cartEntries().reduce((sum,{product,qty})=>sum+product.price*qty,0), delivery=($('input[name="delivery-mode"]:checked')?.value==='pickup')?0:groups.size*DELIVERY_PER_VENDOR;
  $('#cart-subtotal').textContent=money(subtotal); $('#cart-delivery').textContent=money(delivery); $('#cart-total').textContent=money(subtotal+delivery); $('#checkout-button').disabled=unitsInCart()===0;
  $('#address-field').classList.toggle('hidden',$('input[name="delivery-mode"]:checked')?.value==='pickup');
}
function openCart() { $('#drawer-backdrop').hidden=false; $('#cart-drawer').classList.add('open'); $('#cart-drawer').setAttribute('aria-hidden','false'); document.body.classList.add('locked'); }
function closeCart() { $('#cart-drawer').classList.remove('open'); $('#cart-drawer').setAttribute('aria-hidden','true'); $('#drawer-backdrop').hidden=true; document.body.classList.remove('locked'); }
function openComparison(name) {
  const offers=availableProducts().filter(p=>p.name===name).sort((a,b)=>a.price-b.price); $('#compare-title').textContent=name;
  $('#compare-content').innerHTML=offers.map(p=>`<article class="compare-offer"><div class="compare-offer-image"><span>${safe(p.emoji)}</span>${p.image?`<img src="${safe(p.image)}" alt="" onerror="this.remove()">`:''}</div><div class="compare-offer-main"><strong>${safe(p.seller)}</strong><small>${safe(p.location)} · ${p.stock} disponible${p.stock===1?'':'s'}</small></div><div class="compare-offer-price">${money(p.price)}<small>par ${safe(p.unit)}</small></div><button class="compare-add" type="button" data-compare-add="${safe(p.id)}">Ajouter</button></article>`).join('');
  $$('[data-compare-add]').forEach(button=>button.addEventListener('click',()=>{addToCart(button.dataset.compareAdd); $('#compare-modal').close(); openCart();})); $('#compare-modal').showModal();
}
function buildOrder() {
  const entries=cartEntries(); if(!entries.length) return null;
  for(const {product,qty} of entries) if(qty>product.stock) return showToast(`Stock insuffisant pour ${product.name}.`),null;
  const deliveryMode=$('input[name="delivery-mode"]:checked')?.value||'delivery', address=$('#delivery-address').value.trim();
  if(deliveryMode==='delivery'&&!address) { $('#delivery-address').focus(); return showToast('Ajoute ton adresse ou choisis le retrait.'); }
  const groups=cartGroups(), suborders=[];
  groups.forEach((rows,seller,index)=>{ const subtotal=rows.reduce((sum,row)=>sum+row.product.price*row.qty,0), commission=Math.round(subtotal*.05); suborders.push({id:`S${index+1}`,seller,location:rows[0].product.location,items:rows.map(({product,qty})=>({id:product.id,name:product.name,qty,unit:product.unit,price:product.price,emoji:product.emoji})),subtotal,commission,payout:subtotal-commission,status:'À préparer'}); });
  const subtotal=suborders.reduce((sum,sub)=>sum+sub.subtotal,0), delivery=deliveryMode==='delivery'?suborders.length*DELIVERY_PER_VENDOR:0;
  const order={id:`MF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,date:new Date().toISOString(),status:'Confirmée · démo',method:deliveryMode==='delivery'?'Livraison à domicile':'Retrait chez les vendeurs',address:deliveryMode==='delivery'?address:'Retrait auprès de chaque boutique',payment:$('#payment-method').value,customer:customer?.name||'Client démo',subtotal,delivery,total:subtotal+delivery,commission:suborders.reduce((sum,sub)=>sum+sub.commission,0),suborders,trackingStep:1};
  entries.forEach(({product,qty})=>{stockOverrides[product.id]=Math.max(0,product.stock-qty);}); write(KEYS.stock,stockOverrides); orders.unshift(order); write(KEYS.orders,orders); cart={}; write(KEYS.cart,cart); currentOrder=order; renderAll(); closeCart(); showReceipt(order); return order;
}
function showReceipt(order) {
  $('#receipt-content').innerHTML=`<div class="receipt-order-id">Commande générale ${safe(order.id)} · ${safe(order.method)}</div>${order.suborders.map(sub=>`<div class="receipt-seller"><div class="receipt-seller-top"><strong>${safe(sub.seller)}</strong><strong>${money(sub.subtotal)}</strong></div><small>${sub.items.map(item=>`${item.qty} × ${safe(item.name)}`).join(' · ')}<br>Commission vendeur (5 %) : ${money(sub.commission)} · Revenu démo : ${money(sub.payout)}</small></div>`).join('')}<div class="receipt-totals"><div class="price-line"><span>Sous-total produits</span><strong>${money(order.subtotal)}</strong></div><div class="price-line"><span>Livraison (démo)</span><strong>${money(order.delivery)}</strong></div><div class="price-line total-line"><span>Total à régler (simulé)</span><strong>${money(order.total)}</strong></div><div class="price-line"><span>Paiement</span><strong>${safe(order.payment)}</strong></div></div>`;
  $('#receipt-modal').showModal();
}
function renderOrderCards(container, list) {
  container.replaceChildren(); const template=$('#order-card-template');
  list.forEach(order=>{ const card=template.content.firstElementChild.cloneNode(true); $('.order-id',card).textContent=order.id; $('.order-status',card).textContent=order.status; $('.order-vendors',card).textContent=order.suborders.map(s=>s.seller).join(' · '); $('.order-date',card).textContent=`${new Date(order.date).toLocaleDateString('fr-FR')} · ${order.method}`; $('.order-total',card).textContent=money(order.total); $('.order-tracking',card).innerHTML='<i class="tracking-step done"></i><i class="tracking-step '+(order.trackingStep>1?'done':'')+'"></i><i class="tracking-step '+(order.trackingStep>2?'done':'')+'"></i><i class="tracking-step '+(order.trackingStep>3?'done':'')+'"></i>'; card.insertAdjacentHTML('beforeend','<div class="tracking-labels"><span>Reçue</span><span>Préparation</span><span>En route</span><span>Livrée</span></div>'); container.append(card); });
}
function renderCustomer() {
  $('#customer-name').textContent=customer?.name||'Visiteur du marché'; $('#customer-avatar').textContent=customer?.name?.trim()?.[0]?.toLocaleUpperCase('fr')||'M'; $('#customer-contact').textContent=customer?.phone||'Aucun compte enregistré sur cet appareil.'; $('#customer-account-action').textContent=customer?'Modifier mon profil démo':'Créer mon compte démo';
  const container=$('#customer-orders'); renderOrderCards(container,orders); $('#customer-empty').classList.toggle('hidden',orders.length>0);
}
function renderSeller() {
  const mine=availableProducts().filter(p=>p.seller==='Chez Maman Grâce'), mySubs=orders.flatMap(o=>o.suborders.filter(s=>s.seller==='Chez Maman Grâce').map(s=>({...s,orderId:o.id,date:o.date,method:o.method})));
  const revenue=mySubs.reduce((sum,s)=>sum+s.subtotal,0), commission=mySubs.reduce((sum,s)=>sum+s.commission,0);
  $('#seller-stats').innerHTML=`<article class="stat-card"><span>Produits actifs</span><strong>${mine.length}</strong></article><article class="stat-card"><span>Sous-commandes reçues</span><strong>${mySubs.length}</strong></article><article class="stat-card"><span>Ventes brutes · démo</span><strong>${money(revenue)}</strong></article><article class="stat-card"><span>Revenu après 5 %</span><strong>${money(revenue-commission)}</strong></article>`;
  $('#seller-products').innerHTML=mine.length?mine.map(p=>`<div class="seller-product-row"><div class="mini-product-image"><span>${safe(p.emoji)}</span>${p.image?`<img src="${safe(p.image)}" alt="" onerror="this.remove()">`:''}</div><div class="seller-product-main"><strong>${safe(p.name)}</strong><small>${money(p.price)} / ${safe(p.unit)} · ${safe(shortCategory(p.category))}</small></div><div class="stock-control"><button type="button" data-stock-delta="-1" data-id="${safe(p.id)}" aria-label="Diminuer le stock">−</button><strong>${p.stock}</strong><button type="button" data-stock-delta="1" data-id="${safe(p.id)}" aria-label="Augmenter le stock">+</button></div></div>`).join(''):'<p class="section-subtitle">Aucun produit dans cette boutique pour le moment.</p>';
  $$('[data-stock-delta]').forEach(button=>button.addEventListener('click',()=>{const p=productById(button.dataset.id),next=Math.max(0,p.stock+Number(button.dataset.stockDelta)); stockOverrides[p.id]=next; write(KEYS.stock,stockOverrides); renderAll();}));
  $('#seller-order-count').textContent=mySubs.length; $('#seller-orders').innerHTML=mySubs.length?mySubs.map(s=>`<article class="seller-order-item"><div class="seller-order-item-top"><strong>${safe(s.orderId)}</strong><span class="status-pill">${safe(s.status)}</span></div><small>${new Date(s.date).toLocaleDateString('fr-FR')} · ${safe(s.method)}<br>${s.items.map(i=>`${i.qty} × ${safe(i.name)}`).join(' · ')}</small><div class="vendor-amount">Ventes : ${money(s.subtotal)} · Commission : ${money(s.commission)} · Net : ${money(s.payout)}</div></article>`).join(''):'<p class="section-subtitle">Les nouvelles commandes apparaîtront ici.</p>';
}
function renderAdmin() {
  const all=availableProducts(), vendors=[...new Set(all.map(p=>p.seller))], total=orders.reduce((sum,o)=>sum+o.subtotal,0), fees=orders.reduce((sum,o)=>sum+o.commission,0);
  $('#admin-stats').innerHTML=`<article class="stat-card"><span>Vendeurs de démonstration</span><strong>${vendors.length}</strong></article><article class="stat-card"><span>Produits au catalogue</span><strong>${all.length}</strong></article><article class="stat-card"><span>Commandes démo</span><strong>${orders.length}</strong></article><article class="stat-card"><span>Commissions calculées · 5 %</span><strong>${money(fees)}</strong></article>`;
  $('#admin-vendors').innerHTML=vendors.map(name=>{const p=all.find(x=>x.seller===name);return `<div class="admin-vendor-row"><span class="admin-vendor-mark">${safe(name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase())}</span><span><strong>${safe(name)}</strong><small>${safe(p.location)} · ${all.filter(x=>x.seller===name).length} produit(s)</small></span></div>`;}).join('');
  $('#admin-orders').innerHTML=orders.length?orders.slice(0,5).map(o=>`<article class="seller-order-item"><div class="seller-order-item-top"><strong>${safe(o.id)}</strong><span class="status-pill">${safe(o.status)}</span></div><small>${safe(o.customer)} · ${new Date(o.date).toLocaleDateString('fr-FR')}<br>${o.suborders.length} vendeur(s) · ${safe(o.method)}</small><div class="vendor-amount">${money(o.total)} total · Commission plateforme : ${money(o.commission)}</div></article>`).join(''):'<p class="section-subtitle">Les commandes de démonstration apparaîtront ici.</p>';
}
function renderAll() { renderProducts(); renderCart(); if(!$('#view-customer').hidden) renderCustomer(); if(!$('#view-seller').hidden) renderSeller(); if(!$('#view-admin').hidden) renderAdmin(); }
function openAccount() { $('#account-name').value=customer?.name||''; $('#account-phone').value=customer?.phone||''; $('#account-modal').showModal(); }
function compressPhoto(file) { return new Promise((resolve,reject)=>{const reader=new FileReader(); reader.onerror=reject; reader.onload=()=>{const image=new Image(); image.onerror=reject; image.onload=()=>{const scale=Math.min(1,800/Math.max(image.width,image.height)),canvas=document.createElement('canvas'); canvas.width=Math.round(image.width*scale); canvas.height=Math.round(image.height*scale); canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height); resolve(canvas.toDataURL('image/jpeg',.78));}; image.src=reader.result;}; reader.readAsDataURL(file);}); }

$$('[data-view-link]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();setView(button.dataset.viewLink);}));
$('#open-account').addEventListener('click',openAccount); $('#customer-account-action').addEventListener('click',openAccount);
$('#open-cart').addEventListener('click',openCart); $('#close-cart').addEventListener('click',closeCart); $('#drawer-backdrop').addEventListener('click',closeCart); $('#browse-market').addEventListener('click',()=>{closeCart();setView('store');});
$('#search-form').addEventListener('submit',event=>{event.preventDefault();activeCategory='Tous';$$('.category-chip').forEach(chip=>chip.classList.toggle('active',chip.dataset.category==='Tous'));renderProducts();$('#marche').scrollIntoView({behavior:'smooth'});});
$('#search-input').addEventListener('input',renderProducts); $('#sort-select').addEventListener('change',renderProducts);
$('#category-bar').addEventListener('click',event=>{const chip=event.target.closest('[data-category]');if(!chip)return;activeCategory=chip.dataset.category;$$('.category-chip').forEach(item=>item.classList.toggle('active',item===chip));renderProducts();});
$('#reset-filters').addEventListener('click',()=>{$('#search-input').value='';activeCategory='Tous';$$('.category-chip').forEach(chip=>chip.classList.toggle('active',chip.dataset.category==='Tous'));renderProducts();});
$$('input[name="delivery-mode"]').forEach(input=>input.addEventListener('change',renderCart));
$('#checkout-button').addEventListener('click',buildOrder);
$$('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));
$('#account-form').addEventListener('submit',event=>{event.preventDefault();customer={name:$('#account-name').value.trim(),phone:$('#account-phone').value.trim()};write(KEYS.customer,customer);$('#account-modal').close();renderCustomer();showToast('Profil de démonstration enregistré sur cet appareil.');});
$('#edit-seller-profile').addEventListener('click',()=>$('#profile-modal').showModal());
$('#show-add-product').addEventListener('click',()=>$('#product-modal').showModal());
$('#product-form').addEventListener('submit',async event=>{event.preventDefault();const file=$('#new-product-photo').files[0];if(file&&file.size>700*1024)return showToast('Choisis une photo de moins de 700 Ko.');let image='';if(file){try{image=await compressPhoto(file);}catch{return showToast('Impossible de lire cette photo.');}}
  const category=$('#new-product-category').value, emoji=({'Fruits et légumes':'🥬','Poissons et produits de la mer':'🐟','Viandes et volailles':'🍗','Céréales et produits agricoles':'🌾','Produits frais et congelés':'🥛','Autres produits alimentaires':'🍯'})[category];
  const product={id:`local-${Date.now()}`,name:$('#new-product-name').value.trim(),category,emoji,price:Number($('#new-product-price').value),unit:$('#new-product-unit').value.trim(),stock:Number($('#new-product-stock').value),seller:'Chez Maman Grâce',location:'Matete',image,badge:'Ajout démo'};
  products.push(product);const added=read(KEYS.added,[]);added.push(product);write(KEYS.added,added);$('#product-form').reset();$('#product-modal').close();renderAll();showToast('Produit ajouté au catalogue de démonstration.');
});
$('#track-order-button').addEventListener('click',()=>{$('#receipt-modal').close();setView('customer');});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#cart-drawer').classList.contains('open'))closeCart();});
renderAll();

