import 'server-only';
import {hashSession} from './telegram/validation';
import {ZodError} from 'zod';
import {createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {initialState,migrateState} from './domain';
export const configured=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY);
export async function session(){if(!configured())throw Error('Accounts are not configured. Guest mode is available.');const store=await cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>store.getAll(),setAll:values=>values.forEach(({name,value,options})=>store.set(name,value,options))}})}
export function admin(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})}
export async function clearTelegramSession(){const store=await cookies(),token=store.get('nafs-telegram-session')?.value;if(token&&configured()){const {error}=await admin().from('telegram_sessions').delete().eq('token_hash',hashSession(token));if(error)throw Error('Sign out failed. Please try again.')}store.delete('nafs-telegram-session');if(process.env.APP_URL?.startsWith('https://'))store.set('nafs-telegram-session','',{httpOnly:true,secure:true,sameSite:'none',partitioned:true,path:'/',maxAge:0})}
export async function requireUser(){
 const db=await session(),token=(await cookies()).get('nafs-telegram-session')?.value;
 if(token){if(!/^[A-Za-z0-9_-]{43}$/.test(token))throw Error('Sign in to continue.');const {data,error}=await admin().from('telegram_sessions').select('user_id,expires_at').eq('token_hash',hashSession(token)).maybeSingle();if(error||!data||(!Number.isFinite(Date.parse(data.expires_at))||Date.parse(data.expires_at)<=Date.now()))throw Error('Sign in to continue.');const {data:identity}=await admin().from('telegram_identities').select('display_name').eq('user_id',data.user_id).single();if(!identity)throw Error('Sign in to continue.');return {db,user:{id:data.user_id,email:identity.display_name},provider:'telegram' as const}}
 const {data:{user},error}=await db.auth.getUser();if(error||!user)throw Error('Sign in to continue.');return {db,user,provider:'email' as const}
}
export async function snapshot(userId:string){const db=admin();const {data,error}=await db.from('user_preferences').select('state,revision').eq('user_id',userId).maybeSingle();if(error)throw Error('Database unavailable. Apply the NAFS migrations.');const {data:custom,error:customError}=await db.from('challenges').select('content').eq('owner_id',userId);if(customError)throw Error('Could not load saved marathons.');const state=data?.state&&Object.keys(data.state).length?migrateState(data.state):structuredClone(initialState);for(const row of custom||[])if(!state.customChallenges.some(c=>c.id===row.content.id))state.customChallenges.push(row.content);return {state,revision:data?.revision||0}}
export async function guard(req:Request,userId:string,kind:string,limit=30){if(['data','account','support'].includes(kind)&&req.headers.get('x-nafs-workspace')!==userId)throw Error('Your account changed. Refresh before continuing.');const origin=req.headers.get('origin');const expected=process.env.APP_URL||new URL(req.url).origin;if(origin!==new URL(expected).origin)throw Error('Request origin is not allowed.');const {data,error}=await admin().rpc('consume_rate_limit',{p_key:`${userId}:${kind}`,p_limit:limit});if(error||!data)throw Error('Too many requests. Please try again later.')}
export function fail(e:unknown,status=400){return NextResponse.json({error:e instanceof ZodError?'Please check the fields and try again.':e instanceof Error?e.message:'Request failed.'},{status,headers:{'Cache-Control':'no-store'}})}
