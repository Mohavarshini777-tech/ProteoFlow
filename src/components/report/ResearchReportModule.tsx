import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Dna,
  Database,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Atom,
  Binary,
  Layers,
  Flame,
  Cpu,
  Share2,
  Calendar,
  Building,
  Sparkles,
} from 'lucide-react';
import { ProteinData, FullResearchReport } from '../../types';
import { buildFullResearchReport } from '../../services/evidenceRetrieverService';
import { downloadReportPdf } from '../../services/pdfReportGenerator';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface ResearchReportModuleProps {
  protein: ProteinData;
  onNavigateToCopilot?: () => void;
  onNavigateToStructure?: () => void;
}

export const ResearchReportModule: React.FC<ResearchReportModuleProps> = ({
  protein,
  onNavigateToCopilot,
  onNavigateToStructure,
}) => {
  const report: FullResearchReport = useMemo(() => buildFullResearchReport(protein), [protein]);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'dossier' | 'json'>('dossier');

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadReportPdf(report, protein);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = async () => {
    try {
      // Attempt native browser print dialog
      window.print();
    } catch (err) {
      // In sandboxed iframes, window.print() can throw DOMException.
      // Automatically fallback to downloading the PDF.
      console.warn('window.print() restricted in sandbox, falling back to direct PDF download', err);
      await handleDownloadPdf();
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `proteoflow-${(protein.gene || protein.id).toLowerCase()}-research-report.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const sectionKeys = Object.keys(report.sections) as (keyof typeof report.sections)[];

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar (Hidden during print) */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-5 sm:p-6 shadow-xl print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-medium text-cyan-300">
              <FileText className="h-3.5 w-3.5" />
              <span>Phase 4: Research Dossier Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Comprehensive Protein Research Report
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              11 structured scientific chapters linking primary sequence metrics, tertiary coordinates, interactome, ClinVar variants, and AI/ML predictions with source citations.
            </p>
          </div>

          {/* Export Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('dossier')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all cursor-pointer ${
                  activeTab === 'dossier'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Research Dossier
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw JSON Schema
              </button>
            </div>

            {/* Direct Vector PDF Export Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:from-cyan-500 hover:to-emerald-500 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
              title="Generate and download publication-grade PDF file"
            >
              {pdfSuccess ? (
                <>
                  <Check className="h-4 w-4 text-emerald-200" />
                  <span>PDF Downloaded!</span>
                </>
              ) : isExportingPdf ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export PDF</span>
                </>
              )}
            </button>

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
              title="Open browser print dialog or save via print"
            >
              <Printer className="h-4 w-4 text-slate-400" />
              <span>Print</span>
            </button>

            {/* JSON Download Button */}
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 active:scale-95 transition-colors cursor-pointer"
              title="Download structured JSON report"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      {activeTab === 'json' ? (
        /* JSON View */
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-slate-400">
              Schema: ProteoFlow-v3.0-ResearchReport.json
            </span>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="max-h-[650px] overflow-y-auto text-[11px] font-mono text-cyan-300/90 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      ) : (
        /* Publication Dossier Document (Optimized for both screen and print) */
        <div
          id="printable-research-report"
          className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 sm:p-10 shadow-2xl space-y-8 print:p-0 print:border-none print:bg-white print:text-black print:shadow-none"
        >
          {/* Document Header & Branding */}
          <div className="border-b-2 border-slate-800 pb-6 print:border-black">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-400 print:text-black print:border-black">
                  <Dna className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white print:text-black">
                    Proteo<span className="text-cyan-400 print:text-black">Flow</span> Comprehensive Research Report
                  </h1>
                  <p className="text-xs text-slate-400 print:text-gray-600 font-mono">
                    Report ID: {report.id} • Generated: {report.generatedDate}
                  </p>
                </div>
              </div>

              {/* Badges / Metadata */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs font-mono">
                <span className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1 text-cyan-400 print:border-gray-400 print:text-black">
                  v3.0 Phase 4
                </span>
                <span className="rounded-lg bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 text-emerald-300 print:border-gray-400 print:text-black">
                  Evidence-Grounded
                </span>
              </div>
            </div>

            {/* Protein Summary Callout */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 rounded-xl bg-slate-950/80 p-4 border border-slate-800/80 print:bg-gray-50 print:border-gray-300 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 uppercase font-mono block">Target Molecule</span>
                <strong className="text-white print:text-black font-bold text-sm truncate block">{report.protein.name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 uppercase font-mono block">Gene Symbol</span>
                <span className="font-mono font-bold text-cyan-400 print:text-black">{report.protein.gene}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 uppercase font-mono block">UniProtKB</span>
                <span className="font-mono text-slate-200 print:text-black">{report.protein.uniprotId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 uppercase font-mono block">PDB Structure</span>
                <span className="font-mono text-emerald-400 print:text-black">{report.protein.pdbId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 uppercase font-mono block">Molecular Mass</span>
                <span className="font-mono text-slate-200 print:text-black">{report.protein.molecularWeight.toFixed(2)} kDa</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 uppercase font-mono block">Theoretical pI</span>
                <span className="font-mono text-slate-200 print:text-black">{report.protein.isoelectricPoint.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 11 Chapters Container */}
          <div className="space-y-8">
            {sectionKeys.map((secKey) => {
              const sec = report.sections[secKey];
              return (
                <section
                  key={secKey}
                  className="rounded-xl border border-slate-800/90 bg-slate-950/50 p-5 space-y-4 print:border-gray-300 print:bg-transparent print:p-2 print:page-break-inside-avoid"
                >
                  {/* Chapter Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5 print:border-gray-400">
                    <h2 className="text-sm sm:text-base font-bold text-white print:text-black flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400 text-xs font-bold print:bg-gray-200 print:text-black">
                        {sec.sectionNumber}
                      </span>
                      <span>{sec.title}</span>
                    </h2>
                    <span className="text-[11px] text-slate-400 print:text-gray-600 italic">
                      {sec.evidenceSources.length} cited source records
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed font-sans">
                    {sec.summary}
                  </p>

                  {/* Data Points Grid / Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(sec.dataPoints).map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800/80 print:border-gray-200 print:bg-gray-50 flex flex-col justify-between"
                      >
                        <span className="text-[10px] text-slate-400 print:text-gray-600 font-mono uppercase">{k}</span>
                        <span className="text-white print:text-black font-semibold mt-0.5 break-words">
                          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Evidence Citations */}
                  {sec.evidenceSources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5">
                      <span className="text-slate-500 print:text-gray-600 font-mono text-[10px] uppercase block">
                        Verified Primary Evidence Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {sec.evidenceSources.slice(0, 5).map((ev) => (
                          <ProvenanceBadge
                            key={ev.id}
                            type={ev.evidenceType}
                            source={ev.source}
                            id={ev.accession}
                            url={ev.url}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Limitations Note */}
                  {sec.limitations && sec.limitations.length > 0 && (
                    <div className="text-[10px] text-slate-500 print:text-gray-500 italic">
                      <span className="font-semibold text-slate-400 print:text-gray-700">Caveat / Boundary: </span>
                      {sec.limitations.join(' ')}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Provenance Audit Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3 print:border-gray-300 print:bg-transparent">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-black flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400 print:text-black" />
              <span>Multi-Database Retrieval Provenance Table</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 print:text-black print:border-black">
                  <tr>
                    <th className="py-2 px-3">Database</th>
                    <th className="py-2 px-3">Accession</th>
                    <th className="py-2 px-3">Evidence Tier</th>
                    <th className="py-2 px-3">Retrieved Date</th>
                    <th className="py-2 px-3">Live Citation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-200 text-[11px]">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-black">UniProtKB</td>
                    <td className="py-2 px-3 font-mono text-cyan-400 print:text-black">{report.protein.uniprotId}</td>
                    <td className="py-2 px-3">
                      <ProvenanceBadge type="database" />
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400 print:text-gray-600">{report.retrievalDates['UniProt']}</td>
                    <td className="py-2 px-3">
                      <a
                        href={`https://www.uniprot.org/uniprotkb/${report.protein.uniprotId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline print:text-black"
                      >
                        uniprot.org/{report.protein.uniprotId}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-black">RCSB PDB</td>
                    <td className="py-2 px-3 font-mono text-emerald-400 print:text-black">{report.protein.pdbId}</td>
                    <td className="py-2 px-3">
                      <ProvenanceBadge type="experimental" />
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400 print:text-gray-600">{report.retrievalDates['RCSB PDB']}</td>
                    <td className="py-2 px-3">
                      <a
                        href={`https://www.rcsb.org/structure/${report.protein.pdbId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline print:text-black"
                      >
                        rcsb.org/{report.protein.pdbId}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-black">ClinVar</td>
                    <td className="py-2 px-3 font-mono text-rose-400 print:text-black">{report.protein.gene}</td>
                    <td className="py-2 px-3">
                      <ProvenanceBadge type="database" />
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400 print:text-gray-600">{report.retrievalDates['ClinVar']}</td>
                    <td className="py-2 px-3">
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/clinvar/?term=${report.protein.gene}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline print:text-black"
                      >
                        ncbi.nlm.nih.gov/clinvar
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-black">STRING</td>
                    <td className="py-2 px-3 font-mono text-amber-400 print:text-black">{report.protein.gene}</td>
                    <td className="py-2 px-3">
                      <ProvenanceBadge type="experimental" />
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400 print:text-gray-600">{report.retrievalDates['STRING / BioGRID']}</td>
                    <td className="py-2 px-3">
                      <a
                        href={`https://string-db.org/network/${report.protein.gene}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline print:text-black"
                      >
                        string-db.org/{report.protein.gene}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white print:text-black">ProteoFlow ML</td>
                    <td className="py-2 px-3 font-mono text-purple-400 print:text-black">Random Forest / SVM</td>
                    <td className="py-2 px-3">
                      <ProvenanceBadge type="computational" />
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400 print:text-gray-600">{report.retrievalDates['ProteoFlow In Silico']}</td>
                    <td className="py-2 px-3 font-mono text-slate-400 print:text-gray-600">In Silico Pipeline</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Regulatory & Research Disclaimer */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 text-[11px] text-slate-400 print:text-gray-600 leading-relaxed space-y-1.5 print:border-gray-400">
            <div className="flex items-center gap-2 font-bold text-amber-400 print:text-black uppercase tracking-wider text-[10px]">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Scientific Disclaimer & Regulatory Notice</span>
            </div>
            <p>{report.disclaimer}</p>
            <p className="text-[10px] text-slate-500 print:text-gray-500">
              Generated via ProteoFlow v3.0 Research Intelligence System • End of Document.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
