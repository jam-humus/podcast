import React, { useState, useRef, useEffect } from 'react';
import { PodcastTopic, PodcastProject, ScriptCardData, CardType, StarterOption, Badge, WordDef } from '../types';
import { SCRIPT_TEMPLATE, BADGES } from '../constants';
import { Save, Info, User, CheckCircle2, ChevronRight, ArrowLeft, Mic, X, Sparkles, MessageSquare, Lightbulb, PenTool, Trophy, Star, Medal, BookOpen, Search, Wand2 } from 'lucide-react';

interface Props {
  project: PodcastProject;
  topic: PodcastTopic;
  onUpdateScript: (newScript: ScriptCardData[], newScore: number, newBadges: string[]) => void;
  onFinish: () => void;
  onBack: () => void;
}

// --- Knowledge Components ---
const InfoBox: React.FC<{ title: string; icon: string; color: string; children: React.ReactNode }> = ({ title, icon, color, children }) => (
  <div className={`p-4 rounded-xl border-2 ${color} mb-3 shadow-sm bg-white`}>
    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
      <span>{icon}</span> {title}
    </h4>
    <div className="text-slate-600 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

// --- Time Bar Component ---
const TimeTracker: React.FC<{ totalWords: number }> = ({ totalWords }) => {
  const wordsPerMinute = 75; 
  const currentMinutes = totalWords / wordsPerMinute;
  const percentage = Math.min(100, (currentMinutes / 6) * 100);
  
  // Colors
  let colorClass = 'bg-blue-400';
  if (currentMinutes >= 3 && currentMinutes <= 5) colorClass = 'bg-green-500';
  else if (currentMinutes > 5) colorClass = 'bg-orange-400';

  return (
    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-2 px-3 border border-slate-200 min-w-[150px]">
       <div className="flex-1">
         <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
            {/* Target Zone (3-5 min) */}
            <div className="absolute top-0 bottom-0 bg-green-100 opacity-50 border-x border-green-200" style={{left: '50%', width: '33%'}} />
            <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${percentage}%` }} />
         </div>
         <div className="text-[10px] text-slate-400 font-bold text-center mt-1">
           {Math.round(currentMinutes * 60)} Sek. / Ziel: 3-5 Min.
         </div>
       </div>
    </div>
  );
};

// --- Gamification Components ---
const ScoreBoard: React.FC<{ score: number, recentGain: number }> = ({ score, recentGain }) => {
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
    <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full border border-yellow-300 shadow-sm relative overflow-hidden group">
      <Trophy size={18} className="text-yellow-600" />
      <span className="font-black text-lg">{displayScore}</span>
      <span className="text-xs font-bold opacity-60">PKT</span>
      {recentGain > 0 && (
        <span className="absolute top-0 right-2 text-green-600 font-black text-sm animate-ping">+{recentGain}</span>
      )}
    </div>
  );
};

const BadgeToast: React.FC<{ badge: Badge, onClose: () => void }> = ({ badge, onClose }) => {
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

export const ScriptBuilder: React.FC<Props> = ({ project, topic, onUpdateScript, onFinish, onBack }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // State
  const [cards, setCards] = useState<ScriptCardData[]>(() => {
    if (project.script.length > 0) return project.script;
    return SCRIPT_TEMPLATE.map(t => ({ ...t, text: '' }));
  });
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const activeCard = cards[activeCardIdx];

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

  // --- Helper: Count Words Ignoring Speaker Tags ---
  const countWords = (text: string) => {
      if (!text) return 0;
      // Remove "Sprecher X:" patterns
      const clean = text.replace(/Sprecher\s+[A-E]:/gi, '').trim();
      return clean ? clean.split(/\s+/).length : 0;
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

  // --- Gamification Logic ---
  const calculateScore = (currentCards: ScriptCardData[]) => {
    let newScore = 0;
    
    // 1. Points for Words (2 points per word)
    const totalWordCount = currentCards.reduce((acc, c) => acc + countWords(c.text), 0);
    newScore += totalWordCount * 2;

    // 2. Points for Completed Cards (50 points per card)
    const completedCards = currentCards.filter(c => {
       const w = countWords(c.text);
       return w >= c.minWords;
    }).length;
    newScore += completedCards * 50;

    return newScore;
  };

  const checkBadges = (currentCards: ScriptCardData[], currentUnlocked: string[]) => {
     const tempProject: PodcastProject = { ...project, script: currentCards, score: 0, unlockedBadges: currentUnlocked }; // Mock project for check
     
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

    // Calc Score
    const calculatedScore = calculateScore(newCards);
    if (calculatedScore > score) {
        setRecentScoreGain(calculatedScore - score);
        setTimeout(() => setRecentScoreGain(0), 1000);
    }
    setScore(calculatedScore);

    // Check Badges
    checkBadges(newCards, unlockedBadges);

    // Propagate
    onUpdateScript(newCards, calculatedScore, unlockedBadges);
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

  // --- Auto-Extension Magic Logic ---
  const getAutoSuggestion = (): string | null => {
      const ideas = getContentIdeas().items;
      const starters = topic.sentenceStarters[activeCard.type] || [];
      const starterSentences = starters.flatMap(s => s.suggestions.map(sug => `${s.fragment}${sug}`));

      const pool = [...ideas, ...starterSentences];
      // Filter out existing text
      const available = pool.filter(s => !activeCard.text.toLowerCase().includes(s.toLowerCase()));

      if (available.length === 0) return null;
      return available[Math.floor(Math.random() * available.length)];
  };

  const handleMagicExtend = () => {
      const suggestion = getAutoSuggestion();
      if (suggestion) {
          // Add a leading space if needed
          const prefix = (activeCard.text.length > 0 && !activeCard.text.endsWith(' ') && !activeCard.text.endsWith('\n')) ? ' ' : '';
          insertText(prefix + suggestion);
      }
  };


  const totalWords = cards.reduce((acc, c) => acc + countWords(c.text), 0);
  const currentWordCount = countWords(activeCard.text);
  const isShort = currentWordCount < activeCard.minWords;
  const hasStarted = currentWordCount > 5; // Only suggest if they wrote at least something
  const canMagicExtend = isShort && hasStarted && getAutoSuggestion() !== null;
  const allScriptText = cards.map(c => c.text).join(' ').toLowerCase();

  // Close modal logic
  const closeModal = () => {
    setShowStarterModal(false);
    setSelectedStarterCategory(null);
    setModalTab('starters');
  };

  const contentIdeas = getContentIdeas();

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans">
      
      {newBadge && <BadgeToast badge={newBadge} onClose={() => setNewBadge(null)} />}

      {/* --- HEADER --- */}
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm z-20 h-16">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-50 p-2 rounded-lg">
             ← Zurück
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-rose-100 text-rose-600 p-1.5 rounded-lg"><Mic size={16} /></span>
              {project.teamName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <ScoreBoard score={score} recentGain={recentScoreGain} />
           <TimeTracker totalWords={totalWords} />
           <button 
             onClick={onFinish}
             className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 flex items-center gap-2 shadow-md transition-transform active:scale-95"
           >
             <Save size={18} /> <span>Fertig & Drucken</span>
           </button>
        </div>
      </div>

      {/* --- MAIN LAYOUT (3 Columns) --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* COLUMN 1: NAVIGATION (Storyboard) */}
        <div className="w-64 bg-slate-50 border-r overflow-y-auto p-4 space-y-3 hidden md:block">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Ablaufplan</h3>
          {cards.map((card, idx) => {
             const wordCount = countWords(card.text);
             const isComplete = wordCount >= card.minWords;
             const isActive = idx === activeCardIdx;
             
             return (
              <button 
                key={card.type}
                onClick={() => setActiveCardIdx(idx)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all relative group ${
                  isActive 
                    ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-100 z-10' 
                    : 'bg-white border-slate-200 hover:border-blue-300 text-slate-500'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                    Teil {idx + 1}
                  </span>
                  {/* Checkmark implies good progress, but is strictly enforced */}
                  {isComplete && <CheckCircle2 size={16} className="text-green-500 bg-white rounded-full" />}
                </div>
                <div className={`font-bold text-sm leading-tight ${isActive ? 'text-slate-800' : ''}`}>{card.title}</div>
              </button>
             );
          })}
        </div>

        {/* COLUMN 2: EDITOR (Main Stage) */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100 relative">
           
           <div className="flex-1 p-4 md:p-6 flex flex-col h-full max-w-4xl mx-auto w-full">
             
             {/* Toolbar */}
             <div className="bg-white rounded-t-2xl border border-slate-200 border-b-0 p-3 flex items-center justify-between gap-4 shadow-sm z-10">
                {/* Speakers */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {['A', 'B', 'C', 'D', 'E'].map(speaker => (
                    <button 
                      key={speaker}
                      onMouseDown={(e) => e.preventDefault()} 
                      onClick={() => insertText(`\nSprecher ${speaker}: `)} 
                      className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-400 text-indigo-700 font-bold flex items-center justify-center transition-all shadow-sm"
                      title={`Sprecher ${speaker}`}
                    >
                      {speaker}
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-400 uppercase ml-1">Sprecher</span>
                </div>

                <div className="flex gap-2">
                    {canMagicExtend && (
                        <button 
                            onClick={handleMagicExtend}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-2 border-purple-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 animate-in zoom-in"
                            title="Automatisch einen Satz ergänzen"
                        >
                            <Wand2 size={20} />
                            <span className="hidden sm:inline">Satz ergänzen</span>
                        </button>
                    )}

                    {/* Big Sentence Starter Button */}
                    <button 
                    onClick={() => setShowStarterModal(true)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 animate-in slide-in-from-top-2"
                    >
                    <Sparkles size={20} className="text-amber-600"/>
                    <span className="hidden sm:inline">Hilfe & Wörter</span>
                    </button>
                </div>
             </div>

             {/* Huge Text Area */}
             <div className="flex-1 bg-white border border-slate-200 rounded-b-2xl shadow-sm relative flex flex-col">
                <textarea 
                  ref={textAreaRef}
                  className="flex-1 w-full h-full p-8 text-2xl leading-loose resize-none focus:outline-none font-medium text-slate-800 bg-transparent placeholder-slate-300 rounded-b-2xl"
                  placeholder={`Hier schreibt ihr euren Text für "${activeCard.title}"...\n\nTipp: Klickt oben rechts auf "Hilfe & Wörter", wenn ihr Hilfe braucht!`}
                  value={activeCard.text}
                  onChange={(e) => updateCardText(e.target.value)}
                  spellCheck={false}
                />
                
                {/* Floating Word Count for current card */}
                <div className="absolute bottom-4 right-4 flex items-center gap-4">
                    {/* Badge Progress Indicator (Simple check) */}
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-widest hidden sm:block">
                        {unlockedBadges.length} Badges
                    </div>
                    {/* Simply word count, no specific target enforced visually */}
                    <div className="text-xs font-bold px-3 py-1 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                        {currentWordCount} Wörter
                    </div>
                </div>
             </div>
             
             {/* Navigation Buttons Mobile/Desktop */}
             <div className="flex justify-between mt-4">
                <button 
                  disabled={activeCardIdx===0} 
                  onClick={() => setActiveCardIdx(activeCardIdx-1)}
                  className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 disabled:opacity-0 transition-opacity"
                >
                  <ArrowLeft size={20}/> Zurück
                </button>
                <button 
                  disabled={activeCardIdx===cards.length-1} 
                  onClick={() => setActiveCardIdx(activeCardIdx+1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  Weiter zum nächsten Teil <ChevronRight size={20}/>
                </button>
             </div>

           </div>
        </div>

        {/* COLUMN 3: RIGHT TOOLBOX (Glossary & Info) - Visible only on large screens */}
        <div className="w-80 bg-slate-50 border-l overflow-y-auto p-4 hidden xl:block">
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
                     className={`px-3 py-2 border-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                        isUsed 
                        ? 'bg-green-100 border-green-300 text-green-800' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                     }`}
                     title="Klicken für Erklärung"
                   >
                     {isUsed ? <CheckCircle2 size={12} className="shrink-0" /> : <Search size={12} className="opacity-50" />}
                     {wordItem.word}
                   </button>
                 )})}
              </div>
           </div>

           <div className="h-px bg-slate-200 my-6"></div>

           {/* Contextual Info */}
           <h4 className="font-bold text-slate-700 mb-3 text-sm">Infos zu {topic.simpleTitle}</h4>
           <div className="space-y-4">
             <InfoBox title="Merksatz" icon="💡" color="border-amber-200 bg-amber-50">
               <span className="italic">"{topic.keySentence}"</span>
             </InfoBox>
             <InfoBox title="Beispiele" icon="👀" color="border-blue-200 bg-blue-50">
               <ul className="list-disc ml-3 space-y-1">
                 {topic.exampleIdeas.map((t,i) => <li key={i}>{t}</li>)}
               </ul>
             </InfoBox>
           </div>
        </div>
      </div>

      {/* --- MODAL: WORD DEFINITION --- */}
      {selectedWordDef && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border-4 border-yellow-300 animate-in zoom-in-95">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                 <BookOpen className="text-yellow-600" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 mb-2">"{selectedWordDef.word}"</h3>
               <p className="text-lg text-slate-600 leading-relaxed font-medium">
                 {selectedWordDef.definition}
               </p>
             </div>
             
             <div className="grid grid-cols-1 gap-3">
               <button 
                 onClick={() => { insertText(selectedWordDef.word); setSelectedWordDef(null); }}
                 className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                 <CheckCircle2 size={20}/> Wort einfügen
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-50 border-b p-4 px-6 flex justify-between items-center shrink-0">
               <div className="flex flex-col">
                 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                   <Sparkles className="text-amber-500" fill="currentColor" />
                   Eure Kreativ-Werkstatt
                 </h2>
                 <p className="text-slate-500 text-sm">
                   Hier findet ihr Hilfe für: <strong className="text-slate-700">{activeCard.title}</strong>
                 </p>
               </div>
               <button onClick={closeModal} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
                 <X size={24} className="text-slate-600"/>
               </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-slate-100 p-1 gap-1 shrink-0 border-b border-slate-200 overflow-x-auto">
               <button 
                 onClick={() => { setModalTab('starters'); setSelectedStarterCategory(null); }}
                 className={`flex-1 min-w-[150px] py-3 font-bold rounded-t-xl text-lg flex items-center justify-center gap-2 transition-all ${modalTab === 'starters' ? 'bg-white text-slate-800 shadow-sm border-t-2 border-blue-500' : 'text-slate-500 hover:bg-slate-200'}`}
               >
                 <PenTool size={20} /> Formulierungshilfen
               </button>
               <button 
                 onClick={() => { setModalTab('ideas'); setSelectedStarterCategory(null); }}
                 className={`flex-1 min-w-[150px] py-3 font-bold rounded-t-xl text-lg flex items-center justify-center gap-2 transition-all ${modalTab === 'ideas' ? 'bg-white text-slate-800 shadow-sm border-t-2 border-amber-500' : 'text-slate-500 hover:bg-slate-200'}`}
               >
                 <Lightbulb size={20} /> Ideen für den Inhalt
               </button>
               <button 
                 onClick={() => { setModalTab('glossary'); setSelectedStarterCategory(null); }}
                 className={`flex-1 min-w-[150px] py-3 font-bold rounded-t-xl text-lg flex items-center justify-center gap-2 transition-all ${modalTab === 'glossary' ? 'bg-white text-slate-800 shadow-sm border-t-2 border-green-500' : 'text-slate-500 hover:bg-slate-200'}`}
               >
                 <BookOpen size={20} /> Wörter-Glossar
               </button>
            </div>

            {/* Modal Content Area */}
            <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1 relative">
               
               {/* --- TAB: STARTERS --- */}
               {modalTab === 'starters' && (
                  !selectedStarterCategory ? (
                    // Categories View
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topic.sentenceStarters[activeCard.type]?.map((starter) => (
                          <button 
                            key={starter.label}
                            onClick={() => setSelectedStarterCategory(starter)}
                            className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                          >
                            <div className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 flex justify-between items-center">
                              {starter.label}
                              <ChevronRight className="text-slate-300 group-hover:text-blue-500"/>
                            </div>
                            <div className="text-slate-400 text-sm italic">
                              z.B. "{starter.fragment}..."
                            </div>
                          </button>
                        ))}
                        {(!topic.sentenceStarters[activeCard.type] || topic.sentenceStarters[activeCard.type].length === 0) && (
                          <div className="col-span-2 text-center py-12 flex flex-col items-center justify-center text-slate-400">
                             <MessageSquare size={48} className="mb-4 opacity-20"/>
                             <p className="text-lg">Für diesen Teil haben wir keine speziellen Satzanfänge.</p>
                             <p className="text-sm">Schaut mal in die "Ideen für den Inhalt"!</p>
                          </div>
                        )}
                    </div>
                  ) : (
                    // Suggestions View
                    <div className="space-y-6 animate-in slide-in-from-right-8">
                        <button 
                          onClick={() => setSelectedStarterCategory(null)} 
                          className="text-slate-500 font-bold hover:text-blue-600 flex items-center gap-1 mb-2 px-2 py-1 rounded-lg hover:bg-slate-100 w-fit"
                        >
                          <ArrowLeft size={16}/> Zurück zur Übersicht
                        </button>

                        <div className="grid grid-cols-1 gap-4">
                          {/* Option A: Just the fragment */}
                          <button
                            onClick={() => { insertText(selectedStarterCategory.fragment); closeModal(); }}
                            className="text-left p-6 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 text-blue-900 rounded-2xl font-bold text-xl transition-all shadow-sm"
                          >
                            Nur den Anfang einfügen:<br/>
                            <span className="font-serif italic mt-1 block">"{selectedStarterCategory.fragment}..."</span>
                          </button>

                          <div className="text-center text-xs font-bold text-slate-300 uppercase tracking-widest my-2">- ODER WÄHLE EINEN GANZEN SATZ -</div>

                          {/* Option B: Full suggestions */}
                          {selectedStarterCategory.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              onClick={() => { insertText(selectedStarterCategory.fragment + sug); closeModal(); }}
                              className="text-left p-5 bg-white border-2 border-slate-200 hover:border-green-400 hover:bg-green-50 text-slate-700 hover:text-green-900 rounded-xl text-lg font-medium shadow-sm hover:shadow-md transition-all flex items-start gap-4"
                            >
                              <div className="mt-1.5 w-2 h-2 rounded-full bg-slate-300 shrink-0"></div>
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
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                       <h3 className="text-amber-900 font-bold text-lg mb-2 flex items-center gap-2">
                         <Lightbulb size={24}/> {contentIdeas.title}
                       </h3>
                       <p className="text-amber-800/70 mb-4">
                         Hier sind ein paar Vorschläge, was ihr in diesem Teil sagen könntet. Klickt auf eine Idee, um sie als Notiz in euer Skript zu übernehmen!
                       </p>
                       
                       <div className="grid grid-cols-1 gap-3">
                         {contentIdeas.items.length > 0 ? contentIdeas.items.map((item, idx) => (
                           <button
                             key={idx}
                             onClick={() => { insertText(` ${item} `); closeModal(); }}
                             className="text-left p-4 bg-white border-2 border-amber-100 hover:border-amber-400 hover:shadow-md rounded-xl text-slate-700 transition-all font-medium flex items-start gap-3"
                           >
                              <span className="bg-amber-100 text-amber-600 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">{idx+1}</span>
                              {item}
                           </button>
                         )) : (
                           <div className="text-center py-8 text-slate-400 italic bg-white rounded-xl border-dashed border-2 border-slate-200">
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
                     <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                        <h3 className="text-green-900 font-bold text-lg mb-2 flex items-center gap-2">
                          <BookOpen size={24}/> Wörter-Glossar für {topic.simpleTitle}
                        </h3>
                        <p className="text-green-800/70 mb-6">
                          Hier findet ihr wichtige Wörter, die ihr in eurem Podcast benutzen könnt. Klickt auf ein Wort, um die Erklärung zu sehen und es einzufügen!
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {topic.wordBank.map((wordItem, idx) => {
                             const isUsed = allScriptText.includes(wordItem.word.toLowerCase());
                             return (
                             <button 
                               key={idx}
                               onMouseDown={(e) => e.preventDefault()}
                               onClick={() => setSelectedWordDef(wordItem)} 
                               className={`p-4 border-2 rounded-xl text-center font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-2 h-24 ${
                                  isUsed 
                                  ? 'bg-green-100 border-green-300 text-green-800' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:text-green-700 hover:shadow-md'
                               }`}
                             >
                               {isUsed ? <CheckCircle2 size={20} className="text-green-600" /> : <Search size={20} className="opacity-30" />}
                               <span className="text-sm">{wordItem.word}</span>
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