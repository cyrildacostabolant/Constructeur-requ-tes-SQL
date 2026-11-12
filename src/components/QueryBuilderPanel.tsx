import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckSquare,
  Database,
  Eye,
  EyeOff,
  Filter,
  GitBranch,
  Key,
  Layers,
  Link2,
  MoveDown,
  MoveUp,
  Pencil,
  Plus,
  Settings2,
  Sliders,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { FSCM_RELATIONS } from '../data/metadata/relations';
import { FSCM_TABLES } from '../data/metadata/tables';
import {
  ActiveJoin,
  FilterOperator,
  JoinCondition,
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

  // Custom Join Modal / Form state
  const [isCreatingJoin, setIsCreatingJoin] = useState(false);
  const [editingJoinId, setEditingJoinId] = useState<string | null>(null);
  const [customLeftTable, setCustomLeftTable] = useState('');
  const [customRightTable, setCustomRightTable] = useState('');
  const [customJoinType, setCustomJoinType] = useState<JoinType>('INNER JOIN');
  const [customConditions, setCustomConditions] = useState<JoinCondition[]>([]);
  const [joinFormError, setJoinFormError] = useState<string | null>(null);

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

      return {
        ...prev,
        selectedFields: newFields,
      };
    });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<SelectedField>) => {
    onUpdateQuery((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    }));
  };

  const handleToggleVisibility = (fieldId: string) => {
    onUpdateQuery((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.map((f) =>
        f.id === fieldId ? { ...f, isVisible: !f.isVisible } : f
      ),
    }));
  };

  const handleToggleFilter = (fieldId: string) => {
    onUpdateQuery((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.map((f) => {
        if (f.id === fieldId) {
          const nextActive = !f.filterActive;
          return {
            ...f,
            filterActive: nextActive,
            filterOperator: nextActive ? f.filterOperator || '=' : f.filterOperator,
          };
        }
        return f;
      }),
    }));
  };

  // Join manipulation helpers
  const handleUpdateJoinType = (joinId: string, joinType: JoinType) => {
    onUpdateQuery((prev) => ({
      ...prev,
      joins: prev.joins.map((j) =>
        j.id === joinId ? { ...j, joinType, userModified: true } : j
      ),
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

  // Custom Join Handlers
  const handleStartAddJoin = (presetLeft?: string, presetRight?: string) => {
    const distinctTables = Array.from(new Set(query.selectedFields.map((f) => f.recordName)));
    const defaultLeft = presetLeft || query.baseTable || distinctTables[0] || FSCM_TABLES[0].recordName;
    const defaultRight =
      presetRight ||
      distinctTables.find((t) => t !== defaultLeft) ||
      FSCM_TABLES.find((t) => t.recordName !== defaultLeft)?.recordName ||
      FSCM_TABLES[1]?.recordName ||
      defaultLeft;

    setEditingJoinId(null);
    setCustomLeftTable(defaultLeft);
    setCustomRightTable(defaultRight);
    setCustomJoinType('INNER JOIN');
    setJoinFormError(null);

    // Try finding official ERD relation first
    const knownRel = FSCM_RELATIONS.find(
      (r) =>
        (r.sourceTable === defaultLeft && r.targetTable === defaultRight) ||
        (r.sourceTable === defaultRight && r.targetTable === defaultLeft)
    );

    if (knownRel) {
      if (knownRel.sourceTable === defaultLeft) {
        setCustomConditions(
          knownRel.joinConditions.map((c) => ({
            sourceField: c.sourceField,
            targetField: c.targetField,
          }))
        );
      } else {
        setCustomConditions(
          knownRel.joinConditions.map((c) => ({
            sourceField: c.targetField,
            targetField: c.sourceField,
          }))
        );
      }
    } else {
      // Check matching field names
      const leftMeta = tablesMap.get(defaultLeft);
      const rightMeta = tablesMap.get(defaultRight);
      const matching = leftMeta?.fields.filter((lf) =>
        rightMeta?.fields.some((rf) => rf.fieldName === lf.fieldName && lf.isKey)
      );

      if (matching && matching.length > 0) {
        setCustomConditions(
          matching.map((m) => ({ sourceField: m.fieldName, targetField: m.fieldName }))
        );
      } else {
        setCustomConditions([
          {
            sourceField: leftMeta?.fields[0]?.fieldName || '',
            targetField: rightMeta?.fields[0]?.fieldName || '',
          },
        ]);
      }
    }

    setIsCreatingJoin(true);
  };

  const handleStartEditJoin = (join: ActiveJoin) => {
    setEditingJoinId(join.id);
    setCustomLeftTable(join.leftTable);
    setCustomRightTable(join.rightTable);
    setCustomJoinType(join.joinType);
    setCustomConditions(join.conditions.map((c) => ({ ...c })));
    setJoinFormError(null);
    setIsCreatingJoin(true);
  };

  const handleTableChange = (side: 'left' | 'right', newTable: string) => {
    const newLeft = side === 'left' ? newTable : customLeftTable;
    const newRight = side === 'right' ? newTable : customRightTable;

    if (side === 'left') setCustomLeftTable(newTable);
    else setCustomRightTable(newTable);

    // Check if official relation exists
    const knownRel = FSCM_RELATIONS.find(
      (r) =>
        (r.sourceTable === newLeft && r.targetTable === newRight) ||
        (r.sourceTable === newRight && r.targetTable === newLeft)
    );

    if (knownRel) {
      if (knownRel.sourceTable === newLeft) {
        setCustomConditions(
          knownRel.joinConditions.map((c) => ({
            sourceField: c.sourceField,
            targetField: c.targetField,
          }))
        );
      } else {
        setCustomConditions(
          knownRel.joinConditions.map((c) => ({
            sourceField: c.targetField,
            targetField: c.sourceField,
          }))
        );
      }
    } else {
      const leftMeta = tablesMap.get(newLeft);
      const rightMeta = tablesMap.get(newRight);
      const matching = leftMeta?.fields.filter((lf) =>
        rightMeta?.fields.some((rf) => rf.fieldName === lf.fieldName && lf.isKey)
      );

      if (matching && matching.length > 0) {
        setCustomConditions(
          matching.map((m) => ({ sourceField: m.fieldName, targetField: m.fieldName }))
        );
      } else {
        setCustomConditions([
          {
            sourceField: leftMeta?.fields[0]?.fieldName || '',
            targetField: rightMeta?.fields[0]?.fieldName || '',
          },
        ]);
      }
    }
  };

  const handleSuggestRelationConditions = () => {
    const knownRel = FSCM_RELATIONS.find(
      (r) =>
        (r.sourceTable === customLeftTable && r.targetTable === customRightTable) ||
        (r.sourceTable === customRightTable && r.targetTable === customLeftTable)
    );

    if (knownRel) {
      if (knownRel.sourceTable === customLeftTable) {
        setCustomConditions(
          knownRel.joinConditions.map((c) => ({
            sourceField: c.sourceField,
            targetField: c.targetField,
          }))
        );
      } else {
        setCustomConditions(
          knownRel.joinConditions.map((c) => ({
            sourceField: c.targetField,
            targetField: c.sourceField,
          }))
        );
      }
      return;
    }

    const leftMeta = tablesMap.get(customLeftTable);
    const rightMeta = tablesMap.get(customRightTable);
    const matching = leftMeta?.fields.filter((lf) =>
      rightMeta?.fields.some((rf) => rf.fieldName === lf.fieldName)
    );

    if (matching && matching.length > 0) {
      setCustomConditions(
        matching.map((m) => ({ sourceField: m.fieldName, targetField: m.fieldName }))
      );
    }
  };

  const handleAddCustomCondition = () => {
    const leftMeta = tablesMap.get(customLeftTable);
    const rightMeta = tablesMap.get(customRightTable);
    setCustomConditions((prev) => [
      ...prev,
      {
        sourceField: leftMeta?.fields[0]?.fieldName || '',
        targetField: rightMeta?.fields[0]?.fieldName || '',
      },
    ]);
  };

  const handleRemoveCustomCondition = (index: number) => {
    if (customConditions.length <= 1) return;
    setCustomConditions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateCustomCondition = (
    index: number,
    key: 'sourceField' | 'targetField',
    value: string
  ) => {
    setCustomConditions((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, [key]: value } : c))
    );
  };

  const handleSaveCustomJoin = () => {
    if (!customLeftTable || !customRightTable) {
      setJoinFormError('Veuillez sélectionner les deux tables à relier.');
      return;
    }
    if (customLeftTable === customRightTable) {
      setJoinFormError('Veuillez sélectionner deux tables distinctes pour la jointure.');
      return;
    }

    const validConditions = customConditions.filter(
      (c) => c.sourceField.trim() && c.targetField.trim()
    );

    if (validConditions.length === 0) {
      setJoinFormError('Veuillez renseigner au moins un critère de jointure (champ gauche = champ droite).');
      return;
    }

    onUpdateQuery((prev) => {
      let updatedJoins = [...prev.joins];
      let newBase = prev.baseTable;
      if (!newBase) {
        newBase = customLeftTable;
      }

      if (editingJoinId) {
        updatedJoins = updatedJoins.map((j) => {
          if (j.id === editingJoinId) {
            return {
              ...j,
              leftTable: customLeftTable,
              rightTable: customRightTable,
              joinType: customJoinType,
              conditions: validConditions,
              isAutoDetected: false,
              userModified: true,
            };
          }
          return j;
        });
      } else {
        const existingIdx = updatedJoins.findIndex(
          (j) =>
            (j.leftTable === customLeftTable && j.rightTable === customRightTable) ||
            (j.leftTable === customRightTable && j.rightTable === customLeftTable)
        );

        const newJoin: ActiveJoin = {
          id: `custom_join_${Date.now()}`,
          leftTable: customLeftTable,
          rightTable: customRightTable,
          joinType: customJoinType,
          conditions: validConditions,
          isAutoDetected: false,
          userModified: true,
        };

        if (existingIdx >= 0) {
          updatedJoins[existingIdx] = newJoin;
        } else {
          updatedJoins.push(newJoin);
        }
      }

      return {
        ...prev,
        baseTable: newBase,
        joins: updatedJoins,
      };
    });

    setIsCreatingJoin(false);
    setEditingJoinId(null);
    setJoinFormError(null);
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
  const distinctTablesInQuery = Array.from(
    new Set(query.selectedFields.map((f) => f.recordName)).values()
  );

  // Check for disconnected tables
  const joinedTablesSet = new Set<string>();
  if (query.baseTable) joinedTablesSet.add(query.baseTable);
  query.joins.forEach((j) => {
    joinedTablesSet.add(j.leftTable);
    joinedTablesSet.add(j.rightTable);
  });
  const disconnectedTables = distinctTablesInQuery.filter((t) => !joinedTablesSet.has(t));

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
          {distinctTablesInQuery.length > 1 ? (
            <select
              value={query.baseTable}
              onChange={(e) => handleChangeBaseTable(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 font-mono text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-500"
            >
              {distinctTablesInQuery.map((tbl) => (
                <option key={tbl} value={tbl}>
                  {tbl}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-mono text-amber-300 font-bold">
              {query.baseTable || 'Aucune'}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* TAB 1: FIELDS & FILTERS */}
        {activeTab === 'fields' && (
          <div className="space-y-3">
            {query.selectedFields.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center bg-slate-900/30">
                <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  Votre requête est actuellement vide
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Cliquez sur n'importe quel champ dans le catalogue PeopleSoft à gauche pour l'ajouter à votre sélection.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {query.selectedFields.map((field, idx) => {
                  const tableMeta = tablesMap.get(field.recordName);
                  const fieldMeta = tableMeta?.fields.find((f) => f.fieldName === field.fieldName);

                  return (
                    <div
                      key={field.id}
                      className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5 transition-all text-xs"
                    >
                      {/* Line 1: Field name, Table badge, Keys, Actions */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-slate-400 font-mono text-[11px] w-5 text-right shrink-0">
                            #{idx + 1}
                          </span>

                          <span className="font-mono font-bold text-slate-100 text-xs truncate">
                            {field.fieldName}
                          </span>

                          <span className="text-slate-400 truncate max-w-xs text-[11px]">
                            {fieldMeta?.label || field.fieldName}
                          </span>

                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 shrink-0">
                            {field.recordName}
                          </span>

                          {fieldMeta?.isKey && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                              KEY
                            </span>
                          )}

                          <span className="font-mono text-[10px] text-slate-400 shrink-0">
                            {fieldMeta?.dataType}
                          </span>
                        </div>

                        {/* Top-right Actions: Reorder, Visibility, Filter toggle, Remove */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleMoveField(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-20 rounded"
                            title="Monter"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveField(idx, 'down')}
                            disabled={idx === query.selectedFields.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-20 rounded"
                            title="Descendre"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleVisibility(field.id)}
                            className={`p-1 rounded ${
                              field.isVisible
                                ? 'text-amber-400 hover:bg-amber-500/10'
                                : 'text-slate-400 hover:text-slate-400'
                            }`}
                            title={field.isVisible ? 'Affiché dans le SELECT' : 'Masqué (utilisé pour filtre/tri)'}
                          >
                            {field.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleToggleFilter(field.id)}
                            className={`p-1 rounded ${
                              field.filterActive
                                ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title="Filtrer sur ce champ (WHERE)"
                          >
                            <Filter className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRemoveField(field.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded"
                            title="Retirer le champ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Line 2: Alias and Filters options */}
                      <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60 flex-wrap">
                        {/* Column SQL Alias */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 font-medium">Alias :</span>
                          <input
                            type="text"
                            value={field.alias}
                            onChange={(e) =>
                              handleUpdateField(field.id, { alias: e.target.value.toUpperCase() })
                            }
                            placeholder="Alias SQL..."
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-200 font-mono w-32 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Active Filter Input row */}
                        {field.filterActive && (
                          <>
                            <select
                              value={field.filterOperator || '='}
                              onChange={(e) =>
                                handleUpdateField(field.id, {
                                  filterOperator: e.target.value as FilterOperator,
                                })
                              }
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-amber-500 font-bold"
                            >
                              <option value="=">=</option>
                              <option value="<>">≠ (&lt;&gt;)</option>
                              <option value="LIKE">LIKE (contient %)</option>
                              <option value="IN">IN (liste valeurs)</option>
                              <option value="NOT IN">NOT IN</option>
                              <option value=">">&gt;</option>
                              <option value=">=">&gt;=</option>
                              <option value="<">&lt;</option>
                              <option value="<=">&lt;=</option>
                              <option value="BETWEEN">BETWEEN</option>
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
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-0.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
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
                                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-0.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 w-28"
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
            {/* Header with Add Join Action */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Configuration des jointures PeopleSoft</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {query.joins.length} jointure{query.joins.length > 1 ? 's' : ''}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Combinez les jointures calculées automatiquement avec vos propres jointures personnalisées sur mesure.
                </p>
              </div>

              <button
                onClick={() => handleStartAddJoin()}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une jointure personnalisée
              </button>
            </div>

            {/* Disconnected Tables Warning Banner */}
            {disconnectedTables.length > 0 && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-200">
                  <span className="font-bold">Attention :</span>
                  <span>
                    La table{' '}
                    <strong className="font-mono text-amber-300">{disconnectedTables.join(', ')}</strong>{' '}
                    n'est reliée à aucune autre table dans la requête.
                  </span>
                </div>
                <button
                  onClick={() => handleStartAddJoin(query.baseTable || undefined, disconnectedTables[0])}
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 transition-colors shrink-0"
                >
                  Relier maintenant
                </button>
              </div>
            )}

            {/* Custom Join Creation / Edit Form Card */}
            {isCreatingJoin && (
              <div className="p-4 bg-slate-900 border-2 border-amber-500/50 rounded-xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white">
                      {editingJoinId ? 'Modifier la jointure' : 'Nouvelle jointure personnalisée'}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setIsCreatingJoin(false);
                      setEditingJoinId(null);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {joinFormError && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-xs font-medium">
                    {joinFormError}
                  </div>
                )}

                {/* Table 1, Join Type, Table 2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Table source (gauche) :
                    </label>
                    <select
                      value={customLeftTable}
                      onChange={(e) => handleTableChange('left', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                    >
                      {FSCM_TABLES.map((t) => (
                        <option key={t.recordName} value={t.recordName}>
                          {t.recordName} — {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Type de jointure SQL :
                    </label>
                    <select
                      value={customJoinType}
                      onChange={(e) => setCustomJoinType(e.target.value as JoinType)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="INNER JOIN">INNER JOIN (Stricte)</option>
                      <option value="LEFT JOIN">LEFT JOIN (Externe gauche)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Table cible (droite) :
                    </label>
                    <select
                      value={customRightTable}
                      onChange={(e) => handleTableChange('right', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                    >
                      {FSCM_TABLES.map((t) => (
                        <option key={t.recordName} value={t.recordName}>
                          {t.recordName} — {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditions (ON) */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      Critères d'égalité (Clause ON) :
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSuggestRelationConditions}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium hover:underline"
                        title="Détecter les clés correspondantes ou la relation ERD"
                      >
                        <Sparkles className="w-3 h-3" /> Suggérer les champs clés
                      </button>

                      <button
                        type="button"
                        onClick={handleAddCustomCondition}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Ajouter un critère (AND)
                      </button>
                    </div>
                  </div>

                  {customConditions.map((cond, cIdx) => {
                    const leftFields = tablesMap.get(customLeftTable)?.fields || [];
                    const rightFields = tablesMap.get(customRightTable)?.fields || [];

                    return (
                      <div
                        key={cIdx}
                        className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                      >
                        <span className="text-slate-400 font-mono text-[11px] w-6">
                          {cIdx === 0 ? 'ON' : 'AND'}
                        </span>

                        {/* Left Field Select */}
                        <div className="flex-1">
                          <select
                            value={cond.sourceField}
                            onChange={(e) =>
                              handleUpdateCustomCondition(cIdx, 'sourceField', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                          >
                            <option value="">Sélectionner un champ gauche...</option>
                            {leftFields.map((f) => (
                              <option key={f.fieldName} value={f.fieldName}>
                                {customLeftTable}.{f.fieldName} ({f.label}){f.isKey ? ' [KEY]' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <span className="text-slate-400 font-bold">=</span>

                        {/* Right Field Select */}
                        <div className="flex-1">
                          <select
                            value={cond.targetField}
                            onChange={(e) =>
                              handleUpdateCustomCondition(cIdx, 'targetField', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                          >
                            <option value="">Sélectionner un champ droit...</option>
                            {rightFields.map((f) => (
                              <option key={f.fieldName} value={f.fieldName}>
                                {customRightTable}.{f.fieldName} ({f.label}){f.isKey ? ' [KEY]' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {customConditions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomCondition(cIdx)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded"
                            title="Supprimer ce critère"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingJoin(false);
                      setEditingJoinId(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCustomJoin}
                    className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Enregistrer la jointure
                  </button>
                </div>
              </div>
            )}

            {/* Intermediate Bridge Tables Alert */}
            {intermediateTables.length > 0 && (
              <div className="p-3.5 bg-sky-950/30 border border-sky-800/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                  <GitBranch className="w-4 h-4 text-sky-400" />
                  Tables intermédiaires ajoutées automatiquement par le modèle :
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

            {/* Joins List */}
            {query.joins.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-900/30 space-y-3">
                <p className="text-xs text-slate-300 font-medium">
                  {query.baseTable
                    ? `Une seule table (${query.baseTable}) est active pour le moment.`
                    : 'Aucune table sélectionnée pour le moment.'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Les jointures se créent automatiquement dès que vous sélectionnez des champs de tables différentes. Vous pouvez également en créer manuellement dès maintenant.
                </p>
                <button
                  onClick={() => handleStartAddJoin()}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Créer une jointure manuelle
                </button>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Auto vs Custom Badge */}
                          {join.isAutoDetected ? (
                            <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60 font-medium text-[11px] flex items-center gap-1">
                              <GitBranch className="w-3 h-3" /> Auto (ERD 9.2)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-medium text-[11px] flex items-center gap-1">
                              <Sliders className="w-3 h-3" /> Personnalisée
                            </span>
                          )}

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
                            onClick={() => handleStartEditJoin(join)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                            title="Modifier les critères de cette jointure"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

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
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-[10px] text-slate-400 font-sans font-semibold">
                            Critères de jointure ({join.conditions.length}) :
                          </div>
                          <button
                            onClick={() => handleStartEditJoin(join)}
                            className="text-[10px] text-amber-400 hover:underline font-sans"
                          >
                            + Modifier les champs
                          </button>
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
                  Limite de lignes retournées (optionnel) :
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
                  placeholder="Aucune limite (sans restriction)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Laisser vide pour ne pas limiter les résultats (aucune clause FETCH FIRST).
                </p>
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
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                          title="Supprimer ce tri"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
