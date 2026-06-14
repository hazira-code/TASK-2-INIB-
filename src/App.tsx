import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Code, 
  FileText, 
  Database, 
  RotateCcw, 
  Plus, 
  Film, 
  Tag, 
  Sparkles, 
  Network, 
  Award, 
  ArrowRight,
  Fingerprint,
  Info,
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Compass,
  Mic,
  MicOff,
  X,
  SlidersHorizontal,
  Menu,
  HelpCircle
} from 'lucide-react';
import { ChatMessage, CorpusItem, NLPAnalysis, TokenInfo, DependencyNode } from './types';

// Detect browser Web Speech Recognition capability
const SpeechRecognition = typeof window !== 'undefined' 
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  : null;

export default function App() {
  // Primary Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Welcome screenplays explorer! I am Chess / CinemaGPT, an NLP Chatbot replicating python's ChatterBot BestMatch logic. I can analyze your input live using spaCy-like tokenization models, extract parts-of-speech tag structures, map grammatical dependency graphs, and search the Cornell Movie Dialogs corpus. Choose a suggest quote below or speak into your microphone to inspect!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'chatterbot',
      thinkingSteps: [
        "Initialized Porter-equivalent Lemmatizer...",
        "Pre-seeded 30+ classical movie screenplays spanning Sci-Fi, Romance, and Noir Drama.",
        "Awaiting conversational matrices..."
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeEngine, setActiveEngine] = useState<'chatterbot' | 'gemini'>('chatterbot');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

  // Web Speech API States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Studio Sidebar Collapse States
  const [isStudioOpen, setIsStudioOpen] = useState(true);

  // Corpus/Training Database States
  const [corpus, setCorpus] = useState<CorpusItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  
  // Custom Training Form States
  const [trainPrompt, setTrainPrompt] = useState('');
  const [trainResponse, setTrainResponse] = useState('');
  const [trainMovie, setTrainMovie] = useState('');
  const [trainGenre, setTrainGenre] = useState('Sci-Fi');
  const [trainCharA, setTrainCharA] = useState('User');
  const [trainCharB, setTrainCharB] = useState('Bot');
  const [trainingMessage, setTrainingMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Direct Sandbox Analytical NLP State
  const [sandboxText, setSandboxText] = useState('What are you trying to tell me? That I can dodge bullets?');
  const [sandboxAnalysis, setSandboxAnalysis] = useState<NLPAnalysis | null>(null);
  const [isSandboxAnalyzing, setIsSandboxAnalyzing] = useState(false);

  // Right Side Panel Tab Choice
  const [activeTab, setActiveTab] = useState<'nlp' | 'corpus' | 'debugger'>('nlp');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial corpus list from Express Backend
  useEffect(() => {
    fetchCorpus();
  }, []);

  // Sync scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Run initial sandbox analysis
  useEffect(() => {
    handleSandboxAnalyze();
  }, []);

  // Cleanup speech instance if active on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Reset standard message sequence (ChatGPT New Chat equivalent)
  const handleStartNewChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: "Dialogue memory recycled! Type a new query or feed a prompt card below. I am standing by to extract linguistic dependencies on any screenplay lines.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: activeEngine,
        thinkingSteps: [
          "Recycled local history stack.",
          "Awaiting next input stream..."
        ]
      }
    ]);
    setSelectedMessage(null);
  };

  // Web Speech recognition toggle
  const toggleListening = () => {
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputMessage(text);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone permission denied.");
        } else {
          setSpeechError(`Speech Error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error(err);
      setSpeechError(`Failed to initialize: ${err.message || err}`);
      setIsListening(false);
    }
  };

  const fetchCorpus = async () => {
    try {
      const res = await fetch('/api/corpus');
      const data = await res.json();
      if (data.corpus) {
        setCorpus(data.corpus);
      }
    } catch (err) {
      console.error("Failed to load movie training corpus:", err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText ? customText.trim() : inputMessage.trim();
    if (!textToSend || isGenerating) return;

    if (!customText) {
      setInputMessage('');
    }

    const userMsgId = `u-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: activeEngine
    };

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      // Trigger API backend
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, engine: activeEngine })
      });
      
      const reply = await res.json();
      
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: reply.engine || activeEngine,
        nlpAnalysis: reply.nlpAnalysis,
        matchScore: reply.matchScore,
        matchedMovie: reply.matchedMovie,
        matchedLine: reply.matchedLine,
        thinkingSteps: reply.thinkingSteps || []
      };

      setMessages(prev => [...prev, botMsg]);
      setSelectedMessage(botMsg); // Focus on this message in the NLP analyzer instantly
    } catch (err) {
      console.error("Chat failure:", err);
      const errBotMsg: ChatMessage = {
        id: `b-err-${Date.now()}`,
        sender: 'bot',
        text: "My neural transmission was interrupted. Please ensure our server is up and listening!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: activeEngine,
        thinkingSteps: ["Error connecting to server stack."]
      };
      setMessages(prev => [...prev, errBotMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrainingMessage(null);

    if (!trainPrompt || !trainResponse || !trainMovie) {
      setTrainingMessage({ type: 'error', text: 'Prompt, response, and movie title are required!' });
      return;
    }

    try {
      const res = await fetch('/api/corpus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle: trainMovie,
          genre: trainGenre,
          characterA: trainCharA,
          characterB: trainCharB,
          prompt: trainPrompt,
          response: trainResponse
         })
      });

      if (res.ok) {
        setTrainingMessage({ 
          type: 'success', 
          text: `Success! Retrained instantly. ChatterBot now understands: "${trainPrompt}"` 
        });
        
        // Clear fields
        setTrainPrompt('');
        setTrainResponse('');
        
        // Refresh local memory corpus list
        fetchCorpus();
      } else {
        const data = await res.json();
        setTrainingMessage({ type: 'error', text: data.error || 'Server rejected training payload' });
      }
    } catch (err) {
      setTrainingMessage({ type: 'error', text: 'Could not contact training endpoint on server' });
    }
  };

  const handleResetCorpus = async () => {
    if (!window.confirm("Are you sure you want to restore the Cornell Movie Corpus to default seeded items? This clears user-added dialogues.")) return;
    try {
      const res = await fetch('/api/corpus/reset', { method: 'POST' });
      if (res.ok) {
        fetchCorpus();
        alert("Corpus reverted successfully!");
      }
    } catch (err) {
      console.error("Revert failure:", err);
    }
  };

  const handleSandboxAnalyze = async () => {
    if (!sandboxText.trim()) return;
    setIsSandboxAnalyzing(true);
    try {
      const res = await fetch('/api/nlp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sandboxText })
      });
      const data = await res.json();
      if (data.analysis) {
        setSandboxAnalysis(data.analysis);
      }
    } catch (err) {
      console.error("NLP analysis sandbox failure:", err);
    } finally {
      setIsSandboxAnalyzing(false);
    }
  };

  // Helper colors for spaCy POS tags
  const getPosBadgeStyle = (pos: string) => {
    switch (pos) {
      case 'NOUN': return 'bg-blue-900/40 text-blue-300 border-blue-700/60';
      case 'PROPN': return 'bg-cyan-900/50 text-cyan-200 border-cyan-600/60';
      case 'VERB': return 'bg-emerald-950/50 text-emerald-300 border-emerald-700/60';
      case 'AUX': return 'bg-teal-950/40 text-teal-300 border-teal-700/40';
      case 'ADJ': return 'bg-amber-950/50 text-amber-300 border-amber-700/50';
      case 'ADV': return 'bg-purple-950/40 text-purple-300 border-purple-800/40';
      case 'PRON': return 'bg-indigo-950/40 text-indigo-300 border-indigo-700/50';
      case 'DET': return 'bg-rose-950/30 text-rose-300 border-rose-800/40';
      case 'ADP': return 'bg-zinc-900 text-zinc-300 border-zinc-700/50';
      case 'CCONJ': return 'bg-orange-950/30 text-orange-300 border-orange-800/40';
      case 'PUNCT': return 'bg-zinc-950 text-zinc-400 border-zinc-900';
      default: return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  // Filter Corpus Items
  const filteredCorpus = corpus.filter(item => {
    const matchesSearch = 
      item.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.response.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre === 'All' || item.genre.toLowerCase() === selectedGenre.toLowerCase();
    return matchesSearch && matchesGenre;
  });

  // Extract all genres dynamically for dropdown list
  const genres = ['All', ...Array.from(new Set(corpus.map(c => c.genre)))];

  // Pick the NLP visualization dataset (either selected chat reply or sandbox text)
  const activeNLPAnalysis = selectedMessage?.nlpAnalysis || sandboxAnalysis;
  const targetLabelName = selectedMessage ? `Message Parsing` : "Direct Sandbox Text";

  // Simple rendering of syntactic tree structure in CSS indentation
  const renderDependencyTreeHTML = (node: DependencyNode) => {
    return (
      <div key={`${node.word}-${node.index}`} className="pl-4 border-l border-zinc-800 my-1 transition-all duration-300 hover:border-amber-500/50">
        <div className="flex items-center gap-2 py-0.5 text-xs">
          <span className="font-semibold text-zinc-100 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 shadow-sm">
            {node.word}
          </span>
          <span className="text-[9px] uppercase tracking-wider px-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
            {node.pos}
          </span>
          <span className="text-zinc-500">→</span>
          <span className="text-[9px] text-amber-400 font-mono italic">
            {node.dep}
          </span>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            {node.children.map(child => renderDependencyTreeHTML(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#212121] text-zinc-100 flex font-sans selection:bg-amber-500 selection:text-black">
      
      {/* SIDEBAR Component: Replicates ChatGPT left pane perfectly */}
      <aside className="w-[260px] bg-[#171717] h-screen flex flex-col shrink-0 border-r border-[#2f2f2f]/30 max-md:hidden select-none">
        
        {/* Sidebar Header Button: New Chat */}
        <div className="p-3.5">
          <button 
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-zinc-100 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition duration-200 group text-left cursor-pointer"
          >
            <span className="flex items-center gap-2 font-medium">
              <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              New Dialogue
            </span>
            <Code className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>

        {/* Cognitive Model Configurer inside ChatGPT sidebar */}
        <div className="px-3.5 pb-2.5">
          <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 font-semibold">
                Brain Model
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            <div className="space-y-1">
              <button 
                onClick={() => setActiveEngine('chatterbot')}
                className={`w-full flex items-center gap-2 justify-start py-1.5 px-2 text-xs rounded-md transition ${
                  activeEngine === 'chatterbot' 
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5 shrink-0" />
                <span>ChatterBot Sim v1.2</span>
              </button>
              <button 
                onClick={() => setActiveEngine('gemini')}
                className={`w-full flex items-center gap-2 justify-start py-1.5 px-2 text-xs rounded-md transition ${
                  activeEngine === 'gemini' 
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Gemini flash (Real LLM)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable middle historical/reference screenplay index */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-4">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 font-bold block mb-2 px-1">
              Seeded Classics
            </span>
            
            <div className="space-y-1">
              {[
                { title: "The Matrix", quote: "What is the Matrix?" },
                { title: "Casablanca", quote: "Here's looking at you, kid." },
                { title: "Star Wars", quote: "What is the Force?" },
                { title: "Titanic", quote: "I jump, you jump, remember?" },
                { title: "The Graduate", quote: "Mrs. Robinson, you are trying to seduce me." }
              ].map((seed, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, seed.quote)}
                  className="w-full text-left py-2 px-3 text-xs text-zinc-300 rounded-lg hover:bg-zinc-800 truncate block transition border border-transparent hover:border-zinc-800"
                  title={seed.quote}
                >
                  <span className="text-[10px] text-amber-500/70 mr-1.5 font-mono">[{seed.title}]</span>
                  {seed.quote}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom utility tray: Restore action & inspect buttons */}
        <div className="p-3.5 border-t border-[#2f2f2f]/30 space-y-2 bg-[#141414]">
          <button 
            onClick={() => setIsStudioOpen(!isStudioOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
            <span>{isStudioOpen ? "Hide NLP Studio" : "Open NLP Studio"}</span>
          </button>
          
          <button 
            onClick={handleResetCorpus}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition hover:bg-zinc-950 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
            <span>Restore Seed Dialogs</span>
          </button>
        </div>
      </aside>

      {/* CENTER: Main Chat Box Content (ChatGPT minimal canvas) */}
      <section className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#212121]">
        
        {/* Sleek Header bar */}
        <header className="h-[56px] border-b border-[#2f2f2f]/30 px-4 flex items-center justify-between shrink-0 bg-[#212121]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleStartNewChat} 
              className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100 font-serif text-sm tracking-tight flex items-center gap-1.5">
                <Bot className="w-4.5 h-4.5 text-amber-500" />
                CinemaGPT
              </span>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700/60 font-mono">
                {activeEngine === 'chatterbot' ? 'ChatterBot Matching' : 'Gemini 3.5 API'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers to quickly control side panels */}
            <button
              onClick={() => setIsStudioOpen(!isStudioOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/40 text-zinc-200 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>{isStudioOpen ? "Close Studio Console" : "Inspect spaCy NLP"}</span>
            </button>
          </div>
        </header>

        {/* Message Streams Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-zinc-800">
          
          {/* Welcome Screen Cards: Renders ChatGPT landing suggested questions block */}
          {messages.length === 1 && messages[0].id.includes('welcome') ? (
            <div className="max-w-2xl mx-auto py-12 md:py-16 space-y-10">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
                  <Film className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-white tracking-tight">
                  How can I help you analyze dialogue?
                </h2>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  CinemaGPT matches phrases inside classical drama history and runs porter lemmatization parsing live.
                </p>
              </div>

              {/* Suggestions Cards Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "What is the Matrix?", desc: "Triggers Jaccard & edit index lookups inside sci-fi seeds." },
                  { title: "Ignorance is bliss.", desc: "Scans Cypher's cynical dialogue sequences." },
                  { title: "Here's looking at you, kid.", desc: "Examines Casablanca's classic romantic noir matrix." },
                  { title: "What is the Force?", desc: "Obi-Wan explains the metadata of our galaxy." }
                ].map((card, cIdx) => (
                  <button 
                    key={cIdx}
                    onClick={() => handleSendMessage(undefined, card.title)}
                    className="p-4 bg-[#2f2f2f]/30 hover:bg-[#2f2f2f]/60 rounded-xl border border-zinc-800 text-left transition duration-200 cursor-pointer hover:border-zinc-700"
                  >
                    <span className="block text-xs font-semibold text-zinc-100 font-mono mb-1">{card.title}</span>
                    <span className="block text-[11px] text-zinc-400 leading-normal">{card.desc}</span>
                  </button>
                ))}
              </div>

              {/* Descriptive Welcome Box */}
              <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-2 text-zinc-400 text-xs leading-relaxed">
                <p>
                  <strong>💡 Dynamic Inspection Pipeline:</strong> Type anything in the center console or speak clearly into your mic. The response automatically calculates <strong>spaCy dependencies</strong>, POS tags, and token lemma stems visible inside the sidebar drawer!
                </p>
              </div>

            </div>
          ) : (
            
            // Conversation Message Rows (ChatGPT aligned layout)
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* Bot Avatar Icon */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 flex items-center justify-center shadow-inner">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                    )}

                    {/* Speech Text row content */}
                    <div className={`max-w-[85%] ${isUser ? 'space-y-1 text-right' : 'space-y-3'}`}>
                      
                      {/* Name Meta info */}
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                        <span>{isUser ? 'You' : `CinemaGPT • ${msg.engine === 'chatterbot' ? 'ChatterBot Local' : 'Gemini AI'}`}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Text Bubble */}
                      <div 
                        className={`text-sm leading-relaxed ${
                          isUser 
                            ? 'bg-[#2f2f2f] text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm border border-zinc-700/40 inline-block text-left shadow' 
                            : 'text-zinc-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Bot Dialogue Ticket / Database Excerpt Match Indicator */}
                      {!isUser && msg.matchedMovie && (
                        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2 text-xs text-zinc-400">
                          <div className="flex items-center justify-between text-[10px] font-mono border-b border-zinc-800 pb-1 text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              CORNELL CORPUS ALIGNED
                            </span>
                            <span>Score: {msg.matchScore ? (msg.matchScore * 100).toFixed(0) : 0}%</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-zinc-300 font-serif">
                              <Film className="w-3 h-3 text-zinc-500" />
                              <span>Scene from: <strong>{msg.matchedMovie}</strong></span>
                            </div>
                            <blockquote className="italic text-[11px] bg-zinc-950/60 p-2 rounded text-zinc-400 border border-zinc-900 font-mono">
                              &ldquo;{msg.matchedLine}&rdquo;
                            </blockquote>
                          </div>
                        </div>
                      )}

                      {/* Bot Inline Action triggers with neon hover borders */}
                      {!isUser && msg.nlpAnalysis && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() => {
                              setSelectedMessage(msg);
                              setActiveTab('nlp');
                              setIsStudioOpen(true);
                            }}
                            className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-750 hover:border-amber-500/40 transition"
                          >
                            <Network className="w-3 h-3 text-amber-500" />
                            <span>Inspect spaCy Dependency tree</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedMessage(msg);
                              setActiveTab('debugger');
                              setIsStudioOpen(true);
                            }}
                            className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-350 border border-zinc-750 hover:border-amber-500/40 transition"
                          >
                            <Code className="w-3 h-3 text-zinc-500" />
                            <span>View similarity math debug trace</span>
                          </button>
                        </div>
                      )}

                    </div>

                    {/* User Avatar tag */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 shrink-0 flex items-center justify-center shadow-lg">
                        <User className="w-4 h-4" />
                      </div>
                    )}

                  </div>
                );
              })}

              {isGenerating && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0 flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                      <span>CinemaGPT Core Node is processing...</span>
                    </div>
                    <div className="bg-[#2f2f2f]/35 border border-zinc-800/80 p-3.5 rounded-2xl text-zinc-500 flex items-center gap-2">
                      <div className="flex gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">Hashing porter matrices...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

          )}

        </div>

        {/* BOTTOM: Central pill-shaped chat entry */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#212121] via-[#212121]/95 to-transparent pt-4 pb-6 px-4 z-10 shrink-0">
          <div className="max-w-3xl mx-auto space-y-2.5">
            
            {/* Speech error indicator */}
            {speechError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 px-3 py-1.5 rounded-lg font-mono max-w-xl mx-auto transition-all animate-fadeIn">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{speechError}</span>
                <button 
                  type="button" 
                  onClick={() => setSpeechError(null)} 
                  className="ml-auto text-[10px] text-zinc-500 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Main ChatGPT Medicine-Pill container bar */}
            <form 
              id="chat-input-form"
              onSubmit={handleSendMessage}
              className="bg-[#2f2f2f] border border-zinc-700/60 rounded-3xl p-1.5 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-600 transition shadow-lg flex items-center gap-1.5"
            >
              {/* Text Area Input */}
              <input 
                id="chat-input-text"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? "Listening... Speak conversation statement clearly" : `Message CinemaGPT or query classic scripts...`}
                disabled={isGenerating}
                className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none text-zinc-100 text-sm py-2 px-3 whitespace-nowrap overflow-x-hidden placeholder-zinc-400 disabled:opacity-40"
              />

              {/* Web Speech Micro toggle button */}
              <button
                id="chat-btn-mic"
                type="button"
                onClick={toggleListening}
                disabled={isGenerating}
                title={isListening ? "Stop voice listening" : "Transcribe spoken words using Web Speech API"}
                className={`p-2 rounded-full transition-all duration-150 cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse scale-105' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Up chevron send action */}
              <button
                id="chat-btn-submit"
                type="submit"
                disabled={isGenerating || !inputMessage.trim()}
                className={`p-2 rounded-full transition cursor-pointer flex items-center justify-center ${
                  inputMessage.trim() && !isGenerating 
                    ? 'bg-white text-black hover:bg-zinc-200 shadow-md' 
                    : 'bg-zinc-700 text-zinc-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>

            </form>

            <p className="text-[10px] text-zinc-500 text-center font-sans">
              CinemaGPT demonstrates localized Python ChatterBot Jaccard mappings. Click any bot answer to explore granular linguistic trees.
            </p>

          </div>
        </div>

      </section>

      {/* RIGHT DRAWER: Studio Inspect Pane (spaCy tree / training board) */}
      {isStudioOpen && (
        <aside className="w-[420px] lg:w-[480px] bg-[#171717] h-screen border-l border-[#2f2f2f]/30 flex flex-col shrink-0 select-none overflow-hidden max-md:fixed max-md:right-0 max-md:top-0 max-md:bottom-0 max-md:z-[100] max-md:shadow-2xl">
          
          {/* Studio title panel & Close Button */}
          <div className="p-4 border-b border-[#2f2f2f]/30 flex items-center justify-between bg-[#141414] shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-200">
                Linguistic Inspection Studio
              </span>
            </div>
            
            <button 
              onClick={() => setIsStudioOpen(false)}
              className="p-1 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-white"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Navigation Tabs bar inside Studio */}
          <div className="flex border-b border-[#2f2f2f]/30 shrink-0 bg-[#171717]">
            <button
              onClick={() => setActiveTab('nlp')}
              className={`flex-1 py-3 text-[10px] font-bold tracking-wider uppercase border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === 'nlp'
                  ? 'border-amber-500 text-white bg-zinc-900/30'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-amber-500" />
              <span>spaCy Token Syntax</span>
            </button>
            <button
              onClick={() => setActiveTab('corpus')}
              className={`flex-1 py-3 text-[10px] font-bold tracking-wider uppercase border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === 'corpus'
                  ? 'border-amber-500 text-white bg-zinc-900/30'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span>Training Board</span>
            </button>
            <button
              onClick={() => setActiveTab('debugger')}
              className={`flex-1 py-3 text-[10px] font-bold tracking-wider uppercase border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === 'debugger'
                  ? 'border-amber-500 text-white bg-zinc-900/30'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-amber-500" />
              <span>Trace Log</span>
            </button>
          </div>

          {/* Tab contents panel wrapper */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* TAB A: spaCy NLP tree visualizer */}
            {activeTab === 'nlp' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Custom Sandbox interactive text */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-amber-500" />
                      Dynamic NLP Sandbox
                    </span>
                    <span className="text-[9px] text-zinc-500">Live POS Parser</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      id="sandbox-input-text"
                      type="text"
                      value={sandboxText}
                      onChange={(e) => setSandboxText(e.target.value)}
                      placeholder="Type custom prompt to segment grammatical clauses..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 px-3 py-1.5 rounded-lg font-mono focus:border-amber-500/50 outline-none"
                    />
                    <button
                      id="sandbox-btn-analyze"
                      onClick={handleSandboxAnalyze}
                      disabled={isSandboxAnalyzing || !sandboxText.trim()}
                      className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-xs transition disabled:opacity-50 shrink-0"
                    >
                      Analyze
                    </button>
                  </div>
                </div>

                {activeNLPAnalysis ? (
                  <div className="space-y-5">
                    
                    {/* Source label */}
                    <div className="border-b border-zinc-800 pb-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block">
                        Grammar Target Phrase
                      </span>
                      <p className="text-sm font-serif italic text-white mt-1">
                        &ldquo;{activeNLPAnalysis.text}&rdquo;
                      </p>
                    </div>

                    {/* Simple summary metrics */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-zinc-900 p-2.5 border border-zinc-800 rounded-lg">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Words</span>
                        <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                          {activeNLPAnalysis.summary.wordCount}
                        </p>
                      </div>
                      <div className="bg-zinc-900 p-2.5 border border-zinc-800 rounded-lg">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Clauses</span>
                        <p className="text-xs font-semibold text-zinc-300 mt-1 truncate">
                          {activeNLPAnalysis.summary.sentenceType}
                        </p>
                      </div>
                      <div className="bg-zinc-900 p-2.5 border border-zinc-800 rounded-lg">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Entities</span>
                        <p className="text-xs font-semibold text-emerald-400 mt-1 truncate">
                          {activeNLPAnalysis.entities.length > 0 ? `${activeNLPAnalysis.entities.length} match` : 'None'}
                        </p>
                      </div>
                    </div>

                    {/* Sub-Feature 1: POS tags */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                        1. Tokens &amp; Penn POS tags
                      </span>

                      <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                        {activeNLPAnalysis.tokens.map((token, tIdx) => (
                          <div 
                            key={tIdx} 
                            className="bg-zinc-900 border border-zinc-800/80 p-2 rounded-lg text-center min-w-[70px] hover:border-amber-500/40 transition duration-150 group relative cursor-pointer"
                          >
                            <span className="block text-xs font-bold text-white truncate">{token.word}</span>
                            <span className={`inline-block text-[9px] px-1 py-0.5 rounded border ${getPosBadgeStyle(token.pos)} font-mono scale-95 mt-1`}>
                              {token.pos}
                            </span>
                            <span className="block text-[8px] text-zinc-500 font-mono mt-0.5 truncate">
                              Stem: {token.lemma}
                            </span>

                            {/* Tooltip describing tag meaning */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-950 border border-zinc-800 p-2 rounded text-zinc-300 shadow-xl z-[200] w-40 text-left font-sans left-1/2 -translate-x-1/2 text-[10px]">
                              <p className="font-semibold text-white">{token.posDescription}</p>
                              <p className="text-zinc-500 text-[9px] mt-0.5">Grammar relation: {token.dep}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sub-Feature 2: Dependency Parse map */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                        2. Dependency-Grammar tree (verb ROOT)
                      </span>
                      
                      <div className="p-3 border border-zinc-800 rounded-xl bg-zinc-950/40 overflow-x-auto select-text">
                        {renderDependencyTreeHTML(activeNLPAnalysis.dependencyTree)}
                      </div>
                    </div>

                    {/* Sub-Feature 3: NER details */}
                    {activeNLPAnalysis.entities.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                          3. Named Entity Recognitions (NER)
                        </span>
                        
                        <div className="space-y-2">
                          {activeNLPAnalysis.entities.map((ent, entIdx) => (
                            <div key={entIdx} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-white">&ldquo;{ent.text}&rdquo;</span>
                                <span className="block text-[10px] text-zinc-500 mt-0.5">{ent.description}</span>
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-900 text-emerald-400 rounded font-mono text-[9px] font-extrabold uppercase">
                                {ent.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-600 text-xs font-sans">
                    Select any message dialog inside CinemaGPT chat to parse its POS stems instantly!
                  </div>
                )}

              </div>
            )}

            {/* TAB B: Cornell Dialogue Training board */}
            {activeTab === 'corpus' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* RETRAINING INTERACTIVE MODULE */}
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                    <Plus className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] font-bold tracking-wider font-mono uppercase text-white">
                      Inject dialogue on-the-fly
                    </span>
                  </div>

                  <form onSubmit={handleTrainSubmit} className="space-y-3">
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                          Dialogue Prompt (User input match target)
                        </label>
                        <input
                          id="train-prompt"
                          type="text"
                          value={trainPrompt}
                          onChange={(e) => setTrainPrompt(e.target.value)}
                          placeholder="e.g. Where are we going?"
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                          Matching Reply (Bot answer)
                        </label>
                        <input
                          id="train-response"
                          type="text"
                          value={trainResponse}
                          onChange={(e) => setTrainResponse(e.target.value)}
                          placeholder="e.g. To the absolute center of the Matrix."
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-0.5">
                          Movie Screenplay
                        </label>
                        <input
                          id="train-movie"
                          type="text"
                          value={trainMovie}
                          onChange={(e) => setTrainMovie(e.target.value)}
                          placeholder="e.g. Matrix Reloaded"
                          className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-0.5">
                          Genre Style
                        </label>
                        <select
                          id="train-genre"
                          value={trainGenre}
                          onChange={(e) => setTrainGenre(e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-400 font-mono"
                        >
                          <option value="Sci-Fi">Sci-Fi</option>
                          <option value="Romance">Romance</option>
                          <option value="Drama">Drama</option>
                          <option value="Crime">Crime</option>
                          <option value="Comedy">Comedy</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>

                    {trainingMessage && (
                      <div className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 border ${
                        trainingMessage.type === 'success' 
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' 
                          : 'bg-rose-950/20 text-rose-450 border-rose-900/30'
                      }`}>
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{trainingMessage.text}</span>
                      </div>
                    )}

                    <button
                      id="train-btn-submit"
                      type="submit"
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 font-bold text-black text-xs rounded-lg transition duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Train Model Node Instantly
                    </button>

                  </form>
                </div>

                {/* SEARCH & FILTER LIST */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block text-left">
                      Cornell Corpus Database
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono italic">
                      {filteredCorpus.length} entries of {corpus.length}
                    </span>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <input
                      id="corpus-search-bar"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search films/quotes..."
                      className="flex-1 px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-[11px] rounded"
                    />
                    
                    <select
                      id="corpus-filter-dropdown"
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-[11px] rounded text-zinc-400 font-mono"
                    >
                      {genres.map((g, gIdx) => (
                        <option key={gIdx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Seed row blocks */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredCorpus.map((item, index) => (
                      <div 
                        key={item.id} 
                        className={`p-3 bg-zinc-900/30 border text-[11.5px] rounded-xl space-y-1.5 transition ${
                          item.isUserAdded 
                            ? 'border-indigo-500/40 bg-indigo-950/10' 
                            : 'border-zinc-850 hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-serif font-semibold text-white truncate max-w-[150px]">
                            {item.movieTitle}
                          </span>
                          
                          <span className="text-[9px] bg-zinc-950 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-mono">
                            {item.genre}
                          </span>
                        </div>

                        <div className="space-y-1 text-zinc-400 border-t border-zinc-850 pt-1.5">
                          <div>
                            <span className="text-[10px] text-zinc-500 font-mono mr-1 uppercase">{item.characterA}:</span>
                            <span className="text-amber-500 font-semibold">&ldquo;{item.prompt}&rdquo;</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 font-mono mr-1 uppercase">{item.characterB}:</span>
                            <span className="text-zinc-200 italic">&ldquo;{item.response}&rdquo;</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* TAB C: Debug trace telemetry */}
            {activeTab === 'debugger' && (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400 font-mono" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 font-bold block">
                      ChatterBot Trace Pipeline Telemetry
                    </span>
                  </div>

                  {selectedMessage && selectedMessage.thinkingSteps && selectedMessage.thinkingSteps.length > 0 ? (
                    <div className="space-y-4">
                      
                      <div className="space-y-1 text-xs">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Traced Dialogue Phrase</span>
                        <blockquote className="p-2 border border-zinc-800 bg-zinc-950 rounded text-zinc-300 italic">
                          &ldquo;{selectedMessage.text}&rdquo;
                        </blockquote>
                      </div>

                      <div className="space-y-2 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800 select-text">
                        {selectedMessage.thinkingSteps.map((step, idx) => (
                          <div key={idx} className="flex gap-2.5 text-[10.5px] leading-relaxed relative text-zinc-300">
                            <div className="w-4.5 h-4.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-amber-400 flex items-center justify-center shrink-0 z-10">
                              {idx + 1}
                            </div>
                            <p className="pt-0.5 font-sans">{step}</p>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1.5 text-[10px] text-zinc-500">
                        <span className="block text-zinc-300 font-mono font-bold uppercase uppercase">
                          Levenshtein / Jaccard Blended Weight
                        </span>
                        <p className="font-sans leading-normal">
                          Scores are blended inside Express's BestMatch router helper: token sets undergo Porter stemming, and the composite index triggers standard dialogue matching above the <strong>0.15 threshold limit</strong>.
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-10 text-zinc-600 text-xs font-sans">
                      No tracing calculated for this transaction. Dialogue must trigger matching matrices.
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </aside>
      )}

    </div>
  );
}
