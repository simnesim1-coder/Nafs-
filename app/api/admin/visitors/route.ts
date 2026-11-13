import {NextResponse} from 'next/server';
import {z} from 'zod';
import {admin,fail} from '@/lib/server';
import {databaseFailure} from '@/lib/server-errors';
import {requireOwner} from '@/lib/owner-admin';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{
 await requireOwner();const query=new URL(req.url).searchParams;
 const input=z.object({search:z.string().trim().max(80),page:z.coerce.number().int().min(1).max(100000)}).parse({search:query.get('search')||'',page:query.get('page')||1});
 const {data,error}=await admin().rpc('owner_visitor_report',{p_search:input.search.replace(/^@/,''),p_page:input.page,p_size:20});
 if(error)throw databaseFailure(error,'owner_visitor_report');
 return NextResponse.json(data,{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return fail(error,403)}}
