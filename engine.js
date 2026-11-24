//ENGINE
const hash=s=>{let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return h>>>0};
const mk=seed=>{let a=hash(seed+'');return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const shuf=(a,r)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,r)=>a[Math.floor(r()*a.length)];
const mc=(r,o)=>!r?r:(o.length>1&&o===o.toUpperCase())?r.toUpperCase():(o[0]!==o[0].toLowerCase()?r[0].toUpperCase()+r.slice(1):r);
const FW=new Set('the a an this that it we they he she there these those my our his her some many most all in on at if when as but so then also however after before because'.split(' '));
const VB=new Set('visit please remember note consider make take let try check imagine look bring send keep call do does did is are was were can could will would should what why how who where wow yesterday today tomorrow now'.split(' '));
const lowFW=s=>{const w=(s.match(/^\w+/)||[''])[0].toLowerCase();return FW.has(w)||VB.has(w)||/^\w{3,}ing$/.test(w)?s[0].toLowerCase()+s.slice(1):s};
function mask(t,q){
 const st=[];let prefix='\uE000';while(t.includes(prefix))prefix+='\uE000';
 const quote=q?'|"[^"\\n]{1,300}"|\u201C[^\u201D\\n]{1,300}\u201D|\u2018[^\u2019\\n]{1,300}\u2019':'';
 const re=new RegExp('https?:\\/\\/\\S+|www\\.\\S+|[\\w.+-]+@[\\w-]+\\.[\\w.-]+|`[^`]*`|[#@]\\w+|\\b\\d[\\d.,:\\/]*\\d\\b|\\b\\d\\b'+quote,'g');
 const enc=i=>{let s='';do{s=String.fromCharCode(0xE100+i%6000)+s;i=Math.floor(i/6000)}while(i>0);return s};
 const dec=s=>[...s].reduce((a,c)=>a*6000+c.charCodeAt(0)-0xE100,0);
 return{t:t.replace(re,m=>prefix+enc(st.push(m)-1)+'\uE001'),un:s=>s.replace(new RegExp(prefix+'([\uE100-\uF8FF]+)\uE001','g'),(_,n)=>st[dec(n)]??'')}}
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const wc=s=>(s.match(/\p{L}[\p{L}'’]*/gu)||[]).length;
const cc=s=>Array.from(s).length;

/* ---- phrase tables ---- */
const tbl=(pairs,f)=>{const m={};pairs.forEach(([a,b])=>m[a.toLowerCase()]=b);const k=Object.keys(m).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
 return{re:new RegExp('\\b(?:'+k.join('|')+')(?![\\w\'])','gi'),f:m0=>{const v=m[m0[0].toLowerCase()];return v==null?null:mc(v,m0[0])}}};
const rev=p=>p.map(([a,b])=>[b,a]);
const CT=[["do not","don't"],["does not","doesn't"],["did not","didn't"],["is not","isn't"],["are not","aren't"],["was not","wasn't"],["were not","weren't"],["have not","haven't"],["has not","hasn't"],["would not","wouldn't"],["could not","couldn't"],["should not","shouldn't"],["cannot","can't"],["will not","won't"],["it is","it's"],["that is","that's"],["there is","there's"],["what is","what's"],["I am","I'm"],["you are","you're"],["they are","they're"],["we are","we're"],["I have","I've"],["I will","I'll"]];
const GROW_C=(()=>{const t=tbl(rev(CT));const n=/\b(\w+)n't\b/gi;return s=>s.replace(t.re,m=>t.f([m])||m).replace(n,(m,a)=>mc(a+' not',m))})();
const PH=[["due to the fact that","because"],["at this point in time","now"],["in the event that","if"],["a large number of","many"],["for the purpose of","for"],["with regard to","regarding"],["in spite of the fact that","although"],["is able to","can"],["has the ability to","can"],["prior to","before"],["subsequent to","after"],["in addition","also"],["each and every","every"],["at the present time","currently"],["in order to","to"],["a lot of","many"],["in close proximity to","near"],["it is important to note that",""],["as a matter of fact",""]];
const PHG=PH.filter(p=>p[1]&&!['to','for','regarding','if','many'].includes(p[1])&&p[1].length>2);
const SY=[["use","utilize"],["help","assist"],["start","commence"],["end","terminate"],["show","demonstrate"],["need","require"],["buy","purchase"],["try","attempt"],["ask","inquire"],["get","obtain"],["enough","sufficient"],["begin","commence"],["think","consider"],["but","however"],["so","therefore"],["also","additionally"],["now","at this point in time"],["because","due to the fact that"],["many","a large number of"],["before","prior to"],["after","subsequent to"],["big","substantial"],["small","diminutive"],["fast","expeditious"],["sure","certain"],["maybe","perhaps"],["about","concerning"],["tell","inform"],["give","provide"],["make","construct"]];
const ABB=[["because","bc"],["with","w/"],["without","w/o"],["and","&"],["you","u"],["your","ur"],["people","ppl"],["before","b4"],["through","thru"],["between","btwn"],["information","info"],["something","sth"],["probably","prob"],["tomorrow","tmrw"],["though","tho"],["approximately","approx"],["government","govt"],["important","impt"],["minutes","min"],["please","pls"],["thanks","thx"],["great","gr8"],["are","r"],["to","2"]];
const DB=[["big","big and large"],["good","good and fine"],["bad","bad and poor"],["fast","fast and quick"],["happy","happy and joyful"],["important","important and significant"],["easy","easy and simple"],["hard","hard and difficult"],["new","new and novel"],["old","old and aged"],["clear","clear and obvious"],["strong","strong and powerful"]];
let USED=[];
const PL=[["as soon as possible","asap"],["as far as i know","afaik"],["for your information","fyi"],["in my humble opinion","imho"],["in my opinion","imo"],["to be honest","tbh"],["to be fair","tbf"],["by the way","btw"],["talk to you later","ttyl"],["on my way","omw"],["right now","rn"],["of course","ofc"],["in real life","irl"],["just kidding","jk"],["just so you know","jsyk"],["in case you missed it","icymi"],["no problem","np"],["be right back","brb"],["oh my god","omg"],["oh my gosh","omg"],["laughing out loud","lol"],["face to face","f2f"],["good night","gn"],["good morning","gm"],["good luck","gl"],["thank you","ty"],["and so on","etc"],["for example","eg"],["best friend","bff"],["i don't know","idk"],["see you later","cya"],["see you","cya"],["too long didn't read","tldr"],["what the heck","wth"],["for the win","ftw"],["away from keyboard","afk"],["at the moment","atm"],["got to go","g2g"],["going to","gonna"],["want to","wanna"],["got to","gotta"],["kind of","kinda"],["sort of","sorta"],["out of","outta"],["let me","lemme"],["give me","gimme"],["lots of","lotsa"]];
const WL=[["people","ppl"],["messages","msgs"],["message","msg"],["pictures","pics"],["picture","pic"],["girlfriend","gf"],["boyfriend","bf"],["brother","bro"],["sister","sis"],["weekend","wknd"],["probably","prolly"],["obviously","obvs"],["seriously","srsly"],["definitely","def"],["night","nite"],["minutes","min"],["hours","hrs"],["thanks","thx"],["please","plz"],["sorry","sry"],["okay","ok"],["text","txt"],["versus","vs"]];
const WM=[["you're","ur"],["your","ur"],["you","u"],["are","r"],["for","4"],["too","2"],["two","2"],["later","l8r"],["great","gr8"],["wait","w8"],["mate","m8"],["hate","h8"],["late","l8"],["straight","str8"],["today","2day"],["tonight","2nite"],["love","luv"],["really","rly"],["about","abt"],["something","smth"],["little","lil"],["next","nxt"],["week","wk"],["year","yr"],["to","2"]];
const WX=[["someone","sm1"],["know","no"],["see","c"],["be","b"],["why","y"],["one","1"],["yes","y"],["very","v"]];
const PRO=new Set([...PL,...WL,...WM,...WX,...ABB].map(p=>p[1]));
const FILL=/\b(?:very|really|just|quite|actually|basically|literally|totally|definitely|simply|rather|somewhat|extremely|absolutely|essentially|certainly|honestly|obviously|clearly|merely)\b,?\s+/gi;
const OPEN=["It should be noted that ","As a matter of fact, ","Generally speaking, ","In this regard, ","Needless to say, ","It is worth mentioning that ","For all intents and purposes, ","To put it another way, "];
const TAIL=["as it were","to a certain extent","in this particular case","so to speak","for the most part","all things considered"];
const STOP=new Set('the a an and or but of to in on at for with from by is are was were be been it this that these those i you he she we they my your his her our their as if so not no do does did have has had will would can could'.split(' '));

function dropS(t,target){
 const ab=t.replace(/\b(?:Mr|Mrs|Ms|Dr|St|vs|etc|e\.g|i\.e)\./gi,m=>m.slice(0,-1)+'\uE002');
 const lines=ab.split('\n').map(l=>l.match(/[^.!?]+[.!?]*\s*/g)||[]);
 const all=[];lines.forEach((l,li)=>l.forEach((s,si)=>all.push({li,si,s})));
 if(all.length<2)return t;
 const f={};all.forEach(x=>{x.w=(x.s.toLowerCase().match(/[a-z']+/g)||[]).filter(w=>!STOP.has(w));x.w.forEach(w=>f[w]=(f[w]||0)+1)});
 all.forEach((x,i)=>x.sc=x.w.reduce((a,w)=>a+f[w],0)/(Math.sqrt(x.w.length)+1)+(i==0?1e3:0));
 const L0=t.length,tot=()=>lines.map(l=>l.join('').trim()).filter(Boolean).join('\n').length;
 const order=[...all].sort((a,b)=>a.sc-b.sc);let alive=all.length;
 for(const x of order){if(tot()<=target||alive<=1)break;const s0=lines[x.li][x.si];lines[x.li][x.si]='';if(tot()<target-.12*L0){lines[x.li][x.si]=s0;continue}alive--}
 return lines.map(l=>l.join('').trim()).filter(Boolean).join('\n').replace(/\uE002/g,'.');
}
function runPasses(t,passes,target,grow,r){
 USED=[];
 for(const p of passes){
  if(grow?t.length>=target:t.length<=target)break;
  if(p.sp){const b4=t.length;t=p.sp(t,target);if(t.length<b4&&p.n)USED.push(p.n);continue}
  let len=t.length;
  const ms=[...t.matchAll(p.re)].map(m=>({m,rep:p.f(m,t)})).filter(x=>x.rep!=null&&x.rep!==x.m[0]);
  shuf(ms,r);const ch=[];
  for(const x of ms){if(grow?len>=target:len<=target)break;len+=x.rep.length-x.m[0].length;ch.push(x)}
  ch.sort((a,b)=>a.m.index-b.m.index);if(ch.length&&p.n)USED.push(p.n);
  let o='',i=0,cap=false;const up=s=>cap&&s?(cap=false,s[0].toUpperCase()+s.slice(1)):s;
  for(const x of ch){o+=up(t.slice(i,x.m.index));o+=up(x.rep);if(p.cap&&x.rep===''&&/[A-Z]/.test(x.m[0][0]))cap=true;i=x.m.index+x.m[0].length}
  t=o+up(t.slice(i));
 }
 return t;
}
function size(t,z,r,q){
 if(!z||!t)return{segs:[[t,0]],ach:0};
 const M=mask(t,q),x0=M.t,target=Math.round(x0.length*(1+z/100));let x;
 const T=(p,rv)=>{const b=tbl(rv?rev(p):p);return{re:b.re,f:b.f}};
 if(z<0){
  const sy=tbl(rev(SY.filter(p=>p[1].length>p[0].length))),N=(n,o)=>({...o,n});
  x=runPasses(x0,[N('filler',{re:FILL,f:()=>'',cap:1}),N('contractions',T(CT)),N('wordy phrases',T(PH)),N('plain words',sy),N('parentheses',{re:/ ?\([^()\n]*\)/g,f:()=>''}),N('acronyms',T(PL)),N('articles',{re:/\b(?:the|an|a)\s+/gi,f:()=>'',cap:1}),N('abbreviations',T(WL)),N('shortcuts',T(ABB)),N('sentences',{sp:dropS}),N('textese',T(WM)),N('punctuation',{re:/([!?])[!?]+/g,f:m=>m[1]}),N('commas',{re:/,(?=\s|$)/g,f:()=>''}),N('periods',{re:/\.(?=\s|$)/g,f:()=>''}),N('apostrophes',{re:/([A-Za-z])['\u2019]([A-Za-z])/g,f:m=>m[1]+m[2]}),N('single letters',T(WX)),
   N('vowels',{re:/\b[a-z]{5,}\b/g,f:m=>PRO.has(m[0])?null:m[0][0]+m[0].slice(1,-1).replace(/[aeiou]/g,'')+m[0].slice(-1)})],target,false,r);
 }else{
  const sy=tbl(SY.map(([a,b])=>[a,b])),dbl=tbl(DB);
  x=runPasses(x0,[{re:/\b\w+n't\b|\b(?:it|that|there|what)'s\b|\b(?:I|you|they|we)'(?:m|re|ve|ll)\b/gi,f:m=>GROW_C(m[0])},sy,T(PHG,true),dbl,
   {re:/(^|[.!?]\s+)([A-Z]\w*)/g,f:(m,s)=>{if(/\b(?:Mr|Mrs|Ms|Dr|St|vs|etc)\.?$/.test(s.slice(0,m.index+m[1].length).trimEnd().replace(/\.$/,'')+(/\.\s*$/.test(s.slice(0,m.index+m[1].length))?'.':'')))return null;const w=m[2];const L=lowFW(w);return m[1]+pick(OPEN,r)+L}},
   {re:/(\w)([.!?])(?=\s|$)/g,f:(m,s)=>/\b(?:Mr|Mrs|Ms|Dr|St|vs|etc)$/.test(s.slice(0,m.index+1))?null:m[1]+', '+pick(TAIL,r)+m[2]},
   {re:/(\w)([.!?])(?=\s|$)/g,f:(m,s)=>/\b(?:Mr|Mrs|Ms|Dr|St|vs|etc)$/.test(s.slice(0,m.index+1))?null:m[1]+', and this is worth emphasizing'+m[2]}],target,true,r);
 }
 x=x.replace(/ {2,}/g,' ');const out=M.un(x);
 return{segs:[[out,0]],ach:Math.round((out.length/t.length-1)*100),used:USED.slice()};
}

/* ---- typos ---- */
const TOK=/\uE000+[\uE100-\uF8FF]+\uE001|\p{L}+(?:['’]\p{L}+)*|\s+|[\s\S]/gu;
const KB=(()=>{const rows=['qwertyuiop','asdfghjkl','zxcvbnm'],n={};rows.forEach((row,y)=>[...row].forEach((c,x)=>{n[c]=[];[[0,-1],[0,1],[-1,0],[-1,1],[1,-1],[1,0]].forEach(([dy,dx])=>{const l=rows[y+dy];if(l&&l[x+dx])n[c].push(l[x+dx])})}));return n})();
const MS={definitely:'definately',separate:'seperate',receive:'recieve',occurred:'occured',until:'untill',believe:'beleive',tomorrow:'tommorow',necessary:'neccessary',their:'there',there:'their',then:'than',than:'then',too:'to',lose:'loose',loose:'lose',effect:'affect',affect:'effect',which:'wich',because:'becuase',friend:'freind',beautiful:'beutiful',different:'diffrent',really:'realy',people:'peple',weird:'wierd',across:'accross',thought:'thougt',through:'throught',knowledge:'knowlege'};
function typoAdd(t,pct,r,q){
 const M=mask(t,q),tk=M.t.match(TOK)||[],out=tk.slice();
 const W=tk.filter(x=>/^[A-Za-z]{2,}$/.test(x)).length,C=[];
 tk.forEach((x,i)=>{if(/^[A-Za-z]{2,}$/.test(x))C.push(i)});shuf(C,r);
 const n=Math.min(C.length,Math.round(W*pct/100)),ch=new Set(),dead=new Set();
 const L=c=>KB[c.toLowerCase()];
 const K={
  spell:(w,i)=>MS[w.toLowerCase()]?mc(MS[w.toLowerCase()],w):null,
  sub:w=>{const p=Math.floor(r()*w.length),n=L(w[p]);return n?w.slice(0,p)+mc(pick(n,r),w[p])+w.slice(p+1):null},
  swap:w=>{if(w.length<3)return null;const p=Math.floor(r()*(w.length-1));return w[p].toLowerCase()==w[p+1].toLowerCase()?null:w.slice(0,p)+w[p+1]+w[p]+w.slice(p+2)},
  drop:w=>{if(w.length<4)return null;const p=1+Math.floor(r()*(w.length-1));return w.slice(0,p)+w.slice(p+1)},
  dbl:w=>{const p=Math.floor(r()*w.length);return w.slice(0,p)+w[p]+w.slice(p)},
  merge:(w,i)=>{if(/^ +$/.test(tk[i+1]||'')&&/^[A-Za-z]+$/.test(tk[i+2]||'')&&!dead.has(i+2)){out[i+1]='';out[i+2]='';dead.add(i+1);dead.add(i+2);return w+tk[i+2]}return null}
 };
 const ks=['spell','sub','sub','swap','swap','drop','dbl','merge'];
 for(const i of C){if(ch.size>=n)break;if(dead.has(i))continue;
  for(const k of shuf(['spell',...shuf(ks.slice(1),r)].slice(0,r()<.15?8:7),r).sort(()=>0)){
   const v=K[k](tk[i],i);if(v&&v!==tk[i]){out[i]=v;ch.add(i);break}}}
 return{segs:out.map((x,i)=>[M.un(x),ch.has(i)?1:0]),n:ch.size};
}
let R=null,RB=[];
const CTR={dont:"don't",cant:"can't",wont:"won't",isnt:"isn't",arent:"aren't",didnt:"didn't",doesnt:"doesn't",wasnt:"wasn't",couldnt:"couldn't",shouldnt:"shouldn't",wouldnt:"wouldn't",youre:"you're",theyre:"they're",thats:"that's",whats:"what's",havent:"haven't",hasnt:"hasn't",ive:"I've"};
const AL='abcdefghijklmnopqrstuvwxyz';
function e1(w){const s=[];for(let i=0;i<=w.length;i++){const a=w.slice(0,i),b=w.slice(i);if(b)s.push(a+b.slice(1));if(b.length>1)s.push(a+b[1]+b[0]+b.slice(2));for(const c of AL){if(b)s.push(a+c+b.slice(1));s.push(a+c+b)}}return s}
function best(list,w){let b=null,bs=1e9;for(const c of list){const k=R.get(c);if(k==null)continue;const score=k+(c[0]!==w[0]?4000:0)+(c.length<w.length?1500:0);if(score<bs){bs=score;b=c}}return b}
function editDistance(a,b,limit=2){
 if(Math.abs(a.length-b.length)>limit)return limit+1;
 let pp=null,pr=new Int16Array(b.length+1),cr=new Int16Array(b.length+1);
 for(let j=0;j<=b.length;j++)pr[j]=j;
 for(let i=1;i<=a.length;i++){
  cr[0]=i;let rowMin=i<=limit?i:Infinity;const lo=Math.max(1,i-limit),hi=Math.min(b.length,i+limit);
  for(let j=1;j<lo;j++)cr[j]=limit+1;
  for(let j=lo;j<=hi;j++){
   const cost=a[i-1]===b[j-1]?0:1;let v=Math.min(pr[j]+1,cr[j-1]+1,pr[j-1]+cost);
   if(pp&&i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])v=Math.min(v,pp[j-2]+1);
   cr[j]=v;if(v<rowMin)rowMin=v;
  }
  for(let j=hi+1;j<=b.length;j++)cr[j]=limit+1;
  if(rowMin>limit)return limit+1;pp=pr;pr=cr;cr=new Int16Array(b.length+1);
 }
 return pr[b.length];
}
let d2Checks=0,d2Words=0;
function twoEditCandidate(w){
 if(d2Words>=50||d2Checks>=12000)return null;d2Words++;
 let candidateBest=null,bestRank=Infinity,secondRank=Infinity,bestDistance=3;
 for(let len=Math.max(1,w.length-2);len<=w.length+2&&d2Checks<12000;len++){
  const bucket=RB[len];if(!bucket)continue;
  for(let i=0;i<Math.min(bucket.length,500)&&d2Checks<12000;i++){
   const candidate=bucket[i];d2Checks++;const dist=editDistance(w,candidate,2);if(dist>2||dist===0)continue;
   const rank=R.get(candidate);
   if(dist<bestDistance||(dist===bestDistance&&rank<bestRank)){
    if(dist===bestDistance&&candidateBest)secondRank=bestRank;
    bestDistance=dist;bestRank=rank;candidateBest=candidate;
   }else if(dist===bestDistance&&rank<secondRank)secondRank=rank;
  }
 }
 // Two-edit guesses require a common dictionary word and a clear frequency lead.
 if(bestDistance!==2||bestRank>3000||secondRank-bestRank<150)return null;
 return candidateBest;
}
function fixWord(lw){
 if(CTR[lw])return CTR[lw];if(R.has(lw))return null;
 const c=best(e1(lw),lw);if(c)return c;
 if(lw.length>=4){let b=null,bs=1e9;for(let k=2;k<=lw.length-2;k++){const a=lw.slice(0,k),z=lw.slice(k);if(R.has(a)&&R.has(z)){const score=R.get(a)+R.get(z);if(score<bs){bs=score;b=a+' '+z}}}if(b)return b}
 return lw.length>=5?twoEditCandidate(lw):null;
}
function typoFix(t,q){
 if(!R)return{segs:[[t,0]],n:0,wait:1};
 const M=mask(t,q),tk=M.t.match(TOK)||[],out=tk.slice(),ch=new Set();d2Checks=0;d2Words=0;let prev='.';
 tk.forEach((x,i)=>{
  if(/^[A-Za-z]{2,}$/.test(x)){
   const start=/[.!?\n]\s*$/.test(prev)||prev==='.'&&i==0;
   const skip=(/^[A-Z][a-z]/.test(x)&&!start)||(x===x.toUpperCase());
   if(!skip){const f=fixWord(x.toLowerCase());if(f){out[i]=mc(f,x);ch.add(i)}}
  }
  if(/\S/.test(x))prev=x;else if(/\n/.test(x))prev+='\n';
 });
 return{segs:out.map((x,i)=>[M.un(x),ch.has(i)?1:0]),n:ch.size};
}
async function loadDict(){
 const b=Uint8Array.from(atob(DZ),c=>c.charCodeAt(0));
 const stream=new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
 const words=(await new Response(stream).text()).split('\n');R=new Map();RB=[];
 words.forEach((word,index)=>{if(!word)return;R.set(word,index);(RB[word.length]??=[]).push(word)});
}
