/* ---- AI: local LLM via WebAssembly (wllama / llama.cpp). Runs on demand only. ----
   The engine is fetched the first time you load a model, never at page open. Two sources:
   Bundled = wllama.js + wllama.wasm from this folder (wllama-wasm.js is the embedded fallback for file://),
   CDN = the same two pieces from jsDelivr at a pinned wllama version. Change ENGINE.ver to bump the default.
   State lives in one object (AI); the AI bar under the controls is drawn from it.
   What the AI is asked to do per tab lives in aitasks.js. */
const ENGINE={ver:'4.0.0',
 cdnJs:v=>'https://cdn.jsdelivr.net/npm/@wllama/wllama@'+v+'/esm/index.min.js',
 cdnWasm:v=>'https://cdn.jsdelivr.net/npm/@wllama/wllama@'+v+'/esm/wasm/wllama.wasm',
 localWasm:'wllama.wasm'};
let aiImport=u=>import(u);
const AISYS='You are a text transformation engine. Follow the user instruction exactly. Output ONLY the transformed text itself, with no explanation, no preamble and no quotation marks around it.';
const AI={on:false,view:'local',cache:new Map(),tempKey:'',wl:null,info:null,meta:null,file:null,name:'',busy:false,abort:null,state:'idle',mod:null,mods:{},key:'',wasmUrl:'',wasmBlob:'',engDesc:'',ver:'',backend:'',threads:1,last:null,tick:0,t0:0,loadSecs:0};


const aiMsg=e=>(e&&e.message)||String(e);
const aiReady=()=>!!(AI.wl&&AI.wl.isModelLoaded());
const aiMB=n=>(n/1048576).toFixed(n<10485760?1:0)+' MB';
const aiPaint=()=>new Promise(r=>setTimeout(r,30));
function aiLog(m){const el=$('#ailog');const l=(el.textContent?el.textContent.split('\n'):[]);l.push('['+new Date().toTimeString().slice(0,8)+'] '+m);el.textContent=l.slice(-200).join('\n');el.scrollTop=el.scrollHeight}
function aiClock(on,label){clearInterval(AI.tick);const el=$('#aitime');if(on){AI.t0=performance.now();el.textContent='0.0 s';AI.tick=setInterval(()=>{el.textContent=((performance.now()-AI.t0)/1000).toFixed(1)+' s'},200)}else el.textContent=label||''}
const aiSecs=()=>(performance.now()-AI.t0)/1000;

/* one place that draws the status card: badge, title, step chips, message */
function aiSet(state,o={}){
 AI.state=state;$('#aicard').dataset.state=state;
 $('#aibadge').textContent={idle:'Not loaded',loading:'Loading',ready:'Ready',busy:'Generating',error:'Error'}[state];
 if(o.title!=null)$('#aititle').textContent=o.title;
 if(o.msg!=null)$('#aimsg').textContent=o.msg;
 if(o.st)[...$('#aisteps').children].forEach((li,i)=>{li.className=o.st[i];if(o.st[i]==='current')li.setAttribute('aria-current','step');else li.removeAttribute('aria-current')});
}
const aiIdleSt=()=>[AI.mod?'done':'pending','pending','pending'];
function aiButtons(){const b=AI.busy,r=aiReady();
 $('#aiload').disabled=b;$('#aieng').disabled=b;$('#aiengv').disabled=b;$('#aireload').disabled=b||!AI.file;$('#aiunload').disabled=b||!r;$('#aitemp').disabled=b;$('#aiextra').disabled=b;$('#aistop').disabled=!(b&&AI.state==='busy');
 $('#aireload').title=AI.file?'Load '+AI.file.name+' again with the current Context and WebGPU settings':'Nothing to reload yet';aiSync()}
const aiThreadWhy=()=>window.crossOriginIsolated?'':location.protocol==='file:'
 ?'the page was opened from a file, where browsers disable threads. Host the folder on http(s) (GitHub Pages works) for roughly 3-5x speed'
 :'cross-origin isolation is not active yet (the helper service worker is still starting or is blocked). Reload the page once';
function aiKV(){
 const r=aiReady(),rows=[];
 const sel=aiEngSel();
 rows.push(['Engine',AI.ver?'llama.cpp '+AI.ver+'. '+AI.engDesc:'not loaded yet. Source: '+(sel.src==='cdn'?'CDN, jsDelivr, wllama '+sel.ver:'bundled files')+'. It starts when you pick a model (about 11 MB, once per page visit)']);
 if(r){
  const m=AI.meta||{},q=(AI.name.match(/(?:^|[-_.])(I?Q\d(?:_[A-Z0-9]+)*|F16|BF16|F32)(?=[-_.]|$)/i)||[])[1];
  rows.push(['Model',(m['general.name']||AI.name)+' ('+aiMB(AI.file.size)+(q?', '+q.toUpperCase():'')+(m['general.architecture']?', '+m['general.architecture']:'')+')']);
  rows.push(['Context',AI.info.n_ctx+' tokens (prompt plus answer must fit)']);
  rows.push(['Memory','about '+Math.round(AI.file.size/1048576+300)+' MB (model plus roughly 300 MB working memory)']);
  rows.push(['Backend',AI.backend]);
  rows.push(['Chat template',AI.info.has_chat?'found, chat mode':'none, using raw completion (base model)']);
  rows.push(['Threads',AI.threads>1?AI.threads+' threads':'1 thread'+(aiThreadWhy()?': '+aiThreadWhy():'')]);
  rows.push(['Loaded in',AI.loadSecs.toFixed(1)+' s']);
 }else rows.push(['Threads',window.crossOriginIsolated?'multi-threaded inference available':'single thread: '+aiThreadWhy()]);
 $('#aikv').innerHTML=rows.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
}

/* ---- engine: loaded lazily, once per page visit (again if you switch source or version) ---- */
const aiScript=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error(src+' not found. Keep all files together in one folder.'));document.head.appendChild(s)});
const aiEngSel=()=>{const src=$('#aieng').value==='cdn'?'cdn':'local',ver=$('#aiengv').value.trim()||ENGINE.ver;return{src,ver,key:src==='cdn'?'cdn@'+ver:'local'}};
async function aiEngine(sel){
 if(AI.mod&&AI.key===sel.key)return;
 if(AI.wl){aiLog('Engine source changed: releasing the loaded model');try{await AI.wl.exit()}catch(_e){}AI.wl=null;AI.info=null;AI.meta=null}
 if(AI.wasmBlob){URL.revokeObjectURL(AI.wasmBlob);AI.wasmBlob=''}
 AI.mod=null;AI.key='';AI.wasmUrl='';
 const t=performance.now(),lap=()=>((performance.now()-t)/1000).toFixed(1)+' s';
 if(sel.src==='cdn'){
  if(!/^\d+\.\d+\.\d+[\w.-]*$/.test(sel.ver))throw new Error('"'+sel.ver+'" is not a valid wllama version (example: '+ENGINE.ver+')');
  if(!AI.mods[sel.key]){
   aiLog('Engine: importing wllama '+sel.ver+' from cdn.jsdelivr.net (JavaScript glue, about 120 KB)');
   try{AI.mods[sel.key]=await aiImport(ENGINE.cdnJs(sel.ver))}
   catch(e){throw new Error('Could not load the engine from cdn.jsdelivr.net: offline, blocked, or wllama '+sel.ver+' does not exist. Set Engine to Bundled to work without internet. ('+aiMsg(e)+')')}
  }
  AI.mod=AI.mods[sel.key];AI.wasmUrl=ENGINE.cdnWasm(sel.ver);AI.engDesc='From CDN (jsDelivr), wllama '+sel.ver;
  aiLog('Engine: the runtime (about 11 MB) is fetched from the CDN while the model loads; the browser caches it afterwards');
 }else{
  if(!AI.mods.local){
   if(typeof wllamaMod==='undefined'){aiLog('Engine: loading wllama.js (JavaScript glue, 123 KB)');await aiScript('wllama.js')}
   AI.mods.local=wllamaMod;
  }
  AI.mod=AI.mods.local;
  let url='';
  if(location.protocol==='http:'||location.protocol==='https:'){
   try{const r=await fetch(ENGINE.localWasm,{method:'HEAD'});if(r.ok)url=new URL(ENGINE.localWasm,location.href).href}catch(_e){}
   if(!url)aiLog(ENGINE.localWasm+' not found next to the page, using the embedded copy instead');
  }
  if(url){AI.wasmUrl=url;AI.engDesc='Bundled, '+ENGINE.localWasm+' (10.8 MB file)';aiLog('Engine: using '+url+' ('+lap()+')')}
  else{
   if(typeof WLLAMA_WASM_B64==='undefined'){aiLog('Engine: loading wllama-wasm.js (embedded WebAssembly runtime, about 14 MB)');await aiScript('wllama-wasm.js')}
   aiLog('Engine: decoding the embedded WebAssembly runtime ('+lap()+')');await aiPaint();
   const bin=atob(WLLAMA_WASM_B64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
   AI.wasmBlob=URL.createObjectURL(new Blob([u],{type:'application/wasm'}));AI.wasmUrl=AI.wasmBlob;
   AI.engDesc='Bundled, embedded copy (needed when the page is opened from a file)';
  }
 }
 AI.ver=(AI.mod.Wllama.getLibllamaVersion&&AI.mod.Wllama.getLibllamaVersion())||'unknown version';
 AI.key=sel.key;aiLog('Engine ready: llama.cpp '+AI.ver+' ('+lap()+')');
}
const aiNew=()=>new AI.mod.Wllama({default:AI.wasmUrl},{suppressNativeLog:true});
function aiExplain(e,file){
 const m=aiMsg(e);
 if(/not found\. Keep/.test(m))return m;
 if(/memory|alloc|oom/i.test(m))return 'Out of memory while loading '+file.name+' ('+aiMB(file.size)+'). Close other tabs, try a smaller model or a Q4_K_M quant, or lower Context. ('+m+')';
 if(/architecture|unknown model|unsupported|not supported/i.test(m))return 'This engine (llama.cpp '+(AI.ver||'?')+') does not support this model architecture, so a newer engine build is needed. Set Engine to CDN and enter a newer wllama version, or replace the bundled files. ('+m+')';
 if(/gguf|magic|invalid|corrupt|header/i.test(m))return file.name+' does not look like a complete .gguf file. Try downloading it again. ('+m+')';
 return m+'. The Activity log below has the steps that ran.'}

async function aiLoad(file){
 if(AI.busy||!file)return;
 if(!/\.gguf$/i.test(file.name)){aiSet(AI.state==='error'?'idle':AI.state,{msg:'"'+file.name+'" is not a .gguf file. Pick a GGUF model file (see Which model? below).'});aiLog('Rejected '+file.name+': not a .gguf file');return}
 AI.busy=true;AI.file=file;aiButtons();$('#aihint').textContent='';aiDrawer(true);
 const had=aiReady(),sel=aiEngSel(),warm=AI.mod&&AI.key===sel.key;let step=1;
 aiClock(true);aiLog('Load requested: '+file.name+' ('+aiMB(file.size)+')');
 try{
  aiSet('loading',{title:'Loading '+file.name,st:[warm?'done':'current','pending','pending'],msg:warm?'Step 1 of 2: engine already loaded in this tab.':'Step 1 of 2: starting the AI engine ('+(sel.src==='cdn'?'downloading wllama '+sel.ver+' from cdn.jsdelivr.net':'bundled files')+', once per page visit)...'});
  await aiEngine(sel);
  step=2;
  if(AI.wl){aiLog('Releasing the previously loaded model');try{await AI.wl.exit()}catch(_e){}AI.wl=null;AI.info=null}
  aiSet('loading',{st:['done','current','pending'],msg:'Step 2 of 2: '+(sel.src==='cdn'&&!warm?'fetching the runtime from the CDN and reading ':'reading ')+' '+file.name+' ('+aiMB(file.size)+') into memory and building the context. This is the slow part: bigger files take longer and the page may feel busy.'+(file.size>1.5*1073741824?' This file is large and may not fit in browser memory.':'')});
  await aiPaint();
  AI.wl=aiNew();
  const gpu=$('#aigpu').checked,p={n_ctx:+$('#aictx').value,seed:hash($('#seed').value)%2147483647,warmup:false};
  if(!gpu)p.n_gpu_layers=0;
  AI.backend=gpu?(AI.wl.isSupportWebGPU&&AI.wl.isSupportWebGPU()?'WebGPU requested (CPU if the engine cannot use it)':'CPU (WebGPU is not available in this browser)'):'CPU';
  aiLog('Reading model file, context '+p.n_ctx+', backend: '+AI.backend);
  try{await AI.wl.loadModel([file],p)}
  catch(e1){
   if(!gpu)throw e1;
   aiLog('WebGPU load failed ('+aiMsg(e1)+'), retrying on CPU');
   try{await AI.wl.exit()}catch(_e2){}
   AI.wl=aiNew();p.n_gpu_layers=0;AI.backend='CPU (WebGPU load failed, fell back)';await AI.wl.loadModel([file],p);
  }
  AI.info=AI.wl.getLoadedContextInfo();AI.name=file.name;
  try{AI.meta=(AI.wl.getModelMetadata()||{}).meta||{}}catch(_e){AI.meta={}}
  AI.threads=AI.wl.getNumThreads?AI.wl.getNumThreads():1;
  AI.loadSecs=aiSecs();aiClock(false,'loaded in '+AI.loadSecs.toFixed(1)+' s');
  aiLog('Model ready: '+AI.threads+' thread(s), context '+AI.info.n_ctx+', chat template '+(AI.info.has_chat?'found':'missing')+' ('+AI.loadSecs.toFixed(1)+' s total)');
  aiSet('ready',{title:file.name,st:['done','done','done'],msg:'Ready. Type or paste text in Input, pick a task and press Run AI.'+(AI.info.has_chat?'':' This model has no chat template, so it runs in raw completion mode.')});
 }catch(e){
  try{if(AI.wl)await AI.wl.exit()}catch(_e){}
  AI.wl=null;AI.info=null;AI.meta=null;
  const secs=aiSecs();aiClock(false,'failed after '+secs.toFixed(1)+' s');aiLog('FAILED at step '+step+': '+aiMsg(e));
  aiDrawer(true);aiSet('error',{title:'Could not load '+file.name,st:step===1?['fail','pending','pending']:['done','fail','pending'],msg:aiExplain(e,file)+(had?' The model that was loaded before has been unloaded.':'')});
 }
 AI.busy=false;aiButtons();aiKV();
}

async function aiUnload(){
 if(AI.busy||!aiReady())return;
 const name=AI.name,mb=AI.file?Math.round(AI.file.size/1048576+300):0;
 AI.busy=true;aiButtons();aiLog('Unloading '+name);
 try{await AI.wl.exit()}catch(e){aiLog('exit() reported: '+aiMsg(e))}
 AI.wl=null;AI.info=null;AI.meta=null;AI.busy=false;AI.abort=null;
 aiClock(false,'');aiLog('Model unloaded, memory released');
 aiSet('idle',{title:'No model in memory',st:aiIdleSt(),msg:'Unloaded '+name+'. Its memory (about '+mb+' MB) was released. The engine stays loaded in this tab, so loading a model again skips step 1. Your Input and Output text were not touched. Reload brings the same file back.'});
 aiButtons();aiKV();
}

/* ---- running ---- */
function aiClean(s,input){
 let x=s.trim();
 x=x.replace(/^here(?:'s| is)\b[^\n]{0,80}:[ \t]*\n+/i,'');
 const q=/^(["\u201C])([\s\S]*)(["\u201D])$/.exec(x);if(q&&!/^["\u201C]/.test(input.trim()))x=q[2].trim();
 return x}
const aiBusy=()=>AI.busy&&AI.state==='busy';
const aiPipeOn=()=>typeof pipeOn!=='undefined'&&pipeOn&&PIPE.length>0;
function aiSpecNow(){const id=SLT(),v=id?LVL[id][+$('#'+id).value]:0,c={tab,tmode,nmode,dir,v,pk:$('#pk').value,text:$('#in').value},sp=aiSpec(c);sp.c=c;return sp}
const aiKeyOf=sp=>JSON.stringify([sp.id,sp.c.v,sp.c.dir,$('#seed').value,$('#pq').checked,sp.c.text,$('#aitemp').value,$('#aiextra').value.trim(),AI.name]);
/* called by run() in ui.js: returns the AI text to show instead of the local result, or null */
function aiOverlay(){
 if(!AI.on||AI.view!=='ai')return null;
 const sp=aiSpecNow(),e=sp.ok&&!aiPipeOn()&&AI.cache.get(aiKeyOf(sp));
 if(!e){AI.view='local';if(AI.state==='ready'&&!AI.busy)$('#aimsg').textContent='Settings changed, so the local result is shown. Press Run AI for an AI version of this setting.';return null}
 return{text:e.text,info:e.info}}
/* keeps the bar, the Run button, the Local/AI switch and the "what will AI do" line in step with the controls */
function aiSync(){
 $('#aibody').hidden=!AI.on;$('#aistat').hidden=!AI.on;$('#aiview').hidden=!AI.on;
 if(!AI.on)return;
 const sp=aiSpecNow(),r=aiReady(),paused=aiPipeOn();
 if(sp.ok&&sp.tkey!==AI.tempKey&&!AI.busy){AI.tempKey=sp.tkey;$('#aitemp').value=Math.round(sp.temp*20)*5;aiFill()}
 const hit=sp.ok&&!paused&&AI.cache.has(aiKeyOf(sp));
 $('#airun').disabled=AI.busy||!r||!sp.ok||paused||!sp.c.text.trim();
 document.querySelectorAll('#aiview button').forEach(b=>{const isAI=b.dataset.v==='ai',on=(AI.view==='ai')===isAI;b.disabled=isAI&&!hit&&!aiBusy();b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});
 $('#aiapply').textContent=paused?'Paused: the Pipeline is ON. AI works on one setting at a time, so turn the pipeline off to use it.'
  :!sp.ok?'AI here: '+sp.why
  :!r?'AI will '+sp.what+'. Load a model first (Model & settings). The local result stays live meanwhile.'
  :'Run AI will '+sp.what+'.'+(hit?' This exact setting already has an AI result: switch with Local / AI above the Output.':'');
}
async function aiRun(){
 if(AI.busy||!AI.on)return;
 const sp=aiSpecNow();
 if(!sp.ok||aiPipeOn()||!aiReady()){aiSync();return}
 const key=aiKeyOf(sp);
 if(AI.cache.has(key)){AI.view='ai';run(1);return}
 const input=sp.c.text,q=$('#pq').checked;
 if(!input.trim()){aiSet('ready',{msg:'Input is empty. Paste or type some text first.'});return}
 AI.busy=true;AI.abort=new AbortController();const prev=AI.view;
 aiClock(true);aiSet('busy',{st:['done','done','done'],msg:'Preparing: '+sp.what+'...'});aiButtons();
 let base=input;
 if(sp.base==='fix'){const r=typoFix(input,q);if(r.wait)aiLog('Dictionary not loaded yet: sending the raw text');else base=r.segs.map(s=>s[0]).join('')}
 const extra=$('#aiextra').value.trim(),instr=sp.instr+(extra?'\nAlso: '+extra:''),full=instr+'\n\nText:\n'+base,temp=+$('#aitemp').value/100,seed=hash($('#seed').value+sp.id)%2147483647,ctx=AI.info.n_ctx;
 let pt,btok,how='counted';
 try{const a=await AI.wl.tokenize(AISYS+'\n'+full),b=await AI.wl.tokenize(base);if(!Array.isArray(a)||!Array.isArray(b))throw 0;pt=a.length+24;btok=b.length}
 catch(_e){how='estimated';btok=Math.ceil(base.length/3.5);pt=btok+Math.ceil((AISYS.length+instr.length)/3.5)+24}
 const room=ctx-pt-8;let maxTok=Math.ceil(sp.outWords*Math.max(1.2,btok/Math.max(1,wc(base)))*1.3)+40;
 if(pt>ctx-32||room<16){
  AI.busy=false;AI.abort=null;aiClock(false,'');aiLog('Refused: prompt about '+pt+' tokens, context '+ctx);aiButtons();
  aiSet('ready',{msg:'The text is too long for the context: about '+pt+' tokens ('+how+') against a context of '+ctx+'. Shorten the text, or choose a larger Context in Model & settings and press Reload.'});return}
 if(maxTok>room){aiLog('Length limit lowered from '+maxTok+' to '+room+' tokens to fit the context');maxTok=room}
 AI.view='ai';aiSync();$('#out').textContent='';
 aiSet('busy',{msg:'Reading your text (about '+pt+' tokens, '+how+')... the first word can take a few seconds.'});
 aiLog('Run: '+sp.name+', input about '+pt+' tokens, creativity '+temp.toFixed(2)+', limit '+maxTok+' tokens');
 let out='',ntok=0,ttft=0,paint=0;
 const tps=()=>ntok/Math.max(aiSecs(),.01);
 const feed=x=>{out+=x;ntok++;if(ntok===1){ttft=aiSecs();aiLog('First token after '+ttft.toFixed(1)+' s (prompt processing)')}
  const n=performance.now();if(n-paint>80){paint=n;plain=out;$('#out').textContent=out;$('#out').scrollTop=$('#out').scrollHeight;$('#aimsg').textContent='Generating... '+ntok+' tokens, '+tps().toFixed(1)+' tok/s. Stop keeps what has been written so far.'}};
 const chat=()=>AI.wl.createChatCompletion({messages:[{role:'system',content:AISYS},{role:'user',content:full}],max_tokens:maxTok,temperature:temp,top_k:40,top_p:.9,seed,abortSignal:AI.abort.signal,cache_prompt:true,stream:true,onData:ch=>{const d=ch&&ch.choices&&ch.choices[0]&&ch.choices[0].delta;if(d&&typeof d.content==='string'&&d.content)feed(d.content)}});
 const raw=()=>AI.wl.createCompletion({prompt:instr+'\n\n'+base+'\n\nResult:',max_tokens:maxTok,temperature:temp,seed,abortSignal:AI.abort.signal,stop:['\nText:','Text:'],stream:true,onData:ch=>{const x=ch&&ch.choices&&ch.choices[0]&&ch.choices[0].text;if(x)feed(x)}});
 const isAbort=e=>(e&&e.name==='AbortError')||/abort/i.test(aiMsg(e));
 let result='done',err='';
 try{
  if(AI.info.has_chat===false){aiLog('No chat template: using raw completion');await raw();result='raw'}
  else{try{await chat()}catch(e1){
   if(isAbort(e1)||ntok>0||/context|n_ctx|exceed|too long|memory/i.test(aiMsg(e1)))throw e1;
   aiLog('Chat mode failed ('+aiMsg(e1)+'), retrying in raw completion mode');out='';ntok=0;await raw();result='raw'}}
 }catch(e){if(isAbort(e))result='stopped';else{result='error';err=aiMsg(e)}}
 const secs=aiSecs(),cut=ntok>=maxTok&&(result==='done'||result==='raw');
 out=aiClean(out,input);
 AI.busy=false;AI.abort=null;aiClock(false,'ran '+secs.toFixed(1)+' s');
 const speed=ntok+' tokens in '+secs.toFixed(1)+' s ('+tps().toFixed(1)+' tok/s'+(ttft?', first token after '+ttft.toFixed(1)+' s':'')+')';
 let msg;
 if(out){
  const lost=mask(input,q).items.filter(x=>!out.includes(x));
  AI.cache.set(key,{text:out,info:' | '+sp.name+' (AI: '+ntok+' tokens, '+secs.toFixed(1)+' s'+(cut?', cut off':'')+(result==='stopped'?', stopped early':'')+')'+(lost.length?' | WARNING: the AI changed '+lost.length+' protected item'+(lost.length>1?'s':'')+': '+lost.slice(0,3).join(', '):'')});
  while(AI.cache.size>12)AI.cache.delete(AI.cache.keys().next().value);
  AI.view='ai';
  msg=(result==='stopped'?'Stopped after ':'Done: ')+speed+(result==='stopped'?'. The partial output is kept.':'')
   +(cut?'. It stopped at the length limit ('+maxTok+' tokens), so the output is probably cut off. Try a larger Context or shorter text.':'')
   +(lost.length?' Warning: '+lost.length+' protected item(s) changed, see the line under the output.':'')+(result==='raw'?' (raw completion mode)':'');
  aiLog(result==='stopped'?'Stopped by user after '+ntok+' tokens':'Done: '+speed);
 }else{AI.view=prev;msg=result==='error'?'Generation failed: '+err+(/context|n_ctx|exceed/i.test(err)?' Try a larger Context (then Reload) or shorter text.':''):'The model returned no text. Try again, or raise Creativity a little.';aiLog('No output: '+(err||result))}
 run(1);aiSet('ready',{msg});aiButtons();
}

/* ---- sliders, wiring ---- */
function aiFill(){fill($('#aitemp'));$('#aitempv').textContent=(+$('#aitemp').value/100).toFixed(2)}
{const e=$('#aitemp');e.addEventListener('input',()=>{aiFill();run(1)});
 e.parentElement.addEventListener('wheel',ev=>{ev.preventDefault();e.value=+e.value-Math.sign(ev.deltaY)*(+e.step||1);aiFill();run(1)},{passive:false})}
const aiStaleHint=()=>{if(aiReady())$('#aihint').textContent='Context and WebGPU only apply when a model is loaded. Press Reload to apply the change.'};
$('#aictx').addEventListener('change',aiStaleHint);
$('#aigpu').addEventListener('change',aiStaleHint);
$('#aiextra').addEventListener('input',()=>run(1));
function aiDrawer(open){$('#aidrawer').hidden=!open;$('#aitoggle').setAttribute('aria-expanded',String(open))}
$('#aitoggle').onclick=()=>aiDrawer($('#aidrawer').hidden);
$('#aion').addEventListener('change',()=>{AI.on=$('#aion').checked;sv('aion',AI.on?'1':'0');
 if(!AI.on){if(AI.abort)AI.abort.abort();AI.view='local'}else if(!aiReady()&&!AI.busy)aiDrawer(true);run(1)});
document.querySelectorAll('#aiview button').forEach(b=>b.onclick=()=>{if(b.disabled)return;AI.view=b.dataset.v;run(1)});
$('#aiload').onclick=()=>$('#aifl').click();
$('#aifl').onchange=e=>{aiLoad(e.target.files[0]);e.target.value=''};
$('#aireload').onclick=()=>aiLoad(AI.file);
$('#aiunload').onclick=aiUnload;
$('#airun').onclick=aiRun;
$('#aistop').onclick=()=>{if(AI.abort)AI.abort.abort()};
$('#rr').addEventListener('click',()=>{if(AI.on&&AI.view==='ai'&&aiReady()&&!AI.busy)setTimeout(aiRun,0)});
const aiPanel=$('#aicard');
aiPanel.addEventListener('dragover',e=>{e.preventDefault();aiPanel.classList.add('drag')});
aiPanel.addEventListener('dragleave',e=>{if(!aiPanel.contains(e.relatedTarget))aiPanel.classList.remove('drag')});
aiPanel.addEventListener('drop',e=>{aiPanel.classList.remove('drag');const f=e.dataTransfer&&e.dataTransfer.files[0];if(f){e.preventDefault();if(!AI.on){AI.on=true;$('#aion').checked=true;sv('aion','1')}aiLoad(f)}});

const aiEngUi=()=>{$('#aiengv').hidden=$('#aieng').value!=='cdn';sv('aieng',$('#aieng').value);sv('aiengv',$('#aiengv').value);
 const k=aiEngSel().key;if(AI.mod&&k!==AI.key)$('#aihint').textContent=aiReady()?'Engine changed. Press Reload to switch; the loaded model is released first.':'';aiKV()};
$('#aieng').addEventListener('change',aiEngUi);$('#aiengv').addEventListener('input',aiEngUi);
{const e=lv('aieng'),v=lv('aiengv');if(e==='cdn'||e==='local')$('#aieng').value=e;$('#aiengv').value=v||ENGINE.ver;$('#aiengv').hidden=$('#aieng').value!=='cdn'}

aiFill();aiKV();
aiSet('idle',{title:'No model in memory',st:aiIdleSt(),msg:'Nothing is loaded or downloaded yet. Suggested first model: LFM2.5-350M-Q4_K_M.gguf (229 MB), see Which model? below. Pick the file with Load .gguf, or drop it on this panel.'});
if(lv('aion')==='1'){AI.on=true;$('#aion').checked=true;aiDrawer(true)}
aiButtons();
