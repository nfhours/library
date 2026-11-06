FRENCH_FIXES: 20
RU_ERRORS: 1
EN_ERRORS: 1

# Vérification indépendante : bacco (fr)

I compared the French with TEXT_reading.md (scans 0382–0413), the marginalia in pages/*.md, ru/bacco.md, en/bacco.md, GLOSSARY.tsv and fr/bacco.glossary-new.tsv, block by block. Block numbers are parse_chapter `n` (238 blocks). After the fixes, `python3 tools/build_chapters.py --lang fr --check bacco` prints `bacco: OK`.

The following are unchanged and complete:
- Marks [?1]–[?4] and their notes.
- All 116 asides, checked against the Italian marginal lists, scan by scan.
- All 9 captions.
- All 11 verse quotes, with their line counts.

A script check found no NBSP faults (before ; : ! ? and inside « »).

## Fixes

1. Block 2: « son nom n'en fut pas moins célèbre chez les anciens, non pas tant pour cela que » → « son nom fut pourtant célèbre chez les anciens, non pas tant pour cela que ». The old wording "n'en … pas moins … non pas tant" was self-contradictory. Italian: *non dimeno non tanto per questo fu celebre*.
2. Block 12: « Comus lui ressemble beaucoup : il fut … le dieu des banquets, car son image… » → « Comus, qui fut … le dieu des banquets, lui ressemble beaucoup, car son image… ». The *percioche* explains the resemblance. In the old wording it seemed to explain why Comus was god of banquets.
3. Block 23: « dans un certain temple de lui, qui fut à lui seul » → « dans un certain temple à lui, qui n'appartenait qu'à lui seul ». The old French was ungrammatical.
4. Block 38: « certains ont voulu entendre par elles » → « certains ont soutenu qu'il fallait entendre par elles » (*hanno voluto*, F5.1).
5. Block 50: « Certains ont voulu en outre que nous entendions » → « Certains ont soutenu en outre qu'il nous fallait entendre » (F5.1).
6. Block 114: « les ramener à la raison de leur folie » → « leur faire reconnaître leur folie ». The old phrase was a non-idiomatic rendering of *fargli rauuedere della loro follia*.
7. Block 125 (aside): « Le taurillon déchiré… » → « Le veau déchiré… ». The marginal note reads *Vitello squarciato*, which means a calf. *giouenco* (taurillon) appears only in the body text.
8. Block 129: « De cela on pourrait peut-être dire que cela fut fait » → « De cette coutume, on pourrait peut-être dire qu'elle fut pratiquée ». The "cela … cela" was clumsy. *forse* is kept.
9. Block 141: « ont voulu entendre le Soleil, et que de lui aient été appelées » → « ont soutenu qu'il fallait entendre le Soleil, et que de lui avaient été appelées » (F5.1).
10. Block 146: « comme d'autres l'ont voulu » → « comme d'autres l'ont soutenu » (F5.1).
11. Block 200: « certains voulurent que … ce fussent » → « certains soutinrent que … c'étaient » (F5.1).
12. Block 200: « certains numens » → « certains numina ». The project convention is numen, plural numina.
13. Block 206: « que certains voulurent être le dieu » → « dont certains soutinrent qu'il était le dieu ». The old wording calqued *vollero, che fosse*.
14. Block 211: « ils voulaient donc qu'il y eût autant de Génies » → « ils soutenaient donc qu'il y avait autant de Génies » (F5.1).
15. Block 216: « C'était donc le Génie un certain numen » → « Le Génie était donc un certain numen ». The archaic inversion was removed (F1).
16. Block 216: « de tels numens » → « de tels numina ».
17. Block 229 (quote): « Que, les saints cheveux ceints… » → « Qu'à présent, les saints cheveux ceints… ». *Hor* had been omitted. The line count is unchanged.
18. Block 236: « chez les Témèsiens » → « chez les habitants de Témèse ». This is the glossary form for *Temessesi*.
19. Block 238: « Les Témèsiens dressèrent donc » → « Les habitants de Témèse dressèrent donc » (glossary).
20. Block 238: « et, ce faisant, ce Génie diabolique ne leur donna plus aucune molestation » → « et, tandis qu'ils faisaient ainsi, ce Génie diabolique ne leur causa plus aucun tourment ». The participle was dangling: the Temesans act, the Genius is the subject. « molestation » is not current French.

## Translator's doubts checked

- Censorinus (block 211): TEXT_reading itself repeats « ò perch'egli di questa hauesse la cura » twice in a row. This is dittography in the printed text. Translating it once is correct, and it is not an omission. RU and EN also have it once.
- « nascessero non ciascheduno » (block 211): this must be *con ciascheduno*. « naissent avec chacun » is right, and all three versions agree.
- « ne facessero poi male » (block 194): this reads as *né*, with the negation. The context requires it (the figurines divert the Lares from harming people). The French « ne fassent pas ensuite de mal » is correct.
- Lararium sentence (block 190): the French follows RU: « outre le foyer, dont j'ai déjà parlé, … un lieu particulier, qui s'appelait pour cette raison Lararium ». EN instead attaches « as I said already » to the Lararium. The Italian is ambiguous: *del quale dissi già, che per ciò era detto Larario*. The hearth was mentioned just before (Ocrisia), and the Lararium is not mentioned anywhere earlier in the book. So the FR/RU reading is defensible, and I left it unchanged. This is an open doubt, not an error.
- RU paragraph break after « couronnes sur la tête » (blocks 103/104): the Italian continues « : oltre che delle medesime… ». The French ends block 103 with a period and starts 104 with « En outre, de ces mêmes plantes… ». The meaning is intact and the block count equals RU.
- « la Dedalo » (block 56): read as *da Dedalo* (« par Dédale »). The antecedent of *intagliata* (the company or Ariadne) stays as ambiguous as in the Italian.
- « cerni » (block 57): read as *corni*, with [?2] in place.
- The opening « Onde » of the Ariadne-chorus clause (block 56) is rendered « d'où tous ceux… le suivent ». It is kept, and the long parenthesis is preserved.

## RU / EN errors (see the .tsv files)

- Block 146: *perch'ei si era voltato contra di loro* is causal. RU « когда » and EN "when" make it temporal.

## Open doubts (not changed)

- Blocks 164 and 185: the French has « Théodoret ». The glossary form is « Théodoret de Cyr ». I left it, following the gran-madre review decision to stay consistent with the other French chapters.
- Blocks 154 and 157: the Italian prints *virtù feminale*, and the caption at block 158 has *seminale*. All versions render « séminale ». I treat this as a misprint (ſ/f), not as an author's error.
- Block 134: RU and EN render *vola velocissimamente* as a relative superlative ("fastest of all"). The French « vole très vite » is literal. I did not record this as an error.
