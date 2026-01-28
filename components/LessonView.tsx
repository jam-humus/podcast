import { useState } from 'react';
import { PodcastTopic, PodcastProject } from '../types';
import { CheckCircle2, XCircle, Award, ArrowRight, BookOpen, Star, Sparkles, BrainCircuit, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
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

  // --- RENDER ---

  const title = mode === 'basics' ? 'Basis-Wissen' : 'Profi-Check';
  const themeColor = mode === 'basics' ? 'text-indigo-600 bg-indigo-100' : 'text-purple-600 bg-purple-100';
  
  // Stable Score Display: Base Project Score + Session Earnings
  const displayedScore = project.score + sessionScore;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
           ← Zurück
        </button>
        <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${themeColor}`}>
              {mode === 'basics' ? <BookOpen size={18}/> : <BrainCircuit size={18}/>}
            </span>
            <span className="font-bold text-slate-700">{title}: {topic.simpleTitle}</span>
        </div>
        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold flex items-center gap-1 text-sm">
           <Star size={14} fill="currentColor"/> {displayedScore}
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col justify-center">
        
        {/* === BASICS FLOW === */}

        {step === 'intro' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 animate-in zoom-in-95">
             <div className="text-6xl mb-6 text-center">{topic.icon}</div>
             <h2 className="text-3xl font-black text-slate-800 mb-6 text-center">Worum geht es?</h2>
             <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-500 mb-8">
               <p className="text-xl leading-relaxed text-blue-900 font-medium">
                 {topic.lesson.introStory}
               </p>
             </div>
             <button 
               onClick={() => setStep('quiz')}
               className="w-full bg-indigo-600 text-white font-bold text-xl py-4 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group transition-all"
             >
               Zum Quiz <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
             </button>
          </div>
        )}

        {step === 'quiz' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 animate-in slide-in-from-right-8">
             <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-wider">
                  Frage {currentQuizIdx + 1}/{topic.lesson.quizzes.length}
                </span>
                <span className="text-indigo-600 font-bold flex items-center gap-1">
                  <Award size={18}/> Quiz
                </span>
             </div>

             <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-snug">
               {topic.lesson.quizzes[currentQuizIdx].question}
             </h3>

             <div className="space-y-3 mb-8">
               {topic.lesson.quizzes[currentQuizIdx].options.map((option, idx) => {
                 let btnClass = "bg-slate-50 border-2 border-slate-200 text-slate-700 hover:border-indigo-300";
                 if (selectedOption !== null) {
                   const correct = topic.lesson.quizzes[currentQuizIdx].correctIndex;
                   if (idx === correct) btnClass = "bg-green-100 border-2 border-green-500 text-green-800";
                   else if (idx === selectedOption) btnClass = "bg-red-100 border-2 border-red-500 text-red-800";
                   else btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                 }
                 return (
                   <button
                     key={idx}
                     onClick={() => handleQuizSelect(idx)}
                     disabled={selectedOption !== null}
                     className={`w-full text-left p-4 rounded-xl font-bold text-lg transition-all flex items-center justify-between ${btnClass}`}
                   >
                     {option}
                     {selectedOption !== null && idx === topic.lesson.quizzes[currentQuizIdx].correctIndex && <CheckCircle2 size={24}/>}
                     {selectedOption === idx && idx !== topic.lesson.quizzes[currentQuizIdx].correctIndex && <XCircle size={24}/>}
                   </button>
                 )
               })}
             </div>

             {showExplanation && (
               <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6 animate-in fade-in">
                 <p className="text-indigo-800 font-medium">{topic.lesson.quizzes[currentQuizIdx].explanation}</p>
               </div>
             )}

             {selectedOption !== null && (
               <button onClick={nextQuiz} className="w-full bg-indigo-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-indigo-700 shadow-md animate-in zoom-in">
                 Weiter
               </button>
             )}
          </div>
        )}

        {/* === PRO FLOW === */}

        {step === 'cases' && (
           <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 animate-in slide-in-from-right-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-wider">
                  Fall {currentCaseIdx + 1}/{topic.lesson.cases.length}
                </span>
                <span className="text-purple-600 font-bold flex items-center gap-1">
                  <BrainCircuit size={18}/> Fallbeispiel
                </span>
             </div>

             <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mb-6">
                <h4 className="text-purple-900 font-bold mb-2 uppercase text-sm tracking-wide">{topic.lesson.cases[currentCaseIdx].title}</h4>
                <p className="text-lg text-purple-900/80 font-medium leading-relaxed">"{topic.lesson.cases[currentCaseIdx].scenario}"</p>
             </div>

             <h3 className="text-xl font-bold text-slate-800 mb-6">
                {topic.lesson.cases[currentCaseIdx].question}
             </h3>

             <div className="space-y-3 mb-6">
                {topic.lesson.cases[currentCaseIdx].options.map((opt, idx) => {
                   let btnClass = "bg-white border-2 border-slate-200 text-slate-700 hover:border-purple-300";
                   if (selectedCaseOption !== null) {
                     const correct = topic.lesson.cases[currentCaseIdx].correctIndex;
                     if (idx === correct) btnClass = "bg-green-100 border-2 border-green-500 text-green-800";
                     else if (idx === selectedCaseOption) btnClass = "bg-red-100 border-2 border-red-500 text-red-800";
                     else btnClass = "opacity-50";
                   }
                   return (
                     <button key={idx} onClick={() => handleCaseSelect(idx)} disabled={selectedCaseOption !== null} className={`w-full text-left p-4 rounded-xl font-bold transition-all ${btnClass}`}>
                       {opt}
                     </button>
                   );
                })}
             </div>

             {showExplanation && (
               <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-6 animate-in fade-in">
                 <p className="text-purple-800 font-medium">{topic.lesson.cases[currentCaseIdx].explanation}</p>
               </div>
             )}

             {selectedCaseOption !== null && (
               <button onClick={nextCase} className="w-full bg-purple-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-purple-700 shadow-md animate-in zoom-in">
                 Weiter
               </button>
             )}
           </div>
        )}

        {step === 'checks' && (
           <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 animate-in slide-in-from-right-8 text-center">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-bold bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-wider">
                  Check {currentCheckIdx + 1}/{topic.lesson.checks.length}
                </span>
                <span className="text-orange-500 font-bold flex items-center gap-1">
                  <HelpCircle size={18}/> Darf ich das?
                </span>
             </div>

             <h3 className="text-3xl font-black text-slate-800 mb-12 leading-tight">
                "{topic.lesson.checks[currentCheckIdx].statement}"
             </h3>

             {!checkAnswer ? (
               <div className="grid grid-cols-3 gap-4 mb-8">
                  <button onClick={() => handleCheckAnswer('yes')} className="flex flex-col items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-colors group">
                     <div className="bg-green-500 text-white p-3 rounded-full group-hover:scale-110 transition-transform"><ThumbsUp size={24}/></div>
                     <span className="font-bold text-green-700">Ja</span>
                  </button>
                  <button onClick={() => handleCheckAnswer('no')} className="flex flex-col items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors group">
                     <div className="bg-red-500 text-white p-3 rounded-full group-hover:scale-110 transition-transform"><ThumbsDown size={24}/></div>
                     <span className="font-bold text-red-700">Nein</span>
                  </button>
                  <button onClick={() => handleCheckAnswer('depends')} className="flex flex-col items-center gap-2 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors group">
                     <div className="bg-yellow-500 text-white p-3 rounded-full group-hover:scale-110 transition-transform"><HelpCircle size={24}/></div>
                     <span className="font-bold text-yellow-700">Kommt drauf an</span>
                  </button>
               </div>
             ) : (
               <div className="mb-8 animate-in zoom-in">
                  <div className={`inline-block px-6 py-2 rounded-full font-black text-xl mb-4 ${
                     topic.lesson.checks[currentCheckIdx].answer === checkAnswer ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                     {topic.lesson.checks[currentCheckIdx].answer === checkAnswer ? 'Richtig!' : 'Nicht ganz...'}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-lg">
                     {topic.lesson.checks[currentCheckIdx].explanation}
                  </div>
               </div>
             )}

             {checkAnswer && (
               <button onClick={nextCheck} className="w-full bg-slate-800 text-white font-bold text-lg py-3 rounded-xl hover:bg-slate-900 shadow-md animate-in zoom-in">
                 Weiter
               </button>
             )}
           </div>
        )}

        {/* STEP: FINISHED */}
        {step === 'finished' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 text-center animate-in zoom-in">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <Award size={48} />
             </div>
             <h2 className="text-3xl font-black text-slate-800 mb-2">
                {mode === 'basics' ? 'Basis-Wissen komplett!' : 'Profi-Check bestanden!'}
             </h2>
             <p className="text-slate-500 text-lg mb-8">
                {mode === 'basics' ? 'Ihr seid bereit für die Profi-Aufgaben.' : 'Jetzt könnt ihr euer Skript schreiben!'}
             </p>
             
             <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl mb-8 flex flex-col items-center gap-2">
                <span className="text-yellow-600 font-bold uppercase tracking-widest text-xs">Gesammelte Punkte</span>
                <span className="text-5xl font-black text-yellow-500 flex items-center gap-2">
                   +{sessionScore + 50} <Sparkles size={32}/>
                </span>
             </div>

             <button 
               onClick={finishLesson}
               className="w-full bg-slate-800 text-white font-bold text-xl py-4 rounded-xl hover:bg-slate-900 shadow-lg flex items-center justify-center gap-2"
             >
               Zurück zum Dashboard
             </button>
          </div>
        )}
      </div>
    </div>
  );
};