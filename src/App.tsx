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
  Compass
} from 'lucide-react';
import { ChatMessage, CorpusItem, NLPAnalysis, TokenInfo, DependencyNode } from './types';

export default function App() {
  // Primary Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Welcome screenplays explorer! I am an NLP Chatbot replicating python's ChatterBot logic adapters. I can analyze your input like spaCy/NLTK pipelines, tag Parts-Of-Speech, outline syntactic dependencies, and match dialogs in the Cornell Movie Corpus. Try typing something or select a quote!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'chatterbot',
      thinkingSteps: [
        "Initialized NLP Local Pipeline...",
        "Pre-seeded 30+ classical movie screenplays spanning Sci-Fi, Romance, and Noir Drama.",
        "Awaiting human input matrices."
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeEngine, setActiveEngine] = useState<'chatterbot' | 'gemini'>('chatterbot');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

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
      // Soft fallbacks
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
        const data = await res.json();
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
  const targetLabelName = selectedMessage ? `Message #${selectedMessage.id.slice(0, 5)}` : "Direct Sandbox Text";

  // Simple rendering of syntactic tree structure in CSS indentation
  const renderDependencyTreeHTML = (node: DependencyNode) => {
    return (
      <div key={`${node.word}-${node.index}`} className="pl-4 border-l border-zinc-700/60 my-1 transition-all duration-300 hover:border-amber-500/50">
        <div className="flex items-center gap-1.5 py-0.5 text-xs">
          <span className="font-semibold text-zinc-100 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700 shadow-sm">
            {node.word}
          </span>
          <span className="text-[10px] uppercase tracking-wide px-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
            {node.pos}
          </span>
          <span className="text-zinc-500">→</span>
          <span className="text-[10px] text-amber-400 font-mono italic">
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Visual Header / Cinematic Banner */}
      <header id="app-header" className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg ring-1 ring-amber-400/30 animate-pulse">
            <Film className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-serif">
                NLP Movie Chatbot
              </h1>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                Cornell Dialogs v1.2
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Hybrid Python ChatterBot Matcher &amp; spaCy-NLTK Tagging Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden md:flex items-center gap-2 text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>NLTK Lemmatizer Ready</span>
          </div>
          <button 
            id="btn-revert"
            onClick={handleResetCorpus}
            className="flex items-center gap-1 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Restore Seeds</span>
          </button>
        </div>
      </header>

      {/* Primary Dashboard Grid Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-69px)]">
        
        {/* Left COLUMN: Interactive Conversational Screenplay Simulator (5 cols) */}
        <section id="chat-column" className="lg:col-span-5 flex flex-col border-r border-zinc-900 bg-zinc-950 overflow-y-auto">
          
          {/* Engine Selector Segment */}
          <div className="p-4 bg-zinc-950/60 border-b border-zinc-900 space-y-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase font-mono flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
                Select Cognitive Logic Adapter
              </label>
              <span className="text-[10px] text-zinc-600 font-mono">Dynamic Routing</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-90 w-full rounded-xl bg-zinc-900/60 border border-zinc-800">
              <button 
                id="engine-chatterbot"
                type="button"
                onClick={() => setActiveEngine('chatterbot')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  activeEngine === 'chatterbot' 
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-md font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                ChatterBot Sim
              </button>
              <button 
                id="engine-gemini"
                type="button"
                onClick={() => setActiveEngine('gemini')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  activeEngine === 'gemini' 
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-md font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gemini flash
              </button>
            </div>

            <p className="text-[11px] text-zinc-500">
              {activeEngine === 'chatterbot' 
                ? "ChatterBot utilizes Jaccard overlaps and Levenshtein edits over native stems to align closest prompt responses." 
                : "Gemini executes deep-learning context grounding featuring the full corpus screenplay elements. Requires API Key."}
            </p>
          </div>

          {/* Dialog Stream Screen */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[350px]">
            {messages.map((msg, idx) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[88%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                {/* Meta details */}
                <div className="flex items-center gap-1 mb-1 text-[10px] text-zinc-500 px-1 font-mono">
                  {msg.sender === 'user' ? (
                    <>
                      <span>Prompt Participant (You)</span>
                      <User className="w-2.5 h-2.5 ml-0.5 text-amber-500" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-2.5 h-2.5 mr-0.5 text-zinc-400" />
                      <span>{msg.engine === 'chatterbot' ? 'ChatterBot Local' : 'Gemini Cinematic'}</span>
                    </>
                  )}
                  <span className="text-zinc-700">•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div 
                  onClick={() => msg.nlpAnalysis && setSelectedMessage(msg)}
                  className={`relative p-3.5 rounded-2xl border text-sm leading-relaxed transition cursor-pointer select-none group shadow-inner ${
                    msg.sender === 'user' 
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 rounded-tr-none hover:bg-amber-500/15' 
                      : msg.id === selectedMessage?.id
                        ? 'bg-zinc-900 border-amber-500/50 text-white rounded-tl-none ring-1 ring-amber-500/20'
                        : 'bg-zinc-900 text-zinc-200 border-zinc-800 rounded-tl-none hover:border-zinc-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Hover visual details */}
                  {msg.nlpAnalysis && (
                    <span className="absolute -bottom-2 right-2 text-[8px] bg-zinc-950 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md font-mono scale-90 opacity-80 group-hover:opacity-100 transition whitespace-nowrap">
                      Click to Parse NLP
                    </span>
                  )}
                </div>

                {/* Detailed dialogue match result metadata inline if chatterbot matched */}
                {msg.matchedMovie && msg.matchScore !== undefined && (
                  <div className="w-full mt-1.5 px-2 py-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-400 space-y-1">
                    <div className="flex items-center justify-between text-[10px] border-b border-zinc-800 pb-1">
                      <span className="font-semibold text-zinc-300 font-mono flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        Corpus Match Record
                      </span>
                      <span className="text-zinc-500 font-mono">Score: {(msg.matchScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-zinc-300 font-serif">
                      <Film className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                      <span className="truncate">From film: {msg.matchedMovie}</span>
                    </div>
                    <div className="bg-zinc-950/80 p-1 text-[10px] rounded border border-zinc-900 italic font-mono relative overflow-hidden text-zinc-400">
                      &ldquo;{msg.matchedLine}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex flex-col max-w-[80%] mr-auto items-start">
                <div className="flex items-center gap-1 mb-1 text-[10px] text-zinc-500 px-1 font-mono">
                  <Bot className="w-2.5 h-2.5" />
                  <span>Processing text stream...</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl rounded-tl-none text-zinc-500 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">Simulating Python runtime...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Selection Quotes Banner */}
          <div className="p-3 bg-zinc-950 border-t border-zinc-900">
            <p className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 mb-2 px-1">
              Test Cornell Screening Prompt Seeds
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "What is the Matrix?",
                "What is the Force?",
                "Ignorance is bliss.",
                "Here's looking at you, kid.",
                "I jump, you jump, remember?"
              ].map((seed, sIdx) => (
                <button
                  key={sIdx}
                  id={`seed-${sIdx}`}
                  onClick={() => handleSendMessage(undefined, seed)}
                  className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-amber-500/40 rounded-full px-2.5 py-1 text-left truncate max-w-full transition duration-150"
                >
                  &ldquo;{seed}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Chat user action form */}
          <form 
            id="chat-input-form"
            onSubmit={handleSendMessage} 
            className="p-4 border-t border-zinc-900 bg-zinc-950 flex gap-2.5 items-center justify-between"
          >
            <input 
              id="chat-input-text"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Send dialog query (e.g. "What is the Matrix?")...`}
              disabled={isGenerating}
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-850 focus:border-amber-500 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/20 disabled:opacity-60 placeholder-zinc-500"
            />
            <button 
              id="chat-btn-submit"
              type="submit"
              disabled={isGenerating || !inputMessage.trim()}
              className="px-4 py-3 bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-semibold text-black rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>

        </section>

        {/* Right COLUMN: Interactive tabbed panels (7 cols) */}
        <section id="analysis-column" className="lg:col-span-7 flex flex-col bg-zinc-950 overflow-y-auto">
          
          {/* Dashboard tabs selector */}
          <div className="flex border-b border-zinc-900 bg-zinc-950/60 sticky top-0 z-10 backdrop-blur-sm">
            <button
              id="tab-nlp"
              onClick={() => setActiveTab('nlp')}
              className={`flex-1 py-3.5 px-4 text-xs font-semibold tracking-wider uppercase transition border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'nlp'
                  ? 'border-amber-500 text-white bg-zinc-900/30 font-bold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Network className="w-4 h-4 text-amber-500" />
              <span>spaCy NLP Parser</span>
            </button>
            <button
              id="tab-corpus"
              onClick={() => setActiveTab('corpus')}
              className={`flex-1 py-3.5 px-4 text-xs font-semibold tracking-wider uppercase transition border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'corpus'
                  ? 'border-amber-500 text-white bg-zinc-900/30 font-bold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Database className="w-4 h-4 text-amber-500" />
              <span>Cornell Training Board</span>
            </button>
            <button
              id="tab-debugger"
              onClick={() => setActiveTab('debugger')}
              className={`flex-1 py-3.5 px-4 text-xs font-semibold tracking-wider uppercase transition border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'debugger'
                  ? 'border-amber-500 text-white bg-zinc-900/30 font-bold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Code className="w-4 h-4 text-amber-500" />
              <span>ChatterBot Debug Trace</span>
            </button>
          </div>

          {/* TAB 1 CONTENT: spaCy NLP tagger & direct sandbox input */}
          {activeTab === 'nlp' && (
            <div className="p-6 space-y-6">
              
              {/* Sandbox Direct Input Box to analyze any random screenplay lines */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 font-mono">
                    <Compass className="w-4 h-4 text-amber-500" />
                    Interactive NLP Sandbox (Input any text to analyze)
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Simulating spaCy Model</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    id="sandbox-input-text"
                    type="text"
                    value={sandboxText}
                    onChange={(e) => setSandboxText(e.target.value)}
                    placeholder="Type customized text to analyze POS tags and dependencies live..."
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-zinc-200"
                  />
                  <button
                    id="sandbox-btn-analyze"
                    onClick={handleSandboxAnalyze}
                    disabled={isSandboxAnalyzing || !sandboxText.trim()}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-xs transition disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Runs our NLTK sentence segmenter, Porter Lemmatizer steps, and dependency matrix builder instantly.
                </p>
              </div>

              {/* Live Visualization Block */}
              {activeNLPAnalysis ? (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top segment banner denoting which text is showing */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="text-sm font-semibold text-white font-serif flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Visual Representation: {targetLabelName}
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono italic">
                      &ldquo;{activeNLPAnalysis.text}&rdquo;
                    </span>
                  </div>

                  {/* Summary Metric Counters */}
                  <div id="nlp-metrics-row" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-zinc-900 border border-zinc-850 p-3 rounded-xl shadow-inner">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">Word Count</span>
                      <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">{activeNLPAnalysis.summary.wordCount}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-850 p-3 rounded-xl shadow-inner">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">Sentence Type</span>
                      <p className="text-xs font-semibold text-zinc-200 mt-1 truncate">{activeNLPAnalysis.summary.sentenceType}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-zinc-900 border border-zinc-850 p-3 rounded-xl shadow-inner">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">Identified Entities</span>
                      <p className="text-xs font-semibold text-emerald-400 mt-1">
                        {activeNLPAnalysis.entities.length > 0 
                          ? `${activeNLPAnalysis.entities.length} Unique Entity` 
                          : "None found"}
                      </p>
                    </div>
                  </div>

                  {/* spaCy POS tag grid mapping */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                        1. Parts of Speech (POS) tagging &amp; Lemmatization
                      </span>
                      <span className="text-[10px] text-zinc-500">(NLTK Stemmer equivalence rules)</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5 p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                      {activeNLPAnalysis.tokens.map((token, idx) => (
                        <div 
                          key={idx} 
                          className="flex flex-col items-center bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-center min-w-[70px] shadow-sm relative group hover:border-amber-500/40 transition"
                        >
                          <span className="text-xs font-bold text-white mb-1">{token.word}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getPosBadgeStyle(token.pos)} font-bold tracking-wider mb-2 uppercase`}>
                            {token.pos}
                          </span>
                          <div className="space-y-0.5 text-[9px] text-zinc-500 font-mono select-none">
                            <div>Stem: <span className="text-amber-500 font-normal">{token.lemma}</span></div>
                          </div>

                          {/* Hover tooltip explaining POS meaning */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-300 p-2 rounded shadow-lg z-50 w-44 text-left font-sans">
                            <p className="font-semibold text-white">{token.posDescription}</p>
                            <p className="text-zinc-500 mt-0.5 text-[9px]">Relation: {token.dep}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dependency parse Tree visualizer */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Network className="w-4 h-4 text-amber-500" />
                        2. Syntactic Dependency parse Tree (verb-rooted)
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">Standard spaCy Dependency Map</span>
                    </div>

                    <div className="p-4 bg-zinc-900/20 border border-zinc-900/60 rounded-2xl space-y-3">
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-sans mb-2">
                        How tokens functionally attach in the syntax stack. Our parser segments clauses around our key verb candidate (marked <span className="text-amber-400 font-mono font-bold">ROOT</span>). Check below:
                      </p>
                      
                      <div className="p-2 border border-zinc-850/60 rounded-xl bg-zinc-950 overflow-x-auto">
                        {renderDependencyTreeHTML(activeNLPAnalysis.dependencyTree)}
                      </div>
                    </div>
                  </div>

                  {/* NER named entities segments */}
                  {activeNLPAnalysis.entities.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                        3. Named Entity Recognition (NER)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeNLPAnalysis.entities.map((ent, entIdx) => (
                          <div key={entIdx} className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl flex items-start gap-2.5">
                            <div className="bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-md text-xs font-bold shrink-0 font-mono self-start border border-emerald-900">
                              {ent.label}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-white">&ldquo;{ent.text}&rdquo;</p>
                              <p className="text-[11px] text-zinc-500">{ent.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-12 space-y-3 border border-dashed border-zinc-800 rounded-3xl">
                  <Bot className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400 font-sans">No active NLP records selected.</p>
                  <p className="text-xs text-zinc-600 max-w-sm mx-auto font-sans leading-relaxed">
                    Click any conversation bubble from ChatterBot in the chat screen, or click the "Analyze Session" sandbox button to compute parts of speech live!
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2 CONTENT: Cornell Movie Dialogs database & instant retraining */}
          {activeTab === 'corpus' && (
            <div className="p-6 space-y-6">
              
              {/* Dynamic Instant Retraining panel */}
              <div className="p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-850 rounded-2xl shadow-xl space-y-4">
                
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Add instant custom training dialogue
                    </h3>
                    <p className="text-[10px] text-zinc-500">
                      Retrain ChatterBot models on-the-fly. The custom script will instantly resolve the matching Jaccard alignments.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleTrainSubmit} className="space-y-3">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        Screenplay Prompt (User Statement)
                      </label>
                      <input
                        id="train-prompt"
                        type="text"
                        value={trainPrompt}
                        onChange={(e) => setTrainPrompt(e.target.value)}
                        placeholder="e.g. Where is my key?"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        Dialogue Response (Bot Reply)
                      </label>
                      <input
                        id="train-response"
                        type="text"
                        value={trainResponse}
                        onChange={(e) => setTrainResponse(e.target.value)}
                        placeholder="e.g. It was inside your memory all along."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        Movie / Play Title
                      </label>
                      <input
                        id="train-movie"
                        type="text"
                        value={trainMovie}
                        onChange={(e) => setTrainMovie(e.target.value)}
                        placeholder="e.g. Hamlet"
                        className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        Genre Tag
                      </label>
                      <select
                        id="train-genre"
                        value={trainGenre}
                        onChange={(e) => setTrainGenre(e.target.value)}
                        className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                      >
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Romance">Romance</option>
                        <option value="Drama">Drama</option>
                        <option value="Crime">Crime</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Thriller">Thriller</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        Speaker A (Prompt)
                      </label>
                      <input
                        id="train-chara"
                        type="text"
                        value={trainCharA}
                        onChange={(e) => setTrainCharA(e.target.value)}
                        className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        Speaker B (Counter)
                      </label>
                      <input
                        id="train-charb"
                        type="text"
                        value={trainCharB}
                        onChange={(e) => setTrainCharB(e.target.value)}
                        className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {trainingMessage && (
                    <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      trainingMessage.type === 'success' 
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/50' 
                        : 'bg-rose-950/30 text-rose-300 border border-rose-900/40'
                    }`}>
                      <Info className="w-4 h-4 shrink-0" />
                      <span>{trainingMessage.text}</span>
                    </div>
                  )}

                  <button
                    id="train-btn-submit"
                    type="submit"
                    className="w-full mt-2 py-2 px-4 bg-amber-500 hover:bg-amber-600 font-bold text-black text-xs rounded-lg transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Deploy Training Pair &amp; Recompile Maturation Matrices
                  </button>

                </form>
              </div>

              {/* Seeding & corpus overview explorer */}
              <div className="space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider">
                      Seeded Screenplay Collection (Cornell Movie Dialogs)
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Showing {filteredCorpus.length} matches of total {corpus.length} entries.
                    </p>
                  </div>

                  {/* Filter elements inside Tab */}
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <input
                      id="corpus-search-bar"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search lines/movies..."
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs w-full sm:w-44 focus:outline-none focus:border-amber-500"
                    />
                    <select
                      id="corpus-filter-dropdown"
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 focus:outline-none"
                    >
                      {genres.map((g, gIdx) => (
                        <option key={gIdx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Corpus Database Rows Display */}
                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {filteredCorpus.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`p-3 bg-zinc-900/40 border rounded-xl transition duration-150 ${
                        item.isUserAdded 
                          ? 'border-indigo-500/40 bg-indigo-950/10' 
                          : 'border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Film className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-xs font-bold text-white font-serif">{item.movieTitle}</span>
                          <span className="text-[9px] font-mono bg-zinc-950 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                            {item.genre}
                          </span>
                        </div>
                        {item.isUserAdded && (
                          <span className="text-[8px] bg-indigo-500/10 text-indigo-300 font-mono px-1.5 py-0.5 rounded border border-indigo-500/20">
                            Custom Trained Node
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 font-mono">id: {item.id}</span>
                      </div>

                      <div className="space-y-1.5 border-t border-zinc-900 pt-2 text-[12px]">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-mono text-zinc-500 w-16 uppercase shrink-0">
                            {item.characterA}:
                          </span>
                          <span className="font-semibold text-amber-500/90">&ldquo;{item.prompt}&rdquo;</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-mono text-zinc-500 w-16 uppercase shrink-0">
                            {item.characterB}:
                          </span>
                          <span className="text-zinc-200 italic">&ldquo;{item.response}&rdquo;</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredCorpus.length === 0 && (
                    <div className="text-center py-10 text-zinc-600 text-xs">
                      No matching dialogues found. Clean your search variables.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 3 CONTENT: ChatterBot local logic matcher debugger trace details */}
          {activeTab === 'debugger' && (
            <div className="p-6 space-y-6">
              
              <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      ChatterBot Logic Adapter Pipeline Trace
                    </h3>
                    <p className="text-[10px] text-zinc-500">
                      Step-by-step telemetry documenting prompt segments calculations in the latest message transaction.
                    </p>
                  </div>
                </div>

                {selectedMessage && selectedMessage.thinkingSteps && selectedMessage.thinkingSteps.length > 0 ? (
                  <div className="space-y-4">
                    
                    {/* Header info showing the prompt being trace debugged */}
                    <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">Traced Input Sentence</span>
                      <p className="text-xs font-semibold text-zinc-200 mt-0.5">&ldquo;{selectedMessage.text}&rdquo;</p>
                    </div>

                    {/* Sequential step timeline tags */}
                    <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                      {selectedMessage.thinkingSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 pl-1 text-[11px] leading-relaxed relative align-top">
                          <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 font-bold font-mono text-[9px] text-amber-400 flex items-center justify-center shrink-0 z-10 mt-1">
                            {idx + 1}
                          </div>
                          <div className="space-y-0.5 mt-0.5">
                            <p className="text-zinc-200 font-sans">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Formula box summarizing Jaccard logic */}
                    <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                      <h4 className="text-[10px] uppercase font-mono text-zinc-400 font-bold">
                        Mathematical Core Similarity Formulas
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                        ChatterBot computes logic alignments by combining Jaccard indices (intersection of lexical stems divided by the union of stems) with the Levenshtein confidence ratios.
                      </p>
                      <div className="bg-zinc-900/60 p-2 text-center rounded border border-zinc-850/80 text-[11.5px] font-mono text-zinc-300">
                        <code>Matching Weight = [ Jaccard(A, B) &bull; 0.6 ] + [ Levenshtein(A, B) &bull; 0.4 ]</code>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-10 space-y-3 text-zinc-500 text-xs">
                    <Code className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-sm font-sans">No live trace logs calculated yet.</p>
                    <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                      Please send a message to the chatbot on the left interface first. The pipeline will trace its Porter stems, tagged descriptors, and calculate corpus coordinates.
                    </p>
                  </div>
                )}
              </div>

              {/* Informative section describing ChatterBot */}
              <div className="p-5 bg-zinc-900 bg-opacity-20 border border-zinc-900 rounded-2xl space-y-3 font-sans leading-relaxed text-xs text-zinc-400">
                <h4 className="font-bold text-white font-mono uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-500" />
                  What is Python ChatterBot?
                </h4>
                <p>
                  ChatterBot is a Python-based machine-learning dialogue engine designed to produce response pairs. It works under an architecture of nested **Logic Adapters** (like <code className="text-amber-500 bg-zinc-900 px-1 py-0.5 rounded text-[11px]">BestMatch</code>), which scan structural dialogues, parse sentence nodes, tag parts of speech through libraries (spaCy &amp; NLTK), and match prompt strings based on mathematical distance values.
                </p>
                <p>
                  Our TypeScript implementation successfully emulates this. It parses real-time input into stems using rules derived from the Porter algorithm, builds dependency tag vectors, and maps closest matches inside Cornell Movie Dialog transcripts.
                </p>
              </div>

            </div>
          )}

        </section>

      </main>

    </div>
  );
}
