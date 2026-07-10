/* ===== FPシミュレーター 認証・利用計測（Phase1 / Supabase） ===== */
(function(){
  var URL=(window.FP_SB_URL||'').trim(), KEY=(window.FP_SB_ANON||'').trim();
  var configured = URL.indexOf('http')===0 && KEY.length>20;
  window.FPAuth={configured:configured};
  function showBody(){document.documentElement.style.visibility='';}
  if(!configured || !window.supabase){
    // 未設定：ゲートせず通常表示（移行中も既存挙動を維持）
    FPAuth.guard=function(){showBody();return Promise.resolve(null);};
    FPAuth.logEvent=function(){return Promise.resolve();};
    FPAuth.logout=function(){};
    FPAuth.currentUser=function(){return Promise.resolve(null);};
    showBody();
    return;
  }
  var sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  FPAuth.client=sb;
  function toolName(){return decodeURIComponent((location.pathname.split('/').pop()||'index.html').replace('.html','')) ;}
  FPAuth.guard=function(){
    return sb.auth.getSession().then(function(r){
      if(!r.data.session){
        var here=(location.pathname.split('/').pop())||'index.html';
        location.replace('login.html?next='+encodeURIComponent(here));
        return null;
      }
      showBody();
      return r.data.session.user;
    }).catch(function(){showBody();return null;});
  };
  FPAuth.logEvent=function(tool,action){
    return sb.auth.getUser().then(function(r){
      var u=r.data.user; if(!u) return;
      return sb.from('usage_events').insert({user_id:u.id,email:u.email,tool:tool||toolName(),action:action||'open'});
    }).catch(function(){});
  };
  FPAuth.logout=function(){sb.auth.signOut().then(function(){location.replace('login.html');});};
  FPAuth.currentUser=function(){return sb.auth.getUser().then(function(r){return r.data.user;});};
})();
