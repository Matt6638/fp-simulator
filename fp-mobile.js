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
