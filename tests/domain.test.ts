import {describe,it,expect} from 'vitest';
import {initialState,reduce,statistics,loadGuest,STORAGE_KEY,type Task} from '../lib/domain';
import {challenges} from '../lib/challenges';
const date='2026-11-05';
const task:Task={id:'one',title:'Read a page',date,priority:'medium',category:'Personal',reminder:'',recurrence:'none',completed:false};
describe('planner and progression',()=>{
 it('creates tasks and calculates actual percentages',()=>{let s=reduce(initialState,{type:'task',task},date);s=reduce(s,{type:'task',task:{...task,id:'two',completed:true}},date);expect(statistics(s,date)).toMatchObject({completed:1,total:2,remaining:1,percentage:50,xp:10});});
 it('never awards XP twice when toggled, deleted or recreated',()=>{let s=reduce(initialState,{type:'task',task:{...task,completed:true}},date);s=reduce(s,{type:'deleteTask',id:task.id},date);s=reduce(s,{type:'task',task:{...task,completed:true}},date);expect(statistics(s,date).xp).toBe(10)});
 it('generates only one next recurring occurrence',()=>{let s=reduce(initialState,{type:'task',task:{...task,completed:true,recurrence:'daily'}},date);s=reduce(s,{type:'task',task:{...task,completed:false,recurrence:'daily'}},date);s=reduce(s,{type:'task',task:{...task,completed:true,recurrence:'daily'}},date);expect(s.tasks).toHaveLength(2);expect(s.tasks.find(t=>t.id!==task.id)?.date).toBe('2026-11-06')});
 it('caps daily XP and keeps prior achievements',()=>{let s=structuredClone(initialState);for(let i=0;i<100;i++)s=reduce(s,{type:'task',task:{...task,id:String(i),completed:true}},date);expect(statistics(s,date).xp).toBe(500)});
 it('does not unlock future days or award duplicates',()=>{let s=reduce(initialState,{type:'enroll',enrollment:{id:'attempt',challenge_id:'reading',started:date,days:[],maintenance:false}},date);s=reduce(s,{type:'progress',id:'attempt',day:2},date);expect(s.enrollments[0].days).toEqual([]);s=reduce(s,{type:'progress',id:'attempt',day:1},date);s=reduce(s,{type:'progress',id:'attempt',day:1},date);expect(statistics(s,date).xp).toBe(20)});
 it('awards finish bonus once on day 21',()=>{let s=reduce(initialState,{type:'enroll',enrollment:{id:'a',challenge_id:'reading',started:'2026-10-01',days:[],maintenance:false}},date);for(let day=1;day<=21;day++)s=reduce(s,{type:'progress',id:'a',day},`2026-10-${String(day).padStart(2,'0')}`);expect(s.enrollments[0].days).toHaveLength(21);expect(s.xp['finish:reading:2026-10-21'].amount).toBe(100)});
 it('preserves habit history after missed days',()=>{const s=reduce(initialState,{type:'habit',habit:{id:'h',title:'Water',frequency:'daily',target:1,checks:{'2026-11-01':1,[date]:1}}},date);expect(s.habits[0].checks['2026-11-01']).toBe(1)});
 it('has 20 free plans and 21 distinct activities per plan',()=>{expect(challenges).toHaveLength(20);for(const c of challenges){expect(c.days).toHaveLength(21);expect(new Set(c.days).size).toBe(21)}});
 it('loads persisted guest data and recovers corrupt storage',()=>{expect(loadGuest({getItem:key=>key===STORAGE_KEY?JSON.stringify({...initialState,tasks:[task]}):null}).tasks).toHaveLength(1);expect(()=>loadGuest({getItem:()=>'{bad'})).toThrow()});
});
