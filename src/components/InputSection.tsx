import React, { useState } from 'react';
import {
  FileText,
  Search,
  Box,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  RefreshCw,
  Info,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { PRESET_OPTIONS, PRESET_PROTEINS } from '../data/presets';
import { ProteinData } from '../types';
import { parseFasta } from '../utils/bioinformatics';
import { createProteinFromFasta } from '../services/proteinService';

interface InputSectionProps {
  currentProtein: ProteinData;
  onSelectProtein: (protein: ProteinData) => void;
  onFetchUniProt: (id: string) => Promise<void>;
  onFetchPdb: (pdbId: string) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
  onNavigateToDashboard?: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  currentProtein,
  onSelectProtein,
  onFetchUniProt,
  onFetchPdb,
  isLoading,
  errorMessage,
  onNavigateToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'fasta' | 'uniprot' | 'pdb'>('presets');
  const [fastaInput, setFastaInput] = useState('');
  const [uniprotInput, setUniprotInput] = useState('');
  const [pdbInput, setPdbInput] = useState('');
  const [localFastaError, setLocalFastaError] = useState<string | null>(null);

  // Quick FASTA validation
  const handleFastaChange = (val: string) => {
    setFastaInput(val);
    if (!val.trim()) {
      setLocalFastaError(null);
      return;
    }
    const check = parseFasta(val);
    if (!check.isValid) {
      setLocalFastaError(check.error || 'Invalid FASTA sequence');
    } else {
      setLocalFastaError(null);
    }
  };

  const handleApplyFasta = () => {
    try {
      const protein = createProteinFromFasta(fastaInput);
      onSelectProtein(protein);
      setLocalFastaError(null);
    } catch (err: any) {
      setLocalFastaError(err.message || 'Failed to process FASTA sequence.');
    }
  };

  const handleLoadSampleFasta = () => {
    const sample = `>sp|P68871|HBB_HUMAN Hemoglobin subunit beta OS=Homo sapiens OX=9606 GN=HBB PE=1 SV=2\nMVHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPK\nVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFG\nKEFTPPVQAAYQKVVAGVANALAHKYH`;
    setFastaInput(sample);
    setLocalFastaError(null);
  };

  const handleUniProtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniprotInput.trim()) return;
    onFetchUniProt(uniprotInput.trim());
  };

  const handlePdbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdbInput.trim()) return;
    onFetchPdb(pdbInput.trim());
  };

  return (
    <section id="input-section" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400 text-xs font-bold">1</span>
            Data Ingestion & Identification Layer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Query standard bioinformatics databases or provide a custom FASTA polypeptide
          </p>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-medium">
          <button
            id="tab-btn-presets"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Curated Presets
          </button>
          <button
            id="tab-btn-fasta"
            onClick={() => setActiveTab('fasta')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'fasta'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Raw FASTA
          </button>
          <button
            id="tab-btn-uniprot"
            onClick={() => setActiveTab('uniprot')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'uniprot'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            UniProt REST
          </button>
          <button
            id="tab-btn-pdb"
            onClick={() => setActiveTab('pdb')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'pdb'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            RCSB PDB
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {/* TAB 1: CURATED DEMO PRESETS */}
        {activeTab === 'presets' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Pre-loaded Benchmark Systems (Instant Offline Caching):
              </span>
              <span className="text-[11px] text-slate-400">
                Click any preset to reload sequence, active sites, and 3D coordinates
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {PRESET_OPTIONS.map((item) => {
                const isSelected =
                  currentProtein.id === item.id ||
                  currentProtein.uniprotId === item.id;
                return (
                  <button
                    key={item.id}
                    id={`preset-card-${item.id}`}
                    onClick={() => {
                      const presetData = PRESET_PROTEINS[item.id];
                      if (presetData) onSelectProtein(presetData);
                    }}
                    className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/30 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {item.badge}
                        </span>
                        {isSelected && (
                          <span className="flex h-2 w-2 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
                        )}
                      </div>
                      <h4 className="mt-1 text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {item.label}
                      </h4>
                      <p className="mt-0.5 text-[11px] font-mono text-cyan-400/90">
                        {item.code}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[10px] text-slate-400">
                      <span>Variant: <strong className="text-rose-400 font-mono">{item.highlightMut}</strong></span>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: RAW FASTA */}
        {activeTab === 'fasta' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="fasta-textarea" className="font-semibold text-slate-300">
                Paste Standard FASTA Sequence:
              </label>
              <div className="flex items-center gap-2">
                <button
                  id="sample-fasta-btn"
                  type="button"
                  onClick={handleLoadSampleFasta}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                >
                  Insert Sample (Hemoglobin Beta)
                </button>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400 font-mono">
                  {fastaInput.replace(/[\s\d>A-Za-z_-]/g, '').length === 0 ? `${fastaInput.replace(/^>.*$/m, '').replace(/[^A-Z]/gi, '').length} AA` : '0 AA'}
                </span>
              </div>
            </div>

            <textarea
              id="fasta-textarea"
              rows={4}
              value={fastaInput}
              onChange={(e) => handleFastaChange(e.target.value)}
              placeholder=">Protein_Header [organism]\nMVHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPK..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            />

            {localFastaError && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-800/50 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{localFastaError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                id="apply-fasta-btn"
                onClick={handleApplyFasta}
                disabled={!fastaInput.trim() || !!localFastaError}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Analyze FASTA Sequence
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: UNIPROT REST */}
        {activeTab === 'uniprot' && (
          <form onSubmit={handleUniProtSubmit} className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="uniprot-input" className="font-semibold text-slate-300">
                Enter UniProtKB Accession / Identifier:
              </label>
              <span className="text-[11px] text-slate-400">
                Examples: <button type="button" onClick={() => setUniprotInput('P68871')} className="text-cyan-400 hover:underline">P68871</button> (HBB), <button type="button" onClick={() => setUniprotInput('P0CG48')} className="text-cyan-400 hover:underline">P0CG48</button> (UBB), <button type="button" onClick={() => setUniprotInput('P04637')} className="text-cyan-400 hover:underline">P04637</button> (p53)
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="uniprot-input"
                  type="text"
                  value={uniprotInput}
                  onChange={(e) => setUniprotInput(e.target.value.toUpperCase())}
                  placeholder="e.g. P68871, P04637, P0DTC2"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 font-mono text-xs text-slate-200 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <button
                id="fetch-uniprot-btn"
                type="submit"
                disabled={isLoading || !uniprotInput.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 transition-all"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Fetch UniProt Data
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              Directly queries the UniProt REST API for sequence, GO terms, Pfam domains, and literature citations.
            </p>
          </form>
        )}

        {/* TAB 4: RCSB PDB */}
        {activeTab === 'pdb' && (
          <form onSubmit={handlePdbSubmit} className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="pdb-input" className="font-semibold text-slate-300">
                Enter 4-Character RCSB PDB ID:
              </label>
              <span className="text-[11px] text-slate-400">
                Examples: <button type="button" onClick={() => setPdbInput('1A3N')} className="text-cyan-400 hover:underline">1A3N</button>, <button type="button" onClick={() => setPdbInput('1UBQ')} className="text-cyan-400 hover:underline">1UBQ</button>, <button type="button" onClick={() => setPdbInput('1TUP')} className="text-cyan-400 hover:underline">1TUP</button>, <button type="button" onClick={() => setPdbInput('6M0J')} className="text-cyan-400 hover:underline">6M0J</button>
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="pdb-input"
                  type="text"
                  maxLength={4}
                  value={pdbInput}
                  onChange={(e) => setPdbInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 1A3N, 1UBQ, 6M0J"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 font-mono text-xs text-slate-200 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <button
                id="fetch-pdb-btn"
                type="submit"
                disabled={isLoading || pdbInput.trim().length !== 4}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 transition-all"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Box className="h-3.5 w-3.5" />}
                Fetch PDB Coordinates
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              Fetches diffraction resolution, experimental method, ligand stoichiometry, and 3D atomic coordinates.
            </p>
          </form>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <div className="flex-1">
              <span className="font-semibold">Query Warning: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Loaded Protein Confirmation & Direct Dashboard Jump */}
        {onNavigateToDashboard && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-950/50 p-3.5 border border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-400">Ready for Analysis: </span>
                <strong className="text-white">{currentProtein.name}</strong>{' '}
                <span className="text-slate-400 font-mono text-[11px]">
                  ({currentProtein.gene} • {currentProtein.length} aa • {currentProtein.molecularWeight.toFixed(1)} kDa)
                </span>
              </div>
            </div>

            <button
              id="input-proceed-to-dashboard-btn"
              type="button"
              onClick={onNavigateToDashboard}
              className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-cyan-500 hover:to-emerald-500 transition-all active:scale-95"
            >
              <span>Analyze in Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
