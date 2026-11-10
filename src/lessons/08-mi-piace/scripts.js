/* Lesson 8 · Mi piace! The typed scenes: translating for Mark (conversation/typing.js, companion scripts).
   Mark says what he wants in English (lead), the player types it in Italian; CHOICE steps tell Mark what was said;
   the buying scene puts the price and the change in Mark's notepad (wait + askNumber).
   Every word typed here must be in the parser: see the phrases hook in stalls.js.
   Hints (check() messages) follow CLAUDE.md: they say what is missing in English, correct the player's own words
   (piccolo → piccola, ti → Le), or point to the handbook / dictionary; the model sentence itself comes only after
   modelAfter misses (conversation/typing.js). */

/* Mark's notepad inside a typed scene: write what Teresa said. right → next(); wrong → she says it again slowly,
   the second time the text is revealed. */
function l8TypedPad({ label, value, line, tip, right }){
  return next => {
    let wrong = 0;
    askNumber({ label, tip, onAnswer(x){
      if (!convo) return true;
      if (x === value){ revealListen({ all:true }); right(); setTimeout(next, 0); return true; }
      wrong++;
      sysLine(`You write <b>€ ${x}</b>.`);
      if (wrong === 1){
        companionLine(label === 'il resto' ? "Hmm, that's not what I count. Listen again." : "Hmm, that's not what I wrote this morning. Listen again.");
        npcLine('Sì, certo!', 'Yes, of course!');
        npcLine(line.it, line.en, { listen:true, rate:0.7 });
      } else {
        revealListen({ all:true });
        companionLine('Look, you can read it now. The numbers are in your dictionary.');
      }
      return false;
    } });
  };
}

Object.assign(TYPED_SCRIPTS, {
  /* 5 · the fitting */
  teresa_fitting:{
    npc:'teresa', tut:'l8-fitting', scene:'mercato', modelAfter:2, companion:true,
    opening:{ it:'Ecco la maglietta! Il camerino è lì, dietro la tenda.', en:"Here's the T-shirt! The changing room is there, behind the curtain." },
    reopening:{ it:'Allora? Come va?', en:'So? How is it going?' },
    companionIntro:'Behind the curtain? Right. One second…',
    steps:[
      { lead:"It's too small! Does she have a bigger one?",
        en:"It's too small. Do you have a bigger size?", model:'È troppo piccola. Ha una taglia più grande?',
        check(ints){
          if (has(ints, 'size:piccolo')) return '<i>Maglietta</i> is feminine: <b>piccola</b>, not piccolo.';
          if (has(ints, 'have:tu')) return 'Teresa is a stranger: <b>ha</b>, not hai.';
          if (!has(ints, 'too')) return 'Say it\'s <i>too</i> small: “too” is missing. Look it up in the dictionary.';
          if (!has(ints, 'size:piccola')) return 'Say it\'s too <i>small</i>. Remember: la maglietta is feminine.';
          if (!has(ints, 'bigger', 'size:xl')) return 'Then ask if she has a bigger size.';
          return true; },
        reply(){ S.l8.wearing = 'red'; save();
          return [{ it:'Troppo piccola? Mi dispiace! Più grande… sì, ecco la extra large.', en:"Too small? I'm sorry! Bigger… yes, here's the extra large." },
                  { sys:'Mark disappears behind the curtain again… and comes out in the extra large.' },
                  { it:'Oh! Le sta benissimo!', en:'Oh! It really suits you!', noEn:true }]; } },
      { choice:{ prompt:"What's she saying?", line:{ it:'Oh! Le sta benissimo!', en:'Oh! It really suits you!' },
          onPick(o){ if (!o.correct){ S.l8.choiceWrong++; save(); } },
          options:[
            { label:"She says it's too big." },
            { label:'She says it looks great on you.', correct:true },
            { label:"She says it's sold out." },
          ] } },
      { lead:"She'd say that about a potato sack. Ask her if she really likes it.",
        en:'Do you really like it?', model:'Le piace davvero?',
        check(ints){
          if (has(ints, 'like:ti')) return 'Teresa is a stranger: <b>Le</b> piace, not ti piace.';
          if (has(ints, 'like:me')) return '<b>Mi</b> piace is “I like”. Asking her, politely: <b>Le piace?</b>';
          if (!has(ints, 'like:le')) return 'Ask if <i>she</i> likes it, politely (Lei). The handbook\'s <i>What you say</i> has it.';
          if (!has(ints, 'really')) return 'Don\'t forget “really”: look it up in the dictionary.';
          return true; },
        reply(){ return [{ it:'Certo! Il rosso Le sta benissimo!', en:'Of course! Red really suits you!' }]; },
        mark:"I need an honest opinion. … Isn't that Lucia over there, sketching?" },
    ],
    done(){ S.l8.fitDone = true; save(); },
  },

  /* 6 · the honest opinion */
  lucia_opinion:{
    npc:'lucia', tut:'l8-lucia', scene:'mercato', modelAfter:2, companion:true,
    opening:{ it:'…', en:"(She is sketching the market and hasn't noticed you.)" },
    reopening:{ it:'Sì? Mi dica.', en:'Yes? Go ahead.' },
    steps:[
      { lead:"There she is. Say hi to her, ask how she is.",
        en:'Good morning, Lucia! How are you?', model:'Buongiorno, Lucia! Come sta?',
        check(ints, words){
          if (words.includes('ciao')) return 'Lucia is still a stranger: <b>buongiorno</b>, not ciao.';
          if (words.includes('stai')) return '“Come stai?” is for friends. To Lucia: <b>Come sta?</b>';
          if (!has(ints, 'greet')) return 'Start with a polite greeting.';
          if (!has(ints, 'ask_how')) return 'Then ask how she is, politely (Lei).';
          return true; },
        reply(){ return [{ it:'Oh, buongiorno! Bene, grazie. E Lei?', en:'Oh, good morning! Fine, thanks. And you?' }]; } },
      { lead:"(whispering) Say you're fine.",
        en:"I'm fine, thanks.", model:'Sto bene, grazie.',
        check(ints){ return has(ints, 'answer_how') || 'Tell her you\'re fine, thanks.'; },
        reply(){ return [{ it:"Bene! Oh, c'è anche Mark! Buongiorno, Mark!", en:"Good! Oh, Mark's here too! Good morning, Mark!" }]; },
        mark:'Buongiorno! … That\'s my best word.' },
      { lead:'Ask her if she likes my shirt.',
        en:'Do you like this T-shirt?', model:'Le piace questa maglietta?',
        check(ints){
          if (has(ints, 'like:ti')) return 'Lucia is still a stranger: <b>Le</b> piace, not ti piace.';
          if (has(ints, 'like:me')) return '<b>Mi</b> piace is “I like”. Asking her, politely: <b>Le piace…?</b>';
          if (!has(ints, 'like:le')) return 'Ask if <i>she</i> likes it, politely (Lei).';
          if (!has(ints, 'item8:maglietta', 'item7:maglietta')) return 'Say what: this T-shirt.';
          return true; },
        reply(){ return [{ it:'Mmm… il rosso? No, non mi piace. Il bianco è più elegante.', en:"Hmm… the red? No, I don't like it. White is more elegant.", noEn:true }]; } },
      { choice:{ prompt:'Well? What did she say?', line:{ it:'Mmm… il rosso? No, non mi piace. Il bianco è più elegante.', en:'' },
          onPick(o){ if (!o.correct){ S.l8.choiceWrong++; save(); } },
          options:[
            { label:'She loves it.' },
            { label:"She doesn't like the red. She says white is more elegant.", correct:true },
            { label:"She says it's too small." },
          ] } },
      { lead:'But Emma loves red! Tell her it\'s for Emma, and Emma likes red.',
        en:"It's for Emma. Emma likes red.", model:'È per Emma. A Emma piace il rosso.',
        check(ints){
          if (has(ints, 'like:emma_bad')) return '<i>Piacere</i> works backwards: red pleases Emma → <b>A Emma</b> piace il rosso.';
          if (!has(ints, 'for_emma')) return 'First say it\'s for Emma.';
          if (has(ints, 'like:me', 'like:le', 'like:ti')) return 'It\'s <i>Emma</i> who likes red, not you or Lucia. <i>Piacere</i> works backwards: red pleases Emma.';
          if (!has(ints, 'like:emma')) return 'Then say that Emma likes red. <i>Piacere</i> works backwards: red pleases Emma.';
          if (has(ints, 'colour:rosso:f', 'colour:rosso:m')) return 'Red, the colour itself, is <b>il rosso</b>.';
          if (!has(ints, 'colour:rosso:n')) return 'Say what Emma likes: red, the colour itself (masculine, with its article).';
          return true; },
        reply(){ return [{ sys:'Lucia laughs.' },
                         { it:'Ah, per Emma! Allora: la maglietta bianca… e le rose rosse!', en:'Ah, for Emma! Then: the white T-shirt… and red roses!', noEn:true }]; } },
      { choice:{ prompt:'What? What did she say?', line:{ it:'Ah, per Emma! Allora: la maglietta bianca… e le rose rosse!', en:'' },
          onPick(o){ if (!o.correct){ S.l8.choiceWrong++; save(); } },
          options:[
            { label:'A red shirt… and white roses!' },
            { label:'Forget the shirt, buy her chocolates!' },
            { label:'White shirt… and red roses!', correct:true, reply:"White shirt, red roses. She's a genius." },
          ] } },
    ],
    done(){ S.l8.luciaDone = true; save(); },
  },

  /* 7 · buying the shirt: the price and the change in Mark's notepad */
  teresa_buy:{
    npc:'teresa', tut:'l8-buy', scene:'mercato', modelAfter:2, companion:true,
    opening:{ it:'Ah, siete tornati! Allora? Le piace la rossa?', en:"Ah, you're back! So? Do you like the red one?" },
    reopening:{ it:'Sì? Mi dica.', en:'Yes? Go ahead.' },
    steps:[
      { lead:"The white one, extra large. I'll take it.",
        en:"The white one, extra large, please. I'll take it.", model:'La bianca, extra large, per favore. La prendo.',
        check(ints){
          if (has(ints, 'take:lo')) return '<i>Maglietta</i> is feminine: <b>la</b> prendo, not lo prendo.';
          if (has(ints, 'colour:bianco:m', 'colour:bianco:n')) return '“The white one” is la maglietta, feminine: <b>la bianca</b>.';
          if (has(ints, 'colour:rosso:f', 'colour:rosso:m', 'colour:rosso:n')) return 'Lucia said white, not red.';
          if (!has(ints, 'colour:bianco:f')) return 'Say which one: the white one (la maglietta is feminine).';
          if (!has(ints, 'size:xl')) return 'Say the size too: Mark needs the extra large now.';
          if (!has(ints, 'take:la')) return 'Then tell her you\'ll take it.';
          return true; },
        reply(){ const line = l7PriceLine('teresa', l8ShirtPrice());
          return [{ it:'La bianca? Certo! Ecco, extra large.', en:'The white one? Of course! Here, extra large.' },
                  { it:line.it, en:line.en, listen:true }]; },
        wait:next => l8TypedPad({ label:'la maglietta bianca', value:l8ShirtPrice(), line:l7PriceLine('teresa', l8ShirtPrice()),
          tip:'How much did Teresa say? Write it in digits.',
          right(){ const p = l8ShirtPrice();
            sysLine(`Mark's notepad: <b>la maglietta bianca · € ${p}</b>`);
            companionLine(`${cap(NUM_EN[p])}. Same as this morning, good.`); } })(next) },
      { lead:"Here's a twenty. Tell her: here's twenty.",
        en:"Here's twenty euros.", model:'Ecco venti euro.',
        check(ints){
          if (!has(ints, 'here_is')) return 'Start with “here\'s”: the handbook\'s <i>What you say</i> has it.';
          if (!has(ints, 'num:20')) return 'Say the amount: twenty euros. The numbers are in your dictionary.';
          return true; },
        reply(){ const c = l8ShirtChange(), line = l8ChangeLine(c);
          return [{ it:line.it, en:line.en, listen:true }]; },
        wait:next => l8TypedPad({ label:'il resto', value:l8ShirtChange(), line:l8ChangeLine(l8ShirtChange()),
          tip:'How much change did Teresa give you? Write it in digits.',
          right(){ const c = l8ShirtChange();
            sysLine(`Mark's notepad: <b>il resto · € ${c}</b> (20 − ${l8ShirtPrice()} = ${c})`);
            companionLine(`${cap(NUM_EN[c])} back. Perfect.`); } })(next) },
    ],
    done(){
      S.l8.shirtPaid = true; save();
      npcLine('Grazie a voi! Buona serata!', 'Thank you! Have a nice evening!');
      companionLine("I'll go and change into it. You get the roses: here's another twenty. Red ones!");
    },
  },
});
