import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Flame,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ProteinData, MutationSimulation } from '../../types';
import { simulateMutation, AMINO_ACIDS } from '../../utils/bioinformatics';

interface MutationSimulatorProps {
  currentProtein: ProteinData;
  mutations: MutationSimulation[];
  onAddMutation: (mut: MutationSimulation) => void;
  onRemoveMutation: (id: string) => void;
  onClearMutations: () => void;
  initialResiduePos?: number | null;
}

export const MutationSimulator: React.FC<MutationSimulatorProps> = ({
  currentProtein,
  mutations,
  onAddMutation,
  onRemoveMutation,
  onClearMutations,
  initialResiduePos,
}) => {
  const [mutationInput, setMutationInput] = useState(() => {
    if (initialResiduePos && currentProtein.sequence[initialResiduePos - 1]) {
      return `${currentProtein.sequence[initialResiduePos - 1]}${initialResiduePos}A`;
    }
    // Default demo mutation based on protein
    if (currentProtein.gene === 'HBB') return 'E6V';
    if (currentProtein.gene === 'TP53') return 'R248W';
    if (currentProtein.gene === 'UBB') return 'K48R';
    if (currentProtein.id.includes('6M0J') || currentProtein.name.includes('Spike')) return 'N501Y';
    return `A1V`;
  });

  const [inputError, setInputError] = useState<string | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutationInput.trim()) return;

    const result = simulateMutation(currentProtein, mutationInput.trim());
    if ('error' in result) {
      setInputError(result.error);
    } else {
      setInputError(null);
      onAddMutation(result);
    }
  };

  const getStabilityBadge = (stability: MutationSimulation['predictedStability']) => {
    switch (stability) {
      case 'Stabilizing':
        return 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300';
      case 'Neutral':
        return 'border-slate-700 bg-slate-800 text-slate-300';
      case 'Destabilizing':
        return 'border-amber-500/30 bg-amber-950/40 text-amber-300';
      case 'Highly Destabilizing':
        return 'border-rose-500/40 bg-rose-950/50 text-rose-300';
    }
  };

  const getPathogenicityBadge = (tier: MutationSimulation['pathogenicityClassification']) => {
    switch (tier) {
      case 'Pathogenic':
        return 'border-rose-500/40 bg-rose-950/60 text-rose-300 font-bold';
      case 'Likely Pathogenic':
        return 'border-orange-500/40 bg-orange-950/50 text-orange-300';
      case 'Variant of Uncertain Significance':
        return 'border-amber-500/30 bg-amber-950/40 text-amber-300';
      case 'Likely Benign':
      case 'Benign':
        return 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300';
    }
  };

  // Quick preset shortcuts based on current protein
  const getQuickShortcuts = () => {
    if (currentProtein.gene === 'HBB') {
      return ['E6V (Sickle cell HbS)', 'E6K (Hemoglobin C)', 'H64A (Distal His ablated)', 'H93A (Proximal His)'];
    }
    if (currentProtein.gene === 'TP53') {
      return ['R248W (Li-Fraumeni)', 'R273H (DNA contact)', 'C176F (Loss of Zinc coordination)'];
    }
    if (currentProtein.gene === 'UBB') {
      return ['K48R (Blocks canonical degradation)', 'K63R (Blocks DNA repair)', 'G76A (Blocks isopeptide bond)'];
    }
    if (currentProtein.id.includes('6M0J') || currentProtein.name.includes('Spike')) {
      return ['N501Y (Alpha/Beta/Omicron)', 'E484K (Immune evasion)', 'K417N (ACE2 contact)'];
    }
    return ['A10V', 'L25P', 'C50S'];
  };

  return (
    <div id="mutation-analysis-card" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Point Mutation Simulator & Thermodynamic Impact Predictor
            </h3>
            <p className="text-[11px] text-slate-400">
              Calculate delta-charge, hydropathy shifts, stability impact & PolyPhen-equivalent pathogenicity
            </p>
          </div>
        </div>

        {mutations.length > 0 && (
          <button
            onClick={onClearMutations}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Clear Tested ({mutations.length})
          </button>
        )}
      </div>

      {/* Input & Simulation Form */}
      <div className="mt-4 space-y-3">
        <form onSubmit={handleSimulate} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              id="mutation-input-field"
              type="text"
              value={mutationInput}
              onChange={(e) => setMutationInput(e.target.value.toUpperCase())}
              placeholder="e.g. E6V, R248W, K48R"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 font-mono text-xs text-slate-200 uppercase placeholder:normal-case placeholder:text-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <button
            id="simulate-mutation-btn"
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-500 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Simulate Variant</span>
          </button>
        </form>

        {/* Quick mutation shortcut chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span>Clinical / Benchmark Presets:</span>
          {getQuickShortcuts().map((shortcut, idx) => {
            const code = shortcut.split(' ')[0];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMutationInput(code);
                  const result = simulateMutation(currentProtein, code);
                  if (!('error' in result)) onAddMutation(result);
                }}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-0.5 text-slate-300 hover:text-rose-300 hover:border-rose-500/40 transition-all"
              >
                {shortcut}
              </button>
            );
          })}
        </div>

        {/* Error Alert */}
        {inputError && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-800/60 bg-rose-950/40 p-2.5 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      {/* Simulated Mutations List */}
      <div className="mt-4 space-y-3">
        {mutations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
            <Flame className="mx-auto h-6 w-6 text-slate-400 mb-2" />
            <p className="font-medium text-slate-300">No mutations modeled yet</p>
            <p className="text-[11px] mt-0.5">
              Enter a single amino acid substitution above (e.g. <strong>E6V</strong> or click a preset chip) to calculate thermodynamic delta-charge, hydropathy shifts, and structural consequences.
            </p>
          </div>
        ) : (
          mutations.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-800/90 bg-slate-950/80 p-4 transition-all hover:border-slate-700"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-base font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-0.5 rounded-lg">
                    {m.originalResidue}{m.position}{m.mutatedResidue}
                  </span>
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200">
                      {AMINO_ACIDS[m.originalResidue]?.name || m.originalResidue} → {AMINO_ACIDS[m.mutatedResidue]?.name || m.mutatedResidue}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">
                      (Position {m.position})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${getStabilityBadge(m.predictedStability)}`}>
                    {m.predictedStability}
                  </span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] uppercase ${getPathogenicityBadge(m.pathogenicityClassification)}`}>
                    {m.pathogenicityClassification}
                  </span>
                  <button
                    onClick={() => onRemoveMutation(m.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove mutation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
                <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Δ Charge (pH 7.4)</span>
                  <span
                    className={`font-mono font-bold ${
                      m.deltaCharge > 0 ? 'text-sky-400' : m.deltaCharge < 0 ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    {m.deltaCharge > 0 ? `+${m.deltaCharge.toFixed(1)}` : m.deltaCharge.toFixed(1)} e
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Δ Hydropathy (KD)</span>
                  <span
                    className={`font-mono font-bold ${
                      m.deltaHydropathy > 0 ? 'text-amber-400' : m.deltaHydropathy < 0 ? 'text-cyan-400' : 'text-slate-300'
                    }`}
                  >
                    {m.deltaHydropathy > 0 ? `+${m.deltaHydropathy.toFixed(1)}` : m.deltaHydropathy.toFixed(1)}
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Polarity Shift</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {m.polarityShift}
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Impact Score (0-100)</span>
                  <span className="font-mono font-bold text-rose-400">
                    {m.functionalImpactScore}/100
                  </span>
                </div>
              </div>

              {/* Explanation & Structural Risk */}
              <div className="mt-2.5 rounded-lg bg-slate-900/40 p-2.5 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                <span className="font-semibold text-cyan-300 block mb-0.5">Biophysical Impact Hypothesis:</span>
                {m.mechanismExplanation}
              </div>

              {/* ClinVar / Known Landmark Association */}
              {m.clinVarAssociation && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-800/50 bg-amber-950/30 px-2.5 py-1.5 text-[11px] text-amber-200">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>
                    <strong>Clinical Landmark:</strong> {m.clinVarAssociation}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
