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
 const {user,replayKey}=validateInitData(initData,process.env.TELEGRAM_BOT_TOKEN),db=admin();
 await guard(req,'telegram-id:'+user.id,'login',10);
 const previous=(await cookies()).get('nafs-telegram-session')?.value;
 if(previous){const {data:existingSession}=await db.from('telegram_sessions').select('user_id,expires_at').eq('token_hash',hashSession(previous)).maybeSingle();if(existingSession&&Date.parse(existingSession.expires_at)>Date.now()){const {data:owner}=await db.from('telegram_identities').select('telegram_id').eq('user_id',existingSession.user_id).maybeSingle();if(String(owner?.telegram_id)===String(user.id))return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}})}await clearTelegramSession()}

 const {data:consumed,error:replayError}=await db.rpc('consume_telegram_auth',{p_hash:replayKey});if(replayError)throw Error('Telegram storage is not configured.');if(!consumed)throw Error('Telegram sign-in expired. Reopen the Mini App.');
 const {data:identity,error}=await db.from('telegram_identities').select('user_id').eq('telegram_id',user.id).maybeSingle();if(error)throw Error('Telegram storage is not configured.');let userId=identity?.user_id;
 if(!userId){
 // Random synthetic address and password cannot be used to guess a Telegram account's credentials.
 const {data:created,error:createError}=await db.auth.admin.createUser({email:`${randomUUID()}@telegram.nafs.invalid`,password:randomBytes(48).toString('base64url'),email_confirm:true});
 if(createError||!created.user)throw Error('Telegram sign-in unavailable.');
 const {error:insertError}=await db.from('telegram_identities').insert({telegram_id:user.id,user_id:created.user.id,display_name:[user.first_name,user.last_name].filter(Boolean).join(' ')});
 if(insertError){await db.auth.admin.deleteUser(created.user.id);const {data:existing}=await db.from('telegram_identities').select('user_id').eq('telegram_id',user.id).maybeSingle();if(!existing)throw Error('Telegram sign-in unavailable.');userId=existing.user_id}else userId=created.user.id;
 }
 const token=randomBytes(32).toString('base64url'),expires=new Date(Date.now()+7*86400000);
 const {error:saveError}=await db.from('telegram_sessions').insert({token_hash:hashSession(token),user_id:userId,expires_at:expires.toISOString()});if(saveError)throw Error('Telegram sign-in unavailable.');
 (await cookies()).set('nafs-telegram-session',token,{httpOnly:true,secure:new URL(expected).protocol==='https:',sameSite:new URL(expected).protocol==='https:'?'none':'lax',partitioned:new URL(expected).protocol==='https:',path:'/',expires});
 return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return fail(e,401)}}
