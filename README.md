# Text Mangler

Word and sentence tools that run entirely in your browser, plus an optional local AI (a small language
model running in WebAssembly through wllama / llama.cpp). Nothing is uploaded anywhere.

## Files

| File | Size | Role |
|---|---|---|
| `index.html` | 9 KB | markup only; opens with a double-click |
| `style.css` | 7 KB | all styling |
| `data-dictionary.js` | 1.4 MB | spelling / phonetics dictionary (pure data) |
| `engine.js` | 18 KB | shrink / enlarge, typo add / fix |
| `personalities.js` | 21 KB | personality data tables and `pers()` |
| `tools.js` | 5 KB | tone, clean up, text tools, readability, diff |
| `ui.js` | 17 KB | tabs, sliders, pipeline, file load / save, undo |
| `ai.js` | 18 KB | AI tab: model loading, status card, runs |
| `wllama.js` | 123 KB | wllama glue. Loaded only when you first load a model |
| `wllama.wasm` | 10.8 MB | llama.cpp compiled to WebAssembly (official wllama 4.0.0 file). Fetched only when you first load a model, on http(s) hosting |
| `wllama-wasm.js` | 14.5 MB | the same runtime as base64 in a script. Only used when the page is opened from a file, where a plain fetch is blocked |
| `coi-serviceworker.js` | 2 KB | enables multi-threading on http(s) hosting such as GitHub Pages |

Keep all files in one folder. Opening the page loads the dictionary and the small scripts (about 1.6 MB);
the AI engine (about 11 MB) is fetched only when you press Load .gguf.

## AI tab

1. Download a GGUF model once (see Which model? inside the tab; suggested: LFM2.5-350M Q4_K_M, 229 MB).
2. AI tab, Load .gguf (or drop the file on the panel). The status card shows the two steps (Engine, Model),
   a running clock, details of what was loaded, and an Activity log.
3. Pick a task, press Run AI. Stop keeps the partial output. Unload frees the model's memory.
   Reload loads the same file again, for example after changing Context or WebGPU.

Notes:

- Context and Try WebGPU apply when a model is loaded; change them, then press Reload.
- Creativity jumps to a suggested low value per task. Small models do best at about 0.10 to 0.30.
- If your text plus Max tokens does not fit the context, Max tokens is lowered automatically; if the text
  alone does not fit, the run is refused with the numbers.
- Multi-threading needs http(s) hosting. From a file the status card says "single thread" and why.
- Model files are never put in the repo (GitHub rejects files over 100 MB). Each visitor loads their own.
- **Engine source** (AI tab): Bundled uses `wllama.js` + `wllama.wasm` from this folder (works offline). CDN fetches
  both from jsDelivr at the wllama version typed next to it (default in `ENGINE.ver` at the top of `ai.js`).
  Use CDN when a model needs a newer llama.cpp; clear the version box value to return to the default.
  CDN needs internet and a network that can reach cdn.jsdelivr.net. The page's Content-Security-Policy
  (in `index.html`) allows jsDelivr for exactly this; remove those two entries to make the page strictly offline.
- The bundled engine is a fixed llama.cpp build (version shown in the status card). A brand-new model architecture
  can need a newer wllama.js and wllama.wasm (use the CDN engine source, or replace the bundled files); models that reuse existing architectures just work.
