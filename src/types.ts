export type EvidenceCategory = 'experimental' | 'curated' | 'predicted' | 'ai_generated';

export interface AminoAcidInfo {
  code1: string;
  code3: string;
  name: string;
  mw: number; // Molecular weight in Da
  pKa?: number;
  hydropathy: number; // Kyte-Doolittle scale (-4.5 to 4.5)
  category: 'hydrophobic' | 'polar' | 'acidic' | 'basic' | 'special';
  chargeAtPh74: number;
}

export interface DomainAnnotation {
  id: string;
  name: string;
  start: number;
  end: number;
  type: 'domain' | 'motif' | 'active_site' | 'binding_site' | 'region';
  color?: string;
  description?: string;
  source?: 'Pfam' | 'InterPro' | 'UniProtKB' | 'PROSITE' | 'SMART' | 'In Silico';
  accession?: string;
  evidenceCategory?: EvidenceCategory;
}

export interface ActiveSiteResidue {
  residueIndex: number;
  residueName: string;
  description: string;
  type: 'catalytic' | 'binding' | 'metal' | 'ptm' | 'disulfide';
  source?: string;
  evidenceCategory?: EvidenceCategory;
}

export interface GoTerm {
  id: string;
  name: string;
  category: 'molecular_function' | 'biological_process' | 'cellular_component';
  evidence: string;
  evidenceCode?: string;
  evidenceCategory?: string;
  evidenceExplanation?: string;
  evidenceReliability?: string;
  sourceDatabase?: string;
}

export interface ProteinInteractionPartner {
  name: string;
  uniprotId?: string;
  score: number; // combined score 0 to 1
  role: string;
  type: 'PPI' | 'Complex' | 'Regulatory' | 'Substrate';
  experimentalScore?: number;
  databaseScore?: number;
  textminingScore?: number;
  coexpressionScore?: number;
  confidenceTier?: string;
  source?: string;
}

export interface BoundLigand {
  id: string;
  name: string;
  formula?: string;
  pocketResidues: string;
  affinity?: string;
  type?: 'Cofactor' | 'Metal Ion' | 'Inhibitor' | 'Substrate' | 'Glycan' | 'Solvent' | 'Small Molecule';
  source?: string;
}

export interface DnaInteraction {
  id: string;
  name: string;
  type: 'DNA Response Element' | 'Promoter DNA' | 'RNA' | 'Zinc Finger Coordination';
  motifSequence?: string;
  interfaceResidues: string;
  affinity?: string;
  source: string;
  description?: string;
}

export interface LiteratureCitation {
  id?: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  pmid?: string;
  doi?: string;
  url?: string;
  evidenceCategory?: EvidenceCategory;
}

export interface PdbStructureCoverage {
  coveredStart: number;
  coveredEnd: number;
  coveredLength: number;
  totalProteinLength: number;
  coveragePct: number;
  uncoveredNTerminus?: number;
  uncoveredCTerminus?: number;
  chainBreak?: string;
}

export interface PdbMetadata {
  pdbId: string;
  title: string;
  resolution?: string;
  method?: string;
  experimentalMethod?: string;
  rFactor?: string;
  rFree?: string;
  deposited?: string;
  organism?: string;
  chains?: string[];
  ligands?: string[];
  structureType?: 'experimental' | 'predicted';
  coverage?: PdbStructureCoverage;
  dsspSecondaryStructure?: {
    helixPct: number;
    sheetPct: number;
    coilPct: number;
    source: string;
  };
}

export interface DataProvenance {
  sourceDatabase: string;
  isReviewed: boolean; // Swiss-Prot = true, TrEMBL = false
  retrievalDate: string;
  retrievedDate?: string;
  uniprotUrl?: string;
  pdbUrl?: string;
  evidenceLevel: 'Experimental Structure & Curated Sequence' | 'Experimental Structure Only' | 'Curated Sequence Only' | 'In Silico Synthetic';
  version?: string;
}

export type ClinicalSignificance =
  | 'Pathogenic'
  | 'Likely Pathogenic'
  | 'VUS'
  | 'Likely Benign'
  | 'Benign'
  | 'Risk Factor'
  | 'Conflicting';

export type MolecularConsequence =
  | 'Missense'
  | 'Nonsense (Stop Gained)'
  | 'Frameshift'
  | 'In-frame Deletion'
  | 'Synonymous'
  | 'Splice Site';

export type EvidenceTier =
  | 'Clinical Evidence' // ClinVar, ACMG/AMP clinical classifications
  | 'Database Annotation' // COSMIC, cBioPortal, IARC TP53, OMIM somatic/germline
  | 'Computational Prediction'; // AlphaMissense, SIFT, PolyPhen-2, ΔΔG folding

export interface CancerAssociation {
  cancerType: string;
  caseCount?: number;
  frequencyPct?: number;
  color?: string;
  study?: string;
}

export interface ComputationalPredictors {
  alphaMissense?: { score: number; classification: 'Likely Pathogenic' | 'Ambiguous' | 'Likely Benign' };
  sift?: { score: number; classification: 'Deleterious' | 'Tolerated' };
  polyphen2?: { score: number; classification: 'Probably Damaging' | 'Possibly Damaging' | 'Benign' };
  revel?: number;
  caddPhred?: number;
  predictedDdG?: number; // kcal/mol
}

export interface ClinicalVariant {
  id: string;
  position: number;
  wildType: string; // 1-letter code
  mutantResidue: string; // 1-letter code or '*' for stop
  hgvsProtein: string; // e.g. p.Arg175His
  hgvsCdna?: string; // e.g. c.524G>A
  consequence: MolecularConsequence;
  clinicalSignificance: ClinicalSignificance;
  clinvarId?: string; // e.g. VCV000012374
  dbsnpId?: string; // e.g. rs28934578
  cosmicId?: string; // e.g. COSV52968989
  reviewStars?: number; // 0-4 ClinVar stars
  reviewStatus?: string; // e.g. "criteria provided, multiple submitters, no conflicts"
  phenotypes: string[]; // e.g. ["Li-Fraumeni syndrome", "Colorectal carcinoma"]
  evidenceTier: EvidenceTier;
  evidenceSummary: string; // Clinical assertion or somatic observation summary
  cancerDistribution?: CancerAssociation[];
  totalCancerCases?: number;
  cancerFrequency?: number;
  structuralLocus?: string; // e.g. "Direct DNA contact (major groove)" or "Zinc-chelating coordination"
  functionalImpact?: string; // e.g. "Loss of transactivation and dominant-negative tetramer inhibition"
  computationalPredictors?: ComputationalPredictors;
  hotspotStatus?: 'Major Hotspot' | 'Secondary Hotspot' | 'Recurrent' | 'Sporadic';
  domainName?: string;
  references?: Array<{ title: string; pmid?: string; journal?: string; year?: number }>;
}

export interface HotspotSummary {
  totalVariants: number;
  pathogenicCount: number;
  vusCount: number;
  benignCount: number;
  majorHotspots: string[];
  dominantCancerTypes: Array<{ cancerType: string; percentage: number; count: number }>;
}

export interface VariantFeatures {
  substitution: string; // e.g. "R175H"
  wildType: string;
  mutantResidue: string;
  position: number;
  blosumScore: number; // -4 to 11
  chargeChange: number; // delta charge at pH 7.4
  hydrophobicityChange: number; // delta Kyte-Doolittle
  residueVolumeChange: number; // delta van der Waals volume in Å³
  evolutionaryConservation: number; // 0.0 (variable) to 1.0 (invariant)
  secondaryStructure: 'Helix' | 'Sheet' | 'Coil';
  secondaryStructureCode: number; // 1: Helix, 2: Sheet, 3: Coil
  isStructureDisruptor: boolean; // e.g. Proline in helix/sheet
  solventAccessibility: number; // 0-100% Relative Solvent Accessibility (RSA)
  solventCategory: 'Buried' | 'Intermediate' | 'Exposed';
  domainLocation: string; // Pfam/UniProt domain name or 'Unstructured / Linker'
  isInsideDomain: boolean;
  domainFunctionalWeight: number; // 0.1 to 1.0
  proximityToFunctionalSites: number; // Distance in Å to nearest DNA/metal/ligand
  nearestFunctionalSiteType: 'DNA Interface' | 'Metal Coordination' | 'Bound Ligand' | 'PPI Interface' | 'None';
  featureVector: number[]; // 10 normalized features [0, 1] for ML models
  featureLabels: string[];
}

export type MLModelType = 'random_forest' | 'xgboost' | 'svm';

export interface ShapAttributionValue {
  featureKey: string;
  featureLabel: string;
  featureValue: string | number;
  shapValue: number; // Positive = pushes toward pathogenic, Negative = pushes toward benign
  direction: 'pathogenic' | 'benign';
}

export interface MLModelMetadata {
  algorithm: string;
  modelType: MLModelType;
  trainingSamplesCount: number;
  trainingPositiveRatio: number;
  crossValidationAccuracy: number;
  auroc: number;
  f1Score: number;
  precision: number;
  recall: number;
  brierScore: number;
  trainingDatasetSource: string;
  trainedDate: string;
  isTrained: boolean;
  hyperparameters: Record<string, string | number | boolean>;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
}

export interface MLPredictionResult {
  variantId: string;
  variantNotation: string;
  modelType: MLModelType;
  modelName: string;
  predictedClass: 'Pathogenic' | 'Likely Pathogenic' | 'VUS' | 'Likely Benign' | 'Benign';
  pathogenicProbability: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  modelUncertainty: {
    epistemicStdDev: number; // Spread among tree ensemble votes
    shannonEntropy: number; // Shannon entropy H(p)
    uncertaintyLevel: 'Low' | 'Moderate' | 'High';
    explanation: string;
    treeVotesDistribution: number[]; // Class 1 probability vote per estimator
  };
  features: VariantFeatures;
  featureImportance: Array<{
    featureKey: string;
    featureLabel: string;
    importance: number; // Gini / MDI percentage (0-100%)
  }>;
  shapAttribution: {
    baseValue: number; // E[f(x)] ~ 0.50
    predictedValue: number; // f(x)
    values: ShapAttributionValue[];
  };
  modelMetadata: MLModelMetadata;
  isComputationalPrediction: true;
}

export interface ProteinData {
  id: string;
  uniprotId?: string;
  pdbId?: string;
  name: string;
  gene?: string;
  organism: string;
  sequence: string;
  length: number;
  molecularWeight: number; // in kDa
  isoelectricPoint: number; // pI
  netChargePh74: number;
  extinctionCoeff: number; // M^-1 cm^-1
  hydrophobicRatio: number; // 0-100%
  aminoAcidComposition: Record<string, { count: number; percentage: number }>;
  secondaryStructure: {
    helixPct: number;
    sheetPct: number;
    coilPct: number;
  };
  dsspSecondaryStructure?: {
    helixPct: number;
    sheetPct: number;
    coilPct: number;
    source: string;
  };
  domains: DomainAnnotation[];
  activeSites: ActiveSiteResidue[];
  goTerms: {
    molecularFunction: GoTerm[];
    biologicalProcess: GoTerm[];
    cellularComponent: GoTerm[];
  };
  interactions: {
    partners: ProteinInteractionPartner[];
    ligands: BoundLigand[];
    interfaceResidues: string[];
  };
  dnaInteractions?: DnaInteraction[];
  literature: LiteratureCitation[];
  pdbMetadata?: PdbMetadata;
  provenance?: DataProvenance;
  variants?: ClinicalVariant[];
  hotspotSummary?: HotspotSummary;
  description?: string;
}

export interface MutationSimulation {
  id: string;
  originalResidue: string;
  position: number;
  mutatedResidue: string;
  deltaCharge: number;
  deltaHydropathy: number;
  polarityShift: string;
  predictedStability: 'Stabilizing' | 'Neutral' | 'Destabilizing' | 'Highly Destabilizing';
  functionalImpactScore: number; // 0 - 100
  pathogenicityClassification: 'Benign' | 'Likely Benign' | 'Variant of Uncertain Significance' | 'Likely Pathogenic' | 'Pathogenic';
  mechanismExplanation: string;
  structuralRiskResidues: string[];
  clinVarAssociation?: string;
}

export interface AlignmentResult {
  seqA: string;
  seqB: string;
  alignedA: string;
  alignedB: string;
  matchLine: string;
  identityPct: number;
  similarityPct: number;
  score: number;
  gaps: number;
  length: number;
}

export interface AISynthesisReport {
  executiveSummary: string;
  structuralMechanismHypothesis: string;
  variantPathogenicityImpact: string;
  therapeuticOrBiotechImplications: string;
  keyRecommendations: string[];
  generatedAt?: string;
}

// Phase 4: Research Intelligence Types
export type GroundedEvidenceCategory =
  | 'database'
  | 'experimental'
  | 'literature'
  | 'computational'
  | 'ai-interpretation';

export interface RetrievedEvidenceItem {
  id: string;
  title: string;
  source:
    | 'UniProt'
    | 'RCSB PDB'
    | 'Gene Ontology'
    | 'Pfam/InterPro'
    | 'ClinVar'
    | 'STRING/BioGRID'
    | 'PubMed'
    | 'ProteoFlow In Silico';
  accession: string;
  evidenceType: GroundedEvidenceCategory;
  retrievedDate: string;
  method?: string;
  url: string;
  excerpt: string;
  relevance: string;
  confidenceOrTier?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  evidenceUsed?: RetrievedEvidenceItem[];
  evidenceCounts?: {
    database: number;
    experimental: number;
    literature: number;
    computational: number;
    aiInterpretation: number;
  };
  limitations?: string[];
  suggestedFollowUps?: string[];
  error?: boolean;
}

export interface ResearchReportSection {
  title: string;
  sectionNumber: number;
  summary: string;
  dataPoints: Record<string, any>;
  evidenceSources: RetrievedEvidenceItem[];
  limitations?: string[];
}

export interface FullResearchReport {
  id: string;
  generatedDate: string;
  retrievalDates: Record<string, string>;
  protein: {
    name: string;
    gene: string;
    uniprotId: string;
    pdbId: string;
    organism: string;
    length: number;
    molecularWeight: number;
    isoelectricPoint: number;
    charge: number;
    functionSummary: string;
  };
  sections: {
    identity: ResearchReportSection;
    sequence: ResearchReportSection;
    domains: ResearchReportSection;
    function: ResearchReportSection;
    structure: ResearchReportSection;
    interactions: ResearchReportSection;
    variants: ResearchReportSection;
    diseaseCancer: ResearchReportSection;
    aiMlPredictions: ResearchReportSection;
    evidenceAndLimitations: ResearchReportSection;
    references: ResearchReportSection;
  };
  executiveSynthesis?: AISynthesisReport;
  disclaimer: string;
}

