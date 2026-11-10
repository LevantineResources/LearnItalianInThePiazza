# Lesson 11 · Al museo — design doc

## Summary
- **Story beat:** The player walks into the Museo d'Arte and is drawn straight to the *Pietà*: a short cutscene
  where the player walks up to it on their own and looks at it. They get too close, and the custodian jumps up
  shouting *"Troppo vicino!"* and moves them back behind the rope. The handbook pops up to translate. Then **Lucia**
  (the artist from Lessons 5 and 8) recognises the player and, with her sketchbook and a homework sheet for her art
  class, takes them round the museum: comparing works, describing them, saying how the people in them seem to feel,
  and what they like. The finale is ***Vedo, vedo… nel museo***: Lucia describes a work and the player finds it. It ends at Canaletto's view of Venice:
  *"Venezia… è bellissima! Lei va a Venezia?"*, setting up Lesson 12.
- **Teaching goal:** describing and comparing.
  - *più / meno … di* · *il più … della sala*
  - *questo / quello* used on their own, so comparisons need no articles: *Questo è più vecchio di quello*
  - *c'è / ci sono*
  - *è di …* (by …)
  - emotions with *sembrare*: *Secondo Lei, Gesù sembra triste o spaventato?*, agreeing with the person
    (*Giuditta sembra arrabbiata*)
  - *mi piace / mi piacciono* · *Cosa Le piace di questo quadro?*
  - *preferisco / preferisce*
  - museum rules: *troppo vicino, non si tocca, è vietato, senza flash*
- **Longer than the lessons before it:** a required task at **2 paintings in every room** (Sale 1–5) and at **2
  statues**, 12 in all; a practice of **10–12** questions; the *Vedo, vedo… nel museo* finale.
- **Review:**
  - adjectives and colours with agreement (Lesson 8), plurals (Lesson 9)
  - numbers for counting (Lesson 7), *vedo* and prepositions (Lesson 10)
  - *permesso* through crowds (Lesson 10)
  - Lei vs tu (and a culture beat at the end: Lucia offers *diamoci del tu*)
- **Modes:** the cutscene; TILES (Lucia, the custodian, visitors); the **crowd** (*permesso*); a **checklist**
  (Lucia's homework sheet, Lesson 9's notepad checklist); the **picture view** (E on a work); a **follower** (Lucia
  walks with you, like Mark in Lesson 5); the museum version of *Vedo, vedo*.
- **Where:** the museum interior, `galleria` (built: the atrium with five statues, Sale 1–4, and Sala 5 along the
  top with *La scuola di Atene* and four more Raphaels).
- **Depends on:** the end of Lesson 10 (the player has their ticket and walks in).

## Changes to the interior for this lesson (shared)
- **Visitors:** about 12–16 visitor NPCs (`lesson:11`, `scene:'galleria'`): couples, a school group with its
  teacher, an old man on a bench, a student sketching, a tourist with an audio guide.
  - Some **stand in front of paintings** the tasks need (`crowd:true`, the Lesson 10 *Permesso / Scusi / Prego*
    pick): the player must say *permesso* to see the painting. At least **one per room**.
  - Others wander slowly between rooms or sit on benches. A few say a line if spoken to (*Bellissimo, vero?*).
- **The custodian** is a man (*il custode*), on his chair by the *Pietà*.
- **All five statues are roped off.** Stepping inside a rope (or pressing E too close) gets the custodian's
  *"Troppo vicino!"* from his chair. That's a running gag that reinforces the word.
- **Sala 5:** *La scuola di Atene* stays on the back wall; the four new Raphaels go on its walls (their originals are
  in `assets/art-originals/Raffaello/`; they are commented out in `scripts/prepare-art.py` until Sala 5 hangs them:
  uncomment, re-run the script, hang them, and update `tests/galleria.js`'s counts):
  *Lo sposalizio della Vergine* (1504), *San Giorgio e il drago* (c. 1506), the *Autoritratto* (c. 1506), and
  *San Michele sconfigge Satana* (1518). The back stays as it is otherwise.
- **Not for phones:** no portrait layout needed.

## The loop

| # | `S.tut` | mode | objective | what happens |
|---|---|---|---|---|
| 1 | `l11-pieta` | CUTSCENE | — | On entering the museum the player's controls freeze. The player walks on their own to the *Pietà*, right up to the rope and over it. The guide: *Press E*. **Only E is accepted.** E opens the *Pietà*'s picture view. |
| 2 | `l11-custode` | CUTSCENE | — | On closing the picture: the custodian leaps up: *"Ehi! Troppo vicino! Troppo vicino! Non si tocca!"* He walks over and moves the player back behind the rope (a short scripted walk). |
| 3 | `l11-rules` | HANDBOOK | — | The handbook opens by itself on **Lezione 11**'s first box, *Al museo: le regole*: *Troppo vicino! = Too close! · Non si tocca = No touching · È vietato = It's forbidden · senza flash = without flash*. Closing it gives control back. The custodian, calmer: *"Grazie. Si guarda, non si tocca!"* |
| 4 | `l11-lucia` | TILES | Talk to the woman with the sketchbook | **Lucia** walks up: *"Ma… Lei è {Me}? Il Gattamelata! Si ricorda?"* The player greets her (Lei); she explains (simply): *Ho un compito per la scuola d'arte* (a homework sheet: compare, describe, choose). She stands between *Apollo e Dafne* and *Amore e Psiche*: *"Secondo Lei, quale è più bella? Questa o quella? E quale è più vecchia?"* → **the barrier**: the player can't compare. |
| 5 | `l11-handbook` → `l11-vocab` → `l11-practice` | — | Open your handbook / Learn the words / Finish the practice | Chapter 11, its Vocabolario check, and a **10–12 question** practice. |
| 6 | `l11-statues` | TILES | Help Lucia with the statues · 0/2 | Back with Lucia in the atrium: she starts following the player (`S.l11.follow`: the statue tasks are at three spots, and *questa / quella* needs the player standing at one of them), two statue tasks (below). Then her sheet goes into the notepad checklist. |
| 7 | `l11-rooms` | TILES + CROWD | Lucia's sheet · k/10 | Two tasks in each room, in any order (below). Each task row is ticked. Visitors block some paintings, so *permesso*. |
| 8 | `l11-vedo` | GAME | Find the works Lucia describes | When the 10 are done: *Vedo, vedo… nel museo* (below). Lucia describes a work in Italian; the player walks to it and presses E. |
| 9 | `l11-venezia` | TILES | — | Lucia leads the player to Canaletto's *L'ingresso del Canal Grande* (Sala 3): her favourite. *"Questo è il mio quadro preferito. Venezia… è bellissima! Lei va a Venezia?"* → *Sì! / Non lo so…* Then the culture beat: *"Senta… possiamo darci del tu?"* (Shall we use tu?) → *Sì, certo!* From now on Lucia uses tu. |
| 10 | `l11-done` | — | Lezione 11 completata | Lucia: *"Ciao, {Me}! Buon viaggio!"* Completion screen (the homework sheet, filled in). |

## The tasks
Lucia asks; the player answers with tiles. Some answers are **objective** (checked against the works' data: date,
size, number of people, animals), others are **opinions** (any well-formed answer is accepted; Lucia reacts). Lucia
uses Lei throughout (until step 9). Visitors marked ⛔ stand in front of the work: the player must use *permesso*
first.

**Statues (atrium, 2 required, from these):**
- **Apollo e Dafne vs Amore e Psiche:** *Quale è più vecchia?* → *Questa è più vecchia di quella* (at Apollo, 1625
  vs 1793). *Quale preferisce?* → *Preferisco questa / quella* (opinion).
- **La Pietà:** *Secondo Lei, Maria sembra felice, triste o arrabbiata?* → *Sembra triste* (accept *calma* too,
  with Lucia agreeing). *Cosa Le piace di questa statua?* → *Mi piace il viso / Mi piacciono i colori…* (opinion,
  but *i colori* of a marble statue → Lucia laughs: *Ma è bianca!*).
- **Perseo vs Forme uniche:** *Quale è più alta?* (320 vs 111 cm) → *Questa è più alta di quella.*

**Sala 1 · Gotico e primo Rinascimento (2 of):**
- *La battaglia di San Romano*: *Quanti cavalli ci sono?* → *Ci sono … cavalli* (any reasonable count; Lucia: *Sì,
  tanti!*). ⛔ the school group.
- *Orazione nell'orto*: *Secondo Lei, Gesù sembra felice, spaventato o triste?* → *Sembra triste / spaventato*.
- *L'Annunciazione* vs *Il pagamento del tributo*: *Quale è più vecchio?* → at the Martini: *Questo è più vecchio
  di quello* (1333 vs c. 1425).

**Sala 2 · Il Rinascimento (2 of):**
- *La Primavera*: *Quante persone ci sono?* → *Ci sono nove persone* (Lucia accepts 8–9, she isn't sure about the
  flying Cupid). ⛔ a couple.
- *La dama con l'ermellino* vs *Bacco e Arianna*: *Quale è più piccolo?* → at the Leonardo: *Questo è più piccolo
  di quello.*
- *La tempesta*: *Cosa vede?* → *Vedo una donna, un uomo, un bambino…* (Lesson 10's *vedo* plus nouns), then
  *Cosa Le piace di questo quadro?* (opinion).

**Sala 3 · Il Barocco (2 of):**
- *Giuditta e Oloferne*: *Secondo Lei, Giuditta sembra felice, arrabbiata o spaventata?* → *Sembra arrabbiata*
  (also accept *calma*: Lucia: *Sì! È strano, vero?*). Then *E Oloferne?* → *Sembra spaventato* (agreement: m/f).
  ⛔ a tourist with an audio guide.
- *La vocazione di San Matteo*: *È più chiaro o più scuro di quello?* (vs Reni) → *È più scuro.*
- *Il mangiafagioli*: *Secondo Lei, l'uomo sembra felice?* (opinion; Lucia: *Sembra sorpreso!*).
- (Canaletto is kept for the ending.)

**Sala 4 · Dopo il 1900 (2 of):**
- *Dinamismo di un cane al guinzaglio*: *Che animale c'è?* → *C'è un cane!* (Lesson 10's *il cane*). ⛔ a student
  sketching.
- *La città che sale* vs *Il canto d'amore*: *Quale è più moderno?* → at the de Chirico (1914 vs 1910): *Questo è
  più moderno di quello.*
- *Ritratto di Chaim Soutine*: *Secondo Lei, sembra felice o triste?* (opinion).

**Sala 5 · Raffaello (2 of):**
- *La scuola di Atene*: *È il più grande del museo?* → *Sì, è il più grande!* ⛔ a school group.
- *San Giorgio e il drago* vs *San Michele*: *Quale è più grande?* → at San Michele: *Questo è più grande di quello*
  (268 cm vs 29 cm; a funny pair: the tiny dragon fight and the huge one).
- *Autoritratto*: *Quanti anni ha, secondo Lei?* is too far (age isn't taught): instead *Sembra giovane o vecchio?*
  → *Sembra giovane* (*giovane* is new; it's in the Vocabolario).

Hints follow the rule in CLAUDE.md: they say what Lucia wants in English (*She's asking which one is older: check
the dates on the plaques*), never the Italian sentence; agreement feedback names the player's own word.

## *Vedo, vedo… nel museo* (the finale)
Lesson 10's I spy, flipped into the museum: instead of clicking in a picture, the player **walks to the work**.
- Lucia sits on the bench in Sala 5 (at its east end, so she is never in the way of *La scuola di Atene*) and says *"Adesso giochiamo! Vedo, vedo… un quadro…"*, followed by a description
  built from the lesson's Italian:
  - *…un quadro con un cavallo bianco.* (San Giorgio)
  - *…un quadro di Caravaggio, più piccolo di quello di Reni.* (Giuditta: comparisons are made with *quello di* an artist
    who has one work here, since *della* is not taught)
  - *…un quadro. Una donna sembra arrabbiata.* (Giuditta: the emotion is a second sentence; *dove* is not taught)
  - *…un quadro con più di dieci persone.* (*tante* and *tempio* are not taught)
  - *…è di Boccioni. Non è un quadro!* (Forme uniche; *ma* is not taught)
  The descriptions are generated from the tags (ui/museum-ispy.js); Canaletto is excluded (kept for the ending).
- The player walks to the work and presses **E** in front of it (the plaque doesn't open: E picks it). Right → *"Sì!
  Esatto!"*, the next round. Wrong → *"No, non è questo. È più …"* (a comparison with the work the player picked, as a
  clue), and the panel shows that work's date and size.
- **5 rounds**, getting harder: one feature → two features → a comparison → an emotion. Visitors still block some
  works (*permesso*). The custodian still guards the statues.
- Lucia's lines are spoken with the text shown (reading + listening), the English hidden; *Ripeti* replays.
- Afterwards it joins Studio as a game (random works, no time limit).
- **Data:** each work in `assets/art/manifest.json` gets tags (people count, animals, main colours, emotions shown,
  notable things: a horse, a dragon, angels, a temple), written by hand and checked against the images. The
  descriptions are generated from the tags, so they're always true.

## Handbook chapter
- **title:** *Al museo* · **sub:** Describing, comparing, and how people seem
- **first box (opens after the custodian):** *Al museo: le regole*: *Troppo vicino! · Non si tocca · È vietato fare
  foto con il flash · Si guarda, non si tocca*.
- **dialogue:** two friends at two paintings: *Quale è più vecchio? — Questo è più vecchio di quello.* · *Quante
  persone ci sono? — Ci sono tre persone.* · *Secondo te, lui sembra triste? — No, sembra arrabbiato!* · *Cosa ti
  piace di questo quadro? — Mi piacciono i colori.* · *Quale preferisci? — Preferisco questo.*
- **phrases:**
  - *più … di / meno … di*
  - *il più grande della sala*
  - *questo / quello · questa / quella*
  - *c'è / ci sono*
  - *è di Caravaggio*
  - *sembra triste*
  - *Secondo Lei / te…*
  - *mi piace / mi piacciono*
  - *Cosa Le piace di…?*
  - *preferisco*
- **phrases2 (you'll hear):** *Troppo vicino!* · *Non si tocca!* · *Bellissimo, vero?* · *Possiamo darci del tu?*
- **extra:** the emotions with pictures: *felice, triste, arrabbiato/a, spaventato/a, sorpreso/a, calmo/a, stanco/a*.
- **how:**
  - **Comparatives.** *più* + adjective + *di*. With *questo / quello* on their own you don't need an article:
    *Questo è più vecchio di quello.* (With a name: *più vecchio della Primavera*: *di + la = della*, which comes later.)
  - **Agreement.** The adjective agrees with the thing: *questa statua è più vecchia di quella*. *Sembra* + an
    adjective that agrees with the person (*Giuditta sembra arrabbiata, Oloferne sembra spaventato*).
  - **Mi piace / mi piacciono.** *Mi piace* + one thing, *mi piacciono* + more than one (*i colori*).
  - **Preferire.** *Preferisco* (I), *preferisce* (Lei), *preferisci* (tu).
- **culture:**
  - In Italian museums you don't touch, and many forbid flash.
  - *Darsi del tu*: when someone you've been calling *Lei* suggests switching to *tu*, it's a small friendly
    milestone.
- **exercises (10–12):**
  - choose *più … di* sentences from pictures with dates or sizes
  - agreement (*questa statua è più vecchio/vecchia*)
  - *c'è / ci sono* + a count
  - emotions from a face (emoji)
  - *mi piace / mi piacciono*
  - *preferisco / preferisce*
  - an order exercise (*questo è più grande di quello*)
  - *Non si tocca* meaning
  - *Secondo Lei* vs *Secondo te* (stranger vs friend)

## Vocabolario (required, 42 terms; the limit is 50)
Only the essentials: words the tasks need the player to *say* or must understand to answer. Everything else Lucia
or the custodian says has an English gloss.
- **At the museum (5):** il quadro, la statua, la sala, il pittore, il custode
- **The rules (3):** troppo vicino, non si tocca, è vietato
- **Comparing (7):** più … di, meno … di, il più …, questo / questa, quello / quella, c'è / ci sono, è di …
- **Describing (10):** vecchio/a, moderno/a, grande, piccolo/a, alto/a, scuro/a, chiaro/a, bello/a, giovane, strano/a
- **Feelings (8):** felice, triste, arrabbiato/a, spaventato/a, calmo/a, sorpreso/a, sembra, secondo Lei / te
- **Liking (4):** mi piacciono, Cosa Le piace di…?, preferisco, preferisce
- **In the pictures (4):** il cavallo, la persona / le persone, l'angelo, il viso
- **The game (1):** Trova! (find it)

## Verbs (for the grammar drill)
- **sembrare:** sembra (he/she seems; you seem, polite), sembrano (they seem)
- **preferire** (-isc-): preferisco (I), preferisci (you, friend), preferisce (he/she; you, polite)
- **piacere:** mi piacciono (I like, plural), Le piace (review)
- **toccare** (impersonal): non si tocca (recognition only)

## Hard mode
Alternatives the lexicon must accept:
- *Quello è più vecchio di questo* (the reverse comparison, when correct)
- *È più vecchio*
- *Sì, è più grande*
- *Secondo me, sembra triste*
- *Mi piace molto*
- *Preferisco quello*
- *Ci sono tanti cavalli*

## Shared changes needed
1. **The cutscene system:** freeze the controls, a scripted walk for the player (and for NPCs), accept only certain
   keys (here E). Reusable.
2. **Interior changes:** the visitors (crowd and idle wanderers), the custodian (a man), all statues roped, the
   *"Troppo vicino!"* rope trigger, and the four Raphaels hung in Sala 5.
3. **The handbook opening at a given section** (the rules box) from code.
4. **The museum *Vedo, vedo*** (`world/galleria.js` or `ui/ispy.js`): rounds generated from per-work tags (added to
   `assets/art/manifest.json`), the player walks to the work and presses E; a Studio entry afterwards.

## Test plan (`tests/l11-al-museo.js`)
- Skip link to Lesson 11 → the cutscene: only E works; the *Pietà* opens; the custodian; the rules box.
- Lucia's greeting → the barrier → handbook, word check (one wrong answer), practice (10–12).
- The two statue tasks: one agreement mistake (*questa è più vecchio* → feedback).
- The 10 room tasks:
  - at least two crowd blocks cleared with *permesso*, and one *Scusi* hint
  - one wrong objective answer (*Questo è più vecchio* when it isn't → Lucia: *Davvero? Guardi la data!*: Lucia is still on Lei, and *sicuro* would need the player's gender)
  - one emotion with the wrong agreement
- *Vedo, vedo… nel museo*: 5 rounds (targets read from `__dbg()`), with one wrong work → a comparison clue.
- The Canaletto ending, then *darsi del tu*; afterwards Lucia uses tu.
- The completion screen.
- No hint contains the Italian answer.
