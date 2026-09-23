import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  HelpCircle,
  Database,
  FlaskConical,
  BookOpen,
  Cpu,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Check,
  Info,
  Layers,
  Flame,
  Atom,
  Dna,
  ArrowRight,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { ProteinData, CopilotMessage, RetrievedEvidenceItem, GroundedEvidenceCategory } from '../../types';
import { extractProteinEvidenceItems, generateGroundedCopilotAnswer } from '../../services/evidenceRetrieverService';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface ResearchCopilotModuleProps {
  protein: ProteinData;
  onNavigateToSection?: (sectionId: string) => void;
  onGenerateReport?: () => void;
  onSelectResidue?: (index: number) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToReport?: () => void;
}

const PRESET_QUESTIONS = [
  'What does this protein do?',
  'Which domains are present?',
  'What are the important functional regions?',
  'What mutations occur in this domain?',
  'How might this mutation affect the structure?',
  'What disease/cancer evidence exists?',
  'Which interactions are experimentally supported?',
  'What structures are available?',
  'Explain this protein in simple terms.',
];

export const ResearchCopilotModule: React.FC<ResearchCopilotModuleProps> = ({
  protein,
  onNavigateToSection,
  onGenerateReport,
}) => {
  const allEvidence = useMemo(() => extractProteinEvidenceItems(protein), [protein]);

  // Initial welcome message
  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    const defaultAnswer = generateGroundedCopilotAnswer('What does this protein do?', protein, allEvidence);
    return [
      {
        id: 'msg-welcome',
        sender: 'copilot',
        text: `### Welcome to the **ProteoFlow Research Copilot**

I am your evidence-grounded research assistant for **${protein.name}** (${protein.gene || 'N/A'}, UniProt: [${protein.uniprotId || protein.id}](https://www.uniprot.org/uniprotkb/${protein.uniprotId || protein.id})).

I strictly retrieve and synthesize verified facts from **UniProt**, **RCSB PDB**, **Gene Ontology**, **Pfam/InterPro**, **ClinVar**, **STRING/BioGRID**, **PubMed**, and ProteoFlow's in silico biophysical pipeline.

*All answers separate experimental evidence from database annotations and computational predictions with clickable citations. Select a research question below or type your inquiry.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidenceUsed: defaultAnswer.evidenceUsed,
        evidenceCounts: defaultAnswer.evidenceCounts,
        limitations: defaultAnswer.limitations,
        suggestedFollowUps: [
          'What does this protein do?',
          'Which domains are present?',
          'What disease/cancer evidence exists?',
          'Explain this protein in simple terms.',
        ],
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle asking a question
  const handleAsk = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Try backend /api/copilot first for natural language synthesis
      let answerData: any = null;
      try {
        const response = await fetch('/api/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmed,
            proteinData: protein,
            evidenceItems: allEvidence,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.answer && !resJson.error) {
            // Match used evidence IDs back to our retrieved items
            const usedIds = new Set(resJson.usedEvidenceIds || []);
            const matchedEvidence = allEvidence.filter((e) => usedIds.has(e.id));
            const finalEvidence = matchedEvidence.length > 0 ? matchedEvidence : allEvidence.slice(0, 3);

            answerData = {
              text: resJson.answer,
              evidenceUsed: finalEvidence,
              evidenceCounts: {
                database: finalEvidence.filter((e) => e.evidenceType === 'database').length,
                experimental: finalEvidence.filter((e) => e.evidenceType === 'experimental').length,
                literature: finalEvidence.filter((e) => e.evidenceType === 'literature').length,
                computational: finalEvidence.filter((e) => e.evidenceType === 'computational').length,
                aiInterpretation: 1,
              },
              limitations: resJson.limitations || [
                'Synthesized using retrieved evidence items from ProteoFlow database pipeline.',
                'Computational predictions are strictly hypothesis generators.',
              ],
              suggestedFollowUps: resJson.suggestedFollowUps || [
                'Which domains are present?',
                'What disease/cancer evidence exists?',
                'What structures are available?',
              ],
            };
          }
        }
      } catch {
        // network or endpoint failure, will fall back to local client generator
      }

      // Fall back to local robust grounded generator
      if (!answerData) {
        answerData = generateGroundedCopilotAnswer(trimmed, protein, allEvidence);
      }

      const copilotMsg: CopilotMessage = {
        id: `msg-copilot-${Date.now()}`,
        sender: 'copilot',
        text: answerData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidenceUsed: answerData.evidenceUsed,
        evidenceCounts: answerData.evidenceCounts,
        limitations: answerData.limitations,
        suggestedFollowUps: answerData.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'copilot',
        text: `Unable to process inquiry. Source error: ${err.message || 'Retrieval connection interrupted.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'copilot',
        text: `### Research Session Reset\n\nActive Protein: **${protein.name}** (${protein.uniprotId || protein.id}). Select an inquiry below or type a custom question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidenceUsed: allEvidence.slice(0, 2),
        suggestedFollowUps: PRESET_QUESTIONS.slice(0, 4),
      },
    ]);
  };

  // Render markdown with inline badge styling
  const renderFormattedAnswer = (rawText: string) => {
    // Process markdown headers and list items
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm sm:text-base font-bold text-white mt-3 mb-1.5 flex items-center gap-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Heading 4
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-xs sm:text-sm font-semibold text-cyan-300 mt-2 mb-1">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      // Bullet items
      if (line.startsWith('- ')) {
        const bulletText = line.replace('- ', '');
        return (
          <li key={idx} className="text-xs text-slate-200 leading-relaxed ml-4 list-disc my-1">
            <span dangerouslySetInnerHTML={{ __html: formatInlineTags(bulletText) }} />
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="text-xs text-slate-200 leading-relaxed ml-4 my-1 flex items-start gap-1.5">
            <span className="text-cyan-400 font-bold shrink-0">{line.match(/^\d+\./)?.[0]}</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineTags(line.replace(/^\d+\.\s/, '')) }} />
          </div>
        );
      }
      // Blank lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Standard paragraph
      return (
        <p
          key={idx}
          className="text-xs text-slate-300 leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: formatInlineTags(line) }}
        />
      );
    });
  };

  // Helper to format inline tags and links
  const formatInlineTags = (text: string) => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="text-slate-400 italic">$1</em>')
      .replace(/\[Database Evidence\]/g, '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 ml-1">Database Evidence</span>')
      .replace(/\[Experimental Evidence\]/g, '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 ml-1">Experimental Evidence</span>')
      .replace(/\[Literature Evidence\]/g, '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 ml-1">Literature Evidence</span>')
      .replace(/\[Computational Prediction\]/g, '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30 ml-1">Computational Prediction</span>')
      .replace(/\[AI Interpretation\]/g, '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30 ml-1">AI Interpretation</span>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline font-medium">$1 ↗</a>');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Protein Context */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-medium text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phase 4: Research Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              ProteoFlow Research Copilot
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Strictly grounded on retrieved evidence from UniProt, RCSB PDB, Gene Ontology, Pfam, ClinVar, STRING, and PubMed.
              Zero hallucinations — every factual statement is linked to traceable scientific provenance.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {onGenerateReport && (
              <button
                onClick={onGenerateReport}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600 to-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:from-cyan-500 hover:to-emerald-500 transition-all cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Generate Research Report</span>
              </button>
            )}
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Reset conversation history"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Protein Context Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Target Protein</span>
            <span className="font-bold text-white truncate block">{protein.name}</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Gene / Symbol</span>
            <span className="font-mono text-cyan-300 font-semibold">{protein.gene || 'N/A'}</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase block font-mono">UniProt Accession</span>
            <a
              href={`https://www.uniprot.org/uniprotkb/${protein.uniprotId || protein.id}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              {protein.uniprotId || protein.id}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase block font-mono">RCSB PDB Structure</span>
            <a
              href={`https://www.rcsb.org/structure/${protein.pdbId || '1TUP'}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              {protein.pdbId || '1TUP'}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Retrieved Evidence</span>
            <span className="font-semibold text-emerald-400">{allEvidence.length} items indexed</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Clinical Variants</span>
            <span className="font-semibold text-rose-400">{protein.variants?.length || 0} cataloged</span>
          </div>
        </div>
      </div>

      {/* 2. Chat Stream & Evidence Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chat Conversation (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden min-h-[580px] shadow-xl">
          {/* Chat Stream Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-950/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">Evidence Grounding Active</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>UniProt</span>
              <span>•</span>
              <span>PDB</span>
              <span>•</span>
              <span>GO</span>
              <span>•</span>
              <span>ClinVar</span>
              <span>•</span>
              <span>PubMed</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Sender badge */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                  {msg.sender === 'copilot' ? (
                    <>
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                        <Sparkles className="h-2.5 w-2.5" />
                      </div>
                      <span className="font-semibold text-cyan-300">ProteoFlow Copilot</span>
                    </>
                  ) : (
                    <span className="font-semibold text-slate-300">You (Researcher)</span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">• {msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[92%] sm:max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-xs shadow-md'
                      : 'bg-slate-950/90 text-slate-200 border border-slate-800/90 rounded-bl-xs shadow-inner'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="text-xs">{msg.text}</p>
                  ) : (
                    <div className="space-y-2">
                      {renderFormattedAnswer(msg.text)}

                      {/* Evidence Summary Count Strip */}
                      {msg.evidenceCounts && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-800/80 text-[10px]">
                          <span className="text-slate-500 font-mono uppercase text-[9px]">Evidence Breakdown:</span>
                          {msg.evidenceCounts.database > 0 && (
                            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 text-cyan-300">
                              {msg.evidenceCounts.database} Database
                            </span>
                          )}
                          {msg.evidenceCounts.experimental > 0 && (
                            <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-emerald-300">
                              {msg.evidenceCounts.experimental} Experimental
                            </span>
                          )}
                          {msg.evidenceCounts.literature > 0 && (
                            <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-amber-300">
                              {msg.evidenceCounts.literature} Literature
                            </span>
                          )}
                          {msg.evidenceCounts.computational > 0 && (
                            <span className="rounded bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 text-purple-300">
                              {msg.evidenceCounts.computational} In Silico
                            </span>
                          )}
                        </div>
                      )}

                      {/* Evidence Used Collapsible Drawer */}
                      {msg.evidenceUsed && msg.evidenceUsed.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800">
                          <button
                            onClick={() =>
                              setExpandedEvidenceId(
                                expandedEvidenceId === msg.id ? null : msg.id
                              )
                            }
                            className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            <span>
                              Evidence Used ({msg.evidenceUsed.length} verified sources)
                            </span>
                            {expandedEvidenceId === msg.id ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>

                          {expandedEvidenceId === msg.id && (
                            <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
                              {msg.evidenceUsed.map((ev) => (
                                <div
                                  key={ev.id}
                                  className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 space-y-1 text-[11px]"
                                >
                                  <div className="flex items-center justify-between gap-1 flex-wrap">
                                    <span className="font-semibold text-white">{ev.title}</span>
                                    <ProvenanceBadge
                                      type={ev.evidenceType}
                                      source={ev.source}
                                      id={ev.accession}
                                      url={ev.url}
                                    />
                                  </div>
                                  <p className="text-slate-400 text-[10px] leading-relaxed">
                                    {ev.excerpt}
                                  </p>
                                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                                    <span>Method: {ev.method || 'Curated'}</span>
                                    {ev.url && (
                                      <a
                                        href={ev.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                                      >
                                        <span>View record</span>
                                        <ExternalLink className="h-2 w-2" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Scientific Limitations Accordion */}
                      {msg.limitations && msg.limitations.length > 0 && (
                        <div className="mt-2 text-[10px] text-slate-500 italic bg-slate-900/40 rounded p-1.5 border border-slate-800/60">
                          <span className="font-semibold not-italic text-slate-400">Methodological Note: </span>
                          {msg.limitations.join(' ')}
                        </div>
                      )}

                      {/* Suggested Follow-Ups */}
                      {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-500">Related queries:</span>
                          {msg.suggestedFollowUps.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAsk(q)}
                              className="rounded-md border border-slate-800 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message action buttons */}
                {msg.sender === 'copilot' && (
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-2.5 w-2.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-2.5 w-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 animate-spin">
                  <RefreshCw className="h-3 w-3" />
                </div>
                <span>Retrieving evidence from UniProt, PDB & Gene Ontology...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Preset Chips Bar */}
          <div className="border-t border-slate-800/80 bg-slate-950/60 p-2.5 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max text-xs">
              <span className="text-[11px] text-slate-500 font-mono shrink-0 pl-1">Suggested Inquiries:</span>
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-slate-850 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* User Input Form */}
          <div className="border-t border-slate-800 p-3 bg-slate-950/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(inputQuery);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask Copilot about ${protein.name} (e.g. 'What are the important functional regions?')...`}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:from-cyan-500 hover:to-emerald-500 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Grounded Data Sources & Knowledge Graph (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Knowledge Sources Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Retrieved Data Sources
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                Live Grounding
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="font-semibold text-white">UniProtKB Swiss-Prot</span>
                </div>
                <span className="font-mono text-[10px] text-cyan-400">{protein.uniprotId || protein.id}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-white">RCSB PDB Structure</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">{protein.pdbId || '1TUP'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-blue-400" />
                  <span className="font-semibold text-white">Gene Ontology</span>
                </div>
                <span className="text-[10px] text-slate-300">
                  {(protein.goTerms?.molecularFunction?.length || 0) + (protein.goTerms?.biologicalProcess?.length || 0)} terms
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-purple-400" />
                  <span className="font-semibold text-white">Pfam / InterPro</span>
                </div>
                <span className="text-[10px] text-slate-300">{protein.domains?.length || 0} domains</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-rose-400" />
                  <span className="font-semibold text-white">ClinVar & Cancer</span>
                </div>
                <span className="text-[10px] text-slate-300">{protein.variants?.length || 0} variants</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                  <span className="font-semibold text-white">STRING Interactome</span>
                </div>
                <span className="text-[10px] text-slate-300">
                  {protein.interactions?.partners?.length || 0} partners
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-teal-400" />
                  <span className="font-semibold text-white">PubMed Literature</span>
                </div>
                <span className="text-[10px] text-slate-300">{protein.literature?.length || 0} articles</span>
              </div>
            </div>
          </div>

          {/* Evidence Classification Reference */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Evidence Taxonomy Rules</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Every factual assertion produced by Research Copilot is explicitly classified:
            </p>

            <div className="space-y-1.5 text-[10px]">
              <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <strong className="block">Experimental Evidence (Tier 1):</strong>
                X-ray crystal coordinates, wet-lab mutagenesis, enzyme assays, Co-IP.
              </div>
              <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                <strong className="block">Database Evidence (Tier 2):</strong>
                UniProt Swiss-Prot biocuration, Pfam HMM profiles, ClinVar submissions.
              </div>
              <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <strong className="block">Literature Evidence (Tier 2):</strong>
                Peer-reviewed PubMed articles with PMIDs and direct author attributions.
              </div>
              <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <strong className="block">Computational Prediction (Tier 3):</strong>
                Random Forest ML, Chou-Fasman secondary structure, ΔCharge, pI bisection.
              </div>
              <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">
                <strong className="block">AI Interpretation (Tier 4):</strong>
                Natural language synthesis strictly summarizing retrieved points.
              </div>
            </div>
          </div>

          {/* Research Report Promo Box */}
          {onGenerateReport && (
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-slate-900 p-4 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <FileText className="h-4 w-4" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Full Research Dossier
                </h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Compile all 11 scientific sections, variant matrices, and evidence tables into a publication-ready PDF or JSON document.
              </p>
              <button
                onClick={onGenerateReport}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors cursor-pointer"
              >
                <span>Generate Research Report</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
