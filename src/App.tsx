import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { InputSection } from './components/InputSection';
import { SequenceViewer } from './components/dashboard/SequenceViewer';
import { StructureViewer3D } from './components/dashboard/StructureViewer3D';
import { AnnotationTable } from './components/dashboard/AnnotationTable';
import { ComparisonModule } from './components/advanced/ComparisonModule';
import { MutationSimulator } from './components/advanced/MutationSimulator';
import { InteractionAnalysis } from './components/advanced/InteractionAnalysis';
import { DataProvenancePanel } from './components/dashboard/DataProvenancePanel';
import { DiseaseVariantModule } from './components/variants/DiseaseVariantModule';
import { AiMutationModule } from './components/aiml/AiMutationModule';
import { MutationMechanismModule } from './components/advanced/MutationMechanismModule';
import { ResearchCopilotModule } from './components/copilot/ResearchCopilotModule';
import { ResearchReportModule } from './components/report/ResearchReportModule';
import { AboutSection } from './components/AboutSection';
import { AIReportModal } from './components/ai/AIReportModal';
import { ExportReportModal } from './components/export/ExportReportModal';
import { ThemeProvider } from './context/ThemeContext';
import { PRESET_PROTEINS } from './data/presets';
import { ProteinData, MutationSimulation, AISynthesisReport } from './types';
import { fetchProteinByUniProt, fetchProteinByPdb } from './services/proteinService';
import { simulateMutation } from './utils/bioinformatics';
import {
  Dna,
  Layers,
  Sparkles,
  ShieldCheck,
  Activity,
  ArrowLeft,
  ArrowRight,
  Database,
  Atom,
  BookOpen,
  Flame,
  Cpu,
  FileText,
  Zap,
} from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function MainDashboard() {
  // Initial protein: Human Hemoglobin Beta
  const [currentProtein, setCurrentProtein] = useState<ProteinData>(
    () => PRESET_PROTEINS['P68871'] || Object.values(PRESET_PROTEINS)[0]
  );

  // Initial simulated mutation: E6V (Sickle cell HbS)
  const [mutations, setMutations] = useState<MutationSimulation[]>(() => {
    const defaultMut = simulateMutation(PRESET_PROTEINS['P68871'], 'E6V');
    return 'error' in defaultMut ? [] : [defaultMut];
  });

  const [selectedResidueIndex, setSelectedResidueIndex] = useState<number | null>(6);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [advancedTab, setAdvancedTab] = useState<'mechanism' | 'aiml' | 'variants' | 'insilico'>('mechanism');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI synthesis & export modals
  const [aiReport, setAiReport] = useState<AISynthesisReport | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Navigation switcher
  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'mechanism') {
      setActiveSection('advanced');
      setAdvancedTab('mechanism');
    } else if (sectionId === 'aiml') {
      setActiveSection('advanced');
      setAdvancedTab('aiml');
    } else if (sectionId === 'variants') {
      setActiveSection('advanced');
      setAdvancedTab('variants');
    } else {
      setActiveSection(sectionId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protein selection from presets or custom fasta
  const handleSelectProtein = (newProtein: ProteinData) => {
    setCurrentProtein(newProtein);
    setSelectedResidueIndex(null);
    setErrorMessage(null);
    setAiReport(null);

    // Provide default mutation for preset
    if (newProtein.gene === 'TP53') {
      const p53Mut = simulateMutation(newProtein, 'R248W');
      if (!('error' in p53Mut)) setMutations([p53Mut]);
    } else if (newProtein.gene === 'HBB') {
      const hbbMut = simulateMutation(newProtein, 'E6V');
      if (!('error' in hbbMut)) setMutations([hbbMut]);
    } else if (newProtein.gene === 'UBB') {
      const ubbMut = simulateMutation(newProtein, 'K48R');
      if (!('error' in ubbMut)) setMutations([ubbMut]);
    } else if (newProtein.id.includes('6M0J') || newProtein.name.includes('Spike')) {
      const spkMut = simulateMutation(newProtein, 'N501Y');
      if (!('error' in spkMut)) setMutations([spkMut]);
    } else {
      setMutations([]);
    }
  };

  // Fetch UniProt
  const handleFetchUniProt = async (uniprotId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchProteinByUniProt(uniprotId);
      handleSelectProtein(data);
    } catch (err: any) {
      setErrorMessage(
        err.message || `Failed to fetch UniProt data for ID ${uniprotId}. Check ID or try preset.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch PDB
  const handleFetchPdb = async (pdbId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchProteinByPdb(pdbId);
      handleSelectProtein(data);
    } catch (err: any) {
      setErrorMessage(
        err.message || `Failed to fetch PDB entry for ID ${pdbId}. Check ID or try preset.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Mutation handlers
  const handleAddMutation = (mut: MutationSimulation) => {
    setMutations((prev) => [mut, ...prev.filter((m) => m.id !== mut.id)]);
  };

  const handleRemoveMutation = (mutId: string) => {
    setMutations((prev) => prev.filter((m) => m.id !== mutId));
  };

  const handleClearMutations = () => {
    setMutations([]);
  };

  // Transition to mutation simulator with pre-selected variant
  const handleSimulateFromVariant = (variantNotation: string) => {
    const sim = simulateMutation(currentProtein, variantNotation);
    if (!('error' in sim)) {
      handleAddMutation(sim);
      setSelectedResidueIndex(sim.position);
      setActiveSection('advanced');
      setAdvancedTab('insilico');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Universal Top Navigation */}
      <Navbar
        currentProtein={currentProtein}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onGenerateReport={() => handleNavigate('report')}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Global Error Banner */}
        {errorMessage && (
          <div
            id="global-error-banner"
            className="mb-6 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-200 backdrop-blur-sm shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold">
                !
              </span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="rounded-lg bg-red-900/40 px-2.5 py-1 text-[11px] font-medium hover:bg-red-900/60 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
          >
            {/* VIEW 0: HOMEPAGE (Phase 4 Redesign) */}
            {activeSection === 'home' && (
              <HomePage
                currentProtein={currentProtein}
                onSelectProtein={handleSelectProtein}
                onNavigate={handleNavigate}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onOpenExportModal={() => setIsExportModalOpen(true)}
              />
            )}

            {/* VIEW 1: INPUT & DATA INGESTION STUDIO */}
            {activeSection === 'input' && (
              <InputSection
                currentProtein={currentProtein}
                onSelectProtein={handleSelectProtein}
                onFetchUniProt={handleFetchUniProt}
                onFetchPdb={handleFetchPdb}
                isLoading={isLoading}
                onNavigateToDashboard={() => handleNavigate('dashboard')}
              />
            )}

            {/* VIEW 2: PRIMARY DASHBOARD */}
            {activeSection === 'dashboard' && (
              <section id="dashboard-section" className="space-y-6">
                {/* 10-Residue Interactive Sequence Stream & Full Metrics */}
                <SequenceViewer
                  protein={currentProtein}
                  onSelectResidue={(idx) => setSelectedResidueIndex(idx)}
                  selectedResidueIndex={selectedResidueIndex}
                />

                {/* 2-Column Split: Annotations & Interactions | 3D WebGL Coordinates */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Left Column: Functional Ontologies, Pfam Domains, Catalytic Sites (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <AnnotationTable
                      protein={currentProtein}
                      onSelectResidue={(idx) => setSelectedResidueIndex(idx)}
                    />
                  </div>

                  {/* Right Column: 3D Structure Viewer & PDB Parameters (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <StructureViewer3D
                      protein={currentProtein}
                      highlightResidue={selectedResidueIndex}
                    />
                    <InteractionAnalysis protein={currentProtein} />
                  </div>
                </div>

                {/* Data Sources, Evidence Hierarchy & Provenance Panel */}
                <DataProvenancePanel protein={currentProtein} />
              </section>
            )}

            {/* VIEW 3: ADVANCED WORKBENCH (AI Mutation ML, Disease Variants, In Silico Lab) */}
            {(activeSection === 'advanced' || activeSection === 'aiml' || activeSection === 'variants') && (
              <section id="advanced-workbench-section" className="space-y-6">
                {/* Subtab Navigation Bar */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                        3. Advanced In Silico & Machine Learning Lab
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Target System: {currentProtein.name} ({currentProtein.gene})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                    <button
                      id="tab-btn-mechanism"
                      onClick={() => setAdvancedTab('mechanism')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all cursor-pointer ${
                        advancedTab === 'mechanism'
                          ? 'bg-gradient-to-r from-cyan-500/25 to-emerald-500/25 text-cyan-200 border border-cyan-500/50 shadow-xs font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Mutation Mechanism (v3.0)</span>
                    </button>
                    <button
                      onClick={() => setAdvancedTab('aiml')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all cursor-pointer ${
                        advancedTab === 'aiml'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Cpu className="h-3.5 w-3.5" />
                      <span>AI Mutation ML (Phase 3)</span>
                    </button>
                    <button
                      onClick={() => setAdvancedTab('variants')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all cursor-pointer ${
                        advancedTab === 'variants'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Flame className="h-3.5 w-3.5" />
                      <span>ClinVar & Cancer Variants</span>
                    </button>
                    <button
                      onClick={() => setAdvancedTab('insilico')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all cursor-pointer ${
                        advancedTab === 'insilico'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Mutation Simulator & Align</span>
                    </button>
                  </div>
                </div>

                {/* Subtab 0: Mutation Mechanism Engine (v3.0 Phase 1) */}
                {advancedTab === 'mechanism' && (
                  <MutationMechanismModule
                    protein={currentProtein}
                    onSelectResidue={(idx) => setSelectedResidueIndex(idx)}
                    onNavigateToStructure={() => handleNavigate('dashboard')}
                  />
                )}

                {/* Subtab 1: AI Mutation ML Module */}
                {advancedTab === 'aiml' && (
                  <AiMutationModule
                    protein={currentProtein}
                    onSelectResidue={(idx) => setSelectedResidueIndex(idx)}
                    onNavigateToStructure={() => handleNavigate('dashboard')}
                    onNavigateToSimulator={handleSimulateFromVariant}
                  />
                )}

                {/* Subtab 2: ClinVar & Cancer Variants */}
                {advancedTab === 'variants' && (
                  <DiseaseVariantModule
                    protein={currentProtein}
                    onSelectResidue={(idx) => setSelectedResidueIndex(idx)}
                    selectedResidueIndex={selectedResidueIndex}
                    onNavigateToSimulator={handleSimulateFromVariant}
                    onNavigateToDashboard={() => handleNavigate('dashboard')}
                    onNavigateToAiml={() => {
                      setAdvancedTab('aiml');
                    }}
                  />
                )}

                {/* Subtab 3: In Silico Simulator & Pairwise Alignment */}
                {advancedTab === 'insilico' && (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                      <MutationSimulator
                        currentProtein={currentProtein}
                        mutations={mutations}
                        onAddMutation={handleAddMutation}
                        onRemoveMutation={handleRemoveMutation}
                        onClearMutations={handleClearMutations}
                        initialResiduePos={selectedResidueIndex}
                      />
                    </div>
                    <div className="lg:col-span-5">
                      <ComparisonModule currentProtein={currentProtein} />
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* VIEW 4: RESEARCH COPILOT (Phase 4 Upgrade) */}
            {activeSection === 'copilot' && (
              <section id="research-copilot-section" className="space-y-6">
                <ResearchCopilotModule
                  protein={currentProtein}
                  onSelectResidue={(idx: number) => setSelectedResidueIndex(idx)}
                  onNavigateToDashboard={() => handleNavigate('dashboard')}
                  onNavigateToReport={() => handleNavigate('report')}
                />
              </section>
            )}

            {/* VIEW 5: RESEARCH REPORT GENERATOR (Phase 4 Upgrade) */}
            {activeSection === 'report' && (
              <section id="research-report-section" className="space-y-6">
                <ResearchReportModule
                  protein={currentProtein}
                  onNavigateToCopilot={() => handleNavigate('copilot')}
                  onNavigateToStructure={() => handleNavigate('dashboard')}
                />
              </section>
            )}

            {/* VIEW 6: COMPREHENSIVE USER GUIDE (16 Interactive Modules) */}
            {activeSection === 'about' && (
              <div className="space-y-4">
                <AboutSection
                  onNavigateSection={handleNavigate}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                  onOpenExportModal={() => setIsExportModalOpen(true)}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Responsive Global Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-xs text-slate-400 transition-colors">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 text-slate-400">
              <Dna className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">ProteoFlow v3.0</span>
              <span className="hidden sm:inline">•</span>
              <span>Evidence-Grounded Protein Intelligence</span>
            </div>

            {/* Prominent Developer Attribution */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs shadow-xs transition-colors">
              <span className="text-slate-400">Developed by</span>
              <span className="font-bold text-cyan-400 tracking-wide">Mohavarshini G</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
            <button
              onClick={() => handleNavigate('home')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('input')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              1. Input
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('dashboard')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              2. Dashboard
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('advanced')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              3. Advanced
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('copilot')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              4. Research Copilot
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('report')}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              5. Report
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('about')}
              className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-medium cursor-pointer"
            >
              6. User Guide
            </button>
          </div>
        </div>
      </footer>

      {/* AI Synthesis Modal (Gemini 3.8 Flash) */}
      <AIReportModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        protein={currentProtein}
        mutations={mutations}
        aiReport={aiReport}
        onSetAiReport={(rep) => setAiReport(rep)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        protein={currentProtein}
        mutations={mutations}
        aiReport={aiReport}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MainDashboard />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
