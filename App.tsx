
import React, { useState, useRef } from 'react';
import { analyzeFashion, generateRecreationImage } from './services/geminiService';
import { OutfitAnalysis, AppState } from './types';
import { CameraIcon, UploadIcon, LoaderIcon, CheckCircleIcon, AlertCircleIcon, DownloadIcon } from './components/Icons';

const BRANDS = [
  'Nike', 'Essentials', 'Fear of God', 'Adidas', 'Puma', 'Zara', 'H&M', 'Uniqlo',
  'Gucci', 'Prada', 'Louis Vuitton', 'Dior', 'Balenciaga', 'Jordan', 'Converse', 
  'Vans', 'New Balance', 'Asics', 'Reebok', 'The North Face', 'Champion',
  'Levi\'s', 'Calvin Klein', 'Tommy Hilfiger', 'Ralph Lauren', 'Lacoste', 'Stussy',
  'Supreme', 'Off-White', 'Palm Angels', 'Vetements', 'Chrome Hearts'
];

const highlightBrands = (text: string) => {
  if (!text) return text;
  const regex = new RegExp(`(${BRANDS.join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    const isBrand = BRANDS.some(brand => brand.toLowerCase() === part.toLowerCase());
    if (isBrand) {
      return (
        <span key={i} className="text-black font-black underline decoration-neutral-300 underline-offset-2">
          {part}
        </span>
      );
    }
    return part;
  });
};

const SectionHeader = ({ title }: { title: string }) => (
  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300 border-b border-neutral-100 pb-3 mb-6">{title}</h4>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start gap-4 border-b border-neutral-50 py-4 last:border-0">
    <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest pt-1">{label}</span>
    <span className="text-xs font-bold text-neutral-700 text-right leading-snug flex-1">
      {highlightBrands(value)}
    </span>
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [recreatedImage, setRecreatedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        processImage(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setState(AppState.ANALYZING);
    setError(null);
    setAnalysis(null);
    setRecreatedImage(null);

    try {
      const result = await analyzeFashion(base64);
      setAnalysis(result);
      
      setState(AppState.GENERATING_IMAGE);
      const generated = await generateRecreationImage(result.recreationPrompt);
      setRecreatedImage(generated);
      
      setState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError("Gagal menganalisis gambar. Pastikan item pakaian terlihat jelas dan coba lagi.");
      setState(AppState.ERROR);
    }
  };

  const handleDownload = () => {
    if (!recreatedImage) return;
    const link = document.createElement('a');
    link.href = recreatedImage;
    link.download = `chiclens-lookbook-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setState(AppState.IDLE);
    setImagePreview(null);
    setAnalysis(null);
    setRecreatedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center pb-20 text-neutral-900 selection:bg-black selection:text-white">
      {/* Header - Minimalist & Fixed */}
      <header className="w-full bg-white/90 backdrop-blur-xl border-b border-neutral-100 py-6 px-8 flex flex-col items-center sticky top-0 z-30 transition-all">
        <div className="max-w-7xl w-full flex items-center justify-between">
          <div className="flex items-baseline gap-2 cursor-pointer" onClick={reset}>
            <h1 className="text-xl font-black tracking-tighter italic">CHICLENS.</h1>
            <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-[0.4em]">Visual Lab</span>
          </div>
          {state !== AppState.IDLE && (
            <button 
              onClick={reset}
              className="px-6 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              New Scan
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl w-full px-8 mt-16 flex-grow">
        {state === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="max-w-2xl w-full">
              <h2 className="text-7xl font-black tracking-tighter leading-[0.9] mb-8 text-neutral-950">
                TRANSFORM <br/> YOUR STYLE <br/> INTO ART.
              </h2>
              <p className="text-neutral-400 font-medium mb-12 tracking-tight text-lg">
                AI visual styling engine for clean fashion breakdown and flat-lay synthesis.
              </p>
              
              <div className="relative group cursor-pointer inline-block">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 z-10 cursor-pointer" 
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
                <div className="bg-neutral-950 text-white px-12 py-6 rounded-3xl shadow-2xl group-hover:bg-neutral-800 transition-all flex items-center gap-4">
                  <UploadIcon className="w-6 h-6" />
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Upload Lookbook</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-left w-full mt-32 border-t border-neutral-100 pt-16">
              <Feature text="Accurate Branding" sub="Mendeteksi logo brand seperti Nike, Essentials, dan lainnya." />
              <Feature text="Flat-Lay Synthesis" sub="Merekonstruksi outfit ke dalam tata letak studio yang rapi." />
              <Feature text="Material Analysis" sub="Membedah tekstur kain dan material aksesoris secara detail." />
            </div>
          </div>
        )}

        {(state === AppState.ANALYZING || state === AppState.GENERATING_IMAGE) && (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 border-2 border-neutral-100 rounded-full"></div>
               <div className="absolute inset-0 border-2 border-t-black border-transparent rounded-full animate-spin"></div>
               <CameraIcon className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-xl font-black mt-8 tracking-widest uppercase">
              {state === AppState.ANALYZING ? "Processing Vision" : "Synthesizing Look"}
            </h2>
            <p className="text-neutral-400 mt-2 font-medium text-sm">Decoding aesthetic DNA and branding...</p>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-300">
            <div className="bg-red-50 text-red-500 p-6 rounded-full mb-6">
              <AlertCircleIcon className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Analysis Failed</h2>
            <p className="text-neutral-500 mt-2 max-w-sm font-medium">{error}</p>
            <button 
              onClick={reset}
              className="mt-10 px-10 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all shadow-xl shadow-black/20"
            >
              Retry
            </button>
          </div>
        )}

        {state === AppState.RESULT && analysis && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* Split Page Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 px-0 overflow-hidden rounded-[3rem] border border-neutral-100 shadow-2xl shadow-neutral-200/50 bg-neutral-50">
              
              {/* Left Column: Input Image */}
              <div className="bg-white p-12 flex flex-col gap-8 border-r border-neutral-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">Ref. Image</span>
                  <div className="px-3 py-1 bg-neutral-50 rounded-full text-[9px] font-bold text-neutral-400 uppercase tracking-widest border border-neutral-100">Source</div>
                </div>
                <div className="rounded-[2rem] overflow-hidden shadow-sm bg-neutral-50 flex-grow group">
                  <img src={imagePreview!} alt="Original" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">{analysis.styleCategory}</span>
                  <span className="px-4 py-2 border border-neutral-200 text-neutral-500 text-[9px] font-bold uppercase tracking-widest rounded-lg">{analysis.aestheticVibe}</span>
                </div>
              </div>

              {/* Right Column: AI Synthesis (The Flat Lay) */}
              <div className="bg-white p-12 flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">AI Synthesis</span>
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircleIcon className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Verified Layout</span>
                  </div>
                </div>
                <div className="relative rounded-[2rem] overflow-hidden bg-white flex-grow group border border-neutral-50 shadow-inner">
                  {recreatedImage ? (
                    <>
                      <img src={recreatedImage} alt="Generated" className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" />
                      <button 
                        onClick={handleDownload}
                        className="absolute bottom-6 right-6 bg-black text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 translate-y-2 group-hover:translate-y-0"
                      >
                        <DownloadIcon className="w-6 h-6" />
                      </button>
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-50">
                        <LoaderIcon className="w-8 h-8 text-neutral-200 mb-4" />
                        <span className="text-[10px] uppercase font-black text-neutral-300 tracking-[0.2em] animate-pulse">Synthesizing Flat-Lay...</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleDownload}
                  disabled={!recreatedImage}
                  className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Save Lookbook Page
                </button>
              </div>
            </div>

            {/* Bottom Data Grid */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
              
              <div className="space-y-10">
                <SectionHeader title="Garment Breakdown" />
                <div className="space-y-0">
                  <DetailRow label="Atasan" value={analysis.breakdown.top} />
                  <DetailRow label="Bawahan" value={analysis.breakdown.bottom} />
                  <DetailRow label="Alas Kaki" value={analysis.breakdown.footwear} />
                  <DetailRow label="Aksesoris" value={analysis.breakdown.accessories} />
                </div>
              </div>

              <div className="space-y-10">
                <SectionHeader title="Color & Texture" />
                <div className="space-y-10">
                   <div className="flex flex-wrap gap-4">
                      {analysis.colorPalette.map((color, i) => (
                        <div key={i} className="group flex flex-col items-center gap-2">
                          <div 
                            className="w-12 h-12 rounded-2xl border border-neutral-100 shadow-sm transition-transform group-hover:-translate-y-1" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">{color}</span>
                        </div>
                      ))}
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {analysis.materialHighlights.map((m, i) => (
                        <span key={i} className="text-[10px] font-black text-neutral-800 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-100 uppercase tracking-widest">
                          {m}
                        </span>
                      ))}
                   </div>
                </div>
              </div>

              <div className="space-y-10">
                <SectionHeader title="Aesthetic Engine" />
                <div className="p-8 bg-neutral-950 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <span className="text-[10rem] font-black text-white leading-none -tracking-widest select-none">AI</span>
                  </div>
                  <div className="relative z-10">
                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.4em] block mb-4">Prompt Analysis</span>
                    <p className="text-xs text-neutral-300 leading-relaxed italic font-medium">
                      "{analysis.recreationPrompt}"
                    </p>
                  </div>
                </div>
                <p className="text-[9px] text-neutral-400 leading-relaxed font-medium">
                  *Our neural engine meticulously analyzed every pixel to reconstruct this layout. Brand accuracy and textural fidelity are prioritized.
                </p>
              </div>

            </div>
          </div>
        )}
      </main>

      <footer className="mt-40 w-full max-w-7xl px-8 border-t border-neutral-50 pt-16 flex flex-col md:flex-row justify-between items-start gap-12 mb-20 opacity-50">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-black uppercase tracking-[0.4em]">CHICLENS INTELLIGENCE</p>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Visual Reconstruction Lab &copy; 2025</p>
        </div>
        <div className="flex flex-wrap gap-12 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-900">
          <span className="cursor-pointer hover:opacity-50 transition-opacity">Philosophy</span>
          <span className="cursor-pointer hover:opacity-50 transition-opacity">Neural Engine</span>
          <span className="cursor-pointer hover:opacity-50 transition-opacity">Privacy</span>
          <span className="text-neutral-300">v.1.4.0</span>
        </div>
      </footer>
    </div>
  );
};

const Feature = ({ text, sub }: { text: string; sub: string }) => (
  <div className="space-y-3">
    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">{text}</h4>
    <p className="text-xs text-neutral-400 font-medium leading-relaxed">{sub}</p>
  </div>
);

export default App;
