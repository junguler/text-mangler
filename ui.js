//UI
const $=s=>document.querySelector(s),TABS=[['size','Shrink / Enlarge','--orange'],['tone','Tone','--teal'],['tadd','Typos','--pink'],['pers','Personality','--violet'],['tools','Tools','--blue']];
const S={
 size:["The old lighthouse at the edge of the harbor had been abandoned for nearly twenty years, but the villagers still talked about it every evening. They said that on foggy nights the lamp would flicker back to life, although nobody had actually seen anyone climb the stairs. Last spring, a young engineer decided to investigate the mystery, and she spent a whole week inside the tower with nothing but a flashlight and a notebook. In the end, she discovered that a loose cable was swinging in the wind and touching an old battery.",
  "Making a good cup of coffee is really not as difficult as most people think, but it does require a little bit of patience. First, you should always use fresh beans and grind them just before brewing, because the flavor fades very quickly. Next, the water should be hot but not boiling, since boiling water can make the coffee taste bitter. Finally, be sure to pour slowly and enjoy the wonderful smell that fills the kitchen.",
  "I wanted to give everyone a quick update on where the project stands at this point in time. The design team has finished the first round of mockups, and the developers have already started building the main features. We are a little bit behind schedule because the testing environment was broken for several days, but we expect to catch up by the end of the month. Please let me know if you have any questions or concerns.",
  "We arrived in the city late on Friday night, and it was raining so heavily that we could barely see the road. The hotel was actually quite small, but the staff were very friendly and they gave us a warm meal and a clean room. On Saturday morning, the clouds finally cleared, and we spent the whole day walking through the old market and visiting the museum near the river.",
  "Honey is one of the very few foods that basically never spoils. Archaeologists have found pots of honey in ancient tombs that were still perfectly edible after thousands of years. The secret is that honey contains almost no water, and it is also quite acidic, which makes it extremely difficult for bacteria to grow."],
 tadd:["Please remember to send the final report before Friday afternoon. The client has asked for a detailed summary of the budget, the timeline, and the main risks. I will review everything tomorrow morning and share my comments with the whole team.",
  "Our neighbors adopted a small puppy last weekend, and now the whole street is awake at six every morning. The dog loves chasing leaves, stealing socks, and barking at the mailman. Honestly, nobody can stay angry at him for very long.",
  "The train to the coast leaves at nine, so we should arrive at the station by half past eight. Bring a jacket because the wind near the water is surprisingly cold, even in summer. We can have lunch at the little fish restaurant by the pier.",
  "Learning a new language takes time, but practicing a little every day makes a huge difference. Listen to music, read short stories, and try to speak with native speakers whenever you can."],
 tfix:["i recieved your mesage yestarday and i definately plan to atend the meeting tommorow. Their is a agenda on the board, so please let me know if ther is anything els i should prepare befor then.",
  "Teh weather was beutiful this morning, so we decded to take a long walk thorugh the park. Your going to love it, and its a great way to start the day. Evrybody seemed happy, and the childern were playng near the fontain.",
  "She dont like to wake up early, but she go to work every day anyway. I would of called you, but my phone was dead. We was tired after the the long trip, so we went home and had a early night.",
  "Our compnay is launching a new prodcut next month, and we beleive it will realy change the way peple work. The team has been workng hard to finsh everyting on time. It was an great effort, and its effect on the customers will be big.",
  "Can you please sned me the adress of the restaraunt? I dont want to be late agian, and I cant find it on the mapp. I have never went there befor, so thankyou for helping me out."],
 pers:["Hello my friend, I am very happy to see you today. The weather is great, and I think we should go for a walk by the sea. After that, we can eat some food and talk about our plans.",
  "Yesterday I went to the market because I needed some bread and a little money for the bus. The man at the shop was really nice, and he told me that the best food in town is at the old house on the hill.",
  "My dog is really big, and he loves to drink water from the lake. Every morning my mother says that he is a very good boy, but he never listens to anyone.",
  "Wow, this is a very good idea! You are right that we need a better plan, and I will tell the boss about it tomorrow. Please do not forget to buy the car insurance."]
};
S.tclean=["i think  the the meeting is at noon ,but i'm not sure.we should check with the team  before we leave.  maybe i can call them tomorrow","hello everyone ,thanks for coming.please remember to bring your laptop  and your your notes. the schedule is on the board ,and i will send the slides later","we went to the park yesterday.it was sunny and and warm ,so we stayed for hours.  i had a great time"];
const NOTE={size:'Cuts or pads the text by this % of its length. Enlarging only pads the wording; it adds no new facts.',tadd:'% of the words that get a typo. Changed words are highlighted.',tfix:'Fixes misspelled words with the built-in dictionary, plus common grammar slips in American English: their/there, your/you\'re, its/it\'s, would of, a/an, verb agreement, repeated words, capitals and spacing. Names, ALL-CAPS words, URLs and numbers are left alone. Changes are highlighted.',pers:'Rewrites the text in a voice. Lower strength gives a lighter touch.',tclean:'Fixes spacing, repeated words, a lowercase "i" and missing capitals. It does not touch spelling.',tools:'One-click text transforms. Use Reroll to change the Zalgo effect.',tone_formal:'Expands contractions and slang and swaps plain words for formal ones.',tone_casual:'Adds contractions, slang and chat shortcuts.',tone_simple:'Swaps fancy words for plain ones and splits long sentences.'};
let tab='size',dir=-1,tmode='add',nmode='formal',plain='',timer,last='',dfail=false;
const isSample=v=>!v.trim()||Object.values(S).some(a=>a.includes(v));
const pickS=()=>last=pick(S[tab==='tadd'&&tmode!=='add'?(tmode==='fix'?'tfix':'tclean'):tab==='tone'?'size':tab==='tools'?'pers':tab].filter(x=>x!==last),Math.random);
const sv=(k,v)=>{try{localStorage.setItem('tm_'+k,v)}catch(e){}},lv=k=>{try{return localStorage.getItem('tm_'+k)}catch(e){return null}};
TABS.forEach(([id,n,c])=>{const b=document.createElement('button');b.type='button';b.id='tab-'+id;b.setAttribute('aria-controls','panel-'+id);b.setAttribute('role','tab');b.setAttribute('aria-selected','false');b.textContent=n;b.dataset.id=id;b.style.setProperty('--b',`var(${c})`);b.onclick=()=>setTab(id);$('#tabs').append(b)});
$('#pk').innerHTML=Object.keys(PS).sort((a,b)=>PN[a].localeCompare(PN[b])).map(k=>`<option value="${k}">${PN[k]}</option>`).join('');
$('#pk').value=pick(Object.keys(PS),Math.random);
const applyColor=()=>{const c=tab==='tadd'&&tmode!=='add'?(tmode==='fix'?'--green':'--teal'):TABS.find(x=>x[0]===tab)[2];document.documentElement.style.setProperty('--c',`var(${c})`)};
const SLT=()=>tab==='tadd'&&tmode!=='add'?null:SL[tab];
function fill(el){const lo=+el.min||0,v=(el.value-lo)/((+el.max-lo)||1)*100;el.style.background=`linear-gradient(90deg,var(--c) ${v}%,var(--ink) ${v}%)`;el.style.border='4px solid var(--line)'}
function setTab(id){if(!TABS.some(x=>x[0]===id))id='size';tab=id;document.body.dataset.tab=id;applyColor();
 document.querySelectorAll('.tabs button').forEach(b=>{const on=b.dataset.id===id;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});
 document.querySelectorAll('.ctl').forEach(d=>d.classList.toggle('on',d.dataset.t==id));sv('tab',id);if(isSample($('#in').value))$('#in').value=pickS();run()}
$('#tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...$('#tabs').querySelectorAll('[role=tab]')];let i=buttons.indexOf(document.activeElement);if(e.key==='Home')i=0;else if(e.key==='End')i=buttons.length-1;else i=(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;setTab(buttons[i].dataset.id);buttons[i].focus()});
function go(){sv('text',$('#in').value);clearTimeout(timer);timer=setTimeout(run,120)}
const SL={size:'z',tone:'tn',tadd:'ty',pers:'ps'},pct={z:40,tn:70,ty:25,ps:70},LVL={z:[0],tn:[0],ty:[0],ps:[0]};
const txt=v=>{const t=$('#in').value,r=mk($('#seed').value),q=$('#pq').checked;const x=tab=='size'?size(t,dir*v,r,q):tab=='tadd'?typoAdd(t,v,r,q):tab=='tone'?tone(t,v,nmode,r,q):pers(t,$('#pk').value,v,r,q);return x.segs.map(s=>s[0]).join('')};
function recalc(){const id=SLT();if(!id)return;const e=$('#'+id),t=$('#in').value,n=wc(t),st=n>=100?1:n>=50?2:n>=20?5:10,L=[];let prev=null;const t0=performance.now();
 for(let v=0;v<=100;v+=st){if(t.length>20000||performance.now()-t0>400){L.push(v);continue}const s=txt(v);if(v==0||s!==prev){L.push(v);prev=s}}
 if(L[L.length-1]!==100)L.push(100);LVL[id]=L;let k=0;L.forEach((v,i)=>{if(Math.abs(v-pct[id])<Math.abs(L[k]-pct[id]))k=i});e.min=0;e.max=L.length-1;e.step=1;e.value=k}
function run(keep){
 if(!keep)recalc();
 const t=$('#in').value,r=mk($('#seed').value),q=$('#pq').checked,id=SLT();let res,info='',v=0;
 if(id){const e=$('#'+id);v=LVL[id][e.value];fill(e);$('#'+id+'v').textContent=v+'%'}
 $('#trow').style.display=tab==='tadd'&&tmode!=='add'?'none':'';
 $('#frow').style.display=tab==='tadd'&&tmode==='fix'?'':'none';
 document.querySelectorAll('.note').forEach(e=>{let k=e.parentElement.dataset.t;if(!k)return;if(k=='tadd'&&tmode!='add')k=tmode=='fix'?'tfix':'tclean';if(k=='tone')k='tone_'+nmode;if(k=='tfix'&&dfail)return;e.textContent=(NOTE[k]||'')+(['tfix','tclean','tools'].includes(k)?'':' Scroll the mouse wheel over the slider to adjust. Percentages that would not change the result are skipped, and the step size adapts to the text length.')});
 if(typeof aiBusy=='function'&&aiBusy()){aiSync();return}
 if(tab=='size'){const z=dir*v;res=size(t,z,r,q);if(z)info=` | asked ${z>0?'+':''}${z}%, got ${res.ach>0?'+':''}${res.ach}%${res.used&&res.used.length?` | used: ${res.used.join(', ')}`:''}`}
 else if(tab=='tadd'){if(tmode=='clean'){res=cleanup(t,q);info=` | ${res.n} fixes`}else if(tmode=='fix'){res=typoFix(t,q);info=res.wait?' | dictionary loading...':` | ${res.n} fixes`}else{res=typoAdd(t,v,r,q);info=` | ${res.n} typos added`}}
 else if(tab=='tone'){res=tone(t,v,nmode,r,q);info=` | ${nmode}`}else if(tab=='tools'){res=useTool($('#tk').value,t,r,q)}else res=pers(t,$('#pk').value,v,r,q);
 if(pipeOn&&PIPE.length){res={segs:[[runPipe(t,q),0]]};info=` | pipeline: ${PIPE.length} step${PIPE.length>1?'s':''}`}
 plain=res.segs.map(s=>s[0]).join('');
 const ov=typeof aiOverlay=='function'?aiOverlay(t):null;
 if(ov){plain=ov.text;res={segs:[[plain,0]]};info=ov.info}
 $('#out').innerHTML=renderOut(res,t);
 $('#stat').textContent=`${cc(t)} -> ${cc(plain)} chars | ${wc(t)} -> ${wc(plain)} words${info}${readInfo(plain)}`;
 if(typeof aiSync=='function')aiSync();
}
['#in','#pk','#seed','#pq'].forEach(s=>{$(s).addEventListener('input',go);$(s).addEventListener('change',go)});
['z','tn','ty','ps'].forEach(id=>{const e=$('#'+id),set=()=>{pct[id]=LVL[id][e.value];run(1)};e.addEventListener('input',set);
 e.parentElement.addEventListener('wheel',ev=>{ev.preventDefault();e.value=Math.max(0,Math.min(+e.max,+e.value-Math.sign(ev.deltaY)));set()},{passive:false})});
document.querySelectorAll('#seg button').forEach(b=>b.onclick=()=>{dir=+b.dataset.d;document.querySelectorAll('#seg button').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});run()});
const syncT=()=>document.querySelectorAll('#tseg button').forEach(x=>{const on=x.dataset.m===tmode;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});
document.querySelectorAll('#tseg button').forEach(b=>b.onclick=()=>{tmode=b.dataset.m;sv('tmode',tmode);syncT();applyColor();if(isSample($('#in').value))$('#in').value=pickS();run()});
const HIST=[],pushH=()=>{const v=$('#in').value;if(HIST[HIST.length-1]!==v){HIST.push(v);if(HIST.length>50)HIST.shift()}};
const setIn=v=>{pushH();$('#in').value=v;sv('text',v);run()};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.altKey&&!e.shiftKey&&(e.key||'').toLowerCase()==='z'&&HIST.length){e.preventDefault();const v=HIST.pop();$('#in').value=v;sv('text',v);run()}});
$('#rr').onclick=()=>{$('#seed').value=Math.random().toString(36).slice(2,7);go()};
$('#sm').onclick=()=>setIn(pickS());
$('#up').onclick=()=>setIn(plain);
$('#cl').onclick=()=>setIn('');
$('#cp').onclick=async()=>{let copied=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(plain);copied=true}}catch(e){}if(!copied){const a=document.createElement('textarea');a.value=plain;a.setAttribute('aria-hidden','true');a.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(a);a.select();try{copied=document.execCommand('copy')}catch(e){}a.remove()}$('#cp').textContent=copied?'Copied!':'Copy failed';setTimeout(()=>$('#cp').textContent='Copy',1400)};
{const opt=k=>`<option value="${k}">${TOOLS[k][0]}</option>`,seen=new Set(Object.values(TG).flat()),rest=Object.keys(TOOLS).filter(k=>!seen.has(k));
 $('#tk').innerHTML=Object.entries(TG).map(([g,ks])=>`<optgroup label="${g}">${ks.filter(k=>TOOLS[k]).map(opt).join('')}</optgroup>`).join('')+(rest.length?`<optgroup label="Other">${rest.map(opt).join('')}</optgroup>`:'')}
function renderOut(res,t){if($('#df').checked){const d=diffMarks(t,plain);if(d){let wi=0;return plain.split(/(\s+)/).map(p=>!p?'':/^\s+$/.test(p)?esc(p):(d.keep.has(wi++)?esc(p):`<mark>${esc(p)}</mark>`)).join('')}}return res.segs.map(([s,m])=>m?`<mark>${esc(s)}</mark>`:esc(s)).join('')}
let PIPE=[],pipeOn=false;
try{PIPE=JSON.parse(lv('pipe')||'[]')}catch(e){PIPE=[]}
const stepName=s=>({size:`${s.dir<0?'Shrink':'Enlarge'} ${s.v}%`,typo:s.m==='add'?`Typos ${s.v}%`:s.m==='fix'?'Fix typos':'Clean up',tone:`${s.m} ${s.v}%`,pers:`${PN[s.k]||s.k} ${s.v}%`,tools:TOOLS[s.k]?TOOLS[s.k][0]:s.k})[s.t];
function drawChips(){$('#chips').innerHTML=PIPE.length?PIPE.map((s,i)=>`<span class="chip" data-i="${i}" title="Click to remove">${i+1}. ${esc(stepName(s))} &times;</span>`).join(''):'<span class="note">No steps yet. Set up a tab, then press Add step.</span>';$('#pr').textContent='Pipeline: '+(pipeOn?'ON':'OFF');sv('pipe',JSON.stringify(PIPE))}
const curStep=()=>{const id=SLT(),v=id?LVL[id][$('#'+id).value]:0;return tab=='size'?{t:'size',dir,v}:tab=='tadd'?{t:'typo',m:tmode,v}:tab=='tone'?{t:'tone',m:nmode,v}:tab=='pers'?{t:'pers',k:$('#pk').value,v}:{t:'tools',k:$('#tk').value}};
function applyStep(s,t,r,q){const x=s.t=='size'?size(t,s.dir*s.v,r,q):s.t=='typo'?(s.m=='add'?typoAdd(t,s.v,r,q):s.m=='fix'?typoFix(t,q):cleanup(t,q)):s.t=='tone'?tone(t,s.v,s.m,r,q):s.t=='pers'&&PS[s.k]?pers(t,s.k,s.v,r,q):useTool(s.k,t,r,q);return x.segs.map(a=>a[0]).join('')}
const runPipe=(t,q)=>PIPE.reduce((a,s,i)=>applyStep(s,a,mk($('#seed').value+i),q),t);
const PRE={'Phone message':[{t:'size',dir:-1,v:35},{t:'tone',m:'casual',v:60},{t:'typo',m:'add',v:15}],'Pirate memo':[{t:'tone',m:'formal',v:80},{t:'pers',k:'pirate',v:80}],'Mess it up':[{t:'tone',m:'casual',v:70},{t:'typo',m:'add',v:30},{t:'pers',k:'drunk',v:60}],'Clean and simple':[{t:'typo',m:'clean',v:0},{t:'tone',m:'simple',v:80},{t:'size',dir:-1,v:20}]};
$('#pp').innerHTML='<option value="">Presets...</option>'+Object.keys(PRE).map(k=>`<option>${k}</option>`).join('');
$('#chips').onclick=e=>{const c=e.target.closest('.chip');if(c){PIPE.splice(+c.dataset.i,1);drawChips();run(1)}};
$('#pa').onclick=()=>{const s=curStep();if(!s)return;PIPE.push(s);drawChips();run(1)};
$('#pc').onclick=()=>{PIPE=[];pipeOn=false;drawChips();run(1)};
$('#pr').onclick=()=>{pipeOn=!pipeOn;drawChips();run(1)};
$('#pp').onchange=e=>{const p=PRE[e.target.value];if(p){PIPE=p.map(s=>({...s}));pipeOn=true;drawChips();run(1)}e.target.value=''};
['#df','#tk'].forEach(s=>$(s).addEventListener('change',go));
{if(lv('fg')==='0'){FIXOPT.gram=false;$('#fg').checked=false}if(lv('fu')==='0'){FIXOPT.us=false;$('#fu').checked=false}
 $('#fg').addEventListener('change',()=>{FIXOPT.gram=$('#fg').checked;sv('fg',FIXOPT.gram?'1':'0');run()});
 $('#fu').addEventListener('change',()=>{FIXOPT.us=$('#fu').checked;sv('fu',FIXOPT.us?'1':'0');run()})}
document.querySelectorAll('#nseg button').forEach(b=>b.onclick=()=>{nmode=b.dataset.m;document.querySelectorAll('#nseg button').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});run()});
const MAXLOAD=2*1024*1024,TEXTRE=/\.(txt|md|csv|log|srt|json|html?)$/i;const loadText=f=>{if(!f)return;if(f.size>MAXLOAD){$('#stat').textContent='File too large (max 2 MB): '+f.name;return}if(f.type&&!f.type.startsWith('text/')&&!TEXTRE.test(f.name)){$('#stat').textContent='Not a text file: '+f.name;return}f.text().then(v=>setIn(v));$('#fl').value=''};
$('#ld').onclick=()=>$('#fl').click();$('#fl').onchange=e=>loadText(e.target.files[0]);
$('#in').addEventListener('dragover',e=>e.preventDefault());
$('#in').addEventListener('drop',e=>{const f=e.dataTransfer&&e.dataTransfer.files[0];if(f){e.preventDefault();loadText(f)}});
$('#dl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([plain],{type:'text/plain'}));a.download='mangled.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
drawChips();
tmode=['fix','clean'].includes(lv('tmode'))?lv('tmode'):'add';let initialTab=lv('tab')||'size';if(initialTab==='tfix'){initialTab='tadd';tmode='fix'}tab=TABS.some(x=>x[0]===initialTab)?initialTab:'size';
const draft=lv('text');if(draft&&draft.trim())$('#in').value=draft;
if(!$('#in').value.trim())$('#in').value=pickS();setTab(tab);syncT();
loadDict().then(go).catch(()=>{dfail=true;$('#dnote').textContent='Dictionary failed to load (this browser lacks DecompressionStream). Fix typos is unavailable.'});
