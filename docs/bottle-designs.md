# Bottle designs

Create a wine line from **Cellar → Reserves & blending → Bottle this reserve**. The studio shows label artwork before you choose it, with a live bottle preview beside the controls on desktop. Optional tasting notes, finishes, and a personal back label sit inside disclosures.

| Choice      | Options                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Bottle      | Classic shoulders, Rounded shoulders, Slender flute, Tapered silhouette, Round flask, Amphora silhouette |
| Label       | Heritage crest, Estate landscape, Modern colorblock, Botanical vine, Parcel map, Vintage arch            |
| Color       | Claret, Olive, Ochre, Ink, Terracotta, Dusk                                                              |
| Neck finish | Classic foil, Dipped wax, Natural cork, Paper neck wrap                                                  |
| Paper       | Warm cream, Ivory, Blush                                                                                 |

The 216 bottle, label, and ink combinations become **2,592 combinations** with four finishes and three paper tones. All are available when creating a line, without research gates or surcharges. Glass remains green for reds and lighter olive for whites. These are cosmetic choices: every bottle holds 750 mL, uses one kit and one warehouse space, and has the same score, tasting notes, production cost, and sale behavior for the same wine.

The botanical label uses a grape bunch and vine sprigs, the parcel label uses divided vineyard plots, and the vintage label uses an arched paper silhouette and sun motif. Dipped wax carries the estate's initial; cork shows restrained grain marks; a paper neck wrap repeats the label's paper and ink. Artwork is original SVG. Shared text placement keeps the wine name, vintage, founding year, and release number legible. The amphora label is narrowed to fit its taper, and SVG clipping keeps highlights and labels inside the glass.

**Start with a complete look** applies House reserve, Garden party, After hours, or Clay & sun. Each combines a bottle, artwork, ink, finish, and paper; every detail can then be changed individually. Applying a look preserves the player's personal note.

**A note on the back** accepts an optional winemaker's note of up to 160 characters. **Read back label** turns the preview or released bottle and repeats the note as readable text below it. Empty notes use a short estate dedication. The turn takes 260 ms, and thumbnails lift slightly on hover; reduced-motion settings disable these effects. Keyboard focus stays on the turn button.

A wine line owns its design, including its personal note. Each release snapshots it, and later releases in that line reuse it. Custom notes also appear in expanded release history. Existing labels and releases remain valid and keep classic foil and warm cream through rendering defaults; their saved objects are not rewritten with new fields. Save version six and browser storage keys are unchanged; older application builds will not understand the newly added design values or fields.

Implementation: [winemaking.ts](../src/winemaking.ts) owns the validated options and display names, [BottleArtwork.tsx](../src/BottleArtwork.tsx) holds the silhouettes and motifs, and [WinePresentation.tsx](../src/WinePresentation.tsx) assembles the preview and release artwork. [BottleDesigner.tsx](../src/BottleDesigner.tsx), [bottleStudio.ts](../src/bottleStudio.ts), and [bottle-studio.css](../src/bottle-studio.css) implement the studio within [Reserves.tsx](../src/Reserves.tsx). [bottle-designs.test.ts](../tests/bottle-designs.test.ts) covers the 216 base combinations and all 12 finish/paper pairs through bottling, saving, loading, and a second release, plus note limits, look application, and text wrapping.
