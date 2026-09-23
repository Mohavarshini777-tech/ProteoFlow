// Gene Ontology Evidence Codes and Evidence Classification Utilities
// Standardized by the Gene Ontology Consortium (GOC) and UniProtKB

export interface GoEvidenceInfo {
  code: string;
  fullName: string;
  category: 'Experimental' | 'High-Throughput' | 'Computational' | 'Author Statement' | 'Curator Statement' | 'Phylogenetic' | 'Electronic (Unreviewed)';
  description: string;
  reliability: 'High (Direct Experimental)' | 'High (Curated Statement)' | 'Medium (Computational)' | 'Automated (Unreviewed)';
  badgeColor: string;
}

export const GO_EVIDENCE_MAP: Record<string, GoEvidenceInfo> = {
  // Experimental Evidence Codes (Highest confidence)
  EXP: {
    code: 'EXP',
    fullName: 'Inferred from Experiment',
    category: 'Experimental',
    description: 'Direct experimental assay or physical test in literature.',
    reliability: 'High (Direct Experimental)',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
  },
  IDA: {
    code: 'IDA',
    fullName: 'Inferred from Direct Assay',
    category: 'Experimental',
    description: 'Enzyme activity, binding affinity, or physical assay directly on the protein.',
    reliability: 'High (Direct Experimental)',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
  },
  IPI: {
    code: 'IPI',
    fullName: 'Inferred from Physical Interaction',
    category: 'Experimental',
    description: 'Direct physical interaction (e.g., co-IP, yeast 2-hybrid, crosslinking).',
    reliability: 'High (Direct Experimental)',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
  },
  IMP: {
    code: 'IMP',
    fullName: 'Inferred from Mutant Phenotype',
    category: 'Experimental',
    description: 'Inferred from phenotypic alterations caused by gene knockout or mutation.',
    reliability: 'High (Direct Experimental)',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
  },
  IGI: {
    code: 'IGI',
    fullName: 'Inferred from Genetic Interaction',
    category: 'Experimental',
    description: 'Inferred from synthetic lethality or suppression between two mutations.',
    reliability: 'High (Direct Experimental)',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
  },
  IEP: {
    code: 'IEP',
    fullName: 'Inferred from Expression Pattern',
    category: 'Experimental',
    description: 'Spatial or temporal timing of gene expression indicates function.',
    reliability: 'High (Direct Experimental)',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
  },

  // High-Throughput Codes
  HTP: {
    code: 'HTP',
    fullName: 'Inferred from High Throughput Experiment',
    category: 'High-Throughput',
    description: 'Large-scale automated physical or biochemical screening.',
    reliability: 'High (Direct Experimental)',
    badgeColor: 'border-teal-500/40 bg-teal-950/40 text-teal-300',
  },
  HDA: {
    code: 'HDA',
    fullName: 'Inferred from High Throughput Direct Assay',
    category: 'High-Throughput',
    description: 'High-throughput direct biochemical assay.',
    reliability: 'High (Direct Experimental)',
    badgeColor: 'border-teal-500/40 bg-teal-950/40 text-teal-300',
  },
  HMP: {
    code: 'HMP',
    fullName: 'Inferred from High Throughput Mutant Phenotype',
    category: 'High-Throughput',
    description: 'High-throughput mutant screening.',
    reliability: 'High (Direct Experimental)',
    badgeColor: 'border-teal-500/40 bg-teal-950/40 text-teal-300',
  },

  // Author & Curator Statements (Manually Curated)
  TAS: {
    code: 'TAS',
    fullName: 'Traceable Author Statement',
    category: 'Author Statement',
    description: 'Direct statement by author cited from peer-reviewed publication.',
    reliability: 'High (Curated Statement)',
    badgeColor: 'border-sky-500/40 bg-sky-950/40 text-sky-300',
  },
  NAS: {
    code: 'NAS',
    fullName: 'Non-traceable Author Statement',
    category: 'Author Statement',
    description: 'Statement in review or secondary source without original data citation.',
    reliability: 'High (Curated Statement)',
    badgeColor: 'border-sky-500/40 bg-sky-950/40 text-sky-300',
  },
  IC: {
    code: 'IC',
    fullName: 'Inferred by Curator',
    category: 'Curator Statement',
    description: 'Expert biocurator synthesis of multiple contextual papers.',
    reliability: 'High (Curated Statement)',
    badgeColor: 'border-indigo-500/40 bg-indigo-950/40 text-indigo-300',
  },

  // Phylogenetic & Ancestral Codes
  IBA: {
    code: 'IBA',
    fullName: 'Inferred from Biological Ancestor',
    category: 'Phylogenetic',
    description: 'Phylogenetic propagation of experimental function from ancestral nodes.',
    reliability: 'High (Curated Statement)',
    badgeColor: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
  },
  IBD: {
    code: 'IBD',
    fullName: 'Inferred from Biological Descendant',
    category: 'Phylogenetic',
    description: 'Phylogenetic inference from conserved descendant proteins.',
    reliability: 'High (Curated Statement)',
    badgeColor: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
  },

  // Computational & Sequence Analysis Codes
  ISS: {
    code: 'ISS',
    fullName: 'Inferred from Sequence/Structural Similarity',
    category: 'Computational',
    description: 'High sequence identity or 3D structural alignment to characterized protein.',
    reliability: 'Medium (Computational)',
    badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
  },
  ISO: {
    code: 'ISO',
    fullName: 'Inferred from Sequence Orthology',
    category: 'Computational',
    description: 'Orthologous gene relationship established through reciprocal best BLAST.',
    reliability: 'Medium (Computational)',
    badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
  },
  ISA: {
    code: 'ISA',
    fullName: 'Inferred from Sequence Alignment',
    category: 'Computational',
    description: 'Multiple sequence alignment highlights conserved active residues.',
    reliability: 'Medium (Computational)',
    badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
  },
  ISM: {
    code: 'ISM',
    fullName: 'Inferred from Sequence Model',
    category: 'Computational',
    description: 'Profile HMM or domain hidden Markov model match (e.g., Pfam).',
    reliability: 'Medium (Computational)',
    badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
  },
  IGC: {
    code: 'IGC',
    fullName: 'Inferred from Genomic Context',
    category: 'Computational',
    description: 'Operon structure, gene neighborhood, or conserved synteny.',
    reliability: 'Medium (Computational)',
    badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
  },
  RCA: {
    code: 'RCA',
    fullName: 'Reviewed Computational Analysis',
    category: 'Computational',
    description: 'Manually curated computer-assisted prediction.',
    reliability: 'Medium (Computational)',
    badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
  },

  // Electronic / Unreviewed
  IEA: {
    code: 'IEA',
    fullName: 'Inferred from Electronic Annotation',
    category: 'Electronic (Unreviewed)',
    description: 'Automated pipeline mapping without manual biocurator review.',
    reliability: 'Automated (Unreviewed)',
    badgeColor: 'border-slate-600/40 bg-slate-900/60 text-slate-300',
  },
  ND: {
    code: 'ND',
    fullName: 'No biological Data available',
    category: 'Curator Statement',
    description: 'Curators investigated and found no biological data published to date.',
    reliability: 'High (Curated Statement)',
    badgeColor: 'border-rose-500/40 bg-rose-950/40 text-rose-300',
  },
};

/**
 * Extracts and cleans a GO evidence code from a string, returning full metadata
 */
export function parseGoEvidence(rawEvidence: string = 'IEA'): GoEvidenceInfo {
  // Strip parentheses and whitespace: e.g. "EXP (Inferred from Experiment)" -> "EXP"
  const match = rawEvidence.match(/\b([A-Z]{2,4})\b/);
  const code = (match ? match[1] : rawEvidence).trim().toUpperCase();

  if (GO_EVIDENCE_MAP[code]) {
    return GO_EVIDENCE_MAP[code];
  }

  // Fallback for unknown or composite codes
  return {
    code: code || 'CUR',
    fullName: rawEvidence,
    category: 'Curator Statement',
    description: `Curated evidence annotation: ${rawEvidence}`,
    reliability: 'Medium (Computational)',
    badgeColor: 'border-slate-700 bg-slate-900 text-slate-300',
  };
}

/**
 * STRING Confidence tier classification
 */
export function getConfidenceTier(score: number): {
  tier: 'Highest Confidence (≥0.900)' | 'High Confidence (≥0.700)' | 'Medium Confidence (≥0.400)' | 'Low Confidence (<0.400)';
  badgeColor: string;
  label: string;
} {
  if (score >= 0.9) {
    return {
      tier: 'Highest Confidence (≥0.900)',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
      label: 'Highest',
    };
  }
  if (score >= 0.7) {
    return {
      tier: 'High Confidence (≥0.700)',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
      label: 'High',
    };
  }
  if (score >= 0.4) {
    return {
      tier: 'Medium Confidence (≥0.400)',
      badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
      label: 'Medium',
    };
  }
  return {
    tier: 'Low Confidence (<0.400)',
    badgeColor: 'border-slate-600 bg-slate-900 text-slate-400',
    label: 'Low',
  };
}
