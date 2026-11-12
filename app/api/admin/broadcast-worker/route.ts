import {workerAuthorized} from '@/lib/broadcast';
import {NextResponse} from 'next/server';
import {admin,configured} from '@/lib/server';
import {processBroadcast} from '@/lib/broadcast-server';
export const maxDuration=120;
export async function GET(req:Request){
 if(!workerAuthorized(req.headers.get('authorization')))return NextResponse.json({error:'Unauthorized'},{status:401});
 if(!configured()||!process.env.TELEGRAM_BOT_TOKEN)return NextResponse.json({error:'Broadcast backend is not configured'},{status:503});
 try{const {data,error}=await admin().from('broadcast_campaigns').select('id').eq('status','queued').order('created_at').limit(1);if(error)throw Error();const processed=data?.[0]?await processBroadcast(data[0].id):0;return NextResponse.json({processed},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Broadcast worker failed. Review delivery states before retrying.'},{status:503})}
}
