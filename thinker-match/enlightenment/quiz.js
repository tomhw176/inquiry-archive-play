'use strict';
function scoreAnswers(answers,data){
 if(answers.length!==data.questions.length||!data.questions.every((q,i)=>q.options.some(o=>o.type_id===answers[i])))throw new Error('Choose one approach for every situation.');
 const counts=Object.fromEntries(data.types.map(t=>[t.id,0]));answers.forEach(id=>counts[id]++);
 const maximum=Math.max(...Object.values(counts));return {counts,winners:data.types.filter(t=>counts[t.id]===maximum).map(t=>t.id)};
}
function orderedOptions(question,index){const offset=index%question.options.length;return question.options.slice(offset).concat(question.options.slice(0,offset));}
if(typeof module!=='undefined')module.exports={scoreAnswers,orderedOptions};
if(typeof document!=='undefined'){
 const data=window.QUIZ_DATA,$=id=>document.getElementById(id);const answers=Array(data.questions.length).fill(null);let index=0,editing=false;
 const typeById=id=>data.types.find(t=>t.id===id);
 const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
 function screen(id){['welcome','quiz','results'].forEach(x=>$(x).hidden=x!==id);}
 function moveToTop(element){element.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 function openQuestion(focus=true){
  const question=data.questions[index];screen('quiz');$('chapter').textContent=question.chapter;$('count').textContent=`${index+1} / ${data.questions.length}`;$('question-number').textContent=`Situation ${String(index+1).padStart(2,'0')}`;$('question').textContent=question.prompt;$('context').textContent=question.context;$('help-text').textContent=question.help;$('help').open=false;
  $('progress').replaceChildren(...data.questions.map((q,i)=>{const span=node('span',undefined,i===index?'current':(answers[i]?'done':''));span.title=`Situation ${i+1}${answers[i]?' answered':''}`;return span;}));
  $('options').replaceChildren();orderedOptions(question,index).forEach(option=>{
   const label=node('label',undefined,'answer'),input=document.createElement('input');input.type='radio';input.name='approach';input.value=option.type_id;input.checked=answers[index]===option.type_id;input.required=true;
   input.addEventListener('change',()=>{answers[index]=option.type_id;$('next').disabled=false;$('hint').textContent='Choice saved for this visit.';});label.append(input,node('strong',option.title),node('span',option.text,'answer-body'));$('options').append(label);
  });
  $('quiz-form').querySelector('fieldset').setAttribute('aria-labelledby','question');$('next').disabled=!answers[index];$('next').textContent=editing?'Update my match':index===data.questions.length-1?'See my match →':'Next →';$('back').textContent=editing?'← Back to my result':'← Back';$('hint').textContent=answers[index]?'Choice saved for this visit.':'Choose an approach.';
  if(focus)moveToTop($('question'));
 }
 function addProfile(type,counts){
  const article=node('article',undefined,'profile'),intro=node('div',undefined,'profile-intro'),body=node('div',undefined,'profile-body'),top=node('div',undefined,'profile-top');
  top.append(node('span',type.code,'code'),node('span',`${counts[type.id]} OF ${data.questions.length} CHOICES`,'eyebrow'));intro.append(top,node('h3',type.name),node('p',type.summary,'summary'));
  const tags=node('div',undefined,'tags');type.values.forEach(v=>tags.append(node('span',v)));intro.append(tags,node('p',type.reading_challenge,'reading-challenge'));
  [['In your club',type.in_group],['What this approach can offer',type.strength],['A trade-off to consider',type.tradeoff]].forEach(([h,p])=>body.append(node('h4',h),node('p',p)));
  const q=node('div',undefined,'question-to-keep');q.append(node('h4','A question to carry with you'),node('p',type.question));body.append(q);article.append(intro,body);return article;
 }
 function showResults(){
  const {counts,winners}=scoreAnswers(answers,data);screen('results');editing=false;
  const tied=winners.length>1;$('result-title').textContent=tied?'You have a shared top match.':typeById(winners[0]).name;
  $('result-intro').textContent=tied?`Your highest choices are tied: ${new Intl.ListFormat('en',{style:'long',type:'conjunction'}).format(winners.map(id=>typeById(id).name))}. Keep all of these matches.`:'This is the approach you chose most often. It is one part of the picture; your other choices matter too.';
  $('featured').replaceChildren(...winners.map(id=>addProfile(typeById(id),counts)));
  const mix=document.querySelector('.mix-panel');if(tied)$('results').insertBefore(mix,$('featured'));else $('results').insertBefore($('featured'),mix);
  $('breakdown').replaceChildren();
  data.types.forEach(type=>{
   const row=node('div',undefined,'score'+(winners.includes(type.id)?' top':'')),label=node('div',undefined,'score-label');label.append(node('span',`${type.code} · ${type.name}`),node('strong',`${counts[type.id]} / ${data.questions.length}`));const track=node('div',undefined,'score-track'),fill=node('div',undefined,'score-fill');fill.style.width=`${counts[type.id]/data.questions.length*100}%`;track.setAttribute('aria-hidden','true');track.append(fill);row.append(label,track);$('breakdown').append(row);
  });
  $('result-text').value=winners.map(id=>typeById(id).name).join('; ');$('copy-status').textContent='Paste or type these name(s) in the My quiz type(s) box on the first slide. Include every tied type.';
  if(tied){$('blend-note').textContent='Different situations brought different priorities to the top. Read each of your leading approaches and consider where you would use it.';}
  else {const others=data.types.filter(t=>!winners.includes(t.id)),second=Math.max(...others.map(t=>counts[t.id])),runners=others.filter(t=>counts[t.id]===second).map(t=>t.name);$('blend-note').textContent=second>0?`Your next most frequent choices leaned toward ${new Intl.ListFormat('en',{style:'long',type:'conjunction'}).format(runners)}. Look for where those priorities might support or challenge your leading approach.`:'You chose the same priority in all ten situations. Explore the other approaches below and consider one situation where you might choose differently.';}
  $('other-types').replaceChildren();data.types.forEach(type=>{const detail=document.createElement('details');detail.append(node('summary',`${type.code} · ${type.name} — ${counts[type.id]} choices`),addProfile(type,counts));$('other-types').append(detail);});
  $('review').hidden=true;$('review-toggle').setAttribute('aria-expanded','false');$('review-toggle').textContent='Review my choices';$('restart-confirm').hidden=true;moveToTop($('result-title'));
 }
 function showReview(){
  const opening=$('review').hidden;$('review').hidden=!opening;$('review-toggle').setAttribute('aria-expanded',String(opening));$('review-toggle').textContent=opening?'Hide my choices':'Review my choices';if(!opening)return;
  $('answer-list').replaceChildren();data.questions.forEach((q,i)=>{const option=q.options.find(o=>o.type_id===answers[i]),row=node('article'),copy=node('div');copy.append(node('h4',`${i+1}. ${q.prompt}`),node('p',`${option.title}. ${option.text}`));const edit=node('button','Change','text-button');edit.type='button';edit.setAttribute('aria-label',`Change answer ${i+1}: ${q.prompt}`);edit.addEventListener('click',()=>{index=i;editing=true;openQuestion();});row.append(copy,edit);$('answer-list').append(row);});$('review').scrollIntoView({block:'start',behavior:'instant'});
 }
 $('intro').textContent=data.intro;
 $('home').addEventListener('click',event=>{event.preventDefault();screen('welcome');$('start').textContent=answers.some(Boolean)?'Continue my quiz →':'Find my match →';window.scrollTo(0,0);});
 // Starting after a visit to the home screen resumes the first unanswered situation.
 $('start').addEventListener('click',()=>{index=answers.findIndex(a=>!a);if(index===-1)showResults();else openQuestion();});
 $('quiz-form').addEventListener('submit',event=>{event.preventDefault();if(!answers[index])return;if(editing||index===data.questions.length-1)showResults();else{index++;openQuestion();}});
 $('back').addEventListener('click',()=>{if(editing)showResults();else if(index>0){index--;openQuestion();}else screen('welcome');});
 $('copy-result').addEventListener('click',async()=>{const box=$('result-text');box.focus();box.select();try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(box.value);$('copy-status').textContent='Copied. Paste into the My quiz type(s) box on the first slide of your activity.';}catch(e){$('copy-status').textContent='Copy the selected type name(s), or type them in the My quiz type(s) box on the first slide.';}});
 $('review-toggle').addEventListener('click',showReview);$('restart').addEventListener('click',()=>{$('restart-confirm').hidden=false;$('restart-yes').focus();});$('restart-no').addEventListener('click',()=>{$('restart-confirm').hidden=true;$('restart').focus();});$('restart-yes').addEventListener('click',()=>{answers.fill(null);index=0;editing=false;openQuestion();});
}
