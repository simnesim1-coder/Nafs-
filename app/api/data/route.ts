import {ApiError,databaseFailure} from '@/lib/server-errors';
import {NextResponse} from 'next/server';
import {admin,configured,requireUser,snapshot,guard,fail,recordActivity} from '@/lib/server';
import {reduce,localDay,shiftDate} from '@/lib/domain';
import {actionSchema} from '@/lib/validation';
import {createProgramSnapshot} from '@/lib/program-version';
import {challenges} from '@/lib/challenges';
import {isTelegramOwner} from '@/lib/owner-admin';
export async function GET(){if(!configured())return NextResponse.json({user:null,configured:false});try{const {user,provider}=await requireUser();if(provider==='telegram')await recordActivity(user.id);return NextResponse.json({user:user.email,userId:user.id,provider,isOwner:await isTelegramOwner(user.id,provider),...await snapshot(user.id)},{headers:{'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
export async function POST(req:Request){try{
 const {user,provider}=await requireUser();await guard(req,user.id,'data',120);
 const date=localDay(req.headers.get('x-nafs-timezone')||'UTC');const a=actionSchema.parse(await req.json()),old=await snapshot(user.id);
 if(a.type==='enroll'){const c=[...challenges,...old.state.customChallenges].find(c=>c.id===a.enrollment.challenge_id);if(!c)throw new ApiError('REQUEST_REJECTED','Marathon not available.',400);a.enrollment.programSnapshot=createProgramSnapshot(c,old.state.preferences.language,a.enrollment.intensity||'balanced');if(a.enrollment.days.length||(a.enrollment.started<date||a.enrollment.started>shiftDate(date,365))||a.enrollment.pausedDays||a.enrollment.pausedOn||Object.keys(a.enrollment.completedDates||{}).length)throw new ApiError('REQUEST_REJECTED','Invalid new marathon progress.',400);if(old.state.enrollments.some(e=>e.challenge_id===c.id&&e.days.length<21&&!e.archived))throw new ApiError('REQUEST_REJECTED','You already have an active attempt.',400)}
 if(a.type==='restart'&&(a.startDate<date||a.startDate>shiftDate(date,365)||!old.state.enrollments.some(e=>e.id===a.id)))throw new ApiError('REQUEST_REJECTED','Invalid restart date or attempt.',400);
 if(a.type==='focusStart'&&a.taskId&&!old.state.tasks.some(t=>t.id===a.taskId))throw new ApiError('REQUEST_REJECTED','Linked task not found.',400);
 if(a.type==='habit'&&old.state.habits.find(h=>h.id===a.habit.id)?.paused&&Object.keys(a.habit.checks).some(d=>a.habit.checks[d]>(old.state.habits.find(h=>h.id===a.habit.id)?.checks[d]||0)))throw new ApiError('REQUEST_REJECTED','Resume the habit before checking in.',400);
 if(a.type==='progress'&&!old.state.enrollments.some(e=>e.id===a.id))throw new ApiError('REQUEST_REJECTED','Marathon not found.',400);
 if(a.type==='task'&&old.state.tasks.filter(t=>t.date===a.task.date).length>=100&&!old.state.tasks.some(t=>t.id===a.task.id))throw new ApiError('REQUEST_REJECTED','Daily task limit reached.',400);
 if(a.type==='habit'){const prev=old.state.habits.find(h=>h.id===a.habit.id);const changes=Object.keys({...prev?.checks,...a.habit.checks}).filter(k=>(prev?.checks[k]||0)!==(a.habit.checks[k]||0));if(changes.some(k=>k!==date)||changes.some(k=>(a.habit.checks[k]||0)!==(prev?.checks[k]||0)+1))throw new ApiError('REQUEST_REJECTED','Check-ins must be one step at a time for today.',400);}
 if(a.type==='block'&&a.block.taskId&&!old.state.tasks.some(t=>t.id===a.block.taskId))throw new ApiError('REQUEST_REJECTED','Linked task not found.',400);
 if(provider==='telegram')await recordActivity(user.id);const next=reduce(old.state,a,date);if(next.tasks.length>2000||next.habits.length>100||next.journals.length>1000||next.enrollments.length>300||next.schedule.length>1000||next.customChallenges.length>100||next.focusSessions.length>2000||next.sosReflections.length>1000)throw new ApiError('REQUEST_REJECTED','Storage limit reached. Export or remove older entries.',400);
 const {error}=await admin().rpc('save_workspace',{p_user:user.id,p_state:next,p_revision:old.revision});if(error){if(error.code==='40001'||error.message==='revision conflict')throw new ApiError('SAVE_CONFLICT','Save conflict. Refresh and try again.',409);throw databaseFailure(error,'save_workspace')}return NextResponse.json({state:next});
 }catch(e){return fail(e)}}
