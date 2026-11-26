# Text Mangler

Word and sentence tools that run entirely in your browser: shrink / enlarge, tone, typos, personalities and
text tools. Optionally, a small language model (wllama / llama.cpp in WebAssembly) can do the same jobs
better. Nothing is uploaded anywhere.

## Files

| File | Size | Role |
|---|---|---|
| `index.html` | 11 KB | markup only; opens with a double-click |
| `style.css` | 9 KB | all styling |
| `data-dictionary.js` | 1.4 MB | spelling / phonetics dictionary (pure data) |
| `engine.js` | 18 KB | shrink / enlarge, typo add / spelling fix |
| `grammar.js` | 20 KB | offline grammar and US spelling for Fix typos (rule based, no AI) |
| `personalities.js` | 20 KB | personality data tables and `pers()` |
| `tools.js` | 5 KB | tone, clean up, text tools, readability, diff |
| `aitasks.js` | 3 KB | what the AI is asked to do for each tab and mode (the prompts) |
| `ui.js` | 18 KB | tabs, sliders, pipeline, file load / save, undo |
| `ai.js` | 23 KB | AI card and i window: model loading, status, running, result switch |
| `wllama.js` | 123 KB | wllama glue. Loaded only when you first load a model |
| `wllama.wasm` | 10.8 MB | llama.cpp as WebAssembly (official wllama 4.0.0 file). Fetched on first model load, on http(s) hosting |
| `wllama-wasm.js` | 14.5 MB | the same runtime as base64 in a script. Only used when the page is opened from a file |
| `coi-serviceworker.js` | 2 KB | enables multi-threading on http(s) hosting such as GitHub Pages |

Keep all files in one folder. Opening the page loads the dictionary and the small scripts (about 1.6 MB);
the AI engine (about 11 MB) is fetched only when you load a model.

## Personalities and tools

- **Personality**: 52 voices (pirate, wizard, legalese, butler, drill sergeant, soap opera, zen guru, emoji lover,
  text-speak, customer service, nature documentary, and more). Each is a table in `personalities.js`:
  word swaps (`sw`), openers (`pre`), closers (`post`) and an optional per-word function (`fn`).
  Copy an existing entry to add one, give it a name in `PN`, and optionally a one-line style note in `PD`
  that the AI uses.
- **Tools**: 53 exact text tools in groups (Case, Reverse, Style, Encode, Lines, Analyze), defined in
  `tools.js` as `key:[name, function, protect]`. List a new one in `TG` to place it in a group.

## AI assist

## Fix typos, offline (no AI needed)

Typos > Fix typos corrects spelling with the built-in dictionary, then `grammar.js` fixes American English
grammar slips. Two ticks on the tab switch the parts: **Grammar** and **US spelling** (both on by default,
remembered). Names, ALL-CAPS words, URLs, e-mail addresses, numbers and file extensions are left alone, and
every rule only fires on a pattern that is wrong in practice, so correct text comes back unchanged.

| Group | Examples |
|---|---|
| Homophones and look-alikes | their/there/they're, your/you're, its/it's, whose/who's, then/than, to/too, affect/effect, lose/loose, breath/breathe, advice/advise, weather/whether, where/were, were/we're, maybe/may be, everyday/every day |
| Verbs | would of -> would have, he don't -> he doesn't, she go -> she goes, they is -> they are, I seen -> I saw, I done it -> I did it, have went -> have gone, there is many -> there are many |
| Articles | a apple -> an apple, an university -> a university (hour, honest, user, one, European and similar cases handled) |
| Words run together | alot, incase, infact, aswell, noone, atleast, thankyou, eachother |
| Contractions | dont, im, youre, theyre, wouldve and about 20 more get their apostrophe |
| Cleanup | repeated words (the the), I and I'm, sentence capitals, days, months, languages, double spaces, space before , . ! ? and after , . ! ? : |
| US spelling | colour/color, realise/realize, centre/center, travelled/traveled, grey/gray, mum/mom, programme/program, defence/defense and about 1,200 inflected forms |

Subject-verb rules skip questions, "let it go / make it work" and the subjunctive ("I suggest that he go").

Tick **AI assist** under the controls. Every tab keeps working exactly as before, instantly, with its local
rules. With AI assist on you also get **Run AI**, and the Output panel gets a **Local / AI** switch.

| Tab / mode | AI does |
|---|---|
| Shrink / Enlarge | rewrites to the target word count the slider implies (shorten, or fuller wording without new facts) |
| Tone (formal, casual, simplify) | rewrites in that tone; the Amount slider sets how strongly |
| Typos > Fix typos | polishes the offline-corrected text (dictionary + grammar rules): remaining spelling and grammar |
| Personality | rewrites in the chosen voice; Strength sets how far it goes |
| Typos > Add typos, Clean up; Tools | stay local on purpose: exact rules, and a small model does them worse |

How it behaves:

- The line under the buttons always says what Run AI will do for the current setting, or why AI does not apply.
- Changing any setting or the input switches the Output back to Local. AI results are kept (last 12), so
  returning to the same setting brings the AI version back without running again. Reroll makes a new AI version.
- Copy, Save and Use as input act on whichever version is showing. Show changes works on both.
- "Protect quoted text" is checked after the AI answers: if a quote, link, number or #tag changed, the status
  line under the output warns you with the items.
- Creativity is set to a low suggested value for each task (small models do best low). Add an optional
  "Also" instruction next to it; it is added to every AI run.
- The Pipeline stays local. While it is ON, AI assist is paused.

### The AI panel and the i button

The panel under the controls holds everything you use or configure: the on/off tick, the status (badge, model,
clock), Run AI / Stop, Load .gguf / Reload / Unload, the line saying what Run AI will do, the progress message,
Creativity and the optional Also instruction. The loading steps (Engine, Model, Ready) show only while a model
loads or if loading fails. **Settings and details** (collapsed; it opens by itself if loading fails) holds Engine,
Context, Try WebGPU, the status details and the Activity log.

The small lowercase **i** button next to "AI assist" is info only: a getting-started window with a quick start
and which model to download. It changes nothing.

1. Download a GGUF model once (see Which model? in the i window; suggested: LFM2.5-350M Q4_K_M, 229 MB).
2. Load .gguf (or drop the file on the AI panel). The panel shows the steps, a clock and the status.
   Unload frees the memory; Reload loads the same file again.
3. Engine, Context and Try WebGPU apply when a model loads; change them under Settings and details, then press Reload.
4. If your text plus the answer does not fit the context, the length limit is lowered automatically; if the
   text alone does not fit, the run is refused with the numbers.
5. Multi-threading needs http(s) hosting. From a file the status says "single thread" and why.

### Engine source

- **Bundled** (default) uses `wllama.js` + `wllama.wasm` from this folder and works offline.
- **CDN** fetches both from jsDelivr at the wllama version typed next to it (default in `ENGINE.ver` at the
  top of `ai.js`). Use it when a model needs a newer llama.cpp. It needs internet and a network that can reach
  cdn.jsdelivr.net. The Content-Security-Policy in `index.html` allows jsDelivr for this; remove those two
  entries to make the page strictly offline.
- Model files are never put in the repo (GitHub rejects files over 100 MB). Each visitor loads their own.
- The bundled engine is a fixed llama.cpp build (shown in the status). A brand-new model architecture can need
  a newer engine: use the CDN source or replace `wllama.js` and `wllama.wasm`. Models that reuse existing
  architectures just work.
