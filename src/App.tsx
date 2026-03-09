import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Youtube, Download, Sparkles, TrendingUp, BarChart2, Hash, FileText, Loader2, Play, Activity, LayoutTemplate, Wand2, History, Trash2, Key, Search, Zap, Target, Lightbulb, Sliders, ImagePlus, Video, Film, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

type HistoryItem = {
  id: string;
  type: 'visual' | 'autothumb' | 'seo' | 'keyword' | 'editor' | 'video';
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  seoData?: any;
  timestamp: number;
};

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(true);
  const [activeTab, setActiveTab] = useState<'visual' | 'autothumb' | 'seo' | 'keyword' | 'editor' | 'history'>('visual');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Pro Editor State
  const [editorMode, setEditorMode] = useState<'photo' | 'video'>('photo');
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [editorPrompt, setEditorPrompt] = useState('');
  const [editorStyle, setEditorStyle] = useState('Cinematic Color Grade (Teal & Orange)');
  const [isEditing, setIsEditing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);

  // Video Editor State
  const [videoBaseImage, setVideoBaseImage] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
  const [videoResolution, setVideoResolution] = useState('1080p');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // @ts-ignore
        if (window.aistudio?.hasSelectedApiKey) {
          // @ts-ignore
          const keySelected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(keySelected);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio?.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  
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

      const response = await getAI().models.generateContent({
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

      const response = await getAI().models.generateContent({
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
      const response = await getAI().models.generateContent({
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

  // --- Pro Editor Functions ---
  const handleProEdit = async () => {
    if (!editorImage) return alert("Please upload an image to edit.");
    setIsEditing(true);
    setEditedImageUrl(null);

    try {
      const base64Data = editorImage.split(',')[1];
      const mimeType = editorImage.split(';')[0].split(':')[1];

      const finalPrompt = `You are an elite professional photo editor and retoucher. 
      Apply the following 1-Click Pro Effect to the image: "${editorStyle}".
      ${editorPrompt ? `Additional specific instructions from the client: "${editorPrompt}".` : ''}
      Ensure flawless execution, perfect color grading, and ultra-high resolution output.`;

      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: finalPrompt }
          ]
        }
      });

      let newImageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          newImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (newImageUrl) {
        setEditedImageUrl(newImageUrl);
        addToHistory({
          type: 'editor',
          title: `Pro Edit: ${editorStyle.split(' ')[0]}...`,
          imageUrl: newImageUrl
        });
      } else {
        alert("Failed to generate edited image.");
      }
    } catch (error) {
      console.error("Editing error:", error);
      alert("An error occurred during editing.");
    } finally {
      setIsEditing(false);
    }
  };

  // --- Video Editor Functions ---
  const handleGenerateVideo = async () => {
    if (!videoPrompt && !videoBaseImage) return alert("Please provide a prompt or a base image.");
    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);

    try {
      const ai = getAI();
      let operation;
      
      if (videoBaseImage) {
        const base64Data = videoBaseImage.split(',')[1];
        const mimeType = videoBaseImage.split(';')[0].split(':')[1];
        
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: videoPrompt || 'Cinematic motion, highly detailed, 4k resolution',
          image: {
            imageBytes: base64Data,
            mimeType: mimeType,
          },
          config: {
            numberOfVideos: 1,
            resolution: videoResolution,
            aspectRatio: videoAspectRatio
          }
        });
      } else {
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: videoPrompt,
          config: {
            numberOfVideos: 1,
            resolution: videoResolution,
            aspectRatio: videoAspectRatio
          }
        });
      }

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        const videoResponse = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey as string,
          },
        });
        const blob = await videoResponse.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        setGeneratedVideoUrl(blobUrl);
        addToHistory({
          type: 'video',
          title: `Pro Video: ${videoPrompt ? videoPrompt.substring(0, 20) : 'From Image'}...`,
          videoUrl: blobUrl
        });
      } else {
        alert("Failed to generate video.");
      }
    } catch (error: any) {
      console.error("Video generation error:", error);
      if (error.message?.includes("Requested entity was not found")) {
         setHasApiKey(false);
         alert("API Key error. Please select your API key again.");
      } else {
         alert("An error occurred during video generation. This can take a few minutes, please ensure your API key has billing enabled.");
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // --- Keyword Magic Functions ---
  const handleGenerateKeywords = async () => {
    if (!seedKeyword) return alert("Please enter a keyword or topic.");
    setIsGeneratingKeywords(true);
    setKeywordData(null);

    try {
      const response = await getAI().models.generateContent({
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

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0f0f13] p-10 rounded-[2rem] border border-white/10 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white">API Key Required</h2>
          <p className="text-gray-400 leading-relaxed">
            To use the advanced Veo Video Generation and Pro Image models, you must select a paid Google Cloud API key.
          </p>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium block mb-6">
            Learn more about billing &rarr;
          </a>
          <button
            onClick={handleSelectApiKey}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => setActiveTab('editor')}
            className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'editor' 
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/50 text-white shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sliders className="w-5 h-5" />
            Pro Editor
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
          {/* TAB 5: PRO EDITOR                          */}
          {/* ========================================== */}
          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f0f13]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Pro Studio</h2>
                  <p className="text-sm text-gray-400">Advanced AI photo and video editing capabilities.</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex bg-black/40 p-1 rounded-xl w-fit mb-8 border border-white/10">
                <button
                  onClick={() => setEditorMode('photo')}
                  className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${editorMode === 'photo' ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  <Camera className="w-4 h-4" /> Photo Editor
                </button>
                <button
                  onClick={() => setEditorMode('video')}
                  className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${editorMode === 'video' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  <Film className="w-4 h-4" /> Video Studio
                </button>
              </div>

              {editorMode === 'photo' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left: Controls */}
                  <div className="space-y-6">
                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-cyan-500/50 transition-colors relative group bg-black/20">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setEditorImage)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {editorImage ? (
                        <div className="relative w-full max-w-sm mx-auto aspect-square rounded-xl overflow-hidden shadow-lg">
                          <img src={editorImage} alt="To edit" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-medium flex items-center gap-2"><Upload className="w-5 h-5" /> Replace Image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4 py-10">
                          <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2">
                            <ImagePlus className="w-10 h-10" />
                          </div>
                          <div>
                            <p className="text-gray-200 font-bold text-lg">Upload Image to Edit</p>
                            <p className="text-gray-500 text-sm mt-1">Drag & drop or click to browse (JPG, PNG)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 1-Click Presets */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">1-Click Pro Effects</label>
                      <select
                        value={editorStyle}
                        onChange={(e) => setEditorStyle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-gray-200 appearance-none font-medium"
                      >
                        <option value="Cinematic Color Grade (Teal & Orange)">🎬 Cinematic Color Grade (Teal & Orange)</option>
                        <option value="Cyberpunk Aesthetic (Neon, Dark, Gritty)">🌆 Cyberpunk Aesthetic (Neon, Dark, Gritty)</option>
                        <option value="Studio Lighting Enhancement (Soft & Professional)">💡 Studio Lighting Enhancement</option>
                        <option value="Remove Background & Make Transparent">✂️ Remove Background & Make Transparent</option>
                        <option value="Turn into High-Quality Anime Style">✨ Turn into High-Quality Anime Style</option>
                        <option value="Make it Epic & Dramatic (High Contrast)">🔥 Make it Epic & Dramatic (High Contrast)</option>
                        <option value="Vintage Film Look (Grain, Warm Tones)">🎞️ Vintage Film Look (Grain, Warm Tones)</option>
                        <option value="Professional Retouching (Smooth Skin, Bright Eyes)">✨ Professional Retouching</option>
                      </select>
                    </div>

                    {/* Custom Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Advanced Custom Instructions (Optional)</label>
                      <textarea
                        placeholder="e.g., 'Make the sky purple', 'Add sunglasses to the person', 'Change the background to a futuristic city'..."
                        value={editorPrompt}
                        onChange={(e) => setEditorPrompt(e.target.value)}
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600 text-gray-200 resize-none"
                      />
                    </div>

                    <button
                      onClick={handleProEdit}
                      disabled={!editorImage || isEditing}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-xl px-6 py-4 font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2"
                    >
                      {isEditing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Applying Pro Edits...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          Apply Pro Edits
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: Result */}
                  <div className="flex flex-col h-full">
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden relative min-h-[400px]">
                      {editedImageUrl ? (
                        <div className="w-full h-full relative group">
                          <img src={editedImageUrl} alt="Edited Result" className="w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                            <button 
                              onClick={() => handleDownload(editedImageUrl, 'pro-edit-high-res.png')}
                              className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                              <Download className="w-5 h-5" />
                              High-Res PNG
                            </button>
                            <button 
                              onClick={() => handleDownload(editedImageUrl, 'pro-edit-web.jpg')}
                              className="bg-cyan-500 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                              <Download className="w-5 h-5" />
                              Web JPG
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-10 h-10 text-gray-600" />
                          </div>
                          <p className="text-gray-500 font-medium">Your pro-edited image will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left: Controls */}
                  <div className="space-y-6">
                    {/* Base Image Upload */}
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-colors relative group bg-black/20">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setVideoBaseImage)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {videoBaseImage ? (
                        <div className="relative w-full max-w-sm mx-auto aspect-video rounded-xl overflow-hidden shadow-lg">
                          <img src={videoBaseImage} alt="Base" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-medium flex items-center gap-2"><Upload className="w-5 h-5" /> Replace Base Image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 py-6">
                          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
                            <ImagePlus className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-gray-200 font-bold">Upload Starting Frame (Optional)</p>
                            <p className="text-gray-500 text-sm mt-1">Animate a photo into a video</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Video Prompt / Motion Instructions</label>
                      <textarea
                        placeholder="e.g., 'A cinematic drone shot flying over a neon cyberpunk city, 4k, highly detailed...'"
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600 text-gray-200 resize-none"
                      />
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                        <select
                          value={videoAspectRatio}
                          onChange={(e) => setVideoAspectRatio(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-gray-200 appearance-none"
                        >
                          <option value="16:9">16:9 (Landscape)</option>
                          <option value="9:16">9:16 (Portrait / Shorts)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
                        <select
                          value={videoResolution}
                          onChange={(e) => setVideoResolution(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-gray-200 appearance-none"
                        >
                          <option value="1080p">1080p (High Quality)</option>
                          <option value="720p">720p (Faster)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateVideo}
                      disabled={(!videoPrompt && !videoBaseImage) || isGeneratingVideo}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-6 py-4 font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2"
                    >
                      {isGeneratingVideo ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating Video (Takes 1-2 mins)...
                        </>
                      ) : (
                        <>
                          <Film className="w-5 h-5" />
                          Generate Pro Video
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: Result */}
                  <div className="flex flex-col h-full">
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden relative min-h-[400px]">
                      {generatedVideoUrl ? (
                        <div className="w-full h-full relative group flex flex-col items-center justify-center p-4">
                          <video src={generatedVideoUrl} controls autoPlay loop className="w-full max-h-full rounded-xl shadow-2xl bg-black" />
                          <div className="mt-4">
                            <a 
                              href={generatedVideoUrl}
                              download="nexus-pro-video.mp4"
                              className="bg-purple-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                              <Download className="w-5 h-5" />
                              Download Video
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Video className="w-10 h-10 text-gray-600" />
                          </div>
                          <p className="text-gray-500 font-medium">Your generated video will appear here</p>
                          {isGeneratingVideo && <p className="text-purple-400 text-sm mt-4 animate-pulse">AI is rendering frames... Please wait.</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 6: HISTORY                             */}
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
                        {item.type === 'editor' && <Sliders className="w-4 h-4 text-cyan-400" />}
                        {item.type === 'video' && <Film className="w-4 h-4 text-purple-400" />}
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {item.type === 'autothumb' ? 'Auto Thumb' : item.type === 'editor' ? 'Pro Edit' : item.type === 'video' ? 'Pro Video' : item.type}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-white mb-1 truncate pr-8" title={item.title}>{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-4">{new Date(item.timestamp).toLocaleString()}</p>

                      {item.videoUrl && (
                        <div className="space-y-3">
                          <div className="aspect-video rounded-lg overflow-hidden bg-black/50 border border-white/5 relative">
                            <video src={item.videoUrl} controls className="w-full h-full object-cover" />
                          </div>
                          <a 
                            href={item.videoUrl}
                            download={`nexus-history-${item.id}.mp4`}
                            className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            Download Video
                          </a>
                        </div>
                      )}

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
