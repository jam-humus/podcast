import { useState, useEffect } from 'react';
import { PodcastTopic, PodcastProject } from '../types';
import { CheckCircle2, XCircle, Award, ArrowRight, BookOpen, Star, Sparkles, BrainCircuit, ThumbsUp, ThumbsDown, HelpCircle, Volume2, StopCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  project: PodcastProject;
  topic: PodcastTopic;
  mode: 'basics' | 'pro';
  onCompleteLesson: (scoreToAdd: number) => void;
  onBack: () => void;
}

export const LessonView = ({ project, topic, mode, onCompleteLesson, onBack }: Props) => {
  // Mode determines initial step
  const [step, setStep] = useState<'intro' | 'quiz' | 'cases' | 'checks' | 'finished'>(mode === 'basics' ? 'intro' : 'cases');
  
  // Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Case State
  const [currentCaseIdx, setCurrentCaseIdx] = useState(0);
  const [selectedCaseOption, setSelectedCaseOption] = useState<number | null>(null);

  // Check State
  const [currentCheckIdx, setCurrentCheckIdx] = useState(0);
  const [checkAnswer, setCheckAnswer] = useState<string | null>(null);

  const [showExplanation, setShowExplanation] = useState(false);
  
  // Tracks points earned ONLY in this session (for animation/logic), but display uses Total
  const [sessionScore, setSessionScore] = useState(0);

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
    };
  }, []);

  // Stop speaking when changing steps
  useEffect(() => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
  }, [step, currentQuizIdx, currentCaseIdx, currentCheckIdx]);

  // --- AUDIO HELPER ---
  const speakText = (text: string) => {
    window.speechSynthesis.cancel(); // Stop previous
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a German voice
    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find(v => v.lang.startsWith('de')) || null;
    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    utterance.lang = 'de-DE';
    utterance.rate = 0.9; // Slightly slower for kids
    utterance.pitch = 1.05; // Slightly friendlier
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // --- HANDLERS ---

  const handleQuizSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === topic.lesson.quizzes[currentQuizIdx].correctIndex) {
      setSessionScore(prev => prev + 10);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
  };

  const nextQuiz = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentQuizIdx < topic.lesson.quizzes.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      setStep('finished');
    }
  };

  const handleCaseSelect = (idx: number) => {
    if (selectedCaseOption !== null) return;
    setSelectedCaseOption(idx);
    setShowExplanation(true);
    if (idx === topic.lesson.cases[currentCaseIdx].correctIndex) {
      setSessionScore(prev => prev + 20); // More points for cases
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
  };

  const nextCase = () => {
    setSelectedCaseOption(null);
    setShowExplanation(false);
    if (currentCaseIdx < topic.lesson.cases.length - 1) {
      setCurrentCaseIdx(prev => prev + 1);
    } else {
      setStep('checks');
    }
  };

  const handleCheckAnswer = (ans: 'yes' | 'no' | 'depends') => {
    if (checkAnswer) return;
    setCheckAnswer(ans);
    setShowExplanation(true);
    
    const correct = topic.lesson.checks[currentCheckIdx].answer;
    if (ans === correct) {
      setSessionScore(prev => prev + 10);
      confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 }, colors: ['#fbbf24'] });
    }
  };

  const nextCheck = () => {
    setCheckAnswer(null);
    setShowExplanation(false);
    if (currentCheckIdx < topic.lesson.checks.length - 1) {
      setCurrentCheckIdx(prev => prev + 1);
    } else {
      setStep('finished');
    }
  };

  const finishLesson = () => {
    const totalScoreToAdd = sessionScore + 50; // Completion Bonus
    onCompleteLesson(totalScoreToAdd);
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
  };

  // --- COMPONENTS ---
  
  const AudioButton = ({ text }: { text: string }) => (
    <button 
      onClick={() => speakText(text)}
      className={`p-3 rounded-2xl transition-all shrink-0 border-b-4 active:border-b-0 active:translate-y-1 ${isSpeaking ? 'bg-red-100 text-red-500 border-red-200 animate-pulse' : 'bg-blue-100 text-blue-500 border-blue-200 hover:bg-blue-200'}`}
      title={isSpeaking ? "Stopp" : "Vorlesen"}
    >
      {isSpeaking ? <StopCircle size={28} /> : <Volume2 size={28} />}
    </button>
  );

  // --- RENDER ---

  const title = mode === 'basics' ? 'Basis-Wissen' : 'Profi-Check';
  const themeColor = mode === 'basics' ? 'text-indigo-600 bg-indigo-100' : 'text-purple-600 bg-purple-100';
  
  // Stable Score Display: Base Project Score + Session Earnings
  const displayedScore = project.score + sessionScore;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-yellow-200">
      
      {/* Header */}
      <div className="bg-white border-b-4 border-slate-200 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-xl">
           ← Zurück
        </button>
        <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl ${themeColor}`}>
              {mode === 'basics' ? <BookOpen size={20}/> : <BrainCircuit size={20}/>}
            </span>
            <span className="font-black text-slate-800 text-lg hidden sm:inline">{title}: {topic.simpleTitle}</span>
        </div>
        <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-2xl border-b-4 border-yellow-200 font-black flex items-center gap-1">
           <Star size={18} fill="currentColor"/> {displayedScore}
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col justify-center">
        
        {/* === BASICS FLOW === */}

        {step === 'intro' && (
          <div className="bg-white rounded-[2rem] shadow-xl p-8 border-4 border-slate-100 animate-in zoom-in-95">
             <div className="text-8xl mb-6 text-center animate-bounce">{topic.icon}</div>
             <div className="flex items-center justify-center gap-3 mb-6">
                <h2 className="text-4xl font-black text-slate-800 text-center">Worum geht es?</h2>
                <AudioButton text={`Worum geht es bei ${topic.simpleTitle}? ${topic.lesson.introStory}`} />
             </div>
             
             <div className="bg-blue-50 p-6 rounded-3xl border-4 border-blue-100 mb-8">
               <p className="text-xl leading-relaxed text-blue-900 font-medium">
                 {topic.lesson.introStory}
               </p>
             </div>
             <button 
               onClick={() => setStep('quiz')}
               className="w-full bg-indigo-600 text-white font-black text-2xl py-5 rounded-2xl border-b-8 border-indigo-800 hover:bg-indigo-500 active:border-b-0 active:translate-y-2 shadow-xl flex items-center justify-center gap-3 group transition-all"
             >
               Zum Quiz <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3}/>
             </button>
          </div>
        )}

        {step === 'quiz' && (
          <div className="bg-white rounded-[2rem] shadow-xl p-8 border-4 border-slate-100 animate-in slide-in-from-right-8">
             <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold bg-slate-100 text-slate-500 px-4 py-2 rounded-full uppercase tracking-wider">
                  Frage {currentQuizIdx + 1}/{topic.lesson.quizzes.length}
                </span>
                <span className="text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-lg">
                  <Award size={18}/> Quiz
                </span>
             </div>

             <div className="flex gap-4 items-start mb-8">
                <h3 className="text-2xl font-black text-slate-800 leading-snug flex-1">
                  {topic.lesson.quizzes[currentQuizIdx].question}
                </h3>
                <AudioButton text={topic.lesson.quizzes[currentQuizIdx].question} />
             </div>

             <div className="space-y-4 mb-8">
               {topic.lesson.quizzes[currentQuizIdx].options.map((option, idx) => {
                 let btnClass = "bg-white border-b-4 border-slate-200 text-slate-700 hover:bg-slate-50";
                 if (selectedOption !== null) {
                   const correct = topic.lesson.quizzes[currentQuizIdx].correctIndex;
                   if (idx === correct) btnClass = "bg-green-100 border-b-4 border-green-400 text-green-800";
                   else if (idx === selectedOption) btnClass = "bg-red-100 border-b-4 border-red-400 text-red-800 opacity-60";
                   else btnClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
                 }
                 return (
                   <button
                     key={idx}
                     onClick={() => handleQuizSelect(idx)}
                     disabled={selectedOption !== null}
                     className={`w-full text-left p-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-between active:scale-95 ${btnClass}`}
                   >
                     {option}
                     {selectedOption !== null && idx === topic.lesson.quizzes[currentQuizIdx].correctIndex && <CheckCircle2 size={32} className="text-green-600"/>}
                     {selectedOption === idx && idx !== topic.lesson.quizzes[currentQuizIdx].correctIndex && <XCircle size={32} className="text-red-500"/>}
                   </button>
                 )
               })}
             </div>

             {showExplanation && (
               <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-2xl mb-6 animate-in fade-in flex gap-4 items-start">
                 <p className="text-indigo-900 font-bold text-lg flex-1">{topic.lesson.quizzes[currentQuizIdx].explanation}</p>
                 <AudioButton text={topic.lesson.quizzes[currentQuizIdx].explanation} />
               </div>
             )}

             {selectedOption !== null && (
               <button onClick={nextQuiz} className="w-full bg-indigo-600 text-white font-black text-xl py-4 rounded-2xl border-b-8 border-indigo-800 hover:bg-indigo-500 active:border-b-0 active:translate-y-2 shadow-md animate-in zoom-in">
                 Weiter
               </button>
             )}
          </div>
        )}

        {/* === PRO FLOW === */}

        {step === 'cases' && (
           <div className="bg-white rounded-[2rem] shadow-xl p-8 border-4 border-slate-100 animate-in slide-in-from-right-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold bg-slate-100 text-slate-500 px-4 py-2 rounded-full uppercase tracking-wider">
                  Fall {currentCaseIdx + 1}/{topic.lesson.cases.length}
                </span>
                <span className="text-purple-600 font-bold flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-lg">
                  <BrainCircuit size={18}/> Fallbeispiel
                </span>
             </div>

             <div className="bg-purple-50 p-6 rounded-3xl border-4 border-purple-100 mb-6 relative">
                <div className="absolute top-4 right-4">
                  <AudioButton text={`Fallbeispiel: ${topic.lesson.cases[currentCaseIdx].title}. ${topic.lesson.cases[currentCaseIdx].scenario}`} />
                </div>
                <h4 className="text-purple-900 font-black mb-2 uppercase text-sm tracking-wide bg-purple-200 inline-block px-2 py-1 rounded">{topic.lesson.cases[currentCaseIdx].title}</h4>
                <p className="text-xl text-purple-900 font-medium leading-relaxed pr-10 mt-2">"{topic.lesson.cases[currentCaseIdx].scenario}"</p>
             </div>

             <h3 className="text-2xl font-black text-slate-800 mb-6">
                {topic.lesson.cases[currentCaseIdx].question}
             </h3>

             <div className="space-y-4 mb-6">
                {topic.lesson.cases[currentCaseIdx].options.map((opt, idx) => {
                   let btnClass = "bg-white border-b-4 border-slate-200 text-slate-700 hover:bg-slate-50";
                   if (selectedCaseOption !== null) {
                     const correct = topic.lesson.cases[currentCaseIdx].correctIndex;
                     if (idx === correct) btnClass = "bg-green-100 border-b-4 border-green-400 text-green-800";
                     else if (idx === selectedCaseOption) btnClass = "bg-red-100 border-b-4 border-red-400 text-red-800 opacity-60";
                     else btnClass = "opacity-50 border-slate-100";
                   }
                   return (
                     <button key={idx} onClick={() => handleCaseSelect(idx)} disabled={selectedCaseOption !== null} className={`w-full text-left p-5 rounded-2xl font-bold text-lg transition-all active:scale-95 ${btnClass}`}>
                       {opt}
                     </button>
                   );
                })}
             </div>

             {showExplanation && (
               <div className="bg-purple-50 border-2 border-purple-100 p-6 rounded-2xl mb-6 animate-in fade-in flex gap-4 items-start">
                 <p className="text-purple-900 font-bold text-lg flex-1">{topic.lesson.cases[currentCaseIdx].explanation}</p>
                 <AudioButton text={topic.lesson.cases[currentCaseIdx].explanation} />
               </div>
             )}

             {selectedCaseOption !== null && (
               <button onClick={nextCase} className="w-full bg-purple-600 text-white font-black text-xl py-4 rounded-2xl border-b-8 border-purple-800 hover:bg-purple-500 active:border-b-0 active:translate-y-2 shadow-md animate-in zoom-in">
                 Weiter
               </button>
             )}
           </div>
        )}

        {step === 'checks' && (
           <div className="bg-white rounded-[2rem] shadow-xl p-8 border-4 border-slate-100 animate-in slide-in-from-right-8 text-center">
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-bold bg-slate-100 text-slate-500 px-4 py-2 rounded-full uppercase tracking-wider">
                  Check {currentCheckIdx + 1}/{topic.lesson.checks.length}
                </span>
                <span className="text-orange-500 font-bold flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-lg">
                  <HelpCircle size={18}/> Darf ich das?
                </span>
             </div>

             <div className="flex justify-center items-center gap-3 mb-12">
               <h3 className="text-3xl font-black text-slate-800 leading-tight">
                  "{topic.lesson.checks[currentCheckIdx].statement}"
               </h3>
               <AudioButton text={topic.lesson.checks[currentCheckIdx].statement} />
             </div>

             {!checkAnswer ? (
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <button onClick={() => handleCheckAnswer('yes')} className="flex flex-col items-center gap-2 p-6 bg-green-50 border-b-8 border-green-200 rounded-2xl hover:bg-green-100 hover:-translate-y-1 active:border-b-0 active:translate-y-1 transition-all group">
                     <div className="bg-green-500 text-white p-4 rounded-full shadow-lg"><ThumbsUp size={32}/></div>
                     <span className="font-black text-green-700 text-xl">Ja</span>
                  </button>
                  <button onClick={() => handleCheckAnswer('no')} className="flex flex-col items-center gap-2 p-6 bg-red-50 border-b-8 border-red-200 rounded-2xl hover:bg-red-100 hover:-translate-y-1 active:border-b-0 active:translate-y-1 transition-all group">
                     <div className="bg-red-500 text-white p-4 rounded-full shadow-lg"><ThumbsDown size={32}/></div>
                     <span className="font-black text-red-700 text-xl">Nein</span>
                  </button>
                  <button onClick={() => handleCheckAnswer('depends')} className="flex flex-col items-center gap-2 p-6 bg-yellow-50 border-b-8 border-yellow-200 rounded-2xl hover:bg-yellow-100 hover:-translate-y-1 active:border-b-0 active:translate-y-1 transition-all group">
                     <div className="bg-yellow-500 text-white p-4 rounded-full shadow-lg"><HelpCircle size={32}/></div>
                     <span className="font-black text-yellow-700 text-xl">Kommt drauf an</span>
                  </button>
               </div>
             ) : (
               <div className="mb-8 animate-in zoom-in">
                  <div className={`inline-block px-8 py-3 rounded-full font-black text-2xl mb-6 shadow-sm border-b-4 ${
                     topic.lesson.checks[currentCheckIdx].answer === checkAnswer ? 'bg-green-100 text-green-700 border-green-300' : 'bg-orange-100 text-orange-700 border-orange-300'
                  }`}>
                     {topic.lesson.checks[currentCheckIdx].answer === checkAnswer ? 'Richtig!' : 'Nicht ganz...'}
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border-4 border-slate-200 text-slate-700 font-bold text-lg flex gap-4 items-center text-left">
                     <p className="flex-1">{topic.lesson.checks[currentCheckIdx].explanation}</p>
                     <AudioButton text={topic.lesson.checks[currentCheckIdx].explanation} />
                  </div>
               </div>
             )}

             {checkAnswer && (
               <button onClick={nextCheck} className="w-full bg-slate-800 text-white font-black text-xl py-4 rounded-2xl border-b-8 border-slate-900 hover:bg-slate-700 active:border-b-0 active:translate-y-2 shadow-md animate-in zoom-in">
                 Weiter
               </button>
             )}
           </div>
        )}

        {/* STEP: FINISHED */}
        {step === 'finished' && (
          <div className="bg-white rounded-[2rem] shadow-xl p-8 border-4 border-slate-100 text-center animate-in zoom-in">
             <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-green-50 animate-pulse">
               <Award size={64} />
             </div>
             <h2 className="text-4xl font-black text-slate-800 mb-2">
                {mode === 'basics' ? 'Super gemacht!' : 'Du bist ein Profi!'}
             </h2>
             <p className="text-slate-500 text-xl mb-8 font-medium">
                {mode === 'basics' ? 'Du hast das Basis-Wissen gemeistert.' : 'Jetzt seid ihr bereit für das Skript!'}
             </p>
             
             <div className="bg-yellow-50 border-4 border-yellow-100 p-6 rounded-3xl mb-8 flex flex-col items-center gap-2">
                <span className="text-yellow-600 font-bold uppercase tracking-widest text-sm">Gesammelte Punkte</span>
                <span className="text-6xl font-black text-yellow-500 flex items-center gap-2">
                   +{sessionScore + 50} <Sparkles size={40}/>
                </span>
             </div>

             <button 
               onClick={finishLesson}
               className="w-full bg-slate-800 text-white font-black text-2xl py-5 rounded-2xl border-b-8 border-slate-950 hover:bg-slate-700 active:border-b-0 active:translate-y-2 shadow-lg flex items-center justify-center gap-2"
             >
               Zurück zum Dashboard
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
