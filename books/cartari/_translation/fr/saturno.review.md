FRENCH_FIXES: 20
RU_ERRORS: 1
EN_ERRORS: 1

# Vérification indépendante : saturno (fr)

Compared block by block with TEXT_reading.md (scans 0064–0082), pages/*.md marginalia, ru/saturno.md, en/saturno.md, GLOSSARY.tsv and fr/saturno.glossary-new.tsv. After the fixes, `python3 tools/build_chapters.py --lang fr --check saturno` prints `saturno: OK`. Block numbers follow parse_chapter `n`.

## Fixes

1. Block 2 (Virgil, l. 3): « privé de force de ses royaumes » → « privé par la force de ses royaumes ». *a forza priuato* means deprived by force. The old wording could be read as "deprived of strength".
2. Block 4: « Saturne fut reçu en partage du royaume par Janus » → « Saturne fut admis au partage du royaume par Janus ». The old phrase was not idiomatic and the meaning was blurred (*tolto a parte del regno*).
3. Blocks 5, 6 (+ Passages douteux): « Stercutius » → « Sterculius ». The glossary French form is binding (rule 6).
4. Block 16: « la colère de Saturne, reçue pour la mort » → « encourue par la mort ». *riceuuta* here means incurred.
5. Block 22: « parce qu'elle était femelle » → « parce qu'elle était une fille ». « femelle » is an animal term in French and the wrong register for a goddess (*per esser femina*).
6. Block 35: « plus que les autres, elle met trente ans à accomplir son cercle » → « elle met plus de temps que les autres, c'est-à-dire trente ans, à accomplir son cercle ». In the old wording « plus » attached to nothing, and *tarda* (is slower) was lost.
7. Block 38: « dans les noces de Mercure et de Philologie, il fait monter celle-ci » → « dans *les Noces de Mercure et de Philologie*, il décrit celle-ci montant ». The title is now set as a title, and F5.2 is applied (*fa, che ella ascende*).
8. Block 41: « et épouse et sœur de Saturne, en même temps que beaucoup d'autres qu'il en avait, fit » → « sœur de Saturne et l'une des nombreuses épouses qu'il avait, fit ». The calque suggested that the many others helped make the ornament. They are his other wives.
9. Block 44: « tout intent à la contemplation » → « tout entier appliqué à la contemplation ». « intent » is not a French adjective.
10. Block 48: « châtier celui qui erre » → « celui qui commet une faute ». « errer » means to wander. « ne s'en aperçoit pas plus tôt qu'il sent la peine » → « ne s'en aperçoit qu'en sentant déjà la peine ». The old phrase was an unreadable calque of *non prima … che*.
11. Block 54: « les histoires veulent que tous deux aient régné » → « les histoires soutiennent que tous deux ont régné » (F5.1, *vogliono*).
12. Block 58: « les prières, qu'Homère fait femmes » → « qu'Homère représente comme des femmes » (F5.2/F5.3).
13. Block 66 (+ Passages douteux): « stryges » → « Stryges », the glossary form.
14. Block 70: « J'ai pourtant raconté … prendre l'autorité d'en faire une » → « C'est pourquoi j'ai raconté …, afin que celui qui voudrait prendre sur soi d'en faire une ». *Però* here means "therefore", and « prendre l'autorité » was a calque. Also « Mont Caelius » → « mont Caelius » (French typography).
15. Block 76: « fait la même chose durant toute l'année » → « fait aussi la même chose pour l'année entière ». *fà il medesimo di tutto l'anno*: the Sun opens and closes the year itself, and the « l' » that follows refers to the year.
16. Block 84: « ils faisaient le serpent » → « ils figuraient le serpent » (F5.3).
17. Block 107: « Deux portes seulement eut au commencement son temple, quand il fut fait par Numa, devant lequel il se tenait assis » → « Au commencement, son temple n'eut que deux portes, quand il fut fait par Numa ; devant ce temple, Janus se tenait assis ». The Italian inversion is straightened (F1) and the subject is named (F4).
18. Block 108 (Virgil): « A celles-ci » → « À celles-ci » (F6, accented capitals).
19. Block 110: « comme le fait dire à lui-même Ovide, quand il lui demande » → « comme il le dit lui-même chez Ovide, quand le poète lui demande » (F5.2).
20. Block 112: « (comme le veut aussi Marcus Tullius) » → « (comme le soutient aussi Marcus Tullius) » (F5.1).

## Judged, not changed

- Block 18: « buccin (conque sonore) ». The gloss is prescribed once by GLOSSARY.tsv (Buccina), so it is not an addition.
- Block 6: « certains ont voulu que sa statue tînt une faucille … pour donner à entendre ». Here *hanno voluto* can be a genuine intention, as the purpose clause shows, so it was kept.
- Blocks 64 and 94: « comme nous voulons les appeler / l'appeler » (*che vogliamo dirli*). This is literal but understandable.
- Block 6: « savaient inventer et enseigner » omits *là* (*& là insegnauano*, probably « la »: "taught it"). RU does the same. It is negligible.
- Block 15: « à la place d'étoiles » (*in loco di Stelle*) was kept as printed.
- [?1], [?2], [?3] are in the same places and carry the same numbers as in ru. The Passages douteux match the ru items one to one.
- The 45 marginalia are all present, in the same positions as in ru. Typography was checked: there is a non-breaking space before ; : ! ? and inside « ». Straight apostrophes are used consistently.

## Open doubts

- Block 107: *dinanzi del quale egli staua assiso*. Grammatically, *egli* could be Numa. It is read as Janus (his statue), as in ru and en.
- Block 115: « que j'ai dit avoir quatre portes » is a slightly heavy calque but correct.
