export interface TokenInfo {
  index: number;
  word: string;
  lemma: string;
  pos: string; // e.g. NOUN, VERB, PRON, DET, ADP, ADJ, ADV, CONJ, PUNCT, etc.
  posDescription: string; // human description
  dep: string; // Syntactic dependency: nsubj, root, dobj, amod, det, prep, pobj, etc.
  head: number; // Index of head token
  ner?: string; // Named Entity: PERSON, ORG, GPE, DATE, TIME, CARDINAL, etc.
  nerDescription?: string;
}

export interface DependencyNode {
  index: number;
  word: string;
  pos: string;
  dep: string;
  children: DependencyNode[];
}

export interface CorpusItem {
  id: string;
  movieTitle: string;
  genre: string;
  characterA: string; // The person speaking the prompt
  characterB: string; // The person responding
  prompt: string;     // Input statement
  response: string;   // Output statement
  isUserAdded?: boolean;
}

export interface MatchResult {
  item: CorpusItem;
  similarity: number; // 0 to 1 scale
  overlapTokens: string[];
}

export interface NLPAnalysis {
  text: string;
  tokens: TokenInfo[];
  dependencyTree: DependencyNode;
  entities: { text: string; label: string; offset: [number, number]; description: string }[];
  summary: {
    wordCount: number;
    posDistribution: Record<string, number>;
    sentenceType: string; // Declarative, Interrogative, Exclamatory
  };
}

export type ChatEngineType = 'chatterbot' | 'gemini';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  engine: ChatEngineType;
  nlpAnalysis?: NLPAnalysis;
  matchScore?: number;
  matchedMovie?: string;
  matchedLine?: string;
  thinkingSteps?: string[];
}
