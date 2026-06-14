import { TokenInfo, DependencyNode, CorpusItem, MatchResult, NLPAnalysis } from '../types';

// Lexicon for POS and Lemmatization
const LEXICON: Record<string, { pos: string; lemma: string; desc: string }> = {
  // Pronouns
  "i": { pos: "PRON", lemma: "i", desc: "Personal Pronoun" },
  "me": { pos: "PRON", lemma: "i", desc: "Personal Pronoun" },
  "my": { pos: "PRON", lemma: "i", desc: "Possessive Pronoun" },
  "you": { pos: "PRON", lemma: "you", desc: "Personal Pronoun" },
  "your": { pos: "PRON", lemma: "you", desc: "Possessive Pronoun" },
  "he": { pos: "PRON", lemma: "he", desc: "Personal Pronoun" },
  "him": { pos: "PRON", lemma: "he", desc: "Personal Pronoun" },
  "his": { pos: "PRON", lemma: "he", desc: "Possessive Pronoun" },
  "she": { pos: "PRON", lemma: "she", desc: "Personal Pronoun" },
  "her": { pos: "PRON", lemma: "she", desc: "Personal Pronoun" },
  "it": { pos: "PRON", lemma: "it", desc: "Personal Pronoun" },
  "its": { pos: "PRON", lemma: "it", desc: "Possessive Pronoun" },
  "we": { pos: "PRON", lemma: "we", desc: "Personal Pronoun" },
  "us": { pos: "PRON", lemma: "we", desc: "Personal Pronoun" },
  "they": { pos: "PRON", lemma: "they", desc: "Personal Pronoun" },
  "them": { pos: "PRON", lemma: "they", desc: "Personal Pronoun" },
  "this": { pos: "PRON", lemma: "this", desc: "Demonstrative Pronoun" },
  "that": { pos: "PRON", lemma: "that", desc: "Demonstrative Pronoun" },
  "who": { pos: "PRON", lemma: "who", desc: "Interrogative Pronoun" },
  "what": { pos: "PRON", lemma: "what", desc: "Interrogative Pronoun" },
  "which": { pos: "PRON", lemma: "which", desc: "Interrogative Pronoun" },
  "someone": { pos: "PRON", lemma: "someone", desc: "Indefinite Pronoun" },
  "something": { pos: "PRON", lemma: "something", desc: "Indefinite Pronoun" },

  // Verbs / Auxiliary
  "is": { pos: "AUX", lemma: "be", desc: "Auxiliary Verb" },
  "am": { pos: "AUX", lemma: "be", desc: "Auxiliary Verb" },
  "are": { pos: "AUX", lemma: "be", desc: "Auxiliary Verb" },
  "was": { pos: "AUX", lemma: "be", desc: "Auxiliary Verb" },
  "were": { pos: "AUX", lemma: "be", desc: "Auxiliary Verb" },
  "be": { pos: "VERB", lemma: "be", desc: "Root/Auxiliary Verb" },
  "been": { pos: "VERB", lemma: "be", desc: "Verb Participle" },
  "do": { pos: "VERB", lemma: "do", desc: "Verb / Auxiliary" },
  "does": { pos: "VERB", lemma: "do", desc: "Verb / Auxiliary" },
  "did": { pos: "VERB", lemma: "do", desc: "Verb Past" },
  "done": { pos: "VERB", lemma: "do", desc: "Verb Past Participle" },
  "have": { pos: "VERB", lemma: "have", desc: "Verb / Auxiliary" },
  "has": { pos: "VERB", lemma: "have", desc: "Verb / Auxiliary" },
  "had": { pos: "VERB", lemma: "have", desc: "Verb Past" },
  "can": { pos: "AUX", lemma: "can", desc: "Modal Auxiliary" },
  "could": { pos: "AUX", lemma: "can", desc: "Modal Auxiliary" },
  "will": { pos: "AUX", lemma: "will", desc: "Modal Auxiliary" },
  "would": { pos: "AUX", lemma: "will", desc: "Modal Auxiliary" },
  "should": { pos: "AUX", lemma: "should", desc: "Modal Auxiliary" },
  "want": { pos: "VERB", lemma: "want", desc: "Action Verb" },
  "wants": { pos: "VERB", lemma: "want", desc: "Action Verb" },
  "wanted": { pos: "VERB", lemma: "want", desc: "Verb Past" },
  "like": { pos: "VERB", lemma: "like", desc: "Verb of Preference" },
  "likes": { pos: "VERB", lemma: "like", desc: "Verb of Preference" },
  "liked": { pos: "VERB", lemma: "like", desc: "Verb of Preference Past" },
  "love": { pos: "VERB", lemma: "love", desc: "Emotion Verb" },
  "loves": { pos: "VERB", lemma: "love", desc: "Emotion Verb" },
  "loved": { pos: "VERB", lemma: "love", desc: "Emotion Verb Past" },
  "tell": { pos: "VERB", lemma: "tell", desc: "Communication Verb" },
  "tells": { pos: "VERB", lemma: "tell", desc: "Communication Verb" },
  "told": { pos: "VERB", lemma: "tell", desc: "Communication Verb Past" },
  "say": { pos: "VERB", lemma: "say", desc: "Communication Verb" },
  "says": { pos: "VERB", lemma: "say", desc: "Communication Verb" },
  "said": { pos: "VERB", lemma: "say", desc: "Communication Verb Past" },
  "know": { pos: "VERB", lemma: "know", desc: "Cognitive Verb" },
  "knows": { pos: "VERB", lemma: "know", desc: "Cognitive Verb" },
  "knew": { pos: "VERB", lemma: "know", desc: "Cognitive Verb Past" },
  "known": { pos: "VERB", lemma: "know", desc: "Cognitive Verb Past Participle" },
  "see": { pos: "VERB", lemma: "see", desc: "Sensory Verb" },
  "sees": { pos: "VERB", lemma: "see", desc: "Sensory Verb" },
  "saw": { pos: "VERB", lemma: "see", desc: "Sensory Verb Past" },
  "seen": { pos: "VERB", lemma: "see", desc: "Sensory Verb Participle" },
  "think": { pos: "VERB", lemma: "think", desc: "Cognitive Verb" },
  "thinks": { pos: "VERB", lemma: "think", desc: "Cognitive Verb" },
  "thought": { pos: "VERB", lemma: "think", desc: "Cognitive Verb Past" },
  "believe": { pos: "VERB", lemma: "believe", desc: "Cognitive Verb" },
  "believes": { pos: "VERB", lemma: "believe", desc: "Cognitive Verb" },
  "believed": { pos: "VERB", lemma: "believe", desc: "Cognitive Verb Past" },
  "go": { pos: "VERB", lemma: "go", desc: "Motion Verb" },
  "goes": { pos: "VERB", lemma: "go", desc: "Motion Verb" },
  "went": { pos: "VERB", lemma: "go", desc: "Motion Verb Past" },
  "gone": { pos: "VERB", lemma: "go", desc: "Motion Verb Participle" },
  "dodge": { pos: "VERB", lemma: "dodge", desc: "Action Verb" },
  "fly": { pos: "VERB", lemma: "fly", desc: "Action Verb" },
  "flying": { pos: "VERB", lemma: "fly", desc: "Gerund / Verb" },
  "jump": { pos: "VERB", lemma: "jump", desc: "Action Verb" },
  "dance": { pos: "VERB", lemma: "dance", desc: "Action Verb" },
  "win": { pos: "VERB", lemma: "win", desc: "Action Verb" },
  "stop": { pos: "VERB", lemma: "stop", desc: "Verb aspect" },
  "stopped": { pos: "VERB", lemma: "stop", desc: "Verb aspects Past" },
  "scream": { pos: "VERB", lemma: "scream", desc: "Action Verb" },
  "screaming": { pos: "VERB", lemma: "scream", desc: "Verb Gerund" },
  "covet": { pos: "VERB", lemma: "covet", desc: "Transitive Verb" },
  "covets": { pos: "VERB", lemma: "covet", desc: "Transitive Verb" },
  "walk": { pos: "VERB", lemma: "walk", desc: "Motion Verb" },
  "walks": { pos: "VERB", lemma: "walk", desc: "Motion Verb" },
  "climb": { pos: "VERB", lemma: "climb", desc: "Motion Verb" },
  "fail": { pos: "VERB", lemma: "fail", desc: "Event Verb" },
  "fails": { pos: "VERB", lemma: "fail", desc: "Event Verb" },
  "help": { pos: "VERB", lemma: "help", desc: "Action Verb" },
  "play": { pos: "VERB", lemma: "play", desc: "Action Verb" },

  // Nouns
  "matrix": { pos: "NOUN", lemma: "matrix", desc: "Singular Noun" },
  "force": { pos: "NOUN", lemma: "force", desc: "Singular Noun" },
  "bullets": { pos: "NOUN", lemma: "bullet", desc: "Plural Noun" },
  "bullet": { pos: "NOUN", lemma: "bullet", desc: "Singular Noun" },
  "room": { pos: "NOUN", lemma: "room", desc: "Singular Noun" },
  "energy": { pos: "NOUN", lemma: "energy", desc: "Singular Noun" },
  "field": { pos: "NOUN", lemma: "field", desc: "Singular Noun" },
  "things": { pos: "NOUN", lemma: "thing", desc: "Plural Noun" },
  "thing": { pos: "NOUN", lemma: "thing", desc: "Singular Noun" },
  "father": { pos: "NOUN", lemma: "father", desc: "Singular Noun" },
  "friendship": { pos: "NOUN", lemma: "friendship", desc: "Abstract Noun" },
  "friend": { pos: "NOUN", lemma: "friend", desc: "Singular Noun" },
  "friends": { pos: "NOUN", lemma: "friend", desc: "Plural Noun" },
  "sentiment": { pos: "NOUN", lemma: "sentiment", desc: "Singular Noun" },
  "boat": { pos: "NOUN", lemma: "boat", desc: "Singular Noun" },
  "fault": { pos: "NOUN", lemma: "fault", desc: "Singular Noun" },
  "soulmate": { pos: "NOUN", lemma: "soulmate", desc: "Compound Noun" },
  "doors": { pos: "NOUN", lemma: "door", desc: "Plural Noun" },
  "door": { pos: "NOUN", lemma: "door", desc: "Singular Noun" },
  "life": { pos: "NOUN", lemma: "life", desc: "Singular Noun" },
  "mama": { pos: "NOUN", lemma: "mama", desc: "Singular Noun" },
  "chocolates": { pos: "NOUN", lemma: "chocolate", desc: "Plural Noun" },
  "chocolate": { pos: "NOUN", lemma: "chocolate", desc: "Singular Noun" },
  "pounder": { pos: "NOUN", lemma: "pounder", desc: "Agent Noun" },
  "cheese": { pos: "NOUN", lemma: "cheese", desc: "Mass Noun" },
  "trophy": { pos: "NOUN", lemma: "trophy", desc: "Singular Noun" },
  "floor": { pos: "NOUN", lemma: "floor", desc: "Singular Noun" },
  "lambs": { pos: "NOUN", lemma: "lamb", desc: "Plural Noun" },
  "lamb": { pos: "NOUN", lemma: "lamb", desc: "Singular Noun" },
  "man": { pos: "NOUN", lemma: "man", desc: "Singular Noun" },
  "men": { pos: "NOUN", lemma: "man", desc: "Plural Noun" },
  "purpose": { pos: "NOUN", lemma: "purpose", desc: "Abstract Noun" },
  "cinema": { pos: "NOUN", lemma: "cinema", desc: "Mass Noun" },
  "history": { pos: "NOUN", lemma: "history", desc: "Abstract Noun" },
  "movie": { pos: "NOUN", lemma: "movie", desc: "Singular Noun" },
  "movies": { pos: "NOUN", lemma: "movie", desc: "Plural Noun" },
  "film": { pos: "NOUN", lemma: "film", desc: "Singular Noun" },
  "films": { pos: "NOUN", lemma: "film", desc: "Plural Noun" },
  "quote": { pos: "NOUN", lemma: "quote", desc: "Singular Noun" },
  "quotes": { pos: "NOUN", lemma: "quote", desc: "Plural Noun" },
  "stars": { pos: "NOUN", lemma: "star", desc: "Plural Noun" },
  "star": { pos: "NOUN", lemma: "star", desc: "Singular Noun" },
  "deal": { pos: "NOUN", lemma: "deal", desc: "Singular Noun" },
  "joints": { pos: "NOUN", lemma: "joint", desc: "Plural Noun" },
  "towns": { pos: "NOUN", lemma: "town", desc: "Plural Noun" },
  "world": { pos: "NOUN", lemma: "world", desc: "Singular Noun" },
  "kid": { pos: "NOUN", lemma: "kid", desc: "Singular Noun" },
  "box": { pos: "NOUN", lemma: "box", desc: "Singular Noun" },
  "paris": { pos: "PROPN", lemma: "paris", desc: "Proper Noun (GPE)" },
  "louis": { pos: "PROPN", lemma: "louis", desc: "Proper Noun (PERSON)" },
  "neo": { pos: "PROPN", lemma: "neo", desc: "Proper Noun (PERSON)" },
  "morpheus": { pos: "PROPN", lemma: "morpheus", desc: "Proper Noun (PERSON)" },
  "trinity": { pos: "PROPN", lemma: "trinity", desc: "Proper Noun (PERSON)" },
  "luke": { pos: "PROPN", lemma: "luke", desc: "Proper Noun (PERSON)" },
  "skywalker": { pos: "PROPN", lemma: "skywalker", desc: "Proper Noun (PERSON)" },
  "obi-wan": { pos: "PROPN", lemma: "obi-wan", desc: "Proper Noun (PERSON)" },
  "yoda": { pos: "PROPN", lemma: "yoda", desc: "Proper Noun (PERSON)" },
  "vader": { pos: "PROPN", lemma: "vader", desc: "Proper Noun (PERSON)" },
  "casablanca": { pos: "PROPN", lemma: "casablanca", desc: "Proper Noun (GPE)" },
  "reagan": { pos: "PROPN", lemma: "reagan", desc: "Proper Noun (PERSON)" },

  // Adjectives
  "everywhere": { pos: "ADJ", lemma: "everywhere", desc: "Adjective/Adverb" },
  "beautiful": { pos: "ADJ", lemma: "beautiful", desc: "Qualitative Adjective" },
  "impossible": { pos: "ADJ", lemma: "impossible", desc: "Qualitative Adjective" },
  "true": { pos: "ADJ", lemma: "true", desc: "Qualitative Adjective" },
  "fine": { pos: "ADJ", lemma: "fine", desc: "Qualitative Adjective" },
  "finest": { pos: "ADJ", lemma: "fine", desc: "Superlative Adjective" },
  "quarter": { pos: "ADJ", lemma: "quarter", desc: "Quantitative Adjective" },
  "good": { pos: "ADJ", lemma: "good", desc: "Qualitative Adjective" },
  "better": { pos: "ADJ", lemma: "good", desc: "Comparative Adjective" },
  "best": { pos: "ADJ", lemma: "good", desc: "Superlative Adjective" },
  "favorite": { pos: "ADJ", lemma: "favorite", desc: "Qualitative Adjective" },
  "happy": { pos: "ADJ", lemma: "happy", desc: "Qualitative Adjective" },
  "sad": { pos: "ADJ", lemma: "sad", desc: "Qualitative Adjective" },
  "bliss": { pos: "NOUN", lemma: "bliss", desc: "Singular Noun" },
  "cozy": { pos: "ADJ", lemma: "cozy", desc: "Qualitative Adjective" },
  "warm": { pos: "ADJ", lemma: "warm", desc: "Qualitative Adjective" },
  "new": { pos: "ADJ", lemma: "new", desc: "Qualitative Adjective" },
  "young": { pos: "ADJ", lemma: "young", desc: "Qualitative Adjective" },
  "cinematic": { pos: "ADJ", lemma: "cinematic", desc: "Relational Adjective" },
  "same": { pos: "ADJ", lemma: "same", desc: "Determining Adjective" },
  "royal": { pos: "ADJ", lemma: "royal", desc: "Qualitative Adjective" },
  "royale": { pos: "ADJ", lemma: "royal", desc: "Qualitative Adjective (French)" },
  "helpful": { pos: "ADJ", lemma: "helpful", desc: "Qualitative Adjective" },
  "classic": { pos: "ADJ", lemma: "classic", desc: "Qualitative Adjective" },
  "ignorance": { pos: "NOUN", lemma: "ignorance", desc: "Abstract Noun" },

  // Adverbs
  "now": { pos: "ADV", lemma: "now", desc: "Adverb of Time" },
  "even": { pos: "ADV", lemma: "even", desc: "Focus Adverb" },
  "never": { pos: "ADV", lemma: "never", desc: "Adverb of Frequency" },
  "always": { pos: "ADV", lemma: "always", desc: "Adverb of Frequency" },
  "not": { pos: "PART", lemma: "not", desc: "Negative Particle" },
  "too": { pos: "ADV", lemma: "too", desc: "Adverb of Degree" },
  "there": { pos: "ADV", lemma: "there", desc: "Adverb of Place" },
  "why": { pos: "ADV", lemma: "why", desc: "Interrogative Adverb" },
  "where": { pos: "ADV", lemma: "where", desc: "Interrogative Adverb" },
  "well": { pos: "ADV", lemma: "well", desc: "Adverb of Manner / Discourse" },
  "how": { pos: "ADV", lemma: "how", desc: "Interrogative Adverb" },
  "so": { pos: "ADV", lemma: "so", desc: "Adverb of Degree / Conjunction" },
  "away": { pos: "ADV", lemma: "away", desc: "Adverb of Direction" },
  "very": { pos: "ADV", lemma: "very", desc: "Adverb of Degree" },

  // Determiners
  "the": { pos: "DET", lemma: "the", desc: "Definite Article" },
  "a": { pos: "DET", lemma: "a", desc: "Indefinite Article" },
  "an": { pos: "DET", lemma: "a", desc: "Indefinite Article" },
  "all": { pos: "DET", lemma: "all", desc: "Pre-determiner" },
  "every": { pos: "DET", lemma: "every", desc: "Distributive Determiner" },
  "some": { pos: "DET", lemma: "some", desc: "Indefinite Determiner" },
  "any": { pos: "DET", lemma: "any", desc: "Indefinite Determiner" },
  "no": { pos: "DET", lemma: "no", desc: "Negative Determiner" },

  // Prepositions / Adpositions
  "of": { pos: "ADP", lemma: "of", desc: "Preposition" },
  "in": { pos: "ADP", lemma: "in", desc: "Preposition" },
  "to": { pos: "ADP", lemma: "to", desc: "Preposition/Infinitive Marker" },
  "for": { pos: "ADP", lemma: "for", desc: "Preposition" },
  "with": { pos: "ADP", lemma: "with", desc: "Preposition" },
  "on": { pos: "ADP", lemma: "on", desc: "Preposition" },
  "at": { pos: "ADP", lemma: "at", desc: "Preposition" },
  "from": { pos: "ADP", lemma: "from", desc: "Preposition" },
  "by": { pos: "ADP", lemma: "by", desc: "Preposition" },
  "about": { pos: "ADP", lemma: "about", desc: "Preposition" },
  "into": { pos: "ADP", lemma: "into", desc: "Preposition" },
  "around": { pos: "ADP", lemma: "around", desc: "Preposition" },
  "behind": { pos: "ADP", lemma: "behind", desc: "Preposition" },
  "through": { pos: "ADP", lemma: "through", desc: "Preposition" },

  // Coordinating Conjunctions
  "and": { pos: "CCONJ", lemma: "and", desc: "Coordinating Conjunction" },
  "but": { pos: "CCONJ", lemma: "but", desc: "Coordinating Conjunction" },
  "or": { pos: "CCONJ", lemma: "or", desc: "Coordinating Conjunction" },
  "nor": { pos: "CCONJ", lemma: "nor", desc: "Coordinating Conjunction" },
  "yet": { pos: "CCONJ", lemma: "yet", desc: "Coordinating Conjunction" },
};

// Simple Porter-like lemmatizing rules & endings
export function analyzeWord(word: string): { pos: string; lemma: string; desc: string } {
  const normalized = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  if (!normalized) {
    return { pos: "PUNCT", lemma: word, desc: "Punctuation mark" };
  }

  // Look in manual lexicon
  if (LEXICON[normalized]) {
    return { ...LEXICON[normalized] };
  }

  // Guess by capitalized entity (e.g. Neo)
  if (word[0] === word[0].toUpperCase() && word.length > 2) {
    return { pos: "PROPN", lemma: normalized, desc: "Proper Noun (Unclassified)" };
  }

  // Common suffix heuristics
  if (normalized.endsWith("ly")) {
    return { pos: "ADV", lemma: normalized.slice(0, -2), desc: "Adverb formed by suffix -ly" };
  }
  if (normalized.endsWith("ing")) {
    return { pos: "VERB", lemma: normalized.slice(0, -3), desc: "Verb present participle (-ing)" };
  }
  if (normalized.endsWith("ed") && normalized.length > 4) {
    return { pos: "VERB", lemma: normalized.slice(0, -2), desc: "Verb past tense (-ed)" };
  }
  if (normalized.endsWith("s") && normalized.length > 3 && !normalized.endsWith("ss")) {
    return { pos: "NOUN", lemma: normalized.slice(0, -1), desc: "Plural Noun / Verb Singular present (-s)" };
  }
  if (normalized.endsWith("es") && normalized.length > 4) {
    return { pos: "NOUN", lemma: normalized.slice(0, -2), desc: "Noun Plural / Verb Singular present (-es)" };
  }
  if (normalized.endsWith("est")) {
    return { pos: "ADJ", lemma: normalized.slice(0, -3), desc: "Superlative Adjective (-est)" };
  }

  // Detect pure numbers
  if (/^\d+$/.test(normalized)) {
    return { pos: "NUM", lemma: normalized, desc: "Numeric Quantity" };
  }

  // Default fallback is Noun
  return { pos: "NOUN", lemma: normalized, desc: "Common Noun (Synthesized)" };
}

// Tokenize sentence with index trackers
export function tokenizeSentence(sentence: string): TokenInfo[] {
  // Regex that captures words (including contractions like wouldn't or Obi-Wan) and punctuation
  const matches = sentence.match(/[\w'-]+|[.,\/#!$%\^&\*;:{}=\_`~()?]/g) || [];
  
  const tokens: TokenInfo[] = [];
  
  matches.forEach((item, index) => {
    const analysis = analyzeWord(item);
    
    // Simple NER guesses
    let ner: string | undefined;
    let nerDescription: string | undefined;
    const lower = item.toLowerCase();
    
    if (analysis.pos === "PROPN") {
      if (["luke", "neo", "morpheus", "clarice", "vader", "frederick", "rick", "ilsa", "jack", "rose", "jenny", "forrest", "louis"].includes(lower)) {
        ner = "PERSON";
        nerDescription = "Named person or character reference";
      } else if (["paris", "casablanca", "france", "america"].includes(lower)) {
        ner = "GPE";
        nerDescription = "Geopolitical location / city / country";
      } else {
        ner = "PERSON";
        nerDescription = "Guessed Entiity / Person";
      }
    } else if (analysis.pos === "NUM") {
      ner = "CARDINAL";
      nerDescription = "Numeric count / numeral";
    } else if (["today", "tomorrow", "yesterday", "tonight"].includes(lower)) {
      ner = "DATE";
      nerDescription = "Relative calendar date reference";
    }
    
    tokens.push({
      index,
      word: item,
      lemma: analysis.lemma,
      pos: analysis.pos,
      posDescription: analysis.desc,
      dep: "dep", // filled later in dep parser
      head: 0,    // filled later in dep parser
      ner,
      nerDescription
    });
  });
  
  // Syntactic Dependency Parser builder (Simple grammar-rule based link builder)
  // Identify root, subject, objects
  let rootIndex = -1;
  
  // 1. Find root (First core verb or auxiliary verb)
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].pos === "VERB" || tokens[i].pos === "AUX") {
      rootIndex = i;
      tokens[i].dep = "ROOT";
      tokens[i].head = i;
      break;
    }
  }
  
  // If no verb found, find first noun or make first token ROOT
  if (rootIndex === -1) {
    if (tokens.length > 0) {
      rootIndex = 0;
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].pos === "NOUN" || tokens[i].pos === "PROPN") {
          rootIndex = i;
          break;
        }
      }
      tokens[rootIndex].dep = "ROOT";
      tokens[rootIndex].head = rootIndex;
    }
  }
  
  // 2. Link tokens to Root or neighbors
  for (let i = 0; i < tokens.length; i++) {
    if (i === rootIndex) continue;
    
    const t = tokens[i];
    
    if (t.pos === "PUNCT") {
      t.dep = "punct";
      t.head = rootIndex;
    } else if (t.pos === "PRON" || t.pos === "NOUN" || t.pos === "PROPN") {
      if (i < rootIndex) {
        t.dep = "nsubj"; // Nominal Subject
        t.head = rootIndex;
      } else {
        t.dep = "dobj";  // Direct Object
        // If there's an active preposition, make child of preposition
        let activePrep = -1;
        for (let j = i - 1; j > rootIndex; j--) {
          if (tokens[j].pos === "ADP") {
            activePrep = j;
            break;
          }
        }
        if (activePrep !== -1) {
          t.dep = "pobj"; // Object of preposition
          t.head = activePrep;
        } else {
          t.head = rootIndex;
        }
      }
    } else if (t.pos === "DET") {
      t.dep = "det"; // Determiner
      // link to next adjacent noun/noun phrase
      let nounFound = false;
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].pos === "NOUN" || tokens[j].pos === "PROPN") {
          t.head = j;
          nounFound = true;
          break;
        }
      }
      if (!nounFound) t.head = rootIndex;
    } else if (t.pos === "ADJ") {
      t.dep = "amod"; // Adjectival Modifier
      // link to next noun
      let nounFound = false;
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].pos === "NOUN" || tokens[j].pos === "PROPN") {
          t.head = j;
          nounFound = true;
          break;
        }
      }
      if (!nounFound) t.head = rootIndex;
    } else if (t.pos === "ADP") {
      t.dep = "prep"; // Prepositional relation
      t.head = rootIndex;
    } else if (t.pos === "ADV") {
      t.dep = "advmod"; // Adverbial modifier
      t.head = rootIndex;
    } else {
      t.dep = "dep";
      t.head = rootIndex;
    }
  }
  
  return tokens;
}

// Convert flat Token list into a recursive Tree
export function buildDependencyTree(tokens: TokenInfo[]): DependencyNode {
  if (tokens.length === 0) {
    return { index: 0, word: "Empty", pos: "PUNCT", dep: "root", children: [] };
  }
  
  const rootToken = tokens.find(t => t.dep === "ROOT") || tokens[0];
  
  const buildNode = (token: TokenInfo): DependencyNode => {
    const node: DependencyNode = {
      index: token.index,
      word: token.word,
      pos: token.pos,
      dep: token.dep,
      children: []
    };
    
    // Find children whose head is this token's index
    const childTokens = tokens.filter(t => t.head === token.index && t.index !== token.index);
    node.children = childTokens.map(t => buildNode(t));
    return node;
  };
  
  return buildNode(rootToken);
}

// Core similarity NLP metrics (used by ChatterBot simulator logic adapters)
export function getLevenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // Deletion
        d[i][j - 1] + 1,      // Insertion
        d[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  return d[m][n];
}

export function computeLevenshteinSimilarity(s1: string, s2: string): number {
  const clean1 = s1.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
  const clean2 = s2.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
  
  if (!clean1 && !clean2) return 1.0;
  if (!clean1 || !clean2) return 0.0;
  
  const dist = getLevenshteinDistance(clean1, clean2);
  const maxLen = Math.max(clean1.length, clean2.length);
  return 1 - dist / maxLen;
}

// Token intersection / Jaccard similarity
export function computeJaccardSimilarity(s1: string, s2: string): { similarity: number; overlap: string[] } {
  const t1 = new Set(s1.toLowerCase().match(/\w+/g) || []);
  const t2 = new Set(s2.toLowerCase().match(/\w+/g) || []);
  
  if (t1.size === 0 && t2.size === 0) {
    return { similarity: 1.0, overlap: [] };
  }
  
  const intersection = new Set([...t1].filter(x => t2.has(x)));
  const union = new Set([...t1, ...t2]);
  
  return {
    similarity: intersection.size / union.size,
    overlap: Array.from(intersection)
  };
}

// Hybrid Similarity (similar to ChatterBot's closest match Logic Adapter)
export function findClosestCorpusMatch(userInput: string, corpus: CorpusItem[]): MatchResult {
  let bestMatch: CorpusItem = corpus[0] || {} as CorpusItem;
  let highestScore = -1;
  let finalOverlap: string[] = [];
  
  corpus.forEach(item => {
    const levSim = computeLevenshteinSimilarity(userInput, item.prompt);
    const jaccard = computeJaccardSimilarity(userInput, item.prompt);
    
    // Combining metric: Jaccard overlap + Levenshtein fuzzy matching
    // ChatterBot uses combinations or chosen rules. We'll do a robust weighted sum!
    const combinedScore = (jaccard.similarity * 0.6) + (levSim * 0.4);
    
    if (combinedScore > highestScore) {
      highestScore = combinedScore;
      bestMatch = item;
      finalOverlap = jaccard.overlap;
    }
  });
  
  return {
    item: bestMatch,
    similarity: highestScore,
    overlapTokens: finalOverlap
  };
}

// Full analytical model
export function performNLPAnalysis(text: string): NLPAnalysis {
  const tokens = tokenizeSentence(text);
  const dependencyTree = buildDependencyTree(tokens);
  
  // Gather entities
  const entities: NLPAnalysis['entities'] = [];
  tokens.forEach(t => {
    if (t.ner) {
      const charIndex = text.toLowerCase().indexOf(t.word.toLowerCase());
      entities.push({
        text: t.word,
        label: t.ner,
        offset: [charIndex !== -1 ? charIndex : 0, (charIndex !== -1 ? charIndex : 0) + t.word.length],
        description: t.nerDescription || ""
      });
    }
  });
  
  // POS Distribution
  const posDistribution: Record<string, number> = {};
  tokens.forEach(t => {
    posDistribution[t.pos] = (posDistribution[t.pos] || 0) + 1;
  });
  
  // Sentence Type detection
  let sentenceType = "Declarative";
  if (text.trim().endsWith("?")) {
    sentenceType = "Interrogative (Questioning)";
  } else if (text.trim().endsWith("!")) {
    sentenceType = "Exclamatory (Emphatic)";
  }
  
  return {
    text,
    tokens,
    dependencyTree,
    entities,
    summary: {
      wordCount: tokens.filter(t => t.pos !== "PUNCT").length,
      posDistribution,
      sentenceType
    }
  };
}
