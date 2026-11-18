const $ = id => document.getElementById(id);

// Mobile navigation
const menuButton = $("menuButton"), nav = $("nav");
if(menuButton && nav){
 menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
 });
 nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false");
 }));
}

// Simulação educativa independente do check-in: muda a legenda e a tonalidade,
// nunca representa lesões, estágio clínico ou condição pulmonar individual.
const lungModel = $("lungModel");
const lungModelCaption = $("lungModelCaption");
const exposureCopy = {
 never:{label:"PREVENÇÃO",icon:"✳",text:"Sem exposição relatada: não começar é a forma mais segura de evitar os riscos associados ao aerossol e à nicotina."},
 tried:{label:"CONTATO PONTUAL",icon:"○",text:"Uma experiência não permite concluir que houve dano. Aerossóis podem conter nicotina e partículas que alcançam as vias respiratórias."},
 occasional:{label:"EXPOSIÇÃO REPETIDA",icon:"≈",text:"Mesmo o uso não diário pode expor as vias respiratórias a substâncias irritantes. A ilustração não estima efeitos no seu corpo."},
 frequent:{label:"EXPOSIÇÃO FREQUENTE",icon:"↗",text:"O uso frequente pode aumentar a exposição a nicotina e outras substâncias do aerossol. Isso não significa que a imagem consiga mostrar lesões."},
 unknown:{label:"SEM INFORMAÇÃO",icon:"○",text:"Você não precisa compartilhar seu histórico. O esquema permanece neutro e serve apenas para explicar a anatomia."}
};
function setLungState(state){
 const item=exposureCopy[state]||exposureCopy.never;
 if(lungModel) lungModel.dataset.exposure=state;
 if(lungModelCaption) lungModelCaption.innerHTML=`<strong>${item.label}:</strong> ${item.text}`;
 const effectIcon=$("effectIcon"), effectLabel=$("effectLabel"), effectText=$("effectText");
 if(effectIcon) effectIcon.textContent=item.icon;
 if(effectLabel) effectLabel.textContent=item.label;
 if(effectText) effectText.textContent=item.text;
 document.querySelectorAll(".exposure-option").forEach(button=>{
  const active=button.dataset.state===state;
  button.classList.toggle("active",active);
  button.setAttribute("aria-pressed",String(active));
 });
}
document.querySelectorAll(".exposure-option").forEach(button=>button.addEventListener("click",()=>setLungState(button.dataset.state)));
if(lungModel || document.querySelector(".exposure-option")) setLungState("never");

// Check-in express: uma escolha opcional, sem formulário longo ou pontuação.
const pulseMessages={curioso:'Boa! Comece por uma missão e descubra uma informação nova em poucos minutos.',pressao:'Seu limite importa. Você pode dizer “não, valeu” e sair da situação. Se precisar, procure alguém de confiança.',mudanca:'Escolha uma mudança pequena e possível para hoje. Um passo real vale mais que uma promessa enorme.',apoio:'Você não precisa resolver tudo sozinho. Converse com alguém de confiança ou procure a equipe de saúde da sua UBS.'};
document.querySelectorAll('[data-pulse]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-pulse]').forEach(x=>x.classList.toggle('active',x===button));
 $('pulseFeedback').textContent=pulseMessages[button.dataset.pulse];
}));

// Sequência diária: registros autorrelatados, armazenados somente neste navegador.
(() => {
 const key = "vivalivreDailyStreakV1";
 const el = id => document.getElementById(id);
 let records = {};
 try { records = JSON.parse(localStorage.getItem(key)) || {}; } catch (_) { records = {}; }

 const keyFor = date => {
   const y=date.getFullYear(), m=String(date.getMonth()+1).padStart(2,"0"), d=String(date.getDate()).padStart(2,"0");
   return `${y}-${m}-${d}`;
 };
 const todayKey = () => keyFor(new Date());
 const shift = (key, amount) => {
   const [y,m,d]=key.split("-").map(Number), date=new Date(y,m-1,d);
   date.setDate(date.getDate()+amount);
   return keyFor(date);
 };
 function streakAt(end) {
   let n=0, cursor=end;
   while(records[cursor]===true) { n++; cursor=shift(cursor,-1); }
   return n;
 }
 function bestRun() {
   const dates=Object.keys(records).filter(k=>records[k]===true).sort();
   let best=0, run=0, prev="";
   dates.forEach(k=>{
     run=prev && shift(prev,1)===k ? run+1 : 1;
     best=Math.max(best,run); prev=k;
   });
   return best;
 }
 function render() {
   const today=todayKey(), yesterday=shift(today,-1);
   const count=records[today]===true ? streakAt(today) :
     records[today]===false ? 0 : streakAt(yesterday);
   const total=Object.values(records).filter(v=>v===true).length;
   el("dayCount").textContent=count;
   el("totalDays").textContent=total;
   el("bestStreak").textContent=bestRun();
   el("streakMessage").textContent=records[today]===true
     ? "Dia registrado! Cada escolha conta. Continue no seu ritmo. 💚"
     : records[today]===false
       ? "Tudo bem recomeçar. Uma recaída não apaga seu esforço nem impede que você procure apoio."
       : count>0
         ? `Você está há ${count} dia(s) na sua sequência. Confirme quando terminar o dia.`
         : "Sua sequência começa com um dia. Marque quando passar o dia sem usar.";
   const calendar=el("streakCalendar");
   calendar.innerHTML="";
   const labels=["D","S","T","Q","Q","S","S"];
   for(let i=6;i>=0;i--){
     const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i);
     const k=keyFor(d), item=document.createElement("div");
     item.className="calendar-day"+(records[k]===true?" done":records[k]===false?" reset":"")+(i===0?" today":"");
     const label=document.createElement("span"); label.textContent=labels[d.getDay()];
     const bubble=document.createElement("b"); bubble.textContent=records[k]===true?"✓":String(d.getDate());
     item.append(label,bubble); calendar.appendChild(item);
   }
   const save=el("saveDate");
   save.textContent=records[today]===true?"✓ Hoje já foi registrado":"✓ Hoje fiquei sem usar";
   save.disabled=records[today]===true;
 }
 el("saveDate").addEventListener("click",()=>{
   records[todayKey()]=true;
   localStorage.setItem(key,JSON.stringify(records));
   render();
 });
 el("resetDate").addEventListener("click",()=>{
   records[todayKey()]=false;
   localStorage.setItem(key,JSON.stringify(records));
   render();
 });
 render();
})();


// VivaLivre Study: lista simples e cronômetro local.
(() => {
 const $ = id => document.getElementById(id);
 const key='vivalivreStudyLiteV1'; let tasks=[];
 try{tasks=JSON.parse(localStorage.getItem(key))||[]}catch(_){tasks=[]}
 const list=$('studyList');
 function render(){list.innerHTML='';$('studyCount').textContent=`${tasks.length} ${tasks.length===1?'tarefa':'tarefas'}`;
  if(!tasks.length){const li=document.createElement('li');li.className='study-empty';li.textContent='Sua lista começa com uma tarefa pequena.';list.append(li);return;}
  tasks.forEach((t,i)=>{const li=document.createElement('li');li.className='study-task'+(t.done?' done':'');const cb=document.createElement('input');cb.type='checkbox';cb.checked=t.done;cb.setAttribute('aria-label','Marcar tarefa como concluída');cb.addEventListener('change',()=>{tasks[i].done=cb.checked;save()});const span=document.createElement('span');span.textContent=t.title;const del=document.createElement('button');del.type='button';del.textContent='Remover';del.addEventListener('click',()=>{tasks.splice(i,1);save()});li.append(cb,span,del);list.append(li)});
 }
 function save(){localStorage.setItem(key,JSON.stringify(tasks));render()}
 $('studyForm').addEventListener('submit',e=>{e.preventDefault();const v=$('studyTask').value.trim();if(!v)return;tasks.unshift({title:v,done:false});$('studyTask').value='';save()});render();
 let remaining=1500,tick=null;const clock=$('studyClock');function paint(){clock.textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`}
 document.querySelectorAll('[data-study-min]').forEach(b=>b.addEventListener('click',()=>{clearInterval(tick);tick=null;remaining=Number(b.dataset.studyMin)*60;paint();$('studyStart').textContent='Começar';document.querySelectorAll('[data-study-min]').forEach(x=>x.classList.toggle('chosen',x===b));$('studyTimerMessage').textContent='Tempo ajustado. Quando estiver pronto, comece.'}));
 $('studyStart').addEventListener('click',()=>{if(tick){clearInterval(tick);tick=null;$('studyStart').textContent='Continuar';$('studyTimerMessage').textContent='Pausa rápida. Você pode retomar quando quiser.';return;}if(remaining<=0)remaining=1500;$('studyStart').textContent='Pausar';$('studyTimerMessage').textContent='Você está em foco. Faça o que der, no seu ritmo.';tick=setInterval(()=>{remaining--;paint();if(remaining<=0){clearInterval(tick);tick=null;$('studyStart').textContent='Começar de novo';$('studyTimerMessage').textContent='Sessão concluída! Levante, beba água e celebre o começo.'}},1000)});
 $('studyReset').addEventListener('click',()=>{clearInterval(tick);tick=null;remaining=1500;paint();$('studyStart').textContent='Começar';$('studyTimerMessage').textContent='Cronômetro reiniciado.';document.querySelectorAll('[data-study-min]').forEach(x=>x.classList.toggle('chosen',x.dataset.studyMin==='25'))});paint();
})();

// O relato é preparado localmente. Não há transmissão nem promessa de anonimato.
(() => {
 const form=document.getElementById('reportForm'); if(!form)return;
 form.addEventListener('submit',e=>{e.preventDefault();
  const place=document.getElementById('reportPlace').value.trim(),date=document.getElementById('reportDate').value,time=document.getElementById('reportTime').value,details=document.getElementById('reportDetails').value.trim();
  const lines=['RELATO PARA A GESTÃO ESCOLAR','',`Local: ${place}`,`Data aproximada: ${date||'Não informada'}`,`Horário aproximado: ${time||'Não informado'}`,'','Descrição objetiva:',details,'','Este relato descreve uma observação e solicita orientação da gestão. Não identifica estudantes nem afirma fatos que não foram observados.'];
  document.getElementById('reportText').value=lines.join('\n');document.getElementById('reportOutput').hidden=false;document.getElementById('copyStatus').textContent='';
 });
 document.getElementById('copyReport').addEventListener('click',async()=>{const txt=document.getElementById('reportText').value;try{await navigator.clipboard.writeText(txt);document.getElementById('copyStatus').textContent='Relato copiado. Encaminhe pelo canal oficial da escola.'}catch(_){document.getElementById('reportText').select();document.getElementById('copyStatus').textContent='Selecione e copie o texto para compartilhar pelo canal oficial.'}});
})();


// Interação acessível: mantém um mito/verdade aberto por vez.
document.querySelectorAll('.myth-card').forEach(card => {
  card.addEventListener('toggle', () => {
    if (!card.open) return;
    document.querySelectorAll('.myth-card').forEach(other => {
      if (other !== card) other.open = false;
    });
  });
});
