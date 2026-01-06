import React, { useState, useRef } from 'react';
import { GardenStyle, GardenPreferences, GardenPlan } from './types';
import { generateGardenPlan, generateInitialGardenImage } from './services/geminiService';
import { GardenEditor } from './components/GardenEditor';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
  const [preferences, setPreferences] = useState<GardenPreferences>({
    style: GardenStyle.COTTAGE,
    size: 'Medium Backyard',
    climate: 'Sunny',
    features: [],
    description: '',
  });
  
  const [plan, setPlan] = useState<GardenPlan | null>(null);
  const [initialImage, setInitialImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const toggleFeature = (feature: string) => {
    setPreferences(prev => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists 
          ? prev.features.filter(f => f !== feature)
          : [...prev.features, feature]
      };
    });
  };

  const handleGenerate = async () => {
    setStep('generating');
    setError(null);
    try {
      // Run both generations in parallel for speed
      const [generatedPlan, generatedImage] = await Promise.all([
        generateGardenPlan(preferences),
        generateInitialGardenImage(preferences)
      ]);
      
      setPlan(generatedPlan);
      setInitialImage(generatedImage);
      setStep('result');
    } catch (err) {
      console.error(err);
      setError("We encountered an issue designing your garden. Please check your connection and try again.");
      setStep('input');
    }
  };

  const commonFeatures = ['Pond', 'Fire Pit', 'Vegetable Patch', 'Pergola', 'Pathway', 'Fountain', 'Hammock', 'Rock Garden'];

  return (
    <div className="min-h-screen bg-garden-50 text-gray-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setStep('input')}>
             <span className="text-3xl">🌿</span>
             <h1 className="text-2xl font-serif font-bold text-garden-800">Dream Garden AI</h1>
          </div>
          {step === 'result' && (
             <button 
                onClick={() => setStep('input')}
                className="text-sm font-medium text-garden-600 hover:text-garden-800"
             >
                Start Over
             </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Error Message */}
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {/* Step 1: Input Form */}
        {step === 'input' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
             <div className="bg-garden-600 p-6 sm:p-10 text-white">
                <h2 className="text-3xl font-serif font-bold mb-2">Design Your Sanctuary</h2>
                <p className="text-garden-100 text-lg">Tell us about your space and preferences, and we'll visualize it for you.</p>
             </div>
             
             <div className="p-6 sm:p-10 space-y-8">
                {/* Style & Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Garden Style</label>
                        <select 
                            name="style" 
                            value={preferences.style}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-garden-500 outline-none"
                        >
                            {Object.values(GardenStyle).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Approximate Size</label>
                         <input 
                            type="text" 
                            name="size" 
                            value={preferences.size} 
                            onChange={handleInputChange}
                            placeholder="e.g. 20x30ft, Small balcony"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-garden-500 outline-none"
                         />
                    </div>
                </div>

                {/* Climate */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Local Climate / Environment</label>
                     <input 
                        type="text" 
                        name="climate" 
                        value={preferences.climate} 
                        onChange={handleInputChange}
                        placeholder="e.g. Sunny California, Rainy Seattle, Zone 6"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-garden-500 outline-none"
                     />
                </div>

                {/* Features */}
                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Desired Features</label>
                     <div className="flex flex-wrap gap-2">
                        {commonFeatures.map(feature => (
                            <button
                                key={feature}
                                onClick={() => toggleFeature(feature)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    preferences.features.includes(feature)
                                    ? 'bg-garden-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {preferences.features.includes(feature) ? '✓ ' : '+ '}{feature}
                            </button>
                        ))}
                     </div>
                </div>

                {/* Additional Description */}
                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Specific Ideas or Requests</label>
                     <textarea 
                        name="description" 
                        value={preferences.description} 
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="e.g. I want lots of purple flowers and a place for my kids to play."
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-garden-500 outline-none resize-none"
                     />
                </div>

                {/* Action */}
                <div className="pt-4">
                    <button 
                        onClick={handleGenerate}
                        className="w-full py-4 bg-garden-600 hover:bg-garden-700 text-white rounded-xl text-lg font-bold shadow-lg transform transition hover:-translate-y-1"
                    >
                        Generate My Garden
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* Step 2: Generating */}
        {step === 'generating' && (
             <div className="flex flex-col items-center justify-center min-h-[50vh]">
                 <LoadingSpinner message="Planting seeds of imagination... This may take a moment." />
             </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && plan && initialImage && (
            <div className="space-y-8 animate-fade-in-up">
                
                {/* Visuals Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-serif font-bold text-garden-800">Visualizer</h2>
                        <span className="bg-garden-100 text-garden-800 text-xs px-3 py-1 rounded-full uppercase tracking-wide font-bold">Interactive</span>
                     </div>
                     <p className="text-gray-600 mb-4">
                        This is an AI visualization of your {preferences.style} garden. <br/>
                        <span className="font-semibold text-garden-600">Want to change something?</span> Type below to add features, change weather, or adjust the style instantly.
                     </p>
                     
                     <GardenEditor initialImage={initialImage} />
                </div>

                {/* Plan Details */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-garden-800 p-6 text-white">
                        <h2 className="text-3xl font-serif font-bold">{plan.title}</h2>
                        <p className="opacity-90 mt-2 italic">{preferences.style} • {preferences.size}</p>
                    </div>
                    
                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Layout */}
                        <section>
                            <h3 className="text-xl font-bold text-garden-800 mb-3 flex items-center">
                                <span className="bg-garden-200 p-2 rounded-lg mr-3 text-2xl">🗺️</span> 
                                Layout Strategy
                            </h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{plan.layoutDescription}</p>
                        </section>

                        <div className="border-t border-gray-100 my-4"></div>

                        {/* Plants */}
                        <section>
                             <h3 className="text-xl font-bold text-garden-800 mb-4 flex items-center">
                                <span className="bg-garden-200 p-2 rounded-lg mr-3 text-2xl">🌱</span> 
                                Recommended Plants
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.plants.map((plant, idx) => (
                                    <div key={idx} className="bg-garden-50 p-4 rounded-xl border border-garden-100 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-garden-900">{plant.name}</h4>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                plant.careLevel === 'Easy' ? 'bg-green-200 text-green-800' :
                                                plant.careLevel === 'Moderate' ? 'bg-yellow-200 text-yellow-800' :
                                                'bg-orange-200 text-orange-800'
                                            }`}>
                                                {plant.careLevel} Care
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 italic mb-2">{plant.scientificName}</p>
                                        <p className="text-sm text-gray-700">{plant.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                         <div className="border-t border-gray-100 my-4"></div>

                        {/* Maintenance */}
                        <section>
                            <h3 className="text-xl font-bold text-garden-800 mb-3 flex items-center">
                                <span className="bg-garden-200 p-2 rounded-lg mr-3 text-2xl">🧤</span> 
                                Care & Maintenance
                            </h3>
                            <ul className="space-y-2">
                                {plan.maintenanceTips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start text-gray-700">
                                        <span className="text-garden-500 mr-2 mt-1">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
