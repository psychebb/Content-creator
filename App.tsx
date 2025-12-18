
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Trash2, Send, Copy, RefreshCw, Check, Sparkles, Instagram, Music, Quote } from 'lucide-react';
import { SocialPlatform, ToneType, GenerationResult, MediaFile } from './types';
import { generateSocialContent } from './services/geminiService';
import Button from './components/Button';

const App: React.FC = () => {
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.REDNOTE);
  const [tone, setTone] = useState<ToneType>(ToneType.ORAL);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMedia({
        url,
        type: file.type.startsWith('video') ? 'video' : 'image',
        file
      });
      setResult(null);
    }
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
    if (!media) return;
    
    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(media.file);
      const data = await generateSocialContent(base64, media.file.type, platform, tone);
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
    setMedia(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        {media && (
          <button onClick={reset} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="flex-1 p-5 space-y-6 pb-32">
        {/* Upload Section */}
        {!media ? (
          <div className="h-[400px] border-2 border-dashed border-slate-200 rounded-[32px] bg-white flex flex-col items-center justify-center p-8 text-center space-y-4 group hover:border-rose-300 transition-colors cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Tap to upload</p>
              <p className="text-sm text-slate-400 mt-1">Photos or videos of your daily life</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*" 
              onChange={handleFileUpload}
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Preview Card */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-black aspect-[3/4] flex items-center justify-center">
              {media.type === 'image' ? (
                <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <video src={media.url} className="w-full h-full object-cover" controls />
              )}
            </div>

            {/* Config Section */}
            {!result && !isProcessing && (
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content Tone</label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value as ToneType)}
                    className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl text-sm font-medium focus:border-rose-500 focus:outline-none"
                  >
                    {Object.values(ToneType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
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
                  <p className="font-bold text-slate-800">AI is scanning your material...</p>
                  <p className="text-sm text-slate-400 mt-1 italic">Identifying items & drafting your oral caption</p>
                </div>
              </div>
            )}

            {/* Result Section */}
            {result && (
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full w-fit">
                  <Check className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Identified: {result.identifiedItem}</span>
                </div>
                
                <textarea 
                  className="w-full min-h-[120px] bg-transparent text-slate-700 text-sm leading-relaxed focus:outline-none resize-none"
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
                    {copied ? 'Copied!' : 'Copy Post'}
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

      {/* Persistent CTA Bar */}
      {media && !isProcessing && !result && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/95 to-transparent z-30 flex justify-center max-w-md mx-auto">
          <Button fullWidth onClick={handleGenerate} className="py-4 text-lg">
            <Send className="w-5 h-5" />
            Create AI Content
          </Button>
        </div>
      )}

      {!media && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-black transition-all active:scale-90"
          >
            <Camera className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
