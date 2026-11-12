import type {Preferences} from './domain';
export const sensitiveIds=new Set(['pornography','personal-boundaries','masturbation']);
export function isSensitive(id:string){return sensitiveIds.has(id)}
type Plan={id:string;title:string;islamic?:unknown;deleted?:unknown;sensitive?:unknown};
export function concealedTitle(plan:Plan,preferences:Preferences,t:(key:string)=>string){return (isSensitive(plan.id)||plan.sensitive)&&(!preferences.sensitiveContent||preferences.concealSensitive!==false)?t('Private marathon'):plan.islamic&&!preferences.islamic?t('Hidden marathon'):t(plan.title)}
export function discoveryPlans<T extends Plan>(plans:T[],preferences:Preferences){return plans.filter(p=>!p.deleted&&(!p.islamic||preferences.islamic)&&(!(isSensitive(p.id)||p.sensitive)||preferences.sensitiveContent)).sort((a,b)=>{const rank=(p:Plan)=>isSensitive(p.id)||p.sensitive?2:p.islamic?0:1;return rank(a)-rank(b)})}
export const sensitiveSos=new Set(['Strong sexual urge','Urge to watch pornography']);
export function visibleSos(issues:readonly string[],enabled:boolean){return issues.filter(i=>enabled||!sensitiveSos.has(i)).sort((a,b)=>Number(sensitiveSos.has(a))-Number(sensitiveSos.has(b)))}

export function publicHabitTitle(state:import('./domain').State,habit:{id:string;title:string},t:(key:string)=>string){const enrollment=state.enrollments.find(e=>habit.id==='maintenance-'+e.id);return enrollment&&isSensitive(enrollment.challenge_id)&&(!state.preferences.sensitiveContent||state.preferences.concealSensitive)?t('Private habit'):habit.title}
