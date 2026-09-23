import {
  GroundedEvidenceCategory,
  LiteratureCitation,
  ClinicalVariant,
} from '../types';

export interface ResiduePropertyComparison {
  property: string;
  wildTypeVal: string | number;
  mutantVal: string | number;
  delta: string | number;
  shiftInterpretation: string;
}

export interface NearbyResidueContact {
  position: number;
  aminoAcid: string;
  distanceAngstrom: number;
  interactionType: 'Hydrogen Bond' | 'Salt Bridge' | 'Van der Waals' | 'Hydrophobic Core' | 'Aromatic Pi-Pi' | 'Disulfide Potential';
  isMutated?: boolean;
}

export interface FunctionalInterfaceContact {
  interfaceType: 'DNA Contact (Major Groove)' | 'DNA Contact (Minor Groove)' | 'DNA Backbone (Electrostatic)' | 'Zinc Coordination' | 'Bound Ligand Pocket' | 'Protein-Protein Interface' | 'None';
  targetName: string;
  distanceAngstrom: number | null; // null if unavailable
  description: string;
  isDirectContact: boolean;
}

export interface MechanisticStepEvidence {
  step: 'mutation' | 'structural_change' | 'interaction_change' | 'functional_implication' | 'disease_evidence';
  title: string;
  category: 'Experimental Evidence' | 'Database Evidence' | 'Literature Evidence' | 'Computational Prediction';
  evidenceType: GroundedEvidenceCategory;
  finding: string;
  isPrediction: boolean;
  citation: {
    source: string;
    accessionOrPmid?: string;
    url?: string;
    year?: number;
    title?: string;
  };
}

export interface MutationEvidenceSummary {
  supportingEvidence: Array<{
    claim: string;
    category: 'Experimental' | 'Database' | 'Literature' | 'Computational';
    source: string;
  }>;
  conflictingEvidence: Array<{
    claim: string;
    source: string;
    notes: string;
  }>;
  missingEvidence: Array<{
    item: string;
    reason: string;
    neededValidation: string;
  }>;
}

export interface MutationMechanismAnalysis {
  id: string;
  variantQuery: string; // e.g. "TP53 R273C" or "R273C"
  proteinName: string;
  gene: string;
  uniprotId: string;
  pdbId: string;
  
  // 1. Basic Amino Acid & Residue Properties
  wildTypeAa: {
    code1: string;
    code3: string;
    name: string;
    charge: number;
    hydropathy: number;
    volume: number; // Å³
    polarity: string;
    pKa?: number;
  };
  mutantAa: {
    code1: string;
    code3: string;
    name: string;
    charge: number;
    hydropathy: number;
    volume: number; // Å³
    polarity: string;
    pKa?: number;
  };
  position: number;
  notation: string; // e.g. "R273C"
  hgvsProtein: string; // e.g. "p.Arg273Cys"

  // 2. Structural & Topological Environment
  domain: {
    name: string;
    accession: string;
    range: string;
    source: string;
    isInside: boolean;
  };
  secondaryStructure: {
    type: 'Beta-Sheet' | 'Alpha-Helix' | 'Loop / Turn' | 'Unstructured';
    elementName: string; // e.g. "Sheet S10" or "Helix H2"
    source: string;
  };
  solventAccessibility: {
    rsaPercent: number | null;
    classification: 'Exposed' | 'Partially Buried' | 'Buried' | 'Evidence unavailable';
    source: string;
  };
  nearbyResidues: NearbyResidueContact[];
  functionalInterfaces: FunctionalInterfaceContact[];
  
  // 3. Property Change Grid
  propertyComparisons: ResiduePropertyComparison[];

  // 4. 5-Stage Mechanistic Evidence Chain
  mechanisticChain: {
    mutationStep: MechanisticStepEvidence;
    structuralChangeStep: MechanisticStepEvidence;
    interactionChangeStep: MechanisticStepEvidence;
    functionalImplicationStep: MechanisticStepEvidence;
    diseaseEvidenceStep: MechanisticStepEvidence;
  };

  // 5. Evidence Audit: Supporting, Conflicting, Missing
  evidenceSummary: MutationEvidenceSummary;

  // 6. Clinical & Disease Linkages
  clinicalSignificance: string;
  phenotypes: string[];
  clinvarAccession?: string;
  cosmicId?: string;

  // 7. Rigorous Scientific Metadata & Caveats
  disclaimer: string;
  generatedAt: string;
}
