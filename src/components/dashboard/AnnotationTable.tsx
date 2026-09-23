import React, { useState } from 'react';
import {
  Tag,
  BookOpen,
  Activity,
  Award,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Dna,
  Share2,
  Sparkles,
} from 'lucide-react';
import { ProteinData, GoTerm, ActiveSiteResidue, BoundLigand, DnaInteraction } from '../../types';
import { parseGoEvidence } from '../../utils/evidenceCodes';

interface AnnotationTableProps {
  protein: ProteinData;
  onSelectResidue?: (index: number) => void;
}

export const AnnotationTable: React.FC<AnnotationTableProps> = ({
  protein,
  onSelectResidue,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'go' | 'sites' | 'interactions' | 'literature'>('go');
  const [goCategory, setGoCategory] = useState<'all' | 'mf' | 'bp' | 'cc'>('all');
  const [interactionCategory, setInteractionCategory] = useState<'all' | 'ppi' | 'dna' | 'ligand'>('all');
  const [expandedGoId, setExpandedGoId] = useState<string | null>(null);

  const allGoTerms: (GoTerm & { catName: string; badgeColor: string })[] = [
    ...(protein.goTerms?.molecularFunction || []).map((t) => ({
      ...t,
      catName: 'Molecular Function',
      badgeColor: 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300',
    })),
    ...(protein.goTerms?.biologicalProcess || []).map((t) => ({
      ...t,
      catName: 'Biological Process',
      badgeColor: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300',
    })),
    ...(protein.goTerms?.cellularComponent || []).map((t) => ({
      ...t,
      catName: 'Cellular Component',
      badgeColor: 'border-purple-500/30 bg-purple-950/30 text-purple-300',
    })),
  ];

  const filteredGoTerms = allGoTerms.filter((term) => {
    if (goCategory === 'all') return true;
    if (goCategory === 'mf') return term.category === 'molecular_function';
    if (goCategory === 'bp') return term.category === 'biological_process';
    if (goCategory === 'cc') return term.category === 'cellular_component';
    return true;
  });

  const ppiPartners = protein.interactions?.partners || [];
  const ligands: BoundLigand[] = protein.interactions?.ligands || [];
  const dnaInteractions: DnaInteraction[] = protein.dnaInteractions || [];

  return (
    <div id="annotation-analysis-card" className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Functional Annotations, Catalytic Sites & Interactome
            </h3>
            <p className="text-[11px] text-slate-400">
              Curated Gene Ontology, active sites, STRING PPI networks, and DNA/ligand interfaces
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
          <button
            id="tab-btn-go"
            onClick={() => setActiveSubTab('go')}
            className={`px-3 py-1 rounded transition-all ${
              activeSubTab === 'go'
                ? 'bg-purple-500/20 text-purple-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GO Terms ({allGoTerms.length})
          </button>
          <button
            id="tab-btn-sites"
            onClick={() => setActiveSubTab('sites')}
            className={`px-3 py-1 rounded transition-all ${
              activeSubTab === 'sites'
                ? 'bg-purple-500/20 text-purple-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Sites ({protein.activeSites.length})
          </button>
          <button
            id="tab-btn-interactions"
            onClick={() => setActiveSubTab('interactions')}
            className={`px-3 py-1 rounded transition-all ${
              activeSubTab === 'interactions'
                ? 'bg-purple-500/20 text-purple-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactome ({ppiPartners.length + ligands.length + dnaInteractions.length})
          </button>
          <button
            id="tab-btn-lit"
            onClick={() => setActiveSubTab('literature')}
            className={`px-3 py-1 rounded transition-all ${
              activeSubTab === 'literature'
                ? 'bg-purple-500/20 text-purple-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Literature ({protein.literature.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: GENE ONTOLOGY (GO) */}
      {activeSubTab === 'go' && (
        <div className="mt-4 space-y-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setGoCategory('all')}
                className={`rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                  goCategory === 'all'
                    ? 'bg-slate-800 text-white font-medium border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Terms ({allGoTerms.length})
              </button>
              <button
                onClick={() => setGoCategory('mf')}
                className={`rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                  goCategory === 'mf'
                    ? 'bg-cyan-950 text-cyan-300 font-medium border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Molecular Function ({protein.goTerms?.molecularFunction?.length || 0})
              </button>
              <button
                onClick={() => setGoCategory('bp')}
                className={`rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                  goCategory === 'bp'
                    ? 'bg-emerald-950 text-emerald-300 font-medium border border-emerald-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Biological Process ({protein.goTerms?.biologicalProcess?.length || 0})
              </button>
              <button
                onClick={() => setGoCategory('cc')}
                className={`rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                  goCategory === 'cc'
                    ? 'bg-purple-950 text-purple-300 font-medium border border-purple-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cellular Component ({protein.goTerms?.cellularComponent?.length || 0})
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Click term for evidence code details
            </span>
          </div>

          {/* GO Terms List */}
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {filteredGoTerms.length === 0 ? (
              <div className="p-6 text-center text-xs text-rose-300 bg-rose-950/20 border border-rose-900/40 rounded-xl">
                Data unavailable — source could not be retrieved from Gene Ontology.
              </div>
            ) : (
              filteredGoTerms.map((term, idx) => {
                const isExpanded = expandedGoId === `${term.id}-${idx}`;
                const parsed = parseGoEvidence(term.evidence);
                const code = term.evidenceCode || parsed.code;
                const category = term.evidenceCategory || parsed.category;
                const explanation = term.evidenceExplanation || parsed.description;
                const reliability = term.evidenceReliability || parsed.reliability;

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 hover:border-slate-700 transition-all cursor-pointer"
                    onClick={() => setExpandedGoId(isExpanded ? null : `${term.id}-${idx}`)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold shrink-0 ${term.badgeColor}`}>
                          {term.catName}
                        </span>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-slate-200 block truncate">
                            {term.name}
                          </span>
                          <a
                            href={`https://amigo.geneontology.org/amigo/term/${term.id}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-mono text-cyan-400/90 hover:underline inline-flex items-center gap-1"
                          >
                            {term.id}
                            <ExternalLink className="h-2.5 w-2.5 inline" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold border ${
                            category === 'Experimental'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                              : category === 'Author Statement'
                              ? 'bg-sky-950/60 text-sky-300 border-sky-800/60'
                              : category === 'Computational'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                          title={explanation}
                        >
                          {code}
                        </span>
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
                            isExpanded ? 'rotate-90 text-cyan-400' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expanded Evidence Metadata Details */}
                    {isExpanded && (
                      <div className="mt-2.5 border-t border-slate-900 pt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Evidence Classification</span>
                          <span className="font-semibold text-cyan-300">{category}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Curation Reliability</span>
                          <span className="font-semibold text-slate-200">{reliability}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Meaning of Code ({code})</span>
                          <span className="text-slate-300">{explanation}</span>
                        </div>
                        {term.sourceDatabase && (
                          <div className="col-span-full text-[10px] text-slate-400 border-t border-slate-800/50 pt-1 mt-1">
                            Source Database: <span className="text-slate-300 font-mono">{term.sourceDatabase}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ACTIVE & CATALYTIC SITES */}
      {activeSubTab === 'sites' && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span>Annotated Functional & Catalytic Residues:</span>
            <span>Click card to locate residue in sequence</span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {protein.activeSites.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No catalytic or binding sites recorded for this sequence profile.
              </div>
            ) : (
              protein.activeSites.map((site, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectResidue?.(site.residueIndex)}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs">
                      {site.residueName}
                      <span className="text-[9px] text-rose-400 ml-0.5">#{site.residueIndex}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                          Position {site.residueIndex} ({site.residueName})
                        </span>
                        <span className="rounded-full bg-rose-950/60 border border-rose-800/50 px-2 py-0.2 text-[10px] font-semibold text-rose-300 uppercase">
                          {site.type}
                        </span>
                        {site.evidenceCategory && (
                          <span className="rounded bg-slate-900 px-1.5 py-0.2 text-[9px] font-mono text-slate-400 border border-slate-800">
                            {site.evidenceCategory}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {site.description}
                      </p>
                      {site.source && (
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          Source: {site.source}
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: INTERACTOME & LIGANDS */}
      {activeSubTab === 'interactions' && (
        <div className="mt-4 space-y-3">
          {/* Interaction Type Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setInteractionCategory('all')}
                className={`rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                  interactionCategory === 'all'
                    ? 'bg-slate-800 text-white font-medium border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Interactions
              </button>
              <button
                onClick={() => setInteractionCategory('ppi')}
                className={`rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                  interactionCategory === 'ppi'
                    ? 'bg-cyan-950 text-cyan-300 font-medium border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                STRING PPI Partners ({ppiPartners.length})
              </button>
              <button
                onClick={() => setInteractionCategory('dna')}
                className={`rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                  interactionCategory === 'dna'
                    ? 'bg-emerald-950 text-emerald-300 font-medium border border-emerald-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DNA Interfaces ({dnaInteractions.length})
              </button>
              <button
                onClick={() => setInteractionCategory('ligand')}
                className={`rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                  interactionCategory === 'ligand'
                    ? 'bg-amber-950 text-amber-300 font-medium border border-amber-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bound Ligands ({ligands.length})
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              STRING v12 & PDB Co-Crystals
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {/* PPI Section */}
            {(interactionCategory === 'all' || interactionCategory === 'ppi') && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Protein-Protein Interactome (STRING-db v12)</span>
                </div>
                {ppiPartners.length === 0 ? (
                  <div className="p-4 text-xs text-rose-300 bg-rose-950/20 rounded-xl border border-rose-900/40 text-center">
                    Data unavailable — source could not be retrieved from STRING database.
                  </div>
                ) : (
                  ppiPartners.map((partner, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-cyan-900/30 bg-cyan-950/10 p-3 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">{partner.name}</span>
                          {partner.confidenceTier && (
                            <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-300 border border-cyan-800/40">
                              {partner.confidenceTier}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          Score: {(partner.score * 1000).toFixed(0)} / 1000
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-300">{partner.role}</p>

                      {/* Evidence Sub-scores */}
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-slate-400 font-mono border-t border-slate-900 pt-1.5">
                        {partner.experimentalScore !== undefined && (
                          <div>
                            Exp Assay: <span className="text-emerald-400 font-bold">{partner.experimentalScore.toFixed(3)}</span>
                          </div>
                        )}
                        {partner.databaseScore !== undefined && (
                          <div>
                            Curated DB: <span className="text-sky-400 font-bold">{partner.databaseScore.toFixed(3)}</span>
                          </div>
                        )}
                        {partner.textminingScore !== undefined && (
                          <div>
                            Text Mining: <span className="text-slate-300 font-bold">{partner.textminingScore.toFixed(3)}</span>
                          </div>
                        )}
                        {partner.source && (
                          <div className="truncate" title={partner.source}>
                            Source: {partner.source}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* DNA Interactions Section */}
            {(interactionCategory === 'all' || interactionCategory === 'dna') && dnaInteractions.length > 0 && (
              <div className="space-y-2 mt-3">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                  <Dna className="h-3.5 w-3.5" />
                  <span>DNA Binding Sites & Response Elements</span>
                </div>
                {dnaInteractions.map((dna, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">{dna.name}</span>
                      <span className="rounded bg-emerald-950 px-2 py-0.5 text-[9px] font-mono text-emerald-300 border border-emerald-800/40">
                        {dna.type}
                      </span>
                    </div>
                    {dna.motifSequence && (
                      <div className="mt-1 text-[11px] font-mono text-slate-300 bg-slate-950/80 p-1.5 rounded border border-slate-800">
                        Motif: {dna.motifSequence}
                      </div>
                    )}
                    <div className="mt-1.5 text-[11px] text-slate-400">
                      <strong>Interface Residues:</strong> {dna.interfaceResidues}
                    </div>
                    {dna.affinity && (
                      <div className="text-[10px] text-emerald-400/90 mt-0.5 font-mono">
                        Affinity: {dna.affinity}
                      </div>
                    )}
                    {dna.source && (
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Source: {dna.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bound Ligands Section */}
            {(interactionCategory === 'all' || interactionCategory === 'ligand') && ligands.length > 0 && (
              <div className="space-y-2 mt-3">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Co-Crystallized Small Molecules & Metal Ions</span>
                </div>
                {ligands.map((lig, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-3 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">
                        {lig.id} — {lig.name}
                      </span>
                      <span className="rounded bg-amber-950 px-2 py-0.5 text-[9px] font-mono text-amber-300 border border-amber-800/40">
                        {lig.type || 'Ligand'}
                      </span>
                    </div>
                    {lig.formula && (
                      <div className="mt-0.5 text-[10px] font-mono text-slate-400">
                        Formula: {lig.formula}
                      </div>
                    )}
                    <div className="mt-1 text-[11px] text-slate-300">
                      <strong>Binding Pocket:</strong> {lig.pocketResidues}
                    </div>
                    {lig.affinity && (
                      <div className="text-[10px] text-amber-400/90 mt-0.5 font-mono">
                        Affinity: {lig.affinity}
                      </div>
                    )}
                    {lig.source && (
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Source: {lig.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: LITERATURE & EVIDENCE */}
      {activeSubTab === 'literature' && (
        <div className="mt-4 space-y-2.5">
          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
            {protein.literature.length === 0 ? (
              <div className="p-6 text-center text-xs text-rose-300 bg-rose-950/20 border border-rose-900/40 rounded-xl">
                Data unavailable — source could not be retrieved from PubMed repository.
              </div>
            ) : (
              protein.literature.map((lit, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 hover:border-slate-700 transition-colors"
                >
                  <h5 className="text-xs font-bold text-slate-200 leading-snug">
                    {lit.title}
                  </h5>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {lit.authors}
                  </p>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-900 pt-2 text-[10px] text-slate-400 font-mono">
                    <span>
                      {lit.journal} ({lit.year})
                    </span>
                    {lit.pmid && (
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${lit.pmid}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:underline"
                      >
                        <span>PubMed: {lit.pmid}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
