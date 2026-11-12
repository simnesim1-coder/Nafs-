import 'server-only';
import {admin,requireUser} from './server';
import {adminAllowed,deliveryOutcome,type DeliveryOutcome} from './broadcast';
export async function requireBroadcastAdmin(){const identity=await requireUser();if(!adminAllowed(identity.user.id))throw Error('Administrator access required.');return identity}
export async function processBroadcast(campaignId:string){
 if(!process.env.TELEGRAM_BOT_TOKEN)throw Error('Telegram bot is not configured.');
 const db=admin();let processed=0;
 for(let i=0;i<10;i++){
  const claim=await db.rpc('claim_broadcast_delivery',{p_campaign:campaignId});
  if(claim.error)throw Error('Broadcast queue is unavailable.');
  const item=claim.data?.[0];if(!item)break;
  // Revocation may have happened after claiming; check immediately before contacting Telegram.
  const consent=await db.from('broadcast_recipients').select('enabled').eq('user_id',item.user_id).maybeSingle();
  if(consent.error||!consent.data?.enabled){const skipped=await db.from('broadcast_deliveries').update({status:'skipped',updated_at:new Date().toISOString()}).eq('campaign_id',campaignId).eq('user_id',item.user_id).eq('status','sending');if(skipped.error)throw Error('Queue update failed.');continue}
  let outcome:DeliveryOutcome={status:'uncertain'};
  try{
   const response=await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:item.telegram_id,text:item.body,link_preview_options:{is_disabled:true},protect_content:true}),signal:AbortSignal.timeout(10000)});
   const payload=await response.json().catch(()=>null);outcome=deliveryOutcome(response.status,payload);
  }catch{outcome={status:'uncertain'}}
  const result=await db.from('broadcast_deliveries').update({status:outcome.status,available_at:new Date(Date.now()+(outcome.retrySeconds||0)*1000).toISOString(),updated_at:new Date().toISOString()}).eq('campaign_id',campaignId).eq('user_id',item.user_id).eq('status','sending');
  // A database failure leaves a sending record. It cannot be claimed again automatically.
  if(result.error)throw Error('Delivery status uncertain. Review the queue before continuing.');
  if(outcome.blocked)await db.from('broadcast_recipients').update({enabled:false,updated_at:new Date().toISOString()}).eq('user_id',item.user_id);
  processed++;if(outcome.status==='pending')break;
 }
 const remaining=await db.from('broadcast_deliveries').select('user_id',{count:'exact',head:true}).eq('campaign_id',campaignId).eq('status','pending');
 if(!remaining.error&&remaining.count===0)await db.from('broadcast_campaigns').update({status:'completed'}).eq('id',campaignId).eq('status','queued');
 return processed;
}
