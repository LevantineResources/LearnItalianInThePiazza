# Lesson 8 · Mi piace! — design doc

## Summary
- **Story beat:** Mark comes back to the market with cash, and reveals that tonight's date is **Emma**, whose favourite
  colour is red. The blue shirt has sold out. You find a red one, Mark tries it on, and Teresa says it looks wonderful.
  Mark doesn't trust her, so you ask Lucia (sketching the market) for an honest opinion. Lucia: white shirt, red roses.
  You buy the shirt for Mark, then buy the roses yourself, and Gino gets the change wrong.
  **The date itself is NOT shown.** The lesson ends with Mark rushing off to get ready.
- **Teaching goal:** liking and buying. *Mi piace / non mi piace*, *Le piace? / ti piace?*, *a Emma piace …*;
  colours with gender agreement; sizes and *troppo*; *la prendo / lo prendo*; paying and change.
- **Review:** numbers 0–20 by ear (Lesson 7), *per lui* (Lesson 4), *Lei* vs *tu*, *Ha …? / Avete …?* (Lessons 4 and 6).
- **Two kinds of conversation, on purpose:**
  - **Alone with a vendor, you speak for yourself → TILES** (tile bank + lesson hooks).
  - **Translating for Mark → TYPING** (longer typed scripts, `TYPED_SCRIPTS` with `companion:true`; Mark's English
    lines are on the player's side of the transcript). No tiles in those scenes.
  - Plus **LISTEN** (listening lines for prices and change) and **CHOICE** (tell Mark in English what someone
    said: a short multiple choice via `showChoices`).
- **Where:** the market (`mercato`) throughout. Lucia is moved to the market for this lesson (see Shared changes).
- **Depends on:** the end of Lesson 7. Mark is at the market with you, and his notepad has Teresa's, Franco's and
  Gino's prices. The coffee stain is gone in Lesson 8, since Mark changed into a clean old shirt at the bank.

## The loop

| # | `S.tut` | mode | objective | what happens |
|---|---|---|---|---|
| 1 | `l8-start` | CHOICE | Talk to Mark | Mark: "Got the cash! And… my date tonight? It's **Emma**." "She told me red is her favourite colour. Can you get the shirt in red? I'm a large, I think. I'll be at the fruit stall, texting her." One choice: "Leave it to me." |
| 2 | `l8-teresa` | TILES + LISTEN | Ask Teresa for a red shirt | **The barrier.** Teresa: *La blu? Mi dispiace, è finita! Le piace questa? Che taglia porta?* (fast). Whatever the player tries with the old tiles → system line: you caught *maglietta* and nothing else. |
| 3 | `l8-handbook`, `l8-practice` | — | Open your handbook / Finish the practice | Chapter 8 (below). |
| 4 | `l8-colours` | TILES | Find a red shirt in Mark's size | Alone with Teresa (below). Ends with her handing you the red shirt, large. |
| 5 | `l8-fitting` | TYPING + CHOICE | Help Mark try it on | Mark is back; the fitting (typed script `teresa_fitting`). |
| 6 | `l8-lucia` | TYPING + CHOICE | Ask Lucia what she thinks | Typed script `lucia_opinion`. |
| 7 | `l8-buy` | TYPING + LISTEN | Buy the white shirt for Mark | Typed script `teresa_buy` (price to the notepad, as in Lesson 7). |
| 8 | `l8-roses` | TILES + LISTEN | Buy red roses at Gino's | Alone at Gino's. The wrong change. |
| 9 | `l8-done` | — | Lezione 8 completata | Mark comes back in the white shirt, sees the roses: "Red roses, white shirt. I owe you. I've got to get ready!" He leaves. Completion screen. |

## Scene details

### 2 · The barrier (Teresa, tiles)
Teresa opens with *Buongiorno! Cosa cerca?* (*cosa* from Lesson 2's *Cosa prende?*, *cerca* from Lesson 6's *cerco*).
Before the practice the bank has Lesson 7's market pack plus a "Cerco…" group (*Cerco …*, *Ha …?*, *una maglietta*,
*blu*: what a shopper has from Lesson 6). Greetings and *come sta?* are answered as usual (*Bene, grazie. E Lei?*).
Anything else (*Cerco una maglietta*, *blu*, *Quanto costa?*, *Può ripetere?*) gets her fast questions (rate 1.0, English
hidden), which follow from what was said: the blue one is sold out, which colour, *Le piace questa?*, *Che taglia porta?*
After the second fast answer, a system line: *You caught "maglietta" and nothing else. Time for the handbook.* Then
`l8-handbook`.

### 4 · Colours and sizes, alone (Teresa, tiles)
Mark is at Pina's stall (not following). The player must:
1. Greet (as in Lesson 7; vendors expect it, with the same hint if skipped). A greeting in the same turn counts
   (*Buongiorno! Ha una maglietta rossa?*); *come sta?* is optional politeness.
2. *Ha una maglietta rossa?* (accept *Avete …?* too). Agreement hints: *rosso* → "maglietta is feminine: **rossa**";
   *rossa* without a noun is fine once the maglietta has been mentioned.
   Teresa: *Rossa? Sì! E anche bianca e nera. La blu è finita, mi dispiace.*
3. Teresa: *Che taglia?* → *Grande, per favore.* (accept *taglia grande*, and *È per il mio amico* as a bonus). No hint
   after *Che taglia?* (understanding her is the task); after three failed attempts: *Mark told you his size.*
   Teresa: *Ecco: la maglietta rossa, taglia grande.* → `l8-fitting`, and Mark walks back.

### 5 · The fitting (`teresa_fitting`, typing, Mark as companion)
Mark tries it on behind the curtain. Each step: Mark says something in English (companion line), the player types the
Italian. The English prompt in the typer shows the sentence to translate, like Lesson 6.
1. Mark: "It's too small! Does she have a bigger one?" → *È troppo piccola. Ha una taglia più grande?*
   (accept *Avete …*, and *la extra large*). Hints: *piccolo* → feminine; missing *troppo* → "too = **troppo**".
   Teresa: *Più grande? Sì, ecco la extra large.* … *Le sta benissimo!*
2. **CHOICE:** Mark: "What's she saying?" → ✓ "She says it looks great on you." / "She says it's too big." / "She says it's sold out."
   A wrong pick: Mark: "Hmm, really?" Then the line is replayed and the player picks again.
3. Mark: "She'd say that about a potato sack. Ask her if she really likes it." → *Le piace davvero?*
   Hint: *ti piace* → "Teresa is a stranger: **Le** piace."
   Teresa: *Certo! Il rosso Le sta benissimo!*
4. Mark: "I need an honest opinion. Isn't that Lucia over there, sketching?" → `l8-lucia`.

### 6 · The honest opinion (`lucia_opinion`, typing)
Lucia (Lesson 5) sits sketching near Gino's stall. She's still a stranger: Lei.
1. Mark: "Say hi to her, ask how she is." → *Buongiorno, Lucia! Come sta?*
   Lucia: *Oh, buongiorno! Bene, grazie. E Lei?* → Mark (whispering): "Say you're fine." → *Sto bene, grazie.*
2. Mark: "Ask her if she likes my shirt." → *Le piace questa maglietta?* (accept *la maglietta*, *la maglietta di Mark*).
   Lucia: *Mmm… il rosso? No, non mi piace. Il bianco è più elegante.*
3. **CHOICE:** tell Mark → ✓ "She doesn't like the red. She says white is more elegant." / "She loves it." / "She says it's too small."
4. Mark: "But Emma loves red! Tell her it's for Emma, and Emma likes red." → *È per Emma. A Emma piace il rosso.*
   Hint for *Emma piace*: "*Piacere* works backwards: red pleases Emma → **A Emma** piace il rosso."
   Lucia (laughing): *Allora: la maglietta bianca… e le rose rosse!*
5. **CHOICE:** → ✓ "White shirt… and red roses!" Mark: "White shirt, red roses. She's a genius." → `l8-buy`.

### 7 · Buying the shirt (`teresa_buy`, typing + listen)
1. Mark: "The white one, extra large. I'll take it." → *La bianca, extra large, per favore. La prendo.*
   Hints: *lo prendo* → "maglietta is feminine: **la** prendo"; *bianco* → **bianca**.
2. Teresa says the price (listening line; the same price Mark noted in Lesson 7, from `S.l7.prices`). The notepad from
   Lesson 7 asks for the total, and Mark checks it against his note: "Same as yesterday, good."
3. Mark hands you a twenty: "Tell her here's twenty." → *Ecco venti euro.*
   Teresa gives the correct change (listening line, *Ecco il resto: … euro*), and the notepad asks for the change.
4. Mark: "Perfect. I'll go and change into it. You get the roses, here's another twenty." → `l8-roses`.

### 8 · The roses and the wrong change (Gino, tiles + listen)
Alone. Number tiles 0–20 are in the bank here (a "Numeri" group, from the Lesson 7 dictionary).
1. Greet (*come sta?* optional).
2. *Avete le rose rosse?* (accept *Ha …*). Gino: *Sì! Un bel mazzo?*
3. *Quanto costa il mazzo?* → price (listening line; use Gino's Lesson 7 price) → the notepad.
4. *Lo prendo. Ecco venti euro.* Hint for *la prendo*: "**il** mazzo → **lo** prendo."
5. Gino: *Grazie! Ecco il resto: …* gives **two euros too little** (listening line). The notepad asks: "Change: € ___".
   The player types what they heard. Mark's note (or the game) shows what it should be. If the numbers differ, the
   guide says: "That's two euros short! Tell him."
6. *Scusi, il resto non è giusto. Mancano due euro.* (*mancano* + number tile + *euro*; accept any correct difference).
   Gino: *Oh! Mi scusi! Ecco due euro.* Then *Grazie, arrivederci!* → `l8-done` when Mark walks back.

### Optional · Pina's melon (tiles + listen)
After the practice, Pina's fruit stall is a real (optional) stall: greet → *Quanto costa il melone?* → the price by ear
(a listening line, then the notepad) → *Lo prendo. Ecco … euro.* (any amount at least the price; *la prendo* gets "**Il**
melone is masculine: **lo** prendo") → the right change, as a listening line → *grazie, arrivederci*. It doesn't change
the lesson's progress (`S.l8.melonPrice`, `S.l8.melonPaid`); the completion screen lists the melon if bought.

## Handbook chapter
- **title:** *Mi piace!* · **sub:** Buying, and what you think
- **dialogue:** a shopper at a clothes stall: greeting → *Ha questa maglietta in verde?* → *No, mi dispiace, è finita.
  Le piace la nera?* → *Sì, mi piace! Posso provarla?* → *Certo. … Le sta bene!* → *La prendo. Quanto costa?* → *Sono dodici
  euro.* → *Ecco venti euro.* → *Ecco il resto: otto euro.*
- **phrases (What you say):** *Mi piace. / Non mi piace.* · *Le piace? / Ti piace?* · *Ha una maglietta rossa?* ·
  *È troppo piccola / grande.* · *Ha una taglia più grande?* · *La prendo. / Lo prendo.* · *Ecco venti euro.* ·
  *Il resto non è giusto. Mancano due euro.*
- **phrases2 (What you'll hear):** *È finita.* (sold out) · *Che taglia porta?* · *Le sta bene / benissimo.* · *Ecco il resto.* · *Un bel mazzo?*
- **extra (Colours):** rosso/rossa, bianco/bianca, nero/nera, giallo/gialla; *verde, blu, rosa, arancione* don't change.
- **how:** *Piacere* works backwards: the thing that pleases is the subject. *Mi piace il rosso* = red pleases me.
  *Le piace?* (polite) / *Ti piace?* (friend) / *A Emma piace…*. Colours ending in -o change like the noun:
  *la maglietta rossa*, *il mazzo rosso*. *La prendo* / *lo prendo*: the pronoun matches the thing.
- **culture:** At clothes stalls, trying on is often done behind a curtain or over your clothes. Gentle haggling is
  sometimes OK there, never at food stalls. Always count your change. Saying so politely is completely normal.
- **exercises (6–7):** agreement (*maglietta ___: rosso/rossa*), *mi piace* vs *Le piace* by situation,
  *la/lo prendo* (*il mazzo*), *troppo piccola* order exercise, the change sum ("12 euros, you pay 20, the change is…"),
  *A Emma piace* order exercise.

## Vocabolario
Added after the lesson was built (the word check, `ui/vocab.js`): the full list is the chapter's `vocab` field in
`src/lessons/08-mi-piace/content.js`. The loop gains `l8-vocab` ("Learn the Lesson 8 words") between `l8-handbook` and
`l8-practice`: the practice is locked until the word check (flashcards, then a quiz) is passed.
Colours: *rosso / rossa*, *bianco / bianca*, *nero / nera*, *giallo / gialla*, *verde*, *blu* · Sizes: *la taglia* (f), *piccolo / piccola*, *grande*, *troppo*, *più grande*, *extra large* · Liking: *Mi piace.*, *Non mi piace.*, *Le piace?* (polite), *Ti piace?* (friend), *A Emma piace …*, *davvero* · Buying: *Ha …?*, *Avete …?*, *È per …*, *La prendo.*, *Lo prendo.*, *Ecco …*, *il resto* (m), *non è giusto*, *mancano …* · Flowers: *le rose* (f pl; *rosse*), *il mazzo* (m).

## Tiles and parser (lesson hooks)
- Tile groups: "Al mercato" (Lesson 7's pack) + "Colori" + "Comprare" (*mi piace, Le piace?, la prendo, lo prendo,
  troppo, piccola/grande, una taglia più grande, ecco, il resto, non è giusto, mancano, euro*) + "Numeri" (0–20).
- Intents, e.g.: `like:me`, `like:le`, `like:ti`, `like:emma`, `colour:rosso:f`, `size:grande`, `too`, `bigger`, `take:la`,
  `take:lo`, `here_is`, `num:N`, `change_wrong`, `missing`, `really`. Also, the typed scripts' words must all be in the
  lexicon via the `phrases` hook (`readTyped` only knows words in `phraseTable`).

## Shared changes needed
1. **Lucia at the market in Lesson 8:** `sceneOf` uses `n.scene`. Either let the `place()` hook change `NPC.lucia.scene`
   (and restore it when not in Lesson 8), or add a `sceneOf` hook (preferred: `askHooks('sceneOf', n)` before the default).
2. **The notepad** already exists (`src/ui/notepad.js`): `askNumber({ label, onAnswer(n, pad), notes, prefix, tip })`.
   Reuse it for prices and change; extend it only if needed.
3. **CHOICE comprehension steps inside typed scripts:** a step type `{ choice:{ prompt, options:[…], correct } }`
   in `TYPED_SCRIPTS`, so the fitting and Lucia scenes can mix typing and choices. Add it to `conversation/typing.js`.

## Built in Lesson 7, available to reuse
`S.l7.prices` (each stall's price), `askNumber` (notepad), listening lines, the `hint(npc, st)` and `afterTurn(npc, out, res, words)`
hooks (stall hints that never say "introduce yourself"), `react` receiving the full intent list, the `CLAUSE` set in the
parser, the vendors' greeting behaviour, and the "Polite" tile group at stalls. Read `src/lessons/07-al-mercato/` first.

## Test plan (`tests/l08-mi-piace.js`)
Skip link to Lesson 8 → Mark → the Teresa barrier → handbook practice → colours alone (one *rosso* agreement mistake →
hint) → fitting (one wrong CHOICE, one *ti piace* → Le hint) → Lucia (one *Emma piace* → hint) → buying (prices and change
read from `__dbg()`) → roses (*la prendo* → lo hint; type the wrong change heard; *Mancano due euro*) → completion screen.
