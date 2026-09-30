// Run with Playwright installed and a local HTTP server serving the repository.
// BASE_URL defaults to http://127.0.0.1:8765.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto((process.env.BASE_URL||'http://127.0.0.1:8765')+'/traghettamenti.html');
 await p.locator('#day').selectOption('mercoledi');await p.locator('[data-shift=mattina]').click();
 let card=p.locator('#groups [data-id="703"]');
 assert.match(await card.innerText(),/06:48/);assert.match(await card.innerText(),/07:28/);
 assert.match(await card.innerText(),/Partenza Termini/);
 await card.click();assert.match(await p.locator('#detail').innerText(),/06:48/);await p.locator('#close').click();
 await p.locator('[data-page=cerca]').click();await p.locator('#query').fill('734');assert.match(await p.locator('#searchResults').innerText(),/728/);assert.match(await p.locator('#searchResults').innerText(),/18:34/);
 await p.locator('[data-page=capoturno]').click();
 await p.locator('#captainDate').fill('2026-10-03');await p.locator('#captainShift').selectOption('pomeriggio');
 assert.equal(await p.locator('[data-crew]').count(),5);
 assert.equal(await p.locator('#captainTrains [data-id="598"]').count(),0);
 assert.equal(await p.locator('#captainTrains [data-id="546"]').count(),0);
 assert.equal(await p.locator('#captainTrains [data-id="728"]').count(),1);
 await p.locator('[data-crew="0"]').fill('Mario Rossi');await p.locator('[data-crew="1"]').fill('Anna Bianchi');
 await p.locator('[data-assign="592"]').selectOption('0');
 assert.equal(await p.locator('[data-assign="592"]').count(),0);
 await p.locator('#captainFilter').selectOption('assigned');assert.equal(await p.locator('[data-assign="592"]').inputValue(),'0');
 await p.locator('[data-assign="592"]').selectOption('1');
 await p.reload();await p.locator('[data-page=capoturno]').click();await p.locator('#captainDate').fill('2026-10-03');await p.locator('#captainShift').selectOption('pomeriggio');await p.locator('#captainFilter').selectOption('assigned');
 assert.equal(await p.locator('[data-crew="0"]').inputValue(),'Mario Rossi');assert.equal(await p.locator('[data-assign="592"]').inputValue(),'1');
 await p.locator('[data-complete="592"]').click();assert.equal(await p.locator('[data-assign="592"]').count(),0);
 await p.locator('#captainFilter').selectOption('completed');assert.equal(await p.locator('[data-complete="592"]').isChecked(),true);
 await p.locator('[data-complete="592"]').click();await p.locator('#captainFilter').selectOption('assigned');
 await p.locator('[data-crew="1"]').fill('');assert.equal(await p.locator('[data-assign="592"]').count(),0);
 await p.locator('#captainFilter').selectOption('available');assert.equal(await p.locator('[data-assign="592"]').inputValue(),'');
 await p.locator('#captainDate').fill('2026-10-04');assert.equal(await p.locator('[data-crew="0"]').inputValue(),'');
 await p.locator('#captainDate').fill('2026-10-03');assert.equal(await p.locator('[data-crew="0"]').inputValue(),'Mario Rossi');
 await p.locator('#captainShift').selectOption('notte');assert.equal(await p.locator('[data-crew="0"]').inputValue(),'');
 assert.match(await p.locator('#captainTrains [data-id="704"]').innerText(),/22:27/);
 assert.match(await p.locator('#captainTrains [data-id="534"]').innerText(),/Accessoriamento/);
 assert.doesNotMatch(await p.locator('#captainTrains [data-id="534"]').innerText(),/06:10/);
 await p.locator('#captainDate').fill('2026-10-04');await p.locator('#captainShift').selectOption('mattina');
 assert.equal(await p.locator('#captainTrains [data-id="581"]').count(),0);assert.equal(await p.locator('#captainTrains [data-id="531"]').count(),0);
 await p.locator('#captainDate').fill('2026-09-30');await p.locator('#captainShift').selectOption('pomeriggio');
 await p.locator('[data-crew="0"]').fill('<img src=x onerror=alert(1)>');assert.equal(await p.locator('#captainTrains .assign-controls img').count(),0);
 await p.locator('[data-crew="0"]').fill('Mario Rossi');await p.locator('[data-crew="1"]').fill('Anna Bianchi');
 await p.locator('[data-assign="540"]').selectOption('0');await p.locator('#captainFilter').selectOption('all');
 if(process.env.SCREENSHOT_DIR)await p.screenshot({path:process.env.SCREENSHOT_DIR+'/capoturno-desktop.png',fullPage:true});
 await p.setViewportSize({width:390,height:844});
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(process.env.SCREENSHOT_DIR)await p.screenshot({path:process.env.SCREENSHOT_DIR+'/capoturno-mobile.png',fullPage:true});
 await p.locator('[data-page=turni]').click();
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(process.env.SCREENSHOT_DIR)await p.screenshot({path:process.env.SCREENSHOT_DIR+'/turni-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 await context.close();
 // Disabled storage must not break scheduling or assignment within the page.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('denied')};Storage.prototype.setItem=()=>{throw Error('denied')}});
 const q=await denied.newPage();await q.goto((process.env.BASE_URL||'http://127.0.0.1:8765')+'/traghettamenti.html');await q.locator('[data-page=capoturno]').click();await q.locator('[data-crew="0"]').fill('Test');assert.match(await q.locator('#saveStatus').innerText(),/Impossibile salvare/);await denied.close();
 console.log('PASS: timetable, PDF aliases, Saturday/Sunday exclusions, five operators, assignment/reassignment/release, completion, persistence, date/shift isolation, night activities, escaping, storage failure, desktop/mobile layout.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
