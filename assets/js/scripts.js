(function(){
  "use strict";

  /* ========== 圖示庫 ========== */
  var ICONS = {
    cbct:'<path d="M11 16V11h5M32 11h5v5M37 32v5h-5M16 37h-5v-5"/><path d="M24 17c-3 0-5 2-5.5 4.5-.6 3 0 6.5 1.2 9.5.6 1.6 1.2 2 1.8 2 1 0 1.2-1.8 1.7-3.6.3-1.1 1.6-1.1 1.9 0 .5 1.8.8 3.6 1.7 3.6.7 0 1.2-.4 1.8-2 1.2-3 1.8-6.5 1.2-9.5C29 19 27 17 24 17Z"/>',
    scan:'<rect x="9" y="28" width="22" height="9" rx="4.5" transform="rotate(-32 20 32)"/><path d="M30 19l5-5M33 24l4-4M30 14.5l3.5 3.5"/>',
    target:'<circle cx="24" cy="24" r="13"/><circle cx="24" cy="24" r="6"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6"/>',
    dsd:'<rect x="8" y="11" width="32" height="22" rx="3"/><path d="M16 22c2.5 4 13.5 4 16 0"/><path d="M20 37h8M24 33v4"/>',
    micro:'<path d="M19 11l6 4-7 11-6-4z"/><path d="M21 28c4 3 9 2 12-2"/><path d="M14 38h22M24 38v-6"/>',
    implant:'<path d="M24 9c-4 0-6.5 2.5-7.2 5.5-.5 2.2-.1 4 .7 5.5h13c.8-1.5 1.2-3.3.7-5.5C30.5 11.5 28 9 24 9Z"/><path d="M20 21l1.5 6h5L28 21M21.5 27l1 5h3l1-5M23 32l.6 5h.8l.6-5"/>',
    aligner:'<path d="M24 12c-4.5 0-7.5 3-8.5 7-.8 3.2-.3 7 .8 10h15.4c1.1-3 1.6-6.8.8-10-1-4-4-7-8.5-7Z"/><path d="M19 14c-2 1.5-3.2 4-3.7 6.5"/>',
    veneer:'<path d="M22 13c-4 0-6.5 2.5-7.2 5.8-.7 3.6 0 8 1.4 11.6.7 1.9 1.4 2.4 2.1 2.4 1.2 0 1.4-2.2 2-4.4.4-1.3 1.9-1.3 2.3 0 .6 2.2.9 4.4 2 4.4.8 0 1.5-.5 2.2-2.4.4-1 .7-2.1 1-3.2"/>',
    crown:'<path d="M14 20l3 4 3.5-5 3.5 5 3.5-5 3.5 5 3-4"/><path d="M16 21c-1 4-.5 8 .8 11.5.6 1.7 1.3 2 1.9 2 1 0 1.3-1.8 1.8-3.6.3-1.1 1.6-1.1 1.9 0 .5 1.8.8 3.6 1.8 3.6.6 0 1.3-.3 1.9-2C29.5 29 30 25 29 21"/>',
    arch:'<path d="M10 16c0 12 5 20 14 20s14-8 14-20"/><path d="M14 18v4M19 16v4M24 15v4M29 16v4M34 18v4"/>',
    root:'<path d="M24 10c-4.5 0-7 2.5-7.8 5.8-.8 3.6-.2 8 1.2 12 .7 2 1.4 4 2.2 6 .5 1.3 1.4 1.3 1.7 0 .4-1.8.6-4.4.7-7M24 10c4.5 0 7 2.5 7.8 5.8.8 3.6.2 8-1.2 12-.7 2-1.4 4-2.2 6-.5 1.3-1.4 1.3-1.7 0-.4-1.8-.6-4.4-.7-7"/><path d="M24 17v14"/>',
    perio:'<path d="M24 12c-4 0-6.5 2.5-7.2 5.8-.5 2.4-.2 5.2.5 7.7M24 12c4 0 6.5 2.5 7.2 5.8.5 2.4.2 5.2-.5 7.7"/><path d="M13 30c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 7 0"/><path d="M19 25l1 6M28 25l-1 6"/>'
  };
  function svgIcon(name, cls){
    var p = ICONS[name] || ICONS.target;
    return '<svg class="'+cls+'" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
  }
  function parseJSON(str){ try{ return JSON.parse(str); }catch(e){ return []; } }

  /* ========== 條列：data-list 以換行轉成 li/span ========== */
  function renderLists(){
    document.querySelectorAll('ul[data-list]').forEach(function(ul){
      var raw = ul.getAttribute('data-list') || '';
      raw.split(/\r?\n/).forEach(function(line){
        line = line.trim(); if(!line) return;
        var li = document.createElement('li'); li.textContent = line; ul.appendChild(li);
      });
    });
    document.querySelectorAll('.hours[data-list]').forEach(function(box){
      var raw = box.getAttribute('data-list') || '';
      raw.split(/\r?\n/).forEach(function(line){
        line = line.trim(); if(!line) return;
        var s = document.createElement('span'); s.textContent = line; box.appendChild(s);
      });
    });
  }

  /* ========== 設備分頁 ========== */
  function renderTech(){
    var wrap = document.getElementById('techWrap'); if(!wrap) return;
    var items = parseJSON(wrap.getAttribute('data-items')); if(!items.length) return;
    var list = document.getElementById('techList'), panel = document.getElementById('techPanel');
    items.forEach(function(it, i){
      var b = document.createElement('button');
      b.className = 'tech-tab' + (i===0?' active':''); b.dataset.idx = i;
      b.innerHTML = '<span class="n">'+it.name+'</span><span class="e">'+(it.en||'')+'</span>';
      list.appendChild(b);
      var pts = (it.points||'').split(/[｜|]/).filter(Boolean).map(function(p){return '<span>'+p.trim()+'</span>';}).join('');
      var pan = document.createElement('div');
      pan.className = 'panel' + (i===0?' show':''); pan.dataset.idx = i;
      pan.innerHTML = svgIcon(it.icon,'picon')+'<h3>'+it.name+'</h3><div class="pen">'+(it.en||'')+'</div><p>'+(it.desc||'')+'</p>'+(pts?'<div class="pts">'+pts+'</div>':'');
      panel.appendChild(pan);
    });
    list.addEventListener('click', function(e){
      var b = e.target.closest('.tech-tab'); if(!b) return;
      list.querySelectorAll('.tech-tab').forEach(function(x){x.classList.remove('active');});
      panel.querySelectorAll('.panel').forEach(function(p){p.classList.remove('show');});
      b.classList.add('active');
      var el = panel.querySelector('.panel[data-idx="'+b.dataset.idx+'"]');
      if(el){ void el.offsetWidth; el.classList.add('show'); }
    });
  }

  /* ========== 療程卡牆 + 篩選 ========== */
  function renderServices(){
    var grid = document.getElementById('svcGrid'); if(!grid) return;
    var items = parseJSON(grid.getAttribute('data-items')); if(!items.length) return;
    var chips = document.getElementById('svcChips');
    var cats = [], seen = {};
    items.forEach(function(it){ if(it.cat && !seen[it.cat]){ seen[it.cat]=1; cats.push({cat:it.cat, name:it.catName||it.cat}); } });
    var chipHtml = '<button class="chip active" data-filter="all">全部</button>';
    cats.forEach(function(c){ chipHtml += '<button class="chip" data-filter="'+c.cat+'">'+c.name+'</button>'; });
    chips.innerHTML = chipHtml;
    items.forEach(function(it){
      var card = document.createElement('div');
      card.className = 'card anim'; card.dataset.cat = it.cat || '';
      var url = (it.url || '').trim();
      var inner = svgIcon(it.icon,'cicon')+'<h4>'+it.name+'</h4><div class="cen">'+(it.en||'')+'</div><p>'+(it.desc||'')+'</p>';
      if(url){
        card.classList.add('card-link');
        card.innerHTML = '<a class="card-a" href="'+url+'">'+inner+'<span class="more">了解更多 →</span></a>';
      } else {
        card.innerHTML = inner;
      }
      grid.appendChild(card);
    });
    chips.addEventListener('click', function(e){
      var c = e.target.closest('.chip'); if(!c) return;
      chips.querySelectorAll('.chip').forEach(function(x){x.classList.remove('active');});
      c.classList.add('active');
      var f = c.dataset.filter;
      grid.querySelectorAll('.card').forEach(function(card){
        var m = (f==='all' || card.dataset.cat===f);
        card.style.display = m ? '' : 'none';
        if(m){ card.classList.remove('anim'); void card.offsetWidth; card.classList.add('anim'); }
      });
    });
  }

  /* ========== 行動選單 ========== */
  function initMenu(){
    var ham = document.getElementById('hamburger'); if(!ham) return;
    var nav = document.querySelector('.site-nav nav');
    ham.addEventListener('click', function(){
      if(!nav) return;
      var open = nav.classList.toggle('open');
      ham.setAttribute('aria-expanded', open);
    });
  }

  /* ========== 動態時序 Header ========== */
  function initHeader(){
    var hdr = document.getElementById('hdr'); if(!hdr) return;
    var dynamic = hdr.getAttribute('data-dynamic') === '1';
    var meteorOn = hdr.getAttribute('data-meteor') === '1';
    var tags = {
      day: hdr.getAttribute('data-tag-day') || '',
      morning: hdr.getAttribute('data-tag-morning') || '',
      evening: hdr.getAttribute('data-tag-evening') || '',
      night: hdr.getAttribute('data-tag-night') || ''
    };
    var keys=[{t:0,top:'#0a0e27',bot:'#16203f'},{t:5,top:'#1a2151',bot:'#46406b'},{t:6,top:'#4a5a8a',bot:'#e8956b'},{t:7,top:'#7ba7d4',bot:'#f4c07a'},{t:9,top:'#5b9bd5',bot:'#aed0f0'},{t:12,top:'#3d7fc4',bot:'#9fcdf2'},{t:15,top:'#5b9bd5',bot:'#bcdcf5'},{t:17,top:'#6b8cae',bot:'#f4b46a'},{t:18.5,top:'#8a6a9a',bot:'#e8805b'},{t:20,top:'#3d3b6b',bot:'#7a4a6b'},{t:21,top:'#1a2151',bot:'#3d3b6b'},{t:24,top:'#0a0e27',bot:'#16203f'}];
    function hx(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
    function mix(a,b,f){var A=hx(a),B=hx(b);return'rgb('+A.map(function(v,i){return Math.round(v+(B[i]-v)*f);}).join(',')+')';}
    function lerp(a,b,f){return Math.round(a+(b-a)*f);}
    function sky(h){for(var i=0;i<keys.length-1;i++){if(h>=keys[i].t&&h<=keys[i+1].t){var f=(h-keys[i].t)/(keys[i+1].t-keys[i].t);return[mix(keys[i].top,keys[i+1].top,f),mix(keys[i].bot,keys[i+1].bot,f)];}}return[keys[0].top,keys[0].bot];}
    function darkness(h){if(h>=21||h<4)return 1;if(h>=4&&h<7)return(7-h)/3;if(h>=18&&h<21)return(h-18)/3;return 0;}
    function gauss(x,mu,sig){var d=x-mu;return Math.exp(-(d*d)/(2*sig*sig));}
    function golden(h){return Math.min(1,Math.max(gauss(h,6.9,1.1),gauss(h,18,1.25)));}
    function phaseName(h){if(h<4.5)return'星夜';if(h<6.5)return'晨曦';if(h<11)return'晨間';if(h<13.5)return'正午';if(h<16.5)return'午後';if(h<18.5)return'黃昏';if(h<20.5)return'暮色';return'星夜';}
    function tagline(h){if(h>=19||h<5)return tags.night;if(h<11)return tags.morning;if(h<17)return tags.day;return tags.evening;}

    var cel=document.getElementById('celestial'),glow=document.getElementById('glow'),haze=document.getElementById('haze'),
        starBox=document.getElementById('stars'),cloudBox=document.getElementById('clouds'),clock=document.getElementById('clock'),
        phase=document.getElementById('phase'),tagEl=document.getElementById('tag'),slider=document.getElementById('slider'),
        reset=document.getElementById('reset');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    if(starBox){ for(var i=0;i<58;i++){var s=document.createElement('div');s.className='star';var sz=Math.random()*2.2+0.8;s.style.width=sz+'px';s.style.height=sz+'px';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*58+'%';s.style.animationDuration=(2.4+Math.random()*3)+'s';s.style.animationDelay=(Math.random()*4)+'s';if(sz>2.4){s.style.boxShadow='0 0 4px 1px rgba(255,255,255,.7)';}starBox.appendChild(s);} }
    if(cloudBox){ [[130,42,'9%',62],[190,54,'21%',96],[150,46,'15%',78]].forEach(function(c){var el=document.createElement('div');el.className='cloud';el.style.width=c[0]+'px';el.style.height=c[1]+'px';el.style.top=c[2];el.style.animationDuration=c[3]+'s';el.style.animationDelay=(-Math.random()*c[3])+'s';cloudBox.appendChild(el);}); }

    function maybeMeteor(d){if(!meteorOn||reduce||d<0.85||Math.random()>0.22||!starBox)return;var m=document.createElement('div');m.className='meteor';m.style.left=(Math.random()*55+10)+'%';m.style.top=(Math.random()*30+5)+'%';m.style.animation='shoot 1.1s ease-out forwards';starBox.appendChild(m);setTimeout(function(){m.remove();},1300);}

    var live=true;
    function render(h){
      var sk=sky(h); hdr.style.background='linear-gradient('+sk[0]+','+sk[1]+')';
      var d=darkness(h),g=golden(h);
      if(starBox)starBox.style.opacity=d.toFixed(2);
      if(cloudBox)cloudBox.style.opacity=((1-d)*0.9).toFixed(2);
      if(haze)haze.style.opacity=((1-d)*0.8).toFixed(2);
      var isMoon=(h>=19||h<6),p,visible;
      if(!isMoon){p=(h-5.8)/(18.7-5.8);visible=(p>=0&&p<=1);}else{var nh=((h-19+24)%24);p=nh/11;visible=true;}
      p=Math.max(0,Math.min(1,p));
      if(glow){glow.style.opacity=(g*0.85).toFixed(2);glow.style.background='radial-gradient(ellipse 60% 70% at '+(p*100).toFixed(0)+'% 100%,rgba(255,150,80,.9),rgba(255,150,80,0) 70%)';}
      if(cel){ if(isMoon){cel.style.background='#eef1f5';cel.style.boxShadow='0 0 38px 10px rgba(220,228,245,.42)';}else{var r=255,gg=lerp(228,150,g),b=lerp(150,80,g);cel.style.background='rgb('+lerp(255,255,g)+','+lerp(247,205,g)+','+lerp(224,150,g)+')';cel.style.boxShadow='0 0 '+lerp(58,82,g)+'px '+lerp(16,26,g)+'px rgba('+r+','+gg+','+b+',.6)';}
        cel.style.opacity=visible?1:0;cel.style.left=(p*100)+'%';cel.style.top=(74-Math.sin(p*Math.PI)*60)+'%'; }
      if(phase)phase.textContent=phaseName(h);
      if(tagEl){var t=tagline(h);if(t)tagEl.textContent=t;}
      var hh=Math.floor(h),mm=Math.floor((h-hh)*60);
      if(clock)clock.textContent=(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
    }
    function nowH(){var n=new Date();return n.getHours()+n.getMinutes()/60+n.getSeconds()/3600;}
    function tick(){var h=live?nowH():(slider?slider.value/60:12);if(live&&slider){slider.value=Math.round(h*60);}render(h);maybeMeteor(darkness(h));}

    if(!dynamic){ render(12); return; }
    if(slider){slider.addEventListener('input',function(){live=false;if(reset)reset.classList.add('show');render(slider.value/60);});}
    if(reset){reset.addEventListener('click',function(){live=true;reset.classList.remove('show');tick();});}
    tick(); setInterval(tick,1000);
  }

  /* ========== 文章數量截斷 ========== */
  function limitArticles(){
    var grid = document.getElementById('artGrid'); if(!grid) return;
    var limit = parseInt(grid.getAttribute('data-limit'), 10); if(!limit) return;
    var arts = grid.querySelectorAll('.art');
    arts.forEach(function(a, i){ if(i >= limit) a.style.display = 'none'; });
  }

  /* ========== 線上預約按鈕行為 ========== */
  function initBooking(){
    var btn = document.getElementById('navBook'); if(!btn) return;
    var action = btn.getAttribute('data-action') || 'line';
    var line = btn.getAttribute('data-line') || '';
    var phone = (btn.getAttribute('data-phone') || '').replace(/[^0-9+]/g,'');
    if(action === 'phone' && phone){ btn.href = 'tel:' + phone; }
    else if(action === 'url'){ btn.href = btn.getAttribute('data-url') || '#'; }
    else if(line){ btn.href = line; btn.target = '_blank'; btn.rel = 'noopener'; }
  }

  /* ========== 右下角浮動 CTA ========== */
  function initFloatCta(){
    var box = document.getElementById('floatCta'); if(!box) return;
    var lineOn = box.getAttribute('data-line-on') === '1';
    var phoneOn = box.getAttribute('data-phone-on') === '1';
    var line = box.getAttribute('data-line') || '';
    var phone = (box.getAttribute('data-phone') || '').replace(/[^0-9+]/g,'');
    var html = '';
    if(lineOn && line){
      html += '<a class="fcta-btn fcta-line" href="'+line+'" target="_blank" rel="noopener" aria-label="加 LINE 好友">'
            + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11.1c0 4 3.6 7.4 8.5 8 .3.07.7.2.8.5.1.25.07.6.04.85l-.13.8c-.04.25-.2.95.84.52 1.04-.44 5.6-3.3 7.64-5.65C21.3 14.6 22 13 22 11.1 22 6.6 17.5 3 12 3Z" fill="currentColor"/></svg>'
            + '<span>LINE 預約</span></a>';
    }
    if(phoneOn && phone){
      html += '<a class="fcta-btn fcta-phone" href="tel:'+phone+'" aria-label="撥打專線">'
            + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A14 14 0 013 6a2 2 0 012-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
            + '<span>來電諮詢</span></a>';
    }
    box.innerHTML = html;
  }

  /* ========== 固定模式療程卡圖示填充 ========== */
  function fillServiceIcons(){
    document.querySelectorAll('.cicon-slot[data-icon]').forEach(function(slot){
      var name = slot.getAttribute('data-icon');
      var wrap = document.createElement('span');
      wrap.innerHTML = svgIcon(name, 'cicon');
      var svg = wrap.firstChild;
      if(svg) slot.parentNode.replaceChild(svg, slot);
    });
  }

  /* ========== 跨頁錨點捷跑 ========== */
  function initAnchorJump(){
    var home = (document.body.getAttribute('data-home-url') || '').replace(/\/+$/, '');
    document.addEventListener('click', function(e){
      var a = e.target.closest('a'); if(!a) return;
      var href = a.getAttribute('href') || '';
      if(href.charAt(0) !== '#' || href.length < 2) return;
      var target = document.getElementById(href.slice(1));
      if(target){
        // 本頁有此錨點 → 平滑捲動
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth'});
        // 收起行動選單
        var nav = document.querySelector('.site-nav nav');
        if(nav) nav.classList.remove('open');
      } else {
        // 本頁沒有 → 導向首頁對應錨點
        e.preventDefault();
        window.location.href = home + '/' + href;
      }
    });
  }

  /* ========== 聯絡頁地圖 ========== */
  function initContactMap(){
    var box = document.getElementById('contactMap'); if(!box) return;
    var addr = (box.getAttribute('data-addr') || '').trim(); if(!addr) return;
    var iframe = document.createElement('iframe');
    iframe.title = '診所位置地圖';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(addr) + '&output=embed';
    box.appendChild(iframe);
  }

  /* ========== 中文摘要字數截斷 ========== */
  function trimExcerpts(){
    var limit = parseInt(document.body.getAttribute('data-excerpt-limit'), 10) || 40;
    document.querySelectorAll('.excerpt').forEach(function(el){
      var txt = (el.textContent || '').trim();
      if(txt.length > limit){
        el.textContent = txt.slice(0, limit) + '…';
      }
    });
  }

  /* ========== 啟動 ========== */
  function init(){ renderLists(); renderTech(); renderServices(); fillServiceIcons(); limitArticles(); trimExcerpts(); initBooking(); initFloatCta(); initMenu(); initAnchorJump(); initContactMap(); initHeader(); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
