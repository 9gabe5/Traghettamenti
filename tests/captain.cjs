const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),storage=new Map();
function element(id){if(!elements.has(id))elements.set(id,{value:id==='captainFilter'?'all':'',innerHTML:'',textContent:'',validity:{valid:true},listeners:{},addEventListener(type,fn){this.listeners[type]=fn},setAttribute(){},closest(){return {hidden:false}}});return elements.get(id)}
const context=vm.createContext({console,Intl,Date,Map,document:{body:{classList:{add(){},remove(){}}},addEventListener(){},getElementById:element,querySelectorAll:()=>[]},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},AbortController,setTimeout,clearTimeout});
const html=fs.readFileSync('traghettamenti.html','utf8');
vm.runInContext(html.match(/<script>\s*(const TURNI[\s\S]*?)<\/script>/)[1],context);
vm.runInContext(fs.readFileSync('assets/operations.js','utf8'),context);
const run=code=>vm.runInContext(code,context);
run("captainDate='2026-10-01';captainShift='mattina';loadCaptain();renderCaptainTrains()");
assert.equal(run('captainState.names.length'),6);
assert.equal(run('captainState.assignments[534]'),'TI');assert.equal(run('captainState.assignments[1956]'),'303');
run("captainState.names[5]='Sesto';captainState.assignments[727]=5;renderCaptainTrains()");
assert.equal(run('captainSuggestions(captainServices().find(t=>t.id===723))[0].slot'),5);
assert.equal(run('captainSuggestions(captainServices().find(t=>t.id===703)).length'),0);
assert.equal(run('captainSuggestions(captainServices().find(t=>t.id===1956)).length'),0);
assert.match(element('captainTrains').innerHTML,/data-suggest="723"/);
element('captainTrains').listeners.click({target:{closest:()=>({dataset:{suggest:'723',slot:'5'}})}});
assert.equal(run('captainState.assignments[723]'),5);
run('captainState.completed[534]=true;saveCaptain();loadCaptain()');
assert.equal(run('captainState.names[5]'),'Sesto');assert.equal(run('captainState.assignments[723]'),5);assert.equal(run('captainState.completed[534]'),true);
run("captainDate='2026-10-04';loadCaptain();captainState.names[0]='Tizio';captainState.assignments[727]=0");
assert.equal(run('captainState.assignments[1956]'),undefined);assert.equal(run('captainSuggestions(captainServices().find(t=>t.id===1956))[0].slot'),0);
run("captainState.names[1]='Caio';captainState.assignments[723]=1");
assert.equal(run('captainSuggestions(captainServices().find(t=>t.id===723)).length'),0);assert.equal(run('captainSuggestions(captainServices().find(t=>t.id===1956)).length'),2);
run("captainState.names[0]='';delete captainState.assignments[727]");
assert.equal(run('captainSuggestions(captainServices().find(t=>t.id===1956)).length'),1);
storage.set('traghettamenti.capoturno.v1.2026-10-02.mattina',JSON.stringify({names:['Legacy','','','',''],assignments:{727:0,534:0,1956:0},completed:{727:true}}));
run("captainDate='2026-10-02';loadCaptain()");assert.equal(run('captainState.names.length'),6);assert.equal(run('captainState.assignments[727]'),0);assert.equal(run('captainState.completed[727]'),true);assert.equal(run('captainState.assignments[534]'),'TI');assert.equal(run('captainState.assignments[1956]'),'303');
run("captainShift='pomeriggio';loadCaptain()");
assert.equal(run('captainState.assignments[591]'),'TI');assert.equal(run('captainState.assignments[774]'),'TI');assert.equal(run('captainState.assignments[707]'),undefined);
run("captainDate='2026-10-03';captainState.names[0]='Test';captainState.assignments[540]=0");
assert.equal(run('captainSuggestions(captainServices().find(t=>t.id===728))[0].slot'),0);assert.equal(run('captainServices().some(t=>t.id===598)'),false);
run("captainShift='notte';loadCaptain();captainState.names[0]='Notte';captainState.assignments[774]=0");assert.equal(run('captainSuggestions(captainServices().find(t=>t.id===704))[0].slot'),0);
console.log('PASS: six slots, TI/303 automatic responsibility, weekday exceptions, roster suggestions, confirmation, no overwrites, persistence, legacy migration, excluded trains and shift isolation.');

run("captainDate='2026-10-01';captainShift='mattina';loadCaptain();renderCaptainTrains()");
assert.equal(run('captainPrintReady()'),false);assert.equal(element('captainPrint').disabled,true);
run("captainState.names[0]='Mario & Anna';captainState.names[5]='Sesto <Collega>';for(const t of captainServices())if(!fixedCaptain(t))captainState.assignments[t.id]=t.id===727?5:0;renderCaptainTrains()");
assert.equal(run('captainPrintReady()'),true);assert.equal(element('captainPrint').disabled,false);
run('prepareCaptainPrint()');
const sheet=element('captainPrintSheet').innerHTML;
assert.match(sheet,/Mario &amp; Anna/);assert.match(sheet,/Sesto &lt;Collega&gt;/);assert.match(sheet,/TI - Trenitalia/);assert.match(sheet,/>303 /);assert.match(sheet,/01\/10\/2026/);assert.match(sheet,/06:48/);assert.match(sheet,/07:28/);
assert.equal((sheet.match(/<th scope="row">/g)||[]).length,run('captainServices().length'));
run("$('captainFilter').value='completed';renderCaptainTrains();prepareCaptainPrint()");assert.equal(element('captainPrintSheet').innerHTML,sheet);
run('delete captainState.assignments[727];renderCaptainTrains()');assert.equal(element('captainPrint').disabled,true);assert.equal(run('prepareCaptainPrint()'),false);
run("captainShift='notte';loadCaptain();captainState.names[0]='Notte';for(const t of captainServices())captainState.assignments[t.id]=0;prepareCaptainPrint()");assert.doesNotMatch(element('captainPrintSheet').innerHTML,/06:10/);assert.match(element('captainPrintSheet').innerHTML,/22:27/);
console.log('PASS: A4 print gating, all services regardless of view filter, grouping, date, escaped names, TI/303, timetable and night separation.');

if(process.env.PRINT_PREVIEW_DIR){
 fs.mkdirSync(process.env.PRINT_PREVIEW_DIR,{recursive:true});
 for(const shift of ['mattina','pomeriggio','notte']){
  run(`{captainDate='2026-10-01';captainShift='${shift}';loadCaptain();captainState.names=Array.from({length:6},(_,i)=>('Traghettatore '+(i+1)+' Cognome molto lungo per prova stampa').slice(0,60));let n=0;for(const t of captainServices())if(!fixedCaptain(t))captainState.assignments[t.id]=n++%6;prepareCaptainPrint()}`);
  fs.writeFileSync(process.env.PRINT_PREVIEW_DIR+'/'+shift+'.html','<!doctype html><html lang="it"><meta charset="utf-8"><style>'+fs.readFileSync('assets/operations.css','utf8')+'</style><body class="captain-print"><section id="captainPrintSheet">'+element('captainPrintSheet').innerHTML+'</section></body></html>');
 }
}

const expectedTimes={mattina:{771:{arrival:'06:35'},723:{departure:'06:40',termini:'07:26'},703:{departure:'06:48',termini:'07:28'},531:{arrival:'08:55'},1960:{arrival:'09:51'},727:{departure:'10:40',termini:'11:26'},540:{report:'13:00'},592:{report:'13:00'}},pomeriggio:{540:{departure:'14:12',termini:'15:22'},700:{arrival:'14:34'},592:{departure:'14:20',termini:'15:30'},707:{departure:'14:46',termini:'15:26'},598:{departure:'17:05',termini:'18:15'},728:{arrival:'18:34'},546:{departure:'18:45',termini:'19:55'},585:{arrival:'dopo le 20:00'},1955:{departure:'19:51',termini:'20:31'},702:{arrival:'20:34'}},notte:{774:{departure:'21:55',termini:'22:35'},704:{arrival:'22:27'}}};
for(const [shift,trains] of Object.entries(expectedTimes))for(const [id,fields] of Object.entries(trains))for(const [field,time] of Object.entries(fields))assert.equal(run(`timetableInfo({id:${id}},'${shift}','giovedi').${field}`),time);
for(const weekday of ['domenica','lunedi'])assert.equal(run(`timetableInfo({id:1956},'mattina','${weekday}').arrival`),'07:24');
for(const weekday of ['martedi','mercoledi','giovedi','venerdi','sabato'])assert.equal(run(`timetableInfo({id:1956},'mattina','${weekday}').arrival`),undefined);
for(const id of [534,581])assert.equal(run(`timetableInfo({id:${id}},'mattina')`),undefined);
for(const id of [774,1959])assert.equal(run(`timetableInfo({id:${id}},'pomeriggio')`),undefined);
for(const [alias,id] of [['770',771],['89530',1960],['734',728],['584',585]]){
 element('query').value=alias;run('search()');assert.match(element('searchResults').innerHTML,new RegExp('data-id="'+id+'"'));
}
for(const [date,hasTime] of [['2026-10-04',true],['2026-10-05',true],['2026-10-01',false]]){
 run(`captainDate='${date}';captainShift='mattina';loadCaptain();captainState.names[0]='Test';for(const t of captainServices())if(!fixedCaptain(t))captainState.assignments[t.id]=0;prepareCaptainPrint()`);
 assert.equal(element('captainPrintSheet').innerHTML.includes('07:24'),hasTime);
 assert.match(element('captainPrintSheet').innerHTML,/06:40/);assert.match(element('captainPrintSheet').innerHTML,/11:26/);
}
console.log('PASS: all times transcribed from supplied sheet, 1956 Sunday/Monday exception, missing times, aliases, search and dated print consistency.');
