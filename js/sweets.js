// Athidhi Sweets — language toggle, mobile nav, product catalog, cart (vanilla JS)
(function () {
  var LANG_STORE = "athidhi_sweets_lang";
  var CART_STORE = "athidhi_sweets_cart";
  // Payment/checkout endpoint — Siri wires this later (Supabase edge fn creating a Stripe Checkout Session).
  // Leave empty for the draft; when set, the cart POSTs items here and redirects to the returned Stripe URL.
  var CHECKOUT_ENDPOINT = "";

  // ---- Catalog (source of truth: Siri's confirmed list; prices are placeholders) ----
  var PRODUCTS = [
    {id:"gulab-jamun",     cat:"sweets", name:"Gulab Jamun",      w:"400 g", de:"Weiche Milchklößchen in Rosen-Kardamom-Sirup",           en:"Soft milk-solid dumplings in rose & cardamom syrup"},
    {id:"rasmalai",        cat:"sweets", name:"Rasmalai",         w:"400 g", de:"Weiche Paneer-Taler in Safran-Kardamom-Milch",             en:"Soft paneer discs in saffron-cardamom milk"},
    {id:"gajar-ka-halwa",  cat:"sweets", name:"Gajar ka Halwa",   w:"400 g", de:"Langsam gegartes Karotten-Dessert mit Ghee & Nüssen",      en:"Slow-cooked carrot pudding with ghee & nuts"},
    {id:"mysore-pak",      cat:"sweets", name:"Mysore Pak",       w:"200 g", de:"Sattes Konfekt aus Ghee & Kichererbsenmehl (Südindien)",   en:"Rich ghee & gram-flour fudge from South India"},
    {id:"kalakand",        cat:"sweets", name:"Kalakand",         w:"200 g", de:"Saftiger Milchkuchen mit Kardamom",                        en:"Moist milk cake with cardamom"},
    {id:"kova-jamun",      cat:"sweets", name:"Kova Jamun",       w:"400 g", de:"Khoya-Klößchen in Zuckersirup",                            en:"Khoya dumplings in sugar syrup"},
    {id:"bundi-laddu",     cat:"sweets", name:"Bundi Laddu",      w:"400 g", de:"Süße Kugeln aus Kichererbsenmehl-Perlen",                  en:"Sweet pearl balls of gram flour"},
    {id:"murukku",         cat:"snacks", name:"Murukku",          w:"400 g", de:"Knusprige, würzige Reismehl-Spiralen (herzhaft)",          en:"Crunchy spiced rice-flour spirals (savoury)"},
    {id:"navratan-mixture",cat:"snacks", name:"Navratan Mixture", w:"400 g", de:"Knuspriger, herzhafter Snack-Mix",                         en:"Crunchy savoury snack mix"},
    {id:"kala-jamun",      cat:"sweets", name:"Kala Jamun",       w:"400 g", de:"Dunklere, kräftigere Variante des Gulab Jamun",            en:"Dark, richer cousin of gulab jamun"},
    {id:"sev-bhujiya",     cat:"snacks", name:"Sev Bhujiya",      w:"400 g", de:"Knusprige Kichererbsenmehl-Nudeln (herzhaft)",             en:"Crispy gram-flour noodles (savoury)"},
    {id:"jalebi",          cat:"sweets", name:"Jalebi",           w:"250 g", de:"Knusprige Spiralen in Safransirup",                        en:"Crisp spirals soaked in saffron syrup"},
    {id:"besan-laddu",     cat:"sweets", name:"Besan Laddu",      w:"400 g", de:"Kugeln aus geröstetem Kichererbsenmehl & Ghee",            en:"Roasted gram-flour & ghee balls"},
    {id:"kaju-katli",      cat:"sweets", name:"Kaju Katli",       w:"200 g", de:"Feine Cashew-Konfekt-Rauten",                              en:"Fine cashew fudge diamonds"},
    {id:"gujiya",          cat:"sweets", name:"Gujiya",           w:"400 g", de:"Halbmond-Teigtaschen mit Khoya & Nüssen",                  en:"Crescent pastries filled with khoya & nuts"}
  ];
  // Optional per-product image URLs (fill when photos are available); missing => branded placeholder.
  var IMAGES = {
    "gulab-jamun":"assets/products/real-gulab-jamun.webp",
    "rasmalai":"assets/products/real-rasmalai.webp",
    "gajar-ka-halwa":"assets/products/36-gajar-ka-halwa.webp",
    "mysore-pak":"assets/products/37-mysore-pak.webp",
    "kalakand":"assets/products/38-kalakand.webp",
    "kova-jamun":"assets/products/real-kova-jamun.webp",
    "bundi-laddu":"assets/products/real-bundi-laddu.webp",
    "murukku":"assets/products/real-murukku.webp",
    "navratan-mixture":"assets/products/real-navratan-mixture.webp",
    "kala-jamun":"assets/products/real-kala-jamun.webp",
    "sev-bhujiya":"assets/products/44-sev-bhujiya.webp",
    "jalebi":"assets/products/49-jalebi.webp",
    "besan-laddu":"assets/products/50-besan-laddu.webp",
    "kaju-katli":"assets/products/51-kaju-katli.webp",
    "gujiya":"assets/products/real-gujiya.webp"
  };
  // Optional per-product prices in EUR (fill when Siri provides); missing => "on request".
  var PRICES = {};
  // ---- Ingredients per product (Zutaten), sourced from Siri's official product sheets ----
  var INGREDIENTS = {
    "gulab-jamun":{de:"Milchpulver, Weizenmehl, Zucker, Ghee (Butterfett), Pflanzenöl, Kardamom", en:"Milk powder, wheat flour, sugar, ghee (clarified butter), vegetable oil, cardamom"},
    "rasmalai":{de:"Milch, Zucker, Sahne, Pistazien, Mandeln, Kardamom", en:"Milk, sugar, cream, pistachios, almonds, cardamom"},
    "gajar-ka-halwa":{de:"Karotten, Milch, Zucker, Ghee (Butterfett), Cashewnüsse, Mandeln, Kardamom", en:"Carrots, milk, sugar, ghee (clarified butter), cashews, almonds, cardamom"},
    "mysore-pak":{de:"Zucker, Kichererbsenmehl (Besan), Ghee (Butterfett), Wasser", en:"Sugar, gram flour (besan), ghee (clarified butter), water"},
    "kalakand":{de:"Milch, Paneer (Frischkäse), Zucker, Kardamom, Pistazien", en:"Milk, paneer (fresh cheese), sugar, cardamom, pistachios"},
    "kova-jamun":{de:"Khoya (Milchfeststoffe), Weizenmehl, Zucker, Ghee (Butterfett), Kardamom, Pflanzenöl", en:"Khoya (milk solids), wheat flour, sugar, ghee (clarified butter), cardamom, vegetable oil"},
    "bundi-laddu":{de:"Kichererbsenmehl (Besan), Zucker, Ghee (Butterfett), Kardamom, Cashewnüsse, Rosinen", en:"Gram flour (besan), sugar, ghee (clarified butter), cardamom, cashews, raisins"},
    "murukku":{de:"Reismehl, Urad Dal Mehl (schwarzes Linsenmehl), Butter oder Öl, Salz, Sesam, Kreuzkümmel, Wasser", en:"Rice flour, urad dal flour (black lentil flour), butter or oil, salt, sesame, cumin, water"},
    "navratan-mixture":{de:"Kichererbsenmehl, Reismehl, Erdnüsse, Cashewnüsse, Curryblätter, Gewürze, Salz, Pflanzenöl", en:"Gram flour, rice flour, peanuts, cashews, curry leaves, spices, salt, vegetable oil"},
    "kala-jamun":{de:"Milchpulver, Weizenmehl, Zucker, Ghee (Butterfett), Pflanzenöl, Kardamom", en:"Milk powder, wheat flour, sugar, ghee (clarified butter), vegetable oil, cardamom"},
    "sev-bhujiya":{de:"Kichererbsenmehl (Besan), Pflanzenöl, Salz, Chili, Gewürze", en:"Gram flour (besan), vegetable oil, salt, chilli, spices"},
    "jalebi":{de:"Weizenmehl, Zucker, Wasser, Joghurt, Pflanzenöl, Safran, Kardamom", en:"Wheat flour, sugar, water, yoghurt, vegetable oil, saffron, cardamom"},
    "besan-laddu":{de:"Kichererbsenmehl (Besan), Zucker, Ghee (Butterfett), Kardamom, Cashewnüsse", en:"Gram flour (besan), sugar, ghee (clarified butter), cardamom, cashews"},
    "kaju-katli":{de:"Cashewnüsse (Kaju), Zucker, Wasser, Ghee (optional), Rosenwasser (optional)", en:"Cashews (kaju), sugar, water, ghee (optional), rose water (optional)"},
    "gujiya":{de:"Weizenmehl, Zucker, Khoya (Milchfeststoffe), Kokosraspeln, Mandeln, Cashewnüsse, Rosinen, Ghee (Butterfett), Kardamom", en:"Wheat flour, sugar, khoya (milk solids), grated coconut, almonds, cashews, raisins, ghee (clarified butter), cardamom"}
  };
  // ---- Nutrition per product (Durchschnittliche Naehrwerte), from Siri's label sheets. 14 values: energy,fat,saturates,carb,sugar,protein,salt x [per100, perPortion32g] ----
  var NUTRITION = {
    "gulab-jamun":["1800 kJ / 430 kcal","576 kJ / 138 kcal","18 g","5,8 g","8 g","2,6 g","60 g","19,2 g","45 g","14,4 g","6 g","1,9 g","0,25 g","0,08 g"],
    "rasmalai":["1450 kJ / 345 kcal","464 kJ / 110 kcal","15 g","4,8 g","9 g","2,9 g","42 g","13,4 g","38 g","12,2 g","8 g","2,6 g","0,2 g","0,06 g"],
    "gajar-ka-halwa":["1700 kJ / 405 kcal","544 kJ / 130 kcal","18 g","5,8 g","10 g","3,2 g","52 g","16,6 g","40 g","12,8 g","6 g","1,9 g","0,2 g","0,06 g"],
    "mysore-pak":["2300 kJ / 550 kcal","736 kJ / 176 kcal","35 g","11,2 g","20 g","6,4 g","50 g","16 g","35 g","11,2 g","8 g","2,6 g","0,2 g","0,06 g"],
    "kalakand":["1650 kJ / 395 kcal","528 kJ / 126 kcal","18 g","5,8 g","11 g","3,5 g","45 g","14,4 g","38 g","12,2 g","10 g","3,2 g","0,2 g","0,06 g"],
    "kova-jamun":["1850 kJ / 440 kcal","592 kJ / 141 kcal","20 g","6,4 g","10 g","3,2 g","58 g","18,6 g","45 g","14,4 g","7 g","2,2 g","0,2 g","0,06 g"],
    "bundi-laddu":["2100 kJ / 500 kcal","672 kJ / 160 kcal","25 g","8 g","12 g","3,8 g","60 g","19,2 g","40 g","12,8 g","8 g","2,6 g","0,2 g","0,06 g"],
    "murukku":["2175 kJ / 520 kcal","696 kJ / 166 kcal","30 g","9,6 g","10 g","3,2 g","55 g","17,6 g","2 g","0,6 g","7 g","2,2 g","1,2 g","0,38 g"],
    "navratan-mixture":["2250 kJ / 540 kcal","720 kJ / 173 kcal","34 g","10,9 g","8 g","2,6 g","45 g","14,4 g","5 g","1,6 g","12 g","3,8 g","1,5 g","0,48 g"],
    "kala-jamun":["1850 kJ / 440 kcal","592 kJ / 141 kcal","20 g","6,4 g","10 g","3,2 g","58 g","18,6 g","45 g","14,4 g","7 g","2,2 g","0,2 g","0,06 g"],
    "sev-bhujiya":["2250 kJ / 540 kcal","720 kJ / 173 kcal","34 g","10,9 g","8 g","2,6 g","45 g","14,4 g","5 g","1,6 g","12 g","3,8 g","1,5 g","0,48 g"],
    "jalebi":["1900 kJ / 455 kcal","608 kJ / 146 kcal","15 g","4,8 g","3 g","1 g","75 g","24 g","50 g","16 g","4 g","1,3 g","0,3 g","0,1 g"],
    "besan-laddu":["2100 kJ / 500 kcal","672 kJ / 160 kcal","28 g","9 g","14 g","4,5 g","52 g","16,6 g","35 g","11,2 g","10 g","3,2 g","0,2 g","0,06 g"],
    "kaju-katli":["2100 kJ / 500 kcal","672 kJ / 160 kcal","28 g","9 g","5 g","1,6 g","55 g","17,6 g","40 g","12,8 g","10 g","3,2 g","0,1 g","0,03 g"],
    "gujiya":["2050 kJ / 490 kcal","656 kJ / 157 kcal","24 g","7,7 g","11 g","3,5 g","60 g","19,2 g","32 g","10,2 g","8 g","2,6 g","0,3 g","0,1 g"]
  };
  window.ATHIDHI_SWEETS = {PRODUCTS:PRODUCTS, IMAGES:IMAGES, PRICES:PRICES, INGREDIENTS:INGREDIENTS, NUTRITION:NUTRITION};

  function lang(){ return document.documentElement.getAttribute("lang") || "de"; }
  function t(de,en){ return lang()==="en" ? en : de; }

  // ---- language ----
  function applyLang(l){
    document.documentElement.setAttribute("lang", l);
    document.querySelectorAll("[data-de]").forEach(function(el){
      var v=el.getAttribute("data-"+l); if(v!==null) el.textContent=v;
    });
    document.querySelectorAll(".lang button").forEach(function(b){
      b.classList.toggle("active", b.getAttribute("data-lang")===l);
    });
    try{ localStorage.setItem(LANG_STORE,l); }catch(e){}
    renderShop(); renderCart();
  }
  function initLang(){
    var saved; try{ saved=localStorage.getItem(LANG_STORE); }catch(e){}
    var q=(location.search.match(/[?&]lang=(de|en)/)||[])[1];
    applyLang(q||(saved==="en"?"en":"de"));
    document.querySelectorAll(".lang button").forEach(function(b){
      b.addEventListener("click", function(){ applyLang(b.getAttribute("data-lang")); });
    });
  }

  // ---- nav ----
  function initNav(){
    var burger=document.querySelector(".hamburger"), links=document.querySelector(".nav-links");
    if(burger&&links) burger.addEventListener("click", function(){ links.classList.toggle("open"); });
    if(links) links.addEventListener("click", function(e){ if(e.target.tagName==="A") links.classList.remove("open"); });
  }

  // ---- cart store ----
  function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_STORE)||"{}"); }catch(e){ return {}; } }
  function saveCart(c){ try{ localStorage.setItem(CART_STORE, JSON.stringify(c)); }catch(e){} renderBadge(); }
  function cartCount(){ var c=getCart(),n=0; for(var k in c) n+=c[k]; return n; }
  function addToCart(id,qty){ var c=getCart(); c[id]=(c[id]||0)+(qty||1); if(c[id]<1) delete c[id]; saveCart(c); }
  function setQty(id,qty){ var c=getCart(); if(qty<1) delete c[id]; else c[id]=qty; saveCart(c); renderCart(); }
  function removeFromCart(id){ var c=getCart(); delete c[id]; saveCart(c); renderCart(); }
  function prod(id){ for(var i=0;i<PRODUCTS.length;i++) if(PRODUCTS[i].id===id) return PRODUCTS[i]; return null; }
  function priceStr(id){ var p=PRICES[id]; return (typeof p==="number") ? "€"+p.toFixed(2) : null; }

  function renderBadge(){
    var el=document.querySelector(".cart-count"); if(!el) return;
    var n=cartCount(); el.textContent=n; el.setAttribute("data-empty", n>0?"0":"1");
  }

  // ---- shop grid ----
  function currentFilter(){ var b=document.querySelector(".shop-filters button.active"); return b?b.getAttribute("data-filter"):"all"; }
  function nutritionHtml(id){
    var d=NUTRITION[id]; if(!d) return "";
    var rows=[
      [t("Energie","Energy"), d[0], d[1]],
      [t("Fett","Fat"), d[2], d[3]],
      [t("davon gesättigte Fettsäuren","of which saturates"), d[4], d[5]],
      [t("Kohlenhydrate","Carbohydrate"), d[6], d[7]],
      [t("davon Zucker","of which sugars"), d[8], d[9]],
      [t("Eiweiß","Protein"), d[10], d[11]],
      [t("Salz","Salt"), d[12], d[13]]
    ];
    var body="";
    for(var i=0;i<rows.length;i++){
      body+='<tr><th scope="row">'+rows[i][0]+'</th><td>'+rows[i][1]+'</td><td>'+rows[i][2]+'</td></tr>';
    }
    return '<div class="pnut-in"><table class="pnut-t">'
      +'<tr class="pnut-h"><th scope="col">'+t("Durchschnittliche Nährwerte","Average nutritional values")+'</th>'
      +'<th scope="col">'+t("je 100 g","per 100 g")+'</th><th scope="col">'+t("pro Portion 32 g","per portion 32 g")+'</th></tr>'
      +body+'</table></div>';
  }
  function wireGallery(card){
    var gal=card.querySelector(".pgallery"); if(!gal) return;
    var slides=gal.querySelector(".pslides");
    var dots=gal.querySelectorAll(".pdot");
    var n=slides.children.length; if(n<2) return;
    var idx=0;
    function go(i){ idx=Math.max(0,Math.min(n-1,i)); slides.style.transform="translateX("+(-idx*100)+"%)";
      for(var k=0;k<dots.length;k++) dots[k].classList.toggle("active",k===idx); gal.classList.toggle("nutview", idx>0); }
    dots.forEach(function(dt,i){ dt.addEventListener("click",function(e){ e.preventDefault(); e.stopPropagation(); go(i); }); });
    var prev=gal.querySelector(".pnav.prev"), next=gal.querySelector(".pnav.next");
    if(prev) prev.addEventListener("click",function(e){ e.preventDefault(); e.stopPropagation(); go(idx-1); });
    if(next) next.addEventListener("click",function(e){ e.preventDefault(); e.stopPropagation(); go(idx+1); });
    var x0=null;
    gal.addEventListener("touchstart",function(e){ x0=e.touches[0].clientX; },{passive:true});
    gal.addEventListener("touchend",function(e){ if(x0===null) return; var dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>30) go(idx+(dx<0?1:-1)); x0=null; },{passive:true});
  }

  function renderShop(){
    var grid=document.querySelector(".shop-grid"); if(!grid) return;
    var f=currentFilter();
    grid.innerHTML="";
    var lim=parseInt(grid.getAttribute("data-limit"),10);
    var list=PRODUCTS.filter(function(p){ return f==="all"||p.cat===f; });
    if(lim>0) list=list.slice(0,lim);
    list.forEach(function(p){
      var img=IMAGES[p.id], price=priceStr(p.id);
      var card=document.createElement("article"); card.className="pcard";
      var photoSlide = img
        ? '<div class="pslide pimg" style="background-image:url(\''+img+'\')"></div>'
        : '<div class="pslide pimg ph"><div class="ph-in"><div class="mk">'+p.name+'</div><div class="s">'+t("Foto folgt","Photo coming")+'</div></div></div>';
      var hasNut = !!NUTRITION[p.id];
      var nutSlide = hasNut ? '<div class="pslide pnut">'+nutritionHtml(p.id)+'</div>' : '';
      var dots = hasNut ? '<div class="pdots"><button type="button" class="pdot active" aria-label="'+t("Foto","Photo")+'"></button><button type="button" class="pdot" aria-label="'+t("Nährwerte","Nutrition")+'"></button></div>' : '';
      var navs = hasNut ? '<button type="button" class="pnav prev" aria-label="'+t("Zurück","Previous")+'">\u2039</button><button type="button" class="pnav next" aria-label="'+t("Weiter","Next")+'">\u203a</button>' : '';
      var imgHtml = '<div class="pgallery"><div class="pslides">'+photoSlide+nutSlide+'</div>'+dots+navs+'</div>';
      var tag = p.cat==="snacks" ? t("Snack","Snack") : t("Süßigkeit","Sweet");
      var priceHtml = price
        ? '<span class="pprice">'+price+'</span>'
        : '<span class="pprice">'+t("Auf Anfrage","On request")+' <small>'+t("Preis folgt","price coming")+'</small></span>';
      card.innerHTML =
        imgHtml
        + '<div class="pbody">'
        + '<h3>'+p.name+'</h3>'
        + '<p class="pdesc">'+t(p.de,p.en)+'</p>'
        + (INGREDIENTS[p.id] ? '<p class="ping" style="font-size:11.5px;line-height:1.5;color:#9a7f66;margin:7px 0 0"><span style="color:#7a5c3f;font-weight:600">'+t("Zutaten","Ingredients")+':</span> '+t(INGREDIENTS[p.id].de,INGREDIENTS[p.id].en)+'</p>' : '')
        + '<div class="pmeta"><span class="pweight">'+p.w+'</span>'+priceHtml+'</div>'
        + '<div class="add-row"><div class="qty"><button type="button" data-dec>-</button>'
        + '<input type="number" min="1" value="1" aria-label="Qty"><button type="button" data-inc>+</button></div>'
        + '<button class="add-btn" type="button">'+t("In den Warenkorb","Add to cart")+'</button></div>'
        + '</div>';
      // add tag onto image
      var galEl=card.querySelector(".pgallery"); var tg=document.createElement("span"); tg.className="ptag"; tg.textContent=tag; galEl.appendChild(tg);
      wireGallery(card);
      var input=card.querySelector(".qty input");
      card.querySelector("[data-dec]").addEventListener("click", function(){ input.value=Math.max(1,(parseInt(input.value,10)||1)-1); });
      card.querySelector("[data-inc]").addEventListener("click", function(){ input.value=(parseInt(input.value,10)||1)+1; });
      card.querySelector(".add-btn").addEventListener("click", function(){
        addToCart(p.id, Math.max(1,parseInt(input.value,10)||1));
        var b=card.querySelector(".add-btn"); var o=b.textContent; b.textContent=t("Hinzugefügt ✓","Added ✓");
        setTimeout(function(){ b.textContent=t("In den Warenkorb","Add to cart"); }, 1100);
      });
      grid.appendChild(card);
    });
  }
  function initFilters(){
    document.querySelectorAll(".shop-filters button").forEach(function(b){
      b.addEventListener("click", function(){
        document.querySelectorAll(".shop-filters button").forEach(function(x){ x.classList.remove("active"); });
        b.classList.add("active"); renderShop();
      });
    });
  }

  // ---- cart page ----
  function renderCart(){
    var wrap=document.querySelector(".cart-items"); if(!wrap) return;
    var c=getCart(), ids=Object.keys(c);
    var sumEl=document.querySelector(".cart-summary");
    if(!ids.length){
      wrap.innerHTML='<div class="cart-empty">'+t("Ihr Warenkorb ist leer.","Your cart is empty.")+'</div>';
      if(sumEl) sumEl.style.display="none";
      return;
    }
    if(sumEl) sumEl.style.display="flex";
    wrap.innerHTML="";
    var total=0, allPriced=true;
    ids.forEach(function(id){
      var p=prod(id); if(!p) return; var qty=c[id]; var price=PRICES[id];
      if(typeof price==="number") total+=price*qty; else allPriced=false;
      var row=document.createElement("div"); row.className="cart-item";
      var thumb=IMAGES[id]?' style="background-image:url(\''+IMAGES[id]+'\')"':'';
      var lineprice = typeof price==="number" ? "€"+(price*qty).toFixed(2) : t("Auf Anfrage","On request");
      row.innerHTML=
        '<div class="ci-thumb"'+thumb+'></div>'
        +'<div class="ci-main"><h4>'+p.name+'</h4><div class="ci-w">'+p.w+'</div>'
        +'<div class="qty" style="margin-top:8px"><button type="button" data-dec>-</button>'
        +'<input type="number" min="1" value="'+qty+'" aria-label="Qty"><button type="button" data-inc>+</button></div></div>'
        +'<div class="ci-price">'+lineprice+'</div>'
        +'<button class="ci-remove" type="button">'+t("Entfernen","Remove")+'</button>';
      var input=row.querySelector(".qty input");
      row.querySelector("[data-dec]").addEventListener("click", function(){ setQty(id, Math.max(1,(parseInt(input.value,10)||1)-1)); });
      row.querySelector("[data-inc]").addEventListener("click", function(){ setQty(id,(parseInt(input.value,10)||1)+1); });
      input.addEventListener("change", function(){ setQty(id, Math.max(1,parseInt(input.value,10)||1)); });
      row.querySelector(".ci-remove").addEventListener("click", function(){ removeFromCart(id); });
      wrap.appendChild(row);
    });
    var stEl=document.querySelector(".subtotal");
    if(stEl){
      stEl.innerHTML = allPriced
        ? t("Zwischensumme: ","Subtotal: ")+'<span>€'+total.toFixed(2)+'</span>'
        : t("Zwischensumme: ","Subtotal: ")+'<span>'+t("wird berechnet","calculated at checkout")+'</span>';
    }
  }
  function initCheckout(){
    var btn=document.querySelector(".checkout-btn"); if(!btn) return;
    btn.addEventListener("click", function(){
      var ids=Object.keys(getCart()); if(!ids.length){ return; }
      if(!CHECKOUT_ENDPOINT){
        var msg=document.querySelector(".checkout-msg");
        if(msg) msg.textContent=t(
          "Bezahlung wird in Kürze aktiviert (Apple Pay, PayPal, Karte). Wir richten die Zahlung gerade ein.",
          "Payment is being set up (Apple Pay, PayPal, card) and will be enabled shortly."
        );
        return;
      }
      var items=[]; var c=getCart(); for(var k in c) items.push({id:k, qty:c[k]});
      fetch(CHECKOUT_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:items, lang:lang()})})
        .then(function(r){ return r.json(); })
        .then(function(d){ if(d && d.url) window.location.href=d.url; })
        .catch(function(){});
    });
  }

  function init(){
    initLang(); initNav(); initFilters(); renderShop(); renderCart(); initCheckout(); renderBadge();
    var yr=document.getElementById("yr"); if(yr) yr.textContent=new Date().getFullYear();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
