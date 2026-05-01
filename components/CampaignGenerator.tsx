'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Image as ImageIcon, Loader2, Copy, Check, RotateCcw, Palette, Target } from 'lucide-react';
import { ai, MODELS } from '@/lib/gemini';
import { CampaignData, campaignSchema } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

export default function CampaignGenerator() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('Existing Customers');
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateCampaign = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setCampaign(null);
    setGeneratedImageUrl(null);

    try {
      // 1. Generate Text Content
      const textResponse = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: `Create a complete email marketing campaign for: ${prompt}. 
        Audience: ${audience}. 
        Tone: ${tone}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: campaignSchema,
          systemInstruction: "You are an expert marketing strategist and world-class copywriter. Generate high-converting email content based on user prompts. For the imagePrompt, provide a highly detailed, descriptive prompt (style, lighting, composition) suitable for a professional marketing visual. Use keywords like 'photorealistic', 'high-end photography', or 'clean minimalist illustration' as appropriate.",
        },
      });

      const data = JSON.parse(textResponse.text || '{}') as CampaignData;
      setCampaign(data);

      // 2. Generate Image
      const imageResponse = await ai.models.generateContent({
        model: MODELS.IMAGE,
        contents: data.imagePrompt,
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }

    } catch (error) {
      console.error("Error generating campaign:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">CampaignFlow AI</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</button>
          <button className="text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 py-5">Campaigns</button>
          <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Analytics</button>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">Drafts</button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">History</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Configuration */}
        <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your campaign goals..."
              className="w-full h-40 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none bg-slate-50 placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option>Professional & Trusted</option>
                <option>Modern & Energetic</option>
                <option>Minimalist & Luxury</option>
                <option>Urgent & Bold</option>
                <option>Playful & Friendly</option>
                <option>Authoritative</option>
                <option>Empathetic</option>
                <option>Humorous</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Audience Segment</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option>Existing Customers</option>
                <option>New Leads</option>
                <option>InActive Users</option>
                <option>Investors</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateCampaign}
            disabled={isGenerating || !prompt.trim()}
            className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing AI...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </aside>

        {/* Right: Campaign Preview */}
        <section className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <AnimatePresence mode="wait">
            {campaign ? (
              <motion.div
                key="campaign"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8"
              >
                {/* Assets Column */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-slate-800">Campaign Assets</h2>
                  </div>

                  {/* Subject Line Options */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Subject Line Options</label>
                    <div className="space-y-3">
                      {campaign.subjectLines.map((line, i) => (
                        <div
                          key={i}
                          onClick={() => copyToClipboard(line)}
                          className={`p-3 text-sm rounded flex justify-between items-center cursor-pointer transition-all border-l-4 group ${
                            i === 0 ? 'border-indigo-500 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-slate-700">&quot;{line}&quot;</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold ${i === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {i === 0 ? '98%' : 90 - i * 5 + '%'} Fit
                            </span>
                            <Copy className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Concept */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Hero Image Concept</label>
                    <div className="relative aspect-video bg-indigo-50 rounded-lg flex flex-col items-center justify-center text-indigo-400 border border-indigo-200 border-dashed overflow-hidden">
                      {generatedImageUrl ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-full h-full"
                        >
                          <Image
                            src={generatedImageUrl}
                            alt="Campaign Visual"
                            fill
                            className="object-cover"
                            unoptimized
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      ) : (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin mb-2" />
                          <span className="text-xs font-medium uppercase tracking-widest">Generating Visual...</span>
                          <span className="text-[10px] mt-2 text-center px-4 italic text-slate-400">{campaign.visualDescription}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <button
                      onClick={() => setCampaign(null)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Discard & Reset
                    </button>
                  </div>
                </div>

                {/* Email Content Preview */}
                <div className="w-full lg:w-[450px] bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col self-start sticky top-0">
                  <div className="h-10 border-b border-slate-100 flex items-center justify-between px-4">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${campaign.headline}\n\n${campaign.bodyCopy}`)}
                      className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800"
                    >
                      Copy HTML
                    </button>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto max-h-[70vh]">
                    <div className="text-center mb-8">
                      <span className="text-[10px] font-bold tracking-[.3em] text-indigo-600 uppercase">Premium Content</span>
                    </div>
                    
                    {generatedImageUrl && (
                      <div className="w-full h-48 bg-slate-100 rounded-lg mb-8 overflow-hidden relative">
                        <Image 
                          src={generatedImageUrl} 
                          fill 
                          className="object-cover" 
                          alt="Email Hero" 
                          unoptimized
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <h3 className="text-2xl font-bold leading-tight text-slate-900 mb-6 font-serif">
                      {campaign.headline}
                    </h3>
                    
                    <div className="markdown-body text-slate-600 text-sm leading-relaxed mb-8 prose prose-slate">
                      <ReactMarkdown>{campaign.bodyCopy}</ReactMarkdown>
                    </div>

                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-5 text-center rounded-xl mb-8">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase mb-2">Campaign Action</span>
                      <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-lg text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md">
                        {campaign.ctaText}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-slate-300 shadow-sm">
                  <ImageIcon className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to create?</h2>
                  <p className="text-slate-500 max-w-sm text-sm">
                    Enter your campaign details in the sidebar to generate high-performing subject lines, premium copy, and AI visuals.
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Palette className="w-3.5 h-3.5" />
                    High-End Visuals
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5" />
                    Enterprise Copy
                  </span>
                </div>
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-slate-900 text-slate-400 px-6 flex items-center justify-between text-[10px] font-medium flex-shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <Target className="w-3 h-3" />
            AI Model: Marketing-v4-Turbo
          </span>
          <span className="hidden sm:inline opacity-50">|</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Copywriting Engine: Semantic-Gen-9
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span>Cloud Sync Active</span>
        </div>
      </footer>

      {/* Copy Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full shadow-lg z-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-green-400" />
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
