import React from 'react';
import { PodcastProject, PodcastTopic } from '../types';
import { BADGES } from '../constants';
import { Printer, ArrowLeft, Download } from 'lucide-react';

interface Props {
  project: PodcastProject;
  topic: PodcastTopic;
  onBack: () => void;
  onPrint: () => void;
}

export const PDFPreview: React.FC<Props> = ({ project, topic, onBack, onPrint }) => {
  const earnedBadges = BADGES.filter(b => project.unlockedBadges?.includes(b.id));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Navigation Bar (Hidden on Print) */}
      <div className="bg-slate-800 text-white p-4 sticky top-0 z-50 no-print shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 hover:text-slate-300 font-bold transition-colors"
          >
            <ArrowLeft /> Zurück zur Werkstatt
          </button>
          <div className="flex gap-4">
             <button 
               onClick={onPrint}
               className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
             >
               <Printer size={20} /> Drucken / PDF speichern
             </button>
          </div>
        </div>
      </div>

      {/* A4 Paper View */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="paper-sheet">
          
          {/* Header */}
          <div className="border-b-4 border-black pb-4 mb-8 flex justify-between items-end">
            <div>
               <h1 className="text-4xl font-black text-black mb-2 leading-tight">Podcast Skript: {topic.simpleTitle}</h1>
               <h2 className="text-2xl text-slate-800 font-bold">Gruppe: {project.teamName}</h2>
            </div>
            <div className="text-right">
               <div className="text-xl font-bold bg-slate-100 px-3 py-1 rounded inline-block mb-1">{topic.articleRef}</div>
               <p className="text-sm text-slate-500">Erstellt am: {new Date(project.dateCreated).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Badges Section */}
          {earnedBadges.length > 0 && (
             <div className="mb-8 border-2 border-dashed border-slate-300 p-4 rounded-xl bg-slate-50 break-inside-avoid">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <span className="text-lg">🏆</span> Erreichte Auszeichnungen
                </h3>
                <div className="flex flex-wrap gap-3">
                   {earnedBadges.map(b => (
                     <div key={b.id} className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white shadow-sm">
                        <span className="text-xl">{b.icon}</span>
                        <span className="font-bold text-sm text-slate-700">{b.title}</span>
                     </div>
                   ))}
                </div>
             </div>
          )}

          {/* Script Content */}
          <div className="space-y-8">
            {project.script.map((card, idx) => (
              <div key={idx} className="mb-6 break-inside-avoid">
                 <div className="flex items-center gap-3 border-b-2 border-slate-200 mb-3 pb-2">
                    <span className="font-black text-lg bg-black text-white px-2 rounded-md min-w-[2rem] h-8 flex items-center justify-center shadow-sm">
                      {idx+1}
                    </span>
                    <h3 className="text-xl font-bold uppercase text-slate-800">{card.title}</h3>
                    <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">
                      {card.type}
                    </span>
                 </div>
                 <div className="pl-11">
                   {card.text ? (
                     <p className="text-lg leading-relaxed whitespace-pre-wrap font-medium text-slate-900 font-serif">
                       {card.text}
                     </p>
                   ) : (
                     <p className="text-slate-300 italic">
                       (Dieser Teil ist noch leer...)
                     </p>
                   )}
                 </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t-2 border-slate-200 break-inside-avoid flex justify-between items-center text-slate-400 text-sm">
            <p className="italic">Erstellt mit der Grundrechte-Kids Web App</p>
            <p>Seite 1 von 1</p>
          </div>

        </div>
      </div>
    </div>
  );
};