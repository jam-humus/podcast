import React, { useState, useEffect } from 'react';
import { PodcastProject, PodcastTopic, RightId, ScriptCardData } from './types';
import { TOPICS, SCRIPT_TEMPLATE, BADGES, GENERAL_INTRO, LEVELS } from './constants';
import { ScriptBuilder } from './components/ScriptBuilder';
import { LessonView } from './components/LessonView';
import { PDFPreview } from './services/pdfService';
import { Mic, Users, ArrowRight, Sparkles, RotateCcw, BookOpen, Lock, PenTool, CheckCircle2, BrainCircuit, Scale, Book, Star } from 'lucide-react';

type ViewState = 'topic-select' | 'team-input' | 'dashboard' | 'intro-mission' | 'lesson-a' | 'lesson-b' | 'workshop' | 'print';

export default function App() {
  const [project, setProject] = useState<PodcastProject | null>(() => {
    const saved = localStorage.getItem('podcastProject');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<ViewState>(project ? 'dashboard' : 'topic-select');
  const [selectedTopicId, setSelectedTopicId] = useState<RightId | null>(project?.topicId || null);
  const [tempTeamName, setTempTeamName] = useState('');

  useEffect(() => {
    if (project) {
      localStorage.setItem('podcastProject', JSON.stringify(project));
    }
  }, [project]);

  // Helper: Get Current Level
  const getCurrentLevel = (score: number) => {
    // Find the highest level where min <= score
    return [...LEVELS].reverse().find(l => score >= l.min) || LEVELS[0];
  };

  const getNextLevel = (score: number) => {
     return LEVELS.find(l => l.min > score);
  };

  const handleSelectTopic = (id: RightId) => {
    setSelectedTopicId(id);
    setView('team-input');
  };

  const handleCreateProject = () => {
    if (!selectedTopicId || !tempTeamName.trim()) return;
    
    const newProject: PodcastProject = {
      teamName: tempTeamName,
      topicId: selectedTopicId,
      script: SCRIPT_TEMPLATE.map(t => ({...t, text: ''})),
      dateCreated: new Date().toISOString(),
      score: 0,
      unlockedBadges: [],
      introCompleted: false, 
      lessonA_Done: false,
      lessonB_Done: false
    };
    setProject(newProject);
    setView('dashboard');
  };

  const handleIntroComplete = (pointsToAdd: number) => {
    if (!project) return;
    const newBadges = [...project.unlockedBadges];
    if (!newBadges.includes('law_expert')) newBadges.push('law_expert');

    setProject({
        ...project,
        introCompleted: true,
        score: project.score + pointsToAdd,
        unlockedBadges: newBadges
    });
    setTimeout(() => setView('dashboard'), 2000); 
  };

  const handleLessonAComplete = (pointsToAdd: number) => {
    if (!project) return;
    const newBadges = [...project.unlockedBadges];
    if (!newBadges.includes('knowledge_starter')) newBadges.push('knowledge_starter');

    setProject({
        ...project,
        lessonA_Done: true,
        score: project.score + pointsToAdd,
        unlockedBadges: newBadges
    });
    setTimeout(() => setView('dashboard'), 2000); 
  };

  const handleLessonBComplete = (pointsToAdd: number) => {
    if (!project) return;
    const newBadges = [...project.unlockedBadges];
    if (!newBadges.includes('knowledge_pro')) newBadges.push('knowledge_pro');

    setProject({
        ...project,
        lessonB_Done: true,
        score: project.score + pointsToAdd,
        unlockedBadges: newBadges
    });
    setTimeout(() => setView('dashboard'), 2000); 
  };

  const handleUpdateScript = (newScript: ScriptCardData[], newScore: number, newBadges: string[]) => {
    if (project) {
      setProject({ 
        ...project, 
        script: newScript,
        score: newScore,
        unlockedBadges: newBadges
      });
    }
  };

  // Switch to Preview Mode
  const handleShowPreview = () => {
    setView('print');
  };

  // Back from Preview
  const handleBackFromPreview = () => {
    setView('workshop');
  };

  // Actual Browser Print
  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm('Wirklich neu starten? Dein aktuelles Skript und alle Punkte werden gelöscht.')) {
      setProject(null);
      localStorage.removeItem('podcastProject');
      setSelectedTopicId(null);
      setTempTeamName('');
      setView('topic-select');
    }
  };

  // --- Views ---

  if (view === 'print' && project && selectedTopicId) {
    return (
      <PDFPreview 
        project={project} 
        topic={TOPICS[selectedTopicId]} 
        onBack={handleBackFromPreview}
        onPrint={handlePrint}
      />
    );
  }

  // --- LESSON VIEWS ---

  if (view === 'intro-mission' && project) {
    // Construct a "Virtual Topic" for the intro lesson view
    const virtualTopic: PodcastTopic = {
        ...TOPICS[project.topicId], // borrow basics
        simpleTitle: "Das Grundgesetz",
        icon: "📜",
        lesson: GENERAL_INTRO 
    };
    return (
        <LessonView 
          project={project} 
          topic={virtualTopic} 
          mode="basics" // Reusing basics mode (Story + Quiz)
          onCompleteLesson={handleIntroComplete}
          onBack={() => setView('dashboard')}
        />
    );
  }

  if (view === 'lesson-a' && project) {
      return (
          <LessonView 
            project={project} 
            topic={TOPICS[project.topicId]} 
            mode="basics"
            onCompleteLesson={handleLessonAComplete}
            onBack={() => setView('dashboard')}
          />
      );
  }

  if (view === 'lesson-b' && project) {
      return (
          <LessonView 
            project={project} 
            topic={TOPICS[project.topicId]} 
            mode="pro"
            onCompleteLesson={handleLessonBComplete}
            onBack={() => setView('dashboard')}
          />
      );
  }

  if (view === 'workshop' && project) {
    return (
      <ScriptBuilder 
        project={project}
        topic={TOPICS[project.topicId]}
        onUpdateScript={handleUpdateScript}
        onFinish={handleShowPreview}
        onBack={() => setView('dashboard')} 
      />
    );
  }

  // --- Main Dashboard ---

  const currentLevel = project ? getCurrentLevel(project.score) : LEVELS[0];
  const nextLevel = project ? getNextLevel(project.score) : LEVELS[1];
  
  // Calculate Progress bar percentage
  let progressPercent = 100;
  if (project && nextLevel) {
      const prevLevelMin = currentLevel.min;
      const range = nextLevel.min - prevLevelMin;
      const progress = project.score - prevLevelMin;
      progressPercent = Math.min(100, Math.max(0, (progress / range) * 100));
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 1. Landing / Topic Select */}
      {view === 'topic-select' && (
        <div className="max-w-6xl mx-auto p-6 flex flex-col items-center min-h-screen justify-center">
          <div className="mb-12 text-center">
             <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
               <Mic size={40} className="text-rose-600" />
             </div>
             <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Podcast Werkstatt</h1>
             <p className="text-xl text-slate-500 max-w-2xl mx-auto">
               Erstellt euer eigenes Skript für eine Radiosendung über die Grundrechte. 
             </p>
             {project && (
               <button 
                 onClick={() => setView('dashboard')} 
                 className="mt-8 bg-blue-100 text-blue-700 px-6 py-2 rounded-full font-bold hover:bg-blue-200 border border-blue-200 animate-pulse"
               >
                 🔄 Weiterarbeiten an "{project.teamName}"
               </button>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {Object.values(TOPICS).map(topic => (
              <button 
                key={topic.id}
                onClick={() => handleSelectTopic(topic.id)}
                className="bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <span className="text-9xl">{topic.icon}</span>
                </div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{topic.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{topic.simpleTitle}</h3>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{topic.title}</div>
                  <p className="text-slate-500 leading-relaxed">{topic.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Team Name Input */}
      {view === 'team-input' && selectedTopicId && (
        <div className="max-w-md mx-auto p-6 flex flex-col items-center min-h-screen justify-center animate-in slide-in-from-right-8">
           <button onClick={() => setView('topic-select')} className="mb-8 text-slate-400 hover:text-slate-600">← Anderes Thema wählen</button>
           <div className="bg-white p-8 rounded-3xl shadow-xl w-full border border-slate-200">
              <div className="text-center mb-6">
                <span className="text-6xl block mb-2">{TOPICS[selectedTopicId].icon}</span>
                <h2 className="text-2xl font-bold text-slate-800">{TOPICS[selectedTopicId].simpleTitle}</h2>
              </div>
              <label className="block font-bold text-slate-700 mb-2">Wie heißt euer Team?</label>
              <div className="flex items-center bg-slate-100 rounded-xl p-2 border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white transition-colors mb-6">
                 <Users className="text-slate-400 ml-2" />
                 <input 
                   type="text" 
                   autoFocus
                   placeholder="z.B. Die Grundrechte-Profis"
                   className="bg-transparent border-none focus:ring-0 w-full p-2 text-lg font-medium"
                   value={tempTeamName}
                   onChange={(e) => setTempTeamName(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                 />
              </div>
              <button 
                onClick={handleCreateProject}
                disabled={!tempTeamName.trim()}
                className="w-full bg-blue-600 text-white font-bold text-xl py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                Loslegen <ArrowRight />
              </button>
           </div>
        </div>
      )}

      {/* 3. Team Dashboard */}
      {view === 'dashboard' && project && (
        <div className="max-w-5xl mx-auto p-6 flex flex-col min-h-screen">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
             <div>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-1">Hallo, {project.teamName}! 👋</h1>
                <p className="text-xl text-slate-500">Eure Mission: {TOPICS[project.topicId].simpleTitle}</p>
             </div>
             
             {/* LEVEL & SCORE DISPLAY */}
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto min-w-[300px]">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-widest">Aktuelles Level</span>
                    <div className="flex items-center gap-1 font-black text-yellow-500">
                       <Star size={16} fill="currentColor" /> {project.score} Punkte
                    </div>
                 </div>
                 <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{currentLevel.icon}</span>
                    <div>
                        <div className="font-black text-slate-800 text-lg leading-none">{currentLevel.title}</div>
                        {nextLevel && <div className="text-xs text-slate-400 font-bold">Nächstes: {nextLevel.title} ({nextLevel.min} Pkt)</div>}
                    </div>
                 </div>
                 {/* Progress Bar */}
                 {nextLevel ? (
                   <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
                   </div>
                 ) : (
                   <div className="text-center text-xs font-bold text-green-600 uppercase tracking-widest mt-2">Maximales Level erreicht!</div>
                 )}
             </div>
          </div>

          {/* MISSION 0: GENERAL INTRO (NEW) */}
          <button 
            onClick={() => setView('intro-mission')}
            className={`w-full mb-8 relative p-6 rounded-3xl border-4 text-left transition-all shadow-xl group overflow-hidden ${project.introCompleted ? 'bg-orange-50 border-orange-200' : 'bg-white border-white hover:border-orange-300 ring-4 ring-orange-100'}`}
          >
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Scale size={100} />
             </div>
             <div className="relative z-10 flex items-start gap-6">
                <div className={`shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl ${project.introCompleted ? 'bg-orange-200 text-orange-800' : 'bg-orange-100 text-orange-600'}`}>
                  📜
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${project.introCompleted ? 'bg-orange-200 text-orange-800' : 'bg-orange-600 text-white'}`}>
                        Start Mission
                     </span>
                     {project.introCompleted && <CheckCircle2 size={24} className="text-green-500 bg-white rounded-full"/>}
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 mb-1">Was ist das Grundgesetz?</h2>
                   <p className="text-slate-500 mb-4">Bevor ihr startet: Lernt den "Chef" aller Gesetze kennen.</p>
                   
                   <div className={`inline-flex items-center gap-2 font-bold text-sm ${project.introCompleted ? 'text-orange-700' : 'text-orange-600 group-hover:underline'}`}>
                      {project.introCompleted ? 'Wiederholen' : 'Mission starten'} <ArrowRight size={16}/>
                   </div>
                </div>
             </div>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Mission 1: Lesson A */}
             <button 
               onClick={() => setView('lesson-a')}
               className={`relative p-6 rounded-3xl border-4 text-left transition-all shadow-xl group overflow-hidden ${
                 project.lessonA_Done ? 'bg-green-50 border-green-200' : 'bg-white border-white hover:border-indigo-300'
               }`}
             >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <BookOpen size={80} />
                </div>
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                     <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${project.lessonA_Done ? 'bg-green-200 text-green-800' : 'bg-indigo-100 text-indigo-700'}`}>Schritt 1</span>
                     {project.lessonA_Done && <CheckCircle2 size={24} className="text-green-500 bg-white rounded-full"/>}
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Basis-Wissen</h2>
                   <p className="text-slate-500 mb-4 text-sm">Lernt das Wichtigste über {TOPICS[project.topicId].simpleTitle}.</p>
                   
                   <div className={`inline-flex items-center gap-2 font-bold text-sm ${project.lessonA_Done ? 'text-green-700' : 'text-indigo-600 group-hover:underline'}`}>
                       {project.lessonA_Done ? 'Wiederholen' : 'Starten'} <ArrowRight size={16}/>
                   </div>
                </div>
             </button>

             {/* Mission 2: Lesson B */}
             <button 
               onClick={() => setView('lesson-b')}
               className={`relative p-6 rounded-3xl border-4 text-left transition-all shadow-xl group overflow-hidden ${
                   project.lessonB_Done ? 'bg-green-50 border-green-200' : 'bg-white border-white hover:border-purple-300'
               }`}
             >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <BrainCircuit size={80} />
                </div>
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                     <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${project.lessonB_Done ? 'bg-green-200 text-green-800' : 'bg-purple-100 text-purple-700'}`}>Schritt 2</span>
                     {project.lessonB_Done && <CheckCircle2 size={24} className="text-green-500 bg-white rounded-full"/>}
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Profi-Check</h2>
                   <p className="text-slate-500 mb-4 text-sm">Löst knifflige Fälle und entscheidet richtig.</p>
                   
                   <div className={`inline-flex items-center gap-2 font-bold text-sm ${project.lessonB_Done ? 'text-green-700' : 'text-purple-600 group-hover:underline'}`}>
                        {project.lessonB_Done ? 'Wiederholen' : 'Starten'} <ArrowRight size={16}/>
                   </div>
                </div>
             </button>

             {/* Mission 3: Workshop */}
             <button 
               onClick={() => setView('workshop')}
               className={`relative p-6 rounded-3xl border-4 text-left transition-all shadow-xl group overflow-hidden ${
                   project.lessonB_Done ? 'bg-blue-50 border-blue-200' : 'bg-white border-white hover:border-blue-300'
               }`}
             >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <PenTool size={80} />
                </div>
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                     <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${project.lessonB_Done ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>Schritt 3</span>
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Werkstatt</h2>
                   <p className="text-slate-500 mb-4 text-sm">Schreibt euer Skript für die Aufnahme!</p>
                   
                   <div className="inline-flex items-center gap-2 font-bold text-sm text-blue-600 group-hover:underline">
                      Zur Werkstatt <ArrowRight size={16}/>
                   </div>
                </div>
             </button>

          </div>
          
          <div className="mt-12">
             <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">Eure Trophäensammlung</h3>
             <div className="flex flex-wrap gap-4">
                {BADGES.map(badge => {
                   const isUnlocked = project.unlockedBadges.includes(badge.id);
                   return (
                      <div key={badge.id} className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${isUnlocked ? `bg-white ${badge.color}` : 'bg-slate-100 border-slate-200 text-slate-400 grayscale opacity-60'}`}>
                         <span className="text-2xl">{badge.icon}</span>
                         <div>
                            <div className="font-bold text-sm">{badge.title}</div>
                            {isUnlocked && <div className="text-[10px] uppercase font-bold opacity-70">Freigeschaltet</div>}
                         </div>
                      </div>
                   )
                })}
             </div>
          </div>
        </div>
      )}

      {(view === 'dashboard' || view === 'topic-select' || view === 'team-input') && project && (
         <div className="fixed bottom-4 right-4">
           <button onClick={handleReset} className="text-xs text-red-300 hover:text-red-500 flex items-center gap-1 bg-white/50 p-2 rounded hover:bg-white transition-colors">
             <RotateCcw size={12}/> Reset App
           </button>
         </div>
      )}
    </div>
  );
}