FRENCH_FIXES: 60
RU_ERRORS: 1
EN_ERRORS: 0

# Vérification indépendante : minerva (fr)

I compared the chapter block by block with TEXT_reading.md (scans 0337–0381), the marginalia in pages/0337–0380, ru/minerva.md, en/minerva.md, GLOSSARY.tsv and fr/minerva.glossary-new.tsv. The chapter has 351 blocks, numbered as in parse_chapter `n`.

After the fixes, `python3 tools/build_chapters.py --lang fr --check minerva` prints `minerva: OK`. Marks [?1]–[?11] and their notes are in place and unchanged. All asides (93) and all 11 engraving captions are present and complete. NBSP typography was checked by script, and the only faults found are fixed under 7 and 20.

## Fixes (block: before → after, and the reason)

1. B4: « nuit tout autant » → « nuit pareillement ». *parimente* means "likewise", not "just as much".
2. B8: « des Chats et des Chouettes » → « des chats et des chouettes ». The Italian has them in lowercase (*gatti, ciuette*).
3. B11: « elle se dessine elle-même quand » → « … elle-même de la même manière quand ». *medesimamente* had been dropped.
4. B17: « sans le service de son épouse » → « … de l'épouse ». « son » could refer to Vulcain, the subject of the previous clause.
5. B21: « la justice veut que cela convienne » → « il est juste qu'elle convienne ». This was a calque of *vuole il dovere*. The implied subject is Minerva.
6. B27: « des unes et des autres » → « des uns et des autres ». The pair is *bêtes* and *oiseaux*, so the agreement is masculine.
7. B37: « «avertir» », « «diminuer» », « «menacer» » now have NBSP inside the guillemets.
8. B49 (Statius, lines 3–6): the lines now follow the Italian line order: « toi dont la tête est ornée d'un bel effroi / par le casque solide, et la poitrine par la Gorgone / couverte de sang, et plus grande que la tienne / Mars n'a point de force, ni Bellone, ». The old « dont une force plus grande n'est ni à Mars… » misrendered *de la qual maggiore forza non ha Marte* ("than whom Mars has no greater force"). The helmet had also been moved up from line 4. The line count is unchanged.
9. B52: « Bellone fut chez les anciens » → « Bellone fut donc… ». *Fu dunque* had been dropped (RU drops it too).
10. B58: « une colonne assez petite » → « une certaine colonne pas très grande » (*certa colonna non molto grande*).
11. B66: « faisaient que les maîtresses … invitaient … servaient » → « faisaient en sorte que … invitent … servent ». The old wording was a calque. Also « qu'elles tirent » → « qu'elles tiraient » (*traheuano*).
12. B68: « qui y fleurirent tous depuis longtemps » → « … il y a bien longtemps ». *già gran tempo* means "long ago", not "for a long time now".
13. B70: « l'ayant fait devenir oiseau » → « l'ayant changée en oiseau ». « la fit aussitôt devenir noire » → « la rendit aussitôt noire ». « d'où est née depuis toujours, et dure encore, … » → « d'où naquit entre ces deux oiseaux une très grave inimitié, qui a toujours duré depuis et dure encore ». The old version had fare+infinitive calques and an illogical « née depuis toujours ».
14. B74: « pénètre à la Vérité » → « pénètre jusqu'à la Vérité ».
15. B80: « à un sien ami » → « à un de ses amis ». The old form was an archaism (F1).
16. B87, B202, B206: « numens » → « numina ». This is the plural used in the verified chapters (giunone, nettuno). « numen » stays lowercase.
17. B87: « voulant montrer par là » → « on voulait montrer par là ». The participle was dangling.
18. B88: « dans un certain dialogue de lui » → « dans un de ses dialogues ». « on lui ôtait même d'aller » → « on l'empêchait même d'aller » (*le era tolto di andare*).
19. B89: « tient un Serpent » → « un serpent ». The Italian has it in lowercase.
20. B93: « «À la vertu d'Auguste» » now has NBSP inside the guillemets.
21. B119 (caption): it is now in italics, like the source caption and the other italic captions (B96, B108).
22. B125: « que ce qu'il faut seulement » → « que ce qu'il faut » (double restriction). « devait être ainsi dans la main … qu'il puisse » → « … de telle sorte qu'il puisse ». The old wording was ungrammatical.
23. B129: « fit aller cette dernière devant lui » → « envoya cette dernière devant lui ». This was a fare+infinitive calque (F5.2).
24. B130 (Statius): « les Cités, qui croient ensuite tout mal » → « les Cités, qu'elles croient ensuite tout mal ». *con tanto Spavento … che poi credono* is a result clause. Also « qu'il n'y a plus un seul Soleil » → « que le Soleil n'est plus seul ». The old line read as "no sun at all", but *non più sia sol un Sole* means "there is no longer only one sun".
25. B135: « dès leur entrée en charge, aussitôt » → « à leur entrée en charge, aussitôt ». « dès » and « aussitôt » were redundant.
26. B139: « qu'ils ne l'abandonnassent jamais » → « qu'ils ne l'abandonnent jamais ». The imperfect subjunctive is archaic here (F1).
27. B141: « ce qui serait venu l'offenser » → « … le blesser ». *offendere* here means "harm". In modern French « offenser » means "insult".
28. B155, B158, B225: « sinon que / sinon qu' » → « si ce n'est que / si ce n'est qu' ».
29. B158: « comme il paraît que voulait l'entendre Hérodote » → « comme Hérodote semble avoir voulu l'entendre ». The hedge *pare* is kept.
30. B169: « Cependant par la Gorgone » → « C'est pourquoi par la Gorgone ». *E però* means "therefore", as in B129 « Però fingendo Statio ». RU has the same error (see the RU file); EN is correct.
31. B169: « et la lui firent aussi avoir morte » → « et la lui procurèrent aussi, morte, ». This was a calque of *glie la fecero avere morta*.
32. B172: « il voulait croire » → « il était enclin à croire » (*voleva credere*, F5.1).
33. B172: « parce qu'elle fut proprement le numen de ce lieu » → « parce que celle-ci était le numen propre de ce lieu ». « elle » could be read as Méduse, but the numen is Minerve. *proprio Nume* means "her own numen", not "strictly speaking".
34. B174: « d'un Porc » → « d'un porc ». The list of gifts was also restructured: « … les talonnières ; et le casque d'Orcus …, ainsi qu'une certaine besace …, il les eut de certaines nymphes ». The old wording attached the helmet and the bag to Mercure, but they came from the nymphs.
35. B176: « fit devenir Méduse … toute terrible » → « rendit Méduse … ».
36. B179: « l'assurance du courage » → « le courage assuré » (*la sicura fortezza*).
37. B183: « Elle était parfois couverte[?6] » → « La tête était parfois couverte[?6] ». *coperto* is masculine, so it cannot refer to Minerva. The [?6] note says "most probably the head", and RU and EN have the same reading. The mark and the note are unchanged.
38. B186 (Virgil): « Cependant les femmes d'Ilion » → « Pendant ce temps … » (*intanto*). In modern French « cependant » means "however".
39. B204: « le Trident, insigne de Neptune, qu'ils appelaient aussi Roi » → « … à qui ils donnaient aussi le nom de Roi ». The Trident could have been read as the antecedent.
40. B228 (aside): « Fer, par qui employé d'abord » → « Fer : qui l'employa le premier ». The old version was a word-for-word calque.
41. B231: « qui étaient à la forme des Pygmées » → « qui avaient la forme des Pygmées ».
42. B236: « comme Virgile fait dire à Évandre qu'il l'avait fait de lui » → « comme chez Virgile Évandre dit l'avoir fait pour lui ». This was a calque of *fa dire* (F5.2).
43. B248: « Mars fut fait par les anciens féroce » → « Les anciens représentèrent Mars féroce ». *fatto* here means "depicted" (F5.3).
44. B252: « gouverne les freins des Chevaux » → « tient les rênes des Chevaux ». « nonce et messagère » → « annonciatrice et messagère ». « nonce » means a papal envoy.
45. B253: « d'un drap léger » → « d'une étoffe légère » (*panno sottile*).
46. B281: « dont elle, indignée, jeta » → « et, indignée de cela, elle jeta ». The old wording was ungrammatical.
47. B285: « la guerre qui fut peu éloignée des navires » → « la guerre qui se déroula non loin des navires ».
48. B289 (Ariosto): « lisières » → « bandes » (*liste*). Also « des cheveux tantôt d'or, tantôt d'argent » → « des cheveux les uns d'or, les autres d'argent ». *qual … qual* means "some … others" at the same time, not alternation over time.
49. B301: « comme le rapporte Quinte-Curce que ceux de Tyr » → « comme le rapporte Quinte-Curce : ceux de Tyr ». The old version was ungrammatical. Also « une fois qu'Alexandre l'entourait » → « au moment où … » (*una volta che* = "at the time when").
50. B307, B340: « pour la plupart » → « le plus souvent » (*per lo più*, which applies to a singular subject here).
51. B310: « doivent ainsi rester cachés comme l'était » → « doivent rester aussi cachés que l'était ».
52. B313: « après quelques paroles solennelles et avoir récité » → « … et après avoir récité ».
53. B318: « à cause d'une Aigle qui vola » → « à cause d'un Aigle ». This is the bird, which is masculine. The feminine is kept where the word means the standard (B315, B318 « une Aigle d'or »).
54. B327: « et dans la vertu propre » → « et dans sa propre vertu ».
55. B337: « où je racontai aussi » → « où j'ai aussi raconté ». F1: no passé simple for the author's own earlier work.
56. B344: « mille hommes d'étrangers » → « mille étrangers ».
57. B346: « je laisse le chercher à qui » → « je laisse le soin de le chercher à qui ».
58. B348: « celles qui … étaient crues n'avoir pas été vraiment vierges, et que Minerve… » → « quant à celles qui …, on croyait qu'elles n'avaient pas été vraiment vierges et que Minerve… ». The old sentence was broken.

(Items 16 and 28 each cover several places. Counted one per change, there are 60 changes.)

## Translator's doubts: verdicts

- Statius « humble et dévot » (B49): this is correct. *humile … divoto* refers to the speaker. « dévot » is acceptable.
- « onde / perciò » → « C'est pourquoi »: this is correct throughout. The one wrong connector was « Cependant » for *E però* (fix 30).
- « Ega » = Aex: this follows GLOSSARY (Ega → Aex, and *Ega* in italics as the word for "goat"). The « (Aex) » after « de ce nom » in B164 is a small addition, but it is needed because the glossary splits the two forms. I left it.
- persico = pêcher, fortezza = courage, talari = talonnières: all three are correct (glossary-new and GLOSSARY).
- [?6]: resolved toward the head, in line with the note (fix 37).
- « Le fauole poi » = « Quant aux fables » (B220): this is correct. *poi* here marks a change of topic.
- [?8]: the FR note matches RU [?8]: the negation is missing in the Italian (*appaiono poi più*), and « ne » was supplied (« on n'en voit plus »). The mark and the note are kept.

## Open doubts

- Thetis / Tethys (B225, B281, B286): *Thetide/Tetide*, the mother of Achilles, is the sea nymph Thetis (« Thétis »). GLOSSARY maps her to « Téthys / Tethys » with the comment "wife of Ocean", so FR and EN follow the glossary. The glossary entry seems to conflate the two goddesses. It needs a decision at glossary level, so I made no change and did not log it as an EN error.
- B328 (Prudentius, line 5, « Che la veste, e da lieve vento mossa »): all three versions read it as "so that the garment, moved…". This fits the feminine *mossa*. Reading *veste* as a verb ("which clothes her") is possible but less likely, so I left it.
- B243: *sì che poscia sono facili all'ire* has the blood and spirits as its subject (the B258 caption confirms this). RU and EN render it as "we". The meaning shift is slight, so I did not count it as an error.
- B29: EN's « rob him of its mines » reads *gliele* as referring to the *minere*. This is defensible as a grammatical reading, so I did not log it.
