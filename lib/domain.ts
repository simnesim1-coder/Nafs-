import {challenges} from './challenges';
import {preserveLegacyProgram,type ProgramSnapshot} from './program-version';
import {stateSchema,type actionSchema} from './validation';
import {isSensitive} from './content-policy';
import type {z} from 'zod';
import {dailyMotivation,emptyMotivation,allowsFaithMotivation,type MotivationState} from './motivation';
export type Task={id:string;title:string;date:string;priority:'low'|'medium'|'high';category:string;reminder:string;recurrence:'none'|'daily'|'weekly';completed:boolean;seriesId?:string;description?:string;color?:string;subtasks?:{id:string;title:string;completed:boolean}[]};
export type Habit={id:string;title:string;frequency:'daily'|'weekly';target:number;checks:Record<string,number>;color?:string;icon?:string;reminder?:string;paused?:boolean};
export type Enrollment={id:string;challenge_id:string;programSnapshot?:ProgramSnapshot;intensity?:'gentle'|'balanced'|'intense';started:string;days:number[];maintenance:boolean;archived?:boolean;pausedOn?:string|null;pausedDays?:number;completedDates?:Record<string,string>};
export type Preferences={language:'en'|'ru'|'tr'|'ar';islamic:boolean;sensitiveContent:boolean;concealSensitive:boolean;motivationFaith:boolean;dark:boolean;reminders:boolean;onboarded:boolean;goal:string;build:string;reduce:string;[key:string]:unknown};
export type Journal={id:string;date:string;trigger:string;strategy:string};
export type ScheduleBlock={id:string;title:string;date:string;start:string;end:string;recurrence:'none'|'daily'|'weekly';taskId:string;category:string;color?:string;reminder?:string};
export type CustomChallenge={id:string;title:string;description:string;category:string;difficulty:string;icon:string;days:string[];color?:string;startDate?:string;reminder?:string;reflections?:string[];archived?:boolean;deleted?:boolean;[key:string]:unknown};
export type FocusSession={id:string;taskId:string;date:string;startedAt:number;endedAt:number;durationSeconds:number};
export type FocusTimer={id:string;taskId:string;startedAt:number;durationSeconds:number;remainingSeconds:number;endsAt:number|null;status:'running'|'paused'};
export type SosReflection={id:string;date:string;outcome:'less'|'same'|'more';note:string};
export type State={motivation:MotivationState;tasks:Task[];habits:Habit[];enrollments:Enrollment[];xp:Record<string,{amount:number;date:string}>;preferences:Preferences;journals:Journal[];schedule:ScheduleBlock[];customChallenges:CustomChallenge[];focusSessions:FocusSession[];focusTimer:FocusTimer|null;sosReflections:SosReflection[];earnedAchievements:Record<string,{date:string}>;[key:string]:unknown};
export const initialState:State={motivation:emptyMotivation(),tasks:[],habits:[],enrollments:[],xp:{},journals:[],schedule:[],customChallenges:[],focusSessions:[],focusTimer:null,sosReflections:[],earnedAchievements:{},preferences:{language:'ru',islamic:false,sensitiveContent:false,concealSensitive:true,motivationFaith:false,dark:true,reminders:false,onboarded:false,goal:'',build:'',reduce:''}};
export function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export const today=()=>localDate();
export const ordinal=(date:string)=>Date.parse(date+'T00:00:00Z')/86400000;
export function shiftDate(date:string,days:number){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return localDate(d)}
export function localDay(timeZone:string,now=new Date()){try{return new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}catch{throw Error('Invalid timezone')}}
export type Action=z.infer<typeof actionSchema>;
export function migrateState(raw:unknown):State{const parsed=stateSchema.safeParse(raw);if(!parsed.success)throw Error('Saved data could not be read. It has not been overwritten. Export a backup before recovery.');const next=parsed.data as State;for(const e of next.enrollments)if(!e.programSnapshot){const plan=next.customChallenges.find(c=>c.id===e.challenge_id)||challenges.find(c=>c.id===e.challenge_id);if(plan)e.programSnapshot=preserveLegacyProgram(plan,next.preferences.language)}return next}
export function marathonMetrics(e:Enrollment,date=today()){
 const stop=e.pausedOn||date;const elapsedDays=Math.max(0,Math.floor(ordinal(stop)-ordinal(e.started))+1-(e.pausedDays||0));
 const completedDays=new Set(e.days).size,currentDay=Math.min(Math.max(1,Math.min(21,elapsedDays)),Array.from({length:21},(_,i)=>i+1).find(d=>!e.days.includes(d))||21);
 const missedDays=Array.from({length:Math.min(21,Math.max(0,elapsedDays-1))},(_,i)=>i+1).filter(d=>!e.days.includes(d)).length;
 return {elapsedDays,completedDays,currentDay,missedDays,remainingDays:21-completedDays,percentage:Math.round(completedDays/21*100),unlockedDay:Math.min(21,elapsedDays)};
}
export function scheduledFor(blocks:ScheduleBlock[],date:string){return blocks.filter(b=>b.date<=date&&(b.date===date||b.recurrence==='daily'||(b.recurrence==='weekly'&&(ordinal(date)-ordinal(b.date))%7===0))).sort((a,b)=>a.start.localeCompare(b.start))}
export function upcomingSchedule(blocks:ScheduleBlock[],now=new Date()){const day=localDate(now),time=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');return Array.from({length:7},(_,i)=>shiftDate(day,i)).flatMap(date=>scheduledFor(blocks,date).filter(b=>date>day||b.start>=time).map(block=>({block,date}))).slice(0,3)}
export function habitCount(h:Habit,date=today()){return h.frequency==='daily'?(h.checks[date]||0):Object.entries(h.checks).filter(([d])=>ordinal(date)-ordinal(d)>=0&&ordinal(date)-ordinal(d)<7).reduce((n,[,count])=>n+count,0)}
export function currentStreak(s:State,date=today()){const active=new Set([...s.tasks.filter(t=>t.completed).map(t=>t.date),...s.habits.flatMap(h=>Object.keys(h.checks).filter(d=>h.checks[d]>0)),...s.focusSessions.map(f=>f.date),...Object.values(s.xp).map(x=>x.date)]);let d=active.has(date)?date:shiftDate(date,-1),count=0;while(count<3660&&active.has(d)){count++;d=shiftDate(d,-1)}return count}
export function timerRemaining(timer:FocusTimer,now=Date.now()){return timer.status==='running'&&timer.endsAt!==null?Math.max(0,Math.ceil((timer.endsAt-now)/1000)):timer.remainingSeconds}
export function reduce(state:State,action:Action,date=today(),now=Date.now()):State{
 const s=structuredClone(state),award=(key:string,amount:number)=>{s.xp[key]??={amount,date}};
 switch(action.type){
 case 'task':{const prev=s.tasks.find(x=>x.id===action.task.id);s.tasks=s.tasks.filter(x=>x.id!==action.task.id);s.tasks.push(action.task);if(action.task.completed){award(`task:${action.task.id}`,10);if(action.task.recurrence!=='none'&&!prev?.completed){let hash=2166136261;for(const char of action.task.id)hash=Math.imul(hash^char.charCodeAt(0),16777619);const seriesId=action.task.seriesId||'series-'+(hash>>>0).toString(36)+'-'+action.task.id.slice(0,24);const nextDate=shiftDate(action.task.date,action.task.recurrence==='daily'?1:7),nextId=seriesId+'-'+nextDate;if(!s.tasks.some(t=>t.id===nextId))s.tasks.push({...action.task,seriesId,id:nextId,completed:false,date:nextDate,subtasks:action.task.subtasks?.map(row=>({...row,completed:false}))})}}break;}
 case 'deleteTask':s.tasks=s.tasks.filter(x=>x.id!==action.id);s.schedule=s.schedule.map(b=>b.taskId===action.id?{...b,taskId:''}:b);break;
 case 'habit':s.habits=s.habits.filter(x=>x.id!==action.habit.id);s.habits.push(action.habit);if(!action.habit.paused&&(action.habit.checks[date]||0)>(state.habits.find(h=>h.id===action.habit.id)?.checks[date]||0))award(`habit:${action.habit.id}:${date}`,15);break;
 case 'deleteHabit':s.habits=s.habits.filter(x=>x.id!==action.id);break;
 case 'enroll':if(!s.enrollments.some(e=>e.id===action.enrollment.id))s.enrollments.push(action.enrollment);break;
 case 'progress':{const e=s.enrollments.find(x=>x.id===action.id);if(e&&!e.archived&&ordinal(date)>=ordinal(e.started)&&!e.pausedOn&&action.day<=marathonMetrics(e,date).unlockedDay&&!e.days.includes(action.day)){e.days.push(action.day);e.days.sort((a,b)=>a-b);e.completedDates={...e.completedDates,[action.day]:date};if(!state.enrollments.some(old=>old.challenge_id===e.challenge_id&&(old.completedDates?.[action.day]===date||state.xp[`challenge:${old.id}:${action.day}`]?.date===date)))award(`challenge:${e.challenge_id}:${date}:${action.day}`,20);if(e.days.length===21)award(`finish:${e.challenge_id}:${date}`,100)}break;}
 case 'pause':{const e=s.enrollments.find(x=>x.id===action.id);if(e&&!e.pausedOn&&e.days.length<21)e.pausedOn=date;break;}
 case 'resume':{const e=s.enrollments.find(x=>x.id===action.id);if(e?.pausedOn){e.pausedDays=(e.pausedDays||0)+Math.max(0,ordinal(date)-ordinal(e.pausedOn));e.pausedOn=null}break;}
 case 'maintenance':{const e=s.enrollments.find(x=>x.id===action.id);if(e&&e.days.length===21&&!e.maintenance){e.maintenance=true;const c=s.customChallenges.find(c=>c.id===e.challenge_id);s.habits.push({id:'maintenance-'+e.id,title:c?.title||e.challenge_id,frequency:'daily',target:1,checks:{}})}break;}
 case 'motivationDaily':s.motivation=dailyMotivation(s.motivation,date,allowsFaithMotivation(s),action.refresh);break;
 case 'motivationFavorite':s.motivation.favorites=action.saved?[...new Set([...s.motivation.favorites,action.id])]:s.motivation.favorites.filter(id=>id!==action.id);break;
 case 'preferences':s.preferences={...s.preferences,...action.preferences};break;
 case 'journal':s.journals.push(action.journal);break;
 case 'deleteJournal':s.journals=s.journals.filter(x=>x.id!==action.id);break;
 case 'block':s.schedule=s.schedule.filter(b=>b.id!==action.block.id);s.schedule.push(action.block);break;
 case 'deleteBlock':s.schedule=s.schedule.filter(b=>b.id!==action.id);break;
 case 'custom':if(!s.customChallenges.some(c=>c.id===action.challenge.id))s.customChallenges.push(action.challenge);break;
 case 'editCustom':{const c=s.customChallenges.findIndex(c=>c.id===action.challenge.id);if(c>=0)s.customChallenges[c]={...s.customChallenges[c],...action.challenge};break;}
 case 'archiveCustom':{const c=s.customChallenges.find(c=>c.id===action.id);if(c)c.archived=!c.archived;break;}
 case 'deleteCustom':{const c=s.customChallenges.find(c=>c.id===action.id);if(c){c.deleted=true;c.archived=true}break;}
 case 'intensity':{const e=s.enrollments.find(e=>e.id===action.id);if(e)e.intensity=action.value;break;}
 case 'setback':{const old=s.enrollments.find(e=>e.id===action.id);if(old&&isSensitive(old.challenge_id)&&!old.archived&&!s.enrollments.some(e=>e.id===action.newId)){old.archived=true;s.enrollments.push({...old,id:action.newId,started:date,days:[],completedDates:{},maintenance:false,archived:false,pausedOn:null,pausedDays:0})}break;}
 case 'restart':{const old=s.enrollments.find(e=>e.id===action.id);if(old&&!old.archived&&!s.enrollments.some(e=>e.id===action.newId)){old.archived=true;s.enrollments.push({...old,id:action.newId,started:action.startDate<date?date:action.startDate,days:[],completedDates:{},maintenance:false,archived:false,pausedOn:null,pausedDays:0})}break;}
 case 'focusStart':if(!s.focusTimer&&!s.focusSessions.some(f=>f.id===action.id))s.focusTimer={id:action.id,taskId:action.taskId,startedAt:now,durationSeconds:action.minutes*60,remainingSeconds:action.minutes*60,endsAt:now+action.minutes*60000,status:'running'};break;
 case 'focusPause':if(s.focusTimer?.status==='running'){s.focusTimer.remainingSeconds=timerRemaining(s.focusTimer,now);s.focusTimer.endsAt=null;s.focusTimer.status='paused'}break;
 case 'focusResume':if(s.focusTimer?.status==='paused'){s.focusTimer.endsAt=now+s.focusTimer.remainingSeconds*1000;s.focusTimer.status='running'}break;
 case 'focusStop':s.focusTimer=null;break;
 case 'focusComplete':{const f=s.focusTimer;if(f&&f.id===action.id&&timerRemaining(f,now)===0&&!s.focusSessions.some(x=>x.id===f.id)){s.focusSessions.push({id:f.id,taskId:f.taskId,date,startedAt:f.startedAt,endedAt:now,durationSeconds:f.durationSeconds});award('focus:'+f.id,25);s.focusTimer=null}break;}
 case 'sosReflection':if(!s.sosReflections.some(r=>r.id===action.reflection.id))s.sosReflections.push(action.reflection);break;
 }
 let earned=Object.values(state.xp).filter(x=>x.date===date).reduce((n,x)=>n+x.amount,0);for(const key of Object.keys(s.xp))if(!state.xp[key]){if(earned+s.xp[key].amount>500)delete s.xp[key];else earned+=s.xp[key].amount}const milestones:[string,boolean][]=[['first-task',s.tasks.some(t=>t.completed)],['ten-tasks',Object.keys(s.xp).filter(k=>k.startsWith('task:')).length>=10],['reading-seven',s.enrollments.some(e=>e.challenge_id==='reading'&&e.days.length>=7)],['hundred-xp',Object.values(s.xp).reduce((n,x)=>n+x.amount,0)>=100],['habit-seven',s.habits.some(h=>Object.values(h.checks).filter(n=>n>0).length>=7)],['marathon',s.enrollments.some(e=>e.days.length===21)],['focus-five',s.focusSessions.length>=5],['streak-seven',currentStreak(s,date)>=7]];for(const [id,met]of milestones)if(met)s.earnedAchievements[id]??={date};return s;
}
export function statistics(s:State,date=today()){
 const tasks=s.tasks.filter(t=>t.date===date),completed=tasks.filter(t=>t.completed).length;
 const history=Array.from({length:30},(_,i)=>{const key=shiftDate(date,i-29),day=s.tasks.filter(t=>t.date===key),habitChecks=s.habits.reduce((n,h)=>n+(h.checks[key]||0),0);return {date:key,total:day.length,completed:day.filter(t=>t.completed).length,habitChecks,xp:Object.values(s.xp).filter(e=>e.date===key).reduce((a,b)=>a+b.amount,0)}});
 const aggregate=(h:typeof history)=>h.reduce((a,x)=>({total:a.total+x.total,completed:a.completed+x.completed}),{total:0,completed:0});
 const allTimeDays=s.tasks.filter(t=>t.completed).reduce<Record<string,number>>((counts,t)=>{counts[t.date]=(counts[t.date]||0)+1;return counts},{});const xp=Object.values(s.xp).reduce((a,b)=>a+b.amount,0);return {total:tasks.length,completed,remaining:tasks.length-completed,percentage:tasks.length?Math.round(completed/tasks.length*100):0,xp,level:Math.floor(xp/300)+1,history,weekly:aggregate(history.slice(-7)),monthly:aggregate(history),activeDays:history.slice(-7).filter(h=>h.completed||h.habitChecks||h.xp).length,bestDay:Math.max(0,...Object.values(allTimeDays)),completedMarathons:s.enrollments.filter(e=>e.days.length===21).length,totalCompleted:s.tasks.filter(t=>t.completed).length};
}
export const STORAGE_KEY='nafs-guest-v1';
export function loadGuest(storage:Pick<Storage,'getItem'>):State{const data=storage.getItem(STORAGE_KEY);return data?migrateState(JSON.parse(data)):structuredClone(initialState)}
