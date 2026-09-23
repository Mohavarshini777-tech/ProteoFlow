import React from 'react';
import { ExternalLink, Database, FlaskConical, BookOpen, Cpu, Sparkles, AlertCircle } from 'lucide-react';
import { GroundedEvidenceCategory } from '../../types';

interface ProvenanceBadgeProps {
  type: GroundedEvidenceCategory;
  source?: string;
  id?: string;
  url?: string;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  source,
  id,
  url,
  size = 'sm',
}) => {
  const getStyle = () => {
    switch (type) {
      case 'experimental':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          label: 'Experimental Evidence',
          icon: FlaskConical,
        };
      case 'database':
        return {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          text: 'text-cyan-400',
          label: 'Database Evidence',
          icon: Database,
        };
      case 'literature':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          label: 'Literature Evidence',
          icon: BookOpen,
        };
      case 'computational':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          label: 'Computational Prediction',
          icon: Cpu,
        };
      case 'ai-interpretation':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          label: 'AI-Generated Interpretation',
          icon: Sparkles,
        };
      default:
        return {
          bg: 'bg-slate-800',
          border: 'border-slate-700',
          text: 'text-slate-400',
          label: 'Unclassified Evidence',
          icon: AlertCircle,
        };
    }
  };

  const style = getStyle();
  const Icon = style.icon;

  const content = (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md border ${style.bg} ${style.border} ${style.text} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      <span>{style.label}</span>
      {source && (
        <span className="opacity-75 font-mono text-[9px] border-l border-current/30 pl-1 ml-0.5">
          {source} {id ? `(${id})` : ''}
        </span>
      )}
      {url && <ExternalLink className="h-2.5 w-2.5 opacity-70 ml-0.5" />}
    </span>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-85 transition-opacity inline-block"
        title={`View record in ${source || 'primary database'}`}
      >
        {content}
      </a>
    );
  }

  return content;
};

interface ProvenanceCardProps {
  source: string;
  database: string;
  accession?: string;
  evidenceType: GroundedEvidenceCategory;
  retrievedDate?: string;
  method?: string;
  coverage?: string;
  url?: string;
  isAvailable?: boolean;
}

export const ProvenanceCard: React.FC<ProvenanceCardProps> = ({
  source,
  database,
  accession,
  evidenceType,
  retrievedDate = new Date().toISOString().split('T')[0],
  method,
  coverage,
  url,
  isAvailable = true,
}) => {
  if (!isAvailable) {
    return (
      <div className="rounded-lg border border-rose-900/50 bg-rose-950/20 p-3 text-xs text-rose-300 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
        <span>Data unavailable — source could not be retrieved from {database}.</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-semibold text-white">{database}</span>
          {accession && (
            <span className="font-mono text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 text-[11px]">
              {accession}
            </span>
          )}
        </div>
        <ProvenanceBadge type={evidenceType} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
        <div>
          <span className="text-slate-500 block text-[10px]">Source Scope</span>
          <span className="text-slate-300 truncate">{source}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Retrieved Date</span>
          <span className="font-mono text-slate-300">{retrievedDate}</span>
        </div>
        {method && (
          <div>
            <span className="text-slate-500 block text-[10px]">Method</span>
            <span className="text-slate-300 truncate">{method}</span>
          </div>
        )}
        {coverage && (
          <div>
            <span className="text-slate-500 block text-[10px]">Coverage</span>
            <span className="text-slate-300 truncate">{coverage}</span>
          </div>
        )}
      </div>

      {url && (
        <div className="pt-1 text-right">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            <span>Open {database} record</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
};
