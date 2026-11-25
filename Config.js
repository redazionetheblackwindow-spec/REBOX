// REBOX - Collegamento Supabase FISSO e nascosto.
// I valori veri stanno qui sotto, spezzati in pezzi e rimontati all'avvio in ordine rimescolato:
// non si leggono a colpo d'occhio nel file, non si trovano con una ricerca, e non si cambiano da Admin.
// NOTA: la anon key è "pubblica" per come è fatto Supabase: chiunque apre il sito col browser la può
// vedere negli strumenti sviluppatore. Non è una password: da sola non basta a entrare. Quello che
// conta è che in Supabase le tabelle abbiano le regole giuste (RLS). Qui la togliamo dalla vista
// e impediamo che qualcuno la modifichi dalla pagina Admin.
var _REBOX_SB_URL_P = ["qkaixgehdmonfo", ".supabase.co", "https://huzwjr"];
var _FIXED_URL = _REBOX_SB_URL_P[2] + _REBOX_SB_URL_P[0] + _REBOX_SB_URL_P[1];
var _REBOX_SB_KEY_P = ["MjExMDY1MDEwMX0.PRD1oWEiJnhEraNrvtv9HEj93zk5FWkNt5ps_6KuiNI", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6I", "mh1endqcnFrYWl4Z2VoZG1vbmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNzQxMDEsImV4cCI6"];
var _FIXED_KEY = _REBOX_SB_KEY_P[1] + _REBOX_SB_KEY_P[2] + _REBOX_SB_KEY_P[0];
// I valori fissi si attivano solo quando sono quelli veri: finché ci sono i segnaposto,
// il sito continua a usare quelli salvati nel browser, così non si rompe niente.
var _HAS_FIXED = _FIXED_URL.indexOf('TUO-PROGETTO')===-1 && _FIXED_KEY.indexOf('LA-TUA-ANON-KEY')===-1;
window.REBOX_SB_URL = _HAS_FIXED ? _FIXED_URL : (localStorage.getItem('reboxSbUrl') || _FIXED_URL);
window.REBOX_SB_KEY = _HAS_FIXED ? _FIXED_KEY : (localStorage.getItem('reboxSbKey') || _FIXED_KEY);
// Quando i valori fissi sono attivi, vincono su tutto: cancello quelli vecchi salvati nel browser, così Admin non li sovrascrive più.
if(_HAS_FIXED){ try{ localStorage.removeItem('reboxSbUrl'); localStorage.removeItem('reboxSbKey'); }catch(e){} }

// PayPal Client ID LIVE - mettilo qui UNA VOLTA, così funziona su tutti i PC, non solo sul tuo
window.REBOX_PAYPAL_ID = "TUO-PAYPAL-CLIENT-ID-LIVE";

// ===== REBOX INVITA E VINCI (fidelity / referral) =====
// Contano SOLO gli acquisti di pacchi sorpresa pagati (Pacco Piccolo / Medio / Grande).
// Ogni 10 pacchi comprati dagli invitati = 1 pacco gratis.
// La taglia del pacco gratis = la taglia più comprata in quei 10 (maggioranza). Pareggio -> vince la taglia più grande.
// Il premio lo consegna Admin col bottone "Segna pacco gratis spedito": mai in automatico.
// Sta in config.js così vale su TUTTE le pagine senza toccare gli HTML.
(function(){ try{ var m=window.location.search.match(/[?&]ref=([A-Za-z0-9\-_]+)/); if(m){ localStorage.setItem('reboxPendingRef', m[1].toUpperCase()); } }catch(e){} })();
function reboxPackSizeOf(name){ name=String(name||''); if(name.indexOf('Pacco Grande')!==-1) return 'Grande'; if(name.indexOf('Pacco Medio')!==-1) return 'Medio'; if(name.indexOf('Pacco Piccolo')!==-1) return 'Piccolo'; return ''; }
function reboxRefCodeFor(user){ var base=String((user&&user.name)||'UTENTE').split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||'REBOX'; var au=(typeof allUsers!=='undefined' && Array.isArray(allUsers))?allUsers:[]; var code=''; var tries=0; do{ code=base+'-'+Math.floor(1000+Math.random()*9000); tries++; }while(tries<20 && au.some(function(u){ return u.refCode===code; })); return code; }
function reboxEnsureRefCodes(){ try{ var au=(typeof allUsers!=='undefined' && Array.isArray(allUsers))?allUsers:[]; var changed=false; au.forEach(function(u){ if(!u.refCode){ u.refCode=reboxRefCodeFor(u); changed=true; } }); if(typeof currentUser!=='undefined' && currentUser && !currentUser.refCode){ currentUser.refCode=reboxRefCodeFor(currentUser); changed=true; } if(changed){ localStorage.setItem('reboxUsers', JSON.stringify(au)); if(typeof currentUser!=='undefined' && currentUser) localStorage.setItem('reboxCurrentUser', JSON.stringify(currentUser)); if(typeof saveUsersToCloud==='function') saveUsersToCloud(); } }catch(e){} }
function reboxReferralData(){ var users=[]; var orders=[]; try{ users=JSON.parse(localStorage.getItem('reboxUsers')||'[]'); }catch(e){} try{ orders=JSON.parse(localStorage.getItem('reboxOrders')||'[]'); }catch(e){} var byEmail={}; users.forEach(function(u){ if(u.email) byEmail[String(u.email).toLowerCase()]=u; }); var perCode={}; function entryFor(code){ if(!perCode[code]) perCode[code]={packs:[],invitees:[],own:0,invited:0}; return perCode[code]; } users.forEach(function(u){ if(u.referredBy && u.referredBy!==u.refCode){ var e=entryFor(u.referredBy); if(u.email && e.invitees.indexOf(u.email)===-1) e.invitees.push(u.email); } }); orders.forEach(function(o){ var buyer=o.email?byEmail[String(o.email).toLowerCase()]:null; if(!buyer) return; var targets=[]; if(buyer.referredBy) targets.push({code:buyer.referredBy, kind:'invited'}); if(buyer.refCode) targets.push({code:buyer.refCode, kind:'own'}); (o.items||[]).forEach(function(it){ var s=reboxPackSizeOf(it.name||''); if(!s) return; targets.forEach(function(t){ var e2=entryFor(t.code); e2.packs.push(s); if(t.kind==='own') e2.own++; else e2.invited++; }); }); }); return {users:users, orders:orders, perCode:perCode}; }
function reboxRewardSizeFor(packs){ var rewards=[]; for(var i=0;i+10<=packs.length;i+=10){ var block=packs.slice(i,i+10); var cnt={Piccolo:0,Medio:0,Grande:0}; block.forEach(function(s){ cnt[s]++; }); var best='Piccolo'; ['Grande','Medio','Piccolo'].forEach(function(s){ if(cnt[s]>cnt[best]) best=s; }); rewards.push({block:i/10, size:best, counts:cnt}); } return rewards; }
function reboxStoredRewards(){ try{ var r=JSON.parse(localStorage.getItem('reboxReferralRewards')||'[]'); return Array.isArray(r)?r:[]; }catch(e){ return []; } }
async function reboxSaveRewards(list){ try{ localStorage.setItem('reboxReferralRewards', JSON.stringify(list)); var url=localStorage.getItem('reboxSbUrl')||window.REBOX_SB_URL||''; var key=localStorage.getItem('reboxSbKey')||window.REBOX_SB_KEY||''; if(!url||!key||url.indexOf('TUO-PROGETTO')!==-1) return; await fetch(url+'/rest/v1/rebox_settings',{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},body:JSON.stringify({id:'referral_rewards',value:list})}); }catch(e){} }
async function reboxLoadRewards(){ try{ var url=localStorage.getItem('reboxSbUrl')||window.REBOX_SB_URL||''; var key=localStorage.getItem('reboxSbKey')||window.REBOX_SB_KEY||''; if(!url||!key||url.indexOf('TUO-PROGETTO')!==-1) return; var r=await fetch(url+'/rest/v1/rebox_settings?id=eq.referral_rewards',{headers:{'apikey':key,'Authorization':'Bearer '+key}}); var j=await r.json(); if(j&&j[0]&&Array.isArray(j[0].value)){ var local=reboxStoredRewards(); var map={}; local.forEach(function(x){ map[x.code+'|'+x.block]=x; }); j[0].value.forEach(function(x){ var k=x.code+'|'+x.block; if(!map[k] || x.status==='delivered') map[k]=x; }); var merged=Object.keys(map).map(function(k){ return map[k]; }); localStorage.setItem('reboxReferralRewards', JSON.stringify(merged)); if(typeof renderReferralPanel==='function') renderReferralPanel(); if(typeof renderReferralAdmin==='function') renderReferralAdmin(); } }catch(e){} }
function reboxSyncRewards(){ var data=reboxReferralData(); var stored=reboxStoredRewards(); var map={}; stored.forEach(function(x){ map[x.code+'|'+x.block]=x; }); var changed=false; Object.keys(data.perCode).forEach(function(code){ var expected=reboxRewardSizeFor(data.perCode[code].packs); expected.forEach(function(rw){ var k=code+'|'+rw.block; if(!map[k]){ map[k]={code:code,block:rw.block,size:rw.size,status:'pending',deliveredAt:''}; changed=true; } }); }); if(changed){ var list=Object.keys(map).map(function(k){ return map[k]; }); reboxSaveRewards(list); } return {data:data, stored:Object.keys(map).map(function(k){ return map[k]; })}; }
async function reboxDeliverReward(code, block){ var s=reboxSyncRewards(); var list=s.stored; var rec=list.find(function(x){ return x.code===code && x.block===block; }); if(!rec){ alert('Premio non trovato.'); return; } if(rec.status==='delivered'){ alert('Pacco già segnato come spedito.'); return; } if(!confirm('Segni il pacco gratis ('+rec.size+') come SPEDITO per il codice '+code+'?')) return; rec.status='delivered'; rec.deliveredAt=new Date().toLocaleString('it-IT'); await reboxSaveRewards(list); if(typeof renderReferralAdmin==='function') renderReferralAdmin(); if(typeof renderReferralPanel==='function') renderReferralPanel(); alert('✅ Pacco gratis '+rec.size+' segnato come spedito.'); }
function reboxCopyRefLink(){ var link=(window.location.origin||'')+'/index.html?ref='+(typeof currentUser!=='undefined' && currentUser && currentUser.refCode?currentUser.refCode:''); try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(link).then(function(){ alert('Link copiato! Condividilo: '+link); }); } else { prompt('Copia il tuo link invito:', link); } }catch(e){ prompt('Copia il tuo link invito:', link); } }
function renderReferralPanel(){ try{ var bar=document.getElementById('accountBar'); if(!bar) return; var box=document.getElementById('referralBox'); if(typeof currentUser==='undefined' || !currentUser){ if(box) box.style.display='none'; return; } if(!currentUser.refCode){ reboxEnsureRefCodes(); } if(!box){ box=document.createElement('div'); box.id='referralBox'; box.style.cssText='background:#FFF3E6;color:#111;padding:14px 20px;font-weight:700;border-bottom:3px solid #FF7A00'; bar.parentNode.insertBefore(box, bar.nextSibling); } box.style.display='block'; var data=reboxReferralData(); var mine=data.perCode[currentUser.refCode]||{packs:[],invitees:[]}; var rewards=reboxRewardSizeFor(mine.packs); var stored=reboxStoredRewards(); var packsN=mine.packs.length; var inBlock=packsN%10; var missing=packsN===0?10:(inBlock===0?0:10-inBlock); var cnt={Piccolo:0,Medio:0,Grande:0}; mine.packs.forEach(function(s){ cnt[s]++; }); var rewardsHtml=rewards.length?rewards.map(function(rw){ var st=stored.find(function(x){ return x.code===currentUser.refCode && x.block===rw.block; }); var done=st&&st.status==='delivered'; return '<div style="background:#fff;border:2px solid '+(done?'#2e7d32':'#FF7A00')+';border-radius:10px;padding:8px 10px;margin:4px 0">🎁 <b>Pacco gratis '+rw.size+'</b> — '+(done?'✅ Spedito!':'⏳ In attesa: Admin lo segna come spedito e te lo manda')+'</div>'; }).join(''):'<div style="opacity:.8">Ancora nessun pacco gratis sbloccato.</div>'; box.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><span>🎁 <b>INVITA E VINCI</b> — Condividi il tuo link: ogni 10 pacchi sorpresa comprati da te e dai tuoi invitati ti danno un pacco gratis!</span><button onclick="reboxCopyRefLink()" style="background:#071A33;color:#fff">📋 Copia il mio link invito</button></div><div style="background:#fff;border-radius:10px;padding:10px;margin-top:10px;word-break:break-all">Il tuo link: <b>'+(window.location.origin||'')+'/index.html?ref='+currentUser.refCode+'</b> &nbsp;|&nbsp; Il tuo codice: <b>'+currentUser.refCode+'</b></div><div style="margin-top:10px">👥 Invitati registrati: <b>'+mine.invitees.length+'</b> &nbsp;|&nbsp; 📦 Pacchi che contano per il tuo premio: <b>'+packsN+'</b> (tuoi: <b>'+(mine.own||0)+'</b> · dai tuoi invitati: <b>'+(mine.invited||0)+'</b>) (Piccolo: '+cnt.Piccolo+' · Medio: '+cnt.Medio+' · Grande: '+cnt.Grande+')<br>'+(missing>0?'⏳ Ti mancano <b>'+missing+'</b> pacchi per il prossimo pacco gratis.':'✅ Hai completato un blocco di 10 pacchi!')+'</div><div style="margin-top:8px">'+rewardsHtml+'</div><div style="font-size:12px;opacity:.8;margin-top:6px">Contano solo i pacchi sorpresa pagati. Il pacco gratis è della taglia più comprata in quei 10: se i tuoi invitati comprano più pacchi grandi, ti arriva un pacco grande.</div>'; }catch(e){ console.log('referral panel',e); } }
function reboxBuildAdminSection(){ try{ if(document.getElementById('referralAdminSection')) return; if(!document.getElementById('ordersList') || !document.getElementById('usersList')) return; var ordersEl=document.getElementById('ordersList'); var sec=document.createElement('div'); sec.id='referralAdminSection'; sec.style.cssText='background:#FFF3E6;color:#111;border-radius:20px;padding:20px;margin:18px 0'; sec.innerHTML='<h3>🎁 Invita e Vinci - Pacco gratis ogni 10 pacchi degli invitati</h3><p><b>Regole:</b> contano solo i pacchi sorpresa pagati (Piccolo / Medio / Grande) comprati da te e da chi si è registrato col tuo link di invito. Ogni 10 pacchi = 1 pacco gratis. La taglia del pacco gratis è quella più comprata in quei 10: se gli invitati comprano più pacchi grandi, il premio è un pacco grande. Il premio lo consegni tu col bottone qui sotto: <b>mai in automatico</b>.</p><button onclick="if(typeof loadOrders===\'function\')loadOrders(); if(typeof reboxLoadUsersFromCloud===\'function\')reboxLoadUsersFromCloud(); if(typeof reboxLoadRewards===\'function\')reboxLoadRewards(); renderReferralAdmin();">🔄 Aggiorna classifica inviti</button><div id="referralAdminList" style="background:#fff;padding:12px;border-radius:12px;margin-top:10px">Nessun invito ancora.</div>'; ordersEl.parentNode.insertBefore(sec, ordersEl.nextSibling); }catch(e){ console.log('referral admin section',e); } }
function renderReferralAdmin(){ try{ reboxBuildAdminSection(); var el=document.getElementById('referralAdminList'); if(!el) return; var s=reboxSyncRewards(); var data=s.data; var stored=s.stored; var codes=Object.keys(data.perCode); if(!codes.length){ el.innerHTML='<p>Nessun invito ancora. Quando un utente condivide il suo link e qualcuno si registra da quel link, lo vedrai qui.</p>'; return; } el.innerHTML=codes.map(function(code){ var info=data.perCode[code]; var user=data.users.find(function(u){ return u.refCode===code; }); var rewards=reboxRewardSizeFor(info.packs); var cnt={Piccolo:0,Medio:0,Grande:0}; info.packs.forEach(function(x){ cnt[x]++; }); var rwHtml=rewards.length?rewards.map(function(rw){ var st=stored.find(function(x){ return x.code===code && x.block===rw.block; }); var done=st&&st.status==='delivered'; return '<div style="background:#fff;border-radius:8px;padding:8px;margin:4px 0">🎁 Pacco gratis <b>'+rw.size+'</b> (blocco '+(rw.block+1)+': Piccolo '+rw.counts.Piccolo+' · Medio '+rw.counts.Medio+' · Grande '+rw.counts.Grande+') — '+(done?'✅ Spedito il '+(st.deliveredAt||''):'<b style="color:#d32f2f">⏳ DA SPEDIRE</b> <button onclick="reboxDeliverReward(\''+code+'\','+rw.block+')" style="background:#2e7d32;color:#fff">Segna pacco gratis spedito</button>')+'</div>'; }).join(''):'<div style="opacity:.8">Nessun premio ancora: servono 10 pacchi.</div>'; return '<div style="border-bottom:1px solid #eee;padding:10px 0"><b>'+(user?String(user.name).replace(/</g,'&lt;'):'Utente')+'</b> — codice <b>'+code+'</b>'+(user?' — '+String(user.email).replace(/</g,'&lt;'):'')+'<br>👥 Invitati: <b>'+info.invitees.length+'</b> &nbsp;|&nbsp; 📦 Pacchi che contano: <b>'+info.packs.length+'</b> (suoi: <b>'+(info.own||0)+'</b> · invitati: <b>'+(info.invited||0)+'</b>) (Piccolo: '+cnt.Piccolo+' · Medio: '+cnt.Medio+' · Grande: '+cnt.Grande+')'+rwHtml+'</div>'; }).join(''); }catch(e){ console.log('referral admin',e); } }
async function reboxLoadUsersFromCloud(){ try{ var url=localStorage.getItem('reboxSbUrl')||window.REBOX_SB_URL||''; var key=localStorage.getItem('reboxSbKey')||window.REBOX_SB_KEY||''; if(!url||!key||url.indexOf('TUO-PROGETTO')!==-1) return; var r=await fetch(url+'/rest/v1/rebox_settings?id=eq.users',{headers:{'apikey':key,'Authorization':'Bearer '+key}}); var j=await r.json(); if(j&&j[0]&&Array.isArray(j[0].value)){ var local=[]; try{ local=JSON.parse(localStorage.getItem('reboxUsers')||'[]'); }catch(e){} var byEmail={}; local.forEach(function(u){ if(u.email) byEmail[String(u.email).toLowerCase()]=u; }); var changed=false; j[0].value.forEach(function(cu){ if(!cu||!cu.email) return; var ex=byEmail[String(cu.email).toLowerCase()]; if(!ex){ local.push(cu); byEmail[String(cu.email).toLowerCase()]=cu; changed=true; } else { ['refCode','referredBy','name','phone'].forEach(function(f){ if(!ex[f] && cu[f]){ ex[f]=cu[f]; changed=true; } }); } }); if(changed){ localStorage.setItem('reboxUsers', JSON.stringify(local)); try{ allUsers=local; }catch(e){} if(typeof currentUser!=='undefined' && currentUser){ var me=byEmail[String(currentUser.email).toLowerCase()]; if(me){ currentUser=me; localStorage.setItem('reboxCurrentUser', JSON.stringify(currentUser)); } } if(typeof renderReferralPanel==='function') renderReferralPanel(); if(typeof renderReferralAdmin==='function') renderReferralAdmin(); } } }catch(e){ console.log('load utenti cloud',e); } }
document.addEventListener('DOMContentLoaded', function(){
  try{
    if(typeof window.doRegister==='function' && !window.doRegister._reboxRefWrapped){
      var _origDoRegister=window.doRegister;
      window.doRegister=function(){ _origDoRegister(); try{ var cu=null; try{ cu=JSON.parse(localStorage.getItem('reboxCurrentUser')||'null'); }catch(e){} if(cu && cu.email){ var users=[]; try{ users=JSON.parse(localStorage.getItem('reboxUsers')||'[]'); }catch(e){} var idx=users.findIndex(function(u){ return String(u.email).toLowerCase()===String(cu.email).toLowerCase(); }); var target=idx>=0?users[idx]:cu; var changed=false; if(!target.refCode){ target.refCode=reboxRefCodeFor(target); changed=true; } var pending=localStorage.getItem('reboxPendingRef')||''; if(pending && !target.referredBy && pending!==target.refCode){ target.referredBy=pending; changed=true; } if(changed){ if(idx>=0) users[idx]=target; else users.push(target); localStorage.setItem('reboxUsers', JSON.stringify(users)); localStorage.setItem('reboxCurrentUser', JSON.stringify(target)); try{ allUsers=users; }catch(e){} try{ currentUser=target; }catch(e){} if(typeof saveUsersToCloud==='function') saveUsersToCloud(); } localStorage.removeItem('reboxPendingRef'); } }catch(e){ console.log('referral post-register',e); } if(typeof renderReferralPanel==='function') renderReferralPanel(); };
      window.doRegister._reboxRefWrapped=true;
    }
    if(typeof window.openRegister==='function' && !window.openRegister._reboxRefWrapped){
      var _origOpenRegister=window.openRegister;
      window.openRegister=function(){ _origOpenRegister(); try{ var pr=localStorage.getItem('reboxPendingRef')||''; var note=document.getElementById('refInviteNote'); if(pr){ if(!note){ note=document.createElement('p'); note.id='refInviteNote'; note.style.cssText='background:#E8F5E9;padding:10px;border-radius:10px;font-weight:800'; var rn=document.getElementById('regName'); if(rn&&rn.parentNode) rn.parentNode.insertBefore(note, rn); } note.style.display='block'; note.textContent='🎁 Sei stato invitato! Codice invito: '+pr+' — se ti registri, chi ti ha invitato fa un passo verso il suo pacco gratis.'; } else if(note){ note.style.display='none'; } }catch(e){} };
      window.openRegister._reboxRefWrapped=true;
    }
    if(typeof window.updateAccountBar==='function' && !window.updateAccountBar._reboxRefWrapped){
      var _origUAB=window.updateAccountBar;
      window.updateAccountBar=function(){ _origUAB(); if(typeof renderReferralPanel==='function') renderReferralPanel(); };
      window.updateAccountBar._reboxRefWrapped=true;
    }
  }catch(e){ console.log('referral wrap',e); }
  try{ reboxEnsureRefCodes(); }catch(e){}
  reboxLoadUsersFromCloud(); reboxLoadRewards(); renderReferralPanel(); renderReferralAdmin();
});
document.addEventListener('visibilitychange', function(){ if(!document.hidden){ reboxLoadUsersFromCloud(); reboxLoadRewards(); renderReferralPanel(); renderReferralAdmin(); } });
setInterval(function(){ try{ reboxLoadUsersFromCloud(); reboxLoadRewards(); renderReferralPanel(); renderReferralAdmin(); }catch(e){} }, 20000);

// ===== REBOX LOGIN / REGISTRAZIONE SEPARATI + NIENTE DUPLICATI =====
// Nella finestra account ora ci sono due tasti: Registrati e Accedi.
// - Accedi: solo email + password, per chi ha già l'account.
// - Registrati: se email o telefono sono già usati da un altro account, la registrazione si blocca.
(function(){
  function reboxGetUsers(){ try{ return JSON.parse(localStorage.getItem('reboxUsers')||'[]'); }catch(e){ return []; } }
  window.reboxSetAuthMode=function(mode){
    window._reboxAuthMode=mode;
    var tabR=document.getElementById('reboxTabRegister'), tabL=document.getElementById('reboxTabLogin');
    if(tabR) tabR.style.cssText='flex:1;padding:12px;border-radius:999px;font-weight:900;border:0;cursor:pointer;background:'+(mode==='register'?'#FF7A00;color:#071A33':'#ddd;color:#111');
    if(tabL) tabL.style.cssText='flex:1;padding:12px;border-radius:999px;font-weight:900;border:0;cursor:pointer;background:'+(mode==='login'?'#FF7A00;color:#071A33':'#ddd;color:#111');
    var show=mode==='register';
    ['regName','regPhone'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display=show?'':'none'; });
    var priv=document.getElementById('regPrivacy'); if(priv && priv.parentNode) priv.parentNode.style.display=show?'':'none';
    var btn=document.querySelector('#registerModal button[onclick="doRegister()"]'); if(btn) btn.textContent=show?'Crea account e accedi':'Accedi';
    var h2=document.querySelector('#registerModal h2'); if(h2) h2.textContent=show?'📝 Registrati a REBOX':'🔑 Accedi a REBOX';
    var msg=document.getElementById('regMsg'); if(msg) msg.textContent='';
  };
  function reboxBuildAuthTabs(){
    if(document.getElementById('reboxTabRegister')) return;
    var nameEl=document.getElementById('regName'); if(!nameEl || !nameEl.parentNode) return;
    var wrap=document.createElement('div'); wrap.style.cssText='display:flex;gap:8px;margin-bottom:8px';
    wrap.innerHTML='<button type="button" id="reboxTabRegister" onclick="reboxSetAuthMode(\'register\')" style="flex:1">📝 Registrati</button><button type="button" id="reboxTabLogin" onclick="reboxSetAuthMode(\'login\')" style="flex:1">🔑 Accedi</button>';
    nameEl.parentNode.insertBefore(wrap, nameEl);
    window.reboxSetAuthMode(window._reboxAuthMode||'register');
  }
  document.addEventListener('DOMContentLoaded', function(){
    reboxBuildAuthTabs();
    var prev=window.doRegister;
    window.doRegister=function(){
      var mode=window._reboxAuthMode||'register';
      var msgEl=document.getElementById('regMsg');
      var emailEl=document.getElementById('regEmail'), passEl=document.getElementById('regPass');
      var email=emailEl?(emailEl.value||'').trim().toLowerCase():'';
      var pass=passEl?passEl.value:'';
      if(mode==='login'){
        if(!email||!pass){ if(msgEl) msgEl.textContent='Inserisci email e password.'; return; }
        var users=reboxGetUsers();
        var found=users.find(function(u){ return String(u.email||'').toLowerCase()===email; });
        if(!found){ if(msgEl) msgEl.textContent='Nessun account con questa email. Prima registrati.'; return; }
        if(found.pass!==pass){ if(msgEl) msgEl.textContent='Password sbagliata.'; return; }
        try{ currentUser=found; }catch(e){}
        localStorage.setItem('reboxCurrentUser', JSON.stringify(found));
        closeRegister(); if(typeof updateAccountBar==='function') updateAccountBar();
        alert('Bentornato '+found.name+'!');
        return;
      }
      var phoneEl=document.getElementById('regPhone');
      var phone=phoneEl?(phoneEl.value||'').trim():'';
      var users2=reboxGetUsers();
      if(email && users2.some(function(u){ return String(u.email||'').toLowerCase()===email; })){ if(msgEl) msgEl.textContent='Email già registrata. Usa il tasto Accedi.'; return; }
      if(phone && users2.some(function(u){ return String(u.phone||'').trim()===phone; })){ if(msgEl) msgEl.textContent='Questo numero è già registrato con un altro account.'; return; }
      if(typeof prev==='function') prev();
    };
  });
})();

// ===== REBOX SUPABASE FISSO: NASCONDI I CAMPI IN ADMIN =====
// La pagina Admin aveva i campi per cambiare URL e chiave: ora sono nascosti e il bottone
// Salva non li tocca più (salva solo il PayPal). I valori veri restano solo qui sopra, in config.js.
document.addEventListener('DOMContentLoaded', function(){
  try{
    var sbUrlEl=document.getElementById('sbUrl'), sbKeyEl=document.getElementById('sbKey');
    if(sbUrlEl || sbKeyEl){
      Array.prototype.forEach.call(document.querySelectorAll('label'), function(l){ if(l.textContent.indexOf('Supabase')!==-1) l.style.display='none'; });
      if(sbUrlEl) sbUrlEl.style.display='none';
      if(sbKeyEl) sbKeyEl.style.display='none';
      var note=document.createElement('p'); note.style.cssText='font-weight:800';
      note.textContent='🔒 Supabase fisso: URL e chiave sono nel file config.js e non si cambiano da qui.';
      var btn=document.querySelector('button[onclick="saveAdmin()"]'); if(btn && btn.parentNode) btn.parentNode.insertBefore(note, btn);
    }
  }catch(e){ console.log('nascondi supabase admin', e); }
  try{
    if(typeof window.saveAdmin==='function' && !window.saveAdmin._reboxFixed){
      var _origSaveAdmin=window.saveAdmin;

      window.saveAdmin=function(){ _origSaveAdmin(); try{ localStorage.removeItem('reboxSbUrl'); localStorage.removeItem('reboxSbKey'); }catch(e){} };
      window.saveAdmin._reboxFixed=true;
    }
  }catch(e){ console.log('blocca saveAdmin supabase', e); }

// ===== REBOX BOOTSTRAP: se Supabase è vuoto ma il browser ha dati, spingili su =====
// Serve la prima volta, dopo aver creato la tabella: utenti e ordini che finora stavano
// solo nel browser del PC vengono caricati in Supabase. Spinge SOLO se la riga in cloud
// è vuota o manca: non sovrascrive mai dati che ci sono già.
async function reboxPushLocalToCloudIfEmpty(){
  try{
    var url=window.REBOX_SB_URL||'', key=window.REBOX_SB_KEY||'';
    if(!url||!key||url.indexOf('TUO-PROGETTO')!==-1) return;
    var jobs=[{id:'users', localKey:'reboxUsers'}, {id:'orders', localKey:'reboxOrders'}, {id:'referral_rewards', localKey:'reboxReferralRewards'}];
    for(var i=0;i<jobs.length;i++){
      var job=jobs[i];
      var local=[]; try{ local=JSON.parse(localStorage.getItem(job.localKey)||'[]'); }catch(e){}
      if(!Array.isArray(local)||!local.length) continue;
      var r=await fetch(url+'/rest/v1/rebox_settings?id=eq.'+job.id,{headers:{'apikey':key,'Authorization':'Bearer '+key}});
      var j=await r.json();
      var cloudEmpty=!j||!j.length||!Array.isArray(j[0].value)||!j[0].value.length;
      if(cloudEmpty){
        await fetch(url+'/rest/v1/rebox_settings',{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},body:JSON.stringify({id:job.id,value:local})});
      }
    }
  }catch(e){ console.log('bootstrap cloud',e); }
}
setTimeout(reboxPushLocalToCloudIfEmpty, 2000);
});

// ===== REBOX CODICE INVITO STABILE: un account = un codice, su tutti i PC =====
// Prima succedeva che su un PC nuovo l'account veniva ricreato con un codice nuovo,
// e quel codice nuovo finiva pure in Supabase. Ora: per ogni email resta UN SOLO record
// e per codice invito e invitato-da vince quello che sta in Supabase (il primo arrivato,
// quello condiviso da tutti i PC). Così tutti i PC convergono sullo stesso codice
// e nessuno genera più un codice a ogni accesso. Sostituisce la versione precedente.
async function reboxLoadUsersFromCloud(){
  try{
    var url=localStorage.getItem('reboxSbUrl')||window.REBOX_SB_URL||'';
    var key=localStorage.getItem('reboxSbKey')||window.REBOX_SB_KEY||'';
    if(!url||!key||url.indexOf('TUO-PROGETTO')!==-1) return;
    var r=await fetch(url+'/rest/v1/rebox_settings?id=eq.users',{headers:{'apikey':key,'Authorization':'Bearer '+key}});
    var j=await r.json();
    if(j&&j[0]&&Array.isArray(j[0].value)){
      var local=[]; try{ local=JSON.parse(localStorage.getItem('reboxUsers')||'[]'); }catch(e){}
      var byEmail={}; local.forEach(function(u){ if(u.email) byEmail[String(u.email).toLowerCase()]=u; });
      var changed=false; var seenCloud={};
      j[0].value.forEach(function(cu){
        if(!cu||!cu.email) return;
        var em=String(cu.email).toLowerCase();
        if(seenCloud[em]) return; // duplicato in cloud: conta solo il primo
        seenCloud[em]=true;
        var ex=byEmail[em];
        if(!ex){ local.push(cu); byEmail[em]=cu; changed=true; }
        else {
          // Vince Supabase per codice invito e invitato-da: è la verità condivisa da tutti i PC
          if(cu.refCode && ex.refCode!==cu.refCode){ ex.refCode=cu.refCode; changed=true; }
          if(cu.referredBy && ex.referredBy!==cu.referredBy){ ex.referredBy=cu.referredBy; changed=true; }
          ['name','phone'].forEach(function(f){ if(!ex[f] && cu[f]){ ex[f]=cu[f]; changed=true; } });
        }
      });
      // Toglie eventuali doppioni locali con la stessa email (resta il primo)
      var seenLocal={}; var deduped=[];
      local.forEach(function(u){ var em2=u.email?String(u.email).toLowerCase():''; if(em2 && seenLocal[em2]) return; if(em2) seenLocal[em2]=true; deduped.push(u); });
      if(deduped.length!==local.length){ local=deduped; changed=true; }
      if(changed){
        localStorage.setItem('reboxUsers', JSON.stringify(local));
        try{ allUsers=local; }catch(e){}
        if(typeof currentUser!=='undefined' && currentUser){
          var me=byEmail[String(currentUser.email).toLowerCase()];
          if(me){ currentUser=me; localStorage.setItem('reboxCurrentUser', JSON.stringify(currentUser)); }
        }
        if(typeof renderReferralPanel==='function') renderReferralPanel();
        if(typeof renderReferralAdmin==='function') renderReferralAdmin();
      }
    }
  }catch(e){ console.log('load utenti cloud',e); }
}
document.addEventListener('DOMContentLoaded', function(){
  try{
    // Prima di salvare gli utenti in Supabase, toglie i doppioni con stessa email.
    // Così un doppione non finisce mai più in cloud.
    if(typeof window.saveUsersToCloud==='function' && !window.saveUsersToCloud._reboxDedupe){
      var _origSaveUsers=window.saveUsersToCloud;
      window.saveUsersToCloud=function(){
        try{
          var au=[]; try{ au=JSON.parse(localStorage.getItem('reboxUsers')||'[]'); }catch(e){}
          var seen={}; var dd=[];
          au.forEach(function(u){ var em=u.email?String(u.email).toLowerCase():''; if(em && seen[em]) return; if(em) seen[em]=true; dd.push(u); });
          if(dd.length!==au.length){ localStorage.setItem('reboxUsers', JSON.stringify(dd)); try{ allUsers=dd; }catch(e){} }
        }catch(e){}
        return _origSaveUsers.apply(this, arguments);
      };
      window.saveUsersToCloud._reboxDedupe=true;
    }
  }catch(e){ console.log('dedupe save utenti',e); }
});

// ===== REBOX HOME: togli il titolo Novità duplicato =====
// Nella home c'erano due titoli per la stessa sezione: quello fisso in HTML
// ("Novità - scorrono qui") e quello che scrive renderShop ("NOVITÀ - Scorrono in home").
// Resta solo quello del carosello. Toglie anche il secondo bottone "Vedi tutto" duplicato.
document.addEventListener('DOMContentLoaded', function(){
  try{
    var sec=document.getElementById('novita');
    if(sec){
      var h2=sec.querySelector('h2');
      if(h2 && h2.textContent.indexOf('Novità')!==-1) h2.remove();
      var seen=false;
      Array.prototype.forEach.call(sec.querySelectorAll('a[href="negozio.html"]'), function(a){
        if(seen){ var p=a.parentNode; if(p) p.remove(); } else seen=true;
      });
    }
  }catch(e){ console.log('fix novita duplicata',e); }
});
