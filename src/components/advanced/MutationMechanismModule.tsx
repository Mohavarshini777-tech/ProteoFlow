import React, { useState, useMemo } from 'react';
import {
  Zap,
  Search,
  Dna,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Download,
  Copy,
  Check,
  Layers,
  Sparkles,
  ArrowDown,
  Box,
  CheckCircle2,
  HelpCircle,
  FileText,
  Flame,
  Info,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { ProteinData } from '../../types';
import {
  MutationMechanismAnalysis,
  MechanisticStepEvidence,
} from '../../types/mutationMechanism';
import { buildMutationMechanismAnalysis } from '../../services/mutationMechanismService';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { useTheme } from '../../context/ThemeContext';

interface MutationMechanismModuleProps {
  protein: ProteinData;
  onSelectResidue?: (position: number) => void;
  onNavigateToStructure?: () => void;
  initialVariant?: string;
}

export const MutationMechanismModule: React.FC<MutationMechanismModuleProps> = ({
  protein,
  onSelectResidue,
  onNavigateToStructure,
  initialVariant,
}) => {
  const { theme } = useTheme();

  // Pick suitable initial query based on protein
  const defaultQuery = useMemo(() => {
    if (initialVariant) return initialVariant;
    if (protein.gene === 'TP53') return 'R273C';
    if (protein.gene === 'HBB') return 'E6V';
    if (protein.gene === 'UBB') return 'K48R';
    if (protein.variants?.[0]) {
      const v = protein.variants[0];
      return `${v.wildType}${v.position}${v.mutantResidue}`;
    }
    return 'R273C';
  }, [protein, initialVariant]);

  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [activeAnalysis, setActiveAnalysis] = useState<MutationMechanismAnalysis | null>(() => {
    const res = buildMutationMechanismAnalysis(protein, defaultQuery);
    return 'error' in res ? null : res;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'flow' | 'structural' | 'evidence' | 'json'>('flow');
  const [wtVsMutantCompare, setWtVsMutantCompare] = useState<'wt' | 'mutant' | 'diff'>('diff');

  // Trigger analysis for entered variant
  const handleRunAnalysis = (variantStr: string) => {
    setErrorMessage(null);
    const res = buildMutationMechanismAnalysis(protein, variantStr);
    if ('error' in res) {
      setErrorMessage(res.error);
    } else {
      setActiveAnalysis(res);
      // Link selected residue across global sequence, domain map, and 3D structure
      onSelectResidue?.(res.position);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleRunAnalysis(searchQuery.trim());
  };

  const handlePresetSelect = (notation: string) => {
    setSearchQuery(notation);
    handleRunAnalysis(notation);
  };

  // Export as JSON
  const handleExportJson = () => {
    if (!activeAnalysis) return;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(activeAnalysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `proteoflow-mutation-mechanism-${activeAnalysis.gene}-${activeAnalysis.notation}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = () => {
    if (!activeAnalysis) return;
    navigator.clipboard.writeText(JSON.stringify(activeAnalysis, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Suggested shortcuts for quick exploration
  const getDemoShortcuts = () => {
    if (protein.gene === 'TP53') {
      return [
        { code: 'R273C', label: 'TP53 R273C (DNA major groove contact hotspot)' },
        { code: 'R248W', label: 'TP53 R248W (DNA minor groove steric clash)' },
        { code: 'R175H', label: 'TP53 R175H (Zinc scaffold destabilizing)' },
      ];
    }
    if (protein.gene === 'HBB') {
      return [
        { code: 'E6V', label: 'HBB E6V (Sickle cell anemia HbS polymer)' },
        { code: 'E6K', label: 'HBB E6K (Hemoglobin C crystal formation)' },
      ];
    }
    if (protein.gene === 'UBB') {
      return [
        { code: 'K48R', label: 'UBB K48R (Blocks 26S proteasome degradation)' },
        { code: 'K63R', label: 'UBB K63R (DNA repair signaling knockout)' },
      ];
    }
    return [
      { code: 'R273C', label: 'Demo: TP53 R273C' },
    ];
  };

  return (
    <div id="mutation-mechanism-engine" className="space-y-6">
      {/* 1. Module Header & Navigation Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-400">
              <Zap className="h-3.5 w-3.5" />
              <span>ProteoFlow v3.0 Phase 1: Mutation Mechanism Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Multi-Scale Mutation Mechanism & Evidence Tracer
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Integrates atomic stereochemistry, 3D structural environments, molecular binding interfaces,
              and clinical disease registries into a continuous, audit-grounded causal chain.
            </p>
          </div>

          {/* Export JSON Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {activeAnalysis && (
              <>
                <button
                  id="mech-export-json-btn"
                  onClick={handleExportJson}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-all cursor-pointer shadow-sm"
                  title="Export complete mechanistic analysis as structured JSON"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy analysis JSON to clipboard"
                >
                  {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2. Interactive Search & Variant Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="mech-variant-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter variant notation (e.g. TP53 R273C, R273C, p.Arg273Cys, E6V)..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-xs font-mono text-slate-100 placeholder:font-sans placeholder:text-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <button
              id="mech-trace-btn"
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:from-cyan-500 hover:to-emerald-500 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Trace Mechanism</span>
            </button>
          </form>

          {/* Preset Shortcuts */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Quick Benchmarks:</span>
            {getDemoShortcuts().map((demo) => (
              <button
                key={demo.code}
                onClick={() => handlePresetSelect(demo.code)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer ${
                  activeAnalysis?.notation === demo.code
                    ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
                title={demo.label}
              >
                {demo.code}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Analysis Body */}
      {activeAnalysis && (
        <div className="space-y-6">
          {/* 3. High-Contrast Summary Bar: Residue Linking & Coordinates */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {/* Target Protein */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Macromolecule</span>
                <div className="font-bold text-white text-sm truncate mt-0.5">
                  {activeAnalysis.gene}
                </div>
                <span className="text-[10px] text-slate-400 truncate block">
                  {activeAnalysis.uniprotId} • PDB {activeAnalysis.pdbId}
                </span>
              </div>

              {/* Variant Notation */}
              <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3">
                <span className="text-[10px] text-cyan-400 uppercase font-mono block">Variant Substitution</span>
                <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5">
                  {activeAnalysis.notation}
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {activeAnalysis.hgvsProtein}
                </span>
              </div>

              {/* Wild-Type vs Mutant Residues */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Residue Transition</span>
                <div className="flex items-center gap-1.5 mt-0.5 font-bold">
                  <span className="text-emerald-400 font-mono">{activeAnalysis.wildTypeAa.code3}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className="text-rose-400 font-mono">{activeAnalysis.mutantAa.code3}</span>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Position {activeAnalysis.position} of {protein.length} AA
                </span>
              </div>

              {/* Domain Map Linkage */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Domain Location</span>
                <div className="font-semibold text-white truncate mt-0.5" title={activeAnalysis.domain.name}>
                  {activeAnalysis.domain.name}
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  [{activeAnalysis.domain.range}]
                </span>
              </div>

              {/* Secondary Structure */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Secondary Structure</span>
                <div className="font-semibold text-purple-300 truncate mt-0.5">
                  {activeAnalysis.secondaryStructure.type}
                </div>
                <span className="text-[10px] text-slate-400 truncate block">
                  {activeAnalysis.secondaryStructure.elementName}
                </span>
              </div>

              {/* 3D Structure Link & Highlight */}
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-mono block">3D Locus</span>
                  <div className="font-bold text-emerald-300 text-sm mt-0.5">
                    Residue {activeAnalysis.position}
                  </div>
                </div>
                {onNavigateToStructure && (
                  <button
                    onClick={() => {
                      onSelectResidue?.(activeAnalysis.position);
                      onNavigateToStructure();
                    }}
                    className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <Box className="h-3 w-3" />
                    <span>View in 3D WebGL</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4. Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('flow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'flow'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>5-Stage Mechanistic Evidence Chain</span>
            </button>
            <button
              onClick={() => setActiveTab('structural')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'structural'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Stereochemical & Interface Environment</span>
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'evidence'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Evidence Audit (Supporting / Conflicting / Missing)</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Raw JSON Schema</span>
            </button>
          </div>

          {/* TAB 1: 5-STAGE MECHANISTIC CHAIN */}
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-900/40 p-3 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Showing causal chain: <strong>Mutation</strong> → <strong>Structural Change</strong> → <strong>Interaction Change</strong> → <strong>Functional Implication</strong> → <strong>Disease Evidence</strong>
                </span>
                <span className="font-mono text-[10px] text-cyan-400">Phase 1 Architecture</span>
              </div>

              {/* Chain Steps Stack */}
              <div className="relative space-y-4 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/40 before:via-emerald-500/40 before:to-rose-500/40">
                {/* Step 1: Mutation */}
                <MechanisticStepCard
                  number={1}
                  step={activeAnalysis.mechanisticChain.mutationStep}
                />

                {/* Step 2: Structural Change */}
                <MechanisticStepCard
                  number={2}
                  step={activeAnalysis.mechanisticChain.structuralChangeStep}
                />

                {/* Step 3: Interaction Change */}
                <MechanisticStepCard
                  number={3}
                  step={activeAnalysis.mechanisticChain.interactionChangeStep}
                />

                {/* Step 4: Functional Implication */}
                <MechanisticStepCard
                  number={4}
                  step={activeAnalysis.mechanisticChain.functionalImplicationStep}
                />

                {/* Step 5: Disease Evidence */}
                <MechanisticStepCard
                  number={5}
                  step={activeAnalysis.mechanisticChain.diseaseEvidenceStep}
                />
              </div>

              {/* Scientific Governance Disclaimer */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] block">
                    Strict Scientific Governance Rule
                  </span>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
                    {activeAnalysis.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEREOCHEMICAL & INTERFACE ENVIRONMENT */}
          {activeTab === 'structural' && (
            <div className="space-y-6">
              {/* WT vs Mutant Amino Acid Property Comparison Grid */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Amino-Acid Property Shift Analysis ({activeAnalysis.wildTypeAa.code3} → {activeAnalysis.mutantAa.code3})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Calculated physical property deltas at residue position {activeAnalysis.position}
                    </p>
                  </div>

                  {/* Mode switcher */}
                  <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 text-[11px]">
                    <button
                      onClick={() => setWtVsMutantCompare('diff')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        wtVsMutantCompare === 'diff' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Delta & Shift
                    </button>
                    <button
                      onClick={() => setWtVsMutantCompare('wt')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        wtVsMutantCompare === 'wt' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Wild-Type ({activeAnalysis.wildTypeAa.code1})
                    </button>
                    <button
                      onClick={() => setWtVsMutantCompare('mutant')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        wtVsMutantCompare === 'mutant' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Mutant ({activeAnalysis.mutantAa.code1})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeAnalysis.propertyComparisons.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{item.property}</span>
                        <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30 text-[11px]">
                          Δ {item.delta}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60 font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Wild-Type ({activeAnalysis.wildTypeAa.code3}):</span>
                          <span className="text-emerald-400 font-bold">{item.wildTypeVal}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Mutant ({activeAnalysis.mutantAa.code3}):</span>
                          <span className="text-rose-400 font-bold">{item.mutantVal}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
                        {item.shiftInterpretation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-Column Split: Nearby Residue Contacts & Functional Binding Interfaces */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Nearby Residues in 3D Structure (6 Cols) */}
                <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        Nearby Residues in 3D Space
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Radius ≤ 6.5 Å
                    </span>
                  </div>

                  {activeAnalysis.nearbyResidues.length === 0 ? (
                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 text-xs text-slate-400 italic">
                      Evidence unavailable. No atomic coordinates resolved for nearby shell.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeAnalysis.nearbyResidues.map((contact, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/70 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-cyan-300 font-mono font-bold text-[11px]">
                              {contact.aminoAcid}
                            </span>
                            <div>
                              <span className="font-semibold text-slate-200">
                                Residue {contact.position} ({contact.aminoAcid})
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {contact.interactionType}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-400 text-xs">
                              {contact.distanceAngstrom} Å
                            </span>
                            <span className="text-[10px] text-slate-400 block">Cα-Cα / sidechain</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Distance to DNA / Ligands / Interface (6 Cols) */}
                <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Dna className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        Distance to DNA, Ligand & Functional Interfaces
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Experimental Locus
                    </span>
                  </div>

                  {activeAnalysis.functionalInterfaces.length === 0 ? (
                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 text-xs text-slate-400 italic">
                      Evidence unavailable.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeAnalysis.functionalInterfaces.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/70 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-cyan-300">{item.interfaceType}</span>
                            {item.distanceAngstrom !== null ? (
                              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 text-[11px]">
                                {item.distanceAngstrom} Å
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                Evidence unavailable
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-300 font-medium">
                            Target: {item.targetName}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Solvent Accessibility Card */}
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 text-xs space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Solvent Accessibility (RSA)
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        {activeAnalysis.solventAccessibility.classification}
                      </span>
                      {activeAnalysis.solventAccessibility.rsaPercent !== null && (
                        <span className="font-mono font-bold text-cyan-400">
                          {activeAnalysis.solventAccessibility.rsaPercent}% RSA
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Source: {activeAnalysis.solventAccessibility.source}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE SUMMARY (SUPPORTING, CONFLICTING, MISSING) */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-6">
                <div className="border-b border-slate-800/80 pb-3">
                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span>Evidence Summary & Scientific Integrity Matrix</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Transparent triage of supporting empirical records, conflicting reports, and missing experimental validation
                  </p>
                </div>

                {/* 3 Categories: Supporting / Conflicting / Missing */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Supporting Evidence */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Supporting Evidence ({activeAnalysis.evidenceSummary.supportingEvidence.length})
                      </h4>
                    </div>
                    {activeAnalysis.evidenceSummary.supportingEvidence.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Evidence unavailable.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeAnalysis.evidenceSummary.supportingEvidence.map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-slate-950/80 p-2.5 border border-emerald-800/30 text-xs space-y-1"
                          >
                            <span className="text-slate-200 font-medium block leading-snug">
                              {item.claim}
                            </span>
                            <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-800/60 font-mono">
                              <span className="text-emerald-400">{item.category}</span>
                              <span className="truncate max-w-[140px]">{item.source}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Conflicting Evidence */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <AlertCircle className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Conflicting Evidence ({activeAnalysis.evidenceSummary.conflictingEvidence.length})
                      </h4>
                    </div>
                    {activeAnalysis.evidenceSummary.conflictingEvidence.length === 0 ? (
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 italic">
                        No conflicting clinical or experimental records reported in peer-reviewed catalogs.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeAnalysis.evidenceSummary.conflictingEvidence.map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-slate-950/80 p-2.5 border border-amber-800/30 text-xs space-y-1"
                          >
                            <span className="text-amber-200 font-medium block leading-snug">
                              {item.claim}
                            </span>
                            <p className="text-[11px] text-slate-400 font-sans">
                              {item.notes}
                            </p>
                            <span className="text-[10px] text-amber-400/80 font-mono block pt-1 border-t border-slate-800/60">
                              Source: {item.source}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missing Evidence */}
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400">
                      <HelpCircle className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Missing Evidence ({activeAnalysis.evidenceSummary.missingEvidence.length})
                      </h4>
                    </div>
                    {activeAnalysis.evidenceSummary.missingEvidence.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No missing empirical gaps noted.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeAnalysis.evidenceSummary.missingEvidence.map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-slate-950/80 p-2.5 border border-rose-800/30 text-xs space-y-1"
                          >
                            <span className="text-rose-200 font-semibold block leading-snug">
                              {item.item}
                            </span>
                            <p className="text-[11px] text-slate-400 font-sans">
                              <strong className="text-slate-300">Reason:</strong> {item.reason}
                            </p>
                            <p className="text-[11px] text-cyan-300 font-sans pt-1 border-t border-slate-800/60">
                              <strong className="text-slate-400">Needed Assay:</strong> {item.neededValidation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAW JSON SCHEMA */}
          {activeTab === 'json' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-slate-400">
                  Schema: ProteoFlow-v3.0-Phase1-MutationMechanism.json
                </span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="max-h-[600px] overflow-y-auto text-[11px] font-mono text-cyan-300/90 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                {JSON.stringify(activeAnalysis, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sub-component: Mechanistic Step Card
interface MechanisticStepCardProps {
  number: number;
  step: MechanisticStepEvidence;
}

const MechanisticStepCard: React.FC<MechanisticStepCardProps> = ({ number, step }) => {
  const getBadgeStyle = () => {
    switch (step.category) {
      case 'Experimental Evidence':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Database Evidence':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Literature Evidence':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Computational Prediction':
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div className="relative pl-12">
      {/* Step Circle Node */}
      <div className="absolute left-3.5 top-3.5 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-cyan-400 bg-slate-950 font-mono text-xs font-bold text-cyan-300 shadow-md">
        {number}
      </div>

      {/* Step Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-lg space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <span>{step.title}</span>
          </h4>

          {/* Evidence Category Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider ${getBadgeStyle()}`}
            >
              {step.category}
            </span>
            {step.isPrediction && (
              <span className="rounded-full bg-purple-950/60 border border-purple-500/40 text-[9px] font-mono text-purple-300 px-2 py-0.5 font-bold">
                PREDICTION (NOT FACT)
              </span>
            )}
          </div>
        </div>

        {/* Finding Body */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {step.finding}
        </p>

        {/* Source Citation */}
        <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Source Citation:</span>
            <span className="text-cyan-300 font-semibold">{step.citation.source}</span>
            {step.citation.accessionOrPmid && (
              <span className="text-slate-300">({step.citation.accessionOrPmid})</span>
            )}
            {step.citation.year && (
              <span className="text-slate-400">• {step.citation.year}</span>
            )}
          </div>

          {step.citation.url && (
            <a
              href={step.citation.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              <span>View Record</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
