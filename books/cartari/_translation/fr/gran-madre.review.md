FRENCH_FIXES: 52
RU_ERRORS: 0
EN_ERRORS: 0

# Vérification indépendante : gran-madre (fr)

I compared the chapter block by block with TEXT_reading.md (scans 0215–0243), pages/*.md marginalia, ru/gran-madre.md, en/gran-madre.md, GLOSSARY.tsv and fr/gran-madre.glossary-new.tsv. Block numbers follow parse_chapter `n` (203 blocks). After the fixes, `python3 tools/build_chapters.py --lang fr --check gran-madre` prints `gran-madre: OK`. The block structure (types, order, quote line counts) is identical to the version before the fixes. The marks [?1], [?2] and [?3] and their notes are unchanged. I checked NBSP typography by script. One fault was found and fixed (block 150).

## Fixes (block: before → after; reason)

1. 19: « veulent montrer » → « sont destinés à montrer ». *vogliono mostrare* here means "are meant to show", and « veulent » is a calque.
2. 19: « …l'autre pour prier les dieux, et l'autre pour défendre » → « …et un autre pour défendre ». « l'autre » cannot be used twice for three people.
3. 26: « que la même produit » → « que cette même déesse produit ». The bare « la même » is a calque of *la medesima*.
4. 31: « son délicat corps » → « son corps délicat ». The word order was unnatural.
5. 33: « …ensemble ; certains dirent qu'Attis fut tué » → « …ensemble, et que certains dirent qu'Attis fut tué ». In the Italian (*Pausania scriue, che … che alcuni dissero*), this is still part of what Pausanias reports.
6. 35: « si exactement fable » → « si bien une fable ». Unidiomatic.
7. 35: « comme nous voulons l'appeler » → « comme on voudra l'appeler ». *che vogliamo dirlo* means "whatever we wish to call it".
8. 35: « un grenadier, dont les fruits, la fille … en emplit son giron » → « un grenadier ; la fille … emplit son giron de ses fruits ». This was an anacoluthon that calqued the Italian.
9. 35: « une chèvre alla toujours lui donner le lait » → « allait sans cesse lui donner son lait ». The tense and the article were wrong.
10. 36: « tout était en point » → « tout était prêt ». Calque of *in punto*.
11. 36: « qui allait derrière » → « qui suivait ».
12. 37: « Agdistis, repentant ensuite » → « se repentant ensuite ». Missing pronominal verb.
13. 40: « beaucoup et beaucoup » → « de très nombreuses personnes ». Calque of *molti & molti*.
14. 43: « à l'étonnement non petit de ceux qui virent cela » → « au grand étonnement de ceux qui le virent ». Calque.
15. 52: « certains aient voulu que … lui tînt lieu » → « aient soutenu que … lui tenait lieu ». *habbino voluto* here means "claimed" (F5.1).
16. 52: « un bœuf ou, comme il se pouvait, une vache » → « un bœuf, ou une vache, selon le cas ». *ò vacca che fosse*.
17. 60 (aside) and 62: « Festus » → « Festus Pompeius ». The Italian has *Festo Pompeo* in both places. The full name is used as instructed. The bare *Festo* in blocks 88 and 93 stays « Festus ».
18. 62: « le cymbale » → « la cymbale ». Gender.
19. 62: « laquelle fut aussi consacrée à elle » → « qui lui fut aussi consacrée ».
20. 67: « D'où chez Lucrèce on lit aussi ainsi : » → « Aussi lit-on de même chez Lucrèce : ».
21. 79: « ont coutume d'aller avant les pluies et de les accompagner aussi souvent » → « de précéder les pluies et aussi de les accompagner souvent ». Calque, and « aussi » was misplaced.
22. 87: « comme on le recueille de Tite-Live » → « comme on peut le déduire de Tite-Live ». Calque of *si raccoglie*.
23. 88: « elles faisaient la charge » → « elles exerçaient leur charge ».
24. 88: « qui arrivaient de nouveau » → « nouvellement arrivées ». *di nuouo* means "newly", not "again".
25. 89: « qu'une vierge consacrée avait été fait mourir de faim » → « qu'on avait fait mourir de faim une vierge consacrée ». The passive was ungrammatical and the agreement was wrong.
26. 93: « ainsi comme il était conservé » → « de même qu'il était conservé ». Archaic.
27. 93: « il la croyait être la terre » → « il croyait qu'elle était la terre ». Latinate.
28. 95: « figurée par la Vierge » → « par la vierge ». With a capital, French « la Vierge » reads as the Virgin Mary.
29. 98: « à la première entrée des maisons » → « à l'entrée même des maisons ». Calque of *nel primo entrare*.
30. 104: « il ne semblait pas y avoir chose qui représentât mieux la pureté et le non-mourir jamais des dieux » → « il ne semblait y avoir aucune chose qui représentât mieux la pureté des dieux et le fait qu'ils ne meurent jamais ». Calque.
31. 104: « du feu déjà dit » → « du feu dont j'ai parlé ».
32. 105: « l'Agriculture » → « l'agriculture ». F3: no capital here.
33. 108 and 109 (verse 1): « montrer aux mortels à semer / à rompre » → « enseigner ». « montrer à + infinitif » is dated or regional.
34. 114: « on dit que le numen … montrait » → « on a dit ». The Italian is *fu anco detto*.
35. 116: « quand il la fait revenir de Sicile » → « quand il la décrit revenant de Sicile ». F5.2 calque.
36. 119: « un serpent autrefois d'une grandeur démesurée » → « autrefois un serpent… ». Word order.
37. 119: « là il demeura depuis toujours » → « là, par la suite, il demeura toujours ». « depuis toujours » ("forever, since always") distorted *dopò … sempre*.
38. 126: « il en est fait mention aussi par Marcus Tullius parlant contre Verrès » → « Marcus Tullius aussi en fit mention en parlant contre Verrès ».
39. 128: « et celle de Mercure, le héraut, ou trompette des sacrifices » → « et le héraut, ou trompette des sacrifices, portait celle de Mercure ». *quella di Mercurio il banditore* means the herald carried Mercury's image. The French made Mercury the herald.
40. 133: « voulut être fait l'un de ceux » → « voulut devenir l'un de ceux ».
41. 136: « exposées à quiconque d'entre eux eût voulu prendre plaisir avec elles » → « à quiconque eût voulu prendre son plaisir avec elles ». *di loro* refers to the goddesses, and « d'entre eux » had no antecedent.
42. 136: « et lui, s'en étonnant … et ayant demandé …, ces déesses … lui répondirent » → « comme il s'en étonnait … et avait demandé …, ces déesses … ». Dangling participle.
43. 143: « d'où cette vieille en fit le mot chez Plaute » → « d'où le bon mot de cette vieille chez Plaute ». Calque of *ne fece il motto*.
44. 146: « de se voir mourir devant elle son ennemi » → « de voir mourir devant elle son ennemi ». Calque of *vedersi morire dinanzi*.
45. 149: « adorée plus que tous les autres par les Arcadiens » → « adorée par les Arcadiens plus que par tous les autres ». *più che da tutti gli altri, da gli Arcadi* compares worshippers. The French read as "more than all the other gods".
46. 150 (aside): « Cérès : Érinye » had an ordinary space before « : ». Replaced with NBSP.
47. 152: « pour se l'ôter de devant » → « pour se débarrasser de lui ». Calque of *leuarselo d'attorno*.
48. 152: « de tromper qui aime, au point qu'il ne s'aperçoive au moins de la tromperie » → « de tromper qui aime sans qu'au moins il s'aperçoive de la tromperie ». The consecutive clause was wrong.
49. 159: « une crinière de cheval, autour de laquelle s'ébattaient » → « une crinière de cheval, et autour s'ébattaient ». *intorno alquale* is masculine (the head or neck), not the mane.
50. 165: « ne pouvait non seulement en manger, mais pas même les toucher » → « non seulement ne pouvait pas en manger, mais ne pouvait même pas les toucher ». The negation was garbled. Also « se fourrer » → « se loger » (register).
51. 167: « laquelle il pensa peut-être être dans ce petit animalcule » → « dont il pensa peut-être qu'elle se trouvait dans ce petit animal ». Latinate infinitive and pleonasm.
52. 171, 175, 179, 185, 190, 192, 193 (syntax and calques, grouped):
   - 171: « le pin résineux (*teda*) » → « la torche de pin ». GLOSSARY.tsv `teda` → *torche de pin*. The parenthesis was not an etymology (F5.5). « Et de là ils offraient » → « Après quoi ils offraient » (*indi* means "then").
   - 175 (legend): « auxquels elle était crue donner la maturité » → « auxquels on croyait qu'elle donnait la maturité ».
   - 179: « Se trouvant un jour un prêtre d'Hercule à se promener » → « Un jour qu'un prêtre d'Hercule se promenait ». « mais que s'il gagnait, lui ferait apprêter » → « mais que, si le dieu gagnait, le prêtre lui ferait apprêter ». The subject was missing and the sentence was ambiguous.
   - 185: « il dit qu'en est le signe sa statue » → « il dit que le signe en est sa statue ».
   - 190: « montrait avoir tant en horreur … tout ce qui avait été peint de mâle » → « montrait une telle horreur … toute figure masculine qui avait été peinte ».
   - 192: « il se tourna à user de force » → « il se résolut à user de la force ». « verge de myrte » → « baguette de myrte ». « l'on observa ensuite de ne pas porter » → « la règle de ne pas porter ». « Mais pour cela le père … ne se retira pas de son amour » → « ne renonça pas pour autant à son amour » (*nè per questo*). « faire d'elle son plaisir » → « faire d'elle ce qu'il voudrait ».
   - 193: « Voyant donc Faune que … il se changea » → « Faune, voyant donc que … se changea ». Calqued inversion.

Notes in « Passages douteux »:
- The [?1], [?2] and [?3] notes are unchanged and faithful to ru.
- The Pessuoli note is sensible and kept (*Pessuoli* is very likely a misprint for *flessuosi*; « sinueux » agrees with ru and en).
- I rewrote the teda note. It claimed « pin résineux, d'après le glossaire », but GLOSSARY.tsv gives *torche de pin*. The scan reference is narrowed to 0238, where *teda* is printed.

## RU / EN

I found no meaning errors in ru or en against the Italian. Both files are empty.

## Open doubts

- Block 7: *con tutti quelli ornamenti che fanno migliori* is read by fr, ru and en as "which make them better". It could also mean "the best ornaments they can make". I kept it unchanged.
- Block 45: *le sue coltella*. All three versions have "their knives" (the priests'). *sue* could also be "her" (the goddess's) knives. I kept it unchanged.
- Block 95: *col fuoco acceso dall'vna banda, e dall'altra, alla guardia del quale era vna Vergine per lato*. It is unclear whether "on one side and the other" belongs to the fire or to the guards. All versions attach it to the guards. The French keeps the slight redundancy of the Italian.
- Blocks 127/128: the glossary's French form is « Théodoret de Cyr ». The chapter and the other French chapters use « Théodoret ». I left it for consistency.
- Block 182: *animali guardati souente ne i giardini* (hares and goats) is rendered « que l'on garde » in all versions. *guardati* might instead mean "guarded against". I kept it unchanged.
