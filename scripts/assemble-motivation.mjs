// Compile authored, individually translated entries. No sentence mixing or generated filler.
import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../content/motivation-authored/',import.meta.url);
const languages=['ru','en','tr','ar'];
const readRows=name=>readFileSync(new URL(name,root),'utf8').trim().split('\n').map((line,index)=>{
 const parts=line.split('|').map(s=>s.trim());
 if(parts.length!==4||parts.some(s=>!s))throw Error(`${name}:${index+1}: four translations required`);
 return Object.fromEntries(languages.map((lang,i)=>[lang,parts[i]]));
});
const messages=JSON.parse(readFileSync(new URL('regular-foundation.json',root),'utf8'));
const ordinaryCategories=['discipline','consistency','responsibility','growth','procrastination'];
readRows('regular-extra.tsv').forEach((text,i)=>messages.push({id:`nafs-editorial-regular-${String(i+1).padStart(3,'0')}`,category:ordinaryCategories[i%ordinaryCategories.length],contexts:['today','before'],faith:false,text}));
for(const category of ['sincerity','prayer','repentance','gratitude','patience','speech','family','remembrance','time','character']){
 const rows=[...readRows(`${category}-foundation.tsv`),...readRows(`${category}-extra.tsv`)];
 if(rows.length!==40)throw Error(`${category}: expected 40 authored entries`);
 const contexts=['today','before','completed','marathon',...(['patience','repentance'].includes(category)?['sos','setback']:[])];
 rows.forEach((text,i)=>messages.push({id:`nafs-editorial-${category}-${String(i+1).padStart(2,'0')}`,category,contexts,faith:true,text}));
}
for(const faith of [false,true])if(messages.filter(m=>m.faith===faith).length!==400)throw Error('Expected 400 entries per mode');
if(new Set(messages.map(m=>m.id)).size!==800)throw Error('Duplicate IDs');
for(const lang of languages){
 const normalized=messages.map(m=>m.text[lang].normalize('NFKC').toLocaleLowerCase().replace(/[\p{P}\p{S}\s]/gu,''));
 if(new Set(normalized).size!==800)throw Error(`Duplicate text in ${lang}`);
}
const serialized=JSON.stringify(messages,null,2)+'\n';
const output=new URL('../content/motivation.json',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(output,'utf8')!==serialized)throw Error('Recompile authored content');}
else writeFileSync(output,serialized);
console.log('Validated 800 authored entries: 400 per mode, four nonempty unique translations each.');
