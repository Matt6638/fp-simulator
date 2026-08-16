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
    // 結果：横スワイプでページ送り（1画面に収め、あふれたら次ページ）
    +'.deck-result .deck-scroll{flex:1 1 auto;min-height:0;display:flex;flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}'
    // 各ページは複数カラムに縦詰め（マソンリー）＝上から順に埋め、横幅を無駄にしない
    +'.deck-result .deck-scroll>.rpage{flex:0 0 100%;scroll-snap-align:start;min-width:0;height:100%;overflow-y:auto;padding:10px 14px;box-sizing:border-box;display:flex;gap:16px;align-items:flex-start;}'
    +'.deck-result .rcol{flex:1 1 0;min-width:0;max-width:720px;display:flex;flex-direction:column;gap:12px;}' // 中央（グラフ＋表）は大きく、広すぎは抑制
    +'.deck-result .rcol-kpi{flex:0 0 clamp(320px,28%,430px);max-width:430px;}' // KPI帯＝左を大きめに（結果金額を見やすく）
    +'.deck-result .rcol-kpi .result-cards{flex-direction:column;}'
    +'.deck-result .rcol-kpi .result-cards>*{flex:1 1 auto;max-width:none;min-width:0;}'
    +'.deck-result .rcol-notes{flex:1 1 0;max-width:340px;}' // 注記＝折返し可なので細めに（データ列に幅を譲る）'
    +'.deck-result .rcol>*{margin:0;max-width:100%;min-width:0;}'
    +'.deck-result .rcol>.fp-rhead{margin-bottom:-4px;}'
    // 結果内テーブルは固定レイアウト＋折返しでカラム幅に必ず収める（横スワイプ不要）
    +'.deck-result .rcol table{width:100%;font-size:10px;table-layout:fixed;}'
    +'.deck-result .rcol table th,.deck-result .rcol table td{padding:3px 4px;white-space:normal;overflow-wrap:anywhere;word-break:break-word;line-height:1.3;}'
    +'.deck-result .rcol .chartwrap{overflow-x:auto;}'
    +'.deck-result .rv{overflow-wrap:anywhere;word-break:break-word;}'
    // 説明文は本文の上に横いっぱいで1回だけ（カラムに混ぜない）
    +'.deck-result .fp-intro{flex:0 0 auto;padding:7px 16px 7px;margin:0;font-size:11px;line-height:1.5;color:var(--ink-soft,#46506a);border-bottom:1px solid var(--rule-soft,#eee9dd);}'
    // 入力：縦スクロール。欄は細く・多列で1画面に多く並べる
    +'.deck-input .deck-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;}'
    +'.deck-input .deck-scroll>.ipage{min-width:0;padding:10px 14px;}'
    +'.deck-input .panel{margin:0 0 8px!important;box-shadow:none;padding:0;border:none;background:none;}'
    // 入力欄はグリッドで整列（ラベル高さがバラついても上揃え・列がそろう）
    +'.deck-input .panel-body{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px 18px;align-items:start;}'
    // 入れ子の枠（条件表示ボックス・2列行など）は横いっぱいに広げ、内部も同じグリッドで整列
    +'.deck-input .panel-body>div:not(.field):not(.grp):not(.sub):not(.hint):not(.row2):not(.row3):not(.hide):not([hidden]),.deck-input #kouseiBox,.deck-input #kokuminBox{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px 18px;align-items:start;margin:0;}'
    // 2列行は「枠」を消して中の欄を親グリッドへ流し込む（右の余白を作らず詰める）
    +'.deck-input .row2,.deck-input .row3{display:contents;}'
    // カテゴリ見出しは横いっぱいの区切り線に
    +'.deck-input .grp,.deck-input .sub,.deck-input .subhead{grid-column:1/-1;font-size:11.5px;font-weight:700;color:var(--brass-deep,#7d6240);letter-spacing:.04em;border-bottom:1px solid var(--rule,#e3ddcf);padding:2px 0 5px;margin:10px 0 0;}'
    +'.deck-input .grp:first-child,.deck-input .sub:first-child{margin-top:0;}'
    // フィールドは各セル。上揃えで整列
    +'.deck-input .field{width:auto;min-width:0;margin:0;align-self:start;}'
    +'.deck-input .field .lab,.deck-input .field label{display:block;min-height:2.4em;}' // ラベル高さを揃えて枠の頭を合わせる
    // 説明文・ボタン・セグメント/トグルを含む欄は横いっぱい
    +'.deck-input .panel-body>.hint,.deck-input .panel-body>button,.deck-input .panel-body>.btn,.deck-input .field:has(.toggle),.deck-input .field:has(textarea),.deck-input .field.wide{grid-column:1/-1;}'
    // セグメント選択欄は最低限の幅（2列ぶん）に。夫/妻・会社員/自営業などが横に並び右を無駄にしない
    +'.deck-input .field:has(.seg){grid-column:span 2;max-width:480px;}'
    +'.deck-input .field:has(.seg) .lab,.deck-input .field:has(.toggle) .lab{min-height:0;}'
    +'.deck-input .toggle{justify-content:flex-start!important;gap:12px;}' // スイッチを文字の右隣へ（右端に寄せない）
    +'.deck-input .toggle .tl{flex:0 1 auto;}'
    // 入力/セレクトはセル幅いっぱい
    +'.deck-input .field input[type=text],.deck-input .field input.yen,.deck-input .field input.num,.deck-input .field input[inputmode],.deck-input .field select{width:100%!important;max-width:none;box-sizing:border-box;}'
    // 数字欄は必要以上に広げない（歳/年/人=細く、金額=中）
    +'.deck-input .field input.num,.deck-input .field input[inputmode=numeric]:not(.yen),.deck-input .field input[inputmode=decimal]:not(.yen){max-width:120px!important;}'
    +'.deck-input .field input.yen{max-width:190px!important;}'
    +'.deck-input .hint{font-size:10.5px;line-height:1.45;margin-top:3px;}'
    +'.deck-input{position:fixed;left:8px;right:8px;bottom:0;height:58vh;max-height:660px;transform:translateY(108%);transition:transform .28s ease;z-index:30;border-radius:12px 12px 0 0;box-shadow:0 -12px 34px -12px rgba(0,0,0,.45);}'
    +'.deck-input.open{transform:translateY(0);}'
    +'.fab-input{position:fixed;right:14px;top:50%;left:auto;bottom:auto;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;background:var(--brass,#9a7b4f);color:#fff;border:1px solid var(--brass-deep,#7d6240);cursor:pointer;box-shadow:0 8px 20px -8px rgba(0,0,0,.5);z-index:45;display:flex;align-items:center;justify-content:center;padding:0;}'
    +'.fab-input .fab-plus{font-size:25px;line-height:1;transition:transform .22s ease;}'
    +'.fab-input::after{content:"入力";position:absolute;bottom:-13px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--brass-deep,#7d6240);font-weight:700;letter-spacing:.04em;white-space:nowrap;}'
    +'.fab-input.on .fab-plus{transform:rotate(45deg);}'
    +'.fab-input.on::after{content:"閉じる";}'
    +'.fp-sub{font-size:11px;color:var(--ink-soft,#46506a);margin:0 0 8px;}'
    +'.fp-rhead{font-family:var(--mincho,serif);font-size:13px;font-weight:600;color:var(--brass-deep,#7d6240);margin:0 0 3px;border-left:3px solid var(--brass,#9a7b4f);padding-left:7px;}'
    +'.deck-result .panel{box-shadow:none;border:1px solid var(--rule,#e3ddcf);}'
    +'.deck-result .fp-dock{position:fixed;left:-100000px;top:0;width:360px;visibility:hidden;pointer-events:none;}'
    +'.deck-result .rcol>.panel-head{display:none;}' // 分割で露出したデッキ見出し（結果）と重複するため非表示
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
    deckR.innerHTML='<div class="deck-head"><span class="no">結果</span><b>結果</b><span class="deck-hint" style="margin-left:8px;color:var(--brass-deep,#7d6240);font-size:10.5px;">スワイプで次ページ</span><span class="deck-dots" id="fpRDots" style="margin-left:auto;display:flex;gap:5px;align-items:center;"></span></div><div class="deck-scroll"></div><div class="fp-dock" id="fpDock"></div>';
    var deckI=document.createElement('section'); deckI.className='deck deck-input'; deckI.id='deckInput';
    var closeBtn='<button type="button" class="deck-close">完了 ✓</button>';
    deckI.innerHTML='<div class="deck-head"><span class="no">入力</span><b>入力</b>'+closeBtn+'</div><div class="deck-scroll"><div class="ipage" id="fpInPage"></div></div>';
    deckI.querySelector('.deck-close').addEventListener('click',closeInput);
    main.appendChild(deckR); main.appendChild(deckI);

    var dock=deckR.querySelector('#fpDock');
    var outPage=dock, inPage=deckI.querySelector('#fpInPage');
    if(sub){ var s2=sub.cloneNode(true); s2.className='fp-sub fp-intro'; deckR.insertBefore(s2, deckR.querySelector('.deck-scroll')); }

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
    // 結果を1画面ごとの横ページに分割（あふれたら次ページ＝右スワイプ）
    // 実データはドックに保持し、可視ページには複製を配置。再計算のたびに再分割する。
    var rScroll=deckR.querySelector('.deck-scroll');
    var repag=function(){ repaginate(rScroll,'fpRDots',dock); };
    repag();
    var rzT; window.addEventListener('resize',function(){ clearTimeout(rzT); rzT=setTimeout(repag,120); });
    try{
      var mo=new MutationObserver(function(){ clearTimeout(rScroll.__moTO); rScroll.__moTO=setTimeout(repag,60); });
      mo.observe(dock,{childList:true,subtree:true,characterData:true});
    }catch(e){}
  }

  // ドック内のソースを、1画面に収まる原子ブロックへ分解する（背の高い入れ物は子へ降りる）
  function atomize(node, deckH, out){
    if(!node || node.nodeType!==1) return;
    var kids=Array.prototype.filter.call(node.children, function(k){ return k.nodeType===1; });
    if(kids.length>1 && node.offsetHeight > deckH*0.9){
      kids.forEach(function(k){ atomize(k, deckH, out); });
    } else {
      out.push(node);
    }
  }
  // 結果コンテンツを、デッキの高さに収まるよう複数の .rpage へ複製配置する。
  // ソース(dock)は破壊せず読むだけ＝再計算(outBody書換)のたびに再実行できる。
  function repaginate(scrollEl, dotsId, dock){
    if(!scrollEl || !dock) return;
    if(scrollEl.__pg) return; scrollEl.__pg=true;
    try{
      var deckH=scrollEl.clientHeight; if(!deckH||deckH<80){ deckH=99999; }
      var pageW=scrollEl.clientWidth||1000;
      var GAP=16, COLW=268, PAD=28, KPIW=300; // COLW=1カラムの最小目安幅／KPIW=左KPI列の実幅(CSSと一致)
      // ソースを原子ブロックへ分解
      var srcBlocks=[];
      Array.prototype.slice.call(dock.children).forEach(function(c){ atomize(c, deckH, srcBlocks); });
      function isCls(node,name){ return (' '+(node.className||'')+' ').indexOf(' '+name+' ')>=0; }
      // 先に列数・実カラム幅を確定（KPI帯があれば細い左列を1本確保）
      var hasKpi=srcBlocks.some(function(b){return isCls(b,'result-cards');});
      var restAvail=pageW-PAD-(hasKpi?KPIW+GAP:0);
      var K=Math.max(1, Math.floor((restAvail+GAP)/(COLW+GAP)));
      var restColW=Math.max(160, Math.floor((restAvail-(K-1)*GAP)/K));
      var Kfull=Math.max(1, Math.floor((pageW-PAD+GAP)/(COLW+GAP)));
      // 採寸は「実際に配置する幅」で行う（KPI=細幅／その他=実カラム幅）＝高さ誤差なし
      var meas=document.createElement('div'); meas.style.cssText='position:absolute;left:0;top:0;';
      dock.appendChild(meas);
      var items=srcBlocks.map(function(src){
        var clone=src.cloneNode(true);
        if(clone.removeAttribute) clone.removeAttribute('id');
        if(clone.querySelectorAll){ Array.prototype.forEach.call(clone.querySelectorAll('[id]'), function(e){ e.removeAttribute('id'); }); }
        var kpi=isCls(src,'result-cards');
        meas.style.width=(kpi?KPIW:restColW)+'px'; meas.appendChild(clone); var h=clone.offsetHeight; meas.removeChild(clone);
        return {node:clone, h:h, kpi:kpi, legend:isCls(src,'legend')};
      });
      dock.removeChild(meas);
      var kpiItems=items.filter(function(x){return x.kpi;});
      var rest=items.filter(function(x){return !x.kpi;});
      // ブロックを「ユニット」にまとめる：凡例→直前へ、見出し(.sec-h等)→直後へ結合し、はぐれ防止
      function isHead(n){ return isCls(n,'sec-h')||isCls(n,'chart-h')||isCls(n,'fp-rhead')||isCls(n,'sub'); }
      function hasTag(n,tag){ return n&&(n.tagName===tag||(n.querySelector&&n.querySelector(tag.toLowerCase()))); }
      var units=[];
      rest.forEach(function(it){
        if(it.legend && units.length){ var u=units[units.length-1]; u.items.push(it.node); u.h+=GAP+it.h; return; }
        units.push({items:[it.node], h:it.h, head:isHead(it.node)});
      });
      var uni=[];
      for(var i=0;i<units.length;i++){
        var u=units[i];
        if(u.head && u.items.length===1 && units[i+1]){ var n=units[i+1]; n.items=u.items.concat(n.items); n.h+=GAP+u.h; }
        else uni.push(u);
      }
      // 各ユニットの性質（表/グラフを含むか）
      uni.forEach(function(u){ u.hasData=u.items.some(function(n){ return hasTag(n,'TABLE')||hasTag(n,'SVG'); }); });
      // カラム数（内容量に応じて。幅で入る本数を上限）
      var totalRest=0; uni.forEach(function(u){ totalRest+=u.h+GAP; });
      var maxRestCols=hasKpi?K:Kfull;
      var restCols=Math.max(1, Math.min(maxRestCols, Math.ceil(totalRest/(deckH*0.95))));

      scrollEl.innerHTML='';
      function newPage(){
        var p=document.createElement('div'); p.className='rpage'; scrollEl.appendChild(p);
        if(hasKpi){ var kc=document.createElement('div'); kc.className='rcol rcol-kpi'; p.appendChild(kc); }
        var cs=[]; for(var i=0;i<restCols;i++){ var c=document.createElement('div'); c.className='rcol'; p.appendChild(c); cs.push({el:c,h:0}); }
        return {kc:hasKpi?p.querySelector('.rcol-kpi'):null, cols:cs};
      }
      var page=newPage();
      if(page.kc) kpiItems.forEach(function(it){ page.kc.appendChild(it.node); });
      // ファーストフィット：文書順に、収まる最初のカラムへ（収まらなければ次ページ）。表・グラフは切らない
      uni.forEach(function(u){
        var cols=page.cols, idx=-1;
        for(var i=0;i<cols.length;i++){ if(cols[i].h===0 || cols[i].h+GAP+u.h<=deckH+2){ idx=i; break; } }
        if(idx<0){
          if(u.h<=deckH){ page=newPage(); cols=page.cols; idx=0; }
          else { idx=0; for(var j=1;j<cols.length;j++){ if(cols[j].h<cols[idx].h) idx=j; } } // 1画面超の巨大ブロックは最短列へ（縦スクロール）
        }
        u.items.forEach(function(n){ cols[idx].el.appendChild(n); });
        cols[idx].h += (cols[idx].h>0?GAP:0)+u.h;
        cols[idx].text = cols[idx].text!==false && !u.hasData; // 表/グラフが無ければ文章列
      });
      // 文章だけのカラム（注記）は幅を抑える
      if(hasKpi){ scrollEl.querySelectorAll('.rpage').forEach(function(pg){ var cs=pg.querySelectorAll('.rcol:not(.rcol-kpi)'); cs.forEach(function(c){ var hasData=!!c.querySelector('table,svg'); if(!hasData && c.children.length && cs.length>1) c.className+=' rcol-notes'; }); }); }
      buildDots(scrollEl, dotsId);
      positionFab();
    } finally { scrollEl.__pg=false; }
  }

  // スワイプ位置に応じたドット表示
  function buildDots(scrollEl, dotsId){
    var dc=document.getElementById(dotsId); if(!dc) return;
    var n=scrollEl.querySelectorAll(':scope>.rpage').length;
    dc.style.display = n<2 ? 'none' : 'flex';
    var hint=scrollEl.parentNode.querySelector('.deck-hint'); if(hint) hint.style.display = n<2 ? 'none' : '';
    dc.innerHTML='';
    if(n<2) return;
    for(var i=0;i<n;i++){ (function(i){ var d=document.createElement('i'); d.style.cssText='width:8px;height:8px;border-radius:50%;background:var(--rule,#e3ddcf);display:inline-block;cursor:pointer;'; d.addEventListener('click',function(){ scrollEl.scrollTo({left:i*scrollEl.clientWidth,behavior:'smooth'}); }); dc.appendChild(d); })(i); }
    var upd=function(){ var w=scrollEl.clientWidth||1; var idx=Math.round(scrollEl.scrollLeft/w); Array.prototype.forEach.call(dc.children,function(d,i){ d.style.background = i===idx ? 'var(--brass,#9a7b4f)' : 'var(--rule,#e3ddcf)'; }); };
    scrollEl.onscroll=upd; upd();
  }

  function openInput(){var d=document.getElementById('deckInput');if(d)d.classList.add('open');['btnInput','fabInput'].forEach(function(id){var b=document.getElementById(id);if(b)b.classList.add('on');});setTimeout(positionFab,60);setTimeout(positionFab,320);}
  function closeInput(){var d=document.getElementById('deckInput');if(d)d.classList.remove('open');['btnInput','fabInput'].forEach(function(id){var b=document.getElementById(id);if(b)b.classList.remove('on');});if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();setTimeout(positionFab,60);}
  function toggleInput(){var d=document.getElementById('deckInput');if(d&&d.classList.contains('open'))closeInput();else openInput();}
  window.fpToggleInput=toggleInput;
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeInput();});

  function makeFabDraggable(){
    // 位置は positionFab() が結果に合わせて都度自動配置する。ここではタップ＝入力開閉のみ。
    var fab=document.getElementById('fabInput'); if(!fab)return;
    fab.addEventListener('click',function(e){ e.preventDefault(); toggleInput(); });
  }
  // ＋/×ボタンを空きスペースの最上部（右）へ自動配置。
  // 入力ドロワーが開いていれば「ドロワー内の空き」、閉じていれば「結果の最右カラムの空き」を基準にする。
  function positionFab(){
    var fab=document.getElementById('fabInput'); if(!fab) return;
    var fh=fab.offsetHeight||46;
    var drawer=document.getElementById('deckInput');
    var open=drawer && drawer.classList.contains('open');
    var top;
    if(open){ // ×ボタン＝結果デッキ上部の空きスペース（右上）へ。ドロワーの入力に被らない
      var main=document.querySelector('.deck-result')||document.querySelector('.main');
      var mr=main?main.getBoundingClientRect():null;
      top=(mr && mr.height)? (mr.top+6) : 8;
    } else {
      var scrollEl=document.querySelector('.deck-result .deck-scroll');
      if(!scrollEl) return;
      var deckRect=scrollEl.getBoundingClientRect(); if(!deckRect.height) return;
      var page=scrollEl.querySelector('.rpage');
      if(page){
        var cols=page.querySelectorAll(':scope>.rcol');
        var last=cols[cols.length-1];
        if(last && last.children.length && last.scrollHeight>24){
          var lr=last.getBoundingClientRect();
          top=lr.top + Math.min(last.scrollHeight, deckRect.height) + 12; // 内容の下＝空きの最上部
        } else { top=deckRect.top + deckRect.height/2 - fh/2; } // 最右が空＝中央
      } else { top=deckRect.top + deckRect.height/2 - fh/2; }
      top=Math.max(deckRect.top+8, Math.min(top, deckRect.bottom - fh - 8));
    }
    fab.style.left='auto'; fab.style.bottom='auto'; fab.style.transform='none';
    fab.style.right='14px'; fab.style.top=Math.round(top)+'px';
  }

  // ツールの初期化が終わってから変換（結果が描画済みの状態でDOMを移動）
  if(document.readyState==='complete') setTimeout(build,80);
  else window.addEventListener('load',function(){ setTimeout(build,80); });
})();
