import React from 'react';
import { Network, Link2, ShieldCheck, Box, ExternalLink, Info } from 'lucide-react';
import { ProteinData } from '../../types';

interface InteractionAnalysisProps {
  protein: ProteinData;
}

export const InteractionAnalysis: React.FC<InteractionAnalysisProps> = ({ protein }) => {
  const { partners = [], ligands = [], interfaceResidues = [] } = protein.interactions || {};

  return (
    <div id="interaction-analysis-card" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Interactome Network & Ligand Binding Pocket Profiling
            </h3>
            <p className="text-[11px] text-slate-400">
              Predicted protein-protein interactions (PPI), quaternary complex partners, and co-crystallized small molecules
            </p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
          STRING / BioGRID Enriched
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Protein-Protein Interaction Partners */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-cyan-400" />
                Interactome Partners (STRING-db / BioGRID):
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Confidence Score</span>
            </div>

            <div className="space-y-2 mt-2">
              {partners.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No direct high-confidence PPI partners listed for this sequence query.
                </div>
              ) : (
                partners.map((partner, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200">
                          {partner.name}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-semibold text-cyan-300">
                          {partner.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {partner.role}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-emerald-400">
                        {(partner.score * 100).toFixed(0)}%
                      </div>
                      <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden mt-1">
                        <div
                          style={{ width: `${partner.score * 100}%` }}
                          className="h-full bg-emerald-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 border-t border-slate-900 pt-2 text-[10px] text-slate-400">
            Scores derived from combined experimental co-immunoprecipitation, curated databases, and text mining.
          </div>
        </div>

        {/* Bound Ligands & Pocket Residues */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Box className="h-3.5 w-3.5 text-emerald-400" />
                Co-crystallized Ligands & Pocket Contacts:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">PDB Chemical ID</span>
            </div>

            <div className="space-y-2 mt-2">
              {ligands.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No co-crystallized small molecules or metal ions present.
                </div>
              ) : (
                ligands.map((lig, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                          {lig.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          {lig.name}
                        </span>
                      </div>
                      {lig.affinity && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          {lig.affinity}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 text-[11px] text-slate-400">
                      <strong className="text-slate-300">Pocket Residues:</strong> {lig.pocketResidues}
                    </div>

                    {lig.formula && (
                      <div className="mt-0.5 text-[10px] text-slate-400 font-mono">
                        Formula: {lig.formula}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Interface Residues summary */}
          {interfaceResidues.length > 0 && (
            <div className="mt-3 border-t border-slate-900 pt-2 text-[11px] text-slate-300">
              <strong className="text-cyan-300">Structural Interface Contacts:</strong>
              <div className="mt-1 flex flex-wrap gap-1">
                {interfaceResidues.map((res, i) => (
                  <span key={i} className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-800">
                    {res}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
