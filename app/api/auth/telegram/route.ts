import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {z} from 'zod';
import {admin,configured,guard,fail,clearTelegramSession} from '@/lib/server';
import {ApiError,applicationOrigin,databaseFailure} from '@/lib/server-errors';
import {validateInitData,hashSession} from '@/lib/telegram/validation';
export const runtime='nodejs';
export async function POST(req:Request){try{
 if(!configured()||!process.env.TELEGRAM_BOT_TOKEN)throw new ApiError('BACKEND_NOT_CONFIGURED','Telegram accounts are not configured. Progress is saved only on this device.',503);
 const expected=applicationOrigin();if(req.headers.get('origin')!==expected)throw new ApiError('ORIGIN_REJECTED','Request origin is not allowed.',403);
 if(Number(req.headers.get('content-length')||0)>20000)throw new ApiError('REQUEST_REJECTED','Invalid Telegram authentication.',400);
 const raw=await req.text();if(raw.length>20000)throw new ApiError('REQUEST_REJECTED','Invalid Telegram authentication.',400);
 // Network buckets limit unauthenticated attempts, never grant identity. Hash to minimize stored metadata.
 const address=req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()||'unknown';
 await guard(req,'telegram-network:'+createHash('sha256').update(address).digest('hex'),'login',120);
 const {initData}=z.object({initData:z.string().max(16384)}).strict().parse(JSON.parse(raw));
 const previous=(await cookies()).get('nafs-telegram-session')?.value;
 // After ten minutes, a fresh account creation requires reopening Telegram. An already
 // authenticated, same-owner session may safely reuse older *signed* launch data.
 let validation:ReturnType<typeof validateInitData>;let staleLaunch=false;
 try{validation=validateInitData(initData,process.env.TELEGRAM_BOT_TOKEN)}catch(e){
   if(!(e instanceof Error) || e.message!=='Telegram sign-in expired. Reopen the Mini App.' || !previous)throw e;
   validation=validateInitData(initData,process.env.TELEGRAM_BOT_TOKEN,Math.floor(Date.now()/1000),7*86400);staleLaunch=true;
 }
 const {user,replayKey}=validation,db=admin();
 await guard(req,'telegram-identity:'+createHash('sha256').update(String(user.id)).digest('hex'),'login',30);
 if(previous){const {data:existingSession,error:sessionError}=await db.from('telegram_sessions').select('user_id,expires_at').eq('token_hash',hashSession(previous)).maybeSingle();if(sessionError)throw databaseFailure(sessionError,'read_session');if(existingSession&&Date.parse(existingSession.expires_at)>Date.now()){const {data:owner,error:ownerError}=await db.from('telegram_identities').select('telegram_id').eq('user_id',existingSession.user_id).maybeSingle();if(ownerError)throw databaseFailure(ownerError,'read_identity');if(String(owner?.telegram_id)===String(user.id)){const {data:visited,error:visitError}=await db.rpc('record_telegram_visit',{p_user:existingSession.user_id,p_telegram_id:user.id,p_name:[user.first_name,user.last_name].filter(Boolean).join(' '),p_username:user.username||null,p_language:user.language_code||null,p_new_login:false});if(visitError)throw databaseFailure(visitError,'record_telegram_visit');if(visited!==true)throw new ApiError('TELEGRAM_IDENTITY_MISMATCH','Telegram sign-in unavailable.',401);return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}})}}await clearTelegramSession()}
 if(staleLaunch)throw new ApiError('TELEGRAM_AUTH_EXPIRED','Telegram sign-in expired. Reopen the Mini App.',401);

 const {data:identity,error}=await db.from('telegram_identities').select('user_id').eq('telegram_id',user.id).maybeSingle();if(error)throw databaseFailure(error,'read_identity');let userId=identity?.user_id;
 if(!userId){
 // Random synthetic address and password cannot be used to guess a Telegram account's credentials.
 const {data:created,error:createError}=await db.auth.admin.createUser({email:`${randomUUID()}@telegram.nafs.invalid`,password:randomBytes(48).toString('base64url'),email_confirm:true});
 if(createError)throw databaseFailure(createError,'create_telegram_account');if(!created.user)throw new ApiError('TELEGRAM_ACCOUNT_FAILED','Telegram sign-in unavailable.',503);
 const {error:insertError}=await db.from('telegram_identities').insert({telegram_id:user.id,user_id:created.user.id,display_name:[user.first_name,user.last_name].filter(Boolean).join(' ')});
 if(insertError){await db.auth.admin.deleteUser(created.user.id);const {data:existing}=await db.from('telegram_identities').select('user_id').eq('telegram_id',user.id).maybeSingle();if(!existing)throw new ApiError('REQUEST_REJECTED','Telegram sign-in unavailable.',400);userId=existing.user_id}else userId=created.user.id;
 }
 const token=randomBytes(32).toString('base64url'),expires=new Date(Date.now()+7*86400000);
 // Replay consumption, session issuance and successful-login counting commit together.
 const {data:completed,error:completeError}=await db.rpc('complete_telegram_login',{p_hash:replayKey,p_token_hash:hashSession(token),p_user:userId,p_telegram_id:user.id,p_name:[user.first_name,user.last_name].filter(Boolean).join(' '),p_username:user.username||null,p_language:user.language_code||null});
 if(completeError)throw databaseFailure(completeError,'complete_telegram_login');
 if(completed!==true)throw new ApiError('TELEGRAM_AUTH_REPLAY','Telegram sign-in expired. Reopen the Mini App.',401);
 (await cookies()).set('nafs-telegram-session',token,{httpOnly:true,secure:new URL(expected).protocol==='https:',sameSite:new URL(expected).protocol==='https:'?'none':'lax',partitioned:new URL(expected).protocol==='https:',path:'/',expires});
 return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return fail(e,401)}}
