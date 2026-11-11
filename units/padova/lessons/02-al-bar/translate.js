/* Lesson 2. Translating for Emma (companion conversation). */

/* ---------- translating for Emma ---------- */
function afterCompanionTurn(out){
  const st = convo.st;
  if (out.end){
    if (S.l2EmmaDone){ convo.keepHint = true; showHint('Emma has her breakfast. Leave the counter to finish the lesson.', 'Fatto!'); }
    endConvo(); return;
  }
  if (out.altro && !convo.didAltro){
    convo.didAltro = true;
    setTimeout(() => translatePrompt('What did he say?',
      ['He says it will be ready in a minute.', 'He is asking if we want anything else.', 'He is telling us the price.'], 1,
      () => companionLine(missingWish().length ? `Oh! Yes, ${ITEM[missingWish()[0]].en} too, please.` : "No, that's everything, thanks!")), 600);
    return;
  }
  if (out.altro){ setTimeout(() => companionLine(missingWish().length ? `And ${ITEM[missingWish()[0]].en}!` : "That's everything!"), 500); hintEl.hidden = true; return; }
  if (out.served && !convo.didPrice){ setTimeout(() => companionLine('Lovely! Can you ask him how much it is?'), 500); hintEl.hidden = true; return; }
  if (out.price && st.served && !convo.didPrice){
    convo.didPrice = true;
    const p = out.price, e = Math.floor(p / 100), c = p % 100;
    const TEEN = { 0:10, 10:11, 20:12, 30:13, 40:14, 50:15, 60:16, 70:17, 80:18, 90:19 };
    const alts = [(e + 10) * 100 + c, e * 100 + (TEEN[c] ?? (c + 5) % 100)];
    setTimeout(() => translatePrompt('How much did he say?', [euroEn(alts[0]), euroEn(p), euroEn(alts[1])], 1, () => {
      companionLine(`${euroEn(p)}? Perfect, here you go. Thank you so much! Grazie mille!`);
      S.l2EmmaDone = true; save();
      setTimeout(() => showHint('You translated for Emma! Say <b>Grazie!</b> to Enzo to finish.', 'Fatto!'), 400);
    }, 'Look at the price again. Italian writes a comma where English writes a point: <i>1,20 euro</i> is €1.20.'), 600);
    return;
  }
  if (!out.asked && !st.served) showHint(contextHint(false)); else hintEl.hidden = true;
}

const translatePrompt = (...a) => enqueue(() => { if (dialogOpen && convo) _translatePrompt(...a); });
function _translatePrompt(q, options, correct, onRight, wrongHint){
  builder.hidden = true; hintEl.hidden = true;
  _npcLine(q, null, { english:true, companion:true, speaker:convo.companion });
  choices.innerHTML = '';
  options.forEach((o, k) => {
    const b = document.createElement('button');
    b.className = 'btn english'; b.textContent = o;
    b.onclick = () => {
      if (k === correct){
        choices.hidden = true; meLine(o, { english:true });
        setTimeout(() => { onRight(); builder.hidden = false; scrollTr(); }, 600);
      } else {
        b.disabled = true; b.classList.add('wrong-choice');
        companionLine("Hmm, are you sure? That doesn't sound right.");
        showHint(wrongHint || 'Think back to the handbook: <b>Altro?</b>, <b>Ecco!</b>, <b>Sono … euro</b>. Listen again with the speaker button.');
      }
    };
    choices.appendChild(b);
  });
  choices.hidden = false; scrollTr();
}
