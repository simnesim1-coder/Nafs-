'use client';
import {Plus,CalendarPlus,Focus,Heart,ArrowUpRight,Check,Leaf,Target,Zap,Clock,Sparkles,ChevronRight,Pause} from 'lucide-react';
import {statistics,today,habitCount,marathonMetrics,upcomingSchedule,type State,type Task,type ScheduleBlock,type Action,type CustomChallenge,type Habit} from '@/lib/domain';
import {dailyOverview,nextDailyAction} from '@/lib/daily-overview';
import {concealedTitle} from '@/lib/content-policy';
import type {Challenge} from '@/lib/challenges';
import {categoryColor} from '@/lib/appearance';
import {DailyMotivation} from './motivation';
import {ProgressRing} from '../primitives';
import type {CSSProperties} from 'react';

type Locale = State['preferences']['language'];

type HeroCopy = {badge:string; title:string; text:string; points:[string,string,string]};
const heroCopy: Record<Locale, {regular: HeroCopy; islamic: HeroCopy}> = {
  ru: {
    regular: {
      badge: 'ОБЫЧНЫЙ РЕЖИМ',
      title: 'Дисциплина, которую хочется держать каждый день',
      text: 'NAFS помогает держать курс: задачи, привычки, фокус и спокойный ритм, в котором маленькие шаги действительно накапливаются.',
      points: ['Ясный фокус на день', 'Привычки и прогресс', 'Спокойная атмосфера роста'],
    },
    islamic: {
      badge: 'ИСЛАМСКИЙ РЕЖИМ',
      title: 'Береги сердце и выстраивай день с намерением',
      text: 'Тёплая исламская атмосфера помогает помнить о цели, возвращаться к правильному мягко и держать наfs под контролем без лишнего давления.',
      points: ['Намерение и самоотчёт', 'Муракаба в течение дня', 'Спокойное возвращение после срыва'],
    },
  },
  en: {
    regular: {
      badge: 'REGULAR MODE',
      title: 'Discipline you can actually feel every day',
      text: 'NAFS keeps your direction clear with tasks, habits, focus, and a calm rhythm where small steps genuinely add up.',
      points: ['Clear daily focus', 'Habits and progress', 'A calm growth atmosphere'],
    },
    islamic: {
      badge: 'ISLAMIC MODE',
      title: 'Guard the heart and shape the day with intention',
      text: 'A warm Islamic atmosphere helps you remember your purpose, return gently to what is right, and keep the nafs under control.',
      points: ['Intention and self-accounting', 'Muraqabah through the day', 'A calm return after slipping'],
    },
  },
  tr: {
    regular: {
      badge: 'NORMAL MOD',
      title: 'Her gün hissedilen bir disiplin',
      text: 'NAFS; görevler, alışkanlıklar, odak ve sakin bir ritimle yönünü net tutar. Küçük adımlar gerçekten birikir.',
      points: ['Net günlük odak', 'Alışkanlıklar ve ilerleme', 'Sakin gelişim atmosferi'],
    },
    islamic: {
      badge: 'İSLAMİ MOD',
      title: 'Kalbi koru, günü niyetle kur',
      text: 'Sıcak bir İslami atmosfer hedefini hatırlamana, doğru olana yumuşakça dönmene ve nefsi kontrol etmene yardım eder.',
      points: ['Niyet ve muhasebe', 'Gün içinde murakabe', 'Düştükten sonra sakin dönüş'],
    },
  },
  ar: {
    regular: {
      badge: 'الوضع العادي',
      title: 'انضباط تشعر به كل يوم',
      text: 'يساعدك NAFS على الثبات عبر المهام والعادات والتركيز وإيقاع هادئ يجعل الخطوات الصغيرة تتراكم فعلًا.',
      points: ['تركيز يومي واضح', 'عادات وتقدم', 'أجواء نمو هادئة'],
    },
    islamic: {
      badge: 'الوضع الإسلامي',
      title: 'احفظ القلب وابنِ يومك على نية',
      text: 'أجواء إسلامية دافئة تذكّرك بالمقصد وتعينك على الرجوع الهادئ إلى الصواب والسيطرة على النفس.',
      points: ['نية ومحاسبة', 'مراقبة خلال اليوم', 'رجوع هادئ بعد التعثر'],
    },
  },
};

export function TodayHub({state,user,t,busy,dispatch,addTask,addEvent,editEvent,focus,sos,addHabit,editHabit,editTask,openMarathon,plans,allTasks,onboard}:{state:State;user:string|null;t:(key:string)=>string;busy:boolean;dispatch:(a:Action)=>Promise<boolean>;addTask:()=>void;addEvent:()=>void;editEvent:(event:ScheduleBlock)=>void;focus:()=>void;sos:()=>void;addHabit:()=>void;editHabit:(id:string)=>void;editTask:(task:Task)=>void;openMarathon:(id?:string)=>void;plans:(Challenge|CustomChallenge)[];allTasks:()=>void;onboard:()=>void}){
 const day=today(),stats=statistics(state,day),overview=dailyOverview(state,day),nextAction=nextDailyAction(state,day);
 const tasks=state.tasks.filter(task=>task.date===day).sort((a,b)=>Number(a.completed)-Number(b.completed));
 const active=state.enrollments.filter(e=>new Set(e.days).size<21&&!e.archived),next=upcomingSchedule(state.schedule)[0];
 const planName=(id:string)=>{const plan=plans.find(p=>p.id===id);return plan?concealedTitle(plan,state.preferences,t):t('Archived marathon')};
 const habitName=(habit:Habit)=>{const source=state.enrollments.find(e=>habit.id==='maintenance-'+e.id);return source?planName(source.challenge_id):habit.title};
 const modeStrings = (heroCopy[state.preferences.language] || heroCopy.en)[state.preferences.islamic ? 'islamic' : 'regular'];
 function openNext(){if(!nextAction)return addTask();if(nextAction.type==='task'){const task=state.tasks.find(task=>task.id===nextAction.id);if(task)editTask(task)}else if(nextAction.type==='habit')editHabit(nextAction.id);else openMarathon(nextAction.id)}
 const nextTitle=nextAction?.type==='task'?state.tasks.find(task=>task.id===nextAction.id)?.title:nextAction?.type==='habit'?habitName(state.habits.find(h=>h.id===nextAction.id)!):nextAction?.type==='marathon'?planName(state.enrollments.find(e=>e.id===nextAction.id)!.challenge_id):t('Choose your first small step');
 return <div className="today-hub today-revised">
 <section className={'today-mode-hero '+(state.preferences.islamic?'is-islamic':'is-regular')}>
   <div className="today-mode-overlay">
     <span className="tool-tag">{modeStrings.badge}</span>
     <h2>{modeStrings.title}</h2>
     <p>{modeStrings.text}</p>
     <div className="today-mode-pills">{modeStrings.points.map(point=><span key={point}>{point}</span>)}</div>
   </div>
 </section>
 <section className="today-heading"><div><span className="eyebrow">{user?`${t('Welcome')}, ${user.split('@')[0]}`:t('YOUR SPACE TO GROW')}</span><h1><Sparkles size={23}/>{t('Today')}</h1><p>{t('Small steps today. A stronger tomorrow.')}</p></div><time>{new Date().toLocaleDateString(state.preferences.language,{weekday:'short',day:'numeric',month:'short'})}</time></section>
 <section className="today-hero"><div><span className="tool-tag">{t('Daily progress')}</span><h2>{overview.total?t('Every small win counts.'):t('today.noPlan')}</h2><p><Check size={15}/>{overview.completed} / {overview.total} {t('today.items')}</p><div className="today-hero-meta"><span>{overview.remaining} {t('Remaining')}</span><span><Zap size={13}/>{stats.history.at(-1)?.xp||0} XP</span></div></div><ProgressRing percent={overview.percentage??0} size={112}><strong>{overview.percentage===null?'—':overview.percentage}{overview.percentage!==null&&<small>%</small>}</strong><span>{t(overview.total?'complete':'Add task')}</span></ProgressRing></section>
 <div className="today-counts" aria-label={t('Daily progress')}><span>{t('Tasks')} <b>{overview.tasks.completed}/{overview.tasks.total}</b></span><span>{t('today.dailyHabits')} <b>{overview.habits.completed}/{overview.habits.total}</b></span><span>{t('Marathons')} <b>{overview.marathons.completed}/{overview.marathons.total}</b></span></div>
 <details className="today-progress-explanation"><summary>{t('today.overviewHelp')}</summary><p>{t('today.overviewDefinition')}</p></details>
 <button className="today-next-action" onClick={openNext}><span className="next-action-glyph"><ArrowUpRight size={22}/></span><span><small>{t('today.next')}</small><b>{nextTitle}</b></span><ChevronRight size={18}/></button>
 <DailyMotivation state={state} dispatch={dispatch} t={t} busy={busy}/>
 <section className="today-task-section"><div className="section-header"><h2>{t('Today’s tasks')}</h2><button className="text-link" onClick={allTasks}>{stats.completed}/{stats.total}<ChevronRight size={15}/></button></div>{tasks.length?tasks.slice(0,4).map(task=><div key={task.id} className={'today-task '+(task.completed?'done':'')} style={{'--accent':categoryColor(task.category,task.color)} as CSSProperties}><button className="today-task-check" aria-label={t(task.completed?'Reopen task':'Complete task')} disabled={busy} onClick={()=>dispatch({type:'task',task:{...task,completed:!task.completed}})}>{task.completed&&<Check size={15}/>}</button><button onClick={()=>editTask(task)}>{task.title}</button><span className={'priority-dot '+task.priority}/></div>):<button className="today-empty" onClick={addTask}><Plus size={20}/>{t('Choose your first small step')}</button>}</section>
 <section className="today-habits"><div className="section-header"><h2>{t('Your daily rituals')}</h2><button className="icon-button" aria-label={t('Add habit')} onClick={addHabit}><Plus size={19}/></button></div>{state.habits.length?<div className="today-habit-grid">{state.habits.map(h=><article key={h.id} style={{'--accent':categoryColor(h.title,h.color)} as CSSProperties}><button className="today-habit-name" onClick={()=>editHabit(h.id)}><Leaf size={18}/><b>{habitName(h)}</b></button><div><span>{h.paused?t('Paused'):`${habitCount(h)} / ${h.target} · ${t(h.frequency)}`}</span><button aria-label={t('Check in habit')} disabled={busy||h.paused||habitCount(h)>=h.target} onClick={()=>dispatch({type:'habit',habit:{...h,checks:{...h.checks,[day]:(h.checks[day]||0)+1}}})}>{habitCount(h)>=h.target?<Check size={17}/>:<Plus size={17}/>}</button></div><div className="progress-track"><i style={{width:Math.min(100,habitCount(h)/h.target*100)+'%'}}/></div></article>)}</div>:<button className="today-empty" onClick={addHabit}><Leaf size={20}/>{t('Start with something small')}</button>}</section>
 <section className="today-chapters"><div className="section-header"><h2>{t('Your active marathons')}</h2><button className="text-link" onClick={()=>openMarathon()}>{active.length}<ChevronRight size={15}/></button></div>{active.length?<div className="today-chapter-strip">{active.map(enrollment=>{const metrics=marathonMetrics(enrollment,day);const available=metrics.currentDay<=metrics.unlockedDay;return <button className={'today-chapter-card '+(enrollment.pausedOn?'is-paused':'')} key={enrollment.id} onClick={()=>openMarathon(enrollment.id)}><div className="chapter-card-heading"><Target size={18}/><span>{t(enrollment.pausedOn?'Paused':available?'Continue':'today.availableTomorrow')}</span>{enrollment.pausedOn&&<Pause size={13}/>}</div><h3>{planName(enrollment.challenge_id)}</h3><div className="chapter-card-progress"><ProgressRing percent={metrics.percentage} size={58}><strong>{metrics.currentDay}</strong><span>/21</span></ProgressRing><div><b>{metrics.percentage}%</b><small>{metrics.completedDays} / 21 {t('completed')}</small></div><ChevronRight size={17}/></div></button>})}</div>:<button className="today-empty" onClick={()=>openMarathon()}><Target size={20}/>{t('Find your next intention')}</button>}</section>
 {next&&<button className="today-upcoming" onClick={()=>editEvent(next.block)}><span><Clock size={19}/></span><div><small>{t('Up next')} · {next.date}</small><b>{next.block.title}</b></div><time>{next.block.start}</time></button>}
 <div className="today-actions today-quick-grid"><button onClick={addTask}><Plus/>{t('Add task')}</button><button onClick={focus}><Focus/>{t('Focus timer')}</button><button onClick={addEvent}><CalendarPlus/>{t('Schedule activity')}</button><button onClick={sos}><Heart/>SOS</button></div>
 {!state.preferences.onboarded&&<button className="onboarding-invitation" onClick={onboard}><Sparkles size={17}/><span>{t('Make this space your own')}</span><ChevronRight size={17}/></button>}</div>
}
