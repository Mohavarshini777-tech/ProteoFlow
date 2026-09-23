import {
  AminoAcidInfo,
  AlignmentResult,
  MutationSimulation,
  ProteinData,
} from '../types';

export const AMINO_ACIDS: Record<string, AminoAcidInfo> = {
  A: { code1: 'A', code3: 'ALA', name: 'Alanine', mw: 89.09, hydropathy: 1.8, category: 'hydrophobic', chargeAtPh74: 0 },
  R: { code1: 'R', code3: 'ARG', name: 'Arginine', mw: 174.20, pKa: 12.48, hydropathy: -4.5, category: 'basic', chargeAtPh74: 1.0 },
  N: { code1: 'N', code3: 'ASN', name: 'Asparagine', mw: 132.12, hydropathy: -3.5, category: 'polar', chargeAtPh74: 0 },
  D: { code1: 'D', code3: 'ASP', name: 'Aspartate', mw: 133.10, pKa: 3.65, hydropathy: -3.5, category: 'acidic', chargeAtPh74: -1.0 },
  C: { code1: 'C', code3: 'CYS', name: 'Cysteine', mw: 121.16, pKa: 8.18, hydropathy: 2.5, category: 'special', chargeAtPh74: -0.1 },
  E: { code1: 'E', code3: 'GLU', name: 'Glutamate', mw: 147.13, pKa: 4.25, hydropathy: -3.5, category: 'acidic', chargeAtPh74: -1.0 },
  Q: { code1: 'Q', code3: 'GLN', name: 'Glutamine', mw: 146.15, hydropathy: -3.5, category: 'polar', chargeAtPh74: 0 },
  G: { code1: 'G', code3: 'GLY', name: 'Glycine', mw: 75.07, hydropathy: -0.4, category: 'special', chargeAtPh74: 0 },
  H: { code1: 'H', code3: 'HIS', name: 'Histidine', mw: 155.16, pKa: 6.00, hydropathy: -3.2, category: 'basic', chargeAtPh74: 0.1 },
  I: { code1: 'I', code3: 'ILE', name: 'Isoleucine', mw: 131.18, hydropathy: 4.5, category: 'hydrophobic', chargeAtPh74: 0 },
  L: { code1: 'L', code3: 'LEU', name: 'Leucine', mw: 131.18, hydropathy: 3.8, category: 'hydrophobic', chargeAtPh74: 0 },
  K: { code1: 'K', code3: 'LYS', name: 'Lysine', mw: 146.19, pKa: 10.53, hydropathy: -3.9, category: 'basic', chargeAtPh74: 1.0 },
  M: { code1: 'M', code3: 'MET', name: 'Methionine', mw: 149.21, hydropathy: 1.9, category: 'hydrophobic', chargeAtPh74: 0 },
  F: { code1: 'F', code3: 'PHE', name: 'Phenylalanine', mw: 165.19, hydropathy: 2.8, category: 'hydrophobic', chargeAtPh74: 0 },
  P: { code1: 'P', code3: 'PRO', name: 'Proline', mw: 115.13, hydropathy: -1.6, category: 'special', chargeAtPh74: 0 },
  S: { code1: 'S', code3: 'SER', name: 'Serine', mw: 105.09, hydropathy: -0.8, category: 'polar', chargeAtPh74: 0 },
  T: { code1: 'T', code3: 'THR', name: 'Threonine', mw: 119.12, hydropathy: -0.7, category: 'polar', chargeAtPh74: 0 },
  W: { code1: 'W', code3: 'TRP', name: 'Tryptophan', mw: 204.23, hydropathy: -0.9, category: 'hydrophobic', chargeAtPh74: 0 },
  Y: { code1: 'Y', code3: 'TYR', name: 'Tyrosine', mw: 181.19, pKa: 10.07, hydropathy: -1.3, category: 'polar', chargeAtPh74: -0.05 },
  V: { code1: 'V', code3: 'VAL', name: 'Valine', mw: 117.15, hydropathy: 4.2, category: 'hydrophobic', chargeAtPh74: 0 },
};

// Clean and validate FASTA
export function parseFasta(rawInput: string): { name: string; sequence: string; isValid: boolean; error?: string } {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { name: 'Unknown', sequence: '', isValid: false, error: 'Sequence input is empty.' };
  }

  const lines = trimmed.split(/\r?\n/);
  let name = 'User Protein';
  const seqParts: string[] = [];

  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('>')) {
      name = l.substring(1).trim() || 'Custom FASTA Protein';
    } else if (l) {
      seqParts.push(l.toUpperCase().replace(/[\s\d\-*]/g, ''));
    }
  }

  const sequence = seqParts.join('');
  if (!sequence) {
    return { name, sequence: '', isValid: false, error: 'No amino acid characters found.' };
  }

  // Check invalid characters
  const invalidChars = sequence.split('').filter((c) => !AMINO_ACIDS[c]);
  if (invalidChars.length > 0) {
    const uniqueInvalids = Array.from(new Set(invalidChars)).slice(0, 5).join(', ');
    return {
      name,
      sequence,
      isValid: false,
      error: `Sequence contains invalid amino acid code(s): ${uniqueInvalids}. Expected standard 20 amino acids.`,
    };
  }

  return { name, sequence, isValid: true };
}

// Calculate physicochemical properties from sequence
export function calculatePhysicochemical(sequence: string) {
  const cleanSeq = sequence.toUpperCase().replace(/[^A-Z]/g, '');
  const length = cleanSeq.length;
  if (length === 0) {
    return {
      length: 0,
      molecularWeight: 0,
      isoelectricPoint: 7.0,
      netChargePh74: 0,
      extinctionCoeff: 0,
      hydrophobicRatio: 0,
      composition: {},
    };
  }

  const counts: Record<string, number> = {};
  for (const key of Object.keys(AMINO_ACIDS)) {
    counts[key] = 0;
  }

  let totalMw = 0;
  let hydrophobicCount = 0;

  for (let i = 0; i < length; i++) {
    const aa = cleanSeq[i];
    if (counts[aa] !== undefined) {
      counts[aa]++;
    }
    const info = AMINO_ACIDS[aa];
    if (info) {
      totalMw += info.mw;
      if (info.category === 'hydrophobic' || info.hydropathy > 0) {
        hydrophobicCount++;
      }
    }
  }

  // Peptide bond water condensation loss (N-1) * 18.01524
  const waterLoss = (length - 1) * 18.01524;
  const molecularWeightDa = totalMw - waterLoss;
  const molecularWeightKDa = Math.max(0, molecularWeightDa / 1000);

  // Extinction coefficient at 280 nm (M^-1 cm^-1) in water
  // e280 = Trp * 5500 + Tyr * 1490 + (Cys / 2) * 125
  const trpCount = counts['W'] || 0;
  const tyrCount = counts['Y'] || 0;
  const cysCount = counts['C'] || 0;
  const extinctionCoeff = trpCount * 5500 + tyrCount * 1490 + Math.floor(cysCount / 2) * 125;

  // Isoelectric point (pI) using bisection
  // N-terminal pKa = 9.69, C-terminal pKa = 2.34
  const pK_NTerm = 9.69;
  const pK_CTerm = 2.34;
  const pK_D = 3.86;
  const pK_E = 4.25;
  const pK_C = 8.33;
  const pK_Y = 10.07;
  const pK_H = 6.00;
  const pK_K = 10.53;
  const pK_R = 12.48;

  const computeCharge = (pH: number): number => {
    const qNTerm = 1 / (1 + Math.pow(10, pH - pK_NTerm));
    const qCTerm = -1 / (1 + Math.pow(10, pK_CTerm - pH));
    const qR = (counts['R'] || 0) / (1 + Math.pow(10, pH - pK_R));
    const qK = (counts['K'] || 0) / (1 + Math.pow(10, pH - pK_K));
    const qH = (counts['H'] || 0) / (1 + Math.pow(10, pH - pK_H));
    const qD = -(counts['D'] || 0) / (1 + Math.pow(10, pK_D - pH));
    const qE = -(counts['E'] || 0) / (1 + Math.pow(10, pK_E - pH));
    const qCys = -(counts['C'] || 0) / (1 + Math.pow(10, pK_C - pH));
    const qY = -(counts['Y'] || 0) / (1 + Math.pow(10, pK_Y - pH));
    return qNTerm + qCTerm + qR + qK + qH + qD + qE + qCys + qY;
  };

  // Bisection method to find pI (where net charge == 0)
  let low = 2.0;
  let high = 14.0;
  let pI = 7.0;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    const ch = computeCharge(mid);
    if (Math.abs(ch) < 0.0001) {
      pI = mid;
      break;
    }
    if (ch > 0) {
      low = mid;
    } else {
      high = mid;
    }
    pI = mid;
  }

  const netChargePh74 = computeCharge(7.4);
  const hydrophobicRatio = (hydrophobicCount / length) * 100;

  const composition: Record<string, { count: number; percentage: number }> = {};
  for (const aa of Object.keys(AMINO_ACIDS)) {
    const cnt = counts[aa] || 0;
    composition[aa] = {
      count: cnt,
      percentage: length > 0 ? (cnt / length) * 100 : 0,
    };
  }

  return {
    length,
    molecularWeight: molecularWeightKDa,
    isoelectricPoint: pI,
    netChargePh74,
    extinctionCoeff,
    hydrophobicRatio,
    composition,
  };
}

// Predict secondary structure percentage heuristics based on Chou-Fasman tendencies
export function estimateSecondaryStructure(sequence: string) {
  const clean = sequence.toUpperCase();
  const len = clean.length;
  if (len === 0) return { helixPct: 0, sheetPct: 0, coilPct: 100 };

  // Helix formers: E, A, L, M, Q, K, R, H
  const helixResidues = new Set(['E', 'A', 'L', 'M', 'Q', 'K', 'R', 'H']);
  // Sheet formers: V, I, Y, F, W, T, C
  const sheetResidues = new Set(['V', 'I', 'Y', 'F', 'W', 'T', 'C']);

  let helixCount = 0;
  let sheetCount = 0;

  for (let i = 0; i < len; i++) {
    const r = clean[i];
    if (helixResidues.has(r)) helixCount++;
    else if (sheetResidues.has(r)) sheetCount++;
  }

  const helixPct = Math.round((helixCount / len) * 75); // normalize to typical globular ratio
  const sheetPct = Math.round((sheetCount / len) * 55);
  const coilPct = Math.max(0, 100 - helixPct - sheetPct);

  return { helixPct, sheetPct, coilPct };
}

// Global Needleman-Wunsch Pairwise Alignment
export function performPairwiseAlignment(
  seq1: string,
  seq2: string,
  gapPenalty: number = -2
): AlignmentResult {
  const s1 = seq1.toUpperCase();
  const s2 = seq2.toUpperCase();
  const n = s1.length;
  const m = s2.length;

  if (n === 0 || m === 0) {
    return {
      seqA: s1,
      seqB: s2,
      alignedA: s1,
      alignedB: s2,
      matchLine: '',
      identityPct: 0,
      similarityPct: 0,
      score: 0,
      gaps: 0,
      length: 0,
    };
  }

  // Simple scoring: match +2, mismatch -1, conservative substitution +1
  const matchScore = 2;
  const mismatchScore = -1;
  const conservativeGroups = [
    new Set(['K', 'R', 'H']),
    new Set(['D', 'E']),
    new Set(['S', 'T', 'N', 'Q']),
    new Set(['A', 'V', 'L', 'I', 'M']),
    new Set(['F', 'Y', 'W']),
  ];

  const getSubScore = (a: string, b: string): number => {
    if (a === b) return matchScore;
    for (const group of conservativeGroups) {
      if (group.has(a) && group.has(b)) return 1;
    }
    return mismatchScore;
  };

  // DP Matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * gapPenalty;
  for (let j = 0; j <= m; j++) dp[0][j] = j * gapPenalty;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = dp[i - 1][j - 1] + getSubScore(s1[i - 1], s2[j - 1]);
      const deleteGap = dp[i - 1][j] + gapPenalty;
      const insertGap = dp[i][j - 1] + gapPenalty;
      dp[i][j] = Math.max(match, deleteGap, insertGap);
    }
  }

  // Traceback
  let i = n;
  let j = m;
  const alignA: string[] = [];
  const alignB: string[] = [];
  const matches: string[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + getSubScore(s1[i - 1], s2[j - 1])) {
      alignA.push(s1[i - 1]);
      alignB.push(s2[j - 1]);
      if (s1[i - 1] === s2[j - 1]) {
        matches.push('|');
      } else if (getSubScore(s1[i - 1], s2[j - 1]) > 0) {
        matches.push(':');
      } else {
        matches.push('.');
      }
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + gapPenalty) {
      alignA.push(s1[i - 1]);
      alignB.push('-');
      matches.push(' ');
      i--;
    } else {
      alignA.push('-');
      alignB.push(s2[j - 1]);
      matches.push(' ');
      j--;
    }
  }

  const alignedA = alignA.reverse().join('');
  const alignedB = alignB.reverse().join('');
  const matchLine = matches.reverse().join('');

  let identical = 0;
  let similar = 0;
  let gaps = 0;
  const totalLen = alignedA.length;

  for (let k = 0; k < totalLen; k++) {
    if (alignedA[k] === '-' || alignedB[k] === '-') {
      gaps++;
    } else if (alignedA[k] === alignedB[k]) {
      identical++;
      similar++;
    } else if (matchLine[k] === ':') {
      similar++;
    }
  }

  const identityPct = totalLen > 0 ? (identical / totalLen) * 100 : 0;
  const similarityPct = totalLen > 0 ? (similar / totalLen) * 100 : 0;

  return {
    seqA: s1,
    seqB: s2,
    alignedA,
    alignedB,
    matchLine,
    identityPct,
    similarityPct,
    score: dp[n][m],
    gaps,
    length: totalLen,
  };
}

// Point mutation simulator & biophysical impact predictor
export function simulateMutation(
  protein: ProteinData,
  mutationStr: string // e.g. "E6V" or "R248W"
): MutationSimulation | { error: string } {
  const match = mutationStr.trim().match(/^([A-Za-z])(\d+)([A-Za-z])$/);
  if (!match) {
    return {
      error: `Invalid mutation format "${mutationStr}". Expected format like E6V, R248W, or K48R.`,
    };
  }

  const origCode = match[1].toUpperCase();
  const pos = parseInt(match[2], 10);
  const mutCode = match[3].toUpperCase();

  const origInfo = AMINO_ACIDS[origCode];
  const mutInfo = AMINO_ACIDS[mutCode];

  if (!origInfo || !mutInfo) {
    return {
      error: `Unrecognized amino acid code in ${origCode} or ${mutCode}.`,
    };
  }

  // Sequence bounds checking
  if (pos < 1 || pos > protein.sequence.length) {
    return {
      error: `Position ${pos} is out of range for sequence length ${protein.sequence.length}.`,
    };
  }

  const actualResidue = protein.sequence[pos - 1];
  let note = '';
  if (actualResidue !== origCode) {
    note = ` (Note: sequence position ${pos} contains '${actualResidue}', modeled substitution from '${origCode}' to '${mutCode}')`;
  }

  const deltaCharge = mutInfo.chargeAtPh74 - origInfo.chargeAtPh74;
  const deltaHydropathy = mutInfo.hydropathy - origInfo.hydropathy;

  // Polarity shift
  let polarityShift = 'Neutral / Conserved';
  if (origInfo.category !== mutInfo.category) {
    polarityShift = `${origInfo.category} → ${mutInfo.category}`;
  }

  // Check if position is near or at active sites or domains
  const isDirectActiveSite = protein.activeSites.some((s) => s.residueIndex === pos);
  const activeSiteNearby = protein.activeSites.filter((s) => Math.abs(s.residueIndex - pos) <= 4);
  const inDomain = protein.domains.find((d) => pos >= d.start && pos <= d.end);

  // Compute Functional Impact Score (0 - 100)
  let impactScore = 15; // baseline

  // Radical chemical change
  if (origInfo.category !== mutInfo.category) impactScore += 25;
  if (Math.abs(deltaCharge) >= 1) impactScore += 25;
  if (Math.abs(deltaHydropathy) >= 3.0) impactScore += 20;

  // Proline / Glycine mutations disrupt secondary structure
  if ((origCode === 'P' || mutCode === 'P') && origCode !== mutCode) impactScore += 20;
  if ((origCode === 'G' || mutCode === 'G') && origCode !== mutCode) impactScore += 15;

  // Critical sites
  if (isDirectActiveSite) impactScore += 40;
  else if (activeSiteNearby.length > 0) impactScore += 20;
  if (inDomain) impactScore += 10;

  impactScore = Math.min(100, Math.max(5, impactScore));

  // Stability prediction
  let predictedStability: MutationSimulation['predictedStability'] = 'Neutral';
  if (impactScore > 75) {
    predictedStability = 'Highly Destabilizing';
  } else if (impactScore > 45) {
    predictedStability = 'Destabilizing';
  } else if (deltaHydropathy > 0 && Math.abs(deltaCharge) === 0 && impactScore < 30) {
    predictedStability = 'Stabilizing';
  }

  // Pathogenicity classification
  let pathogenicityClassification: MutationSimulation['pathogenicityClassification'] = 'Benign';
  if (impactScore >= 80) pathogenicityClassification = 'Pathogenic';
  else if (impactScore >= 60) pathogenicityClassification = 'Likely Pathogenic';
  else if (impactScore >= 40) pathogenicityClassification = 'Variant of Uncertain Significance';
  else if (impactScore >= 20) pathogenicityClassification = 'Likely Benign';

  // Special landmark clinical mutations
  let clinVarAssociation: string | undefined = undefined;
  if (protein.gene === 'HBB' && ((pos === 6 && origCode === 'E' && mutCode === 'V') || (pos === 7 && origCode === 'E' && mutCode === 'V'))) {
    pathogenicityClassification = 'Pathogenic';
    predictedStability = 'Destabilizing';
    impactScore = 95;
    clinVarAssociation = 'Sickle Cell Anemia (HbS) - Pathogenic [ClinVar: VCV000015112]';
  } else if (protein.gene === 'TP53' && pos === 248 && origCode === 'R') {
    pathogenicityClassification = 'Pathogenic';
    predictedStability = 'Highly Destabilizing';
    impactScore = 98;
    clinVarAssociation = 'Li-Fraumeni Syndrome / Neoplasm Susceptibility [ClinVar: VCV000012359]';
  } else if (protein.id.includes('6M0J') || protein.name.includes('Spike')) {
    if (pos === 501 && origCode === 'N' && mutCode === 'Y') {
      pathogenicityClassification = 'Pathogenic';
      predictedStability = 'Stabilizing';
      impactScore = 88;
      clinVarAssociation = 'SARS-CoV-2 Alpha/Beta/Omicron Variant of Concern - Enhanced ACE2 binding';
    }
  }

  // Structural mechanism explanation
  let mechanism = `Substitution of ${origInfo.name} (${origCode}) with ${mutInfo.name} (${mutCode}) at position ${pos}.`;
  if (Math.abs(deltaCharge) >= 1) {
    mechanism += ` Introduces a net charge alteration of ${deltaCharge > 0 ? '+' : ''}${deltaCharge.toFixed(1)} e, potentially disrupting electrostatic salt bridges and surface electrostatic potential.`;
  }
  if (deltaHydropathy > 2.5) {
    mechanism += ` Marked increase in local hydrophobicity (+${deltaHydropathy.toFixed(1)}), which can promote hydrophobic collapse, aggregation, or steric crowding.`;
  } else if (deltaHydropathy < -2.5) {
    mechanism += ` Significant loss of hydrophobic character (${deltaHydropathy.toFixed(1)}), risking core cavity destabilization if buried.`;
  }
  if (isDirectActiveSite) {
    mechanism += ` Directly modifies an annotated functional active/catalytic site, resulting in probable catalytic ablation.`;
  } else if (activeSiteNearby.length > 0) {
    mechanism += ` Positioned adjacent to catalytic residues (${activeSiteNearby.map((s) => `${s.residueName}${s.residueIndex}`).join(', ')}), likely perturbing binding pocket conformation.`;
  }
  if (note) {
    mechanism += note;
  }

  const structuralRiskResidues = activeSiteNearby.map((s) => `${s.residueName}${s.residueIndex}`);

  return {
    id: `${origCode}${pos}${mutCode}-${Date.now()}`,
    originalResidue: origCode,
    position: pos,
    mutatedResidue: mutCode,
    deltaCharge,
    deltaHydropathy,
    polarityShift,
    predictedStability,
    functionalImpactScore: impactScore,
    pathogenicityClassification,
    mechanismExplanation: mechanism,
    structuralRiskResidues,
    clinVarAssociation,
  };
}
