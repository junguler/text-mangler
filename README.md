# Text Mangler

Word and sentence tools that run entirely in your browser: shrink / enlarge, tone, typos, personalities and
text tools. Optionally, a small language model (wllama / llama.cpp in WebAssembly) can do the same jobs
better. Nothing is uploaded anywhere.

## Files

| File | Size | Role |
|---|---|---|
| `index.html` | 10 KB | markup only; opens with a double-click |
| `style.css` | 7 KB | all styling |
| `data-dictionary.js` | 1.4 MB | spelling / phonetics dictionary (pure data) |
| `engine.js` | 17 KB | shrink / enlarge, typo add / fix |
| `personalities.js` | 20 KB | personality data tables and `pers()` |
| `tools.js` | 5 KB | tone, clean up, text tools, readability, diff |
| `aitasks.js` | 3 KB | what the AI is asked to do for each tab and mode (the prompts) |
| `ui.js` | 17 KB | tabs, sliders, pipeline, file load / save, undo |
| `ai.js` | 22 KB | AI bar: model loading, status, running, result switch |
| `wllama.js` | 123 KB | wllama glue. Loaded only when you first load a model |
| `wllama.wasm` | 10.8 MB | llama.cpp as WebAssembly (official wllama 4.0.0 file). Fetched on first model load, on http(s) hosting |
| `wllama-wasm.js` | 14.5 MB | the same runtime as base64 in a script. Only used when the page is opened from a file |
| `coi-serviceworker.js` | 2 KB | enables multi-threading on http(s) hosting such as GitHub Pages |

Keep all files in one folder. Opening the page loads the dictionary and the small scripts (about 1.6 MB);
the AI engine (about 11 MB) is fetched only when you load a model.

## AI assist

Tick **AI assist** under the controls. Every tab keeps working exactly as before, instantly, with its local
rules. With AI assist on you also get **Run AI**, and the Output panel gets a **Local / AI** switch.

| Tab / mode | AI does |
|---|---|
| Shrink / Enlarge | rewrites to the target word count the slider implies (shorten, or fuller wording without new facts) |
| Tone (formal, casual, simplify) | rewrites in that tone; the Amount slider sets how strongly |
| Typos > Fix typos | polishes the dictionary-corrected text: remaining spelling and grammar |
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
  "Also" instruction in Model & settings; it is added to every AI run.
- The Pipeline stays local. While it is ON, AI assist is paused.

### Model & settings

1. Download a GGUF model once (see Which model? in the drawer; suggested: LFM2.5-350M Q4_K_M, 229 MB).
2. Load .gguf (or drop the file on the AI bar). The drawer shows the steps (Engine, Model, Ready), a clock,
   what was loaded, and an Activity log. Unload frees the memory; Reload loads the same file again.
3. Context and Try WebGPU apply when a model loads; change them, then press Reload.
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
