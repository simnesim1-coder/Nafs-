const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const output=process.env.NAFS_QA_OUTPUT||'/workspace/nafs-qa';fs.mkdirSync(output,{recursive:true});
const base=process.env.NAFS_QA_URL||'http://localhost:3000';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const result=[];try{
for(const width of [375,390,430])for(const language of ['ru','en','tr','ar'])for(const dark of [true,false]){
 const c=await b.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
 await c.addInitScript(s=>localStorage.setItem('nafs-guest-v1',JSON.stringify({tasks:[],habits:[],enrollments:[],xp:{},journals:[],preferences:{...s,onboarded:true,islamic:true,reminders:false,goal:'',build:'',reduce:''}})),{language,dark});
 const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base,{waitUntil:'networkidle'});
 await p.locator('.bottom-nav>button').first().waitFor();
 for(let tab=0;tab<5;tab++){await p.locator('.bottom-nav>button').nth(tab).click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width} ${language} ${dark} ${tab}`)}
 await p.locator('.bottom-nav>button').nth(2).click();assert(await p.locator('.motivation-card').first().getAttribute('data-message-id').then(id=>id.startsWith('nafs-editorial-')));
 assert.equal(await p.locator('html').getAttribute('data-mode'),'islamic');
 await p.waitForTimeout(400);if(width===390&&language==='ru')await p.screenshot({path:`${output}/islamic-${dark?'dark':'light'}-390.png`,fullPage:true});
 if(width===390&&language==='ar')await p.screenshot({path:`${output}/islamic-ar-${dark?'dark':'light'}-390.png`,fullPage:true});
 assert.deepEqual(errors,[]);result.push({width,language,dark,tabs:5});await c.close();
}
// Actual rendered Telegram failure must not expose a silently editable guest workspace.
const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
await p.addInitScript(() => { window.Telegram = { WebApp: { initData:'test-launch', version:'8.0', ready(){}, expand(){}, onEvent(){}, offEvent(){}, isVersionAtLeast(){return true}, BackButton:{show(){},hide(){},onClick(){},offClick(){}} } }; });
await p.route('**/api/auth/telegram',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'DATABASE_UNREACHABLE',diagnosticId:'qa-reference',error:'Unavailable'})}));
await p.goto(base,{waitUntil:'networkidle'});await p.locator('.auth-recovery').waitFor();assert.equal(await p.locator('.bottom-nav').count(),0);assert((await p.locator('.auth-recovery').innerText()).includes('qa-reference'));
await p.screenshot({path:output+'/telegram-recovery-390.png'});await c.close();
fs.writeFileSync(output+'/mode-matrix.json',JSON.stringify({passed:result,telegramRecovery:true,limits:'Mocked Telegram bridge and API outage; not a live Telegram session.'},null,2));console.log('PASS: 24 Islamic theme/language/viewports x five tabs; rendered Telegram outage recovery.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
