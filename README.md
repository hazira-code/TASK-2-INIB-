# NLP Movie Chatbot & Cornell Corpus Explorer

Welcome to the **NLP Movie Chatbot & Cornell Corpus Explorer**, a full-stack, highly interactive chat application and Natural Language Processing (NLP) simulator. This application mimics Python's `ChatterBot` logic adapters, implements an NLTK/spaCy-like tokenization and syntax parsing pipeline, and lets users query and expand a dialogue corpus trained on the classic **Cornell Movie Dialogs Corpus**.

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
