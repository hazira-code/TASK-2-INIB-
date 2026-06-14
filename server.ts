import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { DEFAULT_CORNELL_CORPUS } from "./src/data/cornell_corpus";
import { CorpusItem, ChatEngineType } from "./src/types";
import { performNLPAnalysis, findClosestCorpusMatch } from "./src/lib/nltk_spacy_engine";

// Load env variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory training corpus initialized on server start
let activeCorpus: CorpusItem[] = [...DEFAULT_CORNELL_CORPUS];

// Initialize Gemini SDK with telemetry header "aistudio-build"
let googleAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  googleAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Get entire training corpus
app.get("/api/corpus", (req, res) => {
  res.json({ corpus: activeCorpus });
});

// 2. Add row to active training corpus (Retrains instantly)
app.post("/api/corpus", (req, res) => {
  const { movieTitle, genre, characterA, characterB, prompt, response } = req.body;

  if (!movieTitle || !prompt || !response) {
     res.status(400).json({ error: "Required fields: movieTitle, prompt, response" });
     return;
  }

  const newItem: CorpusItem = {
    id: `u-${Date.now()}`,
    movieTitle,
    genre: genre || "User Trained",
    characterA: characterA || "User",
    characterB: characterB || "Chatbot",
    prompt,
    response,
    isUserAdded: true
  };

  activeCorpus.unshift(newItem); // prepending so it is visible first
  res.status(201).json({ success: true, item: newItem });
});

// 3. Reset corpus to defaults
app.post("/api/corpus/reset", (req, res) => {
  activeCorpus = [...DEFAULT_CORNELL_CORPUS];
  res.json({ success: true, corpus: activeCorpus });
});

// 4. Perform direct NLP analysis (Demonstrates NLTK/spaCy features)
app.post("/api/nlp/analyze", (req, res) => {
  const { text } = req.body;
  if (!text) {
     res.status(400).json({ error: "No text specified" });
     return;
  }
  const analysis = performNLPAnalysis(text);
  res.json({ analysis });
});

// 5. Run chatbot matching / response pipeline
app.post("/api/chat", async (req, res) => {
  const { message, engine } = req.body;
  
  if (!message) {
     res.status(400).json({ error: "Message is required" });
     return;
  }

  const selectedEngine: ChatEngineType = engine || 'chatterbot';

  // 1. Direct spaCy/NLTK interactive analysis on the user message
  const nlpAnalysis = performNLPAnalysis(message);

  // 2. ChatterBot Jaccard / Levenshtein alignment analyzer
  const corpusMatch = findClosestCorpusMatch(message, activeCorpus);

  let responseText = "";
  let matchedLine = "";
  let matchedMovie = "";
  let matchScore = 0;
  let thinkingSteps: string[] = [];

  thinkingSteps.push(`Received user message: "${message}"`);
  thinkingSteps.push(`Executed tokenizer: split sentence into ${nlpAnalysis.tokens.length} syntactic tokens.`);
  thinkingSteps.push(`Lemmatized active tokens & tagged Parts of Speech (POS distribution: ${JSON.stringify(nlpAnalysis.summary.posDistribution)}).`);

  if (selectedEngine === 'chatterbot') {
    thinkingSteps.push(`Invoking ChatterBot default Matcher Logic Adapter.`);
    thinkingSteps.push(`Scoring user statement against ${activeCorpus.length} pre-seeded movie transcripts.`);
    
    matchScore = corpusMatch.similarity;
    matchedLine = corpusMatch.item.prompt;
    matchedMovie = `${corpusMatch.item.movieTitle} (${corpusMatch.item.genre})`;
    
    thinkingSteps.push(`Best Jaccard Alignment Match: "${matchedLine}" from ${matchedMovie} with confidence index ${matchScore.toFixed(3)}.`);
    
    // Logic threshold fallback like ChatterBot
    if (matchScore > 0.15) {
      responseText = corpusMatch.item.response;
      thinkingSteps.push(`Match exceeds critical threshold (0.15). Extracting scene counter-dialogue response: "${responseText}".`);
    } else {
      responseText = "That is an intriguing script! I lack a direct match for that coordinate in my Cornell dialog catalog, but I am listening. Add it to my corpus training board so let's learn it!";
      thinkingSteps.push(`Match confidence is too low. Executing default logical fallback.`);
    }
    
    res.json({
      sender: "bot",
      text: responseText,
      engine: "chatterbot",
      nlpAnalysis,
      matchScore,
      matchedMovie,
      matchedLine,
      thinkingSteps
    });

  } else {
    // Gemini Cognitive API mode
    thinkingSteps.push("Invoking full-stack Google Gemini LLM API client.");
    thinkingSteps.push("Injecting spaCy/NLTK context variables, Lemmatized token definitions, and Cornell Movie references into live prompt context.");

    if (!googleAI) {
      thinkingSteps.push("[Error] GEMINI_API_KEY is not defined. Falling back to local model adapter.");
      // Soft fallback when key is not configured yet
      res.json({
        sender: "bot",
        text: `You have invoked Gemini Interactive mode, but GEMINI_API_KEY is not configured yet in Secrets! Let's talk through ChatterBot. Simulating answer:\n\n"You are asking me: '${message}' as a cognitive query! Underneath, your tokens lemmatize to base forms. Please insert your API Key in the Secrets Panel to query our live brains!"`,
        engine: "gemini",
        nlpAnalysis,
        matchScore: corpusMatch.similarity,
        matchedMovie: `${corpusMatch.item.movieTitle} (${corpusMatch.item.genre})`,
        matchedLine: corpusMatch.item.prompt,
        thinkingSteps: [...thinkingSteps, "Gemini client reported missing secret parameter."]
      });
      return;
    }

    try {
      const response = await googleAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: `You are an elegant movie-loving AI Chatbot that is built as a hybrid companion.
The user is testing an interactive NLP app demonstrating spaCy (lemma, dependency parsing) and ChatterBot (trained on Cornell Movie Dialogs Corpus).
You are aware of the current full training corpus, which has movie definitions: Casablanca, The Matrix, Star Wars, pulp Fiction, and Titanic.

In your response, you must:
1. React to the user's message in a highly witty, cinematic, or dramatic tone.
2. Ground your thought in movie references or dialogues (from Cornell Corpus).
3. Be professional, expressive, and fun.
4. Keep the response compact and human-like (approx 2-3 sentences), with a subtle reference/quote if appropriate.`,
          temperature: 0.8
        }
      });

      responseText = response.text || "Cinema silence... my thoughts are lost in transition.";
      thinkingSteps.push("Successfully received stream candidates back from Gemini API.");
      thinkingSteps.push(`Answer parsed: "${responseText}"`);

      res.json({
        sender: "bot",
        text: responseText,
        engine: "gemini",
        nlpAnalysis,
        matchScore: corpusMatch.similarity,
        matchedMovie: `${corpusMatch.item.movieTitle} (${corpusMatch.item.genre})`,
        matchedLine: corpusMatch.item.prompt,
        thinkingSteps
      });
    } catch (err: any) {
      thinkingSteps.push(`[Failure] Gemini model API call failed: ${err.message || err}`);
      res.status(500).json({ 
        error: "Failed to communicate with Gemini API on server",
        thinkingSteps 
      });
    }
  }
});

// -------------------------------------------------------------
// Vite + App static server setup
// -------------------------------------------------------------

async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack Node Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to bootstrap server dependencies:", err);
});
