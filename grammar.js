/* ---- Grammar and US spelling for "Fix typos". Offline, rule based, no AI. ----
   engine.js typoFix() fixes misspelled words first, then calls grammarFix() on the same token list.
   Every rule looks at a word and its neighbours (never across punctuation or line breaks) and only fires
   on patterns that are wrong in practice, so correct text is left alone.
   FIXOPT.gram switches the grammar pass, FIXOPT.us switches British -> American spelling. */
const FIXOPT={gram:true,us:true};
const {usSpell,grammarFix}=(()=>{
const _S=s=>new Set(s.split(' '));

/* ---------- US spelling (British forms are generated from stems, then looked up per word) ---------- */
const BRM=(()=>{const m=Object.create(null),add=(b,u,sf)=>sf.forEach(s=>{m[b+s]=u+s});
 const OUR=['','s','ed','ing','ite','ites','ful','fully','able','ably','less','er','ers','hood','hoods','ist','ists','al','ally'];
 'colour favour honour neighbour behaviour labour harbour humour flavour rumour savour vapour odour armour endeavour tumour rigour vigour valour splendour saviour demeanour parlour candour clamour fervour ardour succour'.split(' ').forEach(b=>add(b,b.replace(/our$/,'or'),OUR));
 const ISE=['e','es','ed','ing','ation','ations','er','ers'],uz=r=>r.replace(/is$/,'iz').replace(/ys$/,'yz');
 'realis organis recognis apologis criticis emphasis summaris specialis finalis minimis maximis utilis authoris categoris customis memoris normalis prioritis optimis visualis capitalis centralis civilis colonis commercialis familiaris generalis harmonis hospitalis idolis legalis localis mobilis modernis neutralis patronis personalis popularis publicis rationalis revolutionis sanitis socialis standardis stabilis sympathis synchronis terroris theoris urbanis vandalis westernis fertilis sterilis subsidis jeopardis equalis immunis energis crystallis dramatis materialis nationalis privatis criminalis characteris analys paralys catalys'.split(' ').forEach(r=>add(r,uz(r),ISE));
 [['centre','center'],['theatre','theater'],['metre','meter'],['litre','liter'],['fibre','fiber'],['calibre','caliber'],['sombre','somber'],['meagre','meager'],['spectre','specter'],['lustre','luster'],['sabre','saber'],['manoeuvre','maneuver'],['kilometre','kilometer'],['centimetre','centimeter'],['millimetre','millimeter']].forEach(([b,u])=>add(b,u,['','s','d']));
 [['mould','mold'],['plough','plow'],['grey','gray'],['practise','practice'],['enquire','inquire'],['enquiry','inquiry']].forEach(([b,u])=>add(b,u,['','s','ed','d','ing','y']));
 const X={travelled:'traveled',travelling:'traveling',traveller:'traveler',travellers:'travelers',cancelled:'canceled',cancelling:'canceling',labelled:'labeled',labelling:'labeling',modelled:'modeled',modelling:'modeling',levelled:'leveled',levelling:'leveling',signalled:'signaled',signalling:'signaling',fuelled:'fueled',fuelling:'fueling',counsellor:'counselor',counsellors:'counselors',counselling:'counseling',marvellous:'marvelous',jewellery:'jewelry',fulfil:'fulfill',fulfils:'fulfills',enrol:'enroll',enrols:'enrolls',instal:'install',instalment:'installment',skilful:'skillful',wilful:'willful',ageing:'aging',judgement:'judgment',acknowledgement:'acknowledgment',abridgement:'abridgment',sceptic:'skeptic',sceptics:'skeptics',sceptical:'skeptical',scepticism:'skepticism',whilst:'while',amongst:'among',learnt:'learned',dreamt:'dreamed',leapt:'leaped',spoilt:'spoiled',paediatric:'pediatric',paediatrics:'pediatrics',anaemia:'anemia',anaemic:'anemic',oestrogen:'estrogen',foetus:'fetus',diarrhoea:'diarrhea',encyclopaedia:'encyclopedia',haemoglobin:'hemoglobin',moustache:'mustache',pyjamas:'pajamas',sulphur:'sulfur',maths:'math',defence:'defense',defences:'defenses',offence:'offense',offences:'offenses',pretence:'pretense',licence:'license',licences:'licenses',tyre:'tire',tyres:'tires',kerb:'curb',kerbs:'curbs',aluminium:'aluminum',mum:'mom',mums:'moms',mummy:'mommy',programme:'program',programmes:'programs',cheque:'check',cheques:'checks',catalogue:'catalog',catalogues:'catalogs',analogue:'analog',aeroplane:'airplane',aeroplanes:'airplanes',cosy:'cozy'};
 Object.assign(m,X);return m})();
const BR_NAMEY=_S('grey greys mum mums');
const usSpell=(w,capital)=>(capital&&BR_NAMEY.has(w))?null:(BRM[w]||null);

/* ---------- grammar word lists ---------- */
const GS=_S;
const NOREP=GS('had that no bye very so ha hey yes well really many more long far now never ho go blah knock');
const INV=GS("could would should might may must can will shall did does do didn't doesn't don't couldn't wouldn't shouldn't won't can't that if lest unless whether suggest suggests suggested recommend recommends recommended insist insists insisted demand demands demanded require requires required request requests requested ask asks asked propose proposed important essential necessary vital crucial imperative wish wishes wished rather");
const YRE=GS('welcome going coming being doing getting making trying not so too always never really already ready sure able supposed gonna a an');
const YN=GS('car name email mom dad mother father family phone own address number account team message house idea birthday wife husband brother sister son daughter kids parents boss');
const THB=GS("is are was were isn't aren't wasn't weren't");
const THN=GS('own car cars house family names name phone mother father team kids children parents');
const THG=GS('going coming doing getting making trying supposed gonna');
const ITSA=GS('a an been not going just so very too really also never always still the getting');
const ITSJ=GS('good bad great nice hard easy early late important true possible impossible difficult okay ok fine fun cold hot raining snowing clear obvious worth likely unlikely necessary time');
const ITSF=GS('to that for and but when how if because than so or with');
const ITSP=GS('own name color colour size shape owner purpose value content contents price features feature history head tail wings eyes ears nest food mother father surface edge center middle top bottom');
const WHOS=GS('going coming doing been there here ready a an the');
const CMP=GS('more less better worse bigger smaller larger faster slower higher lower greater rather older younger taller easier harder longer shorter fewer cheaper stronger weaker richer poorer smarter happier lighter heavier darker brighter closer farther further deeper wider narrower thicker thinner newer nicer safer simpler different');
const THENP=GS('and but so since until till');
const TOOV=GS('be go see do have get make take come know say help use find give tell try call send bring keep let start stop buy read write leave meet talk work eat play ask check drink sleep wait');
const TOOD=GS('the my your our their his this me us him them');
const AFFP=GS('a an no any little big positive negative major huge great side special significant noticeable lasting');
const EFFP=GS("will would could can may might didn't doesn't don't won't not cannot");
const EFFN=GS('the my your our their his her its me us them you how what many all most every everyone everybody anyone people those these this that children students users customers sales prices results performance');
const LOSEP=GS("to will would could can may might don't didn't doesn't won't not cannot should must gonna");
const MODV=GS('would could should must might');
const PLN=GS('many several few two three four five six seven eight nine ten dozens hundreds thousands millions both');
const HAVEN=GS('been a an the no not to many some much any always never just already got more less its their his her my your our become');
const SUBJ=GS('i he she we they you');
const SUBJ3=GS('he she');
const DEMAND=GS('seen done');
const DONEN=GS('it that this my the a all some something everything nothing what your his her their our');
const ADVV=GS('to would will can could should must might may i we they');
const ADVN=GS('good some any my your his her the free great sound bad little more this that their our');
const BREV=GS("to can can't cannot could couldn't will won't would you we they i help let");
const BREN=GS('a the deep your my his her last first short bad fresh no another');
const WERE_N=GS('going coming doing getting trying ready here very just always never really also');
const WHERE_N=GS('going coming doing getting trying ready just always never very really still also once able late early tired sorry happy busy');
const KNOWN=GS('that what how why where when who if');
const NOUN_BRK=GS("");
const VB='want need like love hate know think say make take get see work look live feel seem play run try use give tell start help come go eat drink sleep walk talk read write ask call send bring keep leave meet move open close buy sell pay wait watch stay turn speak drive ride sit stand win begin end show hear mean allow believe create change learn teach enjoy remember forget understand decide hope expect travel study finish cook clean wear carry hold cost sound become happen appear require consider suggest offer follow include describe wish prefer care matter spend grow build catch break fall fly sing dance laugh cry smile'.split(' ');
const sF=v=>v==='have'?'has':v==='do'?'does':v==='go'?'goes':/(?:s|x|z|ch|sh)$/.test(v)?v+'es':/[^aeiou]y$/.test(v)?v.slice(0,-1)+'ies':v+'s';
const VBS=new Set(VB),SB=Object.assign(Object.create(null),{has:'have',does:'do'});VB.forEach(v=>{SB[sF(v)]=v});
const PP=Object.assign(Object.create(null),{went:'gone',came:'come',saw:'seen',ate:'eaten',did:'done',took:'taken',wrote:'written',began:'begun',drank:'drunk',swam:'swum',sang:'sung',rang:'rung',ran:'run',gave:'given',knew:'known',grew:'grown',threw:'thrown',flew:'flown',drove:'driven',rode:'ridden',broke:'broken',spoke:'spoken',chose:'chosen',stole:'stolen',froze:'frozen',forgot:'forgotten',hid:'hidden',fell:'fallen',shook:'shaken',woke:'woken',wore:'worn',tore:'torn',blew:'blown',drew:'drawn',was:'been',were:'been'});
const PP_S=GS('went came saw ate did took wrote began drank gave knew grew threw flew drove rode broke spoke chose stole froze forgot hid shook woke blew');
const FIXED=Object.assign(Object.create(null),{alot:'a lot',incase:'in case',infact:'in fact',aswell:'as well',eachother:'each other',noone:'no one',atleast:'at least',thankyou:'thank you',irregardless:'regardless',supposably:'supposedly',expresso:'espresso',nucular:'nuclear',everytime:'every time',infront:'in front',inbetween:'in between',ect:'etc',alittle:'a little'});
const CAPW=_S('monday tuesday wednesday thursday friday saturday sunday january february april june july august september october november december english american british french german spanish italian chinese japanese korean russian indian european african asian canadian mexican australian irish scottish welsh arabic portuguese dutch greek swedish norwegian danish finnish christmas easter thanksgiving halloween ramadan hanukkah diwali');
const ABBR=_S('mr mrs ms dr prof sr jr st vs inc ltd corp approx dept fig vol');
const AN_A=/^(?:uni(?:corn|cycle|code|fied|fies|fy|form|forms|lateral|modal|on|ons|que|quely|sex|son|t|te|ted|ts|ty|versal|verse|verses|versity|versities)|use[dfrs]?|useful|usefully|user|users|usual|usually|usurp|utensil|utensils|utility|utilities|utopia|utopian|euro|euros|europe|european|eulogy|euphemism|eucalyptus|one|ones|once|ukulele|ubiquitous|uranium|urinal|urine)$/;
const AN_AN=/^(?:hour|hours|hourly|honest|honestly|honesty|honor|honors|honour|honours|honorable|honourable|heir|heirs|heiress|herb|herbs)$/;
const vowelSound=w=>AN_AN.test(w)||(/^[aeiou]/.test(w)&&!AN_A.test(w));

/* ---------- the grammar pass: tk = original tokens, out = working copy, ch = Set of changed indices ---------- */
function grammarFix(tk,out,ch){
 let extra=0;const N=out.length;
 const isW=s=>/^\p{L}+(?:['\u2019]\p{L}+)*$/u.test(s),isSp=s=>/^[ \t]+$/.test(s),isWs=s=>s!==''&&/^\s+$/.test(s);
 const L=i=>out[i].toLowerCase().replace(/\u2019/g,"'");
 const nb=(i,d)=>{for(let j=i+d;j>=0&&j<N;j+=d)if(out[j]!=='')return j;return -1};
 const nw=(i,d)=>{const j=nb(i,d);if(j<0||!isSp(out[j]))return -1;const k=nb(j,d);return k>=0&&isW(out[k])?k:-1};
 const tail=j=>{let k=nb(j,1);if(k>=0&&isSp(out[k]))k=nb(k,1);return k<0?'':isWs(out[k])?'\n':out[k]};
 const put=(i,v)=>{if(/\u2019/.test(out[i]))v=v.replace(/'/g,'\u2019');out[i]=mc(v,out[i]);ch.add(i)};
 const isStart=i=>{let j=nb(i,-1);if(j<0)return true;
  if(/^[\u201C"'\u2018(\[]$/.test(out[j])){j=nb(j,-1);if(j<0)return true;if(!isWs(out[j]))return false}
  if(!isWs(out[j]))return false;
  const para=/\n[ \t]*\n/.test(out[j]);j=nb(j,-1);if(j<0||para)return true;
  while(j>=0&&/^[\u201D"\u2019)\]]$/.test(out[j]))j=nb(j,-1);
  if(j<0||!/^[.!?]$/.test(out[j]))return false;
  if(out[j]==='.'){const k=nb(j,-1);if(k>=0){if(out[k]==='.')return false;if(isW(out[k])&&(ABBR.has(out[k].toLowerCase())||(out[k].length===1&&!/^[IAa]$/.test(out[k]))))return false}}
  return true};

 /* pass 1: word rules */
 for(let i=0;i<N;i++){
  const x=out[i];if(x===''||!isW(x))continue;
  const w=L(i),pj=nw(i,-1),nj=nw(i,1),p=pj<0?'':L(pj),n=nj<0?'':L(nj),nnj=nj<0?-1:nw(nj,1),nn=nnj<0?'':L(nnj);
  const caps=x.length>1&&x===x.toUpperCase();if(caps)continue;
  const ppj=pj<0?-1:nw(pj,-1),pp=ppj<0?'':L(ppj);
  const F=v=>{put(i,v);return true};

  if(FIXED[w]&&F(FIXED[w]))continue;
  /* repeated word: "the the" */
  if(nj>=0&&n===w&&w.length>1&&!NOREP.has(w)){out[nb(i,1)]='';out[nj]='';ch.add(i);continue}

  /* your / you're, their / there / they're, its / it's, whose / who's */
  if(w==='your'){
   if(YRE.has(n)&&F("you're"))continue;
   if((n==='right'||n==='wrong')&&nj>=0){const t=tail(nj);if((t===''||t==='\n'||/^[.,!?;:)]$/.test(t)||/^(and|but|about|because|so|if|that)$/.test(nn))&&F("you're"))continue}
  }
  if(w==="you're"&&YN.has(n)&&F('your'))continue;
  if(w==='their'&&THB.has(n)&&F('there'))continue;
  if(w==='there'&&(THN.has(n)&&F('their')))continue;
  if(w==='there'&&THG.has(n)&&F("they're"))continue;
  if(w==="they're"&&THN.has(n)&&F('their'))continue;
  if(w==='its'){
   if(ITSA.has(n)&&F("it's"))continue;
   if(ITSJ.has(n)){const t=nnj<0?tail(nj):'';if((nnj>=0?ITSF.has(nn):(t===''||t==='\n'||/^[.,!?;:)]$/.test(t)))&&(n!=='time'||nn==='to')&&F("it's"))continue}
  }
  if(w==="it's"&&ITSP.has(n)&&F('its'))continue;
  if(w==='whose'&&WHOS.has(n)&&F("who's"))continue;

  /* then / than, to / too, affect / effect, lose / loose */
  if(w==='then'&&CMP.has(p)&&F('than'))continue;
  if(w==='than'&&THENP.has(p)&&F('then'))continue;
  if(w==='to'){
   if(n==='much'&&nn!=='of'&&F('too'))continue;
   if((n==='soon'||n==='tired')&&F('too'))continue;
  }
  if(w==='too'&&(TOOV.has(n)||TOOD.has(n))&&F('to'))continue;
  if(w==='affect'&&(AFFP.has(p)||((p==='the'||p==='this'||p==='that'||p==='its'||p==='their')&&(n==='on'||n==='of')))&&F('effect'))continue;
  if(w==='effect'&&EFFP.has(p)&&EFFN.has(n)&&F('affect'))continue;
  if(w==='loose'&&LOSEP.has(p)&&nj>=0&&F('lose'))continue;
  if(w==='lose'&&(p==='too'||p==='very'||p==='so'||p==='quite')&&out[nb(i,1)]!=='-'&&F('loose'))continue;
  if(w==='accept'&&n==='for'&&F('except'))continue;
  if(w==='weather'&&n==='or'&&nn==='not'&&F('whether'))continue;
  if(w==='whether'&&/^(the|nice|good|bad|beautiful|terrible|cold|hot|warm|great|such|nasty)$/.test(p)&&n!=='or'&&n!=='not'&&F('weather'))continue;
  if(w==='breath'&&BREV.has(p)&&F('breathe'))continue;
  if(w==='breathe'&&BREN.has(p)&&F('breath'))continue;
  if(w==='advice'&&ADVV.has(p)&&F('advise'))continue;
  if(w==='advise'&&ADVN.has(p)&&F('advice'))continue;
  if(w==='maybe'&&/^(it|this|that|he|she|they|which|there|who)$/.test(p)&&/^(a|an|the|true|false|possible|impossible|because|about|in|on|at|for|to|more|less|not|too|so|very|better|worse|able|time|late|early|important|right|wrong|good|bad|hard|easy|difficult)$/.test(n)&&F('may be'))continue;
  if(w==='everyday'&&!/^(a|an|the|my|your|our|their|his|her|its|this|that|very|more|most|is|are|was|were)$/.test(p)){const t=tail(i);if((t===''||t==='\n'||/^[.,!?;:)]$/.test(t)||/^(and|but|so|or|at|in|on|for|to|after|before|with|because|since|when|while|until|from|by)$/.test(n))&&F('every day'))continue}
  if(w==='awhile'&&/^(for|in|after|within)$/.test(p)&&F('a while'))continue;
  if(w==='bare'&&n==='with'&&(nn==='me'||nn==='us')&&F('bear'))continue;
  if(w==='say'&&p==='per'&&F('se'))continue;
  if(w==='mute'&&n==='point'&&F('moot'))continue;
  if(w==='and'&&p==='case'&&n==='point'&&F('in'))continue;
  if(w==='no'&&/^(i|we|you|they)$/.test(p)&&KNOWN.has(n)&&F('know'))continue;
  if(w==='where'&&/^(we|you|they)$/.test(p)&&(WHERE_N.has(n)||/^\p{L}+ing$/u.test(n))&&F('were'))continue;
  if(w==='were'&&WERE_N.has(n)&&(pj<0?isStart(i):/^(and|but|so|because|while|since|that|now|then|as|when|if)$/.test(p))&&F("we're"))continue;
  if(w==='lets'&&/^(go|get|see|start|try|make|take|do|be|meet|talk|move|keep|look|check|begin|just|not)$/.test(n)&&(pj<0?isStart(i):/^(and|but|so|then)$/.test(p))&&F("let's"))continue;

  /* would of -> would have */
  if(w==='of'&&MODV.has(p)&&n!=='course'&&F('have'))continue;

  /* there is / there are */
  if(w==='is'&&p==='there'&&(PLN.has(n)||(n==='a'&&nn==='few'))&&F('are'))continue;
  if(w==="there's"&&(PLN.has(n)||(n==='a'&&nn==='few'))&&F('there are'))continue;

  /* subject-verb agreement */
  if(p==='i'&&(w==='is'||w==='are')&&F('am'))continue;
  if((p==='i'||p==='we'||p==='they')&&(w==='has'||w==='does')&&F(SB[w]))continue;
  if((p==='we'||p==='they')&&w==='is'&&F('are'))continue;
  if((p==='we'||p==='they')&&w==='was'&&F('were'))continue;
  if((p==='i'||p==='we'||p==='they')&&w==="doesn't"&&F("don't"))continue;
  if((p==='i'||p==='we'||p==='they')&&SB[w]&&w!=='has'&&w!=='does'&&w!=='is'&&!INV.has(pp)&&F(SB[w]))continue;
  if((p==='he'||p==='she'||p==='it')&&!INV.has(pp)){
   if(w==='are'&&F('is'))continue;
   if(w==="don't"&&F("doesn't"))continue;
   if(w==='do'&&n==='not'&&F('does'))continue;
   if(w==='have'&&HAVEN.has(n)&&F('has'))continue;
  }
  if(SUBJ3.has(p)&&VBS.has(w)&&!INV.has(pp)&&!(w==='need'&&n==='not')&&F(sF(w)))continue;

  /* have went -> have gone, I seen -> I saw, I done it -> I did it */
  const hv=s=>/^(have|has|had|having)$/.test(s)||/'ve$/.test(s);
  if(PP[w]&&pj>=0&&(hv(p)||(/^(never|already|just|ever|always|also|still|not|often|finally)$/.test(p)&&hv(pp))||(PP_S.has(w)&&(/^(he|she|it|that|who|there|what)'s$/.test(p)||/^(i|you|he|she|we|they)'d$/.test(p))))&&F(PP[w]))continue;
  if(w==='seen'&&SUBJ.has(p)&&!/^(have|has|had|having|never|ever)$/.test(pp)&&F('saw'))continue;
  if(w==='done'&&SUBJ.has(p)&&p!=='you'&&DONEN.has(n)&&!/^(have|has|had|having)$/.test(pp)&&F('did'))continue;

  /* a / an */
  if(w==='a'&&nj>=0){const nx=out[nj];if(!(nx.length>1&&nx===nx.toUpperCase())&&n.length>1&&vowelSound(n)&&F('an'))continue}
  if(w==='an'&&nj>=0){const nx=out[nj];if(!(nx.length>1&&nx===nx.toUpperCase())&&n.length>1&&/^[a-z]/.test(n)&&!vowelSound(n)&&!/^(x|hist)/.test(n)&&F('a'))continue}
 }

 /* pass 2: capital letters (I, I'm, days, months, languages, sentence starts) */
 for(let i=0;i<N;i++){
  const x=out[i];if(x===''||!isW(x))continue;
  let v=x;
  if(x==='i'){const k=nb(i,1),pk=nb(i,-1);const nx=k>=0?out[k]:'',lineStart=pk<0||(isWs(out[pk])&&/\n/.test(out[pk]));
   if(!(nx===')'||(nx==='.'&&lineStart)||(pk>=0&&/^[(\[]$/.test(out[pk]))))v='I'}
  else if(/^i['\u2019](?:m|ve|ll|d)$/.test(x))v='I'+x.slice(1);
  else if(CAPW.has(x))v=x[0].toUpperCase()+x.slice(1);
  if(v===x&&x===x.toLowerCase()&&/^\p{Ll}/u.test(x)&&isStart(i)){
   const k=nb(i,1),k2=k<0?-1:nb(k,1);
   if(!(k>=0&&out[k]==='.'&&k2>=0&&isW(out[k2])))v=x[0].toUpperCase()+x.slice(1);
  }
  if(v!==x){out[i]=v;ch.add(i)}
 }

 /* pass 3: spacing around punctuation */
 for(let i=0;i<N;i++){
  const x=out[i];if(x==='')continue;
  if(isSp(x)){
   const j=nb(i,-1),k=nb(i,1);if(j<0||k<0)continue;
   const pr=out[j],a=out[k];
   if(/^[,;:.!?]$/.test(a)&&!/^[,;:.!?]$/.test(pr)&&/[\p{L}\p{N})"\u201D\u2019\]\uE001]$/u.test(pr)){
    const m=nb(k,1),after=m<0?'':out[m];
    const ok=a===','||a==='!'||a==='?'?true:(m<0||isWs(after)||/^[)"\u201D\u2019\]]$/.test(after));
    if(ok){out[i]='';extra++;continue}
   }
   if(/^ {2,}$/.test(x)){out[i]=' ';extra++}
  }else if(/^[,;:.!?]$/.test(x)){
   const j=nb(i,-1),k=nb(i,1);if(j<0||k<0)continue;
   const pr=out[j],a=out[k];if(!isW(pr)||!isW(a))continue;
   const add=(x===','||x===';'||x==='!'||x==='?')||(x===':'&&pr.length>1&&a.length>1)||(x==='.'&&pr.length>1&&/[a-z]$/.test(pr)&&/^[A-Z][a-z]/.test(a));
   if(add){out[i]=x+' ';ch.add(i);if((x==='!'||x==='?')&&/^\p{Ll}/u.test(a)&&a===a.toLowerCase()&&!(k<N-1&&out[nb(k,1)]==='.'&&isW(out[nb(nb(k,1),1)]||''))){out[k]=a[0].toUpperCase()+a.slice(1);ch.add(k)}}
  }
 }
 return extra;
}
return{usSpell,grammarFix};
})();
