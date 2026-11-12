import {habitCount,marathonMetrics,today,type State} from './domain';

/** One daily unit per task, daily habit target, and available marathon practice.
 * Weekly habits have a rolling target and deliberately do not inflate daily totals.
 * A paused or future program creates no daily obligation. Multiple catch-up marks
 * still represent only one daily practice; elapsed days never imply completion.
 */
export function dailyOverview(state:State,date=today()) {
 const tasks=state.tasks.filter(task=>task.date===date);
 const habits=state.habits.filter(habit=>!habit.paused&&habit.frequency==='daily');
 const programs=state.enrollments.filter(enrollment=>{
  if(enrollment.archived||enrollment.pausedOn||enrollment.started>date)return false;
  return new Set(enrollment.days).size<21||Object.values(enrollment.completedDates||{}).includes(date);
 });
 const taskCompleted=tasks.filter(task=>task.completed).length;
 const habitCompleted=habits.filter(habit=>habitCount(habit,date)>=habit.target).length;
 const marathonCompleted=programs.filter(enrollment=>Object.values(enrollment.completedDates||{}).includes(date)).length;
 const total=tasks.length+habits.length+programs.length,completed=taskCompleted+habitCompleted+marathonCompleted;
 return {total,completed,remaining:total-completed,percentage:total?Math.round(completed/total*100):null,
  tasks:{total:tasks.length,completed:taskCompleted},habits:{total:habits.length,completed:habitCompleted},marathons:{total:programs.length,completed:marathonCompleted}};
}

export function nextDailyAction(state:State,date=today()):{type:'task'|'habit'|'marathon';id:string}|null {
 const rank={high:0,medium:1,low:2};
 const task=state.tasks.filter(task=>!task.completed&&task.date<=date).sort((a,b)=>rank[a.priority]-rank[b.priority]||a.date.localeCompare(b.date))[0];
 if(task)return {type:'task',id:task.id};
 const habit=state.habits.find(habit=>!habit.paused&&habitCount(habit,date)<habit.target);
 if(habit)return {type:'habit',id:habit.id};
 const marathon=state.enrollments.find(enrollment=>!enrollment.archived&&!enrollment.pausedOn&&new Set(enrollment.days).size<21&&!enrollment.days.includes(marathonMetrics(enrollment,date).currentDay)&&marathonMetrics(enrollment,date).currentDay<=marathonMetrics(enrollment,date).unlockedDay);
 return marathon?{type:'marathon',id:marathon.id}:null;
}
