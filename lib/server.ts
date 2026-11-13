import 'server-only';
import {ApiError,databaseFailure,diagnostic,backendConfig,applicationOrigin} from './server-errors';
import {hashSession} from './telegram/validation';
import {ZodError} from 'zod';
import {createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {initialState,migrateState} from './domain';
export const configured=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY);
export async function session(){backendConfig();const store=await cookies();const config=backendConfig();return createServerClient(config.url,config.publishable,{cookies:{getAll:()=>store.getAll(),setAll:values=>values.forEach(({name,value,options})=>store.set(name,value,options))}})}
export function admin(){const config=backendConfig();return createClient(config.url,config.secret,{auth:{persistSession:false,autoRefreshToken:false}})}
export async function clearTelegramSession(){const store=await cookies(),token=store.get('nafs-telegram-session')?.value;if(token&&configured()){const {error}=await admin().from('telegram_sessions').delete().eq('token_hash',hashSession(token));if(error)throw new ApiError('REQUEST_REJECTED','Sign out failed. Please try again.',400)}store.delete('nafs-telegram-session');if(process.env.APP_URL?.startsWith('https://'))store.set('nafs-telegram-session','',{httpOnly:true,secure:true,sameSite:'none',partitioned:true,path:'/',maxAge:0})}
export async function requireUser(){
 const db=await session(),token=(await cookies()).get('nafs-telegram-session')?.value;
 if(token){if(!/^[A-Za-z0-9_-]{43}$/.test(token))throw new ApiError('AUTH_REQUIRED','Sign in to continue.',401);const {data,error}=await admin().from('telegram_sessions').select('user_id,expires_at').eq('token_hash',hashSession(token)).maybeSingle();if(error)throw databaseFailure(error,'read_session');if(!data||(!Number.isFinite(Date.parse(data.expires_at))||Date.parse(data.expires_at)<=Date.now()))throw new ApiError('SESSION_EXPIRED','Sign in to continue.',401);const {data:identity,error:identityError}=await admin().from('telegram_identities').select('display_name').eq('user_id',data.user_id).single();if(identityError)throw databaseFailure(identityError,'read_identity');if(!identity)throw new ApiError('SESSION_EXPIRED','Sign in to continue.',401);return {db,user:{id:data.user_id,email:identity.display_name},provider:'telegram' as const}}
 const {data:{user},error}=await db.auth.getUser();if(error||!user)throw new ApiError('AUTH_REQUIRED','Sign in to continue.',401);return {db,user,provider:'email' as const}
}
export async function snapshot(userId:string){const db=admin();const {data,error}=await db.from('user_preferences').select('state,revision').eq('user_id',userId).maybeSingle();if(error)throw databaseFailure(error,'read_workspace');const {data:custom,error:customError}=await db.from('challenges').select('content').eq('owner_id',userId);if(customError)throw databaseFailure(customError,'read_marathons');const state=data?.state&&Object.keys(data.state).length?migrateState(data.state):structuredClone(initialState);for(const row of custom||[])if(!state.customChallenges.some(c=>c.id===row.content.id))state.customChallenges.push(row.content);return {state,revision:data?.revision||0}}
export async function guard(req:Request,userId:string,kind:string,limit=30){
 if(['data','account','support'].includes(kind)&&req.headers.get('x-nafs-workspace')!==userId)throw new ApiError('WORKSPACE_CHANGED','Your account changed. Refresh before continuing.',409);
 if(req.headers.get('origin')!==applicationOrigin())throw new ApiError('ORIGIN_REJECTED','Request origin is not allowed.',403);
 let result;try{result=await admin().rpc('consume_rate_limit',{p_key:`${userId}:${kind}`,p_limit:limit})}catch(error){if(error instanceof ApiError)throw error;throw databaseFailure(error,'rate_limit')}
 if(result.error)throw databaseFailure({...result.error,status:result.status},'rate_limit');
 if(result.data===false)throw new ApiError('RATE_LIMITED','Too many requests. Please try again later.',429,60);
 if(result.data!==true)throw diagnostic(new ApiError('RATE_LIMIT_INVALID_RESULT','Database rate limiter returned an invalid response.',503),'rate_limit');
}
export function fail(e:unknown,_status=400){
 if(e instanceof ApiError)return NextResponse.json({error:e.message,code:e.code,diagnosticId:e.diagnosticId},{status:e.status,headers:{'Cache-Control':'no-store',...(e.retryAfter?{'Retry-After':String(e.retryAfter)}:{})}});
 if(e instanceof ZodError||e instanceof SyntaxError)return NextResponse.json({error:'Please check the fields and try again.',code:'INVALID_INPUT'},{status:400,headers:{'Cache-Control':'no-store'}});
 // Unknown exceptions may contain provider details or input. Never return them to the browser.
 const error=diagnostic(new ApiError('INTERNAL_ERROR','The request could not be completed. Contact support with the diagnostic ID.',500),'unhandled');
 return NextResponse.json({error:error.message,code:error.code,diagnosticId:error.diagnosticId},{status:500,headers:{'Cache-Control':'no-store'}});
}

export async function recordActivity(userId:string){
 try{const {error}=await admin().from('telegram_identities').update({last_seen_at:new Date().toISOString()}).eq('user_id',userId).lt('last_seen_at',new Date(Date.now()-60000).toISOString());if(error)databaseFailure(error,'touch_activity')}catch(error){databaseFailure(error,'touch_activity')}
}
