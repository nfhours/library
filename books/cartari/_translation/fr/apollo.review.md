FRENCH_FIXES: 31
RU_ERRORS: 1
EN_ERRORS: 0

# Vérification indépendante : apollo (fr)

I compared the French file block by block with TEXT_reading.md (scans 0083–0128), the marginal notes in pages/*.md, ru/apollo.md, en/apollo.md, GLOSSARY.tsv and fr/apollo.glossary-new.tsv. The block numbers below are the parse_chapter `n`. After the fixes, `python3 tools/build_chapters.py --lang fr --check apollo` prints `apollo: OK` (255 blocks). The [?1]–[?8] marks sit on the same Italian words as in the Russian file, and the typography check (non-breaking spaces, « », straight ') found no problems.

## Fixes

1. Block 2: « les premiers faiseurs des choses » → « les premiers auteurs des choses ». « faiseurs » was a calque of *facitori* (F1).
2. Block 31: « Calliope, importe autant que perfection de science » → « signifie autant que ». This was a calque of *tanto importa quanto* and is not French.
3. Block 37: « fait en cercle, rond et arrondi comme un bouclier » → « fait en cercle et rond comme le bouclier ». « arrondi » was an addition: *fatto in circolo, & rotondo come lo scudo*.
4. Block 49: « Pausanias rend compte aussi du temple » → « donne aussi la raison du temple ». The old wording lost *rendendo la ragione*.
5. Block 55: « Il n'est pas étonnant » → « Aussi n'est-il pas étonnant ». *Però* (therefore) had been dropped.
6. Block 57: « sa candeur » → « sa blancheur ». In modern French « candeur » means naivety; *candidezza* here means whiteness.
7. Block 62: « Homère fait aussi que l'épervier lui soit consacré, et l'appelle » → « Chez Homère aussi, l'épervier lui est consacré, et le poète l'appelle » (F5.2).
8. Block 62: « des amants de sa mère » → « des soupirants de sa mère ». For *innamorati* (Penelope's suitors), « amants » means sexual lovers, which is wrong here.
9. Block 71: « ils veulent entendre la première cause » → « ils entendent par là ». *vogliono intendere* means "they mean"; the old French read as "they want to hear".
10. Block 73: « quand il fait entrer Philologie » → « quand il décrit Philologie entrant » (F5.2, *fà, che Filologia entra*).
11. Block 97: « un bœuf, ou aussi bien une vache » → « ou peut-être une vache ». « aussi bien » lost the hedge in *ò vacca che fosse* (F4).
12. Block 102: « et il lui fait dire ainsi par Neptune » → « et chez lui Neptune lui parle ainsi » (F5.2). The old phrase was also ungrammatical.
13. Block 113 (+ Passages douteux): « d'une vache qui n'en eût plus fait » → « qui n'eût jamais vêlé auparavant ». In old Italian, *più* with a past tense means "ever before"; the same chapter has *non hauendo mai più visto simile solennità* (scan 0102), meaning "never having seen before". The ru and en readings are therefore correct. The unnumbered note for scan 0100 has been brought back to a translation of the Russian note; the translator's own text there contradicted the fix.
14. Block 116: « ils tiraient certains oracles, comme d'un oracle » → « certaines réponses, comme d'un oracle ». *responsi* means responses, and the old wording was redundant.
15. Block 126: « un de ses garçons avait été abîmé » → « mis à mal ». « abîmé » is used of objects (*guasto*).
16. Block 144: « auquel ils faisaient être soumise la déesse » → « auquel ils soumettaient la déesse ». This was a calque and not grammatical French.
17. Block 157 (2×): « boisseau » → « muid », the glossary form for *moggio* (rule 6).
18. Block 173: « tantôt bons, tantôt tristes » → « tantôt mauvais ». *tristi* means bad.
19. Block 187: « avec une grande et religieuse merveille de chacun » → « au grand et religieux émerveillement de chacun » (F1).
20. Block 200: « qu'ils étaient comme des rapporteurs » → « qu'ils étaient certains rapporteurs ». « comme » was an added hedge (*certi relatori*).
21. Block 203: « l'on peut croire qu'on y était rudement serré » → « qu'il y passait un fort mauvais moment ». *vi hauesse buona stretta* means the visitor had a hard time of it. The old French was literal and impersonal, and its meaning was unclear.
22. Block 212: « leur faire le porter » → « le leur faire porter », which is the correct pronoun order.
23. Block 214: « comme le dit Pausanias ; ce fut en un certain lieu… » → « comme Pausanias dit que ce fut le cas en un certain lieu du pays de Corinthe ». *come dice Pausania, che fu in certo luoco*: the Corinth sanctuary is Pausanias's example of the joint statues.
24. Block 221: « Cette gent eut depuis toujours » → « Ce peuple eut ensuite toujours ». « gent » is archaic (F1), and « depuis toujours » misreads *dapoi sempre* (ever after).
25. Block 221: « dont il suffira … d'en citer deux » → « de citer deux ». The sentence had both « dont » and « en ».
26. Block 234: « afin que lui, revenant en ses temps, s'en serve » → « afin qu'il s'en serve lorsqu'il revient en ses saisons » (F1).
27. Block 244: « faiseur de l'univers » → « créateur de l'univers » (F1).
28. Block 244: « bien que les devins … partageassent l'univers …, et qu'ils fissent que la partie droite fût… » → « aient partagé l'univers de cette manière : ils plaçaient la partie droite du côté du Septentrion, et la gauche du côté du Midi ». The imperfect subjunctive is archaic (F1), and the *faceuano essere* calque has been removed.
29. Block 247: « laquelle, bien qu'au Ciel elle aille …, je ne crois pas … ces images qui sont miennes » → a new sentence, « Bien qu'au Ciel l'Aurore aille devant le Soleil, je ne crois pas pour autant qu'elle doive prendre en mal d'avoir été placée derrière lui parmi mes images ». The old sentence broke its own construction (F1), and « lui » restores *esserli*.
30. Block 253: « et font qu'elle ait un Char » → « et lui donnent un Char » (F5.2).
31. Passages douteux, scan 0100 note: rewritten in line with fix 13.

## Judged, not changed

- Topo = « souris », although the glossary gives « Rat ». In Italian, *topo* means mouse, and Cartari explains Sminthien by Greek *sminthi*, "mice" (ru and en also read mouse). « souris » is kept throughout blocks 216–221 and in the marginal note. The glossary's French column for Topo should be corrected; I did not touch the shared glossary.
- Block 17, « ou le nectar peut-être » (*ò nettare che fosse*): an acceptable rendering of the hedge.
- Block 27, « d'après divers autres lieux » (*da diuersi altri loro consecrati*): the noun is implied in the Italian, and ru has the same.
- Block 122, « Soro (*Soro*) »: the italic repeats an identical form. It is redundant but harmless.
- Block 141, « se font pour Mars » (*si fà per Marte*): kept.
- Block 226, « asinement » for *asinescamente*: a playful coinage, kept on purpose.
- Block 242, [?8] stands on « assèche », the doubtful verb itself (*ascinga*); ru puts it after « грудь ». The mark is attached to the same Italian word, so it was left as it is.
- Block 237, « Éléphantine » for *Elefantinopoli*: this is the glossary form.

## Open doubts

- Block 158: *come che egli sia padrone di tutto il tempo*. « il » could be the serpent or Serapis; French keeps « il » ambiguous, like the Italian (ru settles on Serapis).
- Block 226: *hauendo fatto vna imboscata*. The Italian does not name who laid the ambush; French keeps « les uns », while ru and en say the Sicyonians, which the context supports.
