/* ---- AI task specs: what the AI is asked to do for each tab/mode. Pure functions, no DOM. ----
   aiSpec(c) takes the current settings {tab,tmode,nmode,dir,v,pk,text} and returns
   {ok:false,why} when AI does not apply, or {ok:true,id,tkey,name,what,instr,temp,outWords,base?}. */
const AIDEG=v=>v<35?'slightly':v<70?'noticeably':'completely';
const AIKEEP=' Keep the meaning, names, numbers, links and quoted text unchanged. Output only the rewritten text.';
const AINO={
 add:'Add typos deliberately breaks words with fixed rules, and an AI model is no better at that. This mode stays local.',
 clean:'Clean up is exact formatting rules (spaces, punctuation, capitals), so it stays local. It is already instant and exact.',
 tools:'Tools are exact text operations (case, reverse, Morse...). AI models get these wrong, so they stay local.'};
function aiSpec(c){
 const n=Math.max(1,wc(c.text)),v=c.v;
 if(c.tab==='tools')return{ok:false,why:AINO.tools};
 if(c.tab==='tadd'&&c.tmode==='add')return{ok:false,why:AINO.add};
 if(c.tab==='tadd'&&c.tmode==='clean')return{ok:false,why:AINO.clean};
 if(c.tab==='tadd')return{ok:true,id:'fix',tkey:'fix',name:'Fix typos',what:'polish the dictionary-corrected text: fix remaining spelling and grammar, changing as little as possible',
  instr:'The text below was already spell-checked by a dictionary. Fix any remaining spelling, grammar and punctuation mistakes. Change as little as possible: keep the wording, names, tone and line breaks. Output only the corrected text.',
  temp:.1,outWords:n*1.15,base:'fix'};
 if(!v)return{ok:false,why:'Amount is 0%, so there is nothing to change. Move the slider first.'};
 if(c.tab==='size'){
  const shrink=c.dir<0,t=Math.max(1,Math.round(n*(1+(shrink?-v:v)/100)));
  return{ok:true,id:'size'+c.dir,tkey:'size',name:(shrink?'Shrink ':'Enlarge ')+v+'%',what:(shrink?'shorten':'lengthen')+' the text from '+n+' to about '+t+' words',
   instr:shrink?'Shorten the text to about '+t+' words (it currently has '+n+'). Keep the key facts, names, numbers and the tone. Output only the shortened text.'
    :'Rewrite the text using more words, about '+t+' words (it currently has '+n+'). Use fuller phrasing and connecting words, but do NOT add new facts, names or numbers. Output only the rewritten text.',
   temp:.2,outWords:t};
 }
 if(c.tab==='tone'){
  const m=c.nmode,d=AIDEG(v),what={formal:'more formal and professional',casual:'more casual and friendly, like talking to a friend',simple:'simpler and easier to read, with shorter sentences and everyday words'}[m]||'different in tone';
  return{ok:true,id:'tone:'+m,tkey:'tone:'+m,name:m[0].toUpperCase()+m.slice(1)+' '+v+'%',what:'make the tone '+d+' '+what.split(',')[0],
   instr:'Make the text '+d+' '+what+'.'+AIKEEP,temp:m==='casual'?.3:.2,outWords:n*(m==='simple'?1.2:1.3)};
 }
 if(c.tab==='pers'){
  const nm=(typeof PN!=='undefined'&&PN[c.pk])||c.pk,d=v<35?'with a light touch':v<70?'with a clear but moderate style':'fully committing to the style';
  return{ok:true,id:'pers:'+c.pk,tkey:'pers:'+c.pk,name:nm+' '+v+'%',what:'rewrite it in the "'+nm+'" voice, '+d,
   instr:'Rewrite the text in the "'+nm+'" speaking style, '+d+'.'+AIKEEP,temp:.5,outWords:n*1.4};
 }
 return{ok:false,why:'AI does not apply here.'};
}
