import {createHash,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
export const broadcastText=z.string().trim().min(1).max(3500);
export const broadcastAction=z.discriminatedUnion('action',[
 z.object({action:z.literal('draft'),text:broadcastText,key:z.uuid()}),
 z.object({action:z.literal('confirm'),id:z.uuid(),digest:z.string().regex(/^[a-f0-9]{64}$/)}),
 z.object({action:z.literal('process'),id:z.uuid()}),
 z.object({action:z.literal('cancel'),id:z.uuid()})
]);
export function adminAllowed(userId:string,configured=process.env.NAFS_ADMIN_USER_IDS||''){
 return configured.split(',').map(x=>x.trim()).filter(x=>z.uuid().safeParse(x).success).includes(userId);
}
export const contentDigest=(text:string)=>createHash('sha256').update(text).digest('hex');
export type DeliveryOutcome={status:'sent'|'pending'|'failed'|'uncertain';retrySeconds?:number;blocked?:boolean};
/** Telegram does not offer sendMessage idempotency. Never automatically retry ambiguous delivery. */
export function deliveryOutcome(httpStatus:number,payload:unknown):DeliveryOutcome{
 const data=payload as {ok?:boolean;error_code?:number;parameters?:{retry_after?:number}}|null;
 if(httpStatus===200&&data?.ok===true)return {status:'sent'};
 if(httpStatus===429&&data?.error_code===429)return {status:'pending',retrySeconds:Math.max(1,Math.min(3600,Number(data.parameters?.retry_after)||60))};
 if(httpStatus===403&&data?.error_code===403)return {status:'failed',blocked:true};
 if(httpStatus>=400&&httpStatus<500&&data?.ok===false)return {status:'failed'};
 return {status:'uncertain'};
}

export function workerAuthorized(header:string|null,secret=process.env.CRON_SECRET){if(!secret||secret.length<32)return false;const actual=Buffer.from(header||''),expected=Buffer.from('Bearer '+secret);return actual.length===expected.length&&timingSafeEqual(actual,expected)}
