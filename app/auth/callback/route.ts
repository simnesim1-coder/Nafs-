import {NextResponse} from 'next/server';
import {session} from '@/lib/server';
export async function GET(req:Request){const url=new URL(req.url);const code=url.searchParams.get('code');if(code){const db=await session();const {error}=await db.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(url.searchParams.get('next')==='/reset-password'?'/reset-password':'/',url.origin))}return NextResponse.redirect(new URL('/?auth=failed',url.origin))}
