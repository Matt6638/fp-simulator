/* ===== fp-amount.js : 全ツール共通の金額入力フォーマッタ =====
   ・全角数字/記号を自動で半角化
   ・整数部を3桁コンマ区切り（小数は保持）
   ・キャレット位置を保持、IME変換中は整形しない
   ・冪等（何度走らせても同じ結果）なので、各ツール既存の整形と二重に走っても壊れない
   対象＝金額欄：class .yen/.num/.money/[data-money]、または「円」を単位に持つ入力欄。
   （歳・年・％など「円」以外の単位はコンマを付けない）
   使い方：各ツールの </body> 直前に <script src="fp-amount.js"></script> を1行。 */
(function(){
  if(window.__fpAmount) return; window.__fpAmount=true;

  function norm(s){
    return String(s==null?'':s)
      .replace(/[０-９]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0xFEE0);})
      .replace(/[．。]/g,'.')
      .replace(/[，、]/g,',')
      .replace(/[－ー−―‐‑–—]/g,'-');
  }

  function fmt(el){
    var v=norm(el.value);
    var sel=el.selectionStart==null?v.length:el.selectionStart;
    var digitsBefore=v.slice(0,sel).replace(/[^\d]/g,'').length;
    var neg=/^\s*-/.test(v);
    var allowDec = el.getAttribute('inputmode')==='decimal' || /\./.test(v) || el.classList.contains('dec');
    var cleaned=v.replace(/[^\d.]/g,'');
    var dot=allowDec?cleaned.indexOf('.'):-1;
    var intPart, decPart=null;
    if(dot>=0){ intPart=cleaned.slice(0,dot).replace(/\./g,''); decPart=cleaned.slice(dot+1).replace(/\./g,''); }
    else { intPart=cleaned.replace(/\./g,''); }
    intPart=intPart.replace(/^0+(?=\d)/,''); // 先頭ゼロ除去（0単体は残す）
    if(intPart.length>16){ intPart=intPart.slice(0,16); } // 保険：桁の暴走を上限で止める
    var out;
    if(intPart===''){ out = (decPart!=null)?'0':''; }
    else { out = Number(intPart).toLocaleString('ja-JP'); }
    if(decPart!=null){ out = (out||'0')+'.'+decPart; }
    if(neg && out!==''){ out='-'+out; }
    if(out===el.value) { return; } // 変化なし＝キャレットも触らない
    el.value=out;
    // キャレット復元（整形後の文字列で digitsBefore 桁目の直後へ）
    var pos=0,cnt=0;
    if(digitsBefore>0){ for(var i=0;i<out.length;i++){ var cc=out.charCodeAt(i); if(cc>=48&&cc<=57)cnt++; if(cnt>=digitsBefore){pos=i+1;break;} } if(cnt<digitsBefore)pos=out.length; }
    else { pos=out.length; }
    try{ el.setSelectionRange(pos,pos); }catch(e){}
  }

  function isMoney(el){
    if(!el||el.tagName!=='INPUT') return false;
    var t=(el.getAttribute('type')||'text').toLowerCase();
    if(t!=='text'&&t!=='tel'&&t!=='') return false;
    if(el.classList.contains('yen')||el.classList.contains('num')||el.classList.contains('money')||el.hasAttribute('data-money')) return true;
    // 近傍の単位ラベルに「円」を含むか（歳/年/％は除外）
    var box=el.closest?el.closest('.inline,.inrow,.field,.f,.hh-row'):el.parentElement;
    if(!box) box=el.parentElement;
    if(box){
      var u=box.querySelector('.unit,.u,.yen-unit,em');
      var ut=u?u.textContent:'';
      if(/円/.test(ut)) return true;
    }
    return false;
  }

  function markAll(root){
    (root||document).querySelectorAll('input').forEach(function(el){
      if(el.classList.contains('fp-money')) return;
      if(isMoney(el)){ el.classList.add('fp-money'); if(el.value) fmt(el); }
    });
  }

  // 委譲リスナー（capture）。要素を移動しても document 上で有効。
  document.addEventListener('compositionstart',function(e){ var el=e.target; if(el&&el.classList&&el.classList.contains('fp-money')) el.__fpComposing=true; },true);
  document.addEventListener('compositionend',function(e){ var el=e.target; if(el&&el.classList&&el.classList.contains('fp-money')){ el.__fpComposing=false; fmt(el); } },true);
  document.addEventListener('input',function(e){ var el=e.target; if(el&&el.classList&&el.classList.contains('fp-money')){ if(el.__fpComposing||e.isComposing)return; fmt(el); } },true);
  document.addEventListener('change',function(e){ var el=e.target; if(el&&el.classList&&el.classList.contains('fp-money')&&!el.__fpComposing) fmt(el); },true);
  document.addEventListener('blur',function(e){ var el=e.target; if(el&&el.classList&&el.classList.contains('fp-money')&&!el.__fpComposing) fmt(el); },true);

  function boot(){ markAll(document); }
  if(document.readyState!=='loading') setTimeout(boot,0); else document.addEventListener('DOMContentLoaded',boot);
  // 遅延生成される入力欄にも対応（結果再描画等の後）
  window.addEventListener('load',function(){ setTimeout(function(){ markAll(document); },120); });
  window.fpMarkMoney=markAll;
})();
