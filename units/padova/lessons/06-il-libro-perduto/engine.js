/* Lesson 6. The typed scripts: each NPC conversation is a list of sentences to translate (see conversation/typing.js). */

/* =========================================================
   LESSON 6: the missing handbook. Typed translation tasks.
   ========================================================= */
Object.assign(TYPED_SCRIPTS, {
  enzo:{
    tut:'l6-order', modelAfter:2, companion:true,
    companionIntro:'A cappuccino and a pastry for me, please! Any pastry. Surprise me.',
    opening:{ it:'Buongiorno, {Me}! Cosa prende?', en:'Good morning, {Me}! What will you have?' },
    steps:[
      { en:'For him, a cappuccino and a croissant, please.', model:'Per lui, un cappuccino e un cornetto, per favore.',
        check(ints){
          const items = ITEMS_OF(ints);
          if (!items.includes('cappuccino')) return 'Mark wants a <b>cappuccino</b>: <i>un cappuccino</i>.';
          if (!items.some(w => ITEM[w].kind === 'pastry')) return 'Mark also wants a pastry: <b>un cornetto</b> (or un bombolone, una sfogliatella).';
          if (has(ints, 'want:me') && !has(ints, 'subj:him')) return '<b>Vorrei</b> means “I would like”. It\'s for Mark: <b>per lui</b> or <b>lui vorrebbe</b>.';
          if (!has(ints, 'subj:him', 'want:him', 'pron:him')) return 'It\'s for Mark, so say who it\'s for: start with <b>per lui</b>.';
          return true;
        },
        reply(ints){ S.l6.order = ITEMS_OF(ints); const o = S.l6.order;
          return [{ it:'Un cappuccino? Alle quattro del pomeriggio?', en:'A cappuccino? At four in the afternoon?' },
                  { it:`Va bene, va bene… è per il Suo amico inglese! ${orderIt(o)} Altro?`, en:`All right, all right… it's for your English friend! ${orderEn(o)} Anything else?` }]; },
        aside:"Ha! I know, I know: no cappuccino after lunch. I'm a tourist, let me live." },
      { en:'No, thanks. How much is it?', model:"No, grazie. Quant'è?",
        check(ints){ if (!has(ints, 'no')) return 'First answer “Altro?”: <b>no, grazie</b>.'; if (!has(ints, 'how_much')) return 'Then ask the price: <b>quant\'è?</b>'; return true; },
        reply(){ const p = priceOf(S.l6.order || ['cappuccino','cornetto']); return [{ it:`Ecco! ${priceIt(p)}`, en:`Here you go! That's ${euroEn(p)}.` }]; } },
      { en:'Thank you!', model:'Grazie!',
        check(ints){ return has(ints, 'thanks') || 'Just say thank you: <b>grazie</b>.'; },
        reply(){ return [{ it:'Prego! Buona giornata!', en:"You're welcome! Have a nice day!" }]; },
        aside:"Perfect. Now go and find that book! Emma and I will be right here." },
    ],
    done(){ S.l6.orderDone = true; save(); },
  },
  chiara:{
    tut:'l6-chiara', modelAfter:2,
    opening:{ it:'Ciao, {Me}!', en:'Hi, {Me}!' },
    steps:[
      { en:"Hi Chiara! I'm looking for my book.", model:'Ciao Chiara! Cerco il mio libro.',
        check(ints){ if (!has(ints, 'look')) return '“I\'m looking for” is <b>cerco</b>.'; if (!has(ints, 'book')) return '“my book” is <b>il mio libro</b>.'; return true; },
        reply(){ return [{ it:'Il tuo libro? Com\'è?', en:"Your book? What's it like?" }]; } },
      { en:"It's a blue book. Do you know where it is?", model:"È un libro blu. Sai dov'è?",
        check(ints){
          if (has(ints, 'know:lei')) return 'Chiara is a friend: <b>sai</b>, not sa.';
          if (!has(ints, 'blue')) return '“blue” is <b>blu</b>: <i>è un libro blu</i>.';
          if (!has(ints, 'know:tu')) return '“Do you know” to a friend is <b>sai</b>.';
          if (!has(ints, 'where')) return '“where it is” is <b>dov\'è</b>.';
          return true; },
        reply(){ return [{ it:'Un libro blu? Mmm… no, non lo so. Mi dispiace!', en:"A blue book? Hmm… no, I don't know. I'm sorry!" },
                         { it:'Forse a San Lorenzo? Chiedi a Rosa: lei vede tutto!', en:'Maybe in San Lorenzo? Ask Rosa: she sees everything!' }]; } },
      { en:'Thanks a lot!', model:'Grazie mille!',
        check(ints){ return has(ints, 'thanks') || '“Thanks a lot” is <b>grazie mille</b>.'; },
        reply(){ return [{ it:'Prego! In bocca al lupo!', en:"You're welcome! Good luck! (literally: into the wolf's mouth)" }]; } },
    ],
    done(){},
  },
  rosa:{
    tut:'l6-rosa', modelAfter:3,
    opening:{ it:'Oh! Buongiorno, {Me}!', en:'Oh! Good morning, {Me}!' },
    steps:[
      { en:"Good morning, Mrs Rosa! I'm looking for my book.", model:'Buongiorno, signora Rosa! Cerco il mio libro.',
        check(ints, words){
          if (words.includes('ciao')) return 'Rosa is older and you hardly know her: <b>buongiorno</b>, not ciao.';
          if (!words.includes('buongiorno')) return '“Good morning” is <b>buongiorno</b>.';
          if (!has(ints, 'look')) return '“I\'m looking for” is <b>cerco</b>.'; if (!has(ints, 'book')) return '“my book” is <b>il mio libro</b>.'; return true; },
        reply(){ return [{ it:'Un libro? Com\'è?', en:"A book? What's it like?" }]; } },
      { en:"It's a blue book. Do you know where it is?", model:"È un libro blu. Sa dov'è?",
        check(ints){
          if (has(ints, 'know:tu')) return 'Rosa gets the polite form: <b>sa</b>, not sai.';
          if (!has(ints, 'blue')) return '“blue” is <b>blu</b>.';
          if (!has(ints, 'know:lei')) return '“Do you know”, politely, is <b>sa</b>.';
          if (!has(ints, 'where')) return '“where it is” is <b>dov\'è</b>.';
          return true; },
        reply(){ return [{ it:'Un libro blu… Sì! Ho visto una ragazza con un libro blu, vicino alla statua di Gattamelata.', en:'A blue book… Yes! I saw a girl with a blue book, near the Gattamelata statue.' },
                         { it:'Vada a Piazza del Santo!', en:'Go to Piazza del Santo!' }]; } },
      { en:'Thank you very much!', model:'Grazie mille!',
        check(ints){ return has(ints, 'thanks') || '“Thank you very much” is <b>grazie mille</b>.'; },
        reply(){ return [{ it:'Prego! Buona fortuna!', en:"You're welcome! Good luck!" }]; } },
    ],
    done(){},
  },
  lucia:{
    tut:'l6-lucia', modelAfter:3,
    opening:{ it:'Oh! Buongiorno, {Me}! Di nuovo qui?', en:'Oh! Good morning, {Me}! Back again?' },
    steps:[
      { en:'Good morning, Lucia! Do you have my book?', model:'Buongiorno, Lucia! Ha il mio libro?',
        check(ints, words){
          if (has(ints, 'have:tu')) return 'Lucia gets the polite form: <b>ha</b>, not hai.';
          if (has(ints, 'have')) return '<b>Avete</b> is for a group. One person, politely: <b>ha</b>.';
          if (!words.includes('buongiorno')) return '“Good morning” is <b>buongiorno</b>.';
          if (!has(ints, 'have:lei')) return '“Do you have”, politely, is <b>ha</b>.';
          if (!has(ints, 'book')) return '“my book” is <b>il mio libro</b>.';
          return true; },
        reply(){ return [{ it:'Il Suo libro blu? No, non ho il libro, mi dispiace.', en:"Your blue book? No, I don't have the book, I'm sorry." },
                         { it:'Ma… quel signore sulla panchina ha un libro blu!', en:'But… that gentleman on the bench has a blue book!' }]; } },
      { en:'Thank you, Lucia!', model:'Grazie, Lucia!',
        check(ints){ return has(ints, 'thanks') || 'Just say thank you: <b>grazie</b>.'; },
        reply(){ return [{ it:'Prego! Buona fortuna!', en:"You're welcome! Good luck!" }]; } },
    ],
    done(){},
  },
  bruno:{
    tut:'l6-man', modelAfter:3,
    opening:{ it:'…', en:'(He is reading a blue book and chuckling to himself.)' },
    steps:[
      { en:'Good morning, sir! How are you?', model:'Buongiorno, signore! Come sta?',
        check(ints, words){
          if (words.includes('ciao')) return 'He is a stranger: <b>buongiorno</b>, not ciao.';
          if (!words.includes('buongiorno')) return '“Good morning” is <b>buongiorno</b>.';
          if (words.includes('stai')) return '“Come stai?” is for friends. To a stranger: <b>Come sta?</b>';
          if (!has(ints, 'ask_how')) return '“How are you?”, politely, is <b>come sta?</b>';
          return true; },
        reply(){ return [{ it:'Oh! Buongiorno! Bene, grazie. E Lei?', en:'Oh! Good morning! Fine, thanks. And you?' }]; } },
      { en:"I'm fine, thanks.", model:'Sto bene, grazie.',
        check(ints){ return has(ints, 'answer_how') || '“I\'m fine, thanks” is <b>sto bene, grazie</b>.'; },
        reply(){ return [{ it:'Bene, bene.', en:'Good, good.' },
                         { sys:'He goes back to his book. A <b>blue</b> book… with a ribbon bookmark, and your name on the first page. It\'s <b>your handbook</b>!' }]; } },
      { en:'Excuse me, sir. This is my book!', model:'Scusi, signore. Questo è il mio libro!',
        check(ints, words){
          if (words.includes('scusa')) return 'He is a stranger: <b>scusi</b>, not scusa.';
          if (has(ints, 'this:f')) return '<i>Libro</i> is masculine: <b>questo</b> è il mio libro.';
          if (!has(ints, 'excuse')) return '“Excuse me” to a stranger is <b>scusi</b>.';
          if (!has(ints, 'book')) return '“my book” is <b>il mio libro</b>.';
          if (!has(ints, 'this:m', 'is:him')) return '“This is” is <b>questo è</b>.';
          return true; },
        reply(){ return [{ it:'Il Suo libro? Davvero? Come si chiama?', en:"Your book? Really? What's your name?" }]; } },
      { en:'My name is {Me}.', model:'Mi chiamo {Me}.',
        check(ints){ return has(ints, 'give_name') || '“My name is” is <b>mi chiamo</b>.'; },
        reply(){ S.met.bruno = true; return [{ it:'Vediamo… “Questo libro è di {Me}.” È vero! È il Suo.', en:"Let's see… “This book belongs to {Me}.” It's true! It's yours." },
                         { it:"Ma… io imparo l'inglese con questo libro!", en:"But… I'm learning English with this book!" },
                         { it:'My name is Bruno. Do you speak English?', en:'(He says this in English, slowly and very proudly.)', reveal:true }]; } },
      { en:"Yes! My friend Mark is English. He doesn't speak Italian.", model:'Sì! Il mio amico Mark è inglese. Non parla italiano.',
        check(ints){
          if (has(ints, 'myfriend:f')) return 'Mark is a man: <b>il mio amico</b>.';
          if (!has(ints, 'name:mark')) return 'Mention Mark: <b>il mio amico Mark</b>.';
          if (!has(ints, 'english')) return '“is English” is <b>è inglese</b>.';
          if (!has(ints, 'noitalian')) return '“He doesn\'t speak Italian” is <b>non parla italiano</b>.';
          return true; },
        reply(){ return [{ it:'Un inglese vero? Perfetto!', en:'A real English person? Perfect!' },
                         { it:"Dov'è il Suo amico? Andiamo!", en:"Where is your friend? Let's go!" }]; } },
    ],
    done(){ S.brunoFollow = true; trail.length = 0; save(); },
  },
  bruno2:{
    npc:'bruno', tut:'l6-bring', scene:'piazza', modelAfter:3, companion:true,
    opening:{ it:"Allora, dov'è il Suo amico? … Ah! È lui?", en:'So, where is your friend? … Ah! Is that him?' },
    companionIntro:"Hey, you're back! Who's this? And why is he holding your handbook?",
    steps:[
      { en:'Bruno, this is my friend Mark.', model:'Bruno, Le presento il mio amico Mark.',
        check(ints){
          if (has(ints, 'this:f', 'myfriend:f')) return 'Mark is a man: <b>questo è</b>, <b>il mio amico</b>.';
          if (has(ints, 'intro:ti')) return 'Bruno is a stranger: <b>Le presento</b>, not ti presento.';
          if (!has(ints, 'name:mark')) return 'Say Mark\'s name: <b>il mio amico Mark</b>.';
          if (!has(ints, 'intro:le', 'this:m', 'myfriend:m', 'heis')) return '“This is my friend” is <b>questo è il mio amico</b>, or politely <b>Le presento il mio amico</b>.';
          return true; },
        reply(){ return [{ it:'Piacere, Mark! My friend!', en:'Nice to meet you, Mark! (“My friend” in English, beaming.)' }]; },
        aside:'Nice to meet you, Bruno! … Wait, you speak English?',
        after(){ S.handbookLost = false; save(); toast('<b>Handbook recovered!</b> Every chapter is back.');
          return [{ it:"A little! Io insegno l'italiano a Mark, e Mark insegna l'inglese a me!", en:'A little! I teach Mark Italian, and Mark teaches me English!' },
                  { it:'Ecco il Suo libro. Grazie!', en:"Here's your book. Thank you!" }]; } },
      { en:'Thank you very much, Bruno! Goodbye!', model:'Grazie mille, Bruno! Arrivederci!',
        check(ints, words){
          if (!has(ints, 'thanks')) return '“Thank you very much” is <b>grazie mille</b>.';
          if (words.includes('ciao') && !has(ints, 'bye')) return 'Bruno is a stranger: <b>arrivederci</b>, not ciao.';
          if (!has(ints, 'bye')) return '“Goodbye” to a stranger is <b>arrivederci</b>.';
          return true; },
        reply(){ return [{ it:'Arrivederci! E grazie, professore!', en:'Goodbye! And thank you, teacher!' }]; },
        aside:"So I have an Italian teacher now. Arrivederci! … Did I say that right?" },
    ],
    done(){ S.brunoFollow = false; save(); },
  },
});
