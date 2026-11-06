ENGLISH_FIXES: 11
RU_ERRORS: 3

# Review: Venus (en/venere.md, scans 0471–0492)

This is an independent check of en/venere.md. I went through it block by block against `_text/pages/0471–0492.md`, including the marginalia and captions, and then against `ru/venere.md`. Block numbers are 1-based, as in parse_chapter (128 blocks in both files). After the edits, `--check venere` returns OK. Block structure, aside positions, verse line counts (4, 2, 2, 8, 8, 8) and the eight caption blocks are unchanged. The [?1] and [?2] marks sit at the same Italian words as in the Russian. Glossary names are all correct: Leone Ebreo, Kallipyge, Alexander ab Alexandro, Peitho/Suada, Peter Apian, Nikephoros, Apostrophia, Carrhenians, Suda and the rest. Every *simulacro* is "idol", every *nume* is "numen", and every *certo/certa* + noun is "a certain". I found no archaisms and no "whence" or "lest", and the spelling is consistently British.

## Fixes (block n)
- 9 (E5.2): *Ouidio … la fa così dire à Nettuno* was "Ovid … has her say to Neptune". It is now "in Ovid … she says to Neptune".
- 13 (E5.2): *Virgilio parimente fa che Nettuno così risponde* was "Virgil likewise has Neptune answer her". It is now "In Virgil likewise Neptune answers her".
- 24 (E5.2): *Claudiano … fa che Tritone la porti* was "has Triton carry her". It is now "shows Triton carrying her".
- 31: *rossa, come dice Anacreonte, che è Venere, oue ei la chiama porporea* was "red, as Anacreon says — the one that is Venus, where he calls her purple". That made the dove itself Venus. The clause means "red, as Anacreon says Venus is, where he calls her purple": the dove has the colour Anacreon gives Aphrodite (Aelian's source passage). It is now "but red, as Anacreon says Venus is, where he calls her purple; and behind …".
- 45: *come le rose sono colorite, malageuolmente si possono cogliere senza sentire le punture* was "as red roses can hardly be picked". That lost one half of the double parallel: redness goes with blushing, thorns with the pricking of conscience. It is now "as roses are red and can hardly be picked …".
- 45: *la bellezza della rosa, onde porge diletto a' riguardanti* was "although it gives delight". That added a concession that is not in the Italian (*onde* = "by which"). It is now "by which it gives delight to those who look at it".
- 53 (E5.2): *quando la fa rappresentare in scena* was "when he has her represented on the stage". It is now "when he describes her being represented on the stage". In Apuleius, an actress plays Venus in a pantomime.
- 90: *vno specchio d'argento, con alcuni adornamenti da i piedi dorati* was "a silver mirror with some ornaments at its gilded feet". *Da i piedi* is "for the feet" (compare *scarpe da piedi*). The gilded foot ornaments are offered alongside the mirror; they are not the mirror's feet. Philostratus (*Imagines* I.6) names the gilded sandal next to the silver mirror. It is now "a silver mirror, with some gilded ornaments for the feet."
- 92 (E3, consistency): "holds out a victory" is now "a Victory", as in block 89–90, since it is the same figure.
- 92: The ungrammatical "held out some I do not know what" (*certo non sò che*) is now "held out something, I do not know what".
- 126 (E3): "discuss her as a Planet" is now "as a planet", as in caption 3 ("the planet Venus").

## Verdicts on the translator's flagged points
- **Ausonius, "Pallade la bella / Venere armata"**: The translator is correct. Pallas is the subject of *Vedendo*. *La bella* is article + adjective enjambed onto *Venere*, so "fair" belongs to Venus ("seeing at Sparta the fair / Venus armed"). Reading *Pallade la bella* as an epithet would leave *Venere* without an article, and the Latin (*Armatam vidit Venerem Lacedaemone Pallas*) is about Venus's appearance.
- **[?1] "come ella parimente andaua sempre"**: I agree that *ella* = Pallas. Pallas is the one who always goes armed, and that is the point of her renewed challenge. The mark and the note are correct and match the Russian.
- **"la maggiore" = the elder**: Correct. This is the usual sense when two sisters are contrasted (Athenaeus has the elder/younger pair).
- **"come che hauesse così belle natiche" = "as one who had"**: Acceptable. Here *come che* is causal ("seeing that she had"): the brother's comfort rests on it. "As one who had" keeps that sense. The Russian «словно» ("as if") adds a hint of pretence that is not needed, but it is not a clear error.
- **"Gioue Seruatore" = Jupiter Saviour**: Correct. Pausanias II.20 has Zeus Soter at Argos. *Seruatore* ≠ *conseruatore*, so a separate entry is justified. Whether to merge it with "Jupiter Conservator" is a glossary-level decision for the author.
- **"Machinatrice" = Contriver**: Correct (Pausanias' *Mechanitis*).
- **"Fu fatta … da Scopa" = made**: Correct. Scopas is named as a sculptor, so this is literal making (E5.3, second half).
- **"E come che da Venere venghino non meno gli honesti pensieri…" = "And since"**: Acceptable. A concessive reading ("although") does not fit the logic: the Romans ask Venus for honest minds *because* honest thoughts also come from her. The Russian «так как» agrees.
- **"trattenimenti dolci e soaui" = "sweet and gentle attentions"**: Acceptable. *Trattenimenti* are pleasant entertainment or conversation, paired with *parole piaceuoli* (Mercury = speech). "Attentions" is within range.
- **Mirror, "adornamenti da i piedi dorati"**: Changed. See block 90 above.
- **"conciosia che altrimenti si faccia Venere…" = concessive "though"**: Acceptable. Here *conciosia che* has an adversative force ("whereas otherwise Venus is always made with beautiful hair"). "Though otherwise" renders that.
- **"farci via alla lasciuia" = "opens the way to lasciviousness"**: Acceptable. The *ci* ("for us") is not rendered, but nothing of substance is lost.

## Other remarks (no change)
- 85: "if she was defeated by her already when she was naked". The Italian *mentre, che era nuda* is just as ambiguous, and the epigram that follows ("naked and unarmed I conquered you") resolves it. Left as is.
- 101: *Francesi* is rendered as "Gauls". That is correct for the siege of the Capitol.
- 34 (caption): "the placidity of their nature" adds "their" (*della natura*). The Russian does the same. It is harmless.

## Russian translation (ru/venere.md)
Errors (also in venere.ru-errors.tsv):
- Block 31: «та, что есть Венера» makes the red dove Venus. The Italian says the dove is red, as Anacreon says Venus is (he calls her purple).
- Block 45: «как красные розы трудно срывать» merges the two features. The Italian has *come le rose sono colorite, malageuolmente si possono cogliere*: the roses are red (= blushing) and can hardly be picked without thorns (= the pricking of conscience).
- Block 90: «с некоторыми украшениями у позолоченных ножек» is wrong. *Adornamenti da i piedi dorati* = gilded foot ornaments (Philostratus: a gilded sandal), offered next to the mirror.

Structural note (not counted as a meaning error): ru/venere.md carries the marks [?1] (block 85) and [?2] (block 128) but has no «## Сомнительные места» section. The English section was written by the translator.
