import React, { useState } from 'react';
import { editGardenImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface GardenEditorProps {
  initialImage: string;
}

export const GardenEditor: React.FC<GardenEditorProps> = ({ initialImage }) => {
  const [currentImage, setCurrentImage] = useState<string>(initialImage);
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<string[]>([initialImage]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsEditing(true);
    try {
      const newImage = await editGardenImage(currentImage, prompt);
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImage);
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentImage(newImage);
      setPrompt('');
    } catch (error) {
      console.error(error);
      alert("Failed to edit the image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentImage(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentImage(history[historyIndex + 1]);
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="relative group rounded-xl overflow-hidden shadow-xl border-4 border-white bg-gray-100 min-h-[300px] flex items-center justify-center">
        {isEditing ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm">
                 <LoadingSpinner message="Applying your changes..." />
            </div>
        ) : null}
        
        <img 
          src={currentImage} 
          alt="Garden Design" 
          className="w-full h-auto object-cover max-h-[600px]"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={undo} 
                disabled={historyIndex === 0}
                className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white disabled:opacity-50 text-gray-700"
                title="Undo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
            </button>
            <button 
                onClick={redo} 
                disabled={historyIndex === history.length - 1}
                className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white disabled:opacity-50 text-gray-700"
                title="Redo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
                </svg>
            </button>
        </div>
      </div>

      <form onSubmit={handleEdit} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl shadow-sm border border-garden-100">
        <div className="flex-1 relative">
            <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe changes (e.g., 'Add a stone pathway', 'Make it sunset')"
            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garden-500 focus:border-transparent outline-none transition-all"
            disabled={isEditing}
            />
        </div>
        <button
          type="submit"
          disabled={isEditing || !prompt.trim()}
          className="bg-garden-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-garden-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
        >
          {isEditing ? 'Editing...' : 'Update Visuals'}
          {!isEditing && (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
          )}
        </button>
      </form>
    </div>
  );
};
