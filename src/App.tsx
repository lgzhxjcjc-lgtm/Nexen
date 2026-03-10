import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Youtube, Download, Sparkles, TrendingUp, BarChart2, Hash, FileText, Loader2, Play, Activity, LayoutTemplate, Wand2, History, Trash2, Key, Search, Zap, Target, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type HistoryItem = {
  id: string;
  type: 'visual' | 'autothumb' | 'seo' | 'keyword';
  title: string;
  imageUrl?: string;
  seoData?: any;
  timestamp: number;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'visual' | 'autothumb' | 'seo' | 'keyword' | 'history'>('visual');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Visual Studio State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Auto Thumbnail State
  const [thumbTitle, setThumbTitle] = useState('');
  const [thumbSubject, setThumbSubject] = useState('');
  const [thumbBackground, setThumbBackground] = useState('');
  const [thumbColor, setThumbColor] = useState('High Contrast & Vibrant');
  const [thumbLighting, setThumbLighting] = useState('Cinematic Studio Lighting');
  const [thumbEmotion, setThumbEmotion] = useState('Shocking / Urgent');
  const [thumbCamera, setThumbCamera] = useState('Dynamic / Action Angle');
  const [thumbRender, setThumbRender] = useState('Hyper-Realistic Photography');
  const [thumbSuggestions, setThumbSuggestions] = useState('');
  const [thumbStyle, setThumbStyle] = useState('MrBeast Style (High Contrast, Bright, Engaging)');
  const [thumbBaseImage, setThumbBaseImage] = useState<string | null>(null);
  const [generatedAutoThumb, setGeneratedAutoThumb] = useState<string | null>(null);
  const [isGeneratingAutoThumb, setIsGeneratingAutoThumb] = useState(false);

  // SEO Analyzer State
  const [seoUrl, setSeoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [seoData, setSeoData] = useState<any | null>(null);

  // Keyword Magic State
  const [seedKeyword, setSeedKeyword] = useState('');
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [keywordData, setKeywordData] = useState<any | null>(null);

  // --- History Functions ---
  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prev => [{
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    }, ...prev]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // --- Download Helper ---
  const downloadBase64 = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Visual Studio Functions ---
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleFetchThumbnail = () => {
    const videoId = extractVideoId(youtubeUrl);
    if (videoId) {
      const url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      setThumbnailUrl(url);
      addToHistory({
        type: 'visual',
        title: `Extracted Thumbnail: ${videoId}`,
        imageUrl: url
      });
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) return alert("Please enter a prompt to generate or edit the image.");
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    
    try {
      let parts: any[] = [{ text: prompt }];
      
      if (uploadedImage) {
        const [prefix, base64Data] = uploadedImage.split(',');
        const mimeType = prefix.split(':')[1].split(';')[0];
        parts.unshift({
          inlineData: { data: base64Data, mimeType }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const b64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          setGeneratedImage(b64);
          addToHistory({
            type: 'visual',
            title: `AI Generated: ${prompt.substring(0, 30)}...`,
            imageUrl: b64
          });
          break;
        }
      }
    } catch (error) {
      console.error("Image generation error:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- Auto Thumbnail Functions ---
  const handleThumbBaseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbBaseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAutoThumb = async () => {
    if (!thumbTitle) return alert("Please enter the Video Title to analyze and generate the thumbnail.");
    setIsGeneratingAutoThumb(true);
    setGeneratedAutoThumb(null);
    
    try {
      const finalPrompt = `You are an elite, world-class YouTube thumbnail designer. Create an ultra-realistic, highly engaging YouTube thumbnail.
      Video Title: "${thumbTitle}"
      Main Subject: "${thumbSubject || 'Relevant to title'}"
      Background: "${thumbBackground || 'Relevant to title'}"
      Style: "${thumbStyle}"
      Color Palette: "${thumbColor}"
      Lighting: "${thumbLighting}"
      Vibe/Emotion: "${thumbEmotion}"
      Camera Angle/Shot: "${thumbCamera}"
      Render/Medium: "${thumbRender}"
      ${thumbSuggestions ? `Additional Elements: "${thumbSuggestions}"` : ''}
      
      CRITICAL INSTRUCTIONS:
      - The image MUST be 16:9 aspect ratio.
      - Make it extremely eye-catching with high click-through rate (CTR) potential.
      - Use hyper-realistic textures, dramatic depth of field, and perfect composition.
      - Focus on visual storytelling that makes viewers want to click immediately.`;
      
      let parts: any[] = [{ text: finalPrompt }];
      
      if (thumbBaseImage) {
        const [prefix, base64Data] = thumbBaseImage.split(',');
        const mimeType = prefix.split(':')[1].split(';')[0];
        parts.unshift({
          inlineData: { data: base64Data, mimeType }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          // @ts-ignore
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const b64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          setGeneratedAutoThumb(b64);
          addToHistory({
            type: 'autothumb',
            title: `Auto Thumb: ${thumbTitle}`,
            imageUrl: b64
          });
          break;
        }
      }
    } catch (error) {
      console.error("Auto Thumbnail generation error:", error);
      alert("Failed to generate thumbnail. Please try again.");
    } finally {
      setIsGeneratingAutoThumb(false);
    }
  };

  // --- SEO Analyzer Functions ---
  const handleAnalyzeVideo = async () => {
    if (!seoUrl) return alert("Please enter a YouTube URL to analyze.");
    setIsAnalyzing(true);
    setSeoData(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze this YouTube video URL: ${seoUrl}.
        1. Provide a detailed analysis of what the video is about based on search/context.
        2. Generate highly optimized, viral SEO metadata for it.
        Return ONLY a JSON object with this exact structure:
        {
          "analysis": "Detailed summary of the video content and strategy...",
          "titles": [{"text": "Viral Title 1", "rank": 99}, {"text": "Viral Title 2", "rank": 95}, {"text": "Viral Title 3", "rank": 90}],
          "descriptions": [{"text": "SEO Description 1...", "rank": 98}, {"text": "SEO Description 2...", "rank": 92}],
          "hashtags": [{"text": "#viral", "rank": 99}, {"text": "#trending", "rank": 95} /* 10 hashtags total */],
          "keywords": [{"text": "long tail keyword 1", "rank": 99}, {"text": "search phrase 2", "rank": 94} /* 10 keywords total */]
        }
        Note: 'rank' should be a score out of 100 indicating predicted viral performance and search ranking potential.`,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      const data = JSON.parse(response.text || "{}");
      setSeoData(data);
      addToHistory({
        type: 'seo',
        title: `SEO Analysis: ${seoUrl}`,
        seoData: data
      });
    } catch (error) {
      console.error("SEO analysis error:", error);
      alert("Failed to analyze video. Please check the URL and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Keyword Magic Functions ---
  const handleGenerateKeywords = async () => {
    if (!seedKeyword) return alert("Please enter a keyword or topic.");
    setIsGeneratingKeywords(true);
    setKeywordData(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Act as an elite SEO expert and viral content strategist. Analyze the current trends for the keyword/topic: "${seedKeyword}" across YouTube, Google, and all social media platforms.
        Generate highly optimized, viral SEO metadata designed to rank #1 and go viral.
        Return ONLY a JSON object with this exact structure:
        {
          "analysis": "Detailed analysis of why this topic is trending across social media, what audiences are looking for, and how to exploit the algorithm...",
          "titles": [{"text": "Viral Title 1", "rank": 99}, {"text": "Viral Title 2", "rank": 96}, {"text": "Viral Title 3", "rank": 92}, {"text": "Viral Title 4", "rank": 89}],
          "descriptions": [{"text": "SEO Description 1...", "rank": 98}, {"text": "SEO Description 2...", "rank": 94}, {"text": "SEO Description 3...", "rank": 90}],
          "hashtags": [{"text": "#viral", "rank": 99}, {"text": "#trending", "rank": 95} /* 15 hashtags total */],
          "keywords": [{"text": "long tail keyword 1", "rank": 99}, {"text": "search phrase 2", "rank": 94} /* 15 keywords total */]
        }
        Note: 'rank' should be a score out of 100 indicating predicted viral performance and search ranking potential.`,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      const data = JSON.parse(response.text || "{}");
      setKeywordData(data);
      addToHistory({
        type: 'keyword',
        title: `Viral SEO: ${seedKeyword}`,
        seoData: data
      });
    } catch (error) {
      console.error("Keyword generation error:", error);
      alert("Failed to generate keywords. Please try again.");
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  // --- Helper Components ---
  const RankBar = ({ rank }: { rank: number }) => {
    const getColor = (r: number) => {
      if (r >= 95) return 'from-emerald-400 to-cyan-500';
      if (r >= 85) return 'from-yellow-400 to-orange-500';
      return 'from-red-400 to-pink-500';
    };

    return (
      <div className="flex items-center gap-3 mt-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${rank}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${getColor(rank)} rounded-full`}
          />
        </div>
        <span className="text-xs font-bold text-gray-300 w-12 text-right">Rank {rank}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 pt-8 pb-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-cyan-400 mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Premium Creator Suite
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Nexus <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text">Hub</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The ultimate AI-powered toolkit for YouTube creators. Generate stunning visuals, uncover viral SEO secrets, and track your history.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'visual' 
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-white shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            Visual Studio
          </button>
          <button
            onClick={() => setActiveTab('autothumb')}
            className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'autothumb' 
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 text-white shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutTemplate className="w-5 h-5" />
            Auto Thumbnail
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'seo' 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-pink-500/50 text-white shadow-[0_0_30px_rgba(236,72,153,0.15)]' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            SEO Analyzer
          </button>
          <button
            onClick={() => setActiveTab('keyword')}
            className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'keyword' 
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 text-white shadow-[0_0_30px_rgba(234,179,8,0.15)]' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Zap className="w-5 h-5" />
            Viral Keywords
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'history' 
                ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 text-white shadow-[0_0_30px_rgba(249,115,22,0.15)]' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <History className="w-5 h-5" />
            History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ========================================== */}
          {/* TAB 1: VISUAL STUDIO                       */}
          {/* ========================================== */}
          {activeTab === 'visual' && (
            <motion.div
              key="visual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f0f13]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-10"
            >
              {/* 1. YouTube Thumbnail Downloader */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Youtube className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Thumbnail Extractor</h2>
                    <p className="text-sm text-gray-400">Download high-res thumbnails from any video</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Paste YouTube URL here..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600 text-lg"
                  />
                  <button
                    onClick={handleFetchThumbnail}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl px-8 py-4 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                  >
                    <Download className="w-5 h-5" />
                    Extract
                  </button>
                </div>

                {thumbnailUrl && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 rounded-2xl overflow-hidden border border-white/10 bg-black/50 aspect-video relative group shadow-2xl"
                  >
                    <img src={thumbnailUrl} alt="YouTube Thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <a
                        href={thumbnailUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all hover:scale-105"
                      >
                        <Download className="w-5 h-5" />
                        Open High-Res
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

              {/* 2. AI Image Studio */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">AI Image Studio</h2>
                    <p className="text-sm text-gray-400">Upload a base image and use AI to transform it</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Area */}
                  <label className="block w-full cursor-pointer group h-full">
                    <div className={`h-full min-h-[250px] border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${uploadedImage ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 bg-black/30 group-hover:border-purple-500/30 group-hover:bg-white/5'}`}>
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Uploaded Preview" className="max-h-[200px] object-contain rounded-lg shadow-lg" />
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors" />
                          </div>
                          <p className="text-base font-medium text-gray-300 group-hover:text-white">
                            Upload Base Image
                          </p>
                          <p className="text-sm text-gray-500 mt-2">JPG, PNG, JPEG (Optional)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>

                  {/* Prompt & Action */}
                  <div className="flex flex-col gap-4">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your vision... (e.g., 'Make it look like a cyberpunk city at night with neon lights')"
                      className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600 resize-none text-lg"
                    ></textarea>
                    
                    <button 
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !prompt}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl px-8 py-4 font-bold transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] flex items-center justify-center gap-2 cursor-pointer w-full"
                    >
                      {isGeneratingImage ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating Magic...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Image
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Generated Result */}
                {generatedImage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 rounded-3xl border border-white/10 bg-black/40"
                  >
                    <h3 className="text-lg font-semibold text-pink-400 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Generated Result
                    </h3>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 relative group shadow-2xl">
                      <img src={generatedImage} alt="Generated" className="w-full object-contain max-h-[600px]" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button
                          onClick={() => downloadBase64(generatedImage, 'nexus-generated.png')}
                          className="bg-pink-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all hover:scale-105 cursor-pointer"
                        >
                          <Download className="w-5 h-5" />
                          Download Image
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 2: AUTO THUMBNAIL                      */}
          {/* ========================================== */}
          {activeTab === 'autothumb' && (
            <motion.div
              key="autothumb"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f0f13]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-10"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <LayoutTemplate className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Ultra-Max Thumbnail Creator</h2>
                    <p className="text-sm text-gray-400">Advanced AI analyzes your title to generate a realistic, viral thumbnail</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Advanced Inputs */}
                  <div className="lg:col-span-7 space-y-5 bg-black/20 p-6 rounded-3xl border border-white/5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Video Title (Required)</label>
                      <input
                        type="text"
                        placeholder="e.g., I Survived 50 Hours In Antarctica!"
                        value={thumbTitle}
                        onChange={(e) => setThumbTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600 text-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Main Subject (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., A shocked man pointing"
                          value={thumbSubject}
                          onChange={(e) => setThumbSubject(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Background (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., A burning forest, futuristic city"
                          value={thumbBackground}
                          onChange={(e) => setThumbBackground(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail Style</label>
                        <select
                          value={thumbStyle}
                          onChange={(e) => setThumbStyle(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-gray-200 appearance-none"
                        >
                          <option value="MrBeast Style (High Contrast, Bright, Engaging)">MrBeast Style (High Contrast)</option>
                          <option value="Cinematic (Moody, Dramatic, 4k)">Cinematic (Moody, Dramatic)</option>
                          <option value="Documentary (Gritty, Real, Serious)">Documentary (Gritty, Real)</option>
                          <option value="Gaming (Neon, Energetic, 3D)">Gaming (Neon, Energetic)</option>
                          <option value="Minimalist (Clean, Professional, Apple-style)">Minimalist (Clean, Professional)</option>
                          <option value="Vlog (Realistic, Candid, Bright)">Vlog (Realistic, Candid)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Color Palette</label>
                        <select
                          value={thumbColor}
                          onChange={(e) => setThumbColor(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-gray-200 appearance-none"
                        >
                          <option value="High Contrast & Vibrant">High Contrast & Vibrant</option>
                          <option value="Neon Cyberpunk (Pink/Cyan)">Neon Cyberpunk (Pink/Cyan)</option>
                          <option value="Dark & Moody">Dark & Moody</option>
                          <option value="Warm & Golden Hour">Warm & Golden Hour</option>
                          <option value="Cold & Desaturated">Cold & Desaturated</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Lighting</label>
                        <select
                          value={thumbLighting}
                          onChange={(e) => setThumbLighting(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-gray-200 appearance-none"
                        >
                          <option value="Cinematic Studio Lighting">Cinematic Studio Lighting</option>
                          <option value="Dramatic Backlit (Rim Light)">Dramatic Backlit (Rim Light)</option>
                          <option value="Natural Daylight">Natural Daylight</option>
                          <option value="Harsh Flash Photography">Harsh Flash Photography</option>
                          <option value="Soft Diffused Lighting">Soft Diffused Lighting</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Vibe / Emotion</label>
                        <select
                          value={thumbEmotion}
                          onChange={(e) => setThumbEmotion(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-gray-200 appearance-none"
                        >
                          <option value="Shocking / Urgent">Shocking / Urgent</option>
                          <option value="Mysterious / Intriguing">Mysterious / Intriguing</option>
                          <option value="Happy / Energetic">Happy / Energetic</option>
                          <option value="Sad / Emotional">Sad / Emotional</option>
                          <option value="Educational / Professional">Educational / Professional</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Camera Angle / Shot</label>
                        <select
                          value={thumbCamera}
                          onChange={(e) => setThumbCamera(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-gray-200 appearance-none"
                        >
                          <option value="Dynamic / Action Angle">Dynamic / Action Angle</option>
                          <option value="Extreme Close-Up (Face/Emotion)">Extreme Close-Up (Face/Emotion)</option>
                          <option value="Wide Establishing Shot">Wide Establishing Shot</option>
                          <option value="Drone / Aerial View">Drone / Aerial View</option>
                          <option value="Dutch Angle (Tilted/Uneasy)">Dutch Angle (Tilted/Uneasy)</option>
                          <option value="First Person POV">First Person POV</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Render Engine / Medium</label>
                        <select
                          value={thumbRender}
                          onChange={(e) => setThumbRender(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-gray-200 appearance-none"
                        >
                          <option value="Hyper-Realistic Photography">Hyper-Realistic Photography</option>
                          <option value="Unreal Engine 5 (3D Render)">Unreal Engine 5 (3D Render)</option>
                          <option value="Octane Render (Glossy/Stylized)">Octane Render (Glossy/Stylized)</option>
                          <option value="Digital Illustration (2D Art)">Digital Illustration (2D Art)</option>
                          <option value="Anime / Manga Style">Anime / Manga Style</option>
                          <option value="Claymation / Stop Motion">Claymation / Stop Motion</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Extra Elements (Optional)</label>
                      <textarea
                        value={thumbSuggestions}
                        onChange={(e) => setThumbSuggestions(e.target.value)}
                        placeholder="e.g., Add a glowing red arrow, money flying, explosions..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600 resize-none h-20"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Base Image / Face (Optional)</label>
                      <label className="block w-full cursor-pointer group">
                        <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${thumbBaseImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-black/30 group-hover:border-emerald-500/30 group-hover:bg-white/5'}`}>
                          {thumbBaseImage ? (
                            <img src={thumbBaseImage} alt="Base Preview" className="max-h-[100px] object-contain rounded-lg shadow-lg" />
                          ) : (
                            <div className="flex items-center gap-3">
                              <Upload className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                              <p className="text-sm font-medium text-gray-300 group-hover:text-white">Upload Photo</p>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          className="hidden"
                          onChange={handleThumbBaseImageUpload}
                        />
                      </label>
                    </div>

                    <button 
                      onClick={handleGenerateAutoThumb}
                      disabled={isGeneratingAutoThumb || !thumbTitle}
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl px-8 py-4 font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 cursor-pointer w-full mt-6 text-lg"
                    >
                      {isGeneratingAutoThumb ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Crafting Masterpiece...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-6 h-6" />
                          Generate Ultra-Max Thumbnail
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: Result */}
                  <div className="lg:col-span-5 bg-black/20 border border-white/5 rounded-3xl p-6 flex flex-col">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Live Preview (16:9)
                    </h3>
                    <div className="flex-1 flex flex-col items-center justify-center bg-black/50 rounded-2xl border border-white/10 overflow-hidden relative group min-h-[300px]">
                      {generatedAutoThumb ? (
                        <>
                          <img src={generatedAutoThumb} alt="Generated Thumbnail" className="w-full h-full object-cover aspect-video" />
                          <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-md gap-4 p-6">
                            <p className="text-emerald-400 font-bold text-lg mb-2">Ready to Download!</p>
                            <button
                              onClick={() => downloadBase64(generatedAutoThumb, 'ultra-max-thumbnail-high-res.png')}
                              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                            >
                              <Download className="w-5 h-5" />
                              Download High-Res (PNG)
                            </button>
                            <button
                              onClick={() => downloadBase64(generatedAutoThumb, 'ultra-max-thumbnail-web.jpg')}
                              className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Download className="w-5 h-5" />
                              Download Web Optimized (JPG)
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-8">
                          <LayoutTemplate className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Your ultra-realistic masterpiece will appear here</p>
                          <p className="text-gray-600 text-sm mt-2">Fill out the advanced options to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 3: SEO ANALYZER                        */}
          {/* ========================================== */}
          {activeTab === 'seo' && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f0f13]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-8"
            >
              {/* Input Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Viral SEO Analyzer</h2>
                    <p className="text-sm text-gray-400">Analyze any YouTube video to generate ranking metadata & keywords</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Paste YouTube URL to analyze..."
                    value={seoUrl}
                    onChange={(e) => setSeoUrl(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-gray-600 text-lg"
                  />
                  <button
                    onClick={handleAnalyzeVideo}
                    disabled={isAnalyzing || !seoUrl}
                    className="bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl px-8 py-4 font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart2 className="w-5 h-5" />
                        Analyze Video
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results Dashboard */}
              {seoData && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-white/10"
                >
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Content Analysis */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Play className="w-5 h-5 text-cyan-400" />
                        Content Analysis
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm">
                        {seoData.analysis}
                      </p>
                    </div>

                    {/* Viral Titles */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-purple-400" />
                        Top Ranking Titles
                      </h3>
                      <div className="space-y-4">
                        {seoData.titles?.map((title: any, idx: number) => (
                          <div key={idx} className="bg-black/40 rounded-xl p-4 border border-white/5">
                            <div className="flex items-start gap-3">
                              <span className="text-purple-400 font-black text-xl mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                              <div className="flex-1">
                                <p className="text-white font-medium">{title.text}</p>
                                <RankBar rank={title.rank} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keywords (NEW) */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Key className="w-5 h-5 text-yellow-400" />
                        High-Ranking Keywords
                      </h3>
                      <div className="space-y-3">
                        {seoData.keywords?.map((kw: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-black/40 rounded-lg p-3 border border-white/5">
                            <span className="text-gray-200 font-medium">{kw.text}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${kw.rank >= 95 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                Rank {kw.rank}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Descriptions */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-pink-400" />
                        Optimized Descriptions
                      </h3>
                      <div className="space-y-4">
                        {seoData.descriptions?.map((desc: any, idx: number) => (
                          <div key={idx} className="bg-black/40 rounded-xl p-4 border border-white/5">
                            <p className="text-gray-300 text-sm line-clamp-3 mb-3">{desc.text}</p>
                            <RankBar rank={desc.rank} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Hash className="w-5 h-5 text-orange-400" />
                        Trending Hashtags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {seoData.hashtags?.map((tag: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-2 hover:border-orange-500/50 transition-colors cursor-default"
                          >
                            <span className="text-orange-400 font-medium">{tag.text}</span>
                            <div className="w-px h-4 bg-white/20"></div>
                            <span className={`text-xs font-bold ${tag.rank >= 95 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                              {tag.rank}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 4: KEYWORD MAGIC                       */}
          {/* ========================================== */}
          {activeTab === 'keyword' && (
            <motion.div
              key="keyword"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f0f13]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-8"
            >
              {/* Input Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Viral Keyword Planner</h2>
                    <p className="text-sm text-gray-400">Enter a topic. AI analyzes YouTube, Google & Social Media to generate viral titles, tags, and descriptions.</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="e.g., Faceless YouTube Channel, AI Tools 2024, Minecraft Hacks..."
                    value={seedKeyword}
                    onChange={(e) => setSeedKeyword(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-gray-600 text-lg"
                  />
                  <button
                    onClick={handleGenerateKeywords}
                    disabled={isGeneratingKeywords || !seedKeyword}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-2xl px-8 py-4 font-bold transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGeneratingKeywords ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Trends...
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5" />
                        Generate Viral SEO
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results Dashboard */}
              {keywordData && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-white/10"
                >
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Content Analysis */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Market & Trend Analysis
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm">
                        {keywordData.analysis}
                      </p>
                    </div>

                    {/* Viral Titles */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-purple-400" />
                        Generated Viral Titles
                      </h3>
                      <div className="space-y-4">
                        {keywordData.titles?.map((title: any, idx: number) => (
                          <div key={idx} className="bg-black/40 rounded-xl p-4 border border-white/5">
                            <div className="flex items-start gap-3">
                              <span className="text-purple-400 font-black text-xl mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                              <div className="flex-1">
                                <p className="text-white font-medium">{title.text}</p>
                                <RankBar rank={title.rank} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Key className="w-5 h-5 text-yellow-400" />
                        Related High-Ranking Keywords
                      </h3>
                      <div className="space-y-3">
                        {keywordData.keywords?.map((kw: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-black/40 rounded-lg p-3 border border-white/5">
                            <span className="text-gray-200 font-medium">{kw.text}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${kw.rank >= 95 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                Rank {kw.rank}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Descriptions */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-pink-400" />
                        Generated Descriptions
                      </h3>
                      <div className="space-y-4">
                        {keywordData.descriptions?.map((desc: any, idx: number) => (
                          <div key={idx} className="bg-black/40 rounded-xl p-4 border border-white/5">
                            <p className="text-gray-300 text-sm line-clamp-4 mb-3">{desc.text}</p>
                            <RankBar rank={desc.rank} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Hash className="w-5 h-5 text-orange-400" />
                        Trending Hashtags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {keywordData.hashtags?.map((tag: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-2 hover:border-orange-500/50 transition-colors cursor-default"
                          >
                            <span className="text-orange-400 font-medium">{tag.text}</span>
                            <div className="w-px h-4 bg-white/20"></div>
                            <span className={`text-xs font-bold ${tag.rank >= 95 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                              {tag.rank}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 5: HISTORY                             */}
          {/* ========================================== */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f0f13]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Activity History</h2>
                    <p className="text-sm text-gray-400">View and manage your past generations and analyses</p>
                  </div>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={() => setHistory([])}
                    className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                  <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-300">No History Yet</h3>
                  <p className="text-gray-500 mt-2">Your generated images and SEO analyses will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-black/40 border border-white/10 rounded-2xl p-5 relative group"
                    >
                      <button 
                        onClick={() => deleteHistoryItem(item.id)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {item.type === 'visual' && <ImageIcon className="w-4 h-4 text-cyan-400" />}
                        {item.type === 'autothumb' && <LayoutTemplate className="w-4 h-4 text-emerald-400" />}
                        {item.type === 'seo' && <TrendingUp className="w-4 h-4 text-pink-400" />}
                        {item.type === 'keyword' && <Zap className="w-4 h-4 text-yellow-400" />}
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {item.type === 'autothumb' ? 'Auto Thumb' : item.type}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-white mb-1 truncate pr-8" title={item.title}>{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-4">{new Date(item.timestamp).toLocaleString()}</p>

                      {item.imageUrl && (
                        <div className="space-y-3">
                          <div className="aspect-video rounded-lg overflow-hidden bg-black/50 border border-white/5 relative">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <button 
                            onClick={() => {
                              if (item.imageUrl?.startsWith('data:')) {
                                downloadBase64(item.imageUrl, `nexus-history-${item.id}.png`);
                              } else {
                                window.open(item.imageUrl, '_blank');
                              }
                            }}
                            className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            {item.imageUrl?.startsWith('data:') ? 'Download Image' : 'Open Image'}
                          </button>
                        </div>
                      )}

                      {item.seoData && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <p className="text-sm text-gray-300 line-clamp-3">{item.seoData.analysis}</p>
                          <div className="mt-3 flex gap-2">
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                              {item.seoData.titles?.length || 0} Titles
                            </span>
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                              {item.seoData.keywords?.length || 0} Keywords
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
