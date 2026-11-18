// VivaLivre Quest: trilha progressiva com desafios curtos, feedback e XP local.
(() => {
  const $ = id => document.getElementById(id);
  const stages = [
    {tag:'MISSÃO 01 · A NUVEM',art:'☁',title:'O que existe no aerossol do vape?',prompt:'Escolha a alternativa mais correta:',hint:'DICA: pense no que forma o aerossol.',answers:['É apenas vapor de água.','Pode conter nicotina, partículas e outras substâncias.','É só um aroma sem outras substâncias.'],correct:1,feedback:'Isso! O aerossol não é apenas vapor de água. Dependendo do produto, pode conter nicotina, partículas ultrafinas, compostos químicos e metais.'},
    {tag:'MISSÃO 02 · SEU CORPO',art:'♡',title:'Por onde esse aerossol passa?',prompt:'Quando uma pessoa inala o aerossol, o que acontece?',hint:'DICA: pense no caminho do ar ao respirar.',answers:['Ele percorre as vias respiratórias e chega aos pulmões.','Fica somente na boca.','Desaparece antes de entrar no corpo.'],correct:0,feedback:'Boa! O aerossol percorre as vias respiratórias e chega aos pulmões. Algumas substâncias podem irritar tecidos e afetar a saúde respiratória. Isso não permite prever o dano em uma pessoa específica.'},
    {tag:'MISSÃO 03 · NA PRESSÃO',art:'✋',title:'Se alguém insistir, como você pode responder?',prompt:'Imagine que um colega oferece um pod e insiste. Qual resposta respeita seu limite?',hint:'DICA: você não precisa justificar sua decisão.',answers:['Aceitar só para não ficar de fora.','Dizer “valeu, mas não quero” e mudar de assunto.','Ficar em silêncio mesmo se estiver desconfortável.'],correct:1,feedback:'Mandou bem! Um “não” curto já é suficiente. Você pode mudar de assunto, sair de perto ou buscar apoio de alguém de confiança. Pertencer ao grupo não deveria depender de usar.'},
    {tag:'MISSÃO 04 · SEU PRÓXIMO PASSO',art:'✦',title:'Qual pode ser um próximo passo de cuidado?',prompt:'Se você ou alguém próximo tiver dúvidas ou quiser ajuda, o que pode fazer?',hint:'DICA: procurar apoio é atitude, não fraqueza.',answers:['Guardar a dúvida para não ser julgado.','Confiar em qualquer dica de rede social.','Conversar com alguém de confiança ou procurar uma UBS.'],correct:2,feedback:'Exatamente. Conversar com alguém de confiança e procurar uma Unidade Básica de Saúde são caminhos possíveis. Você merece orientação sem julgamento.'}
  ];
  const key='vivalivreQuestPathV2';
  let state={done:[],xp:0,active:0};
  try { const saved=JSON.parse(localStorage.getItem(key)); if(saved&&Array.isArray(saved.done))state={...state,...saved}; } catch(_){}
  state.done=state.done.filter(n=>Number.isInteger(n)&&n>=0&&n<4);
  let selected=null,answered=false;
  const nodes=[...document.querySelectorAll('.quest-node')];
  function save(){localStorage.setItem(key,JSON.stringify(state));}
  function paintProgress(){
    const count=state.done.length, pct=count*25;
    $('missionXp').textContent=state.xp;
    $('missionProgressText').textContent=`${count} de 4 etapas concluídas`;
    $('missionPercent').textContent=pct+'%';
    $('missionProgressBar').style.width=pct+'%';
    $('questBadges').textContent=count+'/4';
    $('questLevel').textContent=count===4?'Nível 4 · Protagonista':count>=3?'Nível 3 · Voz ativa':count>=2?'Nível 2 · Explorador':count>=1?'Nível 1 · Descobridor':'Nível 1 · Curioso';
    nodes.forEach((node,i)=>{
      const done=state.done.includes(i), unlocked=i===0||state.done.includes(i-1);
      node.disabled=!unlocked;
      node.classList.toggle('completed',done);
      node.classList.toggle('locked',!unlocked);
      node.classList.toggle('active',i===state.active&&!done);
      node.querySelector('i').textContent=done?'✓ CONCLUÍDA':unlocked?(i===state.active?'EM ANDAMENTO':'DISPONÍVEL'):'BLOQUEADA';
    });
  }
  function renderStage(i){
    state.active=i;selected=null;answered=false;paintProgress();
    const s=stages[i];
    $('challengeTag').textContent=s.tag;$('challengeArt').textContent=s.art;
    $('challengeTitle').textContent=s.title;$('challengePrompt').textContent=s.prompt;
    $('challengeHint').textContent=s.hint;$('challengeFeedback').hidden=true;
    $('challengeFeedback').textContent='';
    $('challengeContinue').disabled=true;$('challengeContinue').classList.remove('ready');
    $('challengeContinue').textContent='Conferir resposta';
    const box=$('challengeOptions');box.innerHTML='';
    s.answers.forEach((answer,n)=>{
      const b=document.createElement('button');b.type='button';b.textContent=answer;b.dataset.answer=n;
      b.addEventListener('click',()=>{if(answered)return;selected=n;box.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',Number(x.dataset.answer)===n));$('challengeContinue').disabled=false;$('challengeContinue').classList.add('ready');});
      box.append(b);
    });
    if(state.done.includes(i)){
      answered=true;
      box.querySelectorAll('button').forEach((b,n)=>{b.disabled=true;if(n===s.correct)b.classList.add('correct')});
      $('challengeFeedback').hidden=false;$('challengeFeedback').innerHTML='<strong>Etapa concluída! ✓</strong>'+s.feedback;
      $('challengeContinue').disabled=false;$('challengeContinue').classList.add('ready');
      $('challengeContinue').textContent=i===3?'Rever conclusão':'Próxima etapa →';
    }
  }
  $('challengeContinue').addEventListener('click',()=>{
    const i=state.active,s=stages[i];
    if(!answered){
      if(selected===null)return;
      answered=true;
      const buttons=$('challengeOptions').querySelectorAll('button');
      buttons.forEach((b,n)=>{b.disabled=true;if(n===s.correct)b.classList.add('correct');else if(n===selected)b.classList.add('wrong')});
      const correct=selected===s.correct;
      $('challengeFeedback').hidden=false;
      $('challengeFeedback').innerHTML=`<strong>${correct?'Resposta certa! +25 XP ✨':'Quase! Vamos aprender juntos.'}</strong>${s.feedback}`;
      if(!state.done.includes(i)){state.done.push(i);state.xp+=25;save();}
      paintProgress();
      $('challengeContinue').textContent=i===3?'Ver minha conquista':'Continuar →';
      return;
    }
    if(i<3){renderStage(i+1);return;}
    $('challengeTag').textContent='JORNADA CONCLUÍDA';
    $('challengeArt').textContent='🏆';
    $('challengeTitle').textContent='Você desbloqueou sua trilha!';
    $('challengePrompt').textContent='Quatro passos de informação, autonomia e cuidado. Seu próximo passo pode ser compartilhar o que aprendeu.';
    $('challengeOptions').innerHTML='<a class="mission-jump" href="#apoio">Conhecer caminhos de apoio →</a><a class="mission-jump" href="#relato">Conhecer o canal de comunicação escolar →</a>';
    $('challengeFeedback').hidden=false;$('challengeFeedback').innerHTML='<strong>Conquista desbloqueada · Voz VivaLivre</strong>Você concluiu as quatro missões. Pode voltar ao mapa e rever qualquer etapa quando quiser.';
    $('challengeHint').textContent='SEU TOTAL';$('challengeContinue').disabled=true;$('challengeContinue').textContent=state.xp+' XP conquistados';
  });
  nodes.forEach(node=>node.addEventListener('click',()=>{const i=Number(node.dataset.stage);if(!node.disabled)renderStage(i)}));
  renderStage(Math.min(state.active||0,Math.max(0,state.done.length)));
})();
