import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Dna,
  Binary,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Atom,
  Database,
  ShieldCheck,
  FileText,
  AlertTriangle,
  FlaskConical,
  Flame,
  Search,
  Check,
  Copy,
  Zap,
} from 'lucide-react';

interface AboutSectionProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenAiModal?: () => void;
  onOpenExportModal?: () => void;
}

interface UserGuideSectionData {
  id: string;
  num: number;
  title: string;
  category: string;
  whatItDoes: string;
  whatToEnter: string;
  whatOutputMeans: string;
  howDataObtained: string;
  howToInterpret: string;
  limitations: string;
}

const USER_GUIDE_SECTIONS: UserGuideSectionData[] = [
  {
    id: 'getting-started',
    num: 1,
    title: 'Getting Started',
    category: 'Foundations',
    whatItDoes:
      'Provides the entry point for the ProteoFlow research workbench. Allows researchers to immediately initialize standard benchmark models (e.g. TP53, HBB, Ubiquitin) or configure custom sequence and crystallographic investigations.',
    whatToEnter:
      'Select a curated benchmark protein from the homepage or navigate to "1. Input" to specify your own sequence or accession number.',
    whatOutputMeans:
      'Loads the polypeptide into global memory, making its physical coordinates, sequence composition, active sites, and domain definitions available across all modules simultaneously.',
    howDataObtained:
      'Pre-indexed models are derived directly from primary UniProtKB Swiss-Prot and RCSB PDB records with verified stereochemical coordinates.',
    howToInterpret:
      'The active protein indicator at the top right verifies which macromolecule is currently loaded across all analytical modules.',
    limitations:
      'Analyzing multi-protein complexes requires entering subunits individually or querying the interactome module for co-complexed partners.',
  },
  {
    id: 'protein-input',
    num: 2,
    title: 'Protein Input',
    category: 'Ingestion',
    whatItDoes:
      'Ingests raw FASTA files, searches UniProtKB accessions (e.g. P04637), or downloads 3D atomic coordinates from the RCSB Protein Data Bank (e.g. 1TUP).',
    whatToEnter:
      'Enter a valid single-letter amino acid FASTA sequence, a 6-character UniProt accession, or a 4-character RCSB PDB code.',
    whatOutputMeans:
      'Parses the polypeptide sequence, validates standard IUPAC amino acid characters, computes length, and prepares the coordinate data stream.',
    howDataObtained:
      'Queries the official UniProt REST API (rest.uniprot.org) and RCSB PDB core data services (data.rcsb.org) through secure server proxies.',
    howToInterpret:
      'A green verification badge confirms complete retrieval of canonical sequence, functional descriptions, and crystallographic metadata.',
    limitations:
      'Sequences with non-canonical amino acids (e.g. selenocysteine U, pyrrolysine O) or severe crystallographic missing loops will have unresolved gaps marked in grey.',
  },
  {
    id: 'sequence-dashboard',
    num: 3,
    title: 'Sequence Dashboard',
    category: 'Profiling',
    whatItDoes:
      'Computes fundamental physicochemical metrics: Molecular Weight, theoretical Isoelectric Point (pI), Net Charge at pH 7.4, Kyte-Doolittle hydropathy, Extinction Coefficient (ε280), and Chou-Fasman secondary structure distribution.',
    whatToEnter:
      'No manual input needed; calculations run instantaneously upon protein selection or sequence upload.',
    whatOutputMeans:
      'The pI indicates the pH where net ionic charge equals zero. Net charge at physiological pH (7.4) indicates surface electrostatic polarity. Hydropathy highlights hydrophobic transmembrane or core regions.',
    howDataObtained:
      'Calculated via mathematical bisection over the Henderson-Hasselbalch ionization equations using standard pKa constants, the Kyte-Doolittle index, and Pace extinction coefficients.',
    howToInterpret:
      'Proteins with pI < 7 are acidic at physiological pH; proteins with pI > 7 are basic. A high hydrophobic ratio (>40%) often indicates globular core packing or membrane-spanning domains.',
    limitations:
      'Assumes standard aqueous solvent conditions. Does not account for tertiary shielding, post-translational modifications (PTMs), or non-physiological ionic strengths.',
  },
  {
    id: 'functional-annotation',
    num: 4,
    title: 'Functional Annotation',
    category: 'Ontology',
    whatItDoes:
      'Displays standardized Gene Ontology (GO) terms categorized by Molecular Function, Biological Process, and Cellular Component, alongside curated catalytic/active site residues.',
    whatToEnter:
      'Automatically loaded from UniProt and QuickGO for the active protein accession.',
    whatOutputMeans:
      'Provides machine-readable biological classifications describing exact enzymatic activities, physiological roles, and intracellular organelles.',
    howDataObtained:
      'Retrieved from the Gene Ontology Annotation (GOA) database and Swiss-Prot biocuration records.',
    howToInterpret:
      'Check the attached GO Evidence Codes (e.g. EXP, IDA vs IEA). Experimental codes indicate wet-lab verification; computational codes indicate automated homology matches.',
    limitations:
      'Proteins lacking experimental literature may only possess electronically inferred (IEA) terms that have not been manually reviewed.',
  },
  {
    id: 'domain-analysis',
    num: 5,
    title: 'Domain Analysis',
    category: 'Architecture',
    whatItDoes:
      'Maps functional domain architectures along the primary sequence using Pfam and InterPro profile Hidden Markov Models (HMMs).',
    whatToEnter:
      'Extracted automatically from the protein entry.',
    whatOutputMeans:
      'Identifies autonomous structural and evolutionary folding units, residue boundary ranges (e.g. 94–292 for the p53 DNA-binding domain), and conserved functional motifs.',
    howDataObtained:
      'Aligned against the Pfam-A database using profile HMMER3 models indexed in InterPro.',
    howToInterpret:
      'Domains highlight autonomous modules that fold independently and carry specific activities (e.g. kinase domains, zinc fingers, SH3 domains).',
    limitations:
      'Domain boundaries are probabilistic alignments; intrinsically disordered regions (IDRs) often lack defined Pfam domain signatures.',
  },
  {
    id: '3d-structure-analysis',
    num: 6,
    title: '3D Structure Analysis',
    category: 'Biophysics',
    whatItDoes:
      'Provides dual interactive WebGL 3D molecular viewers (3Dmol.js and official RCSB Mol*) to inspect tertiary folds, cartoon helices, beta sheets, active site side chains, bound ligands, and surface electrostatics.',
    whatToEnter:
      'PDB accession code or coordinates loaded with the active model.',
    whatOutputMeans:
      'Renders the precise atomic coordinates (x, y, z) determined experimentally via X-ray crystallography, Cryo-Electron Microscopy (Cryo-EM), or NMR.',
    howDataObtained:
      'Fetched in real time from the RCSB Protein Data Bank archive in CIF / PDB formats.',
    howToInterpret:
      'Use mouse controls to rotate, pan, and zoom. Toggle render styles (Cartoon, Stick, Sphere, Surface) to analyze steric pockets and ligand-binding cavities.',
    limitations:
      'Static crystallographic coordinates capture a frozen state; flexible loops with high B-factors may have weak electron density and appear discontinuous.',
  },
  {
    id: 'interaction-analysis',
    num: 7,
    title: 'Interaction Analysis',
    category: 'Interactome',
    whatItDoes:
      'Visualizes protein-protein interaction (PPI) networks, identifying physical complex partners, signaling cascades, and functional associations.',
    whatToEnter:
      'Queries the active gene symbol or UniProt ID against interactome repositories.',
    whatOutputMeans:
      'Lists direct binding partners with combined confidence scores (0.00–1.00) and experimental evidence sub-scores.',
    howDataObtained:
      'Retrieved from STRING v12 and BioGRID REST APIs using verified co-immunoprecipitation, yeast two-hybrid, and co-crystallography data.',
    howToInterpret:
      'Combined scores > 0.7 indicate high-confidence interactions; experimental scores > 0.4 confirm physical binding detected in wet-lab assays.',
    limitations:
      'Text-mining and gene co-occurrence scores provide indirect statistical associations and do not guarantee direct physical interaction.',
  },
  {
    id: 'variant-analysis',
    num: 8,
    title: 'Variant Analysis',
    category: 'In Silico Lab',
    whatItDoes:
      'Simulates single amino acid substitutions (point mutations), calculating ΔCharge, ΔHydropathy shifts, steric clash indicators, and PolyPhen-concordant stability impacts.',
    whatToEnter:
      'Select any residue position along the sequence and choose the mutated amino acid.',
    whatOutputMeans:
      'Reports whether the substitution is predicted to be Stabilizing, Neutral, Destabilizing, or Highly Destabilizing to the protein fold.',
    howDataObtained:
      'Evaluated through biophysical residue parameter matrices, BLOSUM62 substitution penalties, and spatial contact geometry.',
    howToInterpret:
      'Charge inversions (e.g. Arg(+) to Asp(-)) or burying hydrophilic residues inside a hydrophobic core typically result in severe destabilization.',
    limitations:
      'Linear heuristic simulation does not execute multi-nanosecond molecular dynamics (MD) solvent trajectories.',
  },
  {
    id: 'mutation-mechanism',
    num: 9,
    title: 'Mutation Mechanism Engine (v3.0)',
    category: 'Mechanistic Biology',
    whatItDoes:
      'Constructs a continuous 5-stage causal chain connecting sequence mutations to atomic stereochemistry, 3D structural environments, molecular binding interfaces, downstream functional implications, and clinical disease registries.',
    whatToEnter:
      'Enter single amino acid substitution notation (e.g. "TP53 R273C", "R273C", "p.Arg273Cys", or "E6V"), or select one of the curated benchmark shortcuts (TP53 R273C, R248W, R175H; HBB E6V; UBB K48R).',
    whatOutputMeans:
      'Generates: (1) 5-Stage Mechanistic Evidence Chain with clear categorical tagging, (2) Calculated physical deltas (ΔCharge, ΔHydropathy, ΔVolume in Å³), (3) 3D nearby contact shell residues within ≤6.5 Å, (4) Direct distances to functional binding partners (DNA major/minor groove, zinc coordination centers, protein-protein interfaces), and (5) Evidence Summary matrix separating Supporting, Conflicting, and Missing evidence.',
    howDataObtained:
      'Synthesized from high-resolution crystallographic coordinates in the RCSB Protein Data Bank (e.g., 1TUP at 2.2 Å, 2HBS at 2.05 Å, 1UBQ at 1.8 Å), DSSP secondary structure determinations, Richards (1974) amino acid molecular volume metrics, Kyte-Doolittle scales, ClinVar ACMG assertions, and peer-reviewed literature indexed in PubMed/DOI.',
    howToInterpret:
      'Look for the evidence tier badges: Experimental Evidence (green), Database Evidence (cyan), Literature Evidence (amber), and Computational Prediction (purple, explicitly marked "PREDICTION (NOT FACT)"). The Evidence Summary shows missing assays (e.g., Isothermal Titration Calorimetry, Cryo-EM) needed for experimental confirmation.',
    limitations:
      'Strict Scientific Governance Rule: Computational predictions (e.g. estimated ΔΔG, in silico impact classifications) are hypothesis generators, not established physical facts. Static X-ray crystal structures depict frozen states and do not capture flexible millisecond conformational ensembles or induced-fit ligand dynamics.',
  },
  {
    id: 'disease-cancer-analysis',
    num: 10,
    title: 'Disease & Cancer Analysis',
    category: 'Clinical',
    whatItDoes:
      'Maps clinically cataloged variants, ACMG pathogenicity classifications, somatic cancer mutation frequencies, and hotspot density needle plots.',
    whatToEnter:
      'Loaded automatically from ClinVar and somatic cancer repositories for the active gene.',
    whatOutputMeans:
      'Visualizes mutational hotspots across the primary sequence and structural coordinates, highlighting residues frequently mutated in human tumors.',
    howDataObtained:
      'Compiled from NCBI ClinVar records and cancer genome registries (e.g. TCGA / COSMIC aggregate data).',
    howToInterpret:
      'Residues with high cancer counts (e.g. p53 R175, R248, R273) denote critical functional bottlenecks where alterations confer oncogenic driver properties.',
    limitations:
      'ClinVar submissions reflect community submissions and varying review statuses (1-star vs 3-star expert panels); clinical significance may evolve.',
  },
  {
    id: 'aiml-analysis',
    num: 11,
    title: 'AI/ML Analysis',
    category: 'Machine Learning',
    whatItDoes:
      'Executes a 10-dimensional biophysical and evolutionary Machine Learning pipeline utilizing Random Forest, XGBoost, and SVM to predict variant functional impact with TreeSHAP explainability and epistemic uncertainty quantification.',
    whatToEnter:
      'Select a variant and choose the ML model architecture (Random Forest, XGBoost, or SVM).',
    whatOutputMeans:
      'Outputs: (1) Predicted Impact (Pathogenic / Deleterious vs Neutral), (2) Calibrated Probability, (3) Model Uncertainty (σ and Shannon entropy), (4) Global feature importance rankings, and (5) Local TreeSHAP waterfall attributions.',
    howDataObtained:
      'Trained on gold-standard ClinVar and experimental saturation mutagenesis datasets using 10 engineered biophysical features.',
    howToInterpret:
      'TreeSHAP values reveal the exact contribution of each feature (e.g. conservation +0.28, RSA -0.12) to the final prediction. Higher uncertainty indicates variants that lie in sparse regions of the feature space.',
    limitations:
      'Predictions are computational hypotheses intended for research prioritization, NOT clinical diagnosis or therapeutic prescription.',
  },
  {
    id: 'research-copilot',
    num: 12,
    title: 'Research Copilot',
    category: 'Intelligence',
    whatItDoes:
      'An evidence-grounded research assistant providing instant answers to scientific inquiries regarding protein function, domains, active sites, interactions, disease evidence, and structural impacts.',
    whatToEnter:
      'Ask any research question or click one of the suggested query chips (e.g. "What does this protein do?", "What mutations occur in this domain?").',
    whatOutputMeans:
      'Delivers clear, structured responses tagged with evidence category badges ([Database Evidence], [Experimental Evidence], [Literature Evidence], [Computational Prediction], [AI Interpretation]) and clickable citations.',
    howDataObtained:
      'Strictly grounds responses on retrieved records from UniProt, RCSB PDB, Gene Ontology, Pfam, ClinVar, STRING, and PubMed.',
    howToInterpret:
      'Expand the "Evidence Used" section below any answer to inspect the exact database records and accessions supporting each claim.',
    limitations:
      'Will not fabricate biological claims when underlying database records are absent.',
  },
  {
    id: 'research-report-generation',
    num: 13,
    title: 'Research Report Generation',
    category: 'Reporting',
    whatItDoes:
      'Compiles a structured 11-chapter research dossier covering protein identity, sequence metrics, domain architecture, functional ontology, tertiary coordinates, interactome, variants, AI predictions, and limitations.',
    whatToEnter:
      'Click the "Generate Research Report" button on the Navbar, Homepage, or Report tab.',
    whatOutputMeans:
      'Creates a publication-ready document exportable as high-resolution PDF or structured JSON for computational pipelines.',
    howDataObtained:
      'Aggregated in real time from the active protein memory store and synchronized database caches.',
    howToInterpret:
      'Use the generated report as a laboratory research briefing, computational supplement, or grant application reference.',
    limitations:
      'Designed exclusively for research and educational purposes under the ProteoFlow Research Use Only (RUO) license.',
  },
  {
    id: 'evidence-citations',
    num: 14,
    title: 'Evidence & Citations',
    category: 'Provenance',
    whatItDoes:
      'Enforces global scientific provenance, ensuring that every result in ProteoFlow displays its source database, accession ID, evidence tier, retrieval date, and direct external URL.',
    whatToEnter:
      'Click any provenance badge or external link attached to a result.',
    whatOutputMeans:
      'Allows researchers to trace and independently verify any datum in primary source databases.',
    howDataObtained:
      'Maintained via strict provenance metadata schemas embedded in every data object.',
    howToInterpret:
      'Green badges denote direct experimental evidence; cyan denotes curated database records; amber denotes peer-reviewed literature; purple denotes computational simulations.',
    limitations:
      'If an upstream external API is temporarily down, ProteoFlow reports "Data unavailable — source could not be retrieved" rather than substituting invented data.',
  },
  {
    id: 'data-sources',
    num: 15,
    title: 'Data Sources',
    category: 'Provenance',
    whatItDoes:
      'Catalogs all external biological databases integrated into the ProteoFlow pipeline: UniProtKB/Swiss-Prot, RCSB PDB, Gene Ontology, Pfam, InterPro, ClinVar, STRING, BioGRID, and PubMed.',
    whatToEnter:
      'Informational reference module; no input required.',
    whatOutputMeans:
      'Displays the scope, versioning, curation methodologies, and update cycles of each upstream partner repository.',
    howDataObtained:
      'Indexed directly from official repository documentation and live metadata headers.',
    howToInterpret:
      'Verify which repository provides each class of biological information (e.g. UniProt for sequence, PDB for coordinates, ClinVar for pathology).',
    limitations:
      'Different databases have distinct biocuration release cycles; synchronization may reflect minor latency between releases.',
  },
  {
    id: 'limitations',
    num: 16,
    title: 'Limitations',
    category: 'Regulatory',
    whatItDoes:
      'Explicitly delineates the computational, biological, and physical boundaries of in silico bioinformatics modeling.',
    whatToEnter:
      'Informational reference; review before drawing experimental conclusions.',
    whatOutputMeans:
      'Protects researchers from over-interpreting in silico predictions as definitive empirical proof.',
    howDataObtained:
      'Derived from best practices in computational biophysics and bioethics guidelines.',
    howToInterpret:
      'Always treat computational scores as hypotheses that prioritize wet-lab experiments, not as clinical diagnostic conclusions.',
    limitations:
      'In silico algorithms simplify solvent dynamics, crowded intracellular viscosity, and post-translational cascades.',
  },
  {
    id: 'troubleshooting',
    num: 17,
    title: 'Troubleshooting',
    category: 'Support',
    whatItDoes:
      'Provides solutions for common operational queries: invalid FASTA formatting, missing PDB coordinates, CORS proxy delays, and WebGL rendering optimizations.',
    whatToEnter:
      'Search error symptoms or review standard troubleshooting steps.',
    whatOutputMeans:
      'Actionable debugging guidance to resolve workflow interruptions.',
    howDataObtained:
      'Compiled from user feedback and browser console diagnostic logs.',
    howToInterpret:
      'Follow the suggested checklist to verify network access, sequence sanitization, and WebGL hardware acceleration.',
    limitations:
      'Requires an active modern web browser with WebGL 2.0 enabled.',
  },
];

const EVIDENCE_CODES_DATA = [
  {
    code: 'IDA',
    name: 'Inferred from Direct Assay',
    tier: 'Experimental (Tier 1)',
    color: 'emerald',
    desc: 'Indicates that the functional assertion is supported by a direct enzyme assay, in vitro kinetic experiment, or biochemical measurement.',
  },
  {
    code: 'EXP',
    name: 'Inferred from Experiment',
    tier: 'Experimental (Tier 1)',
    color: 'emerald',
    desc: 'General experimental evidence code used when a laboratory wet-lab publication explicitly verifies the biological observation.',
  },
  {
    code: 'IPI',
    name: 'Inferred from Physical Interaction',
    tier: 'Experimental (Tier 1)',
    color: 'emerald',
    desc: 'Supported by physical binding assays such as Co-Immunoprecipitation (Co-IP), Yeast Two-Hybrid, Surface Plasmon Resonance (SPR), or co-crystallography.',
  },
  {
    code: 'IEA',
    name: 'Inferred from Electronic Annotation',
    tier: 'Automated / Computational (Tier 3)',
    color: 'purple',
    desc: 'Assigned automatically by computational pipelines (e.g. sequence orthology, InterProScan) without direct human curator or laboratory review.',
  },
];

const getTargetSectionId = (guideId: string): string => {
  switch (guideId) {
    case 'getting-started':
      return 'home';
    case 'protein-input':
      return 'input';
    case 'sequence-dashboard':
    case 'functional-annotation':
    case 'domain-analysis':
    case '3d-structure-analysis':
    case 'interaction-analysis':
      return 'dashboard';
    case 'mutation-mechanism':
      return 'mechanism';
    case 'variant-analysis':
    case 'disease-cancer-analysis':
    case 'aiml-analysis':
      return 'advanced';
    case 'research-copilot':
      return 'copilot';
    case 'research-report-generation':
      return 'report';
    default:
      return 'dashboard';
  }
};

export const AboutSection: React.FC<AboutSectionProps> = ({
  onNavigateSection,
  onOpenAiModal,
  onOpenExportModal,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  const filteredSections = USER_GUIDE_SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.whatItDoes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSection =
    USER_GUIDE_SECTIONS.find((s) => s.id === selectedSectionId) || USER_GUIDE_SECTIONS[0];

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(
      'P04637 → TP53 → Sequence Analysis → Domains → 3D Structures → GO Functions → Interactions → Variants → 5-Stage Mutation Mechanism → Cancer Evidence → AI Analysis → Research Dossier'
    );
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-medium text-cyan-300">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Interactive Documentation & User Guide</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ProteoFlow Comprehensive User Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Complete operational specifications for all 17 workbench modules, biocuration evidence codes, 5-stage mutation mechanism governance, prediction vs. experimental taxonomies, and reproducible workflows.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-cyan-400">
              17 Modules Documented
            </span>
          </div>
        </div>
      </section>

      {/* 2. EXAMPLE WORKFLOW BANNER */}
      <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Standard Research Workflow Pipeline Example
            </h3>
          </div>
          <button
            onClick={handleCopyWorkflow}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
          >
            {copiedWorkflow ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedWorkflow ? 'Copied Workflow' : 'Copy Sequence Steps'}</span>
          </button>
        </div>

        {/* Workflow Breadcrumb Step Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {[
            { label: 'P04637', type: 'id' },
            { label: 'TP53', type: 'gene' },
            { label: 'Sequence Analysis', type: 'step' },
            { label: 'Domains', type: 'step' },
            { label: '3D Structures', type: 'step' },
            { label: 'GO Functions', type: 'step' },
            { label: 'Interactions', type: 'step' },
            { label: 'Variants', type: 'step' },
            { label: '5-Stage Mechanism', type: 'step' },
            { label: 'Cancer Evidence', type: 'step' },
            { label: 'AI Analysis', type: 'step' },
            { label: 'Research Report', type: 'final' },
          ].map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <span
                className={`px-2.5 py-1 rounded-lg border font-semibold ${
                  item.type === 'final'
                    ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white border-transparent'
                    : item.type === 'id' || item.type === 'gene'
                    ? 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {item.label}
              </span>
              {idx < arr.length - 1 && <span className="text-slate-600 font-bold">→</span>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 3. CORE TAXONOMY EXPLANATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Understanding Evidence Codes */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FlaskConical className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Understanding Evidence Codes (Gene Ontology)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In biological databases, assertions are accompanied by evidence codes explaining how the knowledge was acquired:
          </p>

          <div className="space-y-2.5">
            {EVIDENCE_CODES_DATA.map((codeItem) => (
              <div
                key={codeItem.code}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                      {codeItem.code}
                    </span>
                    <span className="font-semibold text-white">{codeItem.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">{codeItem.tier}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {codeItem.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Understanding Prediction vs. Evidence */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Understanding Prediction vs. Evidence
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ProteoFlow maintains an unambiguous conceptual separation between empirical observations and computational models:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1">
              <strong className="text-emerald-300 block flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                1. Experimental Observations ≠ Computational Predictions
              </strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                An X-ray crystal structure or a direct enzyme kinetic assay is an empirical measurement of physical reality. A stability score or secondary structure prediction is a mathematical heuristic model.
              </p>
            </div>

            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 space-y-1">
              <strong className="text-purple-300 block flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                2. AI/ML Outputs Are Hypotheses, Not Clinical Diagnoses
              </strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Random Forest and SVM functional impact predictions provide rapid research prioritization. They are never to be used as medical diagnostics or therapeutic directives.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 space-y-1">
              <strong className="text-cyan-300 block flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" />
                3. Database Annotations Have Distinct Evidence Tiers
              </strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Curated Swiss-Prot records reviewed by expert biocurators carry higher evidentiary confidence than unreviewed TrEMBL electronic matches.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 space-y-1">
              <strong className="text-amber-300 block flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                4. Multi-Scale Causal Chain Governance
              </strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Every step in a mutation mechanism causal chain (Mutation → Structure → Interface → Function → Disease) explicitly reports its empirical classification. Unresolved steps are marked "Evidence unavailable" with required assays specified rather than guessed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE 17-MODULE USER GUIDE BROWSER */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>17-Module Operational Manual</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any module below to inspect inputs, outputs, biological interpretation, and limitations
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user guide..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Two-column layout: Module List + Detailed Specification View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Module Selector (4 Cols) */}
          <div className="lg:col-span-4 space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredSections.map((sec) => {
              const isSelected = sec.id === selectedSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full text-left rounded-xl p-3 border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sec.num}
                    </span>
                    <div>
                      <div className="text-xs font-bold leading-tight">{sec.title}</div>
                      <div className="text-[10px] text-slate-500">{sec.category}</div>
                    </div>
                  </div>
                  <ArrowRight
                    className={`h-3 w-3 ${
                      isSelected ? 'text-cyan-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Module Detailed View (8 Cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs">
                    {activeSection.num}
                  </span>
                  <h3 className="text-lg font-bold text-white">{activeSection.title}</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-full">
                  {activeSection.category}
                </span>
              </div>
            </div>

            {/* 6 Structured Requirement Fields */}
            <div className="space-y-4 text-xs">
              {/* What it does */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1">
                <span className="font-bold text-cyan-300 font-mono uppercase text-[10px] block">
                  1. What It Does
                </span>
                <p className="text-slate-300 leading-relaxed">{activeSection.whatItDoes}</p>
              </div>

              {/* What the user needs to enter */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1">
                <span className="font-bold text-emerald-300 font-mono uppercase text-[10px] block">
                  2. What the User Needs to Enter
                </span>
                <p className="text-slate-300 leading-relaxed">{activeSection.whatToEnter}</p>
              </div>

              {/* What the output means */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1">
                <span className="font-bold text-sky-300 font-mono uppercase text-[10px] block">
                  3. What the Output Means
                </span>
                <p className="text-slate-300 leading-relaxed">{activeSection.whatOutputMeans}</p>
              </div>

              {/* How the data is obtained */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1">
                <span className="font-bold text-purple-300 font-mono uppercase text-[10px] block">
                  4. How the Data Is Obtained
                </span>
                <p className="text-slate-300 leading-relaxed">{activeSection.howDataObtained}</p>
              </div>

              {/* How to interpret the result */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1">
                <span className="font-bold text-amber-300 font-mono uppercase text-[10px] block">
                  5. How to Interpret the Result
                </span>
                <p className="text-slate-300 leading-relaxed">{activeSection.howToInterpret}</p>
              </div>

              {/* What the limitations are */}
              <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3.5 space-y-1">
                <span className="font-bold text-rose-300 font-mono uppercase text-[10px] block flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  6. Methodological Limitations & Boundaries
                </span>
                <p className="text-slate-300 leading-relaxed">{activeSection.limitations}</p>
              </div>

              {/* Action Button: Jump directly into this Workbench Module */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Ready to test this capability with the active protein?
                </div>
                <button
                  onClick={() => onNavigateSection(getTargetSectionId(activeSection.id))}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:from-cyan-500 hover:to-emerald-500 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Open {activeSection.title} in Workbench</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
