var K='agenda-escolar-v1',items=[],tab='home',filt='p',view=new Date(),type='tarefa';
try{items=JSON.parse(localStorage.getItem(K)||'[]')}catch(e){items=[]}
function save(){try{localStorage.setItem(K,JSON.stringify(items))}catch(e){}}
function $(s){return document.querySelector(s)}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
var today=iso(new Date()),sel=today;
function plus(n){var d=new Date();d.setDate(d.getDate()+n);return iso(d)}
function diff(s){return Math.round((new Date(s+'T00:00')-new Date(today+'T00:00'))/864e5)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var COL={tarefa:'var(--tarefa)',prova:'var(--prova)',prazo:'var(--prazo)'},IC={tarefa:'📝',prova:'📖',prazo:'📤'};
function when(d){return d<0?'Atrasada há '+(-d)+(d==-1?' dia':' dias'):d==0?'É hoje!':d==1?'Amanhã':'Em '+d+' dias'}
function fmt(s){var p=s.split('-');return p[2]+'/'+p[1]}
function byDate(a,b){return a.date<b.date?-1:a.date>b.date?1:0}
function row(i){var d=diff(i.date),w=i.done?'Concluída':when(d),c=i.done?'':d<0?'late':d<=1?'soon':'';
 return '<div class="row '+(i.done?'done':'')+'"><input class="ck" type="checkbox" data-c="'+i.id+'" '+(i.done?'checked':'')+' aria-label="Concluir"><span class="bar" style="background:'+COL[i.type]+'"></span><div class="m"><div class="n">'+IC[i.type]+' '+esc(i.t)+'</div><div class="s">'+(i.subj?esc(i.subj)+' · ':'')+fmt(i.date)+' · <span class="'+c+'">'+w+'</span></div></div><button class="x" data-x="'+i.id+'" type="button" aria-label="Apagar">🗑️</button></div>'}
function rows(l,msg){return l.length?l.map(row).join(''):'<div class="em">'+msg+'</div>'}
function render(){
 var h=new Date().getHours();$('#gr').textContent=(h<12?'Bom dia':h<18?'Boa tarde':'Boa noite')+'! 👋';
 $('#dt0').textContent=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
 var pend=items.filter(function(i){return !i.done}),late=pend.filter(function(i){return diff(i.date)<0});
 $('#s1').textContent=pend.length;$('#s2').textContent=late.length;
 $('#s3').textContent=(items.length?Math.round((items.length-pend.length)/items.length*100):0)+'%';
 var att=pend.filter(function(i){return diff(i.date)<=i.rem}).sort(byDate);
 $('#rems').innerHTML=rows(att,'Tudo em dia por aqui! 🎉');
 $('#week').innerHTML=rows(pend.filter(function(i){var d=diff(i.date);return d>=0&&d<=7}).sort(byDate),'Nada marcado para os próximos 7 dias. Toque em “Adicionar”.');
 var l=items.slice().sort(byDate);if(filt=='p')l=l.filter(function(i){return !i.done});if(filt=='d')l=l.filter(function(i){return i.done});
 $('#all').innerHTML=rows(l,filt=='d'?'Nenhuma tarefa concluída ainda.':'Nenhuma tarefa. Toque em “Adicionar” para começar.');
 cal();
 ['home','cal','list','about'].forEach(function(t){$('#v-'+t).hidden=t!=tab});
 document.querySelectorAll('#tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.t==tab)});
 document.querySelectorAll('#fl button').forEach(function(b){b.classList.toggle('on',b.dataset.f==filt)});
}
function cal(){
 var y=view.getFullYear(),m=view.getMonth(),start=new Date(y,m,1-new Date(y,m,1).getDay());
 $('#mt').textContent=new Date(y,m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 var h=['D','S','T','Q','Q','S','S'].map(function(x){return '<div class="d">'+x+'</div>'}).join('');
 for(var k=0;k<42;k++){var d=new Date(start);d.setDate(start.getDate()+k);var s=iso(d),ty=[];
  items.forEach(function(i){if(i.date==s&&!i.done&&ty.indexOf(i.type)<0)ty.push(i.type)});
  h+='<button type="button" data-d="'+s+'" class="'+(s==today?'t ':'')+(s==sel?'sel ':'')+(d.getMonth()!=m?'o':'')+'">'+d.getDate()+'<span class="dots">'+ty.map(function(t){return '<i style="background:'+(s==sel?'#fff':COL[t])+'"></i>'}).join('')+'</span></button>'}
 $('#cal').innerHTML=h;
 $('#dh').textContent=new Date(sel+'T00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
 $('#day').innerHTML=rows(items.filter(function(i){return i.date==sel}).sort(byDate),'Nada neste dia. Aproveite para descansar! 😌');
}
function openM(){$('#t').value='';$('#sb').value='';$('#dt').value=tab=='cal'?sel:today;$('#ov').classList.add('on');setTimeout(function(){$('#t').focus()},50)}
function closeM(){$('#ov').classList.remove('on')}
$('#fab').onclick=openM;$('#cx').onclick=closeM;
$('#ov').onclick=function(e){if(e.target==this)closeM()};
$('#ty').onclick=function(e){var b=e.target.closest('button');if(!b)return;type=b.dataset.v;this.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x==b)})};
$('#qk').onclick=function(e){var b=e.target.closest('button');if(b)$('#dt').value=plus(+b.dataset.d)};
$('#sv').onclick=function(){
 var t=$('#t').value.trim(),d=$('#dt').value;
 if(!t){$('#t').focus();return}if(!d){$('#dt').focus();return}
 items.push({id:Date.now(),t:t,type:type,subj:$('#sb').value.trim(),date:d,rem:+$('#rm').value,done:false});
 sel=d;save();closeM();render()};
$('#tabs').onclick=function(e){var b=e.target.closest('button');if(b){tab=b.dataset.t;render()}};
$('#fl').onclick=function(e){var b=e.target.closest('button');if(b){filt=b.dataset.f;render()}};
$('#cal').onclick=function(e){var b=e.target.closest('button');if(b){sel=b.dataset.d;cal()}};
$('#pv').onclick=function(){view.setMonth(view.getMonth()-1);cal()};
$('#nx').onclick=function(){view.setMonth(view.getMonth()+1);cal()};
document.querySelector('.w').onclick=function(e){
 var c=e.target.dataset.c,x=e.target.dataset.x;
 if(c){items.forEach(function(i){if(i.id==c)i.done=e.target.checked});save();render()}
 if(x){items=items.filter(function(i){return i.id!=x});save();render()}};
function theme(d){document.documentElement.setAttribute('data-theme',d?'dark':'light');$('#tg').textContent=d?'☀️':'🌙';$('#tg').setAttribute('aria-label',d?'Ativar modo claro':'Ativar modo escuro')}
var dark=false;try{dark=localStorage.getItem('cronos-tema')=='dark'}catch(e){}
theme(dark);
$('#tg').onclick=function(){dark=!dark;theme(dark);try{localStorage.setItem('cronos-tema',dark?'dark':'light')}catch(e){}};
$('#notif').onclick=function(){try{Notification.requestPermission().then(function(p){$('#notif').textContent=p=='granted'?'✓ Notificações ativadas':'Notificações bloqueadas';try{var r=items.filter(function(i){return !i.done&&diff(i.date)<=i.rem});if(p=='granted'&&r.length)new Notification('Cronos',{body:r.length+' lembrete(s): '+r[0].t})}catch(e){}})}catch(e){$('#notif').textContent='Seu navegador não tem suporte'}};
render();
