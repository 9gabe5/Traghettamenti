// Orari trascritti dal foglio «TRAGHETTAMENTI» fornito il 01/10/2026.
// P.p. = partenza Parco Prenestino; P.t. = partenza Termini.
const TIMETABLE = {
  mattina: {
    771: {arrival:'06:35', notes:'Per raggiungere il 771: corsetta da Parco alle 06:10 lun–ven. Sabato, domenica e festivi: taxi.', aliases:['770']},
    723: {departure:'06:40', termini:'07:26', notes:'Rientro da Termini con 1956 alle 07:24, solo domenica e lunedì.'},
    1956: {notes:'Nel foglio il rientro con 1956 alle 07:24 è previsto solo domenica e lunedì. L’orario del servizio 303 negli altri giorni non è indicato.', perGiorno:{domenica:{arrival:'07:24',notes:'Rientro da Termini collegato al 723. Solo domenica e lunedì.'},lunedi:{arrival:'07:24',notes:'Rientro da Termini collegato al 723. Solo domenica e lunedì.'}}},
    703: {departure:'06:48', termini:'07:28', notes:'Rientro con 531 alle 08:55, esclusa domenica.'},
    531: {arrival:'08:55'},
    1960: {arrival:'09:51', aliases:['89530']},
    727: {departure:'10:40', termini:'11:26'},
    540: {report:'13:00'}, 592: {report:'13:00'}
  },
  pomeriggio: {
    540: {departure:'14:12', termini:'15:22', notes:'Rientro con 700 alle 14:34. Cambio banco volante con PdC al paraurti.'},
    700: {arrival:'14:34', notes:'Cambio banco volante con PdC al paraurti.'},
    592: {departure:'14:20', termini:'15:30', notes:'Rientro con taxi. Sabato, domenica e festivi: verificare se il 585 arriva in anticipo per le 16:20; solo se confermato, collegarlo al 592.'},
    707: {departure:'14:46', termini:'15:26'},
    598: {departure:'17:05', termini:'18:15', notes:'Escluso sabato. Rientro con 728 (734), arrivo a Termini alle 18:34.'},
    728: {arrival:'18:34', notes:'Anche il sabato: rientro da Termini.', aliases:['734']},
    546: {departure:'18:45', termini:'19:55', notes:'Escluso sabato. Rientro con 585 (584), arrivo a Termini dopo le 20:00.'},
    585: {arrival:'dopo le 20:00', notes:'Sabato, domenica e festivi: verificare possibile arrivo anticipato per le 16:20. Solo se confermato, collegare al 592.', aliases:['584']},
    1955: {departure:'19:51', termini:'20:31',notes:'Rientro con 702, arrivo a Termini alle 20:34.'},
    702: {arrival:'20:34'}
  },
  notte: {
    774: {departure:'21:55', termini:'22:35', notes:'Rientro con 704, arrivo a Termini alle 22:27.'},
    704: {arrival:'22:27'},
    701:{},534:{},723:{},703:{},727:{},'RM-SMLB':{notes:'Orario e giorni variabili. Altri treni da provare su richiesta.'}
  }
};
function timetableInfo(t,k,weekday=day){
  const info=TIMETABLE[k]?.[t.id];
  return info?{...info,...info.perGiorno?.[weekday]}:undefined;
}
// Non si propagano gli orari di partenza mattutini alle prove del turno notte.
for (const id of [598,546]) TURNI.pomeriggio.treni.find(t=>t.id===id).excludeOn=['sabato'];
for (const t of TURNI.notte.treni) if ([701,534,723,703,727,'RM-SMLB'].includes(t.id)) t.isAcc=true;
function scheduleMarkup(t,k,detail=false){
  const info=timetableInfo(t,k);
  const times=info?[
    ['Partenza Parco Prenestino',info.departure],
    ['Partenza Termini',info.termini],
    ['Arrivo Termini → Parco Prenestino',info.arrival],
    ['Presentazione per prova',info.report]
  ].filter(([,value])=>value):[];
  const content=times.length?times.map(([label,value])=>`<span class="schedule-time"><small>${esc(label)}</small><strong>${esc(value)}</strong></span>`).join(''):'<span class="schedule-missing">Orario non indicato nel foglio</span>';
  return `<span class="schedule ${detail?'schedule-detail':''}">${content}</span>${info?.notes?`<span class="schedule-note">${esc(info.notes)}</span>`:''}${detail?`<p class="subline">Fonte orari: foglio Traghettamenti fornito il 01/10/2026${info?.aliases?` · Numerazione alternativa nel foglio: ${info.aliases.map(esc).join(', ')}`:''}.</p>`:''}`;
}
function romeDate(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function weekdayFor(date){return DAYS[new Date(date+'T12:00:00Z').getUTCDay()]}
const captainPrefix='traghettamenti.capoturno.v1.';
let captainDate=romeDate(),captainShift=shift,captainState;
// Before 06:00 the current night shift began on the previous calendar day.
if(hour<6){const d=new Date(captainDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);captainDate=d.toISOString().slice(0,10)}
function captainKey(){return captainPrefix+captainDate+'.'+captainShift}
function emptyCaptain(){return {names:Array(6).fill(''),assignments:{},completed:{}}}
// Resolve responsibility from the dated roster, never from descriptive train text.
function captainRole(t){
  const weekday=weekdayFor(captainDate);
  if(t.responsabilePerGiorno?.[weekday]==='303'||t.responsabile==='303')return 'external';
  if(t.responsabile)return 'other';
  for(const role of ['traghetto','t1','t2','t3']){
    const data=TURNI[captainShift].ruoli[role];
    const roster=data?.perGiorno?data.perGiorno[weekday]:data;
    if(roster&&[...roster.treni,...roster.acc].some(id=>String(id)===String(t.id)))return role;
  }
  return null;
}
function fixedCaptain(t){const role=captainRole(t);return role==='traghetto'?'TI':role==='external'?'303':null}
function syncFixedCaptain(){
  for(const t of captainServices()){
    const fixed=fixedCaptain(t);
    if(fixed)captainState.assignments[t.id]=fixed;
  }
}
function captainSuggestions(t){
  const role=captainRole(t);
  if(!['t1','t2','t3'].includes(role)||captainState.assignments[t.id]!==undefined)return [];
  const bySlot=new Map();
  for(const source of captainServices()){
    const slot=captainState.assignments[source.id];
    if(captainRole(source)===role&&Number.isInteger(slot)&&captainState.names[slot]?.trim()){
      if(!bySlot.has(slot))bySlot.set(slot,[]);
      bySlot.get(slot).push(source.id);
    }
  }
  return [...bySlot].map(([slot,ids])=>({slot,ids,role}));
}
function loadCaptain(){
  captainState=emptyCaptain();
  try{
    const stored=JSON.parse(localStorage.getItem(captainKey())||'null');
    if(stored&&Array.isArray(stored.names)){
      captainState.names=captainState.names.map((_,i)=>typeof stored.names[i]==='string'?stored.names[i].slice(0,60):'');
      for(const t of TURNI[captainShift].treni){
        const id=String(t.id),slot=stored.assignments?.[id];
        if(fixedCaptain(t)||Number.isInteger(slot)&&slot>=0&&slot<6&&captainState.names[slot].trim()){
          captainState.assignments[id]=slot;
          if(stored.completed?.[id]===true)captainState.completed[id]=true;
        }
      }
    }
    $('saveStatus').textContent='Nomi e assegnazioni sono salvati solo in questo browser e su questo dispositivo, separati per data e turno.';
  }catch{$('saveStatus').textContent='Salvataggio locale non disponibile o dati illeggibili. Le modifiche resteranno solo in questa sessione.'}
  syncFixedCaptain();
}
function saveCaptain(){
  try{localStorage.setItem(captainKey(),JSON.stringify(captainState));$('saveStatus').textContent='Salvato su questo dispositivo · '+captainDate.split('-').reverse().join('/')+' · '+TURNI[captainShift].nome+'. Non sincronizzato con altri dispositivi.'}
  catch{$('saveStatus').textContent='Impossibile salvare su questo dispositivo. Le modifiche resteranno solo in questa sessione.'}
}
function captainServices(){const weekday=weekdayFor(captainDate);return TURNI[captainShift].treni.filter(t=>!t.excludeOn?.includes(weekday))}
function renderCaptain(){
  day=weekdayFor(captainDate);shift=captainShift;$('day').value=day;render();
  $('captainDate').value=captainDate;$('captainShift').value=captainShift;
  $('crewFields').innerHTML=captainState.names.map((name,i)=>`<label>Traghettatore ${i+1}<input type="text" data-crew="${i}" maxlength="60" value="${esc(name)}" placeholder="Nome e cognome" autocomplete="off"></label>`).join('');
  renderCaptainTrains();
}
function renderCaptainTrains(){
  syncFixedCaptain();
  const services=captainServices(),a=captainState.assignments,c=captainState.completed;
  const available=services.filter(t=>a[t.id]===undefined).length;
  const completed=services.filter(t=>c[t.id]).length;
  $('captainPrint').disabled=available!==0||services.length===0;
  $('captainPrintHint').textContent=available?`Assegna ancora ${available} servizi per stampare il riepilogo.`:'Tutti i servizi sono assegnati. Stampa su A4 verticale o salva come PDF.';
  $('captainSummary').textContent=`${available} da assegnare · ${services.length-available-completed} assegnati · ${completed} completati`;
  const mode=$('captainFilter').value;
  const visible=services.filter(t=>mode==='all'||(mode==='available'?a[t.id]===undefined:mode==='completed'?c[t.id]:a[t.id]!==undefined&&!c[t.id]));
  const named=captainState.names.some(n=>n.trim());
  $('captainTrains').innerHTML=visible.map(t=>{
    const id=String(t.id),slot=a[id],fixed=fixedCaptain(t);
    const suggestions=captainSuggestions(t).map(({slot,ids,role})=>`<button type="button" class="suggestion" data-suggest="${esc(id)}" data-slot="${slot}">Suggerito: ${esc(captainState.names[slot].trim())} · ${esc(ROLE[role])} (già assegnato a ${ids.map(esc).join(', ')}) — Assegna anche il ${esc(id)}</button>`).join('');
    const options=captainState.names.map((n,i)=>n.trim()?`<option value="${i}" ${slot===i?'selected':''}>${esc(n.trim())}</option>`:'').join('');
    const weekday=weekdayFor(captainDate);
    const responsible=t.responsabilePerGiorno?.[weekday]||t.responsabile;
    return `<article class="group captain-card">${train(t,captainShift)}${responsible?`<p class="responsible-note">Responsabilità da prospetto: ${esc(responsible)}</p>`:''}<div class="assign-controls"><label>Assegna il ${esc(id)} a<select data-assign="${esc(id)}" ${fixed||!named?'disabled':''}>${fixed?`<option value="${fixed}" selected>${fixed}</option>`:`<option value="">Da assegnare</option>${options}`}</select></label>${fixed?'<small>Assegnazione automatica da prospetto.</small>':suggestions}${slot!==undefined?`<label class="completion"><input type="checkbox" data-complete="${esc(id)}" ${c[id]?'checked':''}> Completato</label>`:(!named?'<small>Inserisci un nome sopra per assegnare.</small>':'')}</div></article>`;
  }).join('')||'<div class="empty">Nessun servizio in questa categoria.</div>';
}
$('captainDate').value=captainDate;$('captainShift').value=captainShift;
loadCaptain();
$('captainDate').onchange=()=>{if(!$('captainDate').value||!$('captainDate').validity.valid){$('captainDate').value=captainDate;return}captainDate=$('captainDate').value;loadCaptain();renderCaptain()};
$('captainShift').onchange=()=>{captainShift=$('captainShift').value;loadCaptain();renderCaptain()};
$('captainFilter').onchange=renderCaptainTrains;
$('crewFields').addEventListener('input',e=>{
  if(!e.target.matches('[data-crew]'))return;
  const slot=Number(e.target.dataset.crew);captainState.names[slot]=e.target.value;
  if(!e.target.value.trim())for(const [id,assigned] of Object.entries(captainState.assignments))if(assigned===slot){delete captainState.assignments[id];delete captainState.completed[id]}
  saveCaptain();renderCaptainTrains();
});
$('captainTrains').addEventListener('change',e=>{
  if(e.target.matches('[data-assign]')){
    const id=e.target.dataset.assign;
    const service=captainServices().find(t=>String(t.id)===id);
    if(!service||fixedCaptain(service))return;
    if(e.target.value==='')delete captainState.assignments[id];
    else{const slot=Number(e.target.value);if(!Number.isInteger(slot)||slot<0||slot>=6||!captainState.names[slot].trim())return;captainState.assignments[id]=slot}
    delete captainState.completed[id];
  }else if(e.target.matches('[data-complete]')){
    const id=e.target.dataset.complete;if(captainState.assignments[id]===undefined)return;
    captainState.completed[id]=e.target.checked;
  }else return;
  saveCaptain();renderCaptainTrains();
});
window.addEventListener('storage',e=>{if(e.key===captainKey()||e.key===null){loadCaptain();if(page==='capoturno')renderCaptain()}});

$('captainTrains').addEventListener('click',e=>{
  const button=e.target.closest('[data-suggest]');if(!button)return;
  const id=button.dataset.suggest,slot=Number(button.dataset.slot);
  const service=captainServices().find(t=>String(t.id)===id);
  if(!service||!captainSuggestions(service).some(s=>s.slot===slot))return;
  captainState.assignments[id]=slot;delete captainState.completed[id];
  saveCaptain();renderCaptainTrains();
});

function captainPrintReady(){
  const services=captainServices();
  return services.length>0&&services.every(t=>captainState.assignments[t.id]!==undefined);
}
function captainPrintMarkup(){
  const services=captainServices(),groups=new Map();
  for(const t of services){
    const slot=captainState.assignments[t.id];
    if(!groups.has(slot))groups.set(slot,[]);
    groups.get(slot).push(t);
  }
  // Numeric slots remain separate even when two colleagues have the same name.
  const ordered=[...groups].sort(([a],[b])=>{
    const rank=slot=>Number.isInteger(slot)?slot:slot==='TI'?6:7;
    return rank(a)-rank(b);
  });
  const rows=ordered.map(([slot,trains])=>{
    const name=Number.isInteger(slot)?captainState.names[slot].trim():slot==='TI'?'TI - Trenitalia':slot;
    return `<tbody><tr class="print-person"><th colspan="6" scope="rowgroup">${esc(name)} <span>${trains.length} servizi</span></th></tr>${trains.map(t=>{
      const info=timetableInfo(t,captainShift,weekdayFor(captainDate))||{};
      const activity=t.isAcc?'Accessoriamento / prova':t.direzione||description(t);
      return `<tr><th scope="row">${esc(t.id)}</th><td>${esc(activity)}</td>${[info.departure,info.termini,info.arrival,info.report].map(time=>`<td>${esc(time||'—')}</td>`).join('')}</tr>`;
    }).join('')}</tbody>`;
  }).join('');
  return `<header class="print-heading"><div><p>PARCO PRENESTINO · CAPOTURNO</p><h1>Riepilogo assegnazioni</h1></div><div>${esc(captainDate.split('-').reverse().join('/'))}<br>${esc(TURNI[captainShift].nome)} · ${esc(TURNI[captainShift].range)}</div></header><p class="print-summary">${services.length} servizi assegnati · ${captainState.names.filter(n=>n.trim()).length} traghettatori presenti</p><table class="print-table"><colgroup><col style="width:10%"><col style="width:26%"><col style="width:16%"><col style="width:16%"><col style="width:16%"><col style="width:16%"></colgroup><thead><tr><th scope="col">Treno</th><th scope="col">Attività</th><th scope="col">Partenza<br>Parco Prenestino</th><th scope="col">Partenza<br>Termini</th><th scope="col">Arrivo Termini<br>→ Parco</th><th scope="col">Presentazione<br>per prova</th></tr></thead>${rows}</table><p class="print-footnote">— = orario non indicato nel prospetto. Fonte orari: foglio Traghettamenti fornito il 01/10/2026. La data indica l’inizio del turno, anche per la notte. Orari e variazioni da verificare operativamente.</p>`;
}
function prepareCaptainPrint(){
  syncFixedCaptain();
  if(!captainPrintReady())return false;
  $('captainPrintSheet').innerHTML=captainPrintMarkup();
  document.body.classList.add('captain-print');
  return true;
}
$('captainPrint').onclick=()=>{if(prepareCaptainPrint())window.print()};
window.addEventListener('beforeprint',()=>{if(page==='capoturno')prepareCaptainPrint()});
window.addEventListener('afterprint',()=>document.body.classList.remove('captain-print'));
