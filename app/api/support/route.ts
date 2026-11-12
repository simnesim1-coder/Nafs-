import {NextResponse} from 'next/server';
import {z} from 'zod';
import {requireUser,admin,guard,fail} from '@/lib/server';
export async function POST(req:Request){try{const {user}=await requireUser();await guard(req,user.id,'support',5);const {message}=z.object({message:z.string().trim().min(5).max(2000)}).parse(await req.json());const {error}=await admin().from('support_requests').insert({user_id:user.id,message});if(error)throw Error('Could not save request.');return NextResponse.json({ok:true})}catch(e){return fail(e)}}
