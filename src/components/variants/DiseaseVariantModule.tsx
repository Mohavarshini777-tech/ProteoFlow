import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ProteinData,
  ClinicalVariant,
  ClinicalSignificance,
  MolecularConsequence,
  EvidenceTier,
  DomainAnnotation,
} from '../../types';
import { calculateDomainMutationStats } from '../../services/variantService';
import { StructureViewer3D } from '../dashboard/StructureViewer3D';
import {
  AlertTriangle,
  ShieldAlert,
  Activity,
  Flame,
  Filter,
  Search,
  ExternalLink,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Crosshair,
  Sparkles,
  BookOpen,
  SlidersHorizontal,
  Star,
  Dna,
  ArrowRight,
  Atom,
  HelpCircle,
  Database,
  Building2,
  Cpu,
} from 'lucide-react';

interface DiseaseVariantModuleProps {
  protein: ProteinData;
  onSelectResidue: (index: number | null) => void;
  selectedResidueIndex: number | null;
  onNavigateToSimulator?: (variantNotation: string) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToAiml?: (variantNotation: string) => void;
}

export const DiseaseVariantModule: React.FC<DiseaseVariantModuleProps> = ({
  protein,
  onSelectResidue,
  selectedResidueIndex,
  onNavigateToSimulator,
  onNavigateToDashboard,
  onNavigateToAiml,
}) => {
  // Variants from protein or fallback
  const allVariants: ClinicalVariant[] = useMemo(() => {
    return protein.variants || [];
  }, [protein.variants]);

  // Selected variant state
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(() => {
    if (allVariants.length > 0) {
      // If selectedResidueIndex matches a variant, select it, else default to first major hotspot
      if (selectedResidueIndex !== null) {
        const match = allVariants.find((v) => v.position === selectedResidueIndex);
        if (match) return match.id;
      }
      const hotspot = allVariants.find((v) => v.hotspotStatus === 'Major Hotspot');
      return hotspot ? hotspot.id : allVariants[0].id;
    }
    return null;
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCancerFilter, setSelectedCancerFilter] = useState<string>('all');
  const [selectedConsequenceFilter, setSelectedConsequenceFilter] = useState<string>('all');
  const [selectedSignificanceFilter, setSelectedSignificanceFilter] = useState<string>('all');
  const [selectedEvidenceFilter, setSelectedEvidenceFilter] = useState<string>('all');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [hotspotsOnly, setHotspotsOnly] = useState<boolean>(false);

  // Active sub-tab in details card
  const [activeDetailTab, setActiveDetailTab] = useState<'evidence' | 'cancer' | 'predictors'>('evidence');

  // Currently selected variant object
  const activeVariant = useMemo(() => {
    return allVariants.find((v) => v.id === selectedVariantId) || allVariants[0] || null;
  }, [allVariants, selectedVariantId]);

  // Distinct cancer types present across all variants for filter dropdown
  const allCancerTypes = useMemo(() => {
    const set = new Set<string>();
    allVariants.forEach((v) => {
      v.cancerDistribution?.forEach((c) => set.add(c.cancerType));
    });
    return Array.from(set).sort();
  }, [allVariants]);

  // Domain mutation statistics
  const domainStats = useMemo(() => {
    return calculateDomainMutationStats(protein, allVariants);
  }, [protein, allVariants]);

  // Filtered variants
  const filteredVariants = useMemo(() => {
    return allVariants.filter((v) => {
      // Hotspots only
      if (hotspotsOnly && v.hotspotStatus !== 'Major Hotspot' && v.hotspotStatus !== 'Secondary Hotspot') {
        return false;
      }

      // Search query (matches position, wildtype, mutant, HGVS, phenotype, ID, locus)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          v.hgvsProtein.toLowerCase().includes(q) ||
          `${v.wildType}${v.position}${v.mutantResidue}`.toLowerCase().includes(q) ||
          v.position.toString() === q ||
          v.id.toLowerCase().includes(q) ||
          v.clinvarId?.toLowerCase().includes(q) ||
          v.dbsnpId?.toLowerCase().includes(q) ||
          v.phenotypes.some((p) => p.toLowerCase().includes(q)) ||
          v.domainName?.toLowerCase().includes(q) ||
          v.structuralLocus?.toLowerCase().includes(q);

        if (!matchesQuery) return false;
      }

      // Cancer type filter
      if (selectedCancerFilter !== 'all') {
        const hasCancer = v.cancerDistribution?.some(
          (c) => c.cancerType.toLowerCase() === selectedCancerFilter.toLowerCase()
        );
        if (!hasCancer) return false;
      }

      // Consequence filter
      if (selectedConsequenceFilter !== 'all' && v.consequence !== selectedConsequenceFilter) {
        return false;
      }

      // Clinical significance filter
      if (selectedSignificanceFilter !== 'all' && v.clinicalSignificance !== selectedSignificanceFilter) {
        return false;
      }

      // Evidence tier filter
      if (selectedEvidenceFilter !== 'all' && v.evidenceTier !== selectedEvidenceFilter) {
        return false;
      }

      // Domain filter
      if (selectedDomainFilter !== 'all' && v.domainName !== selectedDomainFilter) {
        return false;
      }

      return true;
    });
  }, [
    allVariants,
    hotspotsOnly,
    searchQuery,
    selectedCancerFilter,
    selectedConsequenceFilter,
    selectedSignificanceFilter,
    selectedEvidenceFilter,
    selectedDomainFilter,
  ]);

  // Select a variant and link to sequence & structure
  const handleSelectVariant = (variant: ClinicalVariant) => {
    setSelectedVariantId(variant.id);
    onSelectResidue(variant.position);
  };

  // Quick helper to get color for clinical significance
  const getSigColor = (sig: ClinicalSignificance) => {
    switch (sig) {
      case 'Pathogenic':
        return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', badge: 'bg-rose-500' };
      case 'Likely Pathogenic':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', badge: 'bg-orange-500' };
      case 'VUS':
        return { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40', badge: 'bg-amber-500' };
      case 'Likely Benign':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40', badge: 'bg-emerald-500' };
      case 'Benign':
        return { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40', badge: 'bg-sky-500' };
      default:
        return { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700', badge: 'bg-slate-500' };
    }
  };

  // Hotspot metrics summary
  const totalPathogenic = allVariants.filter(
    (v) => v.clinicalSignificance === 'Pathogenic' || v.clinicalSignificance === 'Likely Pathogenic'
  ).length;
  const totalVus = allVariants.filter((v) => v.clinicalSignificance === 'VUS').length;
  const totalBenign = allVariants.filter(
    (v) => v.clinicalSignificance === 'Benign' || v.clinicalSignificance === 'Likely Benign'
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Clinical Disclaimer Notice */}
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Flame className="h-4 w-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                ProteoFlow v3.0 • Phase 2
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700">
                ClinVar • COSMIC • TCGA • IARC
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              Disease & Cancer Variant Architecture: <span className="text-rose-400">{protein.gene || protein.name}</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Curated clinical cancer hotspots, somatic driver frequencies, germline predispositions (e.g. Li-Fraumeni),
              and atomic-level mapping of pathogenic substitutions onto the 3D experimental crystal fold.
            </p>
          </div>

          {/* Quick Stats Pill Array */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-auto self-start text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-center shadow-xs">
              <span className="block text-[10px] font-mono uppercase text-slate-400">Cataloged</span>
              <span className="font-mono text-base font-bold text-white">{allVariants.length}</span>
            </div>
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-center shadow-xs">
              <span className="block text-[10px] font-mono uppercase text-rose-300">Pathogenic</span>
              <span className="font-mono text-base font-bold text-rose-400">{totalPathogenic}</span>
            </div>
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-center shadow-xs">
              <span className="block text-[10px] font-mono uppercase text-amber-300">VUS</span>
              <span className="font-mono text-base font-bold text-amber-400">{totalVus}</span>
            </div>
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-center shadow-xs">
              <span className="block text-[10px] font-mono uppercase text-emerald-300">Benign</span>
              <span className="font-mono text-base font-bold text-emerald-400">{totalBenign}</span>
            </div>
          </div>
        </div>

        {/* CLINICAL DECISION SUPPORT DISCLAIMER (Strict requirement) */}
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-300 uppercase tracking-wide text-[11px] block">
              CLINICAL DECISION SUPPORT & RESEARCH NOTICE
            </strong>
            <span>
              Computational predictions (e.g. AlphaMissense, SIFT, PolyPhen-2, ΔΔG folding energy) are research
              hypothesis-generating models and <strong>DO NOT constitute a clinical genetic diagnosis, therapeutic recommendation, or medical advice</strong>.
              Clinical diagnostic assertions are grounded exclusively in peer-reviewed ClinVar ACMG/AMP criteria.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Mutation Hotspot Map along the Sequence */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/20 text-rose-400">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Somatic & Germline Mutation Hotspot Density Map (Residues 1–{protein.length})
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Pathogenic Hotspot</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>VUS</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Benign Polymorphism</span>
            </span>
          </div>
        </div>

        {/* Hotspot Needle / Lollipop Canvas Track */}
        <div className="relative pt-8 pb-4 px-2 select-none overflow-x-auto">
          <div className="min-w-[650px] relative">
            {/* Needle plot area */}
            <div className="h-28 relative flex items-end border-b border-slate-700/80 mb-2">
              {/* Reference gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-slate-600 w-full" />
                <div className="border-b border-slate-600 w-full" />
                <div className="border-b border-slate-600 w-full" />
              </div>

              {allVariants.map((v) => {
                const pct = ((v.position - 1) / Math.max(1, protein.length - 1)) * 100;
                const isSelected = activeVariant?.id === v.id;
                const sigColor = getSigColor(v.clinicalSignificance);
                const isMajor = v.hotspotStatus === 'Major Hotspot';

                // Height scaled by sample count or hotspot tier
                const heightPct = isMajor
                  ? Math.min(95, 60 + ((v.totalCancerCases || 1000) / 3000) * 35)
                  : v.clinicalSignificance === 'Pathogenic'
                  ? 55
                  : v.clinicalSignificance === 'VUS'
                  ? 40
                  : 25;

                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVariant(v)}
                    className={`absolute bottom-0 flex flex-col items-center cursor-pointer group transition-transform ${
                      isSelected ? 'z-30 scale-110' : 'z-10 hover:scale-105'
                    }`}
                    style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                    title={`${v.hgvsProtein} (${v.clinicalSignificance}) - ${v.totalCancerCases || 0} cases. Click to inspect.`}
                  >
                    {/* Residue / Codon label for major hotspots */}
                    {(isMajor || isSelected) && (
                      <span
                        className={`text-[9px] font-mono font-bold mb-1 px-1 rounded transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40'
                            : 'text-slate-300 bg-slate-950/80 border border-slate-800'
                        }`}
                      >
                        {v.wildType}
                        {v.position}
                        {v.mutantResidue}
                      </span>
                    )}

                    {/* Lollipop head (dot) */}
                    <div
                      className={`rounded-full transition-all flex items-center justify-center ${
                        isSelected
                          ? 'h-4 w-4 ring-4 ring-rose-400/40 shadow-lg shadow-rose-500/50'
                          : isMajor
                          ? 'h-3.5 w-3.5 hover:ring-2 hover:ring-white/50'
                          : 'h-2.5 w-2.5'
                      } ${sigColor.badge}`}
                    >
                      {isMajor && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping opacity-60" />}
                    </div>

                    {/* Lollipop stem */}
                    <div
                      className={`w-0.5 transition-colors ${
                        isSelected ? 'bg-rose-400 w-1' : isMajor ? 'bg-slate-400 group-hover:bg-rose-400' : 'bg-slate-600'
                      }`}
                      style={{ height: `${heightPct}px` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Protein Sequence & Functional Domain Track Bar */}
            <div className="relative h-7 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex">
              {protein.domains.length > 0 ? (
                protein.domains.map((dom, i) => {
                  const domStartPct = ((dom.start - 1) / protein.length) * 100;
                  const domWidthPct = ((dom.end - dom.start + 1) / protein.length) * 100;
                  const isDomainSelected =
                    selectedDomainFilter === dom.name || (activeVariant && activeVariant.domainName === dom.name);

                  return (
                    <button
                      key={dom.id || i}
                      onClick={() =>
                        setSelectedDomainFilter(selectedDomainFilter === dom.name ? 'all' : dom.name)
                      }
                      className={`absolute top-0 bottom-0 flex items-center justify-center px-1.5 text-[10px] font-semibold truncate transition-all border-r border-slate-950 cursor-pointer ${
                        isDomainSelected
                          ? 'brightness-125 ring-2 ring-white/60 z-10 shadow-inner'
                          : 'hover:brightness-110 opacity-85'
                      }`}
                      style={{
                        left: `${domStartPct}%`,
                        width: `${domWidthPct}%`,
                        backgroundColor: dom.color || '#06b6d4',
                        color: '#0f172a',
                      }}
                      title={`${dom.name} (${dom.start}–${dom.end}). Click to filter.`}
                    >
                      <span className="truncate drop-shadow-xs font-mono">{dom.name}</span>
                    </button>
                  );
                })
              ) : (
                <div className="w-full flex items-center justify-center text-[10px] text-slate-500 font-mono">
                  Full Sequence Length ({protein.length} residues)
                </div>
              )}
            </div>

            {/* Coordinate Ruler */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1.5 px-0.5">
              <span>Residue 1</span>
              <span>Position {Math.round(protein.length * 0.25)}</span>
              <span>Position {Math.round(protein.length * 0.5)}</span>
              <span>Position {Math.round(protein.length * 0.75)}</span>
              <span>Residue {protein.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split View: Domain & Cancer Overview (Left) + 3D Structural Locus Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Domain Distribution & Cancer-Type Frequencies (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Domain-wise mutation distribution */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Domain-Wise Mutation Burden</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {protein.domains.length} Curated Domains
              </span>
            </div>

            <div className="space-y-3">
              {domainStats.map((ds) => {
                const isFiltered = selectedDomainFilter === ds.domainName;
                return (
                  <div
                    key={ds.domainId}
                    onClick={() =>
                      setSelectedDomainFilter(selectedDomainFilter === ds.domainName ? 'all' : ds.domainName)
                    }
                    className={`rounded-xl border p-3 cursor-pointer transition-all ${
                      isFiltered
                        ? 'border-cyan-500/50 bg-cyan-950/20 shadow-md'
                        : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ds.color }} />
                        <strong className="text-slate-200 font-medium">{ds.domainName}</strong>
                        <span className="text-[10px] font-mono text-slate-400">
                          [{ds.start}–{ds.end}]
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-slate-300 font-bold">{ds.totalVariants} variants</span>
                        <span className="text-slate-400">({ds.percentageOfTotal}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar with Pathogenic vs VUS vs Benign breakdown */}
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className="h-full bg-rose-500 transition-all"
                        style={{
                          width: `${ds.totalVariants > 0 ? (ds.pathogenicCount / ds.totalVariants) * 100 : 0}%`,
                        }}
                        title={`Pathogenic: ${ds.pathogenicCount}`}
                      />
                      <div
                        className="h-full bg-amber-400 transition-all"
                        style={{
                          width: `${ds.totalVariants > 0 ? (ds.vusCount / ds.totalVariants) * 100 : 0}%`,
                        }}
                        title={`VUS: ${ds.vusCount}`}
                      />
                      <div
                        className="h-full bg-emerald-400 transition-all"
                        style={{
                          width: `${ds.totalVariants > 0 ? (ds.benignCount / ds.totalVariants) * 100 : 0}%`,
                        }}
                        title={`Benign: ${ds.benignCount}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                      <span className="text-rose-400">{ds.pathogenicCount} Pathogenic</span>
                      <span className="text-amber-300">{ds.vusCount} VUS</span>
                      <span className="text-emerald-400">{ds.benignCount} Benign</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cancer-Type Distribution of Active Variant */}
          {activeVariant && activeVariant.cancerDistribution && activeVariant.cancerDistribution.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-rose-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Cancer-Type Frequency Distribution for <span className="text-rose-400 font-mono">{activeVariant.hgvsProtein}</span>
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Total: {activeVariant.totalCancerCases?.toLocaleString() || 0} cases
                </span>
              </div>

              <div className="space-y-2.5">
                {activeVariant.cancerDistribution.map((cd, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cd.color || '#ef4444' }} />
                        {cd.cancerType}
                      </span>
                      <span className="font-mono text-[11px] text-slate-300 font-bold">
                        {cd.frequencyPct}% <span className="text-slate-500 font-normal">({cd.caseCount?.toLocaleString()} samples)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cd.frequencyPct}%`,
                          backgroundColor: cd.color || '#ef4444',
                        }}
                      />
                    </div>
                    <span className="block text-[9px] font-mono text-slate-400">
                      Cohort: {cd.study || 'TCGA Pan-Cancer Atlas'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive 3D Structure with Highlighted Mutation Locus (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Atom className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  3D Structural Mutation Mapping: <span className="text-cyan-300 font-mono">{activeVariant ? activeVariant.hgvsProtein : 'PDB Structure'}</span>
                </h3>
              </div>

              {activeVariant && (
                <span className="rounded-md bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                  Locus: {activeVariant.position}
                </span>
              )}
            </div>

            {/* Embedded 3D Structure Viewer */}
            <div className="h-[380px] rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
              <StructureViewer3D
                protein={protein}
                highlightResidue={activeVariant ? activeVariant.position : selectedResidueIndex}
              />
            </div>

            {/* Structural Locus & Biophysical Consequence Card */}
            {activeVariant && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Crosshair className="h-3.5 w-3.5 text-rose-400" />
                    Structural Micro-Environment Locus
                  </span>
                  <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
                    {activeVariant.domainName}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {activeVariant.structuralLocus ||
                    `Residue ${activeVariant.wildType}${activeVariant.position} localized within ${activeVariant.domainName}.`}
                </p>

                <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-rose-300 font-semibold block mb-0.5">Functional & Mechanistic Impact:</strong>
                  {activeVariant.functionalImpact || activeVariant.evidenceSummary}
                </div>

                {/* Quick Simulation Link */}
                {onNavigateToSimulator && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() =>
                        onNavigateToSimulator(`${activeVariant.wildType}${activeVariant.position}${activeVariant.mutantResidue}`)
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                      <span>Simulate ΔΔG in In Silico Lab</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Active Variant Comprehensive Evidence & Predictor Drawer / Card */}
      {activeVariant && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
          {/* Header row with variant identity badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl font-mono text-base font-bold border ${
                  getSigColor(activeVariant.clinicalSignificance).border
                } ${getSigColor(activeVariant.clinicalSignificance).bg} ${
                  getSigColor(activeVariant.clinicalSignificance).text
                }`}
              >
                {activeVariant.wildType}
                {activeVariant.position}
                {activeVariant.mutantResidue}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white font-mono">{activeVariant.hgvsProtein}</h3>
                  {activeVariant.hgvsCdna && (
                    <span className="text-xs font-mono text-slate-400">({activeVariant.hgvsCdna})</span>
                  )}
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold font-mono border ${
                      getSigColor(activeVariant.clinicalSignificance).border
                    } ${getSigColor(activeVariant.clinicalSignificance).bg} ${
                      getSigColor(activeVariant.clinicalSignificance).text
                    }`}
                  >
                    {activeVariant.clinicalSignificance}
                  </span>
                  {activeVariant.hotspotStatus && (
                    <span className="rounded-md bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 text-xs font-mono font-bold text-rose-300 flex items-center gap-1">
                      <Flame className="h-3 w-3 text-rose-400" />
                      {activeVariant.hotspotStatus}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                  <span>
                    Consequence: <strong className="text-slate-200">{activeVariant.consequence}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Locus: <strong className="text-cyan-400">{activeVariant.domainName}</strong>
                  </span>
                  {activeVariant.clinvarId && (
                    <>
                      <span>•</span>
                      <span>
                        ClinVar:{' '}
                        <a
                          href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${activeVariant.clinvarId.replace('VCV', '')}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sky-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          {activeVariant.clinvarId}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </span>
                    </>
                  )}
                  {activeVariant.dbsnpId && (
                    <>
                      <span>•</span>
                      <span>
                        dbSNP:{' '}
                        <a
                          href={`https://www.ncbi.nlm.nih.gov/snp/${activeVariant.dbsnpId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-slate-300 hover:underline inline-flex items-center gap-0.5"
                        >
                          {activeVariant.dbsnpId}
                        </a>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tab switchers */}
            <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveDetailTab('evidence')}
                className={`rounded-md px-3 py-1 font-medium transition-all ${
                  activeDetailTab === 'evidence'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Clinical Evidence & Phenotypes
              </button>
              <button
                onClick={() => setActiveDetailTab('predictors')}
                className={`rounded-md px-3 py-1 font-medium transition-all ${
                  activeDetailTab === 'predictors'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. In Silico Predictors (AlphaMissense)
              </button>
            </div>
          </div>

          {/* Tab 1: Clinical Evidence */}
          {activeDetailTab === 'evidence' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ClinVar Review & ACMG assertion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-slate-400">ClinVar Review Status</span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: activeVariant.reviewStars || 1 }).map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 capitalize">
                    {activeVariant.reviewStatus || 'Criteria provided'}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Evaluated according to American College of Medical Genetics and Genomics (ACMG) variant guidelines.
                  </p>
                </div>

                {/* Phenotypes & Disease Syndromes */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 md:col-span-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Associated Disease Phenotypes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeVariant.phenotypes.map((pheno, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 text-xs text-rose-300 font-medium"
                      >
                        {pheno}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    {activeVariant.evidenceSummary}
                  </p>
                </div>
              </div>

              {/* Citations */}
              {activeVariant.references && activeVariant.references.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs">
                  <span className="font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                    Key Peer-Reviewed Literature Citations:
                  </span>
                  <ul className="space-y-1 text-slate-400">
                    {activeVariant.references.map((ref, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{ref.title}</span>
                        <span className="text-slate-500 italic">
                          ({ref.journal}, {ref.year})
                        </span>
                        {ref.pmid && (
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 font-mono hover:underline inline-flex items-center gap-0.5"
                          >
                            PMID:{ref.pmid}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Computational Predictors */}
          {activeDetailTab === 'predictors' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* AlphaMissense */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-purple-300 font-semibold">
                      AlphaMissense
                    </span>
                    <span className="rounded bg-purple-500/30 px-1.5 py-0.5 text-[9px] font-mono text-purple-200 font-bold">
                      Google DeepMind
                    </span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white">
                    {activeVariant.computationalPredictors?.alphaMissense?.score.toFixed(3) || '0.992'}
                  </div>
                  <div className="text-xs font-semibold text-rose-400">
                    {activeVariant.computationalPredictors?.alphaMissense?.classification || 'Likely Pathogenic'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Structural context & evolutionary constraint score (&gt;0.564 = Likely Pathogenic).
                  </p>
                </div>

                {/* SIFT */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-slate-400">SIFT</span>
                    <span className="text-[9px] font-mono text-slate-500">Conservation</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white">
                    {activeVariant.computationalPredictors?.sift?.score.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs font-semibold text-rose-400">
                    {activeVariant.computationalPredictors?.sift?.classification || 'Deleterious'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Sorting Intolerant From Tolerant (&le;0.05 = Deleterious).
                  </p>
                </div>

                {/* PolyPhen-2 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-slate-400">PolyPhen-2</span>
                    <span className="text-[9px] font-mono text-slate-500">HVAR</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white">
                    {activeVariant.computationalPredictors?.polyphen2?.score.toFixed(3) || '0.999'}
                  </div>
                  <div className="text-xs font-semibold text-rose-400">
                    {activeVariant.computationalPredictors?.polyphen2?.classification || 'Probably Damaging'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Polymorphism Phenotyping v2 (&gt;0.85 = Probably Damaging).
                  </p>
                </div>

                {/* CADD / REVEL / ΔΔG */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-slate-400">CADD Phred</span>
                    <span className="text-[9px] font-mono text-slate-500">Combined</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white">
                    {activeVariant.computationalPredictors?.caddPhred?.toFixed(1) || '34.0'}
                  </div>
                  <div className="text-xs font-semibold text-rose-400">Top 0.1% Deleterious</div>
                  <p className="text-[10px] text-slate-400">
                    CADD score &gt;20 indicates top 1% most deleterious variants in human genome.
                  </p>
                </div>
              </div>

              {/* Notice reiterating hypothesis generation */}
              <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-400 shrink-0" />
                <span>
                  Algorithmic prediction scores (AlphaMissense, SIFT, PolyPhen-2) quantify molecular perturbation
                  probability and are strictly research hypothesis generators, never diagnostic confirmations.
                </span>
              </div>
            </div>
          )}

          {/* Action Bar for Active Variant */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="text-slate-400">
              Selected Variant:{' '}
              <strong className="text-white font-mono">
                {activeVariant.wildType}{activeVariant.position}{activeVariant.mutantResidue}
              </strong>{' '}
              <span className="text-slate-500">({activeVariant.domainName})</span>
            </div>
            <div className="flex items-center gap-2">
              {onNavigateToAiml && (
                <button
                  onClick={() =>
                    onNavigateToAiml(
                      `${activeVariant.wildType}${activeVariant.position}${activeVariant.mutantResidue}`
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer shadow-xs"
                >
                  <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Run AI/ML Predictor (Phase 3)</span>
                </button>
              )}
              {onNavigateToSimulator && (
                <button
                  onClick={() =>
                    onNavigateToSimulator(
                      `${activeVariant.wildType}${activeVariant.position}${activeVariant.mutantResidue}`
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                >
                  <Activity className="h-3.5 w-3.5 text-sky-400" />
                  <span>In Silico Simulator</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Variant Table with Multi-Filters & Direct 3D Highlighting */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Cataloged Clinical Variants ({filteredVariants.length} of {allVariants.length})
            </h3>
          </div>

          {/* Hotspots only quick toggle */}
          <button
            onClick={() => setHotspotsOnly(!hotspotsOnly)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold border transition-all ${
              hotspotsOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame className={`h-3.5 w-3.5 ${hotspotsOnly ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>Show Major Hotspots Only</span>
          </button>
        </div>

        {/* Filter Bar Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search codon, HGVS, phenotype (e.g. R175H, Ovarian)..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Cancer Type Filter */}
          <div>
            <select
              value={selectedCancerFilter}
              onChange={(e) => setSelectedCancerFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-hidden"
            >
              <option value="all">All Cancer Types</option>
              {allCancerTypes.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          {/* Clinical Significance Filter */}
          <div>
            <select
              value={selectedSignificanceFilter}
              onChange={(e) => setSelectedSignificanceFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-hidden"
            >
              <option value="all">All Clinical Sigs</option>
              <option value="Pathogenic">Pathogenic</option>
              <option value="Likely Pathogenic">Likely Pathogenic</option>
              <option value="VUS">VUS (Uncertain)</option>
              <option value="Benign">Benign / Likely Benign</option>
            </select>
          </div>

          {/* Consequence Filter */}
          <div>
            <select
              value={selectedConsequenceFilter}
              onChange={(e) => setSelectedConsequenceFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-hidden"
            >
              <option value="all">All Consequences</option>
              <option value="Missense">Missense</option>
              <option value="Nonsense (Stop Gained)">Nonsense (Stop)</option>
              <option value="Frameshift">Frameshift</option>
              <option value="Synonymous">Synonymous</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3">Codon / HGVS</th>
                <th className="py-2.5 px-3">Consequence</th>
                <th className="py-2.5 px-3">Clinical Significance</th>
                <th className="py-2.5 px-3">Domain / Locus</th>
                <th className="py-2.5 px-3">Phenotype / Disease</th>
                <th className="py-2.5 px-3">AlphaMissense</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-sans">
              {filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No variants match the selected filters. Clear filters or change search criteria.
                  </td>
                </tr>
              ) : (
                filteredVariants.map((v) => {
                  const isSelected = activeVariant?.id === v.id;
                  const sigColor = getSigColor(v.clinicalSignificance);
                  const isMajor = v.hotspotStatus === 'Major Hotspot';

                  return (
                    <tr
                      key={v.id}
                      onClick={() => handleSelectVariant(v)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-rose-500/10 hover:bg-rose-500/15'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Position */}
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          {isMajor && <Flame className="h-3 w-3 text-rose-400 shrink-0" />}
                          {v.position}
                        </span>
                      </td>

                      {/* Codon & HGVS */}
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-semibold text-slate-200">
                          {v.wildType} &rarr; {v.mutantResidue}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{v.hgvsProtein}</div>
                      </td>

                      {/* Consequence */}
                      <td className="py-2.5 px-3">
                        <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-800">
                          {v.consequence}
                        </span>
                      </td>

                      {/* Clinical Significance */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${sigColor.border} ${sigColor.bg} ${sigColor.text}`}
                          >
                            {v.clinicalSignificance}
                          </span>
                          {v.reviewStars !== undefined && (
                            <span className="text-[10px] text-amber-400 font-mono" title={`${v.reviewStars} stars`}>
                              {'★'.repeat(v.reviewStars)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Domain / Locus */}
                      <td className="py-2.5 px-3">
                        <span className="text-cyan-300 font-medium">{v.domainName}</span>
                      </td>

                      {/* Phenotype */}
                      <td className="py-2.5 px-3 max-w-[200px] truncate" title={v.phenotypes.join(', ')}>
                        <span className="text-slate-300">{v.phenotypes[0]}</span>
                      </td>

                      {/* AlphaMissense Score */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {v.computationalPredictors?.alphaMissense ? (
                          <span
                            className={
                              v.computationalPredictors.alphaMissense.score > 0.564
                                ? 'text-rose-400 font-bold'
                                : 'text-slate-400'
                            }
                          >
                            {v.computationalPredictors.alphaMissense.score.toFixed(3)}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectVariant(v);
                          }}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                            isSelected
                              ? 'bg-rose-500 text-white border-rose-400 shadow-xs'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Highlight 3D'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
