# Lesson 14 · Dov'è il cane? — design doc (draft)

The morning after Lesson 13, on the same train. A gentle mystery: the English-speaking owner's dog is missing. The
answer is innocent: the two children took it to their room because they've always wanted a dog.

## Summary
- **Teaching goal:** the **passato prossimo with *essere*** (movement): *è andato / è andata, sono andato/a, è
  tornato, è uscito*. The agreement (*-o / -a*) matters. The *avere* past from Lesson 13 is used all through the
  questioning. Times again (Lesson 10).
- **Modes:** questioning (tiles; typed when translating for the owner), the **notebook** (who said what, and when),
  listening to times, knocking on doors, the reveal (a cutscene), translating at the reunion.
- **Where:** the train, 3 cars (Lesson 13's scene, in the morning: dawn scenery, then the lagoon).

## The trail (the designer's outline; reordered after the designer's playthrough, 7 Nov 2026)
| # | `S.tut` | where | what happens |
|---|---|---|---|
| 1 | `l14-start` | sleeper car | Morning. Margaret knocks, in a panic (English): her dog is gone. The last place she remembers it: sitting by her in the dining car last night. |
| 2 | `l14-barrier` | dining car | The player tries to ask where the dog went: they need *è andato*. → handbook: the past with *essere*. |
| 3 | `l14-dining` | dining car | The main question: **Sa dov'è andato il cane?** (*Sa…?* is Lesson 6's). **The businessman:** *"Non lo so! Non ho visto niente."* **The parent**, working at a table for some peace and quiet: nothing seen. Margaret presses ("Is he quite sure?"): the player asks **È sicuro? / È sicura?** (the agreement), and each says *"Non ho visto niente. Chieda alla coppia della camera 14. Forse sanno dov'è il cane."* |
| 4 | `l14-couple` | room 14 | Knock: *"Chi è?"* → **Siamo io e Margaret** (also *Sono io*; *Sono io e Margaret* gets a tip: two people take *siamo*). **The old man:** *"È andato verso il vagone ristorante."* (6:00) **The old woman:** *"No, no! È andato verso la testa del treno!"* (6:45). Both in the notebook (the times asked with *A che ora?*). Then Margaret: *"The chef feeds everyone — let's ask him!"* The Confronta page shows the two sightings side by side (its *Lo stesso cane?* is optional: "two dogs" is a hunch the cab confirms). |
| 5 | `l14-nino` | dining car | **Nino**, the chef: *"C'è un cane davanti, con il macchinista!"* (he saw a dog go to the front at 6:45: Brigante, coming back). |
| 6 | `l14-front` | front car | The driver's door: knocking, **barking!** Gianni behind the door: *"Chi è? Sono occupato!"* → **Scusi il disturbo, permesso?** → *"No, no! Esco io!"* A cutscene: he steps out and pulls the door to, and **a big dark dog slips past him**, runs down the car and back to his feet (Brigante: not Biscuit). *"Ehm… niente, niente!"* Margaret (typed): *"Non è il mio cane!"* → *"È Brigante, il mio cane… Per favore, non lo dica a nessuno!"* → the promise, *"Non lo dico a nessuno."* → *"Chieda al cuoco!"* |
| 7 | `l14-chef` | dining car | Back to Nino: the player's discovery, **Ci sono due cani!** Nino remembers the second (Margaret's) dog: *Ha guardato la cena, voleva un osso!* But he doesn't know where it went. |
| 8 | `l14-memory` | corridor | The old man catches up: *"Ah! Mi sono ricordato!"* He heard barking last night from the **room next to theirs**. |
| 9 | `l14-reveal` | the kids' room | Knock: barking, giggling. The parent opens up: the two children on the bed with Margaret's dog. *"Abbiamo sempre voluto un cane!"* |
| 10 | `l14-done` | the kids' room → arrival | The reunion, with the player translating between Margaret (English) and the kids (*tu*: *Ti piace?*, also *Ti piace il cane? / Ti piace Biscuit?*). Margaret lets them say goodbye (and give it a last biscuit). The train pulls into **Venezia Santa Lucia** at dawn; through the windows, the lagoon. Completion screen. → Lesson 15: Venice. |

## Design notes
- **Fair play.** Every step of the solution was shown in Lesson 13: the parent saying the kids want a dog, the kids
  staring at it, the driver leaving with leftovers, the dog begging at the hatch. A player who paid attention can
  guess earlier. The notebook can show "Ieri sera…" entries remembered from dinner.
- **The two times** in step 4 are the mystery's real clue: two sightings, at two times, going in two directions.
  The player has to *hear* the times (listening lines, Lesson 10) and note them. The notebook asks *A che ora?*
  for each.
- **The old man's memory** (step 7) shouldn't feel random. Earlier, in step 4, he says *"Ho sentito anche un cane
  stanotte… ma non mi ricordo dove"* (I also heard a dog last night… but I don't remember where). After the driver's
  dog, the player can go back and ask him again, or he comes to find them.
- **The driver's secret** is a small promise the player keeps. Later dialogue (the chef) shouldn't reveal it. (Nino saw the driver's dog
  go to the front himself, so telling him keeps the promise.)
- **No spoilers in the handbook** (the designer): the chapter, its Vocabolario, practice, dialogue and the Verbi examples say nothing of
  whose dogs, how many, or the trail's people; the discoveries' tiles show (and enter the dictionary) only once the second dog is seen.
- **Tone:** no villain. Everyone is a little kind.

## Vocabolario (≤ 50)
The *essere* past (*è andato/a, sono andato/a, è tornato/a, è uscito/a…*), asking and pressing (*Sa dov'è andato …?, È sicuro? / È
sicura?, Si ricorda?, niente, forse, Chieda a …*), at the door (*bussare, Chi è?, Scusi il disturbo, permesso?, Avanti!, Esco io!*), the
train (*verso, la testa del treno, la camera, la coppia, del / della*), dogs (*abbaiare, l'osso, il biscotto, Si chiama …*), promises.
As built: 34 terms. No word an earlier chapter teaches (*il macchinista, il cuoco, il vagone ristorante, il cane, visto, sentito, davanti,
permesso, accanto, stamattina, ieri sera, stanotte*: they stay in the tiles), nothing that gives the mystery away.

## Shared changes needed
- **The detective notebook:** a notepad mode with a list of people, what each said, and the times. Entries are
  filled in when the player *understands* a line (e.g. picks or types the time they heard).
- **Knocking on compartment doors** (barking behind a door; a door that opens in a cutscene).
- **Morning scenery and the arrival at Venice** (the lagoon from the windows).

## As built (content)
Built before the train existed. Everything here is data plus small helpers; the flow is `flow.js` (*As built (flow)*, below). Files: `src/lessons/14-dov-e-il-cane/content.js` (data), `trail.js` (read a sentence, pick a reply, play it, ask the
notebook), `debug.js` (test helpers and a **reference wiring**, `l14Demo`), `src/ui/notebook.js` (the notebook), the past in
`src/ui/grammar.js`. Test: `tests/l14-content.js`; screenshots `review/l14-content/`.

### Registration (no flow yet)
- `LESSONS.push(L14_CHAPTER)`: chapter 14 opens in the handbook (Lesson tab, **Words** 34, Practice 12). LESSONS is read by position,
  so while no Lesson 13 exists a **stand-in chapter 13** (`placeholder:true`: shown locked "Coming soon", left out of Studio) is
  pushed first. A real `src/lessons/13-…/content.js` runs earlier in the build and the stand-in disappears by itself.
- `LESSON_HOOKS[14]` is a **base hook** with no `start()` (so no skip link and no "Start Lezione 14" button yet): `n`, `vocab`
  (= `L14.bankTiles`: the dictionary and the vocab audit), `vocabNote`, `doneTut:'l14-done'`, `phrases()` (L14's parser phrases
  while `S.lesson === 14`), `notebook()` (the notebook while `S.l14.notebook` is set). **The flow extends it:**
  `Object.assign(LESSON_HOOKS[14], { start, skip, restore, objective, guide, markers, talk, bank, react, afterTurn, hint, onVocab,
  onPractice, … })` (don't replace it: its `vocab` and `notebook` must stay). Set `S.l14 = { notebook:true, … }` in `start()` (or from
  `l14-dining` on) to show the Taccuino.

### The data: `L14` (content.js)
| field | what |
|---|---|
| `L14.cast` | suggested ids: `margaret`, `biscuit`, `rinaldi`, `ferri`, `ernesto`, `lina`, `gianni`, `brigante`, `nino`, `luca`, `sofia`, each with `name`, `formal` (Lei / tu), `pitch`, `role`. If content/npcs.js uses other ids, map them in the flow (the scripts are keyed by these). |
| `L14.tiles` | tile groups: `domande` (Mi scusi, **Sa …?**, Dov'è andato?, Dov'è andata?, **il cane**, Ha visto, un cane, un cane piccolo, Cerco, **È sicuro?**, **È sicura?**, A che ora?, Ha sentito, Dove?, Si ricorda?, stamattina, ieri sera), `risposte` (Ci sono due cani!, il cane del macchinista, e, il cane della signora, Non lo dico a nessuno., Forse, Non lo so.), `porta` (Scusi il disturbo, Permesso?, **Siamo, Sono, io, e, con, Margaret**; the bank adds your name), `cortesia` (Sì, No, per favore, Grazie mille!, Arrivederci), `bambini` (È il cane della signora!, Ti piace?: tu). `Dov'è andata?` / `È sicura?` are there on purpose: the NPCs answer the agreement the player chose. Tiles with `spoiler:true` (the discoveries) are shown and listed in the dictionary only once `l14Discovered()` (trail.js: the second dog seen, `S.l14.cabOpen`, or later): the hook's `vocab` is a getter, `bankTiles` has every tile (the vocab audit). `L14.bankTiles`: all, flat. |
| `L14.phrases` | `[intent, words]` for the parser: `l14:the_dog`, `l14:sure:m` / `:f` (è sicuro / è sicura), the door's `l14:siamo`, `l14:sono`, `l14:margaret`, `l14:con`; `l14:seen`, `l14:heard`, `l14:went:m` / `:f`, `l14:when` (Lesson 10's `ask_when` wins for the same words; `l14Read` takes both), `l14:where`, `l14:remember`, `l14:two_dogs`, `l14:driver_dog`, `l14:her_dog`, `l14:is_her_dog`, `l14:promise`, `l14:permesso`, `l14:disturb`, `l14:maybe`, `l14:morning`, `l14:lastnight`, `l14:excuse`, `l14:thanks`, and the typed lines' `l14:open_door`, `l14:not_my_dog`, `l14:name_is`, `l14:biscuit`, `l14:a_biscuit`, `l14:for` (`ecco` parses as the bag's `here_is`). |
| `L14.scripts[S.tut][who]` | per step and person: `opening`, `revisit`, `on:{ greet, seen, went:{ m, f }, when, heard, remember, where, two, driver, her, whose, plead, promise, tip, tu, thanks, bye, other }` (lists of `{ it, en, listen?, rate?, sys? }`), clue names (`clue` for `seen`, `whenClue`, `heardClue`, `whoseClue`, `herClue`), `ask:'where'`. Extra beats per step: `l14-barrier.sys` (the barrier's narration), `point` (Rinaldi / Ferri: *Chieda alla coppia della camera 14*), `door` (knock, answer, open; barking and giggling), `l14-couple.bicker` and `whenBoth` (the two of them), `ernesto.aside` (*Ho sentito anche un cane stanotte… ma non mi ricordo dove*), `l14-memory.ernesto.memory` (*Ah! Mi sono ricordato!* … *nella camera accanto*), `l14-reveal.ferri.found / sorry`, `sofia.found / name`, `luca.found` (*Abbiamo sempre voluto un cane!*), `l14-done` (the children, Ferri's goodbye, the Santa Lucia announcement). |
| `L14.margaret[step]` | Margaret's English lines per step (companion lines), plus `l14-start-choices` / `-after`. |
| `L14.typed` | Margaret's typed translations in the `TYPED_SCRIPTS` format: `margaret_door` (npc `gianni`, `l14-front`, after the dog slipped out: *Non è il mio cane!* → a CHOICE: what Gianni begs) and `margaret_reunion` (npc `sofiaferri`, `l14-done`: *Si chiama Biscuit.* → *Ti piace?* (tu; *Ti piace il cane? / Ti piace Biscuit?* count) → a CHOICE → *Ecco un biscotto per Biscuit!*), `companion:'margaret'`. Registered by flow.js (with a `scene` getter each). Their `check()` hints never contain the model (`__l14Audit` checks). `__dictAudit(from, to)` now only reads scripts up to the current lesson, so registering them won't break Lesson 8's test. |
| `L14.clues` | the notebook's clues: `rinaldi-niente`, `rinaldi-arrivato` (7:00), `ferri-niente`, `ferri-arrivata` (7:00), `camera14`, `ernesto-visto` (verso il vagone ristorante, **6:00**), `lina-visto` (verso la testa del treno, **6:45**), `ernesto-sentito`, `nino-davanti` (*C'è un cane davanti, con il macchinista!*, verso la testa del treno, 6:45 if asked), `gianni-brigante` (secret), `gianni-tornato` (6:45, secret), `nino-osso`, `ernesto-ricordato` (nella camera accanto), `bambini`. The notebook shows them in Italian only. `L14.times`, `L14.where` hold the truths. |
| `L14.ieriSera` | Lesson 13's dinner clues (ids `ferri-vogliono`, `bambini-guardano`, `gianni-avanzi`, `biscuit-cucina`, `nino-pollo`, `bassi-letto`). The notebook shows those in `S.l13.seen` (an array Lesson 13's flow can fill), or all of them if it isn't set. |
| `L14.hints` | English hints per step (`seen`, `went`, `when`, `door`, `promise`, `two`, `whose`, `next`…), the agreement feedback (`agree.f`), `formal`. Never the Italian answer. |
| `L14.chapter` | the handbook chapter (also `L14.vocab`, `L14.practice`, `L14.verbs`). |

### Reading and replying (trail.js)
- `l14Read(ints)` → `{ keys:['seen' | 'went' | 'sure' | 'when' | 'heard' | 'remember' | 'where' | 'two' | 'driver' | 'her' | 'promise' | 'thanks' |
  'bye' | 'greet' | 'like' | 'who'], agree:'m' | 'f' | null, sure:'m' | 'f' | null, who:'we' | 'sono-pl' | 'me' | null, sa, tu, polite, greet, her,
  driver, two, promise, door, permesso, disturb }` (*Sa dov'è andato il cane?* is `went` with `sa`).
- `l14Reply(step, who, read, st)` → `{ lines, clues, asks:[{ kind:'time' | 'where', clue }], keys, other }`: each thing asked, in order,
  from the person's script (andata → the puzzled line; tu to an adult → their remark first; Nino: the two dogs in one or two sentences;
  Gianni: the promise → thanks + the tip; nothing recognised → their `other` line).
- `l14Play(lines, speakers)` plays lines in the open conversation; `l14AskAfter(reply, { mode, onDone })` writes the clues and runs the
  notebook's questions one after another.
- **Reference wiring** (`debug.js`, `L14_DEMO_HOOK`): `bank` pushes the tile groups; `react` (k === 0) adds `l14Reply`'s lines with
  `add(it, en, { listen, rate })`, sets `out.asked = true` (no small-talk agenda) and `out.l14`; `afterTurn` shows the sys lines and calls
  `l14AskAfter(out.l14)`. The flow's hooks can do exactly this, guarded by `S.lesson === 14`, the NPC and `S.tut`, plus the step
  transitions (e.g. both `point` lines heard → `l14-couple`; both times noted → Margaret's line, `l14-front`; the promise → `l14-chef`; Nino's
  `her` → `l14-memory`).

### The notebook (ui/notebook.js)
- Spec (hook `notebook()`; Lesson 14's is `l14NotebookSpec()`): `{ id, title, sub, button, case, people:[{ id, name, role }], clues, times, where,
  ieriSera, compare:{ a:'ernesto-visto', b:'lina-visto', title, q:{ it:'Lo stesso cane?', options:[{ id:'one' | 'two', it, en, correct?, reply }] } } }`.
- `nbNote(id, { time?:true | { h, m }, where?:true | key, quiet? })`: write a clue (toast, the button's count, hook `onNotebook(id, rec)`).
  `nbHeard`, `nbHas`, `nbComplete`, `nbRec`.
- `nbAskTime({ clue, line:{ it, rate, pitch }, mode:'type' | 'pick', onDone(rec, tries) })`: inside the conversation (display queue,
  hides the tiles like askNumber): *A che ora?* `__ : __`. 12- or 24-hour (6:45 or 18:45). Wrong → feedback on the player's own time
  (*the minutes are right…*, *that is the hour you heard, but meno…*), never the answer; the 2nd miss replays the line slowly, the 3rd
  reveals it (`revealListen`), the 5th recalls Lesson 10's rules, the 6th offers *Show me*. `nbAskWhere({ clue, options? })`: three
  English directions to pick from.
- `openNotebook('people' | 'ieri' | 'compare')`, the header's **Taccuino** button (inserted before the bag / map), **J**. The compare page's
  question calls `onNotebookDeduce(optId, { first, correct })`: optional, nothing waits on it.

### Choices made (tell me if the story should differ)
- **Which dog was seen when:** Ernesto's 6:00 dog (towards the dining car) is Biscuit; Lina's 6:45 dog (towards the front) is Brigante,
  who Gianni says *è tornato alle sette meno un quarto*. The kids took Biscuit in last night (Ernesto heard barking next door; Sofia: *Ieri
  sera è entrato in camera, da solo!*). Rinaldi and Ferri got to the dining car at 7:00, after both sightings, so they saw nothing.
- **Nino already knows about Brigante** (he packs Gianni's leftovers in Lesson 13), so telling him *il cane del macchinista* keeps the
  promise; he answers *Shh! … lo so, lo so. Zitto!*.
- The children call Biscuit *Biscotto* (the name pays off in the last typed line, *Ecco un biscotto per Biscuit!*).
- The Vocabolario no longer repeats Lesson 13's words (the designer): 34 terms; `__l14Repeats()` lists any entry an earlier chapter
  already teaches, `__l14Spoilers()` any spoiler in the chapter (tests/l14-content.js).
- Verbi: the *avere* past (mangiare, vedere, fare, prendere, dire, leggere, comprare, ballare, sentire) is in chapter 14's `verbs` with
  `lesson:13` (it opens when Lesson 13 is completed); the *essere* past (andare, tornare, uscire, arrivare, entrare) with `g:'m' | 'f'`. If Lesson
  13's chapter adds the same forms (same person, Italian and `mood:'past'`), grammarVerbs keeps one.

## As built (flow)
`src/lessons/14-dov-e-il-cane/flow.js` extends the base hook (`Object.assign(LESSON_HOOKS[14], {…})`). Test: `tests/l14-cane.js` (the
whole lesson through the real UI from the skip link; then the notebook's *Ieri sera…* after a skip, a real Lesson 13, saves with none / two
clues; then *Sono io e Margaret* at room 14's door and its tip). Screenshots: `review/l14/`; the designer's notes (È sicuro?, Chi è? →
Siamo io e Margaret, Nino's line, the dog slipping past Gianni, the notebook in Italian): `review/l14-rework/`.

### The states (`S.tut`) and `S.l14.phase`
| `S.tut` | what happens | moves on when |
|---|---|---|
| `l14-start` | compartment 17 (`cabina17`), dawn, 7:20. `'knock'`: a cutscene (knocking, Margaret comes in: *“Hello? Are you awake?”*); `'talk'`: her conversation (English, her own side), two answers | an answer: she **follows** (the `follower` hook) |
| `l14-barrier` | the dining car: il signor Rinaldi (S2), tiles **without** *Dov'è andato?* / *A che ora?*. *Ha visto un cane?* → his fast listening line (*… È andato via.*), Margaret (*Ask him where Biscuit went!*, on your side), the content's barrier narration | the barrier → `l14-handbook` (or straight on if chapter 14 is done) |
| `l14-handbook` → `l14-vocab` → `l14-practice` | chapter 14, the word check (45 words), the practice (12) | the practice: `l14-dining`, **the notebook switches on** (`S.l14.notebook`) |
| `l14-dining` | Rinaldi (S2) and la signora Ferri (N3, coffee): `l14Reply('l14-dining', …)`; *Sa dov'è andato il cane?* (or *Ha visto un cane?*) → *Non ho visto niente* (`S.l14.nothing`, the `-niente` clue); Margaret presses ("Is he quite sure?"), the hint "Ask if he's sure." (*sicuro* / *sicura* named from the third try); *È sicuro?* / *È sicura?* → their `point` line (*Chieda alla coppia della camera 14. Forse sanno dov'è il cane.*, `camera14`); the wrong ending (*È sicura?* to him) → `sureWrong` + the agreement feedback; *andata* → their puzzled line + `L14_HINTS.agree.f`; *A che ora?* → the notebook's time (7:00, optional) | both have pointed: Margaret (*Room 14?…*), `l14-couple` |
| `l14-couple` | knock on 14 → *Chi è?* behind the door: a tile conversation (nameplates `???`; the bank: *Siamo, Sono, io, e, con, Margaret*, your name); who you are (`read.who`: *Siamo io e Margaret*, *Sono io*, *Sono Sam con Margaret*; *Sono io e Margaret* → the *siamo* tip) → *Ah, Lei! E la signora inglese! Avanti, avanti!*; or something polite → *Avanti, avanti!* → **Go in** (`cabina14`). Ernesto and Lina, each their own conversation: the sighting → `nbAskWhere`, *A che ora?* → `nbAskTime` (typed: 6:00, 6:45); Ernesto's aside once after his sighting; both complete → their bickering, Margaret (*both ways?* … *The chef feeds everyone — let's ask him!*) | both sightings written → `l14-nino` |
| `l14-nino` | Nino (tiles; before this he is busy with the breakfasts): *Sa dov'è andato il cane?* → *C'è un cane davanti, con il macchinista!* (`nino-davanti`, verso la testa del treno; *A che ora?* → 6:45). The Confronta page (*Lo stesso cane?*) is optional now: `onNotebookDeduce` keeps the answer (`S.l14.deduced`) and Margaret says a word | Nino's line → Margaret (*That's where Lina saw him going!*), `l14-front` |
| `l14-front` | `'door'`: knock on the cab → (the first time) a cutscene (*Bau! Bau!*, Margaret: *Listen! A dog! Biscuit? Ask if we can come in!*) → Gianni behind the door (tiles, kind `cab`): a dog? → *Un cane? Qui? No, no… nessun cane!* + a bark; *Siamo io e…* → *Non vi conosco!*; **Permesso?** (better after *Scusi il disturbo*; without it, a tip) → *No, no! Esco io!* → `'out'` → **Continue** → the cutscene `l14-slip` (`l14CabSlip`): the player steps back, the door opens, Gianni steps out, the door is pulled to, Brigante slips past him, runs down the car (*Bau! Bau!*, Margaret *Biscuit?!*), *Brigante! Vieni qui!*, back to his feet; *Ehm… niente, niente!* (the English in the guide line) → `'typed'`: `TYPED_SCRIPTS.margaret_door` (*Non è il mio cane!*, the CHOICE) → `'promise'`: Gianni (tiles) pleads; *Non lo dico a nessuno.* → thanks + *Il cane della signora? Io non so niente… Chieda al cuoco!*; Margaret: *Back to the chef* | the promise → `l14-chef`; Gianni opens the door, he and Brigante go back in, the door shuts |
| `l14-chef` | Nino again (*Allora, il cane? Davanti, no?*): the discoveries are tiles now; *Ci sono due cani!* (or *il cane della signora*) → *Due cani?! … il cane della signora! Ieri sera ha guardato la cena, voleva un osso!* (`nino-osso`); *il cane del macchinista* → *Shh! … lo so, lo so* (he saw it) | the two dogs / the lady's dog → `l14-memory` |
| `l14-memory` | Ernesto and Lina hurry after you (a cutscene from the gangway, or from door 14 if you are in the sleeper): *Aspetti! … Mi sono ricordato!*, his memory → `nbAskWhere` (*nella camera accanto*), Lina: *ci sono due bambini*; then they sit at N2 | the where → `l14-reveal` |
| `l14-reveal` | `'knock'`: knock on 15 → a cutscene (barking, giggling, *Un momento!*), the door opens; `'door'`: la signora Ferri in the doorway (tiles): a dog question → *Ma no, i bambini dormono…* + barking and giggling inside → **Look inside**; `'in'`: into `cabina15`: the children on the bunk with Biscuit (a cutscene conversation: *Mamma, scusa!*, *Abbiamo sempre voluto un cane!* (`bambini`), *Si chiama Biscotto*, *Che vergogna!*, Margaret) | → `l14-done` |
| `l14-done` | the windows show the lagoon. `'reunion'`: `TYPED_SCRIPTS.margaret_reunion` (to Sofia, tu; Luca's E redirects to her); `'goodbye'`: la signora Ferri (tiles: *Arrivederci* / *Grazie mille*; *Ciao* → the polite-goodbye feedback); `'arrive'`: out into the corridor, the announcement, the train stops (`trenoMoving` false), Margaret and Biscuit (following her); `'end'`: the completion screen (Lezione 15 *coming soon* unless a hook 15 has `start`) | — |

### Hooks added
`start` (S.lesson 14, `S.l14`, morning, `TRENO.mine` 17, compartment 17; *Ieri sera…*: an empty `S.l13.seen` is filled with every dinner clue,
`S.l14.ieriFilled`), `skip` (the end state, in the piazza in the afternoon, like Lessons 12–13), `restore` (a beat cut short is replayed or
finished), `objective` / `guide` / `markers`, `bookPulse`, `trenoSky`, `trenoMoving`, `gameClock` (7:20 → 8:35), `stamps`, `follower`,
`sceneOf` / `place` (below), `visitorTalk` (the children, in their room), `redirect` (Luca → Sofia in the reunion), `door` (the bunk, the
outside door), `knock`, `talk` / `bank` / `react` / `afterTurn` / `hint` / `onClose`, `onVocab` / `onPractice`, `onNotebookDeduce`,
`cutsceneResume`, `dbgLesson`. The base hook's `notebook()` is kept as it was.

### The time
The header clock runs 7:20 (the knock) → 7:40 (the dining car) → 7:50 (room 14) → 7:55 (to Nino) → 8:00 (the cab) → 8:02 (the dog) → 8:05
(back to Nino) → 8:10 → 8:35 (Santa Lucia): after both sightings (6:00, 6:45) and after the 7:30 Nino gives at bedtime in
Lesson 13 (*Quando arriviamo a Venezia?* → *alle sette e mezza*). If that was asked (`S.l13.askedWhen`, read defensively), the arrival's
guide line recalls it: the train is a little late.

### Who is where
Rinaldi S2 west, la signora Ferri N3 west (until `l14-chef`, then in `cabina15`; in the doorway of 15 at the reveal), Nino at the counter,
Ernesto and Lina in `cabina14` (until the memory beat; then N2), Gianni and Brigante `'away'` (in the cab) except while he is out in the
front car (`cabOpen`, from the cutscene to the promise: Gianni (2378, 230) by the shut door, Brigante sitting at his feet),
Biscuit in `cabina15` (with the children) until the goodbye, then following Margaret. Margaret: compartment 11 until she knocks, then in the
player's scene (the follower).

### How a turn is read
Our conversations are tile conversations set up by `talk` itself (`l14Tiles(kind, …)`: kinds `barrier`, `ask`, `door`, `reveal`, `bye`,
`memory`); `react` reads the whole turn once with `l14Read(ints, words)` and answers with `l14Reply(step, who, …)` (the trail's people), or the
door / goodbye logic; lines of another speaker (bickering, Lina's aside, Sofia's goodbye) are played in `afterTurn` with their own
nameplate; then `l14AskAfter` runs the notebook's questions, and the step moves on in its `onDone`. A greeting in the same turn as a
question gets a *Buongiorno!* first. Hints: `l14HintFor` (English, what is needed; the key words only from the third failed try,
`hintAfter`); feedback names only the player's own word (*-o for him*; *buongiorno, not ciao*; *arrivederci, not ciao*).

### The secret
Once promised, *il cane del macchinista* or *ci sono due cani* said to anyone but Nino (who saw the dog at the front himself) or Gianni gets the person's `other`
line and *Shh! You promised Gianni…* (`S.l14.slips`). Nothing later says it: the completion screen mentions only *a secret you promised to keep*.

### Changes to shared code
- `world/scenes.js` `nearestNpc`: a follower is talked to only when no door is in reach (otherwise E at a compartment door talked to
  Margaret instead of knocking).
- `engine/parser.js` `formatSentence`: the vocative split after *scusi* / a greeting is skipped for a three-word `JOIN` entry (`JOIN.add('scusi il disturbo')`: *Scusi il disturbo.*, while *Scusi, il resto non è giusto.* keeps its comma).
- `styles.css`: with the game clock, the Taccuino button drops its label and key (the header stays one row at 1280).
- `engine/state.js`: `__dbg().l14`.

### Content / train fixes
- `L14_TYPED`: `companion:'margaret'` (it was `true`: Mark), the reunion's npc `sofiaferri` (`sofia` is Lesson 9's Sofia); the cab's dog is
  *dark-brown* (Brigante), not black.
- `l14Read(ints, words)`: *tu* is *hai visto* or the word *stai* (`ask_how` is both *come sta* and *come stai*).
- `l14Play`: the other speaker's nameplate shows when you know them (`forceKnown`).

### Not as designed / open
- Margaret follows you all the way (she is “brought along” to the cab rather than fetched): her lines fit every step that way, and the
  content's `deny` lines are used inside the typed translation's first reply.
- The design's 9 states plus the standard `l14-handbook` / `l14-vocab` / `l14-practice`; the reunion runs inside `l14-done`, as the
  content's typed script expects (so the objective is styled *done* during it).
- Room 13 is also next to 14; knocking there gets *nobody: it's empty*, and Lina's *ci sono due bambini* points to 15.
- `whenBoth` (the couple's joint answer) is not used: Ernesto and Lina are questioned one at a time.
- The notebook's "where did it go?" pick, inside a conversation, keeps English options (it checks what was understood); the notebook
  itself (entries, people, Ieri sera…, Confronta) is Italian only.
- Depends on Lesson 13's Vocabolario for the tiles' repeated words (*il macchinista, il cuoco, il cane, visto, sentito, stamattina, ieri
  sera…*): if Lesson 13 stops teaching one, `tests/l14-content.js` (the vocab audit) says which.
