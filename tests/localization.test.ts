import {it,expect} from 'vitest';
import ts from 'typescript';
import {readFileSync,readdirSync} from 'node:fs';
const files=['components/nafs-app.tsx',...readdirSync('components/tools').filter(file=>file.endsWith('.tsx')).map(file=>'components/tools/'+file)];
const keys=new Set<string>();
function strings(node:ts.Node){if(ts.isStringLiteral(node))keys.add(node.text);if(ts.isConditionalExpression(node)){strings(node.whenTrue);strings(node.whenFalse);return}if(ts.isBinaryExpression(node))return;ts.forEachChild(node,strings)}
function visit(node:ts.Node){if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='t'&&node.arguments[0])strings(node.arguments[0]);ts.forEachChild(node,visit)}
for(const file of files)visit(ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX));
it.each(['ru','tr','ar'])('has centralized %s entries for every literal interface translation key',locale=>{const dictionary=JSON.parse(readFileSync('messages/'+locale+'.json','utf8'));for(const key of keys)expect(dictionary[key],key).toBeTruthy()});
