ENGLISH_FIXES: 41
RU_ERRORS: 2

# Review: Bacchus (en/bacco.md, scans 0382–0413)

This is an independent check of en/bacco.md. I went through it block by block against `_text/pages/0382–0413.md`, including the marginalia, and then against `ru/bacco.md`. Block numbers are 1-based, as in parse_chapter (238 blocks in both files). The structure check `--check bacco` returns OK. Block structure, aside positions, verse line counts and caption blocks are unchanged.

## Fixes (block n)
- 2: The 170-word opening sentence is split into three sentences, with no hedge lost. *Secondo che verrà a proposito* was rendered "as it comes to the point"; it is now "as the occasion arises".
- 5: *molti sono i modi da far conoscer Baccho per chi lo dipinge* was rendered "ways of making Bacchus known by whoever paints". That reads as if the painter were the one learning. It is now "many ways for whoever paints or sculpts Bacchus to make him recognisable".
- 7: "as I too have said at another time already" is now "as I too have already said elsewhere".
- 13: *colorita faccia* was "coloured face"; it is now "flushed face".
- 12, 16, 174 (E3): "god of Banquets" and "god of Gardens" are now lowercase. The chapter text itself already has "god of gardens".
- 23: The long sentence is split. *Chi fece la vbbriachezza* was "whoever made Drunkenness"; under E5.3 it is now "whoever depicted Drunkenness". After the split, the subject is named: "so Silenus always goes with Bacchus".
- 24: *fassi anco Dio della Natura* was "He is also made a god of Nature"; it is now "represented as" (E5.3). *Virgilio lo fà cantare* was "Virgil has him sing"; it is now "in Virgil he sings of its beginnings" (E5.2).
- 38: *hanno voluto alcuni intendere* was "some have wished to understand"; it is now "some have taken these to mean" (E5.1).
- 50: *vogliono intender, che fosse fatta la statoa … & non che veramente hauesse le corna* was "the statue … should be understood, and not as if he truly had horns". It is now "they take it that the statue … was made in this way, and not that he truly had horns".
- 50: Under E5.3, "Lysimachus was likewise made with horns" is now "depicted with horns". "To the statue of Seleucus … horns were also made" is now "was also given horns". In "he seized it", the subject is now named as Seleucus.
- 60: *ambitiosissima* was "most ambitious"; it is now "most ostentatious".
- 60: *rappresentata già per Tolomeo Filadelfo* was "staged once for Ptolemy"; it is now "staged once by Ptolemy". *Per* marks the agent here: Athenaeus describes Ptolemy's own procession.
- 71: The relative clause "Metrodorus; who, as Suda writes, … threw himself into the river" made Metrodorus the one who drowned. It is now a new sentence with Marsyas named as the subject, and "the river was afterwards called Marsyas". See the verdict below.
- 73: "chest of Cypselus" is now "Chest of Cypselus", the glossary form for *Arca di Cipselo*.
- 44, 133, 92, 121, 158 (E3): "form of a Bull" and "form of a Hawk" in the asides are now lowercase. In the captions, "the Triumph", "the Ship of Bacchus" and "the Disc" are now lowercase, matching the running text.
- 97, 98: Glossary: *Cisso* is in GLOSSARY.tsv as **Kissos**, and its comment covers both the Greek word for ivy and the boy. The text now reads "The Greeks call ivy *kissos* (*Cisso*); *cissare* …", with the printed form kept under E5.5 because the *cissare* etymology depends on it. The aside now reads "Kissos". I removed the `Cisso → Cisso` row from bacco.glossary-new.tsv.
- 107 (Statius): Line 5 had taken in "the swift tigers" from line 6. The original line order is restored: "and lick the bridles and the other trappings / sprinkled with wine, the swift tigers."
- 111: The Timaeus tale, a single 130-word sentence, is split into three. "fearing lest the galley should" is now "Fearing that the galley might perhaps go down" (*temendo non forse*).
- 112: *sotto coperta* was "under cover"; it is now "below deck".
- 114: *riconoscendo la salute nostra da voi* was "acknowledging our safety from you"; it is now "acknowledging that we owe our safety to you".
- 122: "The almost same ship" is now "Almost the same ship".
- 126: *di che egli così si vendicò, che … lo fece parere* was "he took such vengeance that … he made him appear", which leaves it unclear whether Pentheus or Bacchus took vengeance. It is now "Bacchus took such vengeance for this that he made Pentheus appear …", as a new sentence.
- 149: Lost hedge restored: *come che così poscia si conserui meglio* was "so that afterwards it keeps better"; it is now "as though it would keep better that way afterwards" (E4).
- 153: *à Baccho erano fatte le corna* was "horns were made for Bacchus"; it is now "Bacchus was represented with horns and dressed as a woman" (E5.3).
- 164: The long sentence is split. "they serve nothing for drawing" is now "they are of no use in drawing". "who had made her pregnant" was ambiguous between Juno and Venus; it is now "who had made Venus pregnant".
- 173 (Tibullus): Line 9, "Whence then does it come", is now "Where then does it come from". "Winter" and "Summer" are now lowercase (E3).
- 176: *così lo fà dire di se medesimo* was "Horace … has him say of himself"; it is now "when Horace wishes to describe him, Priapus speaks of himself thus" (E5.2).
- 178: *Asinelli* was "Asses"; it is now "the Little Asses". I also removed the doubled "too … also".
- 180: *faceuano vn Becco* was "they made a billy goat"; it is now "they depicted". "born only seven days" is now "when only seven days old".
- 186: *d'onde vna serua … se ne leuò grauida* was "whence a maidservant"; it is now "and from it a maidservant". "as he was, who was king" is now "as indeed he was, for he was the king of the Romans called Servius Tullius".
- 190: In "besides the hearth, of which I said … it was called a Lararium", the referent was wrong: the Lararium is the appointed place, not the hearth. It now reads "a place which, as I said already, was therefore called a Lararium". The sentence is split.
- 203 (caption): *Imagini delli Dei Lari, cioè custodi* was "Images of the Lares, gods, that is, guardians"; it is now "Images of the gods Lares, that is, guardians".
- 211: *voleuano perciò, che tanti fossero i Genij* was "wished that there should be"; it is now "held that there were" (E5.1).
- 220: *hanno fatto il Genio in forma di serpente* was "Whence some have made"; it is now "Hence some have depicted" (E5.3, and no "whence").
- 223: *riconoscendo la conseruatione della Città da lui* was "acknowledging the preservation of the city from him"; it is now "crediting him with the preservation of the city". The long sentence is split.
- 226: *il Genio fatto in guisa di huomo* was "seen made in the guise"; it is now "seen depicted".
- 231: *come fosse fatto* was "how he was made"; it is now "how he was represented".
- 235: *pochi dì prima, che Cesare gli facesse tagliare la testa* was "before Caesar had his head cut off". That reads as Caesar's own head. It is now "before Caesar had him beheaded"; the Cassius in question is Cassius of Parma, who was executed by Octavian. The RU is correct here.
- 236, 238 (E3): "the Oracle" is now "the oracle", following the majority usage in the reviewed chapters.
- 238: *non diede loro piu molestia alcuna* was "gave them no more molestation", which is a false friend in modern English. It is now "As they did so, that diabolical Genius troubled them no more". The 190-word sentence is split into four, with the subjects named ("At this the cruel beast …", "For this reason the people gave him …").
- E1 "whence": every other occurrence was replaced, in blocks 7, 29, 88, 98, 114, 124, 129, 154 and 186. The file now contains no "whence".

## Translator's doubtful points: verdict
- **Marsyas/Metrodorus (scan 0391).** *Il quale … vscito di ceruello si gittò nel fiume … che fu poscia dal nome suo detto Marsia* refers to Marsyas. Grammatically it follows Metrodoro, but the river named after "him" settles the question. *Ritrouatore della piua* belongs to the report from Metrodorus. The EN is fixed as described under block 71. The RU reads it the same way.
- **'cerni' → 'corni' [?2].** Agreed. Catullus 64 has *cornua*, and Cartari mentions *corni* himself in block 42. The mark is at the same word as in the RU.
- **"a'mo" → 'almo' [?4].** Acceptable: "almo Priapo" restores the hendecasyllable. "kind Priapus [?4]" is kept, and the note is good. The RU drops the word altogether and puts [?4] on «Приап». That is not a mistranslation, but the RU loses the adjective.
- **'ambitiosissima'.** It means "most ostentatious/lavish", not "ambitious". Fixed; see the RU errors.
- **'temperato' = diluted.** Correct. In Amphictyon's mixing of water into wine and at the Nymphs' altar, *vino temperato* is wine mixed with water. The RU «разбавленным в меру» is acceptable.
- **'poi' in "gli faceuano anco poi ghirlande" (104).** Correct. Here *anco poi* is an additive particle ("further, also"), not temporal "afterwards". "they further made wreaths for him" is kept.
- **Dionysus.** Correct. GLOSSARY *Dionisio* = Dionysius of Halicarnassus (used in block 201), so the god needs his own entry, which bacco.glossary-new.tsv provides.
- **Cisso/Kissos.** The glossary already has *Cisso* → Kissos, and its comment explicitly covers the Greek word for ivy. Rule 6 therefore applies, and the separate `Cisso` form has been replaced (blocks 97, 98).
- [?1] ("ma ci habbiamo spesso", block 9) and [?3] ("per gli tre", block 157) are correctly placed and well explained.
- Other glossary-new forms checked and accepted: Satyrs, Sileni, Silvans, daemons, Suppers, Armenian, Tyrrhenian, galley, sergeants of justice, Genius of the Prince.

## Not changed / for the editor
- 154, 157: The print has *virtù feminale*, but the caption has *seminale*. EN and RU both render "seminal" (long-s misreading/misprint). This is not marked.
- 211: *se non che questi non nascono con noi, come intendeuano gli antichi, che i Genij nascessero non ciascheduno*. The second "non" is evidently "con", and EN "each with each" follows that sense.
- 236: "Temesa … in the Abruzzo" is translated as printed (rule 8).

## RU errors (not edited; see bacco.ru-errors.tsv)
- 60: «в высшей степени честолюбивых … шествий». *Ambitiosissima* here means "most lavish, ostentatious"; «честолюбивый» cannot describe a procession.
- 60: «устроенное некогда для Птолемея Филадельфа». *Rappresentata per Tolomeo* means "staged by Ptolemy": Ptolemy was the organiser, not the person it was staged for.
