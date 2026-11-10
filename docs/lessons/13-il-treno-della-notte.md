# Lesson 13 · Il treno della notte — design doc (draft)

The first of two train lessons (Lesson 14 is the morning mystery). Not realistic on purpose: a grand old night train,
*Il Laguna Express*, that takes the long way through the night and reaches Venice at dawn.

## Summary
- **Story beat:** The player boards the 23:15 at Padua (the end of Lesson 12) and finds their compartment. In the
  dining car they meet everyone aboard: introductions, small talk, telling people about their day. The handbook
  teaches the past tense with *avere*, and the player goes to bed. Nothing goes wrong tonight, but **the clues for
  Lesson 14 are planted in the background**.
- **Teaching goal:** the **passato prossimo with *avere***.
  - *ho / hai / ha / abbiamo* + the past participle
  - *-are → -ato, -ere → -uto, -ire → -ito*
  - common irregulars: *visto, preso, fatto, detto, letto*
  - *Cosa ha fatto oggi?* · *Ho visto il museo, ho mangiato un gelato, ho ballato!* (the player's own Lesson 12 day)
- **Review:** introductions (Lesson 1), *Di dove sei/è?*, food and ordering (Lessons 2 and 4), *mi piace*, time,
  *permesso* in the narrow corridor, translating for an English speaker.
- **Where:** the train, **3 cars** (a horizontally scrolling scene, with night scenery passing in the windows):
  1. **The sleeper car:** a corridor with numbered compartments (the player's, the owner's, room 14 for the elderly
     couple, the kids' room next to it…).
  2. **The dining car:** tables, the chef's counter and kitchen hatch.
  3. **The front (control) car:** the driver's cab, its door at the end.

## The cast (all new, 7 people + 2 children)
| who | language | in Lesson 13 (the clues) |
|---|---|---|
| **Margaret**, the dog's owner | English only | Dines with her small dog at her feet. Asks the player to translate the menu for her. |
| **Biscuit**, her small dog | — | Sits by her chair; later begs at the kitchen hatch. |
| **Nino**, the chef | Italian, fast, warm | Feeds the dog a scrap "just this once". |
| **la signora Ferri**, the mother of the two children (Lei) | Italian, polite, tired | Says the kids are *already asleep*, finally. Mentions they've always wanted a dog (*I bambini vogliono sempre un cane!*). |
| **Luca and Sofia**, her children | Italian (tu) | Peek into the dining car in pyjamas, staring at the dog, and get sent back to bed. |
| **Gianni**, the driver (*il macchinista*) | Italian, gruff | Eats quickly at the counter and leaves with a little parcel of leftovers (for his secret dog). |
| **il signor Rinaldi**, the businessman | Italian, distracted | On his phone, notices nothing. |
| **Ernesto and Lina Bassi**, the elderly couple (room 14) | Italian, chatty | Early to bed, early to rise. Love to talk about their 50 years of marriage. |

## The loop
(Reordered after the designer's playthrough of 7 Nov 2026: the past tense comes first, in the compartment; dinner with Margaret;
then the introductions; then the day. The dinner "barrier" is gone.)

| # | `S.tut` | what happens |
|---|---|---|
| 1 | `l13-board` | Night, on the platform: the conductor's whistle; on board. The guide: find your compartment (a number on your ticket). The corridor is narrow: *permesso* past the businessman. |
| 2 | `l13-handbook` → `l13-vocab` → `l13-practice` | Compartment 17. A card on the table: dinner at 23:45; on a train people always ask what you did today, and you can only say what you *do*. Chapter 13 (the past with *avere*, *prima / dopo*, *anche*), its Vocabolario check (≤ 50), the practice (12). |
| 3 | `l13-dinner` | The dinner call. The dining car: Nino seats the player with Margaret (English). Margaret asks for help with the menu: the order, typed (as in Lesson 4). Dinner; Nino's scrap for the dog. Then Margaret: "Go round and tell them who I am!": the player introduces themselves **and Margaret** at each table (*Mi chiamo Sam. Lei è Margaret. È inglese, di Londra. Non parla italiano.*). |
| 4 | `l13-day` | Lina and Ernesto: a full conversation about the day, from the player's real Lesson 12 quests (*Prima di ballare, ho mangiato un gelato*; Ernesto: *E dopo?*; Lina: *Ha visto il tramonto sul ponte?* → *Sì, ho…*; *Ha comprato il formaggio?* → *No, ma ho…*); Margaret: "Tell them I saw the church too!" → *Anche Margaret ha visto la chiesa*; *E perché Venezia?* Then la signora Ferri calls the two of you over: the dog is cute, her children love dogs (the player translates both ways). Then the background beats. |
| 5 | `l13-night` | Late: the kids are shooed back, the driver leaves with his parcel, the dog begs at the hatch, everyone goes to bed. Nino: *Quando arriviamo a Venezia?* In the compartment: *Buonanotte!* Sleep. → the completion screen. |

## Vocabolario (≤ 50; essentials only)
As built (48 listed, 36 cards): the past (*ho / ha / abbiamo visto, Cosa ha fatto oggi?*), 12 participles (*visto, preso, fatto, acceso,
mangiato, assaggiato, comprato, aiutato, portato, ballato, bevuto, sentito*), *prima, prima di…, dopo, anche*, *perché, quando* (and *e, poi, ma* listed as a recap without cards: Lesson 2 teaches them),
dinner (*Lei è…, di Londra, Buonasera!, Buonanotte!, arriviamo*), the dog (*il cane, È carino!, si chiama, i bambini, ama / amano*), why
Venice (*È bellissima!, l'arte, il mare*), and *Your day in Padua* (11 words of the quests' things, listed without cards: *la basilica* (a
card), *la mamma, qualcosa, il messaggio, la candela, l'aquilone, la foto, il gelato, il tramonto, l'aperitivo, in piazza, sul ponte*).
The train words (*il vagone, la cabina, il cuoco, il macchinista, il genitore*) and *per lei* (Lesson 4) are no longer in the list.

## Shared changes needed
1. **The train scene:** 3 cars, horizontal scrolling (the museum's camera), sliding doors between cars, numbered
   compartment doors (knock / enter), windows with night (and dawn, for Lesson 14) scenery scrolling past, a gentle
   rocking.
2. **"What did you do today?" from the player's real Lesson 12 history:** tiles generated from the completed quests.

## Names (decided)
Margaret and her dog Biscuit (the name pays off when the kids give him a last biscuit in Lesson 14); Nino the chef;
la signora Ferri with Luca and Sofia; Gianni the driver; il signor Rinaldi; Ernesto and Lina Bassi in room 14. Gianni's own
dog (Lesson 14) is Brigante.

## As built (notes)

**Files.** The train (shared, Lesson 14 reuses it): `src/world/treno.js` (layout, collision, doors, knocking, the
compartments' scenes, dogs, the camera's look, the sound), `src/render/treno.js` (the cars, the view in the windows, the
track, the compartments' interiors, `drawDog`). The cast: `src/content/npcs.js` (the last block). Lesson 13:
`src/lessons/13-il-treno-della-notte/` (`content.js` tiles, the day map, the chapter; `flow.js` the states, places, beats,
completion; `dinner.js` the conversations and the typed order). Test: `tests/l13-train.js`. Screenshots: `review/l13/`.

**The scene `treno`** (2480 × 600, the camera follows the player; west → east, the train runs east):
| car | x | what is there |
|---|---|---|
| sleeper (*vagone letto*) | 0–1060 | vestibule x 20–140 (boarding: spawn (80, 290); outside door `tr-porta`), corridor y 176–258 (walkable y 188–244: one person blocks it), compartment doors 11–18 in its south wall at x = 195 + 110·k (door ids `comp:<n>`, stand at (x, 236)) |
| gangway | 1060–1100 | open band y 186–250, sliding doors at x 1060 / 1100 (open by themselves) |
| dining (*vagone ristorante*) | 1100–2000 | tables N1–N4 along the windows (cx 1230, 1390, 1550, 1710; y 186–228), S1–S4 along the south wall (y 476–518); seats west / east of each (`trenoSeat('N1', 'w')` → (1176, 212)); the counter x 1820–1846, y 340–500, its stools x 1796; the kitchen x 1890–2000, y 274–520; the kitchen hatch at (1890, 296–340), a dog begs at `TRENO.hatch.spot` (1868, 318) |
| gangway | 2000–2040 | as above |
| front car | 2040–2480 | luggage, mail sacks, a bench; the driver's cab wall at x 2400 with its door at (2400, 217) (door `cab`; stand at (2370, 217)) |

**Who sleeps where:** 11 Margaret (and Biscuit), 12 il signor Rinaldi, 13 empty, **14 Ernesto and Lina Bassi**, **15 Luca and
Sofia** (the Ferri children: right next to 14, so "the room next to ours" can only be 15), 16 la signora Ferri, **17 the
player** (`TRENO.mine`; the ticket in the bag says *carrozza 5 · cabina 17*), 18 empty. Gianni drives (the cab); Brigante is in
`scene:'away'` until Lesson 14 puts him somewhere. The children's default scene is `cabina15`.

**Lesson 13's places** (`L13S()` in flow.js): Margaret N1 west, the player's seat N1 east (1284, 212), Biscuit (1202, 254)
sitting by her chair, then at the hatch after the beats (where Lesson 14 can say he was last seen); Ernesto N2 west, Lina N2
east; la signora Ferri S1 west; Rinaldi S2 west (on the phone; in the corridor at (305, 216) while you look for 17); Gianni on a
stool (1796, 470); Nino behind the counter (1856, 420). During la signora Ferri's translation Margaret sits opposite her (S1 east,
(1284, 494)), Biscuit at her feet (1290, 452), you at the table's end (1230, 448); then she walks back to N1. At bedtime (`l13-night`) the Bassis are in `cabina14`, la signora Ferri
in `cabina16`, Gianni `away` (the cab), Margaret still at her table with her tea, Biscuit at the kitchen hatch.

**The knock hook (Lesson 14).** E or a tap on a compartment door or the cab door → `trenoKnock(id)` (id = 11–18 or `'cab'`)
→ the lessons' **`knock(id)`** hook (return true when handled). Helpers: `trenoKnockFx(id)` ("Toc toc!" over the player, the
knock's sound), `trenoDoorSay(id, it, { en, ms, pitch, silent })` (a voice behind the door: a dashed bubble on the door,
spoken; `en` → a quiet toast), `trenoDoorOpen(id, true | false)` (the door slides open / shut: a promise), `trenoEnter(n, {
title, sub, spawn })` (into compartment n's interior, scene `cabina<n>`), `trenoLeave()` (back out to its door),
`trenoDoorSpot(id)`, `trenoWalk(npc, [[x, y], …], speed)` (a scripted walk that doesn't freeze the player: a promise),
`trenoLook(x)` / `trenoLook(null)` (the camera eases towards something happening, never losing the player). Without a hook:
your own compartment opens and you go in; any other door: "Toc toc!", nobody answers. In Lesson 13 the hook answers from 12
(Rinaldi, on the phone), 14 / 16 at night (Buonanotte!), 15 ("Shhh! … Mamma?": the children are awake…) and the cab ("Occupato!").

**The compartments' interiors** (`cabina11` … `cabina18`, 960 × 600, the room x 300–660): the window in the north wall (the
same scenery), the bunk along the west wall (door `cabina-letto`, label *Dormi* in `TRENO.mine`, else *Guarda*; a lesson's
`door` hook takes it: Lesson 13's sleep), a seat, a table under the window, a basin, luggage (`TRENO.look[n] = { color, bags,
kids }`: 15 has a teddy bear), the door out (`cabina-esci` → the corridor at that door). Spawn (520, 420). People go in with a
`sceneOf` hook (`'cabina15'`) and a `place` hook.

**Dawn and the lagoon.** `trenoSky()` → `'night' | 'dawn' | 'day' | 'lagoon'`: `TRENO.sky` (tests), else a lesson's
**`trenoSky()`** hook, else by `daytime()` (night → night, `'morning'` → dawn, afternoon → day). Lesson 14: `trenoSky(){ return … ?
'dawn' : 'lagoon'; }` (Venice on the horizon, the water, the posts). **`trenoMoving()`** → false stops the scenery, the rocking
and the clack (the arrival at Santa Lucia). Tests: `__debug.treno({ sky:'lagoon', moving:false })`.

**Dogs.** `animal:'dog'` NPCs are drawn by `drawDog` (size, coat, ears, patch, chest, collar). `n.sit = true` sits; `dogFollow(id,
'player' | npcId | null)` makes one trot after someone and sit when they stop; place one anywhere with `sceneOf` + `place`
(or `__debug.dog(id, { scene, x, y, sit, follows })`). They are ambient (E: a bark in a bubble) unless a lesson's `visitorTalk`
takes them. Biscuit: small, cream, red collar; Brigante: big, dark brown, white chest, green collar.

**Lesson 13's flow (reworked after the designer's playthrough, 7 Nov 2026).** `l13-board` ('platform': the conductor, the door → the
`l13-board` cutscene → the train; 'corridor': Rinaldi is a crowd member (the Permesso pick) until *Permesso!* sends him into 12; door 17 →
the `l13-cabin` cutscene, phase 'cabin') → **`l13-handbook` / `l13-vocab` / `l13-practice` in compartment 17** (the card on the table:
*Cena · ore 23:45*; the guide: on a train people always ask what you did today; the bunk says "not yet: the handbook, then dinner";
Nino before dinner: *La cena è alle undici e quarantacinque*) → the practice done: `l13AfterBook()` → the dinner call (the
`l13-dinnercall` cutscene, *Din-don! Signori, la cena è servita…*, 23:45) → `l13-dinner` ('arrive' → entering the dining car (x > 1112)
Nino comes; 'seat': his tile conversation (your name for the booking) and the walk to Margaret's table; 'meet': Margaret (English: from
London; help me order); 'order' (Nino comes with the menu as soon as her conversation closes): `TYPED_SCRIPTS.l13_order` (companion
`'margaret'`: two menu questions, *Per lei, il risotto ai funghi*, your own dish); 'eat': served, the scrap beat; 'intro': Margaret's
conversation opens by itself ("tell them who I am! I'm English, from London"), then the three tables) → `l13-day` (phase 'bassi': Lina
waves you over; 'ferri': la signora Ferri calls you both over, the typed translation; 'beats': the children, Gianni, Biscuit) →
`l13-night` (Nino: *Quando arriviamo a Venezia?*; to 17, E on the bunk) → `l13-done`. Old saves: `l13-barrier` (and an `l13-dinner`
before the practice) go to the handbook states; after the practice they continue where dinner was (`restore`, `l13AfterBook`). Skip:
`l13-done`, `S.l13.slept`, every clue seen; the world is left in the piazza in the afternoon (like Lesson 12's skip): Lesson 14's start
puts the player in `cabina17` in the morning.

**The introductions: you and Margaret** (phase 'intro', `L13_INTRO_LINES`, dinner.js `l13IntroTurn`). Each table wants three things, in
any order and any number per turn: your name (*Mi chiamo Sam*), who the lady is (*Lei è / Questa è / Le presento* + the **Margaret** tile;
her name alone is accepted with a tip), where she is from (*È inglese*, *di Londra*; Rinaldi instead asks *Parla italiano, la signora?*:
*Non parla italiano*, or *No*, or *È inglese*). After *Lei è Margaret* they ask her directly (*E Lei, signora, di dov'è?*) and Margaret's
English sits on your side ("You'd better answer for me"). The replies follow what was said (*Di Londra! Ernesto, Londra!*; *Non parla
italiano? Non importa: hello, signora!*). The bank: *A cena* (Buonasera, E Lei?, Di dov'è?, Sono inglese., Arrivederci, Sì, No) and
*Margaret* (Lei è, Questa è, Le presento, Margaret, È inglese, di Londra, Non parla italiano: Lesson 5's tiles). Objective *Introduce
yourself and Margaret · k/3*; 3/3 → `l13-day`. *È inglese*, *Non parla italiano* and *la chiesa* are read by the parser as one word each
(`l13Glue`: no-break spaces) so the shared brain's own answers to Lesson 5's intents (*Ah, inglese! Benvenuto in Italia!*) don't speak
first.

**The day from Lesson 12.** `L13_DAY` (content.js) is keyed by the quest's number in the design's list; each quest gives things with the
participles that fit, optional places / company (`L13_LOC`: *a trovare la mamma, in farmacia, a Chiara, al mercato, in basilica, con
l'aquilone, sul ponte, con Rosa*), a reply, a reply to the place, and for some Lina's question (`q`):
| quest | what you can say | Lina asks |
|---|---|---|
| 1 Dov'è la mamma? | *Ho aiutato una bambina (a trovare la mamma).* | — |
| 2 In farmacia | *Ho comprato qualcosa (in farmacia).* | — |
| 3 Il messaggio | *Ho portato un messaggio (a Chiara).* | — |
| 4 Il mercato coperto | *Ho comprato / assaggiato il formaggio (al mercato).* | *Ha comprato il formaggio al mercato?* |
| 5 In basilica | *Ho visto la basilica.* · *Ho acceso una candela (in basilica).* | *Ha visto la basilica del Santo?* · *Ha acceso una candela?* |
| 6 L'aquilone | *Ho aiutato un bambino (con l'aquilone).* | — |
| 7 Il caffè è finito! | *Ho preso / portato il caffè.* | *Ha preso un caffè in piazza?* |
| 8 Una foto sul ponte | *Ho fatto una foto (sul ponte).* | *Ha fatto delle foto?* |
| 9 La gelateria | *Ho mangiato / assaggiato un gelato.* | *Ha assaggiato il gelato?* |
| 10 Aperitivo con Rosa | *Ho preso un aperitivo (con Rosa).* | *Ha preso un aperitivo?* |
| 11 Il tramonto sul ponte | *Ho visto il tramonto (sul ponte).* | *Ha visto il tramonto sul ponte?* |
| 12 Musica in piazza | *Ho ballato in piazza.* (and *Prima di ballare, …*) | *Ha sentito la musica in piazza?* |
| everyone (Lesson 12's story) | *Ho comprato il biglietto.* · *Ho preso il treno.* | — |
`l13DayItems()` = the done quests' things + the two for everyone. **With fewer than three quests done (`l13Free()`: the skip link, a
quick Lesson 12) every quest's things are in the bank** and Lina asks about a random one. The bank: *Il passato* (Ho, Hai, Ha, Abbiamo),
*Participi* (those the things need, plus visto, preso, fatto, mangiato, comprato), *Oggi a Padova* (the things), *Dove · con chi* (the
places they allow), *Parole* (oggi, e, poi, prima, dopo, ma, perché, quando), *Prima di…* (prima di, partire, prendere il treno, ballare
when quest 12 is in), *Margaret* (from the *anche* stage: Anche, Margaret, la chiesa, la basilica), *Venezia* (from Ernesto's question),
*Rispondere*. A tile the set phrases already have (*e, poi, ma, Sì, No, E Lei?*: the general rule) is not shown twice, and a set phrase
is read by its words. A clause is avere + participle + thing (+ a place); feedback for the wrong person of avere, a missing participle or
avere, a participle that doesn't fit (*Ha mangiato il tramonto?!*), a place that doesn't fit, *Prima di* without a verb.

**The Bassis' conversation** (`l13Stage()`, from `S.l13`): 
1. **tell**: *Scusi, {Me}! Venga, venga: siamo curiosi! E Lei, cosa ha fatto oggi a Padova?* One thing → Ernesto: ***E dopo?*** (stage
   **dopo**: one more thing; *Dopo, ho…* gets *Ah, dopo! Bene, bene.*). Two things joined (*Prima ho visto la basilica, poi ho mangiato un
   gelato*) → *Che giornata!* and no *E dopo?*. *Prima di ballare / partire / prendere il treno, ho…* → the thing's reply and one for the
   "before" (*Prima di ballare! Per avere energia, eh?*).
2. **yes** (`S.l13.qYes`): Lina asks about a quest you did and haven't told yet, in the designer's order (tramonto, basilica, gelato, foto,
   formaggio, aperitivo, piazza, caffè, candela); free: any. No question to ask (every one told, or none of the quests done has one) →
   straight on.
3. **ma** (`S.l13.qNo`): Ernesto asks about a quest you did *not* do (*Ha comprato il formaggio al mercato?*); free, or none left: Lina's
   *Ha visto la Cappella degli Scrovegni?*.
   **Both questions are closed by any natural answer** (`l13AnswerTurn`, after the designer's evening playtest, 7 Nov: the conversation
   got stuck on *Ha assaggiato il gelato?*): *Sì* (→ *Sì? Un gelato! Io adoro il pistacchio!*, a tip: a whole sentence next time), *Sì, ho
   assaggiato il gelato*, *Sì, ho mangiato un gelato*, *Sì, un gelato* (the thing alone), *No* (→ *Ah, no? Peccato!*; in the *ma* question
   a tip: you can add what you did, with the word for *but*), *No, non ho assaggiato il gelato* (*non*: a Parole tile; the asked thing's
   tile and participles are in the bank even when it isn't one of your quests), *No, ma ho …*, *Ma ho …*, *No, ho …* (a tip: *ma*), or
   just another thing you did. Mistakes in the rest of the sentence get their feedback but don't hold the answer up. A turn that answers
   nothing (*Buonasera*) gets *Allora…?*: **a question is never asked twice** (only *Ancora una volta, per favore* says it again; reopening
   the conversation mid-question says it as the opening). The causes of the loop: a thing alone (*Sì, un gelato*, *No, ma il formaggio*)
   crashed `l13Clauses` (no participle: `L13_PP_OF[undefined]`), leaving the conversation stuck until it was reopened with the same
   question; and anything but a clause about the thing or *No* made Lina ask *E… ha assaggiato il gelato?* again.
4. **anche** — **once three things are told** (in any stage, whatever they were; `l13Advance`), or after the *ma* question if fewer were
   told: Lina: *Noi abbiamo visto la Cappella degli Scrovegni… e la basilica del Santo: bellissima!* (if you told them about the basilica:
   *Anche noi abbiamo visto la basilica del Santo…*, and Margaret's "The basilica! … tell them I saw it too, dear!"). Then the questions not
   asked yet (yes, ma), then *why*. Margaret (English, on your side):
   "The basilica? The big church with all the domes? Oh, tell them I saw the church too!" → ***Anche Margaret ha visto la chiesa*** (or *la
   basilica*) → *Anche la signora! Brava, signora!*, Margaret: "She's beaming at me." Feedback: *Margaret ho…* (ho is I), *Ho visto la
   chiesa* (that's you), no name (*Chi? Io?*), another participle (laughter), no *anche* (accepted with a tip). Hint step `day:bassi:anche`
   (key words *anche, ha visto* from the third try). Tests: tests/l13-day.js plays the Bassis six more times (different histories and
   answers, `__debug.l13Bassi([quest numbers])`): every question once, Margaret once, always to the goodbye.
5. **why**: Ernesto: *E perché Venezia?* as before (`L13_WHY`, `L13_WHY_REPLY`, `S.l13.reason`); after the reason Margaret's second
   interjection: "Ask them why they're going, dear. I bet it's a honeymoon."
6. **back**: *E Lei, perché Venezia?* → the anniversary (Margaret: "Fifty years!") and goodbye; or *Buonanotte / Arrivederci / Grazie* →
   goodbye. `l13BassiDone()` = `S.l13.why === 'done'`.
Everything right is recorded in `S.l13.told.bassi` (item keys) and `S.l13.said` (the sentences as said, for the completion screen).
Tests: `__dbg().l13` has `quests`, `free`, `stage`, `dayItems`, `dayTiles`, `pps`; `__debug.l13Data()` (the chapter's lists, every quest's
things). tests/l13-train.js plays the whole lesson in the new order with four quests done; tests/l13-day.js the Bassis with no history
(every quest's things, a random question) and the shared train's windows, dogs and knock hook. Screenshots: `review/l13-rework/` (the
compartment handbook, the introductions with Margaret, Lina's quest question, Margaret's interjection, la signora Ferri's translation,
Lina's random question). The set phrases' *Frasi fatte* tiles (*e, poi, ma, quindi, Ancora una volta per favore, Sì, No, E Lei?*) are read
by their words: *quindi* joins like *poi*, *Ancora una volta* repeats the question.

**La signora Ferri and Margaret** (phase 'ferri', `S.l13.ferri` 'call' → 'talk' → 'done', `S.l13.margAt`). When the Bassis' conversation
closes, la signora Ferri calls out (*Scusi! {Me}! Signora! Venite, venite!*); the `l13-ferri` cutscene walks Margaret to the seat opposite
her (S1 east, Biscuit after her) and you to the end of the table; then `TYPED_SCRIPTS.l13_ferri` (companion Margaret): *Ah, eccovi!
Signora, che bel cane! È carino! Come si chiama?* (no EN: a comprehension line) → a choice for Margaret ("She says Biscuit is cute, and asks
his name") → typed ***Si chiama Biscuit.*** → *Biscuit! Che nome simpatico! **I miei bambini amano i cani. Vogliono sempre un cane!*** (the
`ferriDog` clue, `ferri-vogliono`) → a choice ("Her children love dogs: they always want one") → typed ***Anche Biscuit ama i bambini!***
(feedback: *mi chiamo*, *amano*, a missing name / *anche*) → *Ma adesso i bambini, finalmente, dormono… Io sono stanchissima!* Then
Margaret walks back to her table (N1 west) with Biscuit, and the beats follow (the children peek in, Gianni's parcel, Biscuit at the
hatch, bed).

**quando (Nino at bedtime), `S.l13.askedWhen`** is unchanged: in `l13-night` the objective is *Ask Nino when the train gets to Venice*;
*Quando arriviamo (a Venezia)?* → the listening line `L13_ARRIVE` (*Domani mattina, alle sette e mezza. Buonanotte!*, `S.l13.arrive =
'7:30'`), then a pick of three times (`S.l13.heardWhen`). The bunk reminds you once (`S.l13.nudgedWhen`).

**The chapter.** *What you say*: the day from the quests (*Ho aiutato un bambino con l'aquilone, Ho acceso una candela*), *Prima … poi …*,
*Prima di ballare, ho mangiato con un'amica*, *Dopo, ho visto il tramonto*, *Anche Margaret ha visto la chiesa*, *No, ma…*, *Perché…*,
*Quando arriviamo…*; *What you'll hear*: *Ha visto il tramonto?*, *Ha assaggiato il gelato?*, *E dopo?*, *È carino! Come si chiama?*, *I miei
bambini amano i cani.* *How it works* adds **Prima, dopo** (prima · prima di + a verb · dopo) and **anche**, keeps the joining words.
*Per lei* is gone (Lesson 4). **Nothing in the review gives a practice answer away:** the cards' English no longer names the infinitive
(*sentito · heard*, the infinitive is in the card's note), and the practice's rule items use verbs that are on no card and not in *How it
works* (*parlare → ?*, *dormire → ?*). Practice (12): ho, parlare, dormire, ma, *Prima … poi …* (order), *Prima di ballare* (what happened
first?), *E dopo?*, *Anche Margaret ha visto la chiesa* (order), *Margaret ___ mangiato*, *Perché è bellissima* (order), *Ha assaggiato…?*,
*Ho visto il tramonto*.

**The clues for Lesson 14** (`L13_CLUES`, flow.js). When a beat happens, `l13Clue(id)` sets `S.l13.beats[id]` and pushes its
Lesson 14 notebook id into **`S.l13.seen`** (the notebook's *Ieri sera…* is filtered by it):
| beat | `S.l13.seen` id | what you see and hear |
|---|---|---|
| `scrap` | `nino-pollo` | Nino gives Biscuit a bit of chicken: *Tieni, piccolo: un pezzetto di pollo! Solo questa volta!* |
| `ferriDog` | `ferri-vogliono` | la signora Ferri, translated for Margaret: *I miei bambini amano i cani. Vogliono sempre un cane!* |
| `kids` | `bambini-guardano` | Luca and Sofia in pyjamas at the dining car's door: *Guarda, Luca! Un cane!*; sent back to bed |
| `gianni` | `gianni-avanzi` | Nino: *Ecco, Gianni: il tuo pacchetto. Gli avanzi, come sempre!* (he knows about Brigante); Gianni leaves for the cab |
| `beg` | `biscuit-cucina` | Biscuit trots to the kitchen hatch and begs: *No, no, piccolo! Basta!* |
| `bed` | `bassi-letto` | Lina: *Ernesto, è tardi! Andiamo a letto.* The Bassis go to bed early (room 14) |
| `phone` | `rinaldi-telefono` | Rinaldi: *Pronto? Sì, sì… domani mattina, a Venezia.* (he notices nothing) |
Each is a world bubble with the English in a quiet toast (`ferriDog` is a line of the typed translation); the camera looks towards the counter for Gianni and Biscuit.

**NPC ids.** The children are **`lucaferri`** and **`sofiaferri`** (names Luca, Sofia), not `luca` / `sofia`: those ids are
taken by quest 12's Luca (a man listening to the buskers) and Lesson 9's Sofia (the visitor from Milan), and an NPC id must be
unique. Both carry `l14who:'luca'` / `'sofia'` (Lesson 14's `L14_CAST` keys). Every other id is as Lesson 14 expects:
margaret, biscuit, brigante, nino, ferri, gianni, rinaldi, ernesto, lina.

**Not as designed / open.** The design's Vocabolario lists *oggi* and *stasera*: they were taught in Lesson 12, so they are
in the chapter's *How it works* but not in its list. The chapter has no `verbs` list: the Verbi drill's passato prossimo entries for Lesson 13 (mangiare, vedere, fare,
prendere, dire, leggere, comprare, ballare, sentire: `lesson:13, mood:'past'`) live in Lesson 14's content. The children's names (Luca, Sofia) are also the names of
quest 12's Luca and Lesson 9's Sofia: they are ambient here, so no name tile clashes (their ids: above).
The rework (7 Nov 2026): the quest sentences use the quests' story as docs/lessons/12-la-citta.md tells it (quests 4, 5, 8, 10, 11 are
being reworked in parallel; if their stories change, `L13_DAY` may need a word). *Ieri* is no longer a tile (nothing at dinner needs it;
*How it works* still mentions it). Margaret's *Anche Margaret ha visto la chiesa* is built with tiles in the Bassis' tile conversation
(their conversation stays one tile bank); her translation with la signora Ferri is typed. Lina's quest questions are one *Sì* question
and one *No, ma…* question per dinner (plus Ernesto's *E dopo?*), not one per stamp.
