import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {randomBytes,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {admin,configured,guard,fail,clearTelegramSession} from '@/lib/server';
import {validateInitData,hashSession} from '@/lib/telegram/validation';
export const runtime='nodejs';
export async function POST(req:Request){try{
 if(!configured()||!process.env.TELEGRAM_BOT_TOKEN)return NextResponse.json({configured:false},{status:503});
 const expected=process.env.APP_URL;if(!expected||req.headers.get('origin')!==new URL(expected).origin)throw Error('Request origin is not allowed.');
 if(Number(req.headers.get('content-length')||0)>20000)throw Error('Invalid Telegram authentication.');
 const raw=await req.text();if(raw.length>20000)throw Error('Invalid Telegram authentication.');
 await guard(req,'telegram:'+req.headers.get('x-forwarded-for')?.split(',')[0],'login',20);
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
 await guard(req,'telegram-id:'+user.id,'login',10);
 if(previous){const {data:existingSession}=await db.from('telegram_sessions').select('user_id,expires_at').eq('token_hash',hashSession(previous)).maybeSingle();if(existingSession&&Date.parse(existingSession.expires_at)>Date.now()){const {data:owner}=await db.from('telegram_identities').select('telegram_id').eq('user_id',existingSession.user_id).maybeSingle();if(String(owner?.telegram_id)===String(user.id)){const {error:visitError}=await db.rpc('record_telegram_visit',{p_user:existingSession.user_id,p_telegram_id:user.id,p_name:[user.first_name,user.last_name].filter(Boolean).join(' '),p_username:user.username||null,p_language:user.language_code||null,p_new_login:false});if(visitError)throw Error('Apply NAFS migration 006.');return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}})}}await clearTelegramSession()}
 if(staleLaunch)throw Error('Telegram sign-in expired. Reopen the Mini App.');

 const {data:consumed,error:replayError}=await db.rpc('consume_telegram_auth',{p_hash:replayKey});if(replayError)throw Error('Telegram storage is not configured.');if(!consumed)throw Error('Telegram sign-in expired. Reopen the Mini App.');
 const {data:identity,error}=await db.from('telegram_identities').select('user_id').eq('telegram_id',user.id).maybeSingle();if(error)throw Error('Telegram storage is not configured.');let userId=identity?.user_id;
 if(!userId){
 // Random synthetic address and password cannot be used to guess a Telegram account's credentials.
 const {data:created,error:createError}=await db.auth.admin.createUser({email:`${randomUUID()}@telegram.nafs.invalid`,password:randomBytes(48).toString('base64url'),email_confirm:true});
 if(createError||!created.user)throw Error('Telegram sign-in unavailable.');
 const {error:insertError}=await db.from('telegram_identities').insert({telegram_id:user.id,user_id:created.user.id,display_name:[user.first_name,user.last_name].filter(Boolean).join(' ')});
 if(insertError){await db.auth.admin.deleteUser(created.user.id);const {data:existing}=await db.from('telegram_identities').select('user_id').eq('telegram_id',user.id).maybeSingle();if(!existing)throw Error('Telegram sign-in unavailable.');userId=existing.user_id}else userId=created.user.id;
 }
 const {error:visitError}=await db.rpc('record_telegram_visit',{p_user:userId,p_telegram_id:user.id,p_name:[user.first_name,user.last_name].filter(Boolean).join(' '),p_username:user.username||null,p_language:user.language_code||null,p_new_login:true});if(visitError)throw Error('Apply NAFS migration 006.');
 const token=randomBytes(32).toString('base64url'),expires=new Date(Date.now()+7*86400000);
 const {error:saveError}=await db.from('telegram_sessions').insert({token_hash:hashSession(token),user_id:userId,expires_at:expires.toISOString()});if(saveError)throw Error('Telegram sign-in unavailable.');
 (await cookies()).set('nafs-telegram-session',token,{httpOnly:true,secure:new URL(expected).protocol==='https:',sameSite:new URL(expected).protocol==='https:'?'none':'lax',partitioned:new URL(expected).protocol==='https:',path:'/',expires});
 return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return fail(e,401)}}
