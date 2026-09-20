import React, { useState } from 'react';
import { Header } from './components/Header';
import { CarouselViewport } from './components/CarouselViewport';
import { MultiRepoManager } from './components/MultiRepoManager';
import { JsonPipelinePanel } from './components/JsonPipelinePanel';
import { N8nPipelineModal } from './components/N8nPipelineModal';
import { CliGuideModal } from './components/CliGuideModal';
import { CarouselData, PetCharacterConfig } from './types';
import { defaultCarouselData } from './carouselData';

const defaultPetConfig: PetCharacterConfig = {
  enabled: true,
  type: 'robot-magnifier', // Default to the 3D orange/white robot shown in the user's screenshot
  showPlacementGuides: true,
  scale: 1,
  alignment: 'center',
};

export default function App() {
  const [carousel, setCarousel] = useState<CarouselData>(defaultCarouselData);
  const [petConfig, setPetConfig] = useState<PetCharacterConfig>(defaultPetConfig);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(1); // Default to slide 2 (Repo 1) or slide 0
  const [activeTab, setActiveTab] = useState<'generator' | 'json'>('generator');
  const [isN8nModalOpen, setIsN8nModalOpen] = useState(false);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenN8nModal={() => setIsN8nModalOpen(true)}
        onOpenCliModal={() => setIsCliModalOpen(true)}
      />

      {/* Main Studio Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {activeTab === 'generator' ? (
          <div className="space-y-6">
            {/* 1. Visual Card & Carousel Viewport (Cover, Repo Slides, Install Slide, Export ZIP/PNG) */}
            <CarouselViewport
              carousel={carousel}
              setCarousel={setCarousel}
              petConfig={petConfig}
              setPetConfig={setPetConfig}
              currentSlideIndex={currentSlideIndex}
              setCurrentSlideIndex={setCurrentSlideIndex}
            />

            {/* 2. Multi-Repo Manager & Gemini AI Extraction (up to 5 repos, viral headlines, cover/install hooks) */}
            <MultiRepoManager
              carousel={carousel}
              setCarousel={setCarousel}
              setCurrentSlideIndex={setCurrentSlideIndex}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Visual Viewport Preview of the JSON State */}
            <CarouselViewport
              carousel={carousel}
              setCarousel={setCarousel}
              petConfig={petConfig}
              setPetConfig={setPetConfig}
              currentSlideIndex={currentSlideIndex}
              setCurrentSlideIndex={setCurrentSlideIndex}
            />

            {/* 2. JSON File Import/Export & n8n Pipeline Sync */}
            <JsonPipelinePanel
              carousel={carousel}
              setCarousel={setCarousel}
            />
          </div>
        )}
      </main>

      {/* Application Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Viral GitHub Carousel Generator &bull; Willy Westside TikTok Style &bull; Multi-Repo (Max 5) &bull; n8n + CLI
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCliModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Run via CLI &rarr;
            </button>
            <button
              onClick={() => setIsN8nModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              n8n Integration &rarr;
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <N8nPipelineModal
        isOpen={isN8nModalOpen}
        onClose={() => setIsN8nModalOpen(false)}
      />
      <CliGuideModal
        isOpen={isCliModalOpen}
        onClose={() => setIsCliModalOpen(false)}
      />
    </div>
  );
}
