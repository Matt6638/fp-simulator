/* ===== FPシミュレーター Service Worker（オフライン対応） =====
   全ツールと共有アセットを事前キャッシュし、オフラインでも起動できるようにする。
   更新時は CACHE のバージョンを上げると、次回オンライン時に自動で入れ替わる。 */
const CACHE = 'fp-cache-v1';

const ASSETS = [
  './',
  './index.html',
  './login.html',
  './privacy.html',
  './terms.html',
  './manifest.webmanifest',
  './fp-deck.js',
  './fp-amount.js',
  './fp-pwa.js',
  './config.js',
  './fp-auth.js',
  './icon-192.png',
  './icon-1024.png',
  './apple-touch-icon.png',
  './教育資金シミュレーター.html',
  './老後資金シミュレーター.html',
  './変額年金シミュレーター.html',
  './不動産損益シミュレーター.html',
  './妻の収入シミュレーター.html',
  './リタイア後所得シミュレーター.html',
  './保険逆算シミュレーター.html',
  './役員報酬シミュレーター.html',
  './法人活用シミュレーター.html',
  './相続シミュレーター.html',
  './相続税シミュレーター.html',
  './贈与税シミュレーター.html',
  './退職金シミュレーター.html',
  './遺族年金シミュレーター.html'
];

// インストール：できる限り事前キャッシュ（1件失敗しても全体を止めない）
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.all(ASSETS.map(function(a){ return c.add(a).catch(function(){}); }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

// 有効化：古いキャッシュを削除
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// 取得：同一オリジンはキャッシュ優先（無ければ取得してキャッシュ）。
// クロスオリジン（SupabaseのCDN等）は素通し＝オフラインでは失敗するが、認証未設定のため動作に影響なし。
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return; // クロスオリジンはSWで扱わない
  e.respondWith(
    caches.match(req).then(function(cached){
      if(cached) return cached;
      return fetch(req).then(function(res){
        if(res && res.status===200 && res.type==='basic'){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){
        // オフラインでキャッシュにも無い場合はトップへフォールバック（HTMLナビゲーション時）
        if(req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
