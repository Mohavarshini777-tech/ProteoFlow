import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  BarChart2,
  Filter,
  Eye,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { ProteinData, DomainAnnotation, ActiveSiteResidue } from '../../types';
import { AMINO_ACIDS } from '../../utils/bioinformatics';

interface SequenceViewerProps {
  protein: ProteinData;
  onSelectResidue?: (index: number) => void;
  selectedResidueIndex?: number | null;
}

export const SequenceViewer: React.FC<SequenceViewerProps> = ({
  protein,
  onSelectResidue,
  selectedResidueIndex,
}) => {
  const [copied, setCopied] = useState(false);
  const [colorMode, setColorMode] = useState<'chemistry' | 'hydropathy' | 'standard'>('chemistry');
  const [showCompositionModal, setShowCompositionModal] = useState(false);
  const [activeDomainFilter, setActiveDomainFilter] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(`>${protein.id} ${protein.name}\n${protein.sequence}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to color residue
  const getResidueColor = (char: string) => {
    const info = AMINO_ACIDS[char];
    if (!info) return 'text-slate-300 bg-slate-800/40';

    if (colorMode === 'hydropathy') {
      if (info.hydropathy > 2.0) return 'text-amber-300 bg-amber-950/40 border-amber-800/40';
      if (info.hydropathy > 0) return 'text-yellow-200 bg-yellow-950/30 border-yellow-800/30';
      if (info.hydropathy < -2.0) return 'text-cyan-300 bg-cyan-950/40 border-cyan-800/40';
      return 'text-slate-300 bg-slate-800/30 border-slate-700/30';
    }

    if (colorMode === 'chemistry') {
      switch (info.category) {
        case 'acidic':
          return 'text-rose-400 bg-rose-950/30 border-rose-900/40';
        case 'basic':
          return 'text-sky-400 bg-sky-950/30 border-sky-900/40';
        case 'hydrophobic':
          return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40';
        case 'polar':
          return 'text-purple-300 bg-purple-950/30 border-purple-900/40';
        default:
          return 'text-amber-300 bg-amber-950/30 border-amber-900/40';
      }
    }

    return 'text-slate-200 bg-slate-900/50 border-slate-800';
  };

  // Check if position is active site
  const getActiveSiteAt = (pos: number): ActiveSiteResidue | undefined => {
    return protein.activeSites.find((s) => s.residueIndex === pos);
  };

  // Group sequence into lines of 50 residues (with 10-residue chunks)
  const chunkSize = 10;
  const lineSize = 50;
  const lines: { start: number; text: string }[] = [];
  for (let i = 0; i < protein.sequence.length; i += lineSize) {
    lines.push({
      start: i + 1,
      text: protein.sequence.slice(i, i + lineSize),
    });
  }

  return (
    <div id="sequence-analysis-card" className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Sequence Analysis & Physicochemical Metrics
            </h3>
            <p className="text-[11px] text-slate-400">
              Primary structure profiling, domain mapping & residue composition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-seq-btn"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-850 transition-all"
            title="Copy FASTA to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'FASTA'}</span>
          </button>
        </div>
      </div>

      {/* Physicochemical 6-Metric Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Length</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-cyan-400">{protein.length}</span>
            <span className="text-[10px] text-slate-400">AA</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Mol. Weight</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-emerald-400">
              {protein.molecularWeight.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">kDa</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Isoelectric Pt (pI)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-purple-400">
              {protein.isoelectricPoint.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">pH</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Charge (pH 7.4)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-lg font-mono font-bold ${
                protein.netChargePh74 > 0
                  ? 'text-sky-400'
                  : protein.netChargePh74 < 0
                  ? 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {protein.netChargePh74 > 0 ? `+${protein.netChargePh74.toFixed(1)}` : protein.netChargePh74.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">e</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Hydrophobic %</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-amber-400">
              {protein.hydrophobicRatio.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Extinction (ε280)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-teal-400">
              {protein.extinctionCoeff.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">M⁻¹cm⁻¹</span>
          </div>
        </div>
      </div>

      {/* Visual Sequence Segment Bar (Pfam / Domain track) */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Functional Domain Architecture (Pfam / UniProt Features)</span>
          </div>
          <span className="text-[11px] text-slate-400">1 — {protein.length} AA</span>
        </div>

        {/* Scaled Track Bar */}
        <div className="relative h-7 w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center">
          {protein.domains.length === 0 ? (
            <div className="w-full text-center text-[11px] text-slate-400">
              Full unsegmented open reading frame
            </div>
          ) : (
            protein.domains.map((dom, idx) => {
              const leftPct = ((dom.start - 1) / Math.max(1, protein.length)) * 100;
              const widthPct = Math.max(2, ((dom.end - dom.start + 1) / Math.max(1, protein.length)) * 100);
              const isFilterActive = activeDomainFilter === dom.id;

              return (
                <button
                  key={dom.id || idx}
                  onClick={() => setActiveDomainFilter(isFilterActive ? null : dom.id)}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    backgroundColor: dom.color ? `${dom.color}33` : '#06b6d433',
                    borderColor: dom.color || '#06b6d4',
                  }}
                  className={`absolute top-0.5 bottom-0.5 rounded-md border text-[10px] font-semibold text-slate-200 truncate px-1 flex items-center justify-center transition-all hover:brightness-125 cursor-pointer shadow-xs ${
                    isFilterActive ? 'ring-2 ring-white scale-105 z-10' : ''
                  }`}
                  title={`${dom.name} (${dom.start}-${dom.end}): ${dom.description || ''}`}
                >
                  <span className="truncate">{dom.name}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Legend of domains */}
        {protein.domains.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
            {protein.domains.map((dom, idx) => (
              <div
                key={dom.id || idx}
                className="flex items-center gap-1.5 rounded-md bg-slate-900 px-2 py-1 border border-slate-800 text-slate-300"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: dom.color || '#06b6d4' }}
                />
                <span className="font-medium text-slate-200">{dom.name}</span>
                <span className="font-mono text-[10px] text-slate-400">
                  [{dom.start}–{dom.end}]
                </span>
                {dom.source && (
                  <span className="rounded bg-slate-950 px-1.5 py-0.2 text-[9px] font-mono font-bold text-cyan-400 border border-slate-800">
                    {dom.source}
                  </span>
                )}
                {dom.evidenceCategory && (
                  <span className="rounded bg-slate-950 px-1.5 py-0.2 text-[9px] font-mono text-slate-400 border border-slate-800">
                    {dom.evidenceCategory}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Sequence Viewer with residue blocks and rulers */}
      <div className="mt-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">
            Residue Sequence Stream (Interactive Residue Selector):
          </span>

          <div className="flex items-center gap-2">
            {/* Color Scheme Picker */}
            <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
              <button
                onClick={() => setColorMode('chemistry')}
                className={`px-2 py-0.5 rounded ${colorMode === 'chemistry' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'}`}
              >
                Chemistry
              </button>
              <button
                onClick={() => setColorMode('hydropathy')}
                className={`px-2 py-0.5 rounded ${colorMode === 'hydropathy' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'}`}
              >
                Hydropathy
              </button>
              <button
                onClick={() => setColorMode('standard')}
                className={`px-2 py-0.5 rounded ${colorMode === 'standard' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'}`}
              >
                Monochrome
              </button>
            </div>

            {/* Composition Breakdown Trigger */}
            <button
              id="composition-breakdown-btn"
              onClick={() => setShowCompositionModal(!showCompositionModal)}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 hover:text-white"
            >
              <BarChart2 className="h-3 w-3 text-cyan-400" />
              <span>AA Composition</span>
            </button>
          </div>
        </div>

        {/* Amino Acid Composition Drawer / Table */}
        {showCompositionModal && (
          <div className="mb-3 rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-200">Amino Acid Frequency Distribution:</span>
              <button
                onClick={() => setShowCompositionModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕ Close
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-10">
              {Object.entries(protein.aminoAcidComposition)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([code, val]) => (
                  <div key={code} className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-1.5 text-center">
                    <span className="font-mono font-bold text-slate-200">{code}</span>
                    <span className="text-[10px] text-slate-400 block">{AMINO_ACIDS[code]?.code3 || code}</span>
                    <div className="mt-1 font-mono text-xs font-semibold text-cyan-400">{val.count}</div>
                    <div className="text-[9px] text-slate-400">{val.percentage.toFixed(1)}%</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Sequence Block Container */}
        <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
          {lines.map((line, lineIdx) => (
            <div key={lineIdx} className="flex items-center gap-3 py-1 hover:bg-slate-900/40 rounded px-1 transition-colors">
              {/* Ruler Number */}
              <span className="w-12 text-right text-[10px] text-slate-400 select-none">
                {line.start}
              </span>

              {/* 5 chunks of 10 residues */}
              <div className="flex flex-wrap gap-2 text-xs">
                {Array.from({ length: Math.ceil(line.text.length / chunkSize) }).map((_, cIdx) => {
                  const chunkStr = line.text.slice(cIdx * chunkSize, (cIdx + 1) * chunkSize);
                  const chunkStart = line.start + cIdx * chunkSize;

                  return (
                    <div key={cIdx} className="flex gap-0.5">
                      {chunkStr.split('').map((char, charIdx) => {
                        const globalPos = chunkStart + charIdx;
                        const activeSite = getActiveSiteAt(globalPos);
                        const isSelected = selectedResidueIndex === globalPos;

                        return (
                          <button
                            key={charIdx}
                            onClick={() => onSelectResidue?.(globalPos)}
                            className={`group relative flex h-6 w-5.5 items-center justify-center rounded border text-xs font-semibold transition-all hover:scale-115 hover:z-20 ${getResidueColor(
                              char
                            )} ${
                              isSelected
                                ? 'ring-2 ring-cyan-400 scale-110 z-10 font-bold bg-cyan-950 border-cyan-400'
                                : ''
                            } ${activeSite ? 'underline decoration-rose-500 decoration-2 font-black ring-1 ring-rose-500/40' : ''}`}
                            title={`Pos ${globalPos}: ${AMINO_ACIDS[char]?.name || char} (${char}) ${
                              activeSite ? `\nActive Site: ${activeSite.description}` : ''
                            }`}
                          >
                            <span>{char}</span>

                            {/* Indicator pip if active site */}
                            {activeSite && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected residue details helper footer */}
        {selectedResidueIndex && (
          <div className="mt-2.5 flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <span className="font-bold">Residue #{selectedResidueIndex}:</span>
              <span className="font-mono text-cyan-300">
                {AMINO_ACIDS[protein.sequence[selectedResidueIndex - 1]]?.name} (
                {protein.sequence[selectedResidueIndex - 1]})
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-400">
                Hydropathy: {AMINO_ACIDS[protein.sequence[selectedResidueIndex - 1]]?.hydropathy}
              </span>
              {getActiveSiteAt(selectedResidueIndex) && (
                <span className="rounded bg-rose-900/60 px-1.5 py-0.5 text-[10px] font-semibold text-rose-200">
                  {getActiveSiteAt(selectedResidueIndex)?.description}
                </span>
              )}
            </div>
            <button
              onClick={() => onSelectResidue?.(selectedResidueIndex)}
              className="text-[11px] underline text-cyan-400 hover:text-cyan-300"
            >
              Simulate Mutation At Pos {selectedResidueIndex}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
