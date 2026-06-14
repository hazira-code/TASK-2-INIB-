# NLP Movie Chatbot & Cornell Corpus Explorer

Welcome to the **NLP Movie Chatbot & Cornell Corpus Explorer**, a full-stack, highly interactive chat application and Natural Language Processing (NLP) simulator. This application mimics Python's `ChatterBot` logic adapters, implements an NLTK/spaCy-like tokenization and syntax parsing pipeline, and lets users query and expand a dialogue corpus trained on the classic **Cornell Movie Dialogs Corpus**.

---

## 📖 About the Project Details & Architecture

This engineering prototype bridges traditional rule-based Natural Language Processing with modern Generative Large Language Models. By implementing local heuristics that replicate python's `nltk` (Natural Language Toolkit) and `spaCy` frameworks alongside `ChatterBot`, users can physically inspect how human languages formulate under algorithmic lenses.

### How the NLP Engine Works:
1. **Sentence Segmenter & Tokenizer**: Takes string matrices and decomposes them into distinct syntactic units (Tokens), separating contractions and keeping proper punctuation boundaries intact.
2. **Porter-Equivalent Lemmatization Heuristics**: Strips suffixes and processes irregular morphology to resolve base words (e.g. converting "flying" and "flew" to the common lemma "fly"). This levels the vocabulary playing field for mathematical similarity calculations.
3. **Parts-of-Speech Tagging (POS)**: Categorizes tokens dynamically using unified Penn Treebank structures (e.g., separating standard nouns `NOUN` from proper naming nouns `PROPN` and action elements `VERB`).
4. **Verb-Rooted Dependency Graph**: Builds a functional dependency tree. By locating the core action unit (`ROOT`), tokens are chained to parent heads as objects (`dobj`, `pobj`), nominative subjects (`nsubj`), or modifiers (`amod`, `advmod`, `det`), visible through the dynamic visualizer.
5. **Named Entity Recognition (NER)**: Detects character names, places, and count structures through pattern-matching and lexical classification.

### ChatterBot Matching Pipeline:
Standard chatbots often treat conversation as unstructured generation. `ChatterBot` structures dialogue through **Logic Adapters**:
- Every incoming prompt from the user is converted into standard base lemmas.
- The engine computes a **Jaccard Coefficient** (a ratio of overlapping token vocabulary intersections relative to the total union of vocabulary tokens).
- Concurrently, **Levenshtein Edit Distance** calculates the raw character-level edits (insertions, deletions, substitutions) needed to align the input with any seeded screenplay dialogs.
- These scores are blended into a composite index. If it exceeds a matching threshold of `0.15`, the corresponding cinematic response is triggered. If not, the engine defaults to conversational grounding or invites on-the-fly training metrics.

---

## 🚀 Key Features

### 1. Hybrid Conversational Engine
- **ChatterBot Simulator (Local Adapter)**: Automatically scores input queries against the training corpus. It performs token extraction, lemmatization, and maps matches using:
  - **Fuzzy Levenshtein Edit Distance**: Measures similarity between characters to catch typos and phrasing variants.
  - **Jaccard Coefficient Coordinate Overlap**: Measures structural word vocabulary intersection.
- **Gemini Cognitive API**: An advanced LLM option that references the conversational corpus under deep-learning pipelines to provide creative, witty, and contextualized responses.

### 2. Live spaCy/NLTK Dependency Parser
Every chat message (and sandbox text) runs through our built-in NLP compiler to generate:
- **Lemma Stems**: Standardizes words to root forms (e.g., *flying* → *fly*, *screaming* → *scream*).
- **POS Tagging (Parts of Speech)**: Colors and categories (e.g., `NOUN`, `PROPN`, `VERB`, `AUX`, `ADJ`, `ADP`) to identify syntactic roles.
- **Dependency parsing tree structures**: Models grammatical relationships dynamically with indented trees tracing from the active **ROOT** verb block.
- **Named Entity Recognition (NER)**: Detects persons (`PERSON`), locations (`GPE`), and counts (`CARDINAL`) dynamically.

### 3. Dynamic Screenplay Training Board
- Over **30+ classical seed dialogs** from cinematic history loaded instantly inside memory (*The Matrix*, *Casablanca*, *Star Wars*, *Pulp Fiction*, *Titanic*, *The Silence of the Lambs*, *Good Will Hunting*).
- **On-The-Fly Training Form**: Input a new speaker dialogue pair, choose a genre, and hit submit. The engine registers it inside the memory loop instantly without needing a full-stack reboot or pre-compiled index steps.
- Search and filter corpus databases by movie titles or genre tags.

### 4. Interactive Telemetry Tracer
- See step-by-step thinking stages calculated inside our custom server router.
- Trace exactly how the Jaccard confidence indices computed, which film matched, and what threshold fallbacks were executed.

---

## 🛠️ Built With

### Frontend (SPA Engine)
- **Vite + React (TypeScript)**: Responsive and incredibly lightweight UI wrapper.
- **Tailwind CSS**: A beautiful, custom slate twilight dark aesthetic featuring precise letter-spacing, elegant typography, high contrast borders, and responsive touch layout grids.
- **Lucide Icons**: Intuitive iconography representing films, tokens, and computational models.

### Backend (Process Server)
- **Express (NodeJS)**: Native server hosting API routes for chat execution, training injection, and dynamic lemmatizer compilers.
- **Porter-equivalent Lemmatizer Heuristics**: Custom NLP rules implementing English morphology rules inside standard JS blocks.
- **Google GenAI SDK**: Integrates server-to-server with `gemini-3.5-flash` utilizing strict custom system instructions to ground answers inside screenplay history.

---

## 📦 Getting Started & Commands

### Development
Bootstraps development proxy handlers and live vite server stacks:
```bash
npm run dev
```

### Production Build
Generates compiled React static assets inside `dist/` and compiles TypeScript backend code using `esbuild` to unified CommonJS files:
```bash
npm run build
npm start
```
