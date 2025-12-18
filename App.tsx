
import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Send, Copy, RefreshCw, Check, Sparkles, Instagram, Music, Quote, X, Languages } from 'lucide-react';
import { SocialPlatform, ToneType, GenerationResult, MediaFile, Language } from './types';
import { generateSocialContent } from './services/geminiService';
import Button from './components/Button';

const App: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.REDNOTE);
  const [tone, setTone] = useState<ToneType>(ToneType.ORAL);
  const [language, setLanguage] = useState<Language>(Language.CHINESE);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newMedia = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image' as const,
      file
    }));
    
    setMediaList(prev => [...prev, ...newMedia]);
    setResult(null);
    
    // Reset input value so the same file can be uploaded again if needed
    if (e.target) e.target.value = '';
  };

  const removeMedia = (id: string) => {
    setMediaList(prev => {
      const filtered = prev.filter(m => m.id !== id);
      const target = prev.find(m => m.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return filtered;
    });
    setResult(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (mediaList.length === 0) return;
    
    setIsProcessing(true);
    try {
      const mediaParts = await Promise.all(
        mediaList.map(async (m) => ({
          data: await fileToBase64(m.file),
          mimeType: m.file.type
        }))
      );
      const data = await generateSocialContent(mediaParts, platform, tone, language);
      setResult(data);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const fullText = `${result.caption}\n\n${result.hashtags.map(tag => `#${tag}`).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    mediaList.forEach(m => URL.revokeObjectURL(m.url));
    setMediaList([]);
    setResult(null);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const PlatformIcon = ({ p }: { p: SocialPlatform }) => {
    switch (p) {
      case SocialPlatform.REDNOTE: return <Quote className="w-5 h-5 text-rose-500" />;
      case SocialPlatform.INSTAGRAM: return <Instagram className="w-5 h-5 text-purple-600" />;
      case SocialPlatform.TIKTOK: return <Music className="w-5 h-5 text-cyan-500" />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-slate-800">SocialMuse AI</h1>
        </div>
        {mediaList.length > 0 && (
          <button onClick={reset} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="flex-1 p-5 space-y-6 pb-32">
        {/* Gallery Section */}
        {mediaList.length === 0 ? (
          <div className="h-[400px] border-2 border-dashed border-slate-200 rounded-[32px] bg-white flex flex-col items-center justify-center p-8 text-center space-y-4 group hover:border-rose-300 transition-colors cursor-pointer"
               onClick={triggerUpload}>
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-lg">Create Your Story</p>
              <p className="text-sm text-slate-400 mt-1 px-4">Upload multiple photos or videos of your daily life</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Horizontal Gallery */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {mediaList.map((m) => (
                <div key={m.id} className="relative flex-none w-64 aspect-[3/4] rounded-[24px] overflow-hidden bg-slate-200 snap-center shadow-md">
                  {m.type === 'image' ? (
                    <img src={m.url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={m.url} className="w-full h-full object-cover" />
                  )}
                  <button 
                    onClick={() => removeMedia(m.id)}
                    className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={triggerUpload}
                className="flex-none w-32 aspect-[3/4] rounded-[24px] border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-rose-300 hover:text-rose-400 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-widest">ADD MORE</span>
              </button>
            </div>

            {/* Config Section */}
            {!result && !isProcessing && (
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(SocialPlatform).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`py-3 px-2 rounded-xl text-xs font-medium transition-all border-2 flex flex-col items-center gap-2 ${
                          platform === p ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <PlatformIcon p={p} />
                        {p.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Languages className="w-3 h-3" /> Language
                    </label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl text-sm font-medium focus:border-rose-500 focus:outline-none appearance-none"
                    >
                      {Object.values(Language).map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content Tone</label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value as ToneType)}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl text-sm font-medium focus:border-rose-500 focus:outline-none appearance-none"
                    >
                      {Object.values(ToneType).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="bg-white rounded-[24px] p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Analyzing {mediaList.length} items...</p>
                  <p className="text-sm text-slate-400 mt-1 italic">Drafting your {language} story</p>
                </div>
              </div>
            )}

            {/* Result Section */}
            {result && (
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full w-fit">
                  <Check className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Theme: {result.identifiedItem}</span>
                </div>
                
                <textarea 
                  className="w-full min-h-[160px] bg-transparent text-slate-700 text-sm leading-relaxed focus:outline-none resize-none border-0 p-0"
                  value={result.caption}
                  onChange={(e) => setResult({...result, caption: e.target.value})}
                />
                
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-blue-500 text-xs font-medium">#{tag}</span>
                  ))}
                </div>

                <div className="pt-4 flex gap-2">
                  <Button variant="primary" fullWidth onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Draft'}
                  </Button>
                  <Button variant="outline" onClick={handleGenerate}>
                    <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Single shared file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple
        accept="image/*,video/*" 
        onChange={handleFileUpload}
      />

      {/* Persistent CTA Bar */}
      {mediaList.length > 0 && !isProcessing && !result && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/95 to-transparent z-30 flex justify-center max-w-md mx-auto">
          <Button fullWidth onClick={handleGenerate} className="py-4 text-lg">
            <Send className="w-5 h-5" />
            Generate {language} Post
          </Button>
        </div>
      )}

      {mediaList.length === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button 
            onClick={triggerUpload}
            className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-black transition-all active:scale-90"
          >
            <Camera className="w-8 h-8" />
          </button>
        </div>
      )}
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
