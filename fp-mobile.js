/* ===== fp-mobile.js : 独自レイアウトのツール（教育資金・変額年金・不動産・老後）用の
   モバイル共通挙動。fp-deck.js を使わないツールに読み込ませる。
   ① 入力欄以外での「左スワイプ」でトップ(index.html)へ戻る（全ツール共通）
   ② window.FP_RAILIZE=1 のとき、左サイドレールを上部の引き下ろしメニューへ変換
   （fp-deck.js 側にも同等の①②があり、二重初期化はガードで防止） ===== */
(function(){
  if(window.__fpMobile) return; window.__fpMobile=true;

  /* ---- ① 左スワイプでトップへ戻る（入力欄・ドロワー・横スクロール領域は除外） ---- */
  (function backSwipe(){
    if(window.__fpBackSwipe) return; window.__fpBackSwipe=true;
    var x0=0,y0=0,t0=0,armed=false;
    function skip(t){ return t && t.closest && t.closest('input,select,textarea,button,a,[contenteditable],.deck-input,.fab-input,.fp-pull,.chartwrap,.deck-scroll:not(.deck-vscroll)'); }
    window.addEventListener('touchstart',function(e){
      if(e.touches.length!==1){armed=false;return;}
      var t=e.touches[0]; x0=t.clientX; y0=t.clientY; t0=Date.now();
      var d=document.getElementById('deckInput');
      armed = !(d&&d.classList.contains('open')) && !skip(e.target);
    },{passive:true});
    window.addEventListener('touchend',function(e){
      if(!armed)return; armed=false;
      var t=e.changedTouches&&e.changedTouches[0]; if(!t)return;
      var dx=t.clientX-x0, dy=t.clientY-y0, dt=Date.now()-t0;
      if(dx<-95 && Math.abs(dx)>Math.abs(dy)*1.7 && dt<620){ location.href='index.html'; }
    },{passive:true});
  })();

  /* ---- 文字サイズ設定（fp:settings.fontScale）＝ページ全体を一律ズーム（全独自ツール共通） ---- */
  function applyFontScale(){
    var sc=1; try{ var o=JSON.parse(localStorage.getItem('fp:settings')||'{}'); if([1,1.25,1.5,1.75].indexOf(o.fontScale)>=0) sc=o.fontScale; }catch(e){}
    try{ document.documentElement.style.zoom=''; document.documentElement.style.removeProperty('--fp-vh'); }catch(e){}
    try{ document.documentElement.style.setProperty('--fp-scale', sc); }catch(e){}
    var z=(sc===1?'':sc);
    document.querySelectorAll('.deck-result .deck-scroll,.deck-input .deck-scroll,.deck-head,aside.side .side-tt,aside.side .side-eyebrow,aside.side .fp-sidebtns,aside.side .fpbar,aside.side .build-stamp').forEach(function(el){ el.style.zoom=z; });
  }
  window.addEventListener('storage',function(e){ if(e.key==='fp:settings') applyFontScale(); });
  window.addEventListener('resize',function(){ clearTimeout(window.__fpFsRz); window.__fpFsRz=setTimeout(applyFontScale,150); });
  if(document.readyState!=='loading') setTimeout(applyFontScale,80); else window.addEventListener('DOMContentLoaded',function(){setTimeout(applyFontScale,80);});

  /* ---- 入力ドロワーを上いっぱいまで拡張（全独自ツール共通） ---- */
  (function drawerTall(){
    if(document.getElementById('fpDrawerCSS')) return;
    var st=document.createElement('style'); st.id='fpDrawerCSS';
    st.textContent='@media (max-width:1024px){.deck-input{height:calc(100dvh - 34px)!important;max-height:none!important;}}';
    (document.head||document.documentElement).appendChild(st);
  })();

  /* ---- 細かい説明文を既定で隠し「❔説明」で表示（全独自ツール共通） ---- */
  function hintsOn(){ try{ return !!(JSON.parse(localStorage.getItem('fp:settings')||'{}').showHints); }catch(e){ return false; } }
  function syncHints(){ var on=hintsOn(); document.body.classList.toggle('fp-hints',on);
    document.querySelectorAll('.fp-hintbtn').forEach(function(b){ b.classList.toggle('on',on); b.textContent=on?'説明を隠す':'❔ 説明'; }); }
  function initHints(){
    if(!document.getElementById('fpHintsCSS')){
      var st=document.createElement('style'); st.id='fpHintsCSS';
      st.textContent='.hint,.fp-intro,.fp-sub,.deck-result .info,.field .q,.heircell .q{display:none!important;}'
        +'body.fp-hints .hint,body.fp-hints .fp-intro,body.fp-hints .fp-sub,body.fp-hints .deck-result .info{display:block!important;}'
        +'body.fp-hints .field .q,body.fp-hints .heircell .q{display:inline!important;}'
        +'.fp-hintbtn{margin-left:8px;font:600 11px var(--gothic,sans-serif);color:var(--brass-deep,#7d6240);background:#fcfbf8;border:1px solid var(--rule,#e3ddcf);border-radius:6px;padding:4px 10px;cursor:pointer;white-space:nowrap;flex:0 0 auto;}'
        +'.fp-hintbtn.on{background:var(--brass,#9a7b4f);color:#fff;border-color:var(--brass-deep,#7d6240);}'
        +'.fp-fontui{display:inline-flex;align-items:center;gap:0;margin-left:8px;flex:0 0 auto;}'
        +'.fp-fontbtn{font:700 12px var(--gothic,sans-serif);color:var(--ink,#1b2a4a);background:#fcfbf8;border:1px solid var(--rule,#e3ddcf);width:34px;height:30px;cursor:pointer;display:flex;align-items:center;justify-content:center;}'
        +'.fp-fontbtn:first-child{border-radius:7px 0 0 7px;}.fp-fontbtn:last-child{border-radius:0 7px 7px 0;border-left:none;}'
        +'.fp-fontbtn:active{background:var(--brass,#9a7b4f);color:#fff;}';
      document.head.appendChild(st);
    }
    var SC=[1,1.25,1.5,1.75];
    function curSc(){ try{ var v=JSON.parse(localStorage.getItem('fp:settings')||'{}').fontScale; return SC.indexOf(v)>=0?v:1; }catch(e){ return 1; } }
    function setSc(v){ try{ var o=JSON.parse(localStorage.getItem('fp:settings')||'{}'); o.fontScale=v; localStorage.setItem('fp:settings',JSON.stringify(o)); }catch(e){} applyFontScale(); }
    document.querySelectorAll('.deck .deck-head').forEach(function(head){
      if(head.querySelector('.fp-hintbtn')) return;
      var fu=document.createElement('span'); fu.className='fp-fontui';
      var mi=document.createElement('button'); mi.type='button'; mi.className='fp-fontbtn'; mi.textContent='A−'; mi.title='文字を小さく';
      var pl=document.createElement('button'); pl.type='button'; pl.className='fp-fontbtn'; pl.textContent='A＋'; pl.title='文字を大きく';
      mi.addEventListener('click',function(){ var i=SC.indexOf(curSc()); if(i>0) setSc(SC[i-1]); });
      pl.addEventListener('click',function(){ var i=SC.indexOf(curSc()); if(i<SC.length-1) setSc(SC[i+1]); });
      fu.appendChild(mi); fu.appendChild(pl);
      var b=document.createElement('button'); b.type='button'; b.className='fp-hintbtn'; b.title='用語や補足の説明を表示／非表示';
      b.addEventListener('click',function(){ var now=!document.body.classList.contains('fp-hints');
        try{ var o=JSON.parse(localStorage.getItem('fp:settings')||'{}'); o.showHints=now; localStorage.setItem('fp:settings',JSON.stringify(o)); }catch(e){}
        syncHints(); });
      var done=head.querySelector('.deck-close');
      if(done){ head.insertBefore(fu,done); head.insertBefore(b,done); } else { head.appendChild(fu); head.appendChild(b); }
    });
    syncHints();
  }
  window.addEventListener('storage',function(e){ if(e.key==='fp:settings') syncHints(); });
  if(document.readyState!=='loading') setTimeout(initHints,120); else window.addEventListener('DOMContentLoaded',function(){setTimeout(initHints,120);});

  /* ---- ② 引き下ろしレール（FP_RAILIZE 指定時のみ） ---- */
  if(!window.FP_RAILIZE) return;
  function railize(){
    var side=document.querySelector('aside.side'); if(!side) return;
    if(document.getElementById('fpMobileCSS')) return;
    var css='.fp-pull{display:none;position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:61;width:78px;height:26px;border:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:6px 0 0;align-items:flex-start;justify-content:center;}'
    +'.fp-pull .fp-pull-bar{display:block;width:40px;height:5px;border-radius:3px;background:var(--brass,#9a7b4f);opacity:.5;box-shadow:0 1px 3px rgba(0,0,0,.28);transition:opacity .2s ease,width .2s ease;}'
    +'.fp-pull.on .fp-pull-bar{opacity:.92;width:54px;}'
    +'@media (max-width:700px){'
    +'.wrap{flex-direction:column!important;gap:0!important;padding:0!important;}'
    +'.main{height:100vh!important;gap:6px;padding:6px 8px 0!important;}'
    +'.side{position:fixed;left:0;right:0;top:0;z-index:60;flex:0 0 auto;flex-direction:row;flex-wrap:wrap;align-items:center;gap:7px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 12px;background:var(--surface,#fff);border-bottom:1px solid var(--rule,#e3ddcf);box-shadow:0 16px 34px -18px rgba(0,0,0,.55);transform:translateY(-102%);transition:transform .28s ease;max-height:82vh;overflow-y:auto;-webkit-overflow-scrolling:touch;}'
    +'.side.side-open{transform:translateY(0);}'
    +'.side-eyebrow{display:none;}'
    +'.side-tt{writing-mode:horizontal-tb!important;text-orientation:mixed!important;font-size:16px;line-height:1.1;margin:0 8px 0 2px;white-space:nowrap;}'
    +'.side .fpbar,.fp-sidebtns{display:flex!important;flex:1 1 100%;flex-direction:row!important;flex-wrap:wrap;gap:7px;width:auto;align-items:stretch;}'
    +'.side .fpbtn,.fp-sidebtns .fpbtn{width:auto!important;flex:0 0 auto;text-align:center;padding:9px 14px!important;font-size:12.5px!important;}'
    +'.side input[type=text]{flex:1 1 140px;min-width:120px;}'
    +'.build-stamp{flex:0 0 auto;margin:0 0 0 auto;padding:0;text-align:right;}'
    +'.fp-pull{display:flex!important;}'
    +'}';
    var st=document.createElement('style'); st.id='fpMobileCSS'; st.textContent=css; document.head.appendChild(st);

    var mq=window.matchMedia('(max-width:700px)');
    var grip=document.createElement('button');
    grip.type='button'; grip.id='fpPull'; grip.className='fp-pull';
    grip.setAttribute('aria-label','メニューを開く'); grip.title='メニュー（下スワイプで表示）';
    grip.innerHTML='<span class="fp-pull-bar"></span>';
    document.body.appendChild(grip);
    function openRail(){ side.classList.add('side-open'); grip.classList.add('on'); grip.setAttribute('aria-label','メニューを閉じる'); }
    function closeRail(){ side.classList.remove('side-open'); grip.classList.remove('on'); grip.setAttribute('aria-label','メニューを開く'); }
    function isOpen(){ return side.classList.contains('side-open'); }
    grip.addEventListener('click',function(e){ e.preventDefault(); isOpen()?closeRail():openRail(); });
    side.addEventListener('click',function(e){
      var t=e.target;
      if(t.closest && t.closest('input,textarea,select,label')) return;
      if(t.closest && t.closest('button,.fpbtn,a')){ setTimeout(closeRail,180); }
    });
    try{ mq.addEventListener('change',function(){ if(!mq.matches) closeRail(); }); }catch(e){}

    var y0=0,x0=0,tracking=false,fromTop=false,fired=false;
    window.addEventListener('touchstart',function(e){
      if(!mq.matches){ tracking=false; return; }
      var t=e.touches[0]; y0=t.clientY; x0=t.clientX; tracking=true; fired=false;
      fromTop=(y0<=64);
    },{passive:true});
    window.addEventListener('touchmove',function(e){
      if(!mq.matches||!tracking||fired) return;
      var t=e.touches[0], dy=t.clientY-y0, dx=t.clientX-x0;
      if(Math.abs(dy)<26 || Math.abs(dx)>Math.abs(dy)) return;
      if(dy>0){ if(!isOpen() && fromTop){ openRail(); fired=true; } }
      else { if(isOpen()){ closeRail(); fired=true; } }
    },{passive:true});
    window.addEventListener('touchend',function(){ tracking=false; },{passive:true});
  }
  if(document.readyState==='complete'||document.readyState==='interactive') setTimeout(railize,60);
  else window.addEventListener('DOMContentLoaded',function(){ setTimeout(railize,60); });
})();
