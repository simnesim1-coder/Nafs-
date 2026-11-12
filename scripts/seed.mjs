// Run with Node's built-in TypeScript stripping on Node 24+.
import {challenges} from '../lib/challenges.ts';
import {createClient} from '@supabase/supabase-js';
if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw Error('Set Supabase URL and service role key in your shell.');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
for(const c of challenges){const {error}=await db.from('challenges').upsert({id:c.id,owner_id:null,title:c.title,is_free:true,content:c});if(error)throw error;const {error:daysError}=await db.from('challenge_days').upsert(c.days.map((activity,i)=>({challenge_id:c.id,day:i+1,activity})));if(daysError)throw daysError;}
console.log(`Seeded ${challenges.length} free marathons and ${challenges.length*21} activities.`);
