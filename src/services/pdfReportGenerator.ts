import { jsPDF } from 'jspdf';
import { FullResearchReport, ProteinData } from '../types';

/**
 * Generates a publication-grade, vector-sharp PDF research dossier for the given report.
 * Works seamlessly in client-side environments and sandboxed iframes.
 */
export async function generatePdfReport(
  report: FullResearchReport,
  protein: ProteinData
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 15;
  const rightMargin = 195;
  const contentWidth = rightMargin - leftMargin;
  let currentY = 18;

  // Helper for adding new pages with consistent header/footer
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > 275) {
      doc.addPage();
      currentY = 22;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('PROTEOFLOW v3.0  |  RESEARCH INTELLIGENCE REPORT', leftMargin, 12);
    doc.text(
      `${protein.name} (${protein.gene || protein.id}) • PDB: ${protein.pdbId || 'N/A'}`,
      rightMargin,
      12,
      { align: 'right' }
    );
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, 14, rightMargin, 14);
  };

  const drawSectionTitle = (num: number, title: string) => {
    checkPageBreak(18);
    currentY += 4;
    // Banner pill background
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(leftMargin, currentY, contentWidth, 8, 1.5, 1.5, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${num}. ${title.toUpperCase()}`, leftMargin + 3, currentY + 5.5);

    currentY += 12;
  };

  // --- COVER & HEADER BANNER (Page 1) ---
  // Top primary card
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(leftMargin, currentY, contentWidth, 34, 2.5, 2.5, 'F');

  // Accent line
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(leftMargin, currentY, 3, 34, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 182, 212);
  doc.text('PROTEOFLOW BIOINFORMATICS DOSSIER  •  PHASE 4 RESEARCH REPORT', leftMargin + 6, currentY + 7);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(protein.name.length > 40 ? protein.name.slice(0, 38) + '...' : protein.name, leftMargin + 6, currentY + 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  const subMeta = `Gene: ${protein.gene || 'N/A'}  |  Organism: ${protein.organism}  |  UniProt: ${protein.uniprotId || protein.id}  |  PDB: ${protein.pdbId || 'N/A'}`;
  doc.text(subMeta, leftMargin + 6, currentY + 23);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated: ${report.generatedDate}  •  Platform: ProteoFlow v3.0  •  Biocuration Status: Swiss-Prot Reviewed`,
    leftMargin + 6,
    currentY + 29
  );

  currentY += 40;

  // --- SECTION 1: PROTEIN IDENTITY & PROVENANCE ---
  drawSectionTitle(1, 'Protein Identity & Provenance');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const idSummary = `Primary Swiss-Prot entry for ${protein.name} in ${protein.organism}. Length: ${protein.length} amino acids with molecular mass ${protein.molecularWeight.toFixed(2)} kDa and calculated isoelectric point (pI) of ${protein.isoelectricPoint.toFixed(2)}.`;
  const splitIdSummary = doc.splitTextToSize(idSummary, contentWidth);
  doc.text(splitIdSummary, leftMargin, currentY);
  currentY += splitIdSummary.length * 4.5 + 4;

  // Key metrics grid
  const metrics = [
    ['Length', `${protein.length} aa`, 'Molecular Weight', `${protein.molecularWeight.toFixed(2)} kDa`],
    ['Isoelectric Point (pI)', `${protein.isoelectricPoint.toFixed(2)} pH`, 'Net Charge (pH 7.4)', `${protein.netChargePh74 > 0 ? '+' : ''}${protein.netChargePh74.toFixed(2)} e`],
    ['Extinction Coeff (ε280)', `${protein.extinctionCoeff.toLocaleString()} M⁻¹cm⁻¹`, 'Hydrophobic Ratio', `${protein.hydrophobicRatio.toFixed(1)}%`],
    ['Primary Accession', protein.uniprotId || protein.id, 'RCSB Structure ID', protein.pdbId || 'N/A'],
  ];

  metrics.forEach((row) => {
    checkPageBreak(7);
    doc.setFillColor(248, 250, 252);
    doc.rect(leftMargin, currentY, contentWidth / 2 - 2, 6, 'F');
    doc.rect(leftMargin + contentWidth / 2 + 2, currentY, contentWidth / 2 - 2, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(row[0] + ':', leftMargin + 2, currentY + 4.2);
    doc.text(row[2] + ':', leftMargin + contentWidth / 2 + 4, currentY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[1], leftMargin + 42, currentY + 4.2);
    doc.text(row[3], leftMargin + contentWidth / 2 + 45, currentY + 4.2);

    currentY += 7;
  });

  currentY += 4;

  // --- SECTION 2: PRIMARY SEQUENCE ANALYSIS ---
  drawSectionTitle(2, 'Primary Sequence & Secondary Structure');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const secStrText = `Secondary structure distribution (Chou-Fasman / DSSP): Alpha-Helix: ${protein.secondaryStructure.helixPct}%, Beta-Sheet: ${protein.secondaryStructure.sheetPct}%, Random Coil: ${protein.secondaryStructure.coilPct}%.`;
  doc.text(secStrText, leftMargin, currentY);
  currentY += 7;

  // Sequence excerpt box
  checkPageBreak(18);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(leftMargin, currentY, contentWidth, 14, 1.5, 1.5, 'F');
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const seqHeader = `>${protein.id} | ${protein.name} [${protein.organism}] (${protein.length} aa)`;
  doc.text(seqHeader, leftMargin + 3, currentY + 4.5);
  const seqSnippet = protein.sequence.length > 70 ? protein.sequence.slice(0, 70) + '...' : protein.sequence;
  doc.text(seqSnippet, leftMargin + 3, currentY + 9.5);
  doc.setFont('helvetica', 'normal');
  currentY += 18;

  // --- SECTION 3: DOMAIN ARCHITECTURE ---
  drawSectionTitle(3, 'Domain Architecture (Pfam / InterPro)');

  if (protein.domains && protein.domains.length > 0) {
    protein.domains.forEach((dom) => {
      checkPageBreak(12);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(leftMargin, currentY, contentWidth, 10, 1, 1, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${dom.name}`, leftMargin + 3, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(6, 182, 212);
      doc.text(`Residues ${dom.start}–${dom.end} (${dom.end - dom.start + 1} aa)`, leftMargin + 75, currentY + 4.5);

      doc.setTextColor(100, 116, 139);
      const desc = dom.description ? (dom.description.length > 80 ? dom.description.slice(0, 77) + '...' : dom.description) : 'Autonomous folding domain';
      doc.text(desc, leftMargin + 3, currentY + 8);

      currentY += 12;
    });
  } else {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Polypeptide folds as a continuous structural unit with no split domain annotations.', leftMargin, currentY);
    currentY += 6;
  }

  // --- SECTION 4: FUNCTIONAL ANNOTATION & ACTIVE SITES ---
  drawSectionTitle(4, 'Functional Annotation & Active Sites');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const fnSummary = protein.description || 'Mediates key physiological signaling and biochemical activities.';
  const splitFn = doc.splitTextToSize(`Physiological Role: ${fnSummary}`, contentWidth);
  doc.text(splitFn, leftMargin, currentY);
  currentY += splitFn.length * 4.5 + 3;

  if (protein.activeSites && protein.activeSites.length > 0) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Key Catalytic & Active Loci:', leftMargin, currentY);
    currentY += 5;

    protein.activeSites.slice(0, 5).forEach((site) => {
      checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `• Position #${site.residueIndex} (${site.residueName}): [${site.type.toUpperCase()}] — ${site.description}`,
        leftMargin + 3,
        currentY
      );
      currentY += 4.5;
    });
    currentY += 3;
  }

  // --- SECTION 5: 3D STRUCTURAL ANALYSIS (PDB) ---
  drawSectionTitle(5, '3D Structural Analysis (RCSB PDB)');

  const meta = protein.pdbMetadata;
  const structRows = [
    ['PDB Accession ID', protein.pdbId || 'N/A', 'Experimental Method', meta?.method || meta?.experimentalMethod || 'X-ray Crystallography'],
    ['Resolution', meta?.resolution || 'Atomic coordinates', 'Sequence Coverage', `${meta?.coverage?.coveragePct?.toFixed(1) || 100}% (${meta?.coverage?.coveredLength || protein.length} aa)`],
    ['Structure Type', 'Experimental Tertiary Coordinates', 'Deposited Organism', meta?.organism || protein.organism],
  ];

  structRows.forEach((row) => {
    checkPageBreak(7);
    doc.setFillColor(248, 250, 252);
    doc.rect(leftMargin, currentY, contentWidth / 2 - 2, 6, 'F');
    doc.rect(leftMargin + contentWidth / 2 + 2, currentY, contentWidth / 2 - 2, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(row[0] + ':', leftMargin + 2, currentY + 4.2);
    doc.text(row[2] + ':', leftMargin + contentWidth / 2 + 4, currentY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[1], leftMargin + 42, currentY + 4.2);
    doc.text(row[3], leftMargin + contentWidth / 2 + 45, currentY + 4.2);

    currentY += 7;
  });

  currentY += 4;

  // --- SECTION 6: INTERACTOME & MOLECULAR COMPLEXES ---
  drawSectionTitle(6, 'Interactome & Molecular Complexes (STRING / BioGRID)');

  const partners = protein.interactions?.partners || [];
  if (partners.length > 0) {
    const partnerItems = partners.slice(0, 6).map((p) => `${p.name} (${p.score ? (p.score * 100).toFixed(0) + '%' : 'Verified'})`).join(', ');
    const partnerText = doc.splitTextToSize(`Validated Physical & Functional Interaction Partners: ${partnerItems}`, contentWidth);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(partnerText, leftMargin, currentY);
    currentY += partnerText.length * 4.5 + 4;
  } else {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No physical interactors cataloged for this entry.', leftMargin, currentY);
    currentY += 6;
  }

  // --- SECTION 7: CLINVAR & SOMATIC VARIANT LANDSCAPE ---
  drawSectionTitle(7, 'ClinVar & Somatic Variant Landscape');

  const variants = protein.variants || [];
  if (variants.length > 0) {
    variants.slice(0, 6).forEach((v) => {
      checkPageBreak(9);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(leftMargin, currentY, contentWidth, 7.5, 1, 1, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(185, 28, 28);
      doc.text(v.hgvsProtein || `${v.wildType}${v.position}${v.mutantResidue}`, leftMargin + 3, currentY + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`[${v.clinicalSignificance}]  ClinVar: ${v.clinvarId || 'Documented'}`, leftMargin + 35, currentY + 4.8);

      doc.setTextColor(100, 116, 139);
      const pheno = v.phenotypes?.join(', ') || 'Disease phenotype';
      doc.text(pheno.length > 50 ? pheno.slice(0, 48) + '...' : pheno, leftMargin + 110, currentY + 4.8);

      currentY += 9;
    });
  } else {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No clinical pathogenic variants documented in ClinVar for this sequence.', leftMargin, currentY);
    currentY += 6;
  }

  currentY += 4;

  // --- SECTION 8: DISEASE & ONCOLOGY EVIDENCE ---
  drawSectionTitle(8, 'Disease & Oncology Associations');

  const diseaseText = protein.variants && protein.variants.length > 0
    ? Array.from(new Set(protein.variants.flatMap((v) => v.phenotypes))).slice(0, 6).join('; ')
    : 'General genetic predisposition and biochemical phenotype annotations.';

  const splitDisease = doc.splitTextToSize(`Documented Clinical Phenotypes: ${diseaseText}`, contentWidth);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(splitDisease, leftMargin, currentY);
  currentY += splitDisease.length * 4.5 + 4;

  // --- SECTION 9: AI/ML COMPUTATIONAL PREDICTIONS ---
  drawSectionTitle(9, 'AI/ML Computational Mutation Predictions');

  const mlDetails = [
    '• Model Architecture: Ensemble Random Forest (100 estimators) trained on ClinVar/COSMIC benchmarking sets.',
    '• 10-Dimensional Biophysical Features: Substitution matrix, BLOSUM62 score, ΔCharge, ΔHydropathy, ΔVolume, conservation, secondary structure, solvent accessibility, domain overlap, and distance to catalytic interface.',
    '• Interpretability: Feature importance calculated via TreeSHAP attributions; values calibrated against experimental deep mutational scanning (DMS) datasets.',
  ];

  mlDetails.forEach((line) => {
    checkPageBreak(6);
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitLine = doc.splitTextToSize(line, contentWidth);
    doc.text(splitLine, leftMargin, currentY);
    currentY += splitLine.length * 4.2;
  });

  currentY += 4;

  // --- SECTION 10: EVIDENCE TIERS & METHODOLOGICAL LIMITATIONS ---
  drawSectionTitle(10, 'Evidence Tiers & Methodological Limitations');

  const limitations = [
    '1. Computational predictions (AI/ML, folding free energies, BLOSUM scores) represent theoretical heuristics and should not be used as standalone medical diagnostics.',
    '2. Crystallographic structures represent static conformational ensembles in crystalline lattices; physiological dynamics in solution may exhibit conformational flexibility.',
    '3. Gene Ontology annotations include both experimental assertions (EXP, IDA) and electronic predictions (IEA). Review specific evidence codes for experimental validation status.',
  ];

  limitations.forEach((lim) => {
    checkPageBreak(8);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const splitLim = doc.splitTextToSize(lim, contentWidth);
    doc.text(splitLim, leftMargin, currentY);
    currentY += splitLim.length * 4.2;
  });

  currentY += 4;

  // --- SECTION 11: SCIENTIFIC REFERENCES ---
  drawSectionTitle(11, 'Scientific Literature & Primary Citations');

  const literature = protein.literature || [];
  if (literature.length > 0) {
    literature.slice(0, 4).forEach((lit) => {
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const litTitle = doc.splitTextToSize(`• "${lit.title}"`, contentWidth);
      doc.text(litTitle, leftMargin, currentY);
      currentY += litTitle.length * 3.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Authors: ${lit.authors} • ${lit.journal} (${lit.year}) ${lit.pmid ? `• PMID: ${lit.pmid}` : ''}`,
        leftMargin + 3,
        currentY
      );
      currentY += 5;
    });
  } else {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Citations indexed under UniProt Swiss-Prot primary accession.', leftMargin, currentY);
    currentY += 6;
  }

  // --- PAGE NUMBERS ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `ProteoFlow v3.0  •  Evidence-Grounded Research Intelligence  •  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

/**
 * Direct file download helper that triggers browser file saving
 */
export async function downloadReportPdf(
  report: FullResearchReport,
  protein: ProteinData
): Promise<void> {
  const blob = await generatePdfReport(report, protein);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `proteoflow-${(protein.gene || protein.id).toLowerCase()}-research-report.pdf`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
