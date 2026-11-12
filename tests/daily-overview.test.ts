import {expect,it} from 'vitest';
import {initialState,type State} from '../lib/domain';
import {dailyOverview,nextDailyAction} from '../lib/daily-overview';
const date='2026-11-09';
it('does not imply success or failure for an empty day',()=>{expect(dailyOverview(initialState,date)).toMatchObject({total:0,completed:0,percentage:null});expect(nextDailyAction(initialState,date)).toBeNull()});
it('counts task, daily habit target and explicit marathon practice separately',()=>{
 const state:State={...initialState,tasks:[{id:'t',title:'Task',date,completed:true,priority:'high',category:'Personal',reminder:'',recurrence:'none'}],habits:[{id:'h',title:'Habit',target:2,frequency:'daily',checks:{[date]:1}},{id:'weekly',title:'Weekly',target:4,frequency:'weekly',checks:{}}],enrollments:[{id:'e',challenge_id:'reading',started:date,days:[1],completedDates:{'1':date},maintenance:false}]};
 expect(dailyOverview(state,date)).toMatchObject({total:3,completed:2,percentage:67,habits:{total:1,completed:0},marathons:{total:1,completed:1}});
 expect(nextDailyAction(state,date)).toEqual({type:'habit',id:'h'});
});
it('ignores paused/future programs and never treats elapsed days or un-dated old progress as today completion',()=>{
 const state:State={...initialState,enrollments:[{id:'active',challenge_id:'reading',started:'2026-11-01',days:[1,2,3],maintenance:false},{id:'paused',challenge_id:'fitness',started:'2026-11-01',days:[],maintenance:false,pausedOn:'2026-11-03'},{id:'future',challenge_id:'focus',started:'2026-12-01',days:[],maintenance:false}]};
 expect(dailyOverview(state,date)).toMatchObject({total:1,completed:0,percentage:0});expect(nextDailyAction(state,date)).toEqual({type:'marathon',id:'active'});
});
it('recognizes the final completed day but does not keep assigning the finished program tomorrow',()=>{
 const state:State={...initialState,enrollments:[{id:'e',challenge_id:'reading',started:'2026-10-20',days:Array.from({length:21},(_,i)=>i+1),completedDates:{'21':date},maintenance:false}]};
 expect(dailyOverview(state,date)).toMatchObject({total:1,completed:1,percentage:100});expect(dailyOverview(state,'2026-11-10').total).toBe(0);
});
it('does not inflate daily progress with multiple catch-up completions and selects meaningful priorities',()=>{
 const state:State={...initialState,tasks:[{id:'low',title:'low',date,priority:'low',completed:false,category:'Personal',recurrence:'none',reminder:''},{id:'high',title:'high',date,priority:'high',completed:false,category:'Personal',recurrence:'none',reminder:''}],enrollments:[{id:'e',challenge_id:'reading',started:'2026-10-20',days:[1,2,3],completedDates:{'1':date,'2':date,'3':date},maintenance:false}]};
 expect(dailyOverview(state,date)).toMatchObject({total:3,completed:1});expect(nextDailyAction(state,date)).toEqual({type:'task',id:'high'});
});
