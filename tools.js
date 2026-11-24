/* ---- tone, cleanup, tools, readability, diff ---- */
const CF=[["hello","hey"],["yes","yeah"],["children","kids"],["very","super"],["father","dad"],["mother","mom"],["friend","buddy"],["terrible","awful"],["excellent","awesome"],["incorrect","wrong"]];
const capw=s=>s?s[0].toUpperCase()+s.slice(1):s;
function tone(t,p,mode,r,q){
 const M=mask(t,q);let x=M.t;p/=100;
 const A=mode==='formal'?[{re:/\b\w+n't\b|\b(?:it|that|there|what)'s\b|\b(?:I|you|they|we)'(?:m|re|ve|ll)\b/gi,f:m=>GROW_C(m[0])},tbl(rev(PL)),tbl(rev(WL)),tbl(CF.map(([a,b])=>[b,a])),tbl(SY.filter(p=>!['help','because','end','show','make','use','get','need'].includes(p[0]))),{re:/!+/g,f:()=>'.'}]
  :mode==='casual'?[tbl(CT),tbl(CF),tbl(PL),tbl(WL),tbl(rev(SY)),tbl(WM)]
  :[tbl(rev(SY)),tbl(PH),{re:/ ?\([^()\n]*\)/g,f:()=>''},{re:/,\s+(?:and|but|so)\s+/gi,f:m=>'. '+capw(m[0].replace(/^,\s+/,''))}];
 A.forEach((P,i)=>{const pr=Math.min(1,Math.max(0,(p*1.25-i*.14)/.3));if(pr<=0)return;x=x.replace(P.re,m=>r()<pr?(P.f([m])??m):m)});
 x=x.replace(/\b(a|an) (\w+)/gi,(m,a,w)=>{const n=(/^[aeiou]/i.test(w)&&!/^(uni|use|eu|one)/i.test(w))||/^(hour|honest|heir|honor)/i.test(w)?'an':'a';return a.toLowerCase()===n?m:mc(n,a)+' '+w});
 return{segs:[[M.un(x.replace(/ {2,}/g,' ')),0]]}}
function cleanup(t,q){const M=mask(t,q);let x=M.t,n=0;
 const c=(re,f)=>{x=x.replace(re,(...a)=>{const o=f(...a);if(o!==a[0])n++;return o})};
 c(/\b([A-Za-z']+)(?:\s+\1\b)+/gi,(m,a)=>a);
 c(/[ \t]+([,.!?;:])/g,(m,a)=>a);
 c(/([,;:])(?=[A-Za-z])/g,m=>m+' ');
 c(/([.!?])(?=[A-Z][a-z])/g,m=>m+' ');
 c(/[ \t]{2,}/g,()=>' ');
 c(/[ \t]+$/gm,()=>'');
 c(/\b[A-Za-z]{3,}[.!?](?=(?:we|i|the|it|this|that|please|maybe|then|so|and|but|my|our|you|they|he|she|there|what|if|when|thanks)\b)/g,m=>m+' ');
 c(/\bi\b(?!\.)/g,()=>'I');
 c(/(^|[.!?]\s+|\n[ \t]*)([a-z])/g,(m,a,b)=>a+b.toUpperCase());
 return{segs:[[M.un(x),0]],n}}
const MORSE={a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',i:'..',j:'.---',k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',q:'--.-',r:'.-.',s:'...',t:'-',u:'..-',v:'...-',w:'.--',x:'-..-',y:'-.--',z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'};
const NATO='Alpha Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliet Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey Xray Yankee Zulu'.split(' ');
const TOOLS={
 upper:['UPPER CASE',s=>s.toUpperCase(),1],
 lower:['lower case',s=>s.toLowerCase(),1],
 title:['Title Case',s=>s.toLowerCase().replace(/(^|[\s"(\[-])([a-z])/g,(m,a,b)=>a+b.toUpperCase()).replace(/ (A|An|And|But|Or|Nor|The|Of|In|On|At|To|For|By)(?= )/g,m=>m.toLowerCase()),1],
 sentence:['Sentence case',s=>s.toLowerCase().replace(/(^|[.!?]\s+|\n\s*)([a-z])/g,(m,a,b)=>a+b.toUpperCase()).replace(/\bi\b/g,'I'),1],
 alt:['aLtErNaTiNg',s=>{let k=0;return s.replace(/[A-Za-z]/g,c=>k++%2?c.toUpperCase():c.toLowerCase())},1],
 rev:['Reverse text',s=>[...s].reverse().join(''),0],
 revw:['Reverse word order',s=>s.split(/(\s+)/).reverse().join(''),0],
 revx:['Reverse each word',s=>s.replace(/\p{L}+/gu,w=>[...w].reverse().join('')),0],
 leet:['L33tspeak',s=>s.replace(/[aeiost]/gi,c=>({a:4,e:3,i:1,o:0,s:5,t:7})[c.toLowerCase()]),1],
 pig:['Pig Latin',s=>s.replace(/[A-Za-z]+/g,w=>{const l=w.toLowerCase();return mc(/^[aeiou]/.test(l)?l+'way':l.replace(/^([^aeiou]+)(.*)$/,'$2$1ay'),w)}),1],
 morse:['Morse code',s=>s.toLowerCase().split('').map(c=>c===' '?'/':c==='\n'?'\n':MORSE[c]||'').filter(x=>x!=='').join(' '),0],
 nato:['NATO alphabet',s=>s.replace(/[A-Za-z]/g,c=>NATO[c.toLowerCase().charCodeAt(0)-97]+' '),0],
 zalgo:['Zalgo',(s,r)=>s.replace(/\p{L}/gu,c=>c+Array.from({length:3},()=>String.fromCharCode(0x300+Math.floor(r()*70))).join('')),1],
 nolines:['Remove line breaks',s=>s.replace(/\s*\n+\s*/g,' ').trim(),0],
 sort:['Sort lines A-Z',s=>s.split('\n').sort((a,b)=>a.localeCompare(b)).join('\n'),0],
 dedupe:['Remove duplicate lines',s=>[...new Set(s.split('\n'))].join('\n'),0]
};
const useTool=(k,t,r,q)=>{const T=TOOLS[k]||TOOLS.upper;if(!T[2])return{segs:[[T[1](t,r),0]]};const M=mask(t,q);return{segs:[[M.un(T[1](M.t,r)),0]]}};
const syl=w=>{w=w.toLowerCase().replace(/[^a-z]/g,'');if(!w)return 0;if(w.length<=3)return 1;const m=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'').match(/[aeiouy]{1,2}/g);return Math.max(1,m?m.length:1)};
function readInfo(s){const w=s.match(/[A-Za-z']+/g)||[];if(w.length<5)return'';const sn=Math.max(1,(s.match(/[.!?]+(\s|$)/g)||[]).length),sy=w.reduce((a,x)=>a+syl(x),0),fl=Math.round(206.835-1.015*w.length/sn-84.6*sy/w.length),sec=Math.round(w.length/200*60);return` | readability ${Math.max(0,Math.min(100,fl))}/100 | ~${sec<60?sec+'s':Math.round(sec/60)+' min'} read`}
function diffMarks(a,b){const A=a.match(/\S+/g)||[],B=b.match(/\S+/g)||[],m=A.length,n=B.length;if(m*n>4e6)return null;
 const T=Array.from({length:m+1},()=>new Uint16Array(n+1));
 for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)T[i][j]=A[i]===B[j]?T[i+1][j+1]+1:Math.max(T[i+1][j],T[i][j+1]);
 const keep=new Set();let i=0,j=0;while(i<m&&j<n){if(A[i]===B[j]){keep.add(j);i++;j++}else if(T[i+1][j]>=T[i][j+1])i++;else j++}
 return{keep}}

/* ---- more tools ---- [name, fn(text, rng), protect links/numbers/quotes first (1) or not (0)] ---- */
const TW=s=>s.replace(/([\p{Ll}\d])(\p{Lu})/gu,'$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean).map(w=>w.toLowerCase());
const perLine=f=>s=>s.split('\n').map(f).join('\n');
const cap1=w=>w[0].toUpperCase()+w.slice(1);
const fancy=(s,A,a,d)=>Array.from(s,c=>{const k=c.codePointAt(0);return k>=65&&k<=90?String.fromCodePoint(A+k-65):k>=97&&k<=122?String.fromCodePoint(a+k-97):d&&k>=48&&k<=57?String.fromCodePoint(d+k-48):c}).join('');
const FLIPU={a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',m:'ɯ',n:'u',p:'d',q:'b',r:'ɹ',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',y:'ʎ','.':'˙',',':"'",'?':'¿','!':'¡','(':')',')':'(','[':']',']':'[','{':'}','}':'{','<':'>','>':'<','&':'⅋','_':'‾',A:'∀',C:'Ɔ',E:'Ǝ',F:'Ⅎ',G:'פ',J:'ſ',L:'˥',M:'W',P:'Ԁ',R:'ᴚ',T:'┴',U:'∩',V:'Λ',W:'M',Y:'⅄'};
const bytesOf=s=>Array.from(new TextEncoder().encode(s));
const b64e=s=>{const b=new TextEncoder().encode(s);let x='';for(let i=0;i<b.length;i+=8192)x+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(x)};
const b64d=s=>{try{const b=atob(s.replace(/\s+/g,''));return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(b,c=>c.charCodeAt(0)))}catch(e){return '(not valid Base64 text)'}};
const rot=(s,f)=>s.replace(/[a-z]/gi,c=>{const b=c<'a'?65:97;return String.fromCharCode(f(c.charCodeAt(0)-b)+b)});
const wrapAt=(l,n)=>{const o=[];let cur='';l.split(/\s+/).filter(Boolean).forEach(w=>{if(cur&&(cur+' '+w).length>n){o.push(cur);cur=w}else cur=cur?cur+' '+w:w});if(cur)o.push(cur);return o.join('\n')};
Object.assign(TOOLS,{
 swap:['sWAP cASE',s=>Array.from(s,c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join(''),1],
 camel:['camelCase',perLine(l=>TW(l).map((w,i)=>i?cap1(w):w).join('')),0],
 pascal:['PascalCase',perLine(l=>TW(l).map(cap1).join('')),0],
 snake:['snake_case',perLine(l=>TW(l).join('_')),0],
 kebab:['kebab-case',perLine(l=>TW(l).join('-')),0],
 slug:['URL slug',perLine(l=>TW(l.normalize('NFD').replace(/\p{M}+/gu,'')).join('-')),0],
 flip:['Upside down',perLine(l=>Array.from(l).reverse().map(c=>FLIPU[c]||c).join('')),0],
 bold:['Bold (Unicode)',s=>fancy(s,0x1D5D4,0x1D5EE,0x1D7EC),1],
 italic:['Italic (Unicode)',s=>fancy(s,0x1D608,0x1D622,0),1],
 mono:['Monospace (Unicode)',s=>fancy(s,0x1D670,0x1D68A,0x1D7F6),1],
 wide:['Ｆｕｌｌｗｉｄｔｈ',s=>Array.from(s,c=>{const k=c.codePointAt(0);return k===32?'\u3000':k>32&&k<127?String.fromCodePoint(k+0xFEE0):c}).join(''),1],
 bubble:['Ⓑⓤⓑⓑⓛⓔ',s=>Array.from(s,c=>{const k=c.codePointAt(0);return k>=65&&k<=90?String.fromCodePoint(0x24B6+k-65):k>=97&&k<=122?String.fromCodePoint(0x24D0+k-97):k>=49&&k<=57?String.fromCodePoint(0x2460+k-49):k===48?'\u24EA':c}).join(''),1],
 strike:['S̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶',s=>Array.from(s,c=>/\s/.test(c)?c:c+'\u0336').join(''),1],
 under:['U̲n̲d̲e̲r̲l̲i̲n̲e̲',s=>Array.from(s,c=>/\s/.test(c)?c:c+'\u0332').join(''),1],
 clap:['Clap 👏 between 👏 words',s=>s.replace(/ +/g,' 👏 '),1],
 spaced:['S p a c e d  o u t',s=>s.split(/(\s+)/).map(p=>/^\s+$/.test(p)?(p.includes('\n')?p:'  '+p+'  '):Array.from(p).join(' ')).join(''),1],
 vowels:['Remove vowels',s=>s.replace(/\p{L}+/gu,w=>w[0]+w.slice(1).replace(/[aeiou]/gi,'')),1],
 bin:['Text to binary',s=>bytesOf(s).map(b=>b.toString(2).padStart(8,'0')).join(' '),0],
 hex:['Text to hex',s=>bytesOf(s).map(b=>b.toString(16).padStart(2,'0')).join(' '),0],
 b64:['Base64 encode',b64e,0],
 b64d:['Base64 decode',b64d,0],
 urlenc:['URL encode',s=>encodeURIComponent(s),0],
 html:['HTML escape',s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),0],
 rot13:['ROT13',s=>rot(s,i=>(i+13)%26),0],
 atbash:['Atbash (A=Z)',s=>rot(s,i=>25-i),0],
 sortz:['Sort lines Z-A',s=>s.split('\n').sort((a,b)=>b.localeCompare(a)).join('\n'),0],
 sortn:['Sort lines by number',s=>s.split('\n').sort((a,b)=>{const x=parseFloat(a),y=parseFloat(b);return isNaN(x)||isNaN(y)?(isNaN(x)-isNaN(y))||a.localeCompare(b):x-y}).join('\n'),0],
 revl:['Reverse line order',s=>s.split('\n').reverse().join('\n'),0],
 shuffle:['Shuffle lines',(s,r)=>{const a=s.split('\n');for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.join('\n')},0],
 noblank:['Remove empty lines',s=>s.split('\n').filter(l=>l.trim()).join('\n'),0],
 trim:['Trim and tidy lines',s=>s.split('\n').map(l=>l.replace(/[ \t]+$/,'')).join('\n').replace(/\n{3,}/g,'\n\n').trim(),0],
 nums:['Number the lines',s=>s.split('\n').map((l,i)=>(i+1)+'. '+l).join('\n'),0],
 bullets:['Bullet the lines',s=>s.split('\n').map(l=>l.trim()?'\u2022 '+l:l).join('\n'),0],
 wrap:['Wrap at 72 columns',s=>s.split('\n').map(l=>wrapAt(l,72)).join('\n'),0],
 unwrap:['Join wrapped lines',s=>s.replace(/(?<!\n)\n(?!\n)/g,' '),0],
 freq:['Word frequency',s=>{const m=new Map();(s.toLowerCase().match(/[\p{L}\p{N}'\u2019]+/gu)||[]).forEach(w=>m.set(w,(m.get(w)||0)+1));return [...m].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,50).map(([w,n])=>n+'  '+w).join('\n')},0],
 acro:['Acronym from words',perLine(l=>(l.match(/[\p{L}\p{N}]+/gu)||[]).map(w=>w[0].toUpperCase()).join('')),0]
});
/* how the Tool dropdown is grouped (any tool missing here lands in "Other") */
const TG={Case:['upper','lower','title','sentence','alt','swap','camel','pascal','snake','kebab','slug'],
 Reverse:['rev','revw','revx','flip'],
 Style:['bold','italic','mono','wide','bubble','strike','under','clap','spaced','zalgo','leet','pig','vowels'],
 Encode:['morse','nato','bin','hex','b64','b64d','urlenc','html','rot13','atbash'],
 Lines:['nolines','sort','sortz','sortn','revl','shuffle','dedupe','noblank','trim','nums','bullets','wrap','unwrap'],
 Analyze:['freq','acro']};
