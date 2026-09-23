import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  RotateCw,
  Eye,
  Layers,
  Sparkles,
  Maximize2,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { ProteinData } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface StructureViewer3DProps {
  protein: ProteinData;
  highlightResidue?: number | null;
  mutantResidue?: string | null;
  nearbyResidues?: number[];
  showDnaLigands?: boolean;
}

declare global {
  interface Window {
    $3Dmol?: any;
  }
}

export const StructureViewer3D: React.FC<StructureViewer3DProps> = ({
  protein,
  highlightResidue,
  mutantResidue,
  nearbyResidues,
  showDnaLigands = true,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [glViewer, setGlViewer] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(true);
  const [styleMode, setStyleMode] = useState<'cartoon' | 'stick' | 'sphere' | 'surface'>('cartoon');
  const [colorMode, setColorMode] = useState<'ss' | 'spectrum' | 'chain'>('ss');
  const [viewerType, setViewerType] = useState<'3dmol' | 'molstar'>('3dmol');
  const [secStructSource, setSecStructSource] = useState<'dssp' | 'chou_fasman'>('dssp');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingCoords, setIsLoadingCoords] = useState(false);
  const [viewCompareMode, setViewCompareMode] = useState<'wt' | 'mutant'>('wt');
  const { theme } = useTheme();

  const pdbId = protein.pdbId || '1A3N';
  const isExperimental = protein.pdbMetadata?.structureType !== 'predicted' && pdbId !== 'None';
  const coverage = protein.pdbMetadata?.coverage;

  const currentSecStruct =
    secStructSource === 'dssp' && protein.dsspSecondaryStructure
      ? {
          helixPct: protein.dsspSecondaryStructure.helixPct,
          sheetPct: protein.dsspSecondaryStructure.sheetPct,
          coilPct: protein.dsspSecondaryStructure.coilPct,
          label: 'PDB DSSP (Experimental Dihedral Angles)',
          source: protein.dsspSecondaryStructure.source,
        }
      : {
          helixPct: protein.secondaryStructure.helixPct,
          sheetPct: protein.secondaryStructure.sheetPct,
          coilPct: protein.secondaryStructure.coilPct,
          label: 'Chou-Fasman (In Silico Sequence Propensity)',
          source: 'Primary amino acid sequence conformational propensities',
        };

  // Initialize 3Dmol viewer when component mounts or pdbId changes
  useEffect(() => {
    let viewer: any = null;
    let isCancelled = false;

    if (viewerType !== '3dmol') return;

    const initViewer = async () => {
      if (!viewerRef.current) return;
      setIsLoadingCoords(true);
      setLoadError(null);

      // Clear previous canvas
      viewerRef.current.innerHTML = '';

      if (typeof window !== 'undefined' && window.$3Dmol) {
        try {
          const config = { backgroundColor: theme === 'light' ? '#f8fafc' : '#020617' };
          viewer = window.$3Dmol.createViewer(viewerRef.current, config);
          setGlViewer(viewer);

          // Fetch PDB coordinates from RCSB
          const pdbUrl = `https://files.rcsb.org/download/${pdbId}.pdb`;
          const res = await fetch(pdbUrl);
          if (!res.ok) {
            throw new Error(`RCSB file fetch failed (${res.status})`);
          }
          const pdbData = await res.text();

          if (isCancelled) return;

          viewer.addModel(pdbData, 'pdb');
          applyStyles(viewer, styleMode, colorMode);

          // Highlight active site residues
          highlightActiveSites(viewer);

          viewer.zoomTo();
          viewer.render();
          if (isSpinning) viewer.spin(true);
          setIsLoadingCoords(false);
        } catch (err: any) {
          console.warn('3Dmol direct PDB load warning, falling back to Mol* view:', err);
          if (!isCancelled) {
            setLoadError('Direct WebGL PDB coordinate stream unavailable. Switching to RCSB Mol* frame.');
            setViewerType('molstar');
            setIsLoadingCoords(false);
          }
        }
      } else {
        // 3Dmol script not loaded yet
        setIsLoadingCoords(false);
        setViewerType('molstar');
      }
    };

    initViewer();

    return () => {
      isCancelled = true;
      if (viewer && viewer.spin) {
        viewer.spin(false);
      }
    };
  }, [pdbId, viewerType]);

  // Dynamically update background color when theme toggles
  useEffect(() => {
    if (!glViewer) return;
    try {
      if (glViewer.setBackgroundColor) {
        glViewer.setBackgroundColor(theme === 'light' ? '#f8fafc' : '#020617');
        glViewer.render();
      }
    } catch {
      // ignore
    }
  }, [theme, glViewer]);

  // Dynamically highlight selected mutation residue or sequence residue
  useEffect(() => {
    if (!glViewer) return;
    applyStyles(glViewer, styleMode, colorMode);
    highlightActiveSites(glViewer);

    // Highlight nearby contact residues in cyan sticks
    if (nearbyResidues && nearbyResidues.length > 0) {
      glViewer.addStyle(
        { resi: nearbyResidues },
        {
          stick: { color: '#06b6d4', radius: 0.3 },
        }
      );
    }

    if (highlightResidue !== null && highlightResidue !== undefined) {
      const isMutantView = viewCompareMode === 'mutant';
      const residueColor = isMutantView ? '#f43f5e' : '#10b981';
      const sphereColor = isMutantView ? '#fb7185' : '#34d399';

      glViewer.addStyle(
        { resi: highlightResidue },
        {
          stick: { color: residueColor, radius: 0.55 },
          sphere: { radius: 1.7, color: sphereColor },
        }
      );

      // Add 3D label for the residue
      try {
        glViewer.removeAllLabels?.();
        const labelText = isMutantView && mutantResidue
          ? `Mutant: ${mutantResidue}${highlightResidue}`
          : `WT: ${protein.sequence[highlightResidue - 1] || ''}${highlightResidue}`;
        glViewer.addLabel(labelText, {
          fontSize: 11,
          fontColor: '#ffffff',
          backgroundColor: isMutantView ? '#9f1239' : '#065f46',
          backgroundOpacity: 0.85,
          borderColor: isMutantView ? '#f43f5e' : '#10b981',
          borderThickness: 1,
          inFront: true,
          position: { resi: highlightResidue },
        });
      } catch {
        // ignore label issues
      }

      glViewer.zoomTo({ resi: highlightResidue });
      glViewer.render();
    }
  }, [highlightResidue, mutantResidue, nearbyResidues, viewCompareMode, glViewer, styleMode, colorMode]);

  // Apply representation style & colors
  const applyStyles = (
    viewer: any,
    currentStyle: 'cartoon' | 'stick' | 'sphere' | 'surface',
    currentColor: 'ss' | 'spectrum' | 'chain'
  ) => {
    if (!viewer) return;
    viewer.removeAllSurfaces?.();

    let colorSpec: any = {};
    if (currentColor === 'ss') {
      colorSpec = { color: 'spectrum' };
    } else if (currentColor === 'spectrum') {
      colorSpec = { color: 'spectrum' };
    } else {
      colorSpec = { color: 'chain' };
    }

    if (currentStyle === 'cartoon') {
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
    } else if (currentStyle === 'stick') {
      viewer.setStyle({}, { stick: { colorscheme: 'amino' } });
    } else if (currentStyle === 'sphere') {
      viewer.setStyle({}, { sphere: { radius: 1.2, colorscheme: 'amino' } });
    } else if (currentStyle === 'surface') {
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
      try {
        viewer.addSurface(window.$3Dmol?.SurfaceType?.VDW || 1, {
          opacity: 0.7,
          color: 'lightblue',
        });
      } catch (e) {
        console.warn('Surface error', e);
      }
    }

    viewer.render();
  };

  const highlightActiveSites = (viewer: any) => {
    if (!viewer || !protein.activeSites.length) return;
    // Highlight annotated catalytic & binding sites as prominent yellow/rose sticks
    const resiList = protein.activeSites.map((s) => s.residueIndex);
    viewer.addStyle(
      { resi: resiList },
      {
        stick: { color: '#f43f5e', radius: 0.35 },
        sphere: { radius: 1.4, color: '#fbbf24' },
      }
    );
  };

  // React to style change
  const handleStyleChange = (newStyle: 'cartoon' | 'stick' | 'sphere' | 'surface') => {
    setStyleMode(newStyle);
    if (glViewer) {
      applyStyles(glViewer, newStyle, colorMode);
      highlightActiveSites(glViewer);
      glViewer.render();
    }
  };

  // Toggle Spin
  const toggleSpin = () => {
    const nextSpin = !isSpinning;
    setIsSpinning(nextSpin);
    if (glViewer && glViewer.spin) {
      glViewer.spin(nextSpin);
    }
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (glViewer) {
      glViewer.zoomTo();
      glViewer.render();
    }
  };

  return (
    <div id="structure-analysis-card" className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Box className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                3D Structural Architecture & Secondary Structure
              </h3>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase border ${
                  isExperimental
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-950/40 text-amber-300'
                }`}
              >
                {isExperimental ? 'Experimental 3D Structure' : 'In Silico Predicted Fold'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive WebGL atomic coordinates & fold geometry for PDB: <strong className="text-cyan-400 font-mono">{pdbId}</strong>
              {protein.pdbMetadata?.resolution && ` (${protein.pdbMetadata.method} • ${protein.pdbMetadata.resolution})`}
            </p>
          </div>
        </div>

        {/* Viewer Engine Toggle */}
        <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
          <button
            onClick={() => setViewerType('3dmol')}
            className={`px-2.5 py-1 rounded transition-all ${
              viewerType === '3dmol'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3Dmol WebGL
          </button>
          <button
            onClick={() => setViewerType('molstar')}
            className={`px-2.5 py-1 rounded transition-all ${
              viewerType === 'molstar'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RCSB Mol* Embed
          </button>
        </div>
      </div>

      {/* 3D Canvas / Frame Area */}
      <div className="relative mt-4 h-72 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center">
        {viewerType === '3dmol' ? (
          <div
            ref={viewerRef}
            id="gl-3dmol-container"
            className="h-full w-full relative select-none cursor-grab active:cursor-grabbing"
          />
        ) : (
          <iframe
            id="rcsb-molstar-frame"
            src={`https://www.rcsb.org/3d-view/${pdbId}?preset=default`}
            title={`3D Structure of ${pdbId}`}
            className="h-full w-full border-0"
            allow="fullscreen"
          />
        )}

        {/* Interactive Controls Bar Overlay */}
        {viewerType === '3dmol' && (
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
            <button
              onClick={toggleSpin}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border backdrop-blur-md transition-all ${
                isSpinning
                  ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isSpinning ? 'Pause Rotation' : 'Spin Molecule'}
            >
              <RotateCw className={`h-3.5 w-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleResetCamera}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white backdrop-blur-md transition-all"
              title="Reset Camera Zoom & Center"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Active representation selector pill */}
        {viewerType === '3dmol' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg border border-slate-800/80 bg-slate-950/80 p-1 backdrop-blur-md text-[11px] z-10">
            <span className="px-1.5 text-slate-400 font-semibold">Style:</span>
            {(['cartoon', 'stick', 'sphere', 'surface'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleStyleChange(mode)}
                className={`rounded px-2 py-0.5 capitalize transition-all ${
                  styleMode === mode
                    ? 'bg-emerald-500/30 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {/* Active site & Mutation Legend / Comparison Toggle */}
        <div className="absolute top-2 left-2 flex flex-wrap items-center gap-2 z-10">
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/85 px-2.5 py-1 text-[10px] text-slate-300 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Active Site</span>
          </div>

          {highlightResidue && (
            <div className="flex items-center rounded-lg border border-cyan-500/40 bg-slate-950/90 p-0.5 backdrop-blur-md text-[10px] shadow-sm">
              <span className="px-1.5 text-cyan-300 font-bold font-mono">
                Residue {highlightResidue}:
              </span>
              <button
                onClick={() => setViewCompareMode('wt')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  viewCompareMode === 'wt'
                    ? 'bg-emerald-500/30 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View Wild-Type residue in 3D environment"
              >
                WT ({protein.sequence[highlightResidue - 1] || 'WT'})
              </button>
              <button
                onClick={() => setViewCompareMode('mutant')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  viewCompareMode === 'mutant'
                    ? 'bg-rose-500/30 text-rose-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View Mutant substitution in 3D environment"
              >
                Mutant ({mutantResidue || 'Mut'})
              </button>
            </div>
          )}

          {nearbyResidues && nearbyResidues.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-cyan-800/60 bg-cyan-950/80 px-2 py-1 text-[10px] text-cyan-300 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>{nearbyResidues.length} Nearby Contacts (≤6.5Å)</span>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Structure Breakdown & PDB Metadata */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Secondary Structure Breakdown Bars */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Secondary Structure Conformation:
              </span>
              {/* Method Switcher */}
              <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
                <button
                  onClick={() => setSecStructSource('dssp')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    secStructSource === 'dssp'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Experimental dihedral angle assignment from PDB coordinates"
                >
                  PDB DSSP (Exp)
                </button>
                <button
                  onClick={() => setSecStructSource('chou_fasman')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    secStructSource === 'chou_fasman'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Algorithmically predicted from amino acid sequence propensities"
                >
                  Chou-Fasman (Pred)
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              {/* Alpha-Helix */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Alpha-Helix (α)
                  </span>
                  <span className="font-mono font-bold text-cyan-400">
                    {currentSecStruct.helixPct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${currentSecStruct.helixPct}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                  />
                </div>
              </div>

              {/* Beta-Sheet */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Beta-Sheet (β-strand)
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {currentSecStruct.sheetPct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${currentSecStruct.sheetPct}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  />
                </div>
              </div>

              {/* Random Coil */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    Random Coil / Loop
                  </span>
                  <span className="font-mono font-bold text-purple-400">
                    {currentSecStruct.coilPct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${currentSecStruct.coilPct}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-900 pt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="truncate">{currentSecStruct.source}</span>
            <span className="shrink-0 text-slate-500 font-mono">
              {secStructSource === 'dssp' ? 'Experimental' : 'In Silico'}
            </span>
          </div>
        </div>

        {/* PDB Structural Metadata Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                PDB Experimental Parameters:
              </span>
              <a
                href={`https://www.rcsb.org/structure/${pdbId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
              >
                <span>RCSB Entry</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Method</span>
                <span className="font-semibold text-slate-200">
                  {protein.pdbMetadata?.method || 'X-ray Diffraction'}
                </span>
              </div>
              <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Resolution</span>
                <span className="font-semibold text-emerald-400 font-mono">
                  {protein.pdbMetadata?.resolution || '1.80 Å'}
                </span>
              </div>
              <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Chains</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {protein.pdbMetadata?.chains?.join(', ') || 'A, B'}
                </span>
              </div>
              <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Ligands</span>
                <span className="font-semibold text-amber-300 font-mono truncate block">
                  {protein.pdbMetadata?.ligands?.join(', ') || 'HEM, H2O'}
                </span>
              </div>
            </div>

            {/* PDB Coverage vs Full Length */}
            {coverage && (
              <div className="mt-2.5 rounded-lg bg-slate-900/60 p-2 border border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-300 font-semibold">PDB Structure Coverage:</span>
                  <span className="font-mono text-emerald-400 font-bold">{coverage.coveragePct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${coverage.coveragePct}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>Residues {coverage.coveredStart}–{coverage.coveredEnd}</span>
                  <span>{coverage.coveredLength} of {coverage.totalProteinLength} AA</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Interactive 3D viewport supports rotation, scroll-zoom, and translation panning.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
