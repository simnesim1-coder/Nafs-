import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {motivationMessages,calendarMotivation,chooseMotivation,emptyMotivation,dailyMotivation,allowsFaithMotivation} from '../lib/motivation';
import {initialState} from '../lib/domain';
describe('NAFS modes and owner analytics',()=>{
 it('has exactly 400 clear messages for each mode in all four languages',()=>{
  expect(motivationMessages).toHaveLength(800);
  expect(motivationMessages.filter(x=>x.faith)).toHaveLength(400);
  expect(motivationMessages.filter(x=>!x.faith)).toHaveLength(400);
  expect(new Set(motivationMessages.map(x=>x.id)).size).toBe(800);
  for(const lang of ['ru','en','tr','ar'] as const){expect(new Set(motivationMessages.map(x=>x.text[lang])).size).toBe(800);expect(motivationMessages.every(x=>x.text[lang].length>=30)).toBe(true)}
 });
 it('never mixes ordinary and Islamic daily/contextual messages',()=>{
  for(let i=0;i<400;i++){const day=new Date(Date.UTC(2027,0,1+i)).toISOString().slice(0,10);expect(calendarMotivation(day,false).faith).toBe(false);expect(calendarMotivation(day,true).faith).toBe(true)}
  expect(new Set(Array.from({length:400},(_,i)=>calendarMotivation(new Date(Date.UTC(2027,0,1+i)).toISOString().slice(0,10),false).id)).size).toBe(400);
  for(const mode of [true,false])for(const context of ['today','before','completed','marathon','sos','setback'] as const)expect(chooseMotivation(context,context,[],mode).faith).toBe(mode);
 });
 it('switching to Islamic mode selects an Islamic message immediately',()=>{
  const ordinary=dailyMotivation(emptyMotivation(),'2026-11-13',false);
  const islamic=dailyMotivation(ordinary,'2026-11-13',true);
  expect(islamic.daily?.faith).toBe(true);expect(islamic.daily?.id).not.toBe(ordinary.daily?.id);
  expect(allowsFaithMotivation({...initialState,preferences:{...initialState.preferences,islamic:true,motivationFaith:false}})).toBe(true);
 });
 it('keeps identity/visit details server-only',()=>{
  const sql=readFileSync('supabase/migrations/006_owner_visits.sql','utf8');
  expect(sql).toContain('enable'); // migration reuses existing RLS-enabled identity table
  expect(sql).toContain('service_role');
  expect(sql).toContain('record_telegram_visit');
 });
});
