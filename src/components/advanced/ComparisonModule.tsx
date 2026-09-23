import React, { useState } from 'react';
import { GitCompare, Play, RotateCcw, Check, Sparkles, Sliders } from 'lucide-react';
import { ProteinData, AlignmentResult } from '../../types';
import { performPairwiseAlignment } from '../../utils/bioinformatics';
import { PRESET_PROTEINS } from '../../data/presets';

interface ComparisonModuleProps {
  currentProtein: ProteinData;
}

export const ComparisonModule: React.FC<ComparisonModuleProps> = ({ currentProtein }) => {
  // Preset comparison sequences
  const getReferenceOptions = () => {
    if (currentProtein.gene === 'HBB') {
      return [
        {
          label: 'Sickle Cell Beta Globin (HbS - E6V)',
          seq: currentProtein.sequence.slice(0, 5) + 'V' + currentProtein.sequence.slice(6),
        },
        {
          label: 'Sperm Whale Myoglobin (P02144)',
          seq: PRESET_PROTEINS['P02144']?.sequence || '',
        },
      ];
    }
    if (currentProtein.gene === 'UBB') {
      return [
        {
          label: 'Ubiquitin K48R Variant',
          seq: currentProtein.sequence.slice(0, 47) + 'R' + currentProtein.sequence.slice(48),
        },
        {
          label: 'SUMO-1 Ubiquitin-like Modifier',
          seq: 'MSDQEAKPSTEDLGDKKEGEYIKLKVIGQDSSEIHFKVKMTTHLKKLKESYCQRQGVPMNSLRFLFEGQRIADNHTPKELGMEEEDVIEVYQEQTGGHSTV',
        },
      ];
    }
    if (currentProtein.id.includes('6M0J') || currentProtein.name.includes('Spike')) {
      return [
        {
          label: 'SARS-CoV-1 Spike RBD (P59594)',
          seq: 'RVVPSGDVVRFPNITNLCPFGEVFNATKFPSVYAWERKKISNCVADYSVLYNSTFFSTFKCYGVSATKLNDLCFSNVYADSFVVKGDDVRQIAPGQTGVIADYNYKLPDDFMGCVLAWNTRNIDATSTGNYNYKYRYLRHGKLRPFERDISNVPFSPDGKPCTP-PALNCYWPLNDYGFYTTTGIGYQPYRVVVLSFELLNAPATVCGPKLSTDLIKNQCVNF',
        },
      ];
    }

    return [
      {
        label: 'Homologous Sequence 1',
        seq: currentProtein.sequence.slice(0, Math.floor(currentProtein.sequence.length * 0.9)),
      },
    ];
  };

  const defaultRef = getReferenceOptions()[0]?.seq || currentProtein.sequence;
  const [refSequence, setRefSequence] = useState(defaultRef);
  const [gapPenalty, setGapPenalty] = useState(-2);
  const [alignment, setAlignment] = useState<AlignmentResult | null>(() =>
    performPairwiseAlignment(currentProtein.sequence, defaultRef, -2)
  );

  const handleRunAlignment = () => {
    if (!refSequence.trim()) return;
    const res = performPairwiseAlignment(currentProtein.sequence, refSequence.trim(), gapPenalty);
    setAlignment(res);
  };

  const handleLoadPresetRef = (seq: string) => {
    setRefSequence(seq);
    const res = performPairwiseAlignment(currentProtein.sequence, seq, gapPenalty);
    setAlignment(res);
  };

  // Chunk alignment for visual display (lines of 60 characters)
  const chunkSize = 60;
  const chunks: { a: string; m: string; b: string; start: number }[] = [];
  if (alignment) {
    for (let i = 0; i < alignment.alignedA.length; i += chunkSize) {
      chunks.push({
        a: alignment.alignedA.slice(i, i + chunkSize),
        m: alignment.matchLine.slice(i, i + chunkSize),
        b: alignment.alignedB.slice(i, i + chunkSize),
        start: i + 1,
      });
    }
  }

  return (
    <div id="comparison-analysis-card" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Pairwise Sequence Alignment & Homology Matrix
            </h3>
            <p className="text-[11px] text-slate-400">
              Needleman-Wunsch dynamic programming alignment against benchmark reference homologs
            </p>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Reference Presets:</span>
          {getReferenceOptions().map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadPresetRef(opt.seq)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input / Control Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Reference sequence input */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="ref-seq-textarea" className="font-semibold text-slate-300">
              Reference Polypeptide Sequence:
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {refSequence.replace(/[^A-Za-z]/g, '').length} AA
            </span>
          </div>
          <textarea
            id="ref-seq-textarea"
            rows={2}
            value={refSequence}
            onChange={(e) => setRefSequence(e.target.value.toUpperCase())}
            placeholder="Paste comparison protein sequence..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
          />
        </div>

        {/* Penalty & Run Alignment */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">Gap Penalty (d):</span>
              <span className="font-mono text-cyan-400 font-bold">{gapPenalty}</span>
            </div>
            <input
              type="range"
              min={-5}
              max={-1}
              value={gapPenalty}
              onChange={(e) => setGapPenalty(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <button
            id="run-alignment-btn"
            onClick={handleRunAlignment}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition-all shadow-sm"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Align Sequences</span>
          </button>
        </div>
      </div>

      {/* Alignment Metrics Badge Row */}
      {alignment && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Sequence Identity</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {alignment.identityPct.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Sequence Similarity</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold text-cyan-400">
                  {alignment.similarityPct.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Alignment Score</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold text-purple-400">
                  {alignment.score}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Total Gaps</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold text-amber-400">
                  {alignment.gaps}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Alignment Length</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold text-slate-200">
                  {alignment.length}
                </span>
                <span className="text-[10px] text-slate-400">pos</span>
              </div>
            </div>
          </div>

          {/* Formatted Alignment Block */}
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
              <span>Match Legend: <strong className="text-emerald-400">|</strong> Identical, <strong className="text-sky-400">:</strong> Conservative, <strong className="text-amber-400">-</strong> Gap</span>
              <span>Needleman-Wunsch Matrix</span>
            </div>

            <div className="space-y-3">
              {chunks.map((chunk, cIdx) => (
                <div key={cIdx} className="space-y-0.5 select-text">
                  {/* Query Seq */}
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-slate-400 text-[10px]">Query ({chunk.start})</span>
                    <span className="tracking-widest text-slate-200 font-semibold">{chunk.a}</span>
                  </div>

                  {/* Match Line */}
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-slate-400 text-[10px]" />
                    <span className="tracking-widest text-emerald-400 font-bold whitespace-pre">
                      {chunk.m}
                    </span>
                  </div>

                  {/* Ref Seq */}
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-slate-400 text-[10px]">Ref</span>
                    <span className="tracking-widest text-slate-300">{chunk.b}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
