import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
import {z} from 'zod';
import {ApiError} from '../server-errors';
const telegramUser=z.object({id:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),first_name:z.string().min(1).max(128),last_name:z.string().max(128).optional(),username:z.string().max(64).optional(),language_code:z.string().max(16).optional(),is_bot:z.boolean().optional()});
/** Telegram's HMAC protocol. Never accept initDataUnsafe or a client-supplied user ID. */
export function validateInitData(raw:string,botToken:string,now=Math.floor(Date.now()/1000),maxAgeSeconds=600){
 if(!botToken||!raw||Buffer.byteLength(raw)>16384)throw new ApiError('TELEGRAM_SIGNATURE_INVALID','Invalid Telegram authentication.',401);
 const params=new URLSearchParams(raw),seen=new Set<string>();
 for(const [key]of params){if(seen.has(key))throw new ApiError('TELEGRAM_SIGNATURE_INVALID','Invalid Telegram authentication.',401);seen.add(key)}
 const hash=params.get('hash');if(!hash||!/^[a-f0-9]{64}$/i.test(hash))throw new ApiError('TELEGRAM_SIGNATURE_INVALID','Invalid Telegram authentication.',401);
 const data=[...params.entries()].filter(([key])=>key!=='hash').sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,value])=>`${key}=${value}`).join('\n');
 const secret=createHmac('sha256','WebAppData').update(botToken).digest();
 const expected=createHmac('sha256',secret).update(data).digest();
 if(!timingSafeEqual(expected,Buffer.from(hash,'hex')))throw new ApiError('TELEGRAM_SIGNATURE_INVALID','Invalid Telegram authentication.',401);
 const time=params.get('auth_date')||'';if(!/^\d+$/.test(time))throw new ApiError('TELEGRAM_SIGNATURE_INVALID','Invalid Telegram authentication.',401);
 const issued=Number(time);if(issued>now+30||now-issued>maxAgeSeconds)throw new ApiError('TELEGRAM_AUTH_EXPIRED','Telegram sign-in expired. Reopen the Mini App.',401);
 let parsed:unknown;try{parsed=JSON.parse(params.get('user')||'null')}catch{throw new ApiError('TELEGRAM_SIGNATURE_INVALID','Invalid Telegram authentication.',401)}
 const result=telegramUser.safeParse(parsed);if(!result.success||result.data.is_bot)throw new ApiError('TELEGRAM_SIGNATURE_INVALID','Invalid Telegram authentication.',401);
 // Use the verified signature as replay key: reordering a query cannot evade replay protection.
 return {user:result.data,replayKey:createHash('sha256').update(hash.toLowerCase()).digest('hex')};
}
export const hashSession=(token:string)=>createHash('sha256').update(token).digest('hex');
