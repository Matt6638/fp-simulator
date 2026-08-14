/* ===== fp-deck.js : 旧レイアウト(.wrap>header+.fpbar+.grid) を
   教育資金と同じ骨格（サイドバー＋FABドロワー＋全画面結果デッキ）へ自動変換する共通スクリプト。
   各ツールの </body> 直前に <script src="fp-deck.js"></script> を1行入れるだけ。
   計算ロジックはID参照で更新されるため、要素を移動しても動作は維持される。 ===== */
(function(){
  if(window.__fpDeck) return; window.__fpDeck=true;

  function inject(){
    if(document.getElementById('fpDeckCSS')) return;
    var css=''
    +'html,body{height:100%;margin:0;}'
    +'body{overflow:hidden;}'
    +'.wrap{height:100vh!important;max-width:none!important;margin:0!important;padding:8px 10px!important;display:flex!important;gap:10px;align-items:stretch;overflow:hidden!important;}'
    +'.side{flex:0 0 66px;display:flex;flex-direction:column;align-items:center;gap:9px;padding-top:4px;}'
    +'.side-eyebrow{font-family:var(--mincho,serif);font-size:10px;letter-spacing:.3em;color:var(--brass-deep,#7d6240);margin:0;}'
    +'.side-tt{font-family:var(--mincho,serif);font-weight:600;font-size:17px;color:var(--ink,#1b2a4a);writing-mode:vertical-rl;text-orientation:upright;letter-spacing:.05em;line-height:1;margin:0 0 6px;white-space:nowrap;}'
    +'.fp-sidebtns{display:flex;flex-direction:column;align-items:stretch;gap:6px;width:100%;}'
    +'.fp-sidebtns .fpbtn{width:100%!important;text-align:center;padding:7px 2px!important;font-size:11px!important;white-space:nowrap;margin:0!important;display:block;box-sizing:border-box;}'
    +'.fpbtn-input{background:var(--brass,#9a7b4f)!important;color:#fff!important;border-color:var(--brass-deep,#7d6240)!important;font-weight:700;}'
    +'.build-stamp{margin-top:auto;padding-top:8px;font-size:8.5px;line-height:1.35;color:var(--brass-deep,#7d6240);opacity:.6;text-align:center;white-space:pre-line;}'
    +'.main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px;height:100%;overflow:hidden;}'
    +'.deck{background:var(--surface,#fff);border:1px solid var(--rule,#e3ddcf);border-radius:10px;box-shadow:var(--shadow,0 1px 2px rgba(27,42,74,.05));display:flex;flex-direction:column;min-height:0;overflow:hidden;}'
    +'.deck-result{flex:1 1 auto;}'
    +'.deck-head{flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:5px 12px;border-bottom:1px solid var(--rule-soft,#eee9dd);}'
    +'.deck-head .no{font-family:var(--mono,monospace);font-size:11px;color:var(--brass,#9a7b4f);}'
    +'.deck-head b{font-family:var(--mincho,serif);font-size:14px;font-weight:600;letter-spacing:.03em;}'
    +'.deck-close{margin-left:auto;font:600 12.5px var(--gothic,sans-serif);color:#fff;background:var(--brass,#9a7b4f);border:1px solid var(--brass-deep,#7d6240);border-radius:7px;padding:6px 16px;cursor:pointer;}'
    +'.deck-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;}'
    +'.deck-scroll>.rpage,.deck-scroll>.ipage{min-width:0;padding:12px 16px;}'
    +'.deck-input{position:fixed;left:8px;right:8px;bottom:0;height:58vh;max-height:660px;transform:translateY(108%);transition:transform .28s ease;z-index:30;border-radius:12px 12px 0 0;box-shadow:0 -12px 34px -12px rgba(0,0,0,.45);}'
    +'.deck-input.open{transform:translateY(0);}'
    +'.fab-input{position:fixed;right:12px;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:var(--brass,#9a7b4f);color:#fff;border:1px solid var(--brass-deep,#7d6240);cursor:pointer;box-shadow:0 8px 20px -8px rgba(0,0,0,.5);z-index:45;display:flex;align-items:center;justify-content:center;padding:0;}'
    +'.fab-input .fab-plus{font-size:26px;line-height:1;transition:transform .22s ease;}'
    +'.fab-input::after{content:"入力";position:absolute;bottom:-13px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--brass-deep,#7d6240);font-weight:700;}'
    +'.fab-input.on .fab-plus{transform:rotate(45deg);}'
    +'.fp-sub{font-size:11px;color:var(--ink-soft,#46506a);margin:0 0 8px;}'
    +'.fp-rhead{font-family:var(--mincho,serif);font-size:13px;font-weight:600;color:var(--brass-deep,#7d6240);margin:10px 0 3px;border-left:3px solid var(--brass,#9a7b4f);padding-left:7px;}'
    +'.deck-input .panel,.deck-input .grid{margin:0 0 10px!important;box-shadow:none;}'
    +'.deck-result .panel{box-shadow:none;border:1px solid var(--rule,#e3ddcf);}'
    +'@media print{.side,.deck-input,.fab-input{display:none!important;}.wrap{display:block!important;height:auto!important;overflow:visible!important;}.deck-result{border:none;box-shadow:none;}.deck-scroll{overflow:visible!important;}}';
    var st=document.createElement('style'); st.id='fpDeckCSS'; st.textContent=css; document.head.appendChild(st);
  }

  function hasInput(el){ return !!(el && el.querySelector && el.querySelector('input,select,textarea,button[data-v],.seg,.sw,.toggle')); }

  function placeNode(node, inPage, outPage){
    if(!node || node.nodeType!==1){ if(node) outPage.appendChild(node); return; }
    if(hasInput(node)){
      // 入力を含むパネル：内部の結果ボックス(.result/.summary)は結果デッキへ抜き出す
      var results = node.querySelectorAll ? node.querySelectorAll('.result,.summary') : [];
      if(results && results.length){
        var h2 = node.querySelector ? node.querySelector('h2,.panel-head') : null;
        var label = h2 ? h2.textContent.trim() : '';
        Array.prototype.forEach.call(results, function(r){
          if(label){ var h=document.createElement('div'); h.className='fp-rhead'; h.textContent=label; outPage.appendChild(h); }
          outPage.appendChild(r);
        });
      }
      inPage.appendChild(node);
    } else {
      outPage.appendChild(node);
    }
  }

  function build(){
    var wrap=document.querySelector('.wrap'); if(!wrap) return;
    if(document.querySelector('aside.side')) return; // 既に新フェイス
    inject();
    var h1=document.querySelector('.wrap h1')||document.querySelector('h1');
    var title=h1?h1.textContent.replace(/シミュレーター|Simulator/gi,'').trim():'FP';
    var header=wrap.querySelector('header');
    var sub=header?header.querySelector('.sub'):null;
    var fpbar=wrap.querySelector('.fpbar');
    var manual=document.getElementById('fpManual');

    // サイドバー
    var side=document.createElement('aside'); side.className='side';
    side.innerHTML='<div class="side-eyebrow">FP</div><div class="side-tt"></div>';
    side.querySelector('.side-tt').textContent=title;
    var btns=document.createElement('div'); btns.className='fp-sidebtns';
    var inbtn=document.createElement('button'); inbtn.type='button'; inbtn.className='fpbtn fpbtn-input'; inbtn.id='btnInput'; inbtn.textContent='✎ 入力'; inbtn.addEventListener('click',toggleInput);
    btns.appendChild(inbtn);
    if(fpbar){ Array.prototype.slice.call(fpbar.children).forEach(function(b){ if(b.tagName==='INPUT'&&b.type==='file'){ btns.appendChild(b); b.style.display='none'; } else { btns.appendChild(b); } }); }
    side.appendChild(btns);
    var stamp=document.createElement('div'); stamp.className='build-stamp'; side.appendChild(stamp);

    // メイン（結果デッキ＋入力ドロワー）
    var main=document.createElement('main'); main.className='main';
    var deckR=document.createElement('section'); deckR.className='deck deck-result';
    deckR.innerHTML='<div class="deck-head"><span class="no">結果</span><b>結果</b></div><div class="deck-scroll"><div class="rpage" id="fpOutPage"></div></div>';
    var deckI=document.createElement('section'); deckI.className='deck deck-input'; deckI.id='deckInput';
    var closeBtn='<button type="button" class="deck-close">完了 ✓</button>';
    deckI.innerHTML='<div class="deck-head"><span class="no">入力</span><b>入力</b>'+closeBtn+'</div><div class="deck-scroll"><div class="ipage" id="fpInPage"></div></div>';
    deckI.querySelector('.deck-close').addEventListener('click',closeInput);
    main.appendChild(deckR); main.appendChild(deckI);

    var outPage=deckR.querySelector('#fpOutPage'), inPage=deckI.querySelector('#fpInPage');
    if(sub){ var s2=sub.cloneNode(true); s2.className='fp-sub'; outPage.appendChild(s2); }

    // 既存コンテンツを分類（タブ/グリッドの入れ子にも対応）
    // 1) すべての .panel を深さに関係なく分類（入力→ドロワー／結果→デッキ、.result は抽出）
    Array.prototype.slice.call(wrap.querySelectorAll('.panel')).forEach(function(p){ placeNode(p,inPage,outPage); });
    // 2) パネル外に残った「入力を含む要素」（単独フィールド等）はドロワーへ。空のグリッド/タブ枠は破棄
    Array.prototype.slice.call(wrap.children).forEach(function(node){
      if(node===header||node===fpbar||node===manual) return;
      if(node.classList && (node.classList.contains('tabs')||node.classList.contains('tab-nav'))) return; // タブ切替は破棄
      if(hasInput(node)){ inPage.appendChild(node); }
      else if(node.querySelector && node.querySelector('.result,.summary')){ // 結果だけ残る枠
        Array.prototype.forEach.call(node.querySelectorAll('.result,.summary'),function(r){ outPage.appendChild(r); });
      }
    });

    // 組み立て
    wrap.innerHTML=''; wrap.appendChild(side); wrap.appendChild(main);
    if(manual) document.body.appendChild(manual);
    var fab=document.createElement('button'); fab.type='button'; fab.className='fab-input'; fab.id='fabInput'; fab.setAttribute('aria-label','入力を開く（ドラッグで移動）'); fab.title='タップで入力／ドラッグで移動'; fab.innerHTML='<span class="fab-plus">＋</span>';
    document.body.appendChild(fab);
    makeFabDraggable();
    var lm=document.lastModified||''; var mm=lm.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[ ,]+(\d{1,2}):(\d{2})/); stamp.textContent=mm?('更新 '+mm[1]+'/'+mm[2]+'\n'+mm[4]+':'+mm[5]):'';
  }

  function openInput(){var d=document.getElementById('deckInput');if(d)d.classList.add('open');['btnInput','fabInput'].forEach(function(id){var b=document.getElementById(id);if(b)b.classList.add('on');});}
  function closeInput(){var d=document.getElementById('deckInput');if(d)d.classList.remove('open');['btnInput','fabInput'].forEach(function(id){var b=document.getElementById(id);if(b)b.classList.remove('on');});if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();}
  function toggleInput(){var d=document.getElementById('deckInput');if(d&&d.classList.contains('open'))closeInput();else openInput();}
  window.fpToggleInput=toggleInput;
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeInput();});

  function makeFabDraggable(){
    var fab=document.getElementById('fabInput'); if(!fab)return; var KEY='fp:fabpos';
    function place(l,t){l=Math.min(window.innerWidth-fab.offsetWidth-4,Math.max(4,l));t=Math.min(window.innerHeight-fab.offsetHeight-4,Math.max(4,t));fab.style.left=l+'px';fab.style.top=t+'px';fab.style.right='auto';fab.style.bottom='auto';fab.style.transform='none';}
    try{var p=JSON.parse(localStorage.getItem(KEY)||'null');if(p&&p.left!=null){place(p.left,p.top);}}catch(e){}
    fab.style.touchAction='none'; var down=false,moved=false,sx,sy,ox,oy;
    fab.addEventListener('pointerdown',function(e){down=true;moved=false;sx=e.clientX;sy=e.clientY;var r=fab.getBoundingClientRect();ox=r.left;oy=r.top;try{fab.setPointerCapture(e.pointerId);}catch(x){}e.preventDefault();});
    fab.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>4||Math.abs(dy)>4)moved=true;if(moved)place(ox+dx,oy+dy);});
    fab.addEventListener('pointerup',function(e){if(!down)return;down=false;if(moved){try{localStorage.setItem(KEY,JSON.stringify({left:parseFloat(fab.style.left),top:parseFloat(fab.style.top)}));}catch(x){}}else{toggleInput();}});
    window.addEventListener('resize',function(){if(fab.style.left){place(parseFloat(fab.style.left),parseFloat(fab.style.top));}});
  }

  // ツールの初期化が終わってから変換（結果が描画済みの状態でDOMを移動）
  if(document.readyState==='complete') setTimeout(build,80);
  else window.addEventListener('load',function(){ setTimeout(build,80); });
})();
