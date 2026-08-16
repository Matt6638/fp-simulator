/* ===== fp-pwa.js : PWA（ホーム画面に追加してオフライン起動）を全ツールに付与 =====
   ・manifest / テーマカラー / iOS用メタ・アイコンを <head> に注入
   ・Service Worker を登録（オフラインキャッシュ）
   各ツールの </body> 直前に <script src="fp-pwa.js"></script> を1行入れるだけ。 */
(function(){
  if(window.__fpPWA) return; window.__fpPWA=true;
  var head=document.head||document.getElementsByTagName('head')[0];
  function add(tag, attrs){ if(!head) return; for(var i=0;i<head.children.length;i++){ var c=head.children[i]; if(c.tagName.toLowerCase()===tag && ((attrs.rel&&c.getAttribute('rel')===attrs.rel)||(attrs.name&&c.getAttribute('name')===attrs.name))) return; } var el=document.createElement(tag); for(var k in attrs){ el.setAttribute(k,attrs[k]); } head.appendChild(el); }

  add('link', {rel:'manifest', href:'manifest.webmanifest'});
  add('meta', {name:'theme-color', content:'#9a7b4f'});
  add('meta', {name:'apple-mobile-web-app-capable', content:'yes'});
  add('meta', {name:'apple-mobile-web-app-status-bar-style', content:'default'});
  add('meta', {name:'apple-mobile-web-app-title', content:'FP試算'});
  add('link', {rel:'apple-touch-icon', href:'apple-touch-icon.png'});

  // ===== オフライン対応（Service Worker 登録） =====
  // sw.js は「HTMLはネットワーク優先（オンライン時は常に最新）／JS等はキャッシュ優先」。
  // オンラインで一度開けば、以降はオフライン（iPad現地作業）でも起動できる。
  // 更新を配る側は sw.js の CACHE バージョンを上げること（次回オンライン時に自動入替）。
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      try{ navigator.serviceWorker.register('sw.js').catch(function(){}); }catch(_){}
    });
  }

  // iOS のホーム画面アプリ(standalone)は <a> リンクを別Safariで開こうとして遷移しないため、
  // 同一オリジン・内部リンクは window.location で「アプリ内遷移」に切り替える。
  var standalone = (window.navigator.standalone===true) ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches);
  if(standalone){
    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if(!a) return;
      if(e.defaultPrevented) return;                 // ドラッグ等で既に処理済みなら触らない
      if(a.getAttribute('target')==='_blank') return; // 別タブ指定は従来どおり
      if(a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if(!href || href.charAt(0)==='#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      var url;
      try{ url = new URL(a.href, location.href); }catch(_){ return; }
      if(url.origin !== location.origin) return;       // 外部サイトは通常挙動
      e.preventDefault();
      window.location.href = url.href;                 // アプリ内で遷移
    }, false);
  }
})();
