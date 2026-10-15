'use strict';
function tallyAnswers(answers,data){
 if(answers.length!==data.questions.length||answers.some((a,i)=>!data.questions[i].options.some(o=>o.letter===a)))throw Error('Complete all six questions.');
 const counts={A:0,B:0,C:0,D:0};answers.forEach(a=>counts[a]++);
 const max=Math.max(...Object.values(counts));return {counts,winners:Object.keys(counts).filter(k=>counts[k]===max)};
}
if(typeof module!=='undefined')module.exports={tallyAnswers};
if(typeof document!=='undefined'){
 const data=window.QUIZ_DATA,answers=Array(data.questions.length).fill(null);let index=0;
 const $=id=>document.getElementById(id);
 function show(focus=false){
  $('quiz').hidden=false;$('results').hidden=true;$('count').textContent=`Question ${index+1} of ${data.questions.length}`;$('bar').style.width=`${(index+1)/data.questions.length*100}%`;
  $('intro').textContent=data.intro;$('question').textContent=data.questions[index].prompt;$('options').replaceChildren();
  data.questions[index].options.forEach(option=>{const label=document.createElement('label');label.className='answer';const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.value=option.letter;radio.checked=answers[index]===option.letter;radio.required=true;radio.addEventListener('change',()=>{answers[index]=option.letter;$('next').disabled=false;$('hint').textContent='Your choice is recorded.';});const text=document.createElement('span');const letter=document.createElement('span');letter.className='letter';letter.textContent=option.letter+'. ';text.append(letter,document.createTextNode(option.text));label.append(radio,text);$('options').append(label);});
  $('back').disabled=index===0;$('next').disabled=!answers[index];$('next').textContent=index===data.questions.length-1?'See my totals':'Next';$('hint').textContent=answers[index]?'Your choice is recorded.':'Choose one answer to continue.';if(focus)$('question').focus();
 }
 function results(){const {counts,winners}=tallyAnswers(answers,data);$('totals').replaceChildren();Object.entries(counts).forEach(([letter,count])=>{const div=document.createElement('div');div.className='total'+(winners.includes(letter)?' highest':'');div.textContent=letter;const strong=document.createElement('strong');strong.textContent=count;div.append(strong);if(winners.includes(letter)){const small=document.createElement('small');small.textContent='Highest';div.append(small);}$('totals').append(div);});$('tie-note').textContent=winners.length>1?`Your highest letters are tied: ${winners.join(', ')}. Keep all of them.`:`Your highest letter is ${winners[0]}.`;$('types').replaceChildren();winners.forEach(letter=>{const type=data.types[letter.charCodeAt(0)-65],div=document.createElement('div');div.className='type';const h=document.createElement('h3');h.textContent=letter+' · '+type.name;const p=document.createElement('p');p.textContent=type.description;div.append(h,p);$('types').append(div);});$('quiz').hidden=true;$('results').hidden=false;$('result-title').focus();}
 $('quiz-form').addEventListener('submit',e=>{e.preventDefault();if(!answers[index])return;if(index===data.questions.length-1)results();else{index++;show(true);}});$('back').addEventListener('click',()=>{if(index>0){index--;show(true);}});$('restart').addEventListener('click',()=>{answers.fill(null);index=0;show(true);});show();
}
