import ts from 'typescript';
import fs from 'node:fs';
import {challenges} from '../lib/challenges.ts';
const keys=new Set();
function visit(node){if(ts.isStringLiteral(node)&&/[A-Za-z]/.test(node.text)&&!node.text.startsWith('/')&&node.text.length>2)keys.add(node.text);ts.forEachChild(node,visit)}
const files=['components/nafs-app.tsx','components/use-nafs.ts','components/primitives.tsx','lib/challenge-details.ts','lib/sos.ts','lib/insights.ts',...fs.readdirSync('components/tools').filter(f=>f.endsWith('.tsx')).map(f=>'components/tools/'+f)];
for(const name of files){const file=ts.createSourceFile(name,fs.readFileSync(name,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);visit(file)}
for(const c of challenges)for(const key of [c.title,c.description,c.category,c.difficulty,...c.days])keys.add(key);
keys.add('Set a new password');keys.add('New password');keys.add('Save password');keys.add('Return to NAFS');keys.add('Password updated. You can return to NAFS.');
const en=JSON.parse(fs.readFileSync('messages/en.json'));for(const key of keys)en[key]=key;fs.writeFileSync('messages/en.json',JSON.stringify(en,null,2)+'\n');
fs.writeFileSync('/tmp/nafs-static-copy.json',JSON.stringify([...keys]));
console.log(`${keys.size} static translation keys collected.`);
