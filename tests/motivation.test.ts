import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {motivationMessages, motivationById, favoriteById, calendarMotivation, emptyMotivation, chooseMotivation, dailyMotivation, completionContext, allowsFaithMotivation} from '../lib/motivation';
import {initialState, reduce, localDay, migrateState, loadGuest, STORAGE_KEY, type Task} from '../lib/domain';
import {actionSchema} from '../lib/validation';
import {guestDefinitionActions} from '../lib/guest-import';
import {exportWorkspace, clearLocalWorkspace} from '../lib/storage';
const date = '2026-11-06';
const task: Task = {id:'motivation-task', title:'Private task title never enters message selection', date, priority:'low', category:'Personal', completed:false, recurrence:'none', reminder:''};

describe('curated original motivation', () => {
  it('has exactly 365 distinct original messages with valid metadata and four complete language versions', () => {
    const ordinary=motivationMessages.filter(m=>!m.faith);
    expect(motivationMessages).toHaveLength(365);expect(ordinary).toHaveLength(365);
    expect(new Set(ordinary.map(m=>m.category)).size).toBe(10);
    for(const message of motivationMessages){expect(message.id).toMatch(/^nafs-[a-z0-9-]+$/);expect(message.contexts).toContain('today');expect(message.contexts.every(c=>['today','before','completed','sos','setback','marathon'].includes(c))).toBe(true)}
    expect(new Set(motivationMessages.map(m=>m.id)).size).toBe(motivationMessages.length);
    for(const language of ['ru','en','tr','ar'] as const){
      const dictionary=JSON.parse(readFileSync(`messages/${language}.json`,'utf8'));
      expect(new Set(motivationMessages.map(m=>m.text[language])).size).toBe(motivationMessages.length);
      for(const message of motivationMessages){
        expect(message.text[language].length).toBeGreaterThan(30);
        expect(dictionary['motivation.category.'+message.category]).toBeTruthy();
        expect(message.text.ru).toMatch(/[А-Яа-я]/);expect(message.text.ar).toMatch(/[\u0600-\u06ff]/);
        expect(message).not.toHaveProperty('author');
      }
    }
  });
  it('never substitutes a translation in a different language or includes religious quotations', () => {
    for(const message of motivationMessages){
      expect(message.text.ru).not.toMatch(/\b(the|your|you|Quran|hadith)\b/i);
      expect(message.text.en).not.toMatch(/[А-Яа-я\u0600-\u06ff]/);
      expect(JSON.stringify(message)).not.toMatch(/Goggins|Гоггинс|Quran \d|Qur’an \d|Sahih|رَبِّ|قال الله/i);
    }
  });
});

it('keeps the daily choice stable across refreshes and languages, rotates at the local calendar boundary', () => {
  const a=localDay('America/New_York',new Date('2026-11-07T04:59:00Z'));
  const b=localDay('America/New_York',new Date('2026-11-07T05:00:00Z'));
  expect(a).toBe('2026-11-06');expect(b).toBe('2026-11-07');
  const first=dailyMotivation(emptyMotivation(),a,false);
  expect(dailyMotivation(first,a,false)).toBe(first);
  const next=dailyMotivation(JSON.parse(JSON.stringify(first)),b,false);
  expect(next.daily?.id).not.toBe(first.daily?.id);
  const state={...initialState,motivation:first};
  const translated=reduce(state,{type:'preferences',preferences:{...state.preferences,language:'ar'}},a);
  expect(dailyMotivation(translated.motivation,a,false)).toEqual(first);
});
it('uses calendar days during daylight saving transitions, never a rolling 24-hour timer', () => {
  expect(localDay('America/New_York',new Date('2026-11-01T05:30:00Z'))).toBe(localDay('America/New_York',new Date('2026-11-01T06:30:00Z')));
  expect(localDay('Asia/Tokyo',new Date('2026-11-06T15:00:00Z'))).toBe('2026-11-07');
});
it('excludes the last 24 daily messages through repeated manual refreshes and keeps history bounded', () => {
  let state=emptyMotivation();
  for(let i=0;i<150;i++){
    const next=dailyMotivation(state,date,false,true);
    expect(state.recent).not.toContain(next.daily!.id);
    expect(next.recent.length).toBeLessThanOrEqual(24);
    expect(next.daily?.sequence).toBe(i);
    state=next;
  }
});
it('makes deterministic choices with available candidates when a small context pool is exhausted', () => {
  const recent:string[]=[];
  for(let i=0;i<60;i++){
    const message=chooseMotivation('marathon',String(i),recent,false);
    expect(message.id).not.toBe(recent.at(-1));expect(message.contexts).toContain('marathon');
    expect(chooseMotivation('marathon',String(i),recent,false)).toEqual(message);
    recent.push(message.id);
  }
});
it('does not reenable retired faith recommendations and preserves explicit legacy favorites', () => {
  const legacyEnabled={...initialState,preferences:{...initialState.preferences,islamic:true,motivationFaith:true}};
  expect(allowsFaithMotivation(legacyEnabled)).toBe(false);
  for(const context of ['today','before','sos','setback'] as const){
    for(let i=0;i<200;i++)expect(chooseMotivation(context,String(i),[],true).faith).toBe(false);
  }
  const id='nafs-intention-08';
  expect(motivationById(id)).toBeUndefined();
  expect(favoriteById(id)?.text.ru).toContain('Сабр');
  expect(actionSchema.safeParse({type:'motivationFavorite',id,saved:true}).success).toBe(true);
  const saved=reduce(initialState,{type:'motivationFavorite',id,saved:true},date);
  const off=reduce(saved,{type:'preferences',preferences:{...saved.preferences,islamic:false}},date);
  expect(off.motivation.favorites).toEqual([id]);
});
it('cycles through all 365 entries without repetition across year and leap-day boundaries',()=>{
  for(const start of ['2026-12-01','2028-01-01']){
    const days=Array.from({length:366},(_,i)=>new Date(Date.parse(start+'T00:00:00Z')+i*86400000).toISOString().slice(0,10));
    const ids=days.map(day=>calendarMotivation(day).id);
    expect(new Set(ids.slice(0,365)).size).toBe(365);expect(ids[365]).toBe(ids[0]);
    expect(ids[59]).not.toBe(ids[60]);
  }
});
it('manual refresh never shifts the next daily selection and reserves upcoming daily entries',()=>{
  let state=dailyMotivation(emptyMotivation(),date,false);
  const nextDay='2026-11-07';const expected=calendarMotivation(nextDay).id;
  for(let i=0;i<70;i++){
    state=dailyMotivation(state,date,false,true);expect(state.daily?.id).not.toBe(expected);
  }
  expect(dailyMotivation(state,nextDay,false).daily?.id).toBe(expected);
  expect(dailyMotivation(emptyMotivation(),nextDay,false).daily?.id).toBe(expected);
});
it('migrates older snapshots additively without replacing any existing task, progress or unknown history', () => {
  const old={...reduce(initialState,{type:'task',task},date),oldHistory:{saved:'keep'}} as Record<string,unknown>;
  delete old.motivation;
  const preferences={...initialState.preferences} as Record<string,unknown>;delete preferences.motivationFaith;old.preferences=preferences;
  const migrated=migrateState(old);
  expect(migrated.motivation).toEqual(emptyMotivation());expect(migrated.preferences.motivationFaith).toBe(false);
  expect(migrated.tasks).toEqual([task]);expect(migrated.oldHistory).toEqual({saved:'keep'});
  expect(old).not.toHaveProperty('motivation');
});
it('persists idempotent favorites and daily selection through guest reload, export and deletion without awarding XP', () => {
  const id=motivationMessages[0].id, favorite={type:'motivationFavorite' as const,id,saved:true};
  let state=reduce(initialState,{type:'motivationDaily',refresh:false},date);
  state=reduce(reduce(state,favorite,date),favorite,date);
  const map=new Map([[STORAGE_KEY,JSON.stringify(state)]]);
  const storage={get length(){return map.size},key:(index:number)=>[...map.keys()][index]??null,getItem:(key:string)=>map.get(key)||null,removeItem:(key:string)=>{map.delete(key)}};
  expect(loadGuest(storage).motivation).toEqual(state.motivation);
  expect(state.motivation.favorites).toEqual([id]);expect(state.xp).toEqual({});
  expect(exportWorkspace(state)).toContain(id);
  expect(reduce(state,{...favorite,saved:false},date).motivation.favorites).toEqual([]);
  clearLocalWorkspace(storage,storage);expect(map.has(STORAGE_KEY)).toBe(false);
});
it('validates favorite IDs and rejects untrusted custom text and histories in actions', () => {
  expect(actionSchema.safeParse({type:'motivationFavorite',id:'not-a-real-message',saved:true}).success).toBe(false);
  const action=actionSchema.parse({type:'motivationDaily',refresh:false,date:'1999-01-01',text:'Injected'});
  expect(action).toEqual({type:'motivationDaily',refresh:false});
  expect(motivationById('not-a-real-message')).toBeUndefined();
});
it('imports chosen guest favorites idempotently without importing viewing history or duplicating existing ones',async()=>{
  const guest=reduce(reduce(initialState,{type:'motivationDaily',refresh:false},date),{type:'motivationFavorite',id:'nafs-discipline-01',saved:true},date);
  const actions=await guestDefinitionActions(guest,initialState);expect(actions).toEqual([{type:'motivationFavorite',id:'nafs-discipline-01',saved:true}]);
  const account=actions.reduce((s,a)=>reduce(s,a,date),initialState);
  expect(await guestDefinitionActions(guest,account)).toEqual([]);expect(account.motivation.recent).toEqual([]);
});
it('recognizes actual saved completion, not opening, editing, reopening, blocked activity or early timer save', () => {
  const before=reduce(initialState,{type:'task',task},date);
  const complete={type:'task' as const,task:{...task,completed:true}},after=reduce(before,complete,date);
  expect(completionContext(before,after,complete,date)).toBe('completed');
  expect(completionContext(after,after,complete,date)).toBeNull();
  expect(completionContext(after,before,{type:'task',task},date)).toBeNull();
  const enroll=reduce(before,{type:'enroll',enrollment:{id:'run',challenge_id:'reading',started:date,days:[],maintenance:false}},date);
  const future={type:'progress' as const,id:'run',day:2};
  expect(completionContext(enroll,reduce(enroll,future,date),future,date)).toBeNull();
  const timer=reduce(before,{type:'focusStart',id:'f',minutes:1,taskId:task.id},date,1000);
  expect(completionContext(timer,reduce(timer,{type:'focusComplete',id:'f'},date,2000),{type:'focusComplete',id:'f'},date)).toBeNull();
  expect(completionContext(timer,reduce(timer,{type:'focusComplete',id:'f'},date,61000),{type:'focusComplete',id:'f'},date)).toBe('completed');
  const almost={...enroll,enrollments:[{...enroll.enrollments[0],started:'2026-10-01',days:Array.from({length:20},(_,i)=>i+1)}]};
  const finish={type:'progress' as const,id:'run',day:21};
  expect(completionContext(almost,reduce(almost,finish,date),finish,date)).toBe('marathon');
});
it('keeps SOS messages relevant to the selected situation without recording it',()=>{
 for(let i=0;i<60;i++){
  expect(chooseMotivation('sos',String(i),[],false,'stress').category).toBe('resilience');
  expect(['procrastination','resilience']).toContain(chooseMotivation('sos',String(i),[],false,'procrastination').category);
  expect(['impulses','resilience']).toContain(chooseMotivation('sos',String(i),[],false,'impulse').category);
 }
});
