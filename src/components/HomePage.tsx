import React from 'react';
import {
  Dna,
  Binary,
  Atom,
  Activity,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  FileText,
  CheckCircle2,
  Cpu,
  Flame,
  ShieldCheck,
  BookOpen,
  FlaskConical,
  HelpCircle,
  Search,
  ExternalLink,
  Zap,
  Box,
} from 'lucide-react';
import { ProteinData } from '../types';
import { PRESET_PROTEINS } from '../data/presets';

interface HomePageProps {
  currentProtein: ProteinData;
  onSelectProtein: (protein: ProteinData) => void;
  onNavigate: (sectionId: string) => void;
  onOpenAiModal?: () => void;
  onOpenExportModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentProtein,
  onSelectProtein,
  onNavigate,
  onOpenAiModal,
  onOpenExportModal,
}) => {
  const analysisCards = [
    {
      icon: '⚡',
      title: 'Mutation Mechanism Engine',
      badge: 'v3.0 New',
      desc: 'Trace multi-scale causal chains: Mutation → Structural Change → Interaction Change → Functional Implication → Disease Evidence with 3D contacts.',
      sectionId: 'mechanism',
    },
    {
      icon: '🧬',
      title: 'Sequence Analysis',
      desc: 'Accurate residue composition, theoretical pI (Henderson-Hasselbalch), net charge at pH 7.4, Kyte-Doolittle hydropathy, and extinction coefficient (ε280).',
      sectionId: 'dashboard',
    },
    {
      icon: '🧩',
      title: 'Domain Architecture',
      desc: 'Pfam and InterPro profile HMM alignments mapping autonomous structural units, functional boundaries, and topological arrangements.',
      sectionId: 'dashboard',
    },
    {
      icon: '🔬',
      title: '3D Structure Analysis',
      desc: 'Interactive dual WebGL rendering (3Dmol.js & RCSB Mol*), WT vs Mutant residue toggle, secondary structure, and active site pocket inspection.',
      sectionId: 'dashboard',
    },
    {
      icon: '🧪',
      title: 'Functional Annotation',
      desc: 'Standardized Gene Ontology (GO) terms across Molecular Function, Biological Process, and Cellular Component with experimental evidence codes.',
      sectionId: 'dashboard',
    },
    {
      icon: '🕸️',
      title: 'Interaction Networks',
      desc: 'Direct physical and functional interactomes retrieved from STRING and BioGRID with confidence scores and experimental validation metrics.',
      sectionId: 'dashboard',
    },
    {
      icon: '🧬',
      title: 'In Silico Mutation Lab',
      desc: 'Point mutation simulation calculating ΔCharge, ΔHydropathy, steric clash risks, and predicted conformational destabilization.',
      sectionId: 'advanced',
    },
    {
      icon: '🧫',
      title: 'Disease & Cancer Hotspots',
      desc: 'ClinVar ACMG clinical classifications, somatic tumor mutational frequencies, and hotspot density needle plots (e.g. Li-Fraumeni syndrome).',
      sectionId: 'advanced',
    },
    {
      icon: '🤖',
      title: 'AI/ML Impact Models',
      desc: '10-dimensional biophysical feature vectors with Random Forest, XGBoost, and SVM impact classification, calibrated probability, and TreeSHAP attributions.',
      sectionId: 'advanced',
    },
    {
      icon: '📚',
      title: 'Evidence & Research Report',
      desc: 'Traceable PubMed citations, primary peer-reviewed references with direct DOI links, and an exportable 11-chapter research dossier.',
      sectionId: 'report',
    },
  ];

  const workflowSteps = [
    { label: 'Protein Ingestion', desc: 'FASTA, UniProt, or PDB ID' },
    { label: 'Sequence Metrics', desc: 'Composition & Physicochemistry' },
    { label: '3D Coordinates', desc: 'Dual WebGL Molecular Folds' },
    { label: 'Domains & GO', desc: 'Pfam Architecture & Ontology' },
    { label: 'Interactome', desc: 'STRING Physical Networks' },
    { label: 'Mechanism Engine', desc: '5-Stage Multi-Scale Chain' },
    { label: 'Clinical Hotspots', desc: 'ClinVar ACMG & Cancer' },
    { label: 'AI/ML Impact', desc: 'Supervised Models & TreeSHAP' },
    { label: 'Research Dossier', desc: 'Audited PDF & JSON Export' },
  ];

  const supportedDatabases = [
    { name: 'UniProt', desc: 'Curated protein sequences & Swiss-Prot biocuration', url: 'https://www.uniprot.org' },
    { name: 'RCSB PDB', desc: 'Atomic 3D crystallographic & Cryo-EM coordinates', url: 'https://www.rcsb.org' },
    { name: 'Gene Ontology', desc: 'Standardized function & cellular localization', url: 'http://geneontology.org' },
    { name: 'Pfam / InterPro', desc: 'Protein families & HMM domain signatures', url: 'https://www.ebi.ac.uk/interpro/' },
    { name: 'ClinVar', desc: 'Human genetic variants & ACMG clinical assertions', url: 'https://www.ncbi.nlm.nih.gov/clinvar/' },
    { name: 'STRING / BioGRID', desc: 'Physical & functional macromolecular interactomes', url: 'https://string-db.org' },
    { name: 'PubMed', desc: 'Peer-reviewed biomedical literature citations', url: 'https://pubmed.ncbi.nlm.nih.gov' },
  ];

  return (
    <div className="space-y-10">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>ProteoFlow v3.0 • Multi-Scale Evidence & Mechanistic Intelligence</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              ProteoFlow
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent mt-1">
              Evidence-Grounded Protein Intelligence
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            From sequence and atomic stereochemistry to 3D structure, molecular interfaces, variants, 5-stage mutation mechanisms, and reproducible AI-assisted research.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('input')}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-cyan-900/30 hover:from-cyan-500 hover:to-emerald-500 transition-all cursor-pointer"
            >
              <Database className="h-4 w-4" />
              <span>Analyze a Protein</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onNavigate('mechanism')}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-950/60 px-5 py-3 text-xs font-bold text-cyan-200 hover:bg-cyan-900/50 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
            >
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>⚡ Trace Mutation Mechanism (v3.0)</span>
            </button>

            <button
              onClick={() => onNavigate('copilot')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Research Copilot</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              <Atom className="h-4 w-4 text-emerald-400" />
              <span>Explore 3D ({currentProtein.gene || currentProtein.name})</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop gradients */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </section>

      {/* 2. VISUAL WORKFLOW */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>End-to-End Bioinformatics Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400">
              Systematic translation from raw genetic coordinates into publication-grade dossiers
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
            9 Synchronized Steps
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 flex flex-col justify-between text-left relative group hover:border-cyan-500/40 transition-colors"
            >
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                  0{idx + 1}
                </span>
                <span className="text-xs font-bold text-white block leading-snug">{step.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 leading-tight">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WHAT PROTEOFLOW CAN ANALYZE */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span>What ProteoFlow Can Analyze</span>
          </h3>
          <p className="text-xs text-slate-400">
            Modular multi-scale computational engines covering the full spectrum of structural biology
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {analysisCards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(card.sectionId)}
              className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-4 text-left hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all cursor-pointer space-y-2 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{card.icon}</span>
                  {card.badge && (
                    <span className="rounded-full border border-cyan-500/40 bg-cyan-950/70 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-300">
                      {card.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Launch <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {card.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{card.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 3.5. NEW IN v3.0: MUTATION MECHANISM ENGINE SPOTLIGHT */}
      <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900/95 to-cyan-950/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-300">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>v3.0 Feature Spotlight: Continuous Multi-Scale Causal Chain</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Multi-Scale Mutation Mechanism & Evidence Tracer
            </h3>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Eliminates the gap between isolated single-letter mutations and clinical outcomes. Every mutation is resolved through 5 interconnected biophysical levels with strict evidence-tier classification.
            </p>
          </div>

          <button
            onClick={() => onNavigate('mechanism')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-3 text-xs font-bold text-white hover:from-cyan-500 hover:to-emerald-500 transition-all shadow-lg shadow-cyan-950/50 cursor-pointer shrink-0"
          >
            <Zap className="h-4 w-4" />
            <span>Open Mechanism Engine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 5-Stage Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">STAGE 01</span>
              <span className="text-[9px] font-mono bg-cyan-950/50 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/40">Sequence</span>
            </div>
            <h5 className="text-xs font-bold text-white">Mutation</h5>
            <p className="text-[11px] text-slate-400 leading-snug">
              Wild-Type vs Mutant AA, residue index, HGVS protein nomenclature, and Pfam domain boundary coordinates.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 02</span>
              <span className="text-[9px] font-mono bg-emerald-950/50 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/40">Stereochemistry</span>
            </div>
            <h5 className="text-xs font-bold text-white">Structural Change</h5>
            <p className="text-[11px] text-slate-400 leading-snug">
              ΔCharge, ΔHydropathy, ΔVolume (Å³), secondary structure element, and RSA solvent exposure.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">STAGE 03</span>
              <span className="text-[9px] font-mono bg-cyan-950/50 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/40">3D Environment</span>
            </div>
            <h5 className="text-xs font-bold text-white">Interaction Change</h5>
            <p className="text-[11px] text-slate-400 leading-snug">
              Atomic shell contacts (≤6.5 Å), salt bridge disruption, steric clashes, and distance to DNA/cofactors.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 font-bold">STAGE 04</span>
              <span className="text-[9px] font-mono bg-amber-950/50 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/40">Pathway</span>
            </div>
            <h5 className="text-xs font-bold text-white">Functional Implication</h5>
            <p className="text-[11px] text-slate-400 leading-snug">
              Loss of sequence-specific DNA transactivation, proteasomal degradation arrest, or subunit polymerization.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-rose-400 font-bold">STAGE 05</span>
              <span className="text-[9px] font-mono bg-rose-950/50 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800/40">Clinical</span>
            </div>
            <h5 className="text-xs font-bold text-white">Disease Evidence</h5>
            <p className="text-[11px] text-slate-400 leading-snug">
              ClinVar ACMG criteria, somatic tumor registry frequencies (COSMIC/TCGA), and peer-reviewed PMIDs.
            </p>
          </div>
        </div>

        {/* Quick Launch Chips */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Quick Benchmark Variants:</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">• Click to trace mechanism</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {[
              { gene: 'TP53', code: 'R273C', label: 'TP53 R273C (DNA Contact Hotspot)' },
              { gene: 'TP53', code: 'R248W', label: 'TP53 R248W (Steric Clash Hotspot)' },
              { gene: 'TP53', code: 'R175H', label: 'TP53 R175H (Zinc Destabilizing)' },
              { gene: 'HBB', code: 'E6V', label: 'HBB E6V (Sickle Cell HbS)' },
              { gene: 'UBB', code: 'K48R', label: 'UBB K48R (Proteasome Block)' },
            ].map((v) => (
              <button
                key={v.code}
                onClick={() => onNavigate('mechanism')}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/60 hover:bg-cyan-950/40 hover:text-cyan-300 transition-all cursor-pointer"
                title={v.label}
              >
                {v.gene} {v.code}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RESEARCH WORKFLOW & EVIDENCE FIRST SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Research Workflow Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FlaskConical className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Research Workflow
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            How raw protein data transforms into an evidence-backed analysis:
          </p>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold mt-0.5">
                1
              </span>
              <div>
                <strong className="text-white block">Canonical Data Ingestion</strong>
                <span className="text-slate-400 text-[11px]">
                  Retrieves gold-standard sequence from UniProtKB Swiss-Prot and experimental crystal structures from RCSB PDB.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold mt-0.5">
                2
              </span>
              <div>
                <strong className="text-white block">Physicochemical & Structural Profiling</strong>
                <span className="text-slate-400 text-[11px]">
                  Performs numerical bisection for isoelectric point, maps Pfam HMM domains, and computes 3D secondary structure geometry.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold mt-0.5">
                3
              </span>
              <div>
                <strong className="text-white block">Variant & Disease Evidence Mapping</strong>
                <span className="text-slate-400 text-[11px]">
                  Correlates positions with ClinVar ACMG pathogenic criteria, somatic tumor counts, and interactome partners from STRING.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold mt-0.5">
                4
              </span>
              <div>
                <strong className="text-white block">Supervised AI/ML In Silico Inference</strong>
                <span className="text-slate-400 text-[11px]">
                  Executes trained 10-feature Random Forest & SVM models with TreeSHAP attributions and calibrated epistemic uncertainty.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold mt-0.5">
                5
              </span>
              <div>
                <strong className="text-white block">Multi-Scale Causal Tracing & Dossier</strong>
                <span className="text-slate-400 text-[11px]">
                  Synthesizes 3D spatial contacts (≤6.5 Å), interface disruptions, and ClinVar records into an exportable, audited research dossier.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence First Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Evidence First Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ProteoFlow adheres to strict biocuration integrity standards:
          </p>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/70">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Source-Linked Results</strong>
                <span className="text-slate-400 text-[11px]">
                  Every scientific claim links to primary records in UniProt, RCSB PDB, QuickGO, ClinVar, or PubMed.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/70">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Experimental vs. Predicted Separation</strong>
                <span className="text-slate-400 text-[11px]">
                  Visual badges explicitly distinguish crystallographic wet-lab data from computational ML predictions.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/70">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Database Provenance & Timestamps</strong>
                <span className="text-slate-400 text-[11px]">
                  Full audit metadata tracking biocuration retrieval dates and database versions.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/70">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Reproducible In Silico Analysis</strong>
                <span className="text-slate-400 text-[11px]">
                  Deterministic biophysical algorithms and inspectable Machine Learning weights.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SUPPORTED DATA SOURCES */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>Supported Primary Data Sources</span>
            </h3>
            <p className="text-xs text-slate-400">
              Direct REST integrations with international structural and genomic repositories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {supportedDatabases.map((db, idx) => (
            <a
              key={idx}
              href={db.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {db.name}
                  </strong>
                  <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{db.desc}</p>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono mt-3 block">Official Repository ↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* 6. RESEARCH COPILOT & REPORT PREVIEWS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Copilot Preview */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-cyan-950/20 to-slate-950 p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Research Copilot Preview
              </h4>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
              Zero Hallucinations
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Inquire directly about <strong>{currentProtein.name}</strong>. The Copilot uses retrieved evidence to synthesize concise, verified answers with clickable citations:
          </p>

          <div className="space-y-1.5">
            {[
              'What does this protein do?',
              'Which domains are present?',
              'What disease/cancer evidence exists?',
              'Explain this protein in simple terms.',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate('copilot')}
                className="w-full text-left rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>"{q}"</span>
                <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('copilot')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-all cursor-pointer"
          >
            <span>Open Research Copilot</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Research Report Preview */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-950 p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <FileText className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Research Report Generator Preview
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              PDF & JSON Export
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Compile a comprehensive 11-chapter research dossier covering protein identity, coordinates, Pfam domains, ClinVar variants, and AI predictions:
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/80">
              ✓ 1. Protein Identity
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/80">
              ✓ 2. Sequence Analysis
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/80">
              ✓ 3. Domain Architecture
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/80">
              ✓ 4. Functional Annotation
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/80">
              ✓ 5. Structural Analysis
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/80">
              ✓ 9. AI/ML Predictions
            </div>
          </div>

          <button
            onClick={() => onNavigate('report')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Generate Research Report</span>
          </button>
        </div>
      </div>

      {/* 7. BENCHMARK PRESET SELECTOR */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              Curated Benchmark Models (1-Click Switch)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch immediately to any landmark macromolecular system without downloading external files:
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Active: {currentProtein.name} ({currentProtein.gene})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.values(PRESET_PROTEINS).map((preset) => {
            const isSelected = currentProtein.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectProtein(preset)}
                className={`flex flex-col justify-between text-left rounded-xl p-3.5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-sm shadow-cyan-950/30'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {preset.gene}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {preset.pdbId}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white line-clamp-1">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {preset.length} aa • {preset.organism.split(' ')[0]}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                    {isSelected ? 'Active System' : 'Load Model'}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Developer Attribution Card */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>ProteoFlow v3.0 • Phase 4: Research Intelligence</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs shadow-xs">
            <span className="text-slate-400">Developed by</span>
            <span className="font-semibold text-cyan-400">Mohavarshini G</span>
          </div>
        </div>
      </section>
    </div>
  );
};
