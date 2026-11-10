import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  Database,
  Eye,
  EyeOff,
  Filter,
  GitBranch,
  Layers,
  MoveDown,
  MoveUp,
  Plus,
  Settings2,
  Sliders,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { FSCM_TABLES } from '../data/metadata/tables';
import {
  ActiveJoin,
  FilterOperator,
  JoinType,
  PeopleSoftQuery,
  QuerySort,
  SelectedField,
} from '../types/peoplesoft';

interface QueryBuilderPanelProps {
  query: PeopleSoftQuery;
  onUpdateQuery: (updater: (prev: PeopleSoftQuery) => PeopleSoftQuery) => void;
  intermediateTables: { table: string; reason: string }[];
}

export const QueryBuilderPanel: React.FC<QueryBuilderPanelProps> = ({
  query,
  onUpdateQuery,
  intermediateTables,
}) => {
  const [activeTab, setActiveTab] = useState<'fields' | 'joins' | 'options'>('fields');

  const tablesMap = new Map(FSCM_TABLES.map((t) => [t.recordName, t]));

  // Field manipulation helpers
  const handleRemoveField = (fieldId: string) => {
    onUpdateQuery((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.filter((f) => f.id !== fieldId),
      sorts: prev.sorts.filter((s) => s.id !== fieldId),
    }));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    onUpdateQuery((prev) => {
      const newFields = [...prev.selectedFields];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newFields.length) return prev;

      const temp = newFields[index];
      newFields[index] = newFields[targetIndex];
      newFields[targetIndex] = temp;

      return { ...prev, selectedFields: newFields };
    });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<SelectedField>) => {
    onUpdateQuery((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    }));
  };

  // Join manipulation helpers
  const handleUpdateJoinType = (joinId: string, type: JoinType) => {
    onUpdateQuery((prev) => ({
      ...prev,
      joins: prev.joins.map((j) => (j.id === joinId ? { ...j, joinType: type, userModified: true } : j)),
    }));
  };

  const handleRemoveJoin = (joinId: string) => {
    onUpdateQuery((prev) => ({
      ...prev,
      joins: prev.joins.filter((j) => j.id !== joinId),
    }));
  };

  const handleChangeBaseTable = (newBase: string) => {
    onUpdateQuery((prev) => ({
      ...prev,
      baseTable: newBase,
    }));
  };

  // Sort manipulation helpers
  const handleAddSort = () => {
    if (query.selectedFields.length === 0) return;
    const first = query.selectedFields[0];
    onUpdateQuery((prev) => ({
      ...prev,
      sorts: [
        ...prev.sorts,
        {
          id: `sort_${Date.now()}`,
          recordName: first.recordName,
          fieldName: first.fieldName,
          direction: 'ASC',
        },
      ],
    }));
  };

  const handleUpdateSort = (sortId: string, updates: Partial<QuerySort>) => {
    onUpdateQuery((prev) => ({
      ...prev,
      sorts: prev.sorts.map((s) => (s.id === sortId ? { ...s, ...updates } : s)),
    }));
  };

  const handleRemoveSort = (sortId: string) => {
    onUpdateQuery((prev) => ({
      ...prev,
      sorts: prev.sorts.filter((s) => s.id !== sortId),
    }));
  };

  // Available unique tables in the current query
  const involvedTables = Array.from(
    new Set([query.baseTable, ...query.selectedFields.map((f) => f.recordName)]).values()
  ).filter(Boolean);

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden border-r border-slate-800">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-slate-900/60 border-b border-slate-800">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('fields')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'fields'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Champs & Filtres ({query.selectedFields.length})
          </button>

          <button
            onClick={() => setActiveTab('joins')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'joins'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Jointures ({query.joins.length})
            {intermediateTables.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-sky-400" title="Tables intermédiaires actives" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('options')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'options'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Options & Tri ({query.sorts.length})
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Table de base :</span>
          <select
            value={query.baseTable}
            onChange={(e) => handleChangeBaseTable(e.target.value)}
            disabled={involvedTables.length === 0}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
          >
            {involvedTables.length === 0 ? (
              <option value="">(Aucune table sélectionnée)</option>
            ) : (
              involvedTables.map((t) => (
                <option key={t} value={t}>
                  {t} ({tablesMap.get(t)?.label || t})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: FIELDS & FILTERS */}
        {activeTab === 'fields' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Champs sélectionnés pour la requête
                </h2>
                <p className="text-xs text-slate-400">
                  Définissez les alias, activez ou masquez les colonnes, et configurez vos filtres métier.
                </p>
              </div>

              {query.selectedFields.length > 0 && (
                <button
                  onClick={() => onUpdateQuery((prev) => ({ ...prev, selectedFields: [] }))}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Tout retirer
                </button>
              )}
            </div>

            {query.selectedFields.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-3 bg-slate-900/30">
                <Database className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-200">Aucun champ sélectionné</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Dans le panneau gauche, explorez les tables PeopleSoft FSCM (Achats, Fournisseurs, Grand
                  Livre...) et cliquez sur les champs pour les ajouter à votre requête.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {query.selectedFields.map((field, idx) => {
                  const tableMeta = tablesMap.get(field.recordName);
                  const fieldMeta = tableMeta?.fields.find((f) => f.fieldName === field.fieldName);

                  return (
                    <div
                      key={field.id}
                      className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                        field.filterActive
                          ? 'bg-slate-900/90 border-amber-500/30 shadow-sm'
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Row: Table origin, field name, French label, reorder, and visibility */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Reordering */}
                          <div className="flex items-center gap-0.5 text-slate-500">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveField(idx, 'up')}
                              className="p-1 hover:text-slate-200 disabled:opacity-20"
                              title="Déplacer vers le haut"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === query.selectedFields.length - 1}
                              onClick={() => handleMoveField(idx, 'down')}
                              className="p-1 hover:text-slate-200 disabled:opacity-20"
                              title="Déplacer vers le bas"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Table Badge */}
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold border border-slate-700">
                            {field.recordName}
                          </span>

                          <span className="font-mono text-xs font-bold text-slate-100">
                            .{field.fieldName}
                          </span>

                          <span className="text-xs text-slate-400 font-normal truncate max-w-xs">
                            — {fieldMeta?.label || field.fieldName}
                          </span>
                        </div>

                        {/* Right: Alias & Visibility & Delete */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[11px] text-slate-400">Alias SQL :</label>
                            <input
                              type="text"
                              value={field.alias}
                              onChange={(e) =>
                                handleUpdateField(field.id, {
                                  alias: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
                                })
                              }
                              placeholder={field.fieldName}
                              className="font-mono text-xs bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-200 w-32 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <button
                            onClick={() =>
                              handleUpdateField(field.id, { isVisible: !field.isVisible })
                            }
                            className={`p-1.5 rounded transition-colors ${
                              field.isVisible
                                ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                                : 'text-slate-500 bg-slate-800 hover:text-slate-300'
                            }`}
                            title={
                              field.isVisible
                                ? 'Affiché dans le SELECT'
                                : 'Masqué du SELECT (utilisé pour filtrer uniquement)'
                            }
                          >
                            {field.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleRemoveField(field.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                            title="Supprimer ce champ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Filter / Fixed value section */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center gap-3 flex-wrap bg-slate-950/40 p-2.5 rounded-lg text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-300 select-none">
                          <input
                            type="checkbox"
                            checked={field.filterActive}
                            onChange={(e) =>
                              handleUpdateField(field.id, {
                                filterActive: e.target.checked,
                                filterOperator: field.filterOperator || '=',
                              })
                            }
                            className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-900"
                          />
                          <span>Filtrer sur ce champ</span>
                        </label>

                        {field.filterActive && (
                          <>
                            <select
                              value={field.filterOperator || '='}
                              onChange={(e) =>
                                handleUpdateField(field.id, {
                                  filterOperator: e.target.value as FilterOperator,
                                })
                              }
                              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                            >
                              <option value="=">=</option>
                              <option value="<>">&lt;&gt; (différent)</option>
                              <option value="IN">IN (liste de valeurs)</option>
                              <option value="NOT IN">NOT IN</option>
                              <option value="LIKE">LIKE (contient)</option>
                              <option value=">">&gt;</option>
                              <option value=">=">&gt;=</option>
                              <option value="<">&lt;</option>
                              <option value="<=">&lt;=</option>
                              <option value="BETWEEN">BETWEEN (entre 2 bornes)</option>
                              <option value="IS NULL">IS NULL</option>
                              <option value="IS NOT NULL">IS NOT NULL</option>
                            </select>

                            {field.filterOperator !== 'IS NULL' &&
                              field.filterOperator !== 'IS NOT NULL' && (
                                <input
                                  type="text"
                                  value={field.filterValue ?? ''}
                                  onChange={(e) =>
                                    handleUpdateField(field.id, { filterValue: e.target.value })
                                  }
                                  placeholder={
                                    field.filterOperator === 'IN' || field.filterOperator === 'NOT IN'
                                      ? 'VAL1, VAL2 ou retour à la ligne'
                                      : 'Valeur de filtre...'
                                  }
                                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                                />
                              )}

                            {field.filterOperator === 'BETWEEN' && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400">ET</span>
                                <input
                                  type="text"
                                  value={field.filterValue2 ?? ''}
                                  onChange={(e) =>
                                    handleUpdateField(field.id, { filterValue2: e.target.value })
                                  }
                                  placeholder="Borne max..."
                                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 w-28"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: JOINS & GRAPH RESOLUTION */}
        {activeTab === 'joins' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Configuration des jointures PeopleSoft
                </h2>
                <p className="text-xs text-slate-400">
                  Le moteur de graphe calcule le chemin le plus court et connecte automatiquement vos tables.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Table pivot :</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  {query.baseTable || 'Aucune'}
                </span>
              </div>
            </div>

            {/* Intermediate Bridge Tables Alert */}
            {intermediateTables.length > 0 && (
              <div className="p-3.5 bg-sky-950/30 border border-sky-800/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                  <GitBranch className="w-4 h-4 text-sky-400" />
                  Tables intermédiaires ajoutées automatiquement par le moteur de jointures :
                </div>
                <div className="space-y-1">
                  {intermediateTables.map((inter, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 pl-6 flex items-center gap-2"
                    >
                      <span className="font-mono text-sky-200 font-bold">{inter.table}</span>
                      <span className="text-slate-400">— {inter.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {query.joins.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-900/30">
                <p className="text-xs text-slate-300 font-medium">
                  {query.baseTable
                    ? `Une seule table (${query.baseTable}) est active pour le moment.`
                    : 'Aucune table sélectionnée pour le moment.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {query.baseTable
                    ? 'Lorsque vous sélectionnerez des champs issus d’une autre table (ex: VENDOR, PO_LINE, GL_ACCOUNT_TBL), le graphe PeopleSoft créera les jointures composites automatiquement.'
                    : 'Sélectionnez des champs dans le catalogue à gauche pour activer des tables et construire des jointures automatiques.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {query.joins.map((join) => {
                  const leftMeta = tablesMap.get(join.leftTable);
                  const rightMeta = tablesMap.get(join.rightTable);

                  return (
                    <div
                      key={join.id}
                      className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                            {join.leftTable}
                          </span>
                          <span className="text-slate-400">↔</span>
                          <span className="font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                            {join.rightTable}
                          </span>
                          <span className="text-slate-400 truncate max-w-xs">
                            ({rightMeta?.label || join.rightTable})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={join.joinType}
                            onChange={(e) =>
                              handleUpdateJoinType(join.id, e.target.value as JoinType)
                            }
                            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500 font-medium"
                          >
                            <option value="INNER JOIN">INNER JOIN (Stricte)</option>
                            <option value="LEFT JOIN">LEFT JOIN (Externe gauche)</option>
                          </select>

                          <button
                            onClick={() => handleRemoveJoin(join.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                            title="Supprimer cette jointure"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Composite Condition Criteria */}
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1">
                        <div className="text-[10px] text-slate-400 font-sans font-semibold mb-1">
                          Critères de jointure composite PeopleSoft :
                        </div>
                        {join.conditions.map((cond, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2">
                            <span className="text-amber-400 font-semibold">
                              {join.leftTable}.{cond.sourceField}
                            </span>
                            <span className="text-slate-400">=</span>
                            <span className="text-amber-400 font-semibold">
                              {join.rightTable}.{cond.targetField}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OPTIONS & SORTS */}
        {activeTab === 'options' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Options générales et tris</h2>
              <p className="text-xs text-slate-400">
                Ajustez le dédoublonnage, la pagination et les critères de tri multi-colonnes.
              </p>
            </div>

            {/* DISTINCT & LIMIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={query.isDistinct}
                    onChange={(e) =>
                      onUpdateQuery((prev) => ({ ...prev, isDistinct: e.target.checked }))
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
                  />
                  <span>Dédoublonner les résultats (SELECT DISTINCT)</span>
                </label>
                <p className="text-[11px] text-slate-400 pl-6">
                  Supprime les lignes de résultats strictement identiques dans le retour SQL.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  Limite de lignes retournées (FETCH FIRST / TOP) :
                </label>
                <input
                  type="number"
                  min="1"
                  max="50000"
                  value={query.rowLimit ?? ''}
                  onChange={(e) =>
                    onUpdateQuery((prev) => ({
                      ...prev,
                      rowLimit: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    }))
                  }
                  placeholder="Ex: 100"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* ORDER BY SORTS */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Critères de tri (ORDER BY)</h3>
                  <p className="text-[11px] text-slate-400">
                    Définissez l’ordre de tri croissant (ASC) ou décroissant (DESC).
                  </p>
                </div>

                <button
                  onClick={handleAddSort}
                  className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter un tri
                </button>
              </div>

              {query.sorts.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucun tri appliqué.</p>
              ) : (
                <div className="space-y-2">
                  {query.sorts.map((sort, sIdx) => {
                    return (
                      <div
                        key={sort.id}
                        className="flex items-center gap-3 p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                      >
                        <span className="text-slate-400 font-mono text-[11px]">#{sIdx + 1}</span>

                        <select
                          value={`${sort.recordName}.${sort.fieldName}`}
                          onChange={(e) => {
                            const [rec, fld] = e.target.value.split('.');
                            handleUpdateSort(sort.id, { recordName: rec, fieldName: fld });
                          }}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                        >
                          {query.selectedFields.map((f) => (
                            <option key={f.id} value={`${f.recordName}.${f.fieldName}`}>
                              {f.recordName}.{f.fieldName} ({f.alias || f.fieldName})
                            </option>
                          ))}
                        </select>

                        <select
                          value={sort.direction}
                          onChange={(e) =>
                            handleUpdateSort(sort.id, {
                              direction: e.target.value as 'ASC' | 'DESC',
                            })
                          }
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="ASC">Croissant (ASC)</option>
                          <option value="DESC">Décroissant (DESC)</option>
                        </select>

                        <button
                          onClick={() => handleRemoveSort(sort.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded ml-auto"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
