import {NextResponse} from 'next/server';
import {admin,fail} from '@/lib/server';
import {requireOwner} from '@/lib/owner-admin';
export const dynamic='force-dynamic';
/** Metadata only. Never return private workspaces, notes, SOS or credentials. */
export async function GET(req: Request) {
  try {
    await requireOwner();
    const db=admin();
    const since=new Date(Date.now()-86400000).toISOString();
    const [total,active,users]=await Promise.all([
      db.from('telegram_identities').select('telegram_id',{count:'exact',head:true}),
      db.from('telegram_identities').select('telegram_id',{count:'exact',head:true}).gte('last_seen_at',since),
      db.from('telegram_identities').select('telegram_id,display_name,username,language_code,created_at,last_seen_at,login_count').order('created_at',{ascending:false}).limit(100)
    ]);
    if(total.error||active.error||users.error)throw Error('Visitor analytics unavailable. Apply migration 006.');
    return NextResponse.json({total:total.count??0,active24h:active.count??0,users:users.data??[],showing:'100 newest registered accounts'}, {headers:{'Cache-Control':'private, no-store'}});
  }catch(e){return fail(e,403)}
}
