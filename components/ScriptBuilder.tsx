import { useState, useRef, useEffect, ReactNode } from 'react';
import { PodcastTopic, PodcastProject, ScriptCardData, StarterOption, Badge, WordDef, CardType } from '../types';
import { SCRIPT_TEMPLATE, BADGES } from '../constants';
import { Save, CheckCircle2, ChevronRight, ArrowLeft, Mic, X, Sparkles, MessageSquare, Lightbulb, PenTool, Trophy, BookOpen, Search, Wand2, Volume2, StopCircle, Info, User, Users } from 'lucide-react';

interface Props {
  project: PodcastProject;
  topic: PodcastTopic;
  onUpdateScript: (newScript: ScriptCardData[], newScore: number, newBadges: string[]) => void;
  onFinish: () => void;
  onBack: () => void;
}

// --- CARD INSTRUCTIONS (Regie-Anweisungen) ---
const CARD_HELPERS: Record<CardType, { title: string; checklist: string[]; icon: string }> = {
  hook: {
    title: "Der Hinhörer (Start)",
    icon: "🎣",
    checklist: [
      "Mach die Zuhörer sofort neugierig!",
      "Nutze ein Geräusch (z.B. PANG!) oder eine spannende Frage.",
      "Verrate noch nicht alles – mach es spannend."
    ]
  },
  intro: {
    title: "Begrüßung & Team",
    icon: "👋",
    checklist: [
      "Sagt hallo an die Zuhörer.",
      "Stellt euer Team vor (Namen oder Fantasiename).",
      "Sagt kurz, um welches Grundrecht es heute geht."
    ]
  },
  explanation: {
    title: "Die Erklärung",
    icon: "🤓",
    checklist: [
      "Erklärt das Recht so einfach, dass es ein Erstklässler versteht.",
      "Benutzt den 'Merksatz' aus der Info-Box.",
      "Was bedeutet das Wort eigentlich?"
    ]
  },
  example: {
    title: "Das Beispiel",
    icon: "🎬",
    checklist: [
      "Erzählt eine kurze Geschichte aus der Schule oder dem Alltag.",
      "Beschreibt: Was ist passiert?",
      "Wie haben sich die Personen gefühlt?"
    ]
  },
  boundary: {
    title: "Die Grenze (Das Aber)",
    icon: "gu",
    checklist: [
      "Wann hört dieses Recht auf?",
      "Darf man wirklich ALLES machen? (Nein!)",
      "Erklärt, wann man anderen damit wehtut."
    ]
  },
  tip: {
    title: "Euer Profi-Tipp",
    icon: "💡",
    checklist: [
      "Was können andere Kinder tun, wenn sie so etwas erleben?",
      "Wen kann man um Hilfe rufen?",
      "Gebt einen guten Rat an die Klasse."
    ]
  },
  outro: {
    title: "Der Abschied",
    icon: "🏁",
    checklist: [
      "Fasst das Wichtigste in einem Satz zusammen.",
      "Bedankt euch fürs Zuhören.",
      "Sagt Tschüss (vielleicht mit Musik?)."
    ]
  }
};

// --- SPEAKER ROLE TIPS ---
const SPEAKER_TIPS: Record<CardType, { [key: string]: string }> = {
  hook: {
    A: "Macht ein Geräusch (z.B. 'PANG!').",
    B: "Fragt erschrocken: 'Was war das?!'",
    C: "Stellt eine geheimnisvolle Frage an die Zuhörer."
  },
  intro: {
    A: "Sagt freundlich 'Hallo' und den Namen der Show.",
    B: "Stellt das Team mit Namen vor.",
    C: "Sagt den Satz: 'Heute geht es um...'"
  },
  explanation: {
    A: "Liest den schwierigen Merksatz vor.",
    B: "Fragt: 'Hä? Was heißt das denn?'",
    C: "Erklärt es ganz einfach in eigenen Worten."
  },
  example: {
    A: "Ist der Erzähler: 'Stellt euch vor...'",
    B: "Spielt die Person, die das erlebt.",
    C: "Kommentiert: 'Oh nein, das ist ja gemein!'"
  },
  boundary: {
    A: "Ist der Besserwisser: 'Aber darf ich denn...?'",
    B: "Sagt streng: 'Nein! Stopp!'",
    C: "Erklärt die Regel: 'Weil du sonst anderen wehtust.'"
  },
  tip: {
    A: "Fragt: 'Und was können wir jetzt tun?'",
    B: "Hat die rettende Idee: 'Ich weiß was!'",
    C: "Gibt den Mut-Mach-Tipp an alle."
  },
  outro: {
    A: "Sagt: 'Das war unsere Sendung.'",
    B: "Bedankt sich fürs Zuhören.",
    C: "Ruft laut: 'Tschüss und bis bald!'"
  }
};

const COLORS_FOR_SPEAKERS: Record<string, string> = {
    A: "bg-red-100 text-red-700 border-red-300",
    B: "bg-blue-100 text-blue-700 border-blue-300",
    C: "bg-green-100 text-green-700 border-green-300",
    D: "bg-yellow-100 text-yellow-700 border-yellow-300",
    E: "bg-purple-100 text-purple-700 border-purple-300"
};

// --- Knowledge Components ---
const InfoBox = ({ title, icon, color, children }: { title: string; icon: string; color: string; children?: ReactNode }) => (
  <div className={`p-4 rounded-xl border-2 ${color} mb-3 shadow-sm bg-white`}>
    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
      <span>{icon}</span> {title}
    </h4>
    <div className="text-slate-600 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

const SpeakerRoleHelp = ({ type }: { type: CardType }) => {
  const tips = SPEAKER_TIPS[type];
  if (!tips) return null;

  return (
    <div className="bg-white border-2 border-indigo-100 rounded-2xl p-4 mb-4 shadow-sm">
      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Users size={14} /> Wer sagt was? (Ideen)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(tips).map(([speaker, tip]) => (
          <div key={speaker} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center shrink-0 border-2 ${COLORS_FOR_SPEAKERS[speaker]}`}>
              {speaker}
            </div>
            <p className="text-xs text-slate-600 font-medium leading-snug">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Time Bar Component ---
const TimeTracker = ({ totalWords }: { totalWords: number }) => {
  const wordsPerMinute = 75; 
  const currentMinutes = totalWords / wordsPerMinute;
  const percentage = Math.min(100, (currentMinutes / 6) * 100);
  
  // Colors
  let colorClass = 'bg-blue-400';
  if (currentMinutes >= 3 && currentMinutes <= 5) colorClass = 'bg-green-500';
  else if (currentMinutes > 5) colorClass = 'bg-orange-400';

  return (
    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-2 px-3 border-2 border-slate-200 min-w-[150px]">
       <div className="flex-1">
         <div className="h-4 w-full bg-white rounded-full overflow-hidden relative border border-slate-100">
            {/* Target Zone (3-5 min) */}
            <div className="absolute top-0 bottom-0 bg-green-100 opacity-50 border-x border-green-200" style={{left: '50%', width: '33%'}} />
            <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${percentage}%` }} />
         </div>
         <div className="text-[10px] text-slate-400 font-bold text-center mt-1 uppercase tracking-wider">
           {Math.round(currentMinutes * 60)} Sek. / Ziel: 3-5 Min.
         </div>
       </div>
    </div>
  );
};

// --- Gamification Components ---
const ScoreBoard = ({ score, recentGain }: { score: number, recentGain: number }) => {
  const [displayScore, setDisplayScore] = useState(score);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore(prev => {
        if (prev < score) return prev + 1;
        if (prev > score) return prev - 1;
        return prev;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl border-b-4 border-yellow-200 shadow-sm relative overflow-hidden group">
      <Trophy size={20} className="text-yellow-600" />
      <span className="font-black text-xl">{displayScore}</span>
      {recentGain > 0 && (
        <span className="absolute top-1 right-2 text-green-600 font-black text-sm animate-ping">+{recentGain}</span>
      )}
    </div>
  );
};

const BadgeToast = ({ badge, onClose }: { badge: Badge, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`p-4 rounded-2xl shadow-2xl border-4 ${badge.color} bg-white flex items-center gap-4 max-w-sm`}>
         <div className="text-4xl animate-bounce">{badge.icon}</div>
         <div>
           <h4 className="font-black text-lg text-slate-800">Badge freigeschaltet!</h4>
           <div className="font-bold text-slate-600">{badge.title}</div>
           <div className="text-xs text-slate-400">{badge.description}</div>
         </div>
      </div>
    </div>
  );
};

export const ScriptBuilder = ({ project, topic, onUpdateScript, onFinish, onBack }: Props) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // State
  const [cards, setCards] = useState<ScriptCardData[]>(() => {
    if (project.script.length > 0) return project.script;
    return SCRIPT_TEMPLATE.map(t => ({ ...t, text: '' }));
  });
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const activeCard = cards[activeCardIdx];
  const cardHelper = CARD_HELPERS[activeCard.type]; // Get instructions for current card

  // Helper: Count Words Ignoring Speaker Tags
  const countWords = (text: string) => {
      if (!text) return 0;
      // Remove "Sprecher X:" patterns
      const clean = text.replace(/Sprecher\s+[A-E]:/gi, '').trim();
      return clean ? clean.split(/\s+/).length : 0;
  };

  // Helper: Calculate Script Score based on cards AND glossary usage
  const calculateScriptScore = (currentCards: ScriptCardData[]) => {
    let scriptScore = 0;
    
    // 1. Points for Words (2 points per word)
    const totalWordCount = currentCards.reduce((acc, c) => acc + countWords(c.text), 0);
    scriptScore += totalWordCount * 2;

    // 2. Points for Completed Cards (50 points per card)
    const completedCards = currentCards.filter(c => {
       const w = countWords(c.text);
       return w >= c.minWords;
    }).length;
    scriptScore += completedCards * 50;

    // 3. NEW: Points for Glossary Words (30 points per unique word used)
    const fullText = currentCards.map(c => c.text).join(' ').toLowerCase();
    const usedGlossaryCount = topic.wordBank.filter(wb => 
      fullText.includes(wb.word.toLowerCase())
    ).length;
    
    scriptScore += usedGlossaryCount * 30;

    return scriptScore;
  };

  // FIX: Capture the "Lesson Score" (Base Score) on mount.
  // This is the total score minus whatever the script is currently worth.
  // This ensures that points earned in lessons (which are not derived from the script) are preserved.
  const [baseScore] = useState(() => {
    const currentScriptScore = calculateScriptScore(project.script);
    const totalCurrentScore = project.score || 0;
    // The base score is the points earned from quizzes/lessons
    return Math.max(0, totalCurrentScore - currentScriptScore);
  });

  // Gamification State
  const [score, setScore] = useState(project.score || 0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(project.unlockedBadges || []);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [recentScoreGain, setRecentScoreGain] = useState(0);

  // Modal State
  const [showStarterModal, setShowStarterModal] = useState(false);
  const [modalTab, setModalTab] = useState<'starters' | 'ideas' | 'glossary'>('starters');
  const [selectedStarterCategory, setSelectedStarterCategory] = useState<StarterOption | null>(null);
  
  // Word Def Modal State
  const [selectedWordDef, setSelectedWordDef] = useState<WordDef | null>(null);

  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Init Voices to ensure they are loaded (Chrome fix)
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // --- AUDIO HELPER ---
  const speakText = (text: string) => {
    window.speechSynthesis.cancel(); // Stop previous
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a German voice
    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find(v => v.lang.startsWith('de')) || null;
    if (germanVoice) {
      utterance.voice = germanVoice;
    }
    
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // --- Helper: Get Content Ideas for current card type ---
  const getContentIdeas = () => {
    switch (activeCard.type) {
      case 'explanation': 
        return { title: `Erklärung: ${topic.simpleTitle}`, items: topic.miniExplain };
      case 'example': 
        return { title: 'Ideen für Beispiele', items: topic.exampleIdeas };
      case 'boundary': 
        return { title: 'Wann ist die Grenze erreicht?', items: topic.boundaryIdeas };
      case 'tip': 
        return { title: 'Tipps für die Klasse', items: topic.schoolTips };
      case 'hook': 
        return { title: 'Ideen für den Einstieg', items: ['Starte mit einem lauten Geräusch!', 'Stelle eine Frage an die Zuhörer.', 'Erzähle ein kurzes Rätsel.', 'Mach ein kleines Rollenspiel.'] };
      case 'intro': 
        return { title: 'Ideen für die Begrüßung', items: [`Sagt eure Namen und: Wir sind das Team ${topic.simpleTitle}!`, 'Sagt, aus welcher Klasse ihr kommt.', 'Macht Musik am Anfang.', 'Erklärt kurz, was ein Grundrecht überhaupt ist.'] };
      case 'outro': 
        return { title: 'Ideen für den Schluss', items: ['Bedankt euch fürs Zuhören.', 'Spielt ein Lied zum Schluss.', 'Wünscht allen einen schönen Tag.', 'Wiederholt nochmal den wichtigsten Satz.'] };
      default: 
        return { title: 'Allgemeine Ideen', items: [] };
    }
  };

  const checkBadges = (currentCards: ScriptCardData[], currentUnlocked: string[]) => {
     // We create a mock project to check badge conditions.
     // Score passed here doesn't matter for current badges, but we pass current score to be safe.
     const tempProject: PodcastProject = { ...project, script: currentCards, score: score, unlockedBadges: currentUnlocked }; 
     
     BADGES.forEach(badge => {
        if (!currentUnlocked.includes(badge.id) && badge.condition(tempProject)) {
           setNewBadge(badge);
           setUnlockedBadges(prev => [...prev, badge.id]);
           // Trigger update parent immediately for the badge
           onUpdateScript(currentCards, score, [...currentUnlocked, badge.id]); 
        }
     });
  };

  const updateCardText = (text: string) => {
    const newCards = [...cards];
    newCards[activeCardIdx].text = text;
    setCards(newCards);

    // Calc Score: Base Score (Lessons) + New Script Score
    const newScriptScore = calculateScriptScore(newCards);
    const totalScore = baseScore + newScriptScore;

    if (totalScore > score) {
        setRecentScoreGain(totalScore - score);
        setTimeout(() => setRecentScoreGain(0), 1000);
    }
    setScore(totalScore);

    // Check Badges
    checkBadges(newCards, unlockedBadges);

    // Propagate
    onUpdateScript(newCards, totalScore, unlockedBadges);
  };

  const insertText = (textToInsert: string) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = activeCard.text;

    let prefix = "";
    if (start > 0) {
      const charBefore = currentText[start - 1];
      if (charBefore !== ' ' && charBefore !== '\n') prefix = " ";
    }

    const newText = currentText.substring(0, start) + prefix + textToInsert + currentText.substring(end);
    updateCardText(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // --- CONTEXT AWARE AUTO SUGGESTIONS (IMPROVED) ---
  const getAutoSuggestion = (): string | null => {
      const contextPool: string[] = [];
      const t = activeCard.type;

      // 1. Build SPECIFIC context sentences based on active topic data
      if (t === 'intro') {
        contextPool.push(`Hallo, hier ist das Team ${project.teamName}!`);
        contextPool.push(`Heute geht es um das Thema: ${topic.simpleTitle}.`);
        contextPool.push(`Wir erklären euch heute den Artikel ${topic.articleRef.replace('Art.', '')} vom Grundgesetz.`);
      } 
      else if (t === 'explanation') {
        contextPool.push(`Der wichtigste Satz dazu lautet: ${topic.keySentence}`);
        contextPool.push(`Das bedeutet ganz einfach: ${topic.miniExplain[0]}`);
        contextPool.push(`Im Grundgesetz steht: ${topic.keySentence}`);
      }
      else if (t === 'example') {
        // Pick a random example from ideas if available
        if (topic.exampleIdeas.length > 0) {
            contextPool.push(`Ein Beispiel dafür ist: ${topic.exampleIdeas[Math.floor(Math.random() * topic.exampleIdeas.length)]}`);
            contextPool.push(`Stellt euch vor: ${topic.exampleIdeas[0]}`);
        }
      }
      else if (t === 'boundary') {
         if (topic.boundaryIdeas.length > 0) {
            contextPool.push(`Aber Vorsicht: ${topic.boundaryIdeas[0]}`);
            contextPool.push(`Die Grenze ist erreicht, wenn: ${topic.boundaryIdeas[Math.floor(Math.random() * topic.boundaryIdeas.length)]}`);
         }
      }
      else if (t === 'tip') {
         if (topic.schoolTips.length > 0) {
             contextPool.push(`Unser Tipp für euch: ${topic.schoolTips[0]}`);
             contextPool.push(`Wir können folgendes tun: ${topic.schoolTips[Math.floor(Math.random() * topic.schoolTips.length)]}`);
         }
      }
      else if (t === 'outro') {
        contextPool.push(`Merkt euch: ${topic.keySentence}`);
        contextPool.push(`Das war unsere Sendung über ${topic.simpleTitle}. Tschüss!`);
      }

      // 2. Add generic starters
      const starters = topic.sentenceStarters[activeCard.type] || [];
      const starterSentences = starters.flatMap(s => s.suggestions.map(sug => `${s.fragment}${sug}`));
      
      // 3. Combine pools (Priority to Context pool)
      const fullPool = [...contextPool, ...starterSentences];

      // 4. Filter out phrases that are already roughly in the text (simple fuzzy match)
      const currentLower = activeCard.text.toLowerCase();
      const available = fullPool.filter(s => {
          // Check if the first 15 chars or the specific keywords exist
          const snippet = s.substring(0, 15).toLowerCase();
          return !currentLower.includes(snippet);
      });

      if (available.length === 0) return null;
      
      // Return a random one
      return available[Math.floor(Math.random() * available.length)];
  };

  const handleMagicExtend = () => {
      const suggestion = getAutoSuggestion();
      if (suggestion) {
          // Add a leading space if needed
          const prefix = (activeCard.text.length > 0 && !activeCard.text.endsWith(' ') && !activeCard.text.endsWith('\n')) ? ' ' : '';
          insertText(prefix + suggestion);
          // Small visual feedback could be added here if needed
      }
  };


  const totalWords = cards.reduce((acc, c) => acc + countWords(c.text), 0);
  const currentWordCount = countWords(activeCard.text);
  const isShort = currentWordCount < activeCard.minWords;
  const hasStarted = currentWordCount > 5; // Only suggest if they wrote at least something
  
  const canMagicExtend = getAutoSuggestion() !== null; 

  const allScriptText = cards.map(c => c.text).join(' ').toLowerCase();

  // Close modal logic
  const closeModal = () => {
    setShowStarterModal(false);
    setSelectedStarterCategory(null);
    setModalTab('starters');
  };

  const contentIdeas = getContentIdeas();

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans selection:bg-yellow-200">
      
      {newBadge && <BadgeToast badge={newBadge} onClose={() => setNewBadge(null)} />}

      {/* --- HEADER --- */}
      <div className="bg-white border-b-4 border-slate-200 px-4 py-2 flex justify-between items-center shadow-sm z-20 h-18">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-100 p-2 rounded-xl border-2 border-slate-200">
             ← Zurück
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="bg-rose-100 text-rose-600 p-2 rounded-lg"><Mic size={20} /></span>
              {project.teamName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <ScoreBoard score={score} recentGain={recentScoreGain} />
           <TimeTracker totalWords={totalWords} />
           <button 
             onClick={onFinish}
             className="bg-green-600 text-white px-6 py-2 rounded-xl font-black border-b-4 border-green-800 hover:bg-green-500 active:border-b-0 active:translate-y-1 flex items-center gap-2 transition-all"
           >
             <Save size={20} /> <span>Fertig & Drucken</span>
           </button>
        </div>
      </div>

      {/* --- MAIN LAYOUT (3 Columns) --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* COLUMN 1: NAVIGATION (Storyboard Filmstrip) */}
        <div className="w-72 bg-slate-50 border-r-4 border-slate-200 overflow-y-auto p-4 space-y-4 hidden md:block">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Ablaufplan (Storyboard)</h3>
          {cards.map((card, idx) => {
             const wordCount = countWords(card.text);
             const isComplete = wordCount >= card.minWords;
             const isActive = idx === activeCardIdx;
             
             return (
              <button 
                key={card.type}
                onClick={() => setActiveCardIdx(idx)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative group ${
                  isActive 
                    ? 'bg-white border-blue-500 shadow-md ring-4 ring-blue-50 z-10 scale-105' 
                    : 'bg-white border-slate-200 hover:border-blue-300 text-slate-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                    Teil {idx + 1}
                  </span>
                  {isComplete && <CheckCircle2 size={20} className="text-green-500 bg-white rounded-full" />}
                </div>
                <div className={`font-bold text-sm leading-tight ${isActive ? 'text-slate-800' : ''}`}>{card.title}</div>
              </button>
             );
          })}
        </div>

        {/* COLUMN 2: EDITOR (Main Stage) */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100 relative">
           
           <div className="flex-1 p-4 md:p-6 flex flex-col h-full max-w-4xl mx-auto w-full">
             
             {/* Dynamic Director Note (Regie-Anweisung) */}
             <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-4 mb-4 flex gap-4 shadow-sm items-start animate-in fade-in slide-in-from-top-2">
                <div className="bg-sky-200 text-sky-800 w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 font-black border-4 border-sky-50">
                   {cardHelper.icon}
                </div>
                <div className="flex-1">
                   <h4 className="font-bold text-sky-900 mb-1 flex items-center gap-2 text-lg">
                     {cardHelper.title} 
                   </h4>
                   <ul className="text-sm text-sky-800 space-y-1 font-medium">
                      {cardHelper.checklist.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                           <span className="mt-1.5 w-1.5 h-1.5 bg-sky-400 rounded-full shrink-0"/>
                           <span>{item}</span>
                        </li>
                      ))}
                   </ul>
                </div>
             </div>

             {/* Speaker Role Tips */}
             <SpeakerRoleHelp type={activeCard.type} />

             {/* Toolbar */}
             <div className="bg-white rounded-t-3xl border-2 border-slate-200 border-b-0 p-4 flex items-center justify-between gap-4 shadow-sm z-10 mt-2">
                {/* Speakers - GAMIFIED TOKENS */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                  {['A', 'B', 'C', 'D', 'E'].map(speaker => (
                    <button 
                      key={speaker}
                      onMouseDown={(e) => e.preventDefault()} 
                      onClick={() => insertText(`\nSprecher ${speaker}: `)} 
                      className={`w-10 h-10 rounded-full font-black flex items-center justify-center transition-all shadow-sm border-b-4 active:border-b-0 active:translate-y-1 hover:brightness-95 ${COLORS_FOR_SPEAKERS[speaker]}`}
                      title={`Sprecher ${speaker}`}
                    >
                      {speaker}
                    </button>
                  ))}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sprecher wählen</span>
                </div>

                <div className="flex gap-2">
                    
                    {/* READ ALOUD BUTTON */}
                    <button
                        onClick={() => speakText(activeCard.text)}
                        disabled={!activeCard.text.trim()}
                        className={`border-2 px-3 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 ${isSpeaking ? 'bg-red-100 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50'}`}
                        title="Diesen Teil anhören"
                    >
                        {isSpeaking ? <StopCircle size={20}/> : <Volume2 size={20} />}
                        <span className="hidden sm:inline">{isSpeaking ? 'Stopp' : 'Anhören'}</span>
                    </button>

                    {canMagicExtend && (
                        <button 
                            onClick={handleMagicExtend}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-b-4 border-purple-300 active:border-b-0 active:translate-y-1 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all animate-in zoom-in"
                            title="Automatisch einen Satz ergänzen"
                        >
                            <Wand2 size={20} />
                            <span className="hidden sm:inline">Zaubern</span>
                        </button>
                    )}

                    {/* Big Sentence Starter Button */}
                    <button 
                    onClick={() => setShowStarterModal(true)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-b-4 border-amber-300 active:border-b-0 active:translate-y-1 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all animate-in slide-in-from-top-2"
                    >
                    <Sparkles size={20} className="text-amber-600"/>
                    <span className="hidden sm:inline">Hilfe & Wörter</span>
                    </button>
                </div>
             </div>

             {/* Huge Text Area */}
             <div className="flex-1 bg-white border-2 border-slate-200 rounded-b-3xl shadow-sm relative flex flex-col">
                <textarea 
                  ref={textAreaRef}
                  className="flex-1 w-full h-full p-8 text-2xl leading-loose resize-none focus:outline-none font-medium text-slate-800 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] placeholder-slate-300 rounded-b-3xl"
                  placeholder={`Hier schreibt ihr euren Text für "${activeCard.title}"...\n\nTipp: Klickt oben rechts auf "Hilfe & Wörter", wenn ihr Hilfe braucht!`}
                  value={activeCard.text}
                  onChange={(e) => updateCardText(e.target.value)}
                  spellCheck={false}
                />
                
                {/* Floating Word Count for current card */}
                <div className="absolute bottom-4 right-4 flex items-center gap-4 pointer-events-none">
                    <div className="text-xs font-black px-4 py-2 rounded-full border-2 bg-slate-50 text-slate-400 border-slate-200 uppercase tracking-widest shadow-sm">
                        {currentWordCount} Wörter
                    </div>
                </div>
             </div>
             
             {/* Navigation Buttons Mobile/Desktop */}
             <div className="flex justify-between mt-6">
                <button 
                  disabled={activeCardIdx===0} 
                  onClick={() => setActiveCardIdx(activeCardIdx-1)}
                  className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-2 disabled:opacity-0 transition-opacity bg-slate-200 px-4 py-2 rounded-xl"
                >
                  <ArrowLeft size={20}/> Zurück
                </button>
                <button 
                  disabled={activeCardIdx===cards.length-1} 
                  onClick={() => setActiveCardIdx(activeCardIdx+1)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg border-b-8 border-blue-800 active:border-b-0 active:translate-y-2 transition-all disabled:opacity-50"
                >
                  Weiter <ChevronRight size={24} strokeWidth={3}/>
                </button>
             </div>

           </div>
        </div>

        {/* COLUMN 3: RIGHT TOOLBOX (Glossary & Info) - Visible only on large screens */}
        <div className="w-80 bg-slate-50 border-l-4 border-slate-200 overflow-y-auto p-4 hidden xl:block">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Hilfsmittel</h3>
           
           {/* GLOSSARY */}
           <div className="mb-6">
              <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                <BookOpen size={16} className="text-blue-600"/> Wörter-Glossar
              </h4>
              <p className="text-xs text-slate-400 mb-3">Klicke auf ein Wort für die Erklärung:</p>
              <div className="flex flex-wrap gap-2">
                {topic.wordBank.map((wordItem, idx) => {
                   const isUsed = allScriptText.includes(wordItem.word.toLowerCase());
                   return (
                   <button 
                     key={idx}
                     onMouseDown={(e) => e.preventDefault()}
                     onClick={() => setSelectedWordDef(wordItem)} 
                     className={`px-3 py-2 border-b-4 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative active:border-b-0 active:translate-y-1 ${
                        isUsed 
                        ? 'bg-green-100 border-green-300 text-green-800 pr-4' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                     }`}
                     title="Klicken für Erklärung"
                   >
                     {isUsed && (
                       <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-in zoom-in">
                         +30
                       </span>
                     )}
                     {isUsed ? <CheckCircle2 size={12} className="shrink-0" /> : <Search size={12} className="opacity-50" />}
                     {wordItem.word}
                   </button>
                 )})}
              </div>
           </div>

           <div className="h-1 bg-slate-200 my-6 rounded-full"></div>

           {/* Contextual Info */}
           <h4 className="font-bold text-slate-700 mb-3 text-sm">Infos zu {topic.simpleTitle}</h4>
           <div className="space-y-4">
             <InfoBox title="Merksatz" icon="💡" color="border-amber-200 bg-amber-50">
               <span className="italic font-serif text-lg">"{topic.keySentence}"</span>
             </InfoBox>
             <InfoBox title="Beispiele" icon="👀" color="border-blue-200 bg-blue-50">
               <ul className="list-disc ml-3 space-y-2">
                 {topic.exampleIdeas.map((t,i) => <li key={i} className="font-medium">{t}</li>)}
               </ul>
             </InfoBox>
           </div>
        </div>
      </div>

      {/* --- MODAL: WORD DEFINITION --- */}
      {selectedWordDef && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 border-8 border-yellow-300 animate-in zoom-in-95">
             <div className="text-center mb-6">
               <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl border-4 border-yellow-200">
                 <BookOpen className="text-yellow-600" size={32} />
               </div>
               <h3 className="text-3xl font-black text-slate-800 mb-2">"{selectedWordDef.word}"</h3>
               <p className="text-lg text-slate-600 leading-relaxed font-medium">
                 {selectedWordDef.definition}
               </p>
             </div>
             
             <div className="grid grid-cols-1 gap-3">
               <button 
                 onClick={() => { insertText(selectedWordDef.word); setSelectedWordDef(null); }}
                 className="w-full bg-green-500 text-white font-black text-lg py-4 rounded-2xl border-b-8 border-green-700 hover:bg-green-400 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-2"
               >
                 <CheckCircle2 size={24}/> Wort einfügen
               </button>
               <button 
                 onClick={() => setSelectedWordDef(null)}
                 className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
               >
                 Abbrechen
               </button>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL: HELPER TOOLBOX (SENTENCE STARTERS & IDEAS & GLOSSARY) --- */}
      {showStarterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border-8 border-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-50 border-b-4 border-slate-100 p-6 px-8 flex justify-between items-center shrink-0">
               <div className="flex flex-col">
                 <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                   <div className="bg-amber-100 p-2 rounded-xl text-amber-500"><Sparkles size={28} fill="currentColor" /></div>
                   Eure Kreativ-Werkstatt
                 </h2>
                 <p className="text-slate-500 font-medium ml-1">
                   Hier findet ihr Hilfe für: <strong className="text-slate-700 bg-slate-200 px-2 py-0.5 rounded">{activeCard.title}</strong>
                 </p>
               </div>
               <button onClick={closeModal} className="p-3 bg-slate-200 hover:bg-slate-300 rounded-2xl transition-colors">
                 <X size={28} className="text-slate-600"/>
               </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-slate-100 p-2 gap-2 shrink-0 border-b-4 border-slate-200 overflow-x-auto">
               <button 
                 onClick={() => { setModalTab('starters'); setSelectedStarterCategory(null); }}
                 className={`flex-1 min-w-[150px] py-4 font-black rounded-2xl text-lg flex items-center justify-center gap-2 transition-all ${modalTab === 'starters' ? 'bg-white text-slate-800 shadow-sm border-b-4 border-blue-500' : 'text-slate-500 hover:bg-slate-200'}`}
               >
                 <PenTool size={20} /> Formulierungshilfen
               </button>
               <button 
                 onClick={() => { setModalTab('ideas'); setSelectedStarterCategory(null); }}
                 className={`flex-1 min-w-[150px] py-4 font-black rounded-2xl text-lg flex items-center justify-center gap-2 transition-all ${modalTab === 'ideas' ? 'bg-white text-slate-800 shadow-sm border-b-4 border-amber-500' : 'text-slate-500 hover:bg-slate-200'}`}
               >
                 <Lightbulb size={20} /> Ideen für den Inhalt
               </button>
               <button 
                 onClick={() => { setModalTab('glossary'); setSelectedStarterCategory(null); }}
                 className={`flex-1 min-w-[150px] py-4 font-black rounded-2xl text-lg flex items-center justify-center gap-2 transition-all ${modalTab === 'glossary' ? 'bg-white text-slate-800 shadow-sm border-b-4 border-green-500' : 'text-slate-500 hover:bg-slate-200'}`}
               >
                 <BookOpen size={20} /> Wörter-Glossar
               </button>
            </div>

            {/* Modal Content Area */}
            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1 relative">
               
               {/* --- TAB: STARTERS --- */}
               {modalTab === 'starters' && (
                  !selectedStarterCategory ? (
                    // Categories View
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topic.sentenceStarters[activeCard.type]?.map((starter) => (
                          <button 
                            key={starter.label}
                            onClick={() => setSelectedStarterCategory(starter)}
                            className="bg-white p-6 rounded-3xl border-b-8 border-slate-200 hover:border-blue-400 hover:-translate-y-1 hover:bg-blue-50 active:border-b-0 active:translate-y-1 transition-all text-left group"
                          >
                            <div className="text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-600 flex justify-between items-center">
                              {starter.label}
                              <ChevronRight className="text-slate-300 group-hover:text-blue-500" strokeWidth={3}/>
                            </div>
                            <div className="text-slate-400 font-medium italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                              z.B. "{starter.fragment}..."
                            </div>
                          </button>
                        ))}
                        {(!topic.sentenceStarters[activeCard.type] || topic.sentenceStarters[activeCard.type].length === 0) && (
                          <div className="col-span-2 text-center py-12 flex flex-col items-center justify-center text-slate-400">
                             <MessageSquare size={64} className="mb-4 opacity-20"/>
                             <p className="text-xl font-bold">Für diesen Teil haben wir keine speziellen Satzanfänge.</p>
                             <p className="text-lg">Schaut mal in die "Ideen für den Inhalt"!</p>
                          </div>
                        )}
                    </div>
                  ) : (
                    // Suggestions View
                    <div className="space-y-6 animate-in slide-in-from-right-8">
                        <button 
                          onClick={() => setSelectedStarterCategory(null)} 
                          className="text-slate-500 font-bold hover:text-blue-600 flex items-center gap-1 mb-2 px-3 py-2 rounded-xl hover:bg-slate-200 w-fit bg-slate-100"
                        >
                          <ArrowLeft size={20}/> Zurück zur Übersicht
                        </button>

                        <div className="grid grid-cols-1 gap-4">
                          {/* Option A: Just the fragment */}
                          <button
                            onClick={() => { insertText(selectedStarterCategory.fragment); closeModal(); }}
                            className="text-left p-8 bg-blue-50 border-4 border-blue-100 hover:border-blue-300 hover:bg-blue-100 text-blue-900 rounded-3xl font-black text-2xl transition-all shadow-sm group"
                          >
                            Nur den Anfang einfügen:<br/>
                            <span className="font-serif italic mt-2 block bg-white/50 p-4 rounded-xl group-hover:bg-white transition-colors">"{selectedStarterCategory.fragment}..."</span>
                          </button>

                          <div className="text-center text-xs font-black text-slate-300 uppercase tracking-widest my-4 bg-slate-100 py-1 rounded-full w-fit mx-auto px-4">- ODER WÄHLE EINEN GANZEN SATZ -</div>

                          {/* Option B: Full suggestions */}
                          {selectedStarterCategory.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              onClick={() => { insertText(selectedStarterCategory.fragment + sug); closeModal(); }}
                              className="text-left p-6 bg-white border-b-4 border-slate-200 hover:border-green-400 hover:bg-green-50 text-slate-700 hover:text-green-900 rounded-2xl text-xl font-medium shadow-sm active:border-b-0 active:translate-y-1 transition-all flex items-start gap-4"
                            >
                              <div className="mt-2 w-3 h-3 rounded-full bg-slate-300 shrink-0"></div>
                              <span>{sug}</span>
                            </button>
                          ))}
                        </div>
                    </div>
                  )
               )}

               {/* --- TAB: IDEAS --- */}
               {modalTab === 'ideas' && (
                 <div className="animate-in slide-in-from-left-8">
                    <div className="bg-amber-50 border-4 border-amber-100 rounded-[2rem] p-8 mb-6">
                       <h3 className="text-amber-900 font-black text-2xl mb-4 flex items-center gap-3">
                         <div className="bg-amber-200 p-2 rounded-xl text-amber-700"><Lightbulb size={28}/></div>
                         {contentIdeas.title}
                       </h3>
                       <p className="text-amber-900/70 mb-6 font-medium text-lg">
                         Hier sind ein paar Vorschläge, was ihr in diesem Teil sagen könntet. Klickt auf eine Idee, um sie als Notiz in euer Skript zu übernehmen!
                       </p>
                       
                       <div className="grid grid-cols-1 gap-4">
                         {contentIdeas.items.length > 0 ? contentIdeas.items.map((item, idx) => (
                           <button
                             key={idx}
                             onClick={() => { insertText(` ${item} `); closeModal(); }}
                             className="text-left p-6 bg-white border-b-4 border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-2xl text-slate-800 transition-all font-bold text-lg flex items-start gap-4 active:border-b-0 active:translate-y-1"
                           >
                              <span className="bg-amber-100 text-amber-600 font-black w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm">{idx+1}</span>
                              {item}
                           </button>
                         )) : (
                           <div className="text-center py-12 text-slate-400 italic bg-white rounded-3xl border-dashed border-4 border-slate-200">
                             Hier gibt es gerade keine speziellen Vorschläge. Seid kreativ!
                           </div>
                         )}
                       </div>
                    </div>
                 </div>
               )}

               {/* --- TAB: GLOSSARY --- */}
               {modalTab === 'glossary' && (
                  <div className="animate-in slide-in-from-right-8">
                     <div className="bg-green-50 border-4 border-green-100 rounded-[2rem] p-8 mb-6">
                        <h3 className="text-green-900 font-black text-2xl mb-4 flex items-center gap-3">
                          <div className="bg-green-200 p-2 rounded-xl text-green-700"><BookOpen size={28}/></div>
                          Wörter-Glossar für {topic.simpleTitle}
                        </h3>
                        <p className="text-green-900/70 mb-8 font-medium text-lg">
                          Hier findet ihr wichtige Wörter, die ihr in eurem Podcast benutzen könnt. Klickt auf ein Wort, um die Erklärung zu sehen und es einzufügen!
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {topic.wordBank.map((wordItem, idx) => {
                             const isUsed = allScriptText.includes(wordItem.word.toLowerCase());
                             return (
                             <button 
                               key={idx}
                               onMouseDown={(e) => e.preventDefault()}
                               onClick={() => setSelectedWordDef(wordItem)} 
                               className={`p-6 border-b-4 rounded-2xl text-center font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-3 h-32 relative active:border-b-0 active:translate-y-1 ${
                                  isUsed 
                                  ? 'bg-green-100 border-green-300 text-green-800' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-green-50 hover:text-green-800 hover:border-green-300'
                               }`}
                             >
                               {isUsed && (
                                <span className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full shadow-md z-10 animate-in zoom-in border-2 border-white">
                                    +30
                                </span>
                               )}
                               {isUsed ? <CheckCircle2 size={32} className="text-green-600" /> : <Search size={28} className="opacity-30" />}
                               <span className="text-lg">{wordItem.word}</span>
                             </button>
                           )})}
                        </div>
                     </div>
                  </div>
               )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};