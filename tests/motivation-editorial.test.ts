import {it,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import {motivationMessages,dailyMotivation,emptyMotivation,motivationById} from '../lib/motivation';
it('ships exactly the compiled authored library, not sentence combinations',()=>{
 expect(execFileSync(process.execPath,['scripts/assemble-motivation.mjs','--check'],{encoding:'utf8'})).toContain('800 authored entries');
 // Repeated lead sentences caught the previous 5-hook x 8-action expansion.
 for(const language of ['ru','en','tr','ar'] as const){
  const leads=motivationMessages.map(m=>m.text[language].split(/[.!?؟]/)[0].trim().toLowerCase());
  const counts=new Map<string,number>();for(const lead of leads)counts.set(lead,(counts.get(lead)||0)+1);
  expect(Math.max(...counts.values())).toBeLessThan(4);
 }
});
it('repairs an old or inconsistent daily-mode marker without changing favorites',()=>{
 const ordinary=dailyMotivation(emptyMotivation(),'2026-11-13',false,true);
 const corrupt={...ordinary,daily:{...ordinary.daily!,faith:true,sequence:5}};
 const fixed=dailyMotivation(corrupt,'2026-11-13',true);
 expect(motivationById(fixed.daily!.id)?.faith).toBe(true);expect(fixed.favorites).toEqual(ordinary.favorites);
});
