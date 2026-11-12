import type {Challenge} from './challenges';
import type {CustomChallenge} from './domain';
import {activityDetails,type ProgramIntensity,type ProgramLanguage,type StructuredActivity} from './challenge-details';
import {translate} from './i18n';
export type ProgramSnapshot={templateId:string;templateVersion:1|2;language:ProgramLanguage;title:string;description:string;category:string;islamic:boolean;days:StructuredActivity[]};
export const CURRENT_PROGRAM_VERSION=2;
/** Materialize program text at enrollment. No mutable catalog reference is retained. */
export function createProgramSnapshot(plan:Challenge|CustomChallenge,language:ProgramLanguage='ru',intensity:ProgramIntensity='balanced'):ProgramSnapshot{
 if(plan.days.length!==21)throw new Error('Programs must contain exactly 21 activities');
 return {templateId:plan.id,templateVersion:CURRENT_PROGRAM_VERSION,language,title:translate(language,plan.title),description:translate(language,plan.description),category:translate(language,plan.category),islamic:plan.islamic===true,days:Array.from({length:21},(_,n)=>activityDetails(plan,n+1,intensity,language))};
}
/** Existing attempts receive a legacy snapshot: keep original instructions, do not append new work. */
export function preserveLegacyProgram(plan:Challenge|CustomChallenge,language:ProgramLanguage='ru'):ProgramSnapshot{
 const snapshot=createProgramSnapshot(plan,language,'balanced');
 return {...snapshot,templateVersion:1,days:snapshot.days.map((day,n)=>({...day,title:translate(language,plan.days[n]),instructions:translate(language,plan.days[n]),minutes:n<7?5:n<14?10:15}))};
}
/** Adjust a time guide without rewriting frozen assignments or losing any completion events. */
export function activityForAttempt(snapshot:ProgramSnapshot,day:number,intensity?:ProgramIntensity):StructuredActivity{
 const n=Math.max(0,Math.min(20,Math.floor(day)-1)),saved=snapshot.days[n];
 if(!saved)throw new Error('Incomplete program snapshot');
 if(!intensity)return structuredClone(saved);
 const source:Challenge={id:snapshot.templateId,title:snapshot.title,description:snapshot.description,category:snapshot.category,difficulty:'',icon:'',days:snapshot.days.map(d=>d.title),islamic:snapshot.islamic};
 const adapted=activityDetails(source,n+1,intensity,snapshot.language);
 return {...structuredClone(saved),minutes:adapted.minutes,durationNote:adapted.durationNote};
}
