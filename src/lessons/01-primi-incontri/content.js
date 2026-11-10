/* Lesson 1. Lesson data: vocabulary, tiles, routes, and the handbook chapter (LESSONS.push). */

const VOCAB1 = [
  { w:'ciao',       en:'hi / bye (informal)' },
  { w:'buongiorno', en:'good morning, hello (polite)' },
  { w:'come',       en:'how' },
  { w:'stai',       en:'(you) are, from stare' },
  { w:'sto',        en:'(I) am, from stare' },
  { w:'bene',       en:'well, fine' },
  { w:'grazie',     en:'thank you' },
  { w:'e',          en:'and' },
  { w:'tu',         en:'you (informal)' },
  { w:'mi',         en:'myself, me' },
  { w:'ti',         en:'yourself, you' },
  { w:'chiamo',     en:'(I) call' },
  { w:'chiami',     en:'(you) call' },
  { w:'piacere',    en:'nice to meet you (lit. “pleasure”)' },
];


/* The handbook chapter: dialogue, phrases, explanations, culture note, exercises. */
LESSONS.push({
    n:1, title:'Primi incontri', sub:'First meetings',
    dlgNote:'Anna and Luca meet for the first time at a café. Tap a speaker to hear each line.',
    dialogue:[
      ['Anna','Ciao!','Hi!'],
      ['Luca','Ciao! Come stai?','Hi! How are you?'],
      ['Anna','Sto bene, grazie. E tu?',"I'm fine, thanks. And you?"],
      ['Luca','Bene, grazie. Come ti chiami?',"Fine, thanks. What's your name?"],
      ['Anna','Mi chiamo Anna. E tu?','My name is Anna. And you?'],
      ['Luca','Mi chiamo Luca. Piacere!','My name is Luca. Nice to meet you!'],
      ['Anna','Piacere!','Nice to meet you!'],
    ],
    pitches:{ Anna:1.15, Luca:0.85 },
    phrasesTitle:'Key phrases',
    phrases:[
      ['Ciao!','Hi! / Bye!','Informal. Works for hello and goodbye.'],
      ['Buongiorno!','Good morning! / Hello!','Polite. For shops, strangers, older people.'],
      ['Come stai?','How are you?','Uses the informal “you”.'],
      ['Sto bene, grazie.',"I'm fine, thanks.",'Short version: Bene, grazie.'],
      ['E tu?','And you?','Bounces the question back.'],
      ['Come ti chiami?',"What's your name?",'Literally: How do you call yourself?'],
      ['Mi chiamo …','My name is …','Literally: I call myself …'],
      ['Piacere!','Nice to meet you!','Literally: Pleasure!'],
    ],
    how:`<p><b>Mi chiamo …</b> literally means “I call myself …”. To ask someone else, swap <b>mi</b> (myself) for <b>ti</b> (yourself): <b>Come ti chiami?</b></p>
      <p><b>Sto</b> and <b>stai</b> come from <i>stare</i>. <b>Io sto</b> means “I am”, <b>tu stai</b> means “you are”. Italians use <i>stare</i> to say how they feel.</p>
      <p>A question often uses the same words as a statement. Your voice rises at the end.</p>
      <p>Phrases chain together, so you can say several things at once: <b>Ciao! Mi chiamo Anna. Come ti chiami?</b></p>`,
    culture:`<p><b>Ciao</b> means both hello and goodbye, and it is informal: use it with friends, children and people your age. With strangers, shopkeepers and older people, say <b>Buongiorno</b> during the day and <b>Buonasera</b> from late afternoon. The polite <i>Come sta?</i> comes in Lezione 2.</p>
      <p>When meeting someone new, Italians usually shake hands and say <b>Piacere</b>. Friends often greet each other with a kiss on each cheek.</p>
      <p>The people in this piazza are about your age, so <b>Ciao</b> and <b>tu</b> are fine.</p>`,
    exercises:[
      { type:'mc', q:'Someone asks you “Come stai?”. What do you answer?', opts:['Mi chiamo Anna.','Sto bene, grazie.','Piacere!'], a:1,
        why:'“Come stai?” means “How are you?”, so you answer “Sto bene, grazie.”', nudge:'“Come stai?” asks how you are, not your name.' },
      { type:'order', q:'Introduce yourself. Tap the tiles in order.', en:'My name is {Me}.', tiles:['chiamo','{Me}','mi'], answer:'mi chiamo {me}',
        why:'Mi chiamo {Me}. Literally “I call myself {Me}”.', nudge:'Start with “mi” (myself).' },
      { type:'mc', q:'Fill the gap: “Come ___ chiami?”', en:"What's your name?", opts:['mi','ti','tu'], a:1,
        why:'Ti means “yourself”: Come ti chiami? is “How do you call yourself?”', nudge:'Mi is for yourself, as in “mi chiamo”. Which word means “yourself” when asking someone else?' },
      { type:'order', q:'Answer “Come stai?” and ask back.', en:"I'm fine, thanks. And you?", tiles:['tu','bene','e','sto','grazie'], answer:'sto bene grazie e tu',
        why:'Sto bene, grazie. E tu?', nudge:'Start with “sto” (I am) and finish with “e tu”.' },
      { type:'mc', q:'You walk into a bakery. The baker is an older woman you have never met. How do you greet her?', opts:['Ciao!','Buongiorno!'], a:1,
        why:'Buongiorno is the polite greeting for strangers, shopkeepers and older people. Save “Ciao” for friends and people your age.', nudge:'Ciao is informal. Think about who you are talking to.' },
    ],
    doneTitle:'Ottimo! Well done.', doneGo:'Go meet people',
  });
