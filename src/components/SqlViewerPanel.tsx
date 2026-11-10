import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  Code2,
  Copy,
  Download,
  FileCheck,
  HelpCircle,
  ListFilter,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import React, { useState } from 'react';
import { FSCM_TABLES } from '../data/metadata/tables';
import {
  EffdtOption,
  PeopleSoftQuery,
  SqlGenerationResult,
} from '../types/peoplesoft';

interface SqlViewerPanelProps {
  generationResult: SqlGenerationResult;
  query: PeopleSoftQuery;
  onUpdateQuery: (updater: (prev: PeopleSoftQuery) => PeopleSoftQuery) => void;
}

export const SqlViewerPanel: React.FC<SqlViewerPanelProps> = ({
  generationResult,
  query,
  onUpdateQuery,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'explanation' | 'params'>('sql');

  const { sql, parameters, explanation, errors } = generationResult;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `peoplesoft_query_${Date.now()}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleEffdt = (recordName: string) => {
    onUpdateQuery((prev) => {
      const current = prev.effdtOptions[recordName] || {
        recordName,
        enabled: true,
        filterEffStatusActive: true,
      };
      return {
        ...prev,
        effdtOptions: {
          ...prev.effdtOptions,
          [recordName]: {
            ...current,
            enabled: !current.enabled,
          },
        },
      };
    });
  };

  const handleToggleEffStatus = (recordName: string) => {
    onUpdateQuery((prev) => {
      const current = prev.effdtOptions[recordName] || {
        recordName,
        enabled: true,
        filterEffStatusActive: true,
      };
      return {
        ...prev,
        effdtOptions: {
          ...prev.effdtOptions,
          [recordName]: {
            ...current,
            filterEffStatusActive: !current.filterEffStatusActive,
          },
        },
      };
    });
  };

  // Identify tables in the current query that support EFFDT
  const tablesMap = new Map(FSCM_TABLES.map((t) => [t.recordName, t]));
  const involvedEffdtTables = explanation.tablesUsed
    .map((t) => tablesMap.get(t.recordName))
    .filter((t) => t && t.hasEffdt);

  // Syntax highlighting simple colorizer
  const renderHighlightedSql = (sqlText: string) => {
    // Split into tokens / lines
    const lines = sqlText.split('\n');

    return (
      <div className="font-mono text-xs leading-relaxed select-text">
        {lines.map((line, lIdx) => {
          // Highlight SQL keywords
          const isComment = line.trim().startsWith('--');
          if (isComment) {
            return (
              <div key={lIdx} className="text-slate-500 italic">
                {line}
              </div>
            );
          }

          const highlighted = line.replace(
            /\b(SELECT|DISTINCT|TOP|FROM|INNER JOIN|LEFT JOIN|JOIN|ON|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|ASC|DESC|MAX|FETCH FIRST|ROWS ONLY|BETWEEN|IN|NOT IN|LIKE|IS NULL|IS NOT NULL|AS|SYSDATE|GETDATE)\b/g,
            '<span class="text-amber-400 font-bold">$1</span>'
          );

          return (
            <div
              key={lIdx}
              className="text-slate-200"
              dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section className="w-96 lg:w-[460px] flex flex-col h-full bg-slate-900 shrink-0">
      {/* Top Header & Actions */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white tracking-tight">SQL Généré</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {query.dialect === 'oracle' ? 'Oracle' : 'SQL Server'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySql}
            className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md transition-colors flex items-center gap-1"
            title="Copier le code SQL dans le presse-papier"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié !' : 'Copier'}
          </button>

          <button
            onClick={handleDownloadSql}
            className="px-2.5 py-1 text-xs font-medium text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors flex items-center gap-1 font-semibold"
            title="Télécharger le fichier .sql"
          >
            <Download className="w-3.5 h-3.5" />
            .sql
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/20 text-xs">
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'sql'
              ? 'border-amber-500 text-amber-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Requête SQL
        </button>

        <button
          onClick={() => setActiveTab('explanation')}
          className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'explanation'
              ? 'border-amber-500 text-amber-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Résumé en français
        </button>

        {query.useBindVariables && (
          <button
            onClick={() => setActiveTab('params')}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'params'
                ? 'border-amber-500 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Variables ({parameters.length})
          </button>
        )}
      </div>

      {/* Validation Errors & Warnings Notice */}
      {errors.length > 0 && (
        <div className="p-3 border-b border-slate-800 bg-amber-950/20 space-y-2">
          {errors.map((err, eIdx) => (
            <div key={eIdx} className="flex items-start gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">{err.title}</p>
                <p className="text-[11px] text-slate-300">{err.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PeopleSoft Advanced Specifics Options Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Options avancées PeopleSoft</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
            <input
              type="checkbox"
              checked={query.useBindVariables}
              onChange={(e) =>
                onUpdateQuery((prev) => ({ ...prev, useBindVariables: e.target.checked }))
              }
              className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-900"
            />
            <span>Variables liées (:1, :2...)</span>
          </label>
        </div>

        {/* EFFDT subquery toggles if EFFDT tables are present */}
        {involvedEffdtTables.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <span className="text-[11px] text-sky-300 font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sky-400" />
              Règle de date d'effet (EFFDT) :
            </span>

            {involvedEffdtTables.map((t) => {
              if (!t) return null;
              const opt = query.effdtOptions[t.recordName] ?? {
                recordName: t.recordName,
                enabled: true,
                filterEffStatusActive: true,
              };

              return (
                <div
                  key={t.recordName}
                  className="p-2 bg-slate-900 rounded border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-200">
                      {t.recordName} ({t.label})
                    </span>
                    <button
                      onClick={() => handleToggleEffdt(t.recordName)}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                        opt.enabled
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {opt.enabled ? 'Dernière valeur en vigueur' : 'Historique complet'}
                    </button>
                  </div>

                  {opt.enabled && t.hasEffStatus && (
                    <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer pl-1">
                      <input
                        type="checkbox"
                        checked={opt.filterEffStatusActive}
                        onChange={() => handleToggleEffStatus(t.recordName)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-900"
                      />
                      <span>Filtrer sur statut actif uniquement (EFF_STATUS = 'A')</span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-950/80">
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto">
              {renderHighlightedSql(sql)}
            </div>
          </div>
        )}

        {activeTab === 'explanation' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-white mb-1">Résumé de la requête</h3>
              <p className="text-slate-400 text-[11px]">
                Explication détaillée en français pour les utilisateurs métier et analystes PeopleSoft.
              </p>
            </div>

            {/* Tables Used */}
            <div className="space-y-1">
              <span className="font-semibold text-amber-300">Tables interrogées :</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {explanation.tablesUsed.map((tbl, idx) => (
                  <li key={idx}>
                    <strong className="text-white font-mono">{tbl.recordName}</strong> ({tbl.label})
                    — physique <code className="text-amber-200">{tbl.sqlName}</code> alias{' '}
                    <code className="text-slate-400">{tbl.alias}</code>
                    {tbl.isIntermediate && (
                      <span className="text-[10px] text-sky-400 ml-1.5 italic">
                        (Table intermédiaire de jointure)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Joins */}
            {explanation.joinsExplained.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold text-amber-300">Jointures appliquées :</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {explanation.joinsExplained.map((j, idx) => (
                    <li key={idx}>{j}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Selected Columns */}
            <div className="space-y-1">
              <span className="font-semibold text-amber-300">Champs retournés dans le résultat :</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {explanation.selectedColumns.map((c, idx) => (
                  <li key={idx}>
                    <strong className="text-white">{c.label}</strong> ({c.fieldName}) depuis {c.table}{' '}
                    {c.alias && c.alias !== c.fieldName && (
                      <span className="text-slate-400">avec l'alias {c.alias}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Filters */}
            {explanation.filtersExplained.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold text-amber-300">Conditions de filtrage :</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {explanation.filtersExplained.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* EFFDT Rules */}
            {explanation.effdtRules.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold text-amber-300">Règles de date d’effet :</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {explanation.effdtRules.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sorts */}
            {explanation.sortsExplained.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold text-amber-300">Ordre de tri :</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {explanation.sortsExplained.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'params' && (
          <div className="space-y-3 text-xs">
            <div>
              <h3 className="font-bold text-white mb-1">Paramètres de liaison (Bind Variables)</h3>
              <p className="text-slate-400 text-[11px]">
                Valeurs à renseigner lors de l'exécution dans Oracle SQL Developer ou PeopleTools Query.
              </p>
            </div>

            {parameters.length === 0 ? (
              <p className="text-slate-400 italic">Aucune variable de liaison requise.</p>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden">
                {parameters.map((param) => (
                  <div
                    key={param.index}
                    className="p-2.5 bg-slate-900/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-amber-400">{param.name}</span>
                      <span className="text-slate-400 ml-2">({param.field})</span>
                    </div>
                    <div className="font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-200 border border-slate-800">
                      {param.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
