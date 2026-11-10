# Quests, the bag, the passport, and day/night — design doc (draft)

The open town for Lesson 12 and after. Lessons stay the spine; **quests** are small optional tasks around town,
each with its own few words.

## Quests
- **Data-driven:** `QUESTS.push({ id, title_it, title_en, window:'any'|'afternoon'|'night', unlock(), place:{ scene,
  x, y }, giver, steps:[…], items, scheda, stamp })` in a quest's own file (`src/quests/NN-name/`), like lesson folders.
  The build picks them up automatically.
- **Steps** are small state machines (talk to X, give Y, buy Z, find W), using the existing engines (tile bank with
  hooks, typed scripts, the notepad, the dictated map, the crowd, listening lines) through quest hooks: the same hook
  keys as `LESSON_HOOKS`, so `askHooks` covers quests too while they're active.
- **The task list:** on the phone (a "Compiti" tab). Open quests, their place, the current step, and done ones with
  their stamp.
- **"!" on the map:** each available quest's place shows a "!" marker; clicking it travels there (an unlocked DEST,
  or a direct travel). Closed quests (wrong time of day) show greyed out with *chiuso · apre stasera* or similar.
- **In the world:** a quest giver has a quest marker over their head (as `OBJ_NPC` does for lessons).
- **Counting:** `S.quests = { [id]: { step, done, at } }`. Lesson 12 counts how many are done in each time window.

## The *scheda* (a mini chapter)
Each quest teaches its 5–10 words through a *scheda*: a single handbook card with a few phrases, a one-paragraph
"how", a culture line, its Vocabolario (the word check, flashcards and quiz) and 3–4 practice questions. It reuses
`ui/vocab.js` and the handbook's practice. It opens when the quest starts (or the first time its words are needed),
and its words join the dictionary and Studio (as "Quest: …" lists). The coverage test checks quests as well.

## The bag
- `S.bag = [{ id, label_it, label_en, for? }]`, shown on the phone (a "Borsa" tab) and in the header when it isn't empty.
- **Giving things in conversation:** a tile group "Nella borsa" with *Ecco …* + the item tiles. Giving the right item
  to the right person is a quest step: *Ecco la lettera!*, *Questo è per te / per Lei*.
- **Items:** the train ticket, Bruno's letter, the stamp, the medicine, the sketchbook, the cheese…

## The passport
A little *passaporto* on the phone: one stamp per quest (and per place visited), illustrated, with the date and
time of day. It's shown on Lesson 12's completion screen and kept for the rest of the game.

## Day and night
- **`S.daytime = 'afternoon' | 'night'`** (morning only for scripted scenes, such as the train). Lesson 12 switches it
  with the dusk cutscene; later lessons can set it.
- **Rendering:** every outdoor scene gets a night version: a dark-blue tint, lamps and lit windows glowing, warm
  pools of light under street lamps, the fountain lit, fewer people. Interiors are lit, and dark outside the windows.
  Done as a lighting pass over the existing backgrounds, not new art per scene.
- **Who's where:** NPCs and shops get `hours:{ afternoon:true, night:false }` (or a place per time). The bar closes
  at night (Enzo gone, the shutter down); the trattoria and gelateria open; Giulia is at the bar in the afternoon
  and in the piazza in the evening.
- **The dusk cutscene:** the bell tower chimes (a sound), the light fades over a few seconds, and an NPC line:
  *"I ristoranti sono aperti per la cena!"*. Then the map shows the night quests.
- **Overheard Italian** (later): pairs of NPCs chatting in short bubbles you can listen to as you walk past. Optional
  listening practice.

## Building order
1. **The systems:** quests, *scheda*, bag, passport, day/night with lighting, the "!" map spots. Plus the **station**
   scene, Lesson 12's opening and ticket, and the dusk cutscene. Test with 2 quests that use existing scenes:
   *Turista perso* and *La lettera di Bruno* (the tabaccheria as the first shop from the template).
2. **The shop template:** pharmacy, cartoleria, gelateria, plus their quests.
3. **The bigger new scenes,** a few at a time: the bridge view, the park, the covered market, the basilica interior,
   the San Lorenzo bar, the trattoria, with their quests.
4. **The night station** (23:00 → the 23:15 train) and the end of Lesson 12.

**After the unit:** quests not done move into free play (the task list keeps them; available any time).

## As built (first batch: the systems, the station, Lesson 12's frame, two quests)
- **Code:** engine/quests.js (state, hooks, the bag, the passport, `daytime()`), ui/quests.js (the phone's tabs, the scheda, the
  map's "!" spots, the header's clock and bag), world/daytime.js + render/night.js (hours, bells, the lighting pass),
  world/stazione.js + render/stazione.js (the station), lessons/12-la-citta/ (the lesson), quests/03-messaggio and
  quests/07-caffe (the templates). How to add a quest: CLAUDE.md, *Adding a quest*.
- **The two test quests** are *Il messaggio* (3, any time) and *Il caffè è finito!* (7, afternoon), not *Turista perso* and *La
  lettera di Bruno* as listed in *Building order* above: they use existing scenes only and cover the two patterns (a tile relay
  with a grammar check; a bag item given).
- **Counts while quests are missing:** Lesson 12 asks for min(3, the afternoon / any-time quests built) in the afternoon and
  min(2, the any-time / night quests not done yet) at night (`l12Need`). With today's two quests: 2 in the afternoon, then 0 at
  night: 23:00 comes right after the dusk. With all twelve it is the design's 3 + 2. Nothing to change when a quest is added.
- **Free play:** the town is open in Lesson 12 from `l12-explore` on and, once Lesson 12 is completed, at any time of day. In a
  later lesson the quests are dormant until that lesson opens the town with its own `townOpen()` hook, so a lesson under way
  never has a quest giver take over its people.
- **The scheda's tiles** appear in a conversation once the scheda is done (word check and practice), like a lesson's tiles
  after its practice; before that the hint sends the player to the scheda (phone → Compiti → Scheda).
- **Night:** interiors are not darkened, but their windows are not yet "dark outside" (no per-scene art). The dusk cutscene
  takes the player to the piazza ("Più tardi…") so that Giulia can call out; the bells are synthesised (Web Audio).
- **Passport:** quest stamps plus the lesson's own (Lesson 12: the ticket and the night train); no per-place stamps yet.
- **Review pass:** the dusk's light fades first and `S.daytime` turns to night when it is dark (the bar's shutter comes down
  then); the bag's tile group sits right after the set phrases when an item is for that person (`for` / `giveTo`), otherwise
  last; the header keeps one row with the clock and the bag (≥ 1181 px); passport stamps are in the order they were earned;
  no clock in free play after Lesson 12; a night with no quest left to do reads *Evening in town* (no "0/0").

## As built (second batch: the shop template and four quests)
- **The shop template** (world/shops.js, render/shops.js; CLAUDE.md, *Shops*): the pharmacy (San Lorenzo) and the gelateria (a new
  landmark beside the piazza). Interiors are lit at night and their shop windows show the dark street.
- **Dov'è la mamma?** (any time): Giorgia (tu) follows you once she has described her mum; Gino at the flower stall (Lei); by day
  Laura sits at Bar Centrale's tables, at night (the bar shut, the market closed but Gino still packing up) she has gone for an
  ice cream at the gelateria: *È andata a prendere un gelato, alla gelateria.* If night falls on the way to the bar she has moved
  on (the hint says so). The reunion is a cutscene, then Laura's thanks (Lei).
- **In farmacia** (any time): the list is sun cream, plasters, toothpaste; the shelves are searched in close-up; an aspirin for a
  headache is optional (on the bill). **La gelateria** (night): no notepad, the price is said plainly. **Musica in piazza**
  (night): whoever you invite first says no; the other says yes; the buskers speed up when you leave the first.
- **Counts:** with these six quests Lesson 12 asks for 3 in the afternoon and 2 at night (the design's numbers).

## As built (third batch: the bridge, the park, three quests)
- **The bridge** (scene `ponte`, world/ponte.js, render/ponte.js): Ponte Molino, the upper bridge on the map (nearest San Lorenzo
  and the centre). You walk on the deck; over the north parapet a perspective view upriver, painted once per sky (day, sunset,
  night): the houses along both banks, a bell tower, the domes on the far bank, the hills, a second bridge, the river mirroring
  everything. Its own lighting pass (not the generic one): warm at sunset, dark at night with pools of lamplight. The sky is
  `ponteSky()`: day in the afternoon; in the evening the **sunset** while *Il tramonto sul ponte* can still be played, until its
  lights cutscene (the sky fades to night over 7 s and the five lamps come on one by one); night after.
- **The park** (scene `parco`): the Giardini dell'Arena (the green square by the station and the museum). The big tree is a
  sprite whose canopy hides whoever walks behind it; the gardener's ladder and Pietro's kite are drawn where quest 6 has them.
  The generic night pass with `NIGHT_LIGHTS.parco`.
- **Una foto sul ponte** (8, afternoon; reworked after the designer's playthrough, see docs/lessons/12-la-citta.md *As built*):
  small talk first (Anna opens with *Che bella giornata, eh?*; one remark about the weather, one about the bridge; *Fa freddo* in
  the sun makes them laugh and doesn't count, at night in free play *C'è il sole* is the joke), then the player offers, *Vi faccio
  una foto?*, and they hand over **their phone** (*Ci fa una foto? Ecco il telefono.*; Anna holds it up for a selfie: the sprite
  prop `selfie`). The camera is a panel beside the transcript (like the dictated map): drag the frame (or the arrow buttons / keys)
  over both of them; the shutter refuses a picture with someone cut off; a picture before *Sorridete!* comes out serious
  ("Un'altra?"). The offer may come first; the stamp comes with the photo once the small talk is done (or with the small talk once
  the photo is taken).
- **Il tramonto sul ponte** (11, night; reworked likewise): Sara and Tommaso use *tu*. If quest 8 is done they remember you (*Ehi!
  Ancora tu! Il fotografo!*: known words, heard, not taught). Sara asks *Guarda il tramonto! Non è bello?*; answering it (*Sì! Che
  bel tramonto!*) or saying it yourself starts the lights cutscene (the dialog steps aside so the view can be seen, then Sara's
  conversation reopens; a fade the quest asks for, `PONTE.fadeMs`, always plays, even after a slow frame); then the lights (*Guarda
  le luci! … sono bellissime*: a slip with *è bellissimo* is recast and corrected) and the evening air (*Fa un po' freddo* / *C'è un
  po' di vento*: either, at any point, counts). In free play in the afternoon, starting it brings the sunset (`PONTE.evening`) until
  you leave the bridge.
- **L'aquilone** (6, afternoon): the gardener needs to hear where the kite is and to be asked for the ladder (either order; *Ci può
  aiutare?* gets "Che cosa c'è?"); then a cutscene (he fetches the ladder from his shed and leans it against the big tree), the
  climb (E or a tap at the ladder: a cutscene; the kite goes into the bag), and *Ecco l'aquilone!* to Pietro through the bag's
  tiles. Afterwards Pietro flies it over the lawn.
- **The partner who lets the giver talk** (Giulio, Tommaso): ambient people with the quest's `visitorTalk` + `redirect` hooks.
- **Shops:** the guide banner sits at the bottom left of the canvas in a shop, so the sign and the price board stay readable.
- **Counts:** with nine quests Lesson 12 still asks for 3 in the afternoon and 2 at night.

## As built (fourth batch: the covered market, the basilica, the aperitivo; all twelve quests)
- **Sotto il Salone** (scene `salone`, world/salone.js, render/salone.js): the arcaded hall under the Palazzo della Ragione, in from
  Piazza delle Erbe (its door `ragione`) once the town is open; shut at night (except in free play). North row: bread, Marisa's
  salumeria, cheese; south row: fresh pasta, wine and oil; pillars, hanging lamps; the way out at the bottom. Covered: lit, no night
  pass (`INTERIOR`). Landmark `salone` and DEST `salone` on the map.
- **The basilica** (scene `basilica`, world/basilica.js, render/basilica.js): in from Piazza del Santo's door `basilica`; open in the
  afternoon (and in free play). Its own light pass at all times (dim, candles, the altar, the red lamp). `SCENES.basilica.hush`:
  speech at volume 0.55 (engine/speech.js). The volunteer stands in the gap of the inner porch only while quest 5 is open or under way
  and you are not covered (never a trap in a later lesson). Person prop `shawl` (colour).
- **Il mercato coperto** (4), **In basilica** (5), **Aperitivo con Rosa** (10): see docs/lessons/12-la-citta.md, *As built*. Rosa's
  `scene` is a getter (Caffè Aurora while quest 10 is open or under way, and until you leave once it is done); Davide says
  *buonasera* in the evening. After the designer's playthrough Davide's drinks come in two cutscenes (`m10-bar`: he goes to the
  bar and you sit down; `m10-serve`: he brings them), with Rosa's *Di dove sei?* talk in between.
- **The map's labels** (ui/quests.js `mapLabelLayout`): each label, and a closed spot's note, takes the first clear place round its
  dot (above, stacked higher, the sides, below), clear of dots, landmarks, the pin and the labels before it; same-place quests stand
  side by side, 32 apart. Each spot has a hit rect over its dot, label and note.
- **The guide** (ui/hud.js `guideDock`): besides shops, a scene's `guideKeep:[{ x, y, w, h }]` moves it to the bottom left whenever
  the banner at the top would overlap one of those rects (the market's counter and signs; the bridge's deck; the basilica's candles,
  sacristan and door).
- **Counts:** with all twelve, Lesson 12 asks for 3 in the afternoon and 2 at night, as designed.
