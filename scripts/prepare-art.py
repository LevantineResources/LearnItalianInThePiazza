#!/usr/bin/env python3
"""Makes the game's art files from assets/art-originals/ (the full-size images):
assets/art/<id>.jpg|png (max 1600 px; statues keep their transparent background, trimmed to the statue), <id>.thumb.*, and manifest.json
with each work's room, title, artist, date and size. Run it after changing the originals:
    python3 scripts/prepare-art.py            (needs Pillow: pip install pillow)"""
import json, os, unicodedata
from PIL import Image
O = 'assets/art-originals/'
W = [  # id, original file, room (0 = atrium), kind, title it, title en, artist, date, size (cm), material
 ('martini-annunciazione','Gothic-early-renaissance/Simone_Martini_—_Annunciation_with_St._Margaret_and_St._Ansanus.jpg',1,'painting',"L'Annunciazione","The Annunciation",'Simone Martini','1333','184 × 210','tempera e oro su tavola'),
 ('masaccio-tributo','Gothic-early-renaissance/The_Tribute_Money_by_Masaccio.jpg',1,'painting','Il pagamento del tributo','The Tribute Money','Masaccio','c. 1425','247 × 597','affresco'),
 ('mantegna-orazione','Gothic-early-renaissance/Mantegna,_Andrea_-_Agony_in_the_Garden_-_National_Gallery,_London.jpg',1,'painting',"Orazione nell'orto",'Agony in the Garden','Andrea Mantegna','c. 1458','63 × 80','tempera su tavola'),
 ('uccello-san-romano','Gothic-early-renaissance/San_Romano_Battle_(Paolo_Uccello,_London)_01.jpg',1,'painting','La battaglia di San Romano','The Battle of San Romano','Paolo Uccello','c. 1438','182 × 320','tempera su tavola'),
 ('botticelli-primavera','High-late-renaissance/Botticelli-primavera.jpg',2,'painting','La Primavera','Primavera','Sandro Botticelli','c. 1480','207 × 319','tempera su tavola'),
 ('leonardo-dama','High-late-renaissance/Lady_with_an_Ermine_-_Leonardo_da_Vinci_(adjusted_levels).jpg',2,'painting',"La dama con l'ermellino",'Lady with an Ermine','Leonardo da Vinci','c. 1490','54 × 39','olio su tavola'),
 ('giorgione-tempesta','High-late-renaissance/Giorgione_-_Das_Gewitter.jpg',2,'painting','La tempesta','The Tempest','Giorgione','c. 1508','82 × 73','olio su tela'),
 ('tiziano-bacco','High-late-renaissance/Titian_Bacchus_and_Ariadne.jpg',2,'painting','Bacco e Arianna','Bacchus and Ariadne','Tiziano','1523','177 × 191','olio su tela'),
 ('carracci-mangiafagioli','Baroque/Carracci_-_Der_Bohnenesser.jpg',3,'painting','Il mangiafagioli','The Bean Eater','Annibale Carracci','c. 1584','57 × 68','olio su tela'),
 ('caravaggio-giuditta','Baroque/Caravaggio_-_Giuditta_e_Oloferne_(ca._1599).jpg',3,'painting','Giuditta e Oloferne','Judith Beheading Holofernes','Caravaggio','c. 1599','145 × 195','olio su tela'),
 ('caravaggio-matteo','Baroque/Caravaggio_—_The_Calling_of_Saint_Matthew.jpg',3,'painting','La vocazione di San Matteo','The Calling of Saint Matthew','Caravaggio','1600','322 × 340','olio su tela'),
 ('reni-atalanta','Baroque/Guido_Reni_-_Atalanta_and_Hippomenes_-_Google_Art_Project.jpg',3,'painting','Atalanta e Ippomene','Atalanta and Hippomenes','Guido Reni','c. 1619','206 × 297','olio su tela'),
 ('canaletto-canal-grande','Baroque/Canaletto_-_The_Entrance_to_the_Grand_Canal,_Venice_-_Google_Art_Project.jpg',3,'painting',"L'ingresso del Canal Grande",'The Entrance to the Grand Canal, Venice','Canaletto','c. 1730','50 × 73','olio su tela'),
 ('boccioni-citta','Modern/The_City_Rises_by_Umberto_Boccioni_1910.jpg',4,'painting','La città che sale','The City Rises','Umberto Boccioni','1910','199 × 301','olio su tela'),
 ('balla-cane','Modern/Giacomo_Balla,_1912,_Dynamism_of_a_Dog_on_a_Leash,_oil_on_canvas,_89.8_x_109.8_cm,_Albright-Knox_Art_Gallery.jpg',4,'painting','Dinamismo di un cane al guinzaglio','Dynamism of a Dog on a Leash','Giacomo Balla','1912','90 × 110','olio su tela'),
 ('dechirico-canto',"Modern/De_Chirico's_Love_Song.jpg",4,'painting',"Il canto d'amore",'The Song of Love','Giorgio de Chirico','1914','73 × 59','olio su tela'),
 ('modigliani-soutine','Modern/Amedeo_Modigliani_-_Chaim_Soutine_(1917).jpg',4,'painting','Ritratto di Chaim Soutine','Portrait of Chaim Soutine','Amedeo Modigliani','1917','92 × 60','olio su tela'),
 ('raffaello-atene','_The_School_of_Athens__by_Raffaello_Sanzio_da_Urbino.jpg',5,'painting','La scuola di Atene','The School of Athens','Raffaello','1511','500 × 770','affresco'),
 ('raffaello-sposalizio','Raffaello/sposalizio.jpg',5,'painting','Lo sposalizio della Vergine','The Marriage of the Virgin','Raffaello','1504','170 × 118','olio su tavola'),
 ('raffaello-san-giorgio','Raffaello/san-giorgio.jpg',5,'painting','San Giorgio e il drago','Saint George and the Dragon','Raffaello','c. 1506','29 × 22','olio su tavola'),
 ('raffaello-autoritratto','Raffaello/autoritratto.jpg',5,'painting','Autoritratto','Self-Portrait','Raffaello','c. 1506','48 × 33','tempera su tavola'),
 ('raffaello-san-michele','Raffaello/san-michele.jpg',5,'painting','San Michele sconfigge Satana','Saint Michael Vanquishing Satan','Raffaello','1518','268 × 160','olio su tela'),
 ('michelangelo-pieta','Statues/Pieta_de_Michelangelo_-_Vaticano_nobg.png',0,'statue','La Pietà','Pietà','Michelangelo','1499','174 × 195','marmo'),
 ('bernini-apollo','Statues/Bernini_Apollo_and_daphe_nobg.png',0,'statue','Apollo e Dafne','Apollo and Daphne','Gian Lorenzo Bernini','1625','243 (alt.)','marmo'),
 ('canova-psiche',"Statues/0_Psyché_ranimée_par_le_baiser_de_l'Amour_-_Canova_-_Louvre_1_nobg.png",0,'statue','Amore e Psiche',"Psyche Revived by Cupid's Kiss",'Antonio Canova','1793','155 × 168','marmo'),
 ('cellini-perseo','Statues/Perseus_(Benvenuto_Cellini)_2013_February_nobg.png',0,'statue','Perseo con la testa di Medusa','Perseus with the Head of Medusa','Benvenuto Cellini','1554','320 (alt.)','bronzo'),
 ('boccioni-forme',"Statues/'Unique_Forms_of_Continuity_in_Space',_1913_bronze_by_Umberto_Boccioni_nobg.png",0,'statue','Forme uniche della continuità nello spazio','Unique Forms of Continuity in Space','Umberto Boccioni','1913','111 (alt.)','bronzo'),
]
# TAGS: what is in each work, written by hand and checked against the images (Lesson 11's "Vedo, vedo… nel museo",
# ui/museum-ispy.js, builds its descriptions from these, so they must be true). Fields (all optional):
#  by: the artist as Lucia says it · people: [min, max] human figures (angels apart) · who: kinds clearly there (uomo,
#  donna, bambino) · whoMaybe: arguable ones · animals: { cavallo|cane|gatto: [named colours of it] } · animalsMaybe ·
#  angel / angelMaybe · hat: [colours] (a hat is there) / hatMaybe · table / tableMaybe · face: 'bianco' (a big white
#  face) · faces: portraits (il viso) · tone: 'scuro' | 'chiaro' (clearly dark / light) · scol / scolMaybe: a statue's
#  colour · feel: [{ who, is:[clear], maybe:[arguable] }] (adjectives in the masculine: arrabbiato → arrabbiata for a
#  woman) · colors: the main colours · things: notable things (for the record; the game only says taught words)
TAGS = {
 'martini-annunciazione': dict(by='Simone Martini', people=[3, 4], who=['uomo', 'donna'], angel=True, tone='chiaro', colors=['giallo', 'blu', 'rosso'],
   feel=[dict(who='donna', maybe=['spaventato', 'sorpreso', 'triste', 'calmo'])], things=['an angel (Gabriel)', 'little angels round God at the top', 'a vase of lilies', 'gold']),
 'masaccio-tributo': dict(by='Masaccio', people=[12, 14], who=['uomo'], colors=['rosso', 'blu', 'verde', 'rosa'],
   feel=[dict(who='uomo', maybe=['arrabbiato', 'calmo', 'sorpreso'])], things=['mountains', 'a house with an arch', 'a lake']),
 'mantegna-orazione': dict(by='Mantegna', people=[10, 20], who=['uomo'], angel=True, colors=['verde', 'rosa', 'blu'],
   feel=[dict(who='uomo', maybe=['triste', 'spaventato', 'calmo'])], things=['five little angels in the sky', 'rocks', 'a city', 'soldiers', 'rabbits', 'a bird on a tree']),
 'uccello-san-romano': dict(by='Paolo Uccello', people=[12, 40], who=['uomo'], animals=dict(cavallo=['bianco', 'nero']), animalsMaybe=['cane'], colors=['nero', 'bianco', 'rosso'],
   feel=[dict(who='uomo', maybe=['arrabbiato', 'spaventato'])], things=['horses', 'lances', 'armour', 'a flag', 'tiny dogs and hares far away']),
 'botticelli-primavera': dict(by='Botticelli', people=[8, 9], who=['donna', 'uomo'], whoMaybe=['bambino'], angelMaybe=True, colors=['verde', 'nero', 'bianco', 'rosso'],
   feel=[dict(who='donna', maybe=['felice', 'calmo', 'triste', 'spaventato']), dict(who='uomo', maybe=['calmo'])], things=['orange trees', 'flowers', 'Cupid flying']),
 'leonardo-dama': dict(by='Leonardo', people=[1, 1], who=['donna'], animalsMaybe=['gatto', 'cane'], tone='scuro', faces=True, colors=['nero', 'rosso', 'blu'],
   feel=[dict(who='donna', **{'is':['calmo']}, maybe=['triste'])], things=['an ermine (white)', 'a necklace']),
 'giorgione-tempesta': dict(by='Giorgione', people=[3, 3], who=['uomo', 'donna', 'bambino'], colors=['verde', 'blu', 'bianco'],
   feel=[dict(who='donna', maybe=['calmo', 'triste']), dict(who='uomo', maybe=['calmo'])], things=['lightning', 'a town', 'a bridge', 'two columns', 'trees']),
 'tiziano-bacco': dict(by='Tiziano', people=[8, 10], who=['uomo', 'donna', 'bambino'], animals=dict(cane=[]), tone='chiaro', colors=['blu', 'rosa', 'verde'],
   feel=[dict(who='donna', maybe=['spaventato', 'sorpreso']), dict(who='uomo', maybe=['felice'])], things=['two cheetahs', 'a small brown dog', 'a chariot', 'stars']),
 'carracci-mangiafagioli': dict(by='Carracci', people=[1, 1], who=['uomo'], hat=[], table=True, faces=True, colors=['bianco', 'marrone'],
   feel=[dict(who='uomo', **{'is':['sorpreso']}, maybe=['felice', 'calmo'])], things=['beans', 'bread', 'wine', 'a straw hat', 'a window']),
 'caravaggio-giuditta': dict(by='Caravaggio', people=[3, 3], who=['donna', 'uomo'], tone='scuro', colors=['rosso', 'nero', 'bianco'],
   feel=[dict(who='donna', **{'is':['arrabbiato']}, maybe=['calmo', 'spaventato']), dict(who='uomo', **{'is':['spaventato']}, maybe=['arrabbiato', 'sorpreso'])], things=['a sword', 'a red curtain']),
 'caravaggio-matteo': dict(by='Caravaggio', people=[7, 7], who=['uomo'], whoMaybe=['bambino'], hat=[], hatMaybe=['nero'], table=True, tone='scuro', colors=['nero', 'marrone', 'rosso'],
   feel=[dict(who='uomo', maybe=['sorpreso', 'calmo'])], things=['a window', 'a table', 'coins', 'hats with feathers']),
 'reni-atalanta': dict(by='Reni', people=[2, 8], who=['donna', 'uomo'], tone='scuro', colors=['rosa', 'nero', 'bianco'],
   feel=[dict(who='donna', maybe=['calmo']), dict(who='uomo', maybe=['spaventato', 'sorpreso', 'calmo'])], things=['golden apples', 'a crowd far away']),
 'canaletto-canal-grande': dict(by='Canaletto', people=[10, 40], who=['uomo'], tone='chiaro', colors=['blu', 'bianco', 'verde'], things=['gondolas', 'boats', 'a church with a dome', 'water', 'Venice']),
 'boccioni-citta': dict(by='Boccioni', people=[5, 20], who=['uomo'], animals=dict(cavallo=['rosso']), colors=['rosso', 'bianco', 'blu', 'giallo'],
   feel=[dict(who='uomo', maybe=['arrabbiato'])], things=['a huge red horse', 'workers', 'houses being built']),
 'balla-cane': dict(by='Balla', people=[0, 1], whoMaybe=['donna'], animals=dict(cane=['nero']), tone='chiaro', colors=['nero', 'bianco', 'grigio'], things=['a lead', "a lady's feet and skirt"]),
 'dechirico-canto': dict(by='de Chirico', people=[0, 0], face='bianco', colors=['verde', 'blu', 'rosso'], feel=[dict(who='uomo', maybe=['calmo', 'triste'])],
   things=["a statue's head", 'a red glove', 'a green ball', 'a train']),
 'modigliani-soutine': dict(by='Modigliani', people=[1, 1], who=['uomo'], tableMaybe=True, faces=True, colors=['blu', 'nero', 'verde', 'arancione'],
   feel=[dict(who='uomo', maybe=['triste', 'calmo'])], things=['a chair', 'a little table']),
 'raffaello-atene': dict(by='Raffaello', people=[50, 60], who=['uomo'], tone='chiaro', colors=['bianco', 'rosso', 'blu'], things=['arches', 'statues', 'steps', 'books']),
 'raffaello-sposalizio': dict(by='Raffaello', people=[15, 25], who=['uomo', 'donna'], tone='chiaro', colors=['rosso', 'blu', 'giallo', 'verde'],
   feel=[dict(who='donna', maybe=['calmo', 'triste']), dict(who='uomo', maybe=['arrabbiato', 'calmo'])], things=['a temple', 'a ring', 'a broken rod']),
 'raffaello-san-giorgio': dict(by='Raffaello', people=[2, 2], who=['uomo', 'donna'], animals=dict(cavallo=['bianco']), colors=['bianco', 'verde', 'marrone'],
   feel=[dict(who='donna', maybe=['spaventato', 'triste', 'calmo'])], things=['a dragon', 'a lance', 'armour']),
 'raffaello-autoritratto': dict(by='Raffaello', people=[1, 1], who=['uomo'], hat=['nero'], tone='scuro', faces=True, colors=['nero', 'marrone'],
   feel=[dict(who='uomo', **{'is':['giovane']}, maybe=['calmo', 'triste'])], things=['a black hat']),
 'raffaello-san-michele': dict(by='Raffaello', people=[1, 2], whoMaybe=['uomo'], angel=True, colors=['blu', 'rosso', 'marrone'],
   feel=[dict(who='angelo', maybe=['calmo', 'arrabbiato'])], things=['wings', 'a lance', 'a devil', 'fire']),
 'michelangelo-pieta': dict(by='Michelangelo', people=[2, 2], who=['donna', 'uomo'], scol='bianco', colors=['bianco'],
   feel=[dict(who='donna', **{'is':['triste']}, maybe=['calmo'])], things=['marble']),
 'bernini-apollo': dict(by='Bernini', people=[2, 2], who=['uomo', 'donna'], scol='bianco', colors=['bianco'],
   feel=[dict(who='donna', **{'is':['spaventato']}, maybe=['sorpreso']), dict(who='uomo', maybe=['felice', 'sorpreso', 'calmo'])], things=['laurel leaves', 'marble']),
 'canova-psiche': dict(by='Canova', people=[2, 2], who=['uomo', 'donna'], angelMaybe=True, scol='bianco', colors=['bianco'],
   feel=[dict(who='donna', maybe=['calmo', 'felice']), dict(who='uomo', maybe=['calmo', 'felice'])], things=['wings', 'marble']),
 'cellini-perseo': dict(by='Cellini', people=[1, 2], who=['uomo'], whoMaybe=['donna'], scolMaybe='nero', colors=['nero', 'verde'],
   feel=[dict(who='uomo', maybe=['calmo', 'felice'])], things=['a sword', "Medusa's head", 'bronze']),
 'boccioni-forme': dict(by='Boccioni', people=[0, 1], whoMaybe=['uomo'], scolMaybe='giallo', colors=['giallo'], things=['bronze', 'a striding figure']),
}
ROOMS = {1:'Sala 1 · Gotico e primo Rinascimento', 2:'Sala 2 · Il Rinascimento', 3:'Sala 3 · Il Barocco', 4:'Sala 4 · Dopo il 1900', 5:'Sala 5 · Raffaello', 0:'Atrio · Le sculture'}
os.makedirs('assets/art', exist_ok=True)
man = []
for (i, f, room, kind, it, en, artist, date, size, mat) in W:
    im = Image.open(O + unicodedata.normalize('NFC', f))
    if kind == 'painting':
        im = im.convert('RGB'); im.thumbnail((1600, 1600)); out = f'{i}.jpg'; im.save('assets/art/' + out, 'JPEG', quality=84, optimize=True, progressive=True)
        th = im.copy(); th.thumbnail((240, 240)); thumb = f'{i}.thumb.jpg'; th.save('assets/art/' + thumb, 'JPEG', quality=80)
    else:
        bb = im.getchannel('A').getbbox()                      # trim the transparent margins (the statue stands on the image's bottom edge)
        m = round(0.015 * max(im.size)); im = im.crop((max(0, bb[0] - m), max(0, bb[1] - m), min(im.size[0], bb[2] + m), min(im.size[1], bb[3] + 1)))
        im.thumbnail((1200, 1400)); out = f'{i}.png'; im.save('assets/art/' + out, 'PNG', optimize=True)
        th = im.copy(); th.thumbnail((200, 240)); thumb = f'{i}.thumb.png'; th.save('assets/art/' + thumb, 'PNG', optimize=True)
    man.append(dict(id=i, file=out, thumb=thumb, room=room, kind=kind, title_it=it, title_en=en, artist=artist, date=date, size_cm=size, material=mat, w=im.size[0], h=im.size[1], tags=TAGS[i]))
json.dump({'rooms': ROOMS, 'note': 'Dates and sizes are approximate; size in cm, height × width; statues: height.', 'works': man}, open('assets/art/manifest.json', 'w'), indent=1, ensure_ascii=False)
print(len(man), 'works')
