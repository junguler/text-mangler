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
