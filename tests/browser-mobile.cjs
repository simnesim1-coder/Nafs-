// Run with NAFS_QA_URL=http://localhost:3000 node tests/browser-mobile.cjs.
// Real Chromium rendering; does not simulate Telegram authentication or physical Safari.
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const output=process.env.NAFS_QA_OUTPUT||'/workspace/nafs-qa';
fs.mkdirSync(output,{recursive:true});
const day=new Date().toISOString().slice(0,10);
const state={tasks:[{id:'qa-task',title:'Очень длинное название важной задачи: подготовить материалы и проверить понятность следующего шага',date:day,priority:'high',category:'Personal',reminder:'',recurrence:'none',completed:false}],habits:[{id:'qa-habit',title:'Чтение и заметки о прочитанном',frequency:'daily',target:1,checks:{}}],enrollments:[{id:'qa-reading',challenge_id:'reading',started:day,days:[],maintenance:false},{id:'qa-hidden',challenge_id:'pornography',started:day,days:[],maintenance:false},{id:'qa-paused',challenge_id:'focus',started:day,days:[],maintenance:false,pausedOn:day,pausedDays:0}],xp:{},journals:[],schedule:[],customChallenges:[],focusSessions:[],focusTimer:null,sosReflections:[],earnedAchievements:{},preferences:{language:'ru',islamic:false,sensitiveContent:false,concealSensitive:true,motivationFaith:false,dark:true,reminders:false,onboarded:true,goal:'',build:'',reduce:''}};
(async()=>{
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const results=[];
try{
 for(const width of [375,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await context.addInitScript(value=>{localStorage.setItem('nafs-guest-v1',JSON.stringify(value))},state);
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.NAFS_QA_URL||'http://localhost:3000',{waitUntil:'networkidle'});await page.locator('.bottom-nav>button').first().waitFor();
  // Exclude Next's developer toolbar only; runtime errors are still captured and asserted.
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  assert.equal(await page.locator('.bottom-nav>button').count(),5);
  for(let tab=0;tab<5;tab++){
   await page.locator('.bottom-nav>button').nth(tab).click();await page.waitForTimeout(150);
   const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,nav:document.querySelector('.bottom-nav').getBoundingClientRect().toJSON(),padding:parseFloat(getComputedStyle(document.querySelector('.app-content')).paddingBottom)}));
   assert(layout.scroll<=layout.width+1,`overflow width${width} tab${tab}: ${layout.scroll}`);
   assert(layout.nav.bottom<=844+1,`nav outside viewport width${width}`);assert(layout.padding>=layout.nav.height,`insufficient bottom padding width${width}`);
   results.push({width,tab,...layout});
   if(width===390)await page.waitForTimeout(400);if(width===390)await page.screenshot({path:`${output}/dark-tab-${tab}-390.png`,fullPage:true});
  }
  await page.locator('.bottom-nav>button').nth(2).click();
  assert(await page.locator('.motivation-card').count()>0,'Today quote missing');
  const before=await page.locator('.today-hub .motivation-card').first().getAttribute('data-message-id');
  await page.locator('.today-hub .motivation-card button').first().click();
  await page.waitForTimeout(100);assert.notEqual(await page.locator('.today-hub .motivation-card').first().getAttribute('data-message-id'),before);
  await page.locator('.profile-button').click();await page.locator('[role=dialog]').waitFor();
  const modalLayout=await page.locator('[role=dialog]').evaluate(el=>({width:el.getBoundingClientRect().width,scroll:el.scrollWidth,client:el.clientWidth}));assert(modalLayout.scroll<=modalLayout.client+1,'profile modal overflow');
  await page.getByRole('switch',{name:'Тёмная тема',exact:true}).click();
  assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('dark')),false);
  await page.locator('.language-setting select').selectOption('ar');await page.waitForTimeout(100);
  assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
  if(width===390)await page.waitForTimeout(400);if(width===390)await page.screenshot({path:`${output}/light-ar-profile-390.png`,fullPage:true});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[role=dialog]').count(),0);
  await page.locator('.bottom-nav>button').nth(1).click();await page.locator('.round-add').click();
  const title=page.locator('input[name=title]');await title.fill('اختبار');await page.setViewportSize({width,height:430});await title.focus();
  const keyboardLayout=await page.locator('[role=dialog]').evaluate(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth}));
  assert(!keyboardLayout.overflow,'reduced viewport horizontal overflow');assert(keyboardLayout.bottom<=keyboardLayout.height+1,'modal clipped with reduced viewport');
  if(width===390)await page.waitForTimeout(400);if(width===390)await page.screenshot({path:`${output}/keyboard-height-ar-task-390.png`,fullPage:true});
  results.push({width,modalLayout,keyboardLayout,errors});assert.deepEqual(errors,[],'Browser runtime errors');
  await context.close();
 }
 fs.writeFileSync(`${output}/results.json`,JSON.stringify({status:'passed',results,limits:'Chromium mobile emulation and viewport-resize keyboard approximation; not physical iOS Safari, native keyboard or Telegram auth.'},null,2));
 console.log(`PASS: ${results.length} browser layout/interaction records. Screenshots and JSON: ${output}`);
}finally{await browser.close()}
})().catch(error=>{console.error(error.stack);process.exitCode=1});
