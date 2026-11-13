import type {TelegramWebApp} from './client';

let inFlight:{launch:string;promise:Promise<void>}|null=null;
/** StrictMode and concurrent mounted components share one login, never two replay consumers. */
export function authenticateTelegram(app:TelegramWebApp){
 if(inFlight?.launch===app.initData)return inFlight.promise;
 const promise=(async()=>{
  const response=await fetch('/api/auth/telegram',{credentials:'same-origin',signal:AbortSignal.timeout(30000),method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({initData:app.initData})});
  const payload=await response.json();
  if(!response.ok||!payload.ok)throw Error(JSON.stringify({code:payload.code||'TELEGRAM_UNAVAILABLE',diagnosticId:payload.diagnosticId||'',message:payload.error||'Telegram sign-in unavailable.'}));
 })();
 inFlight={launch:app.initData,promise};
 void promise.finally(()=>{if(inFlight?.promise===promise)inFlight=null}).catch(()=>{});
 return promise;
}

// An explicit logout/deletion applies only to this launch, never to a later Telegram account.
// Store a digest, not Telegram initData or identity fields. This preference grants no access.
async function launchDigest(app:TelegramWebApp){
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(app.initData));
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function rememberGuestLaunch(app:TelegramWebApp){sessionStorage.setItem('nafs-telegram-guest',await launchDigest(app))}
export async function isGuestLaunch(app:TelegramWebApp){
 const saved=sessionStorage.getItem('nafs-telegram-guest');
 if(saved&&saved===await launchDigest(app))return true;
 sessionStorage.removeItem('nafs-telegram-guest');return false;
}
