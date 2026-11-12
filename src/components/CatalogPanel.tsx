import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Database,
  Filter,
  GitBranch,
  Key,
  Layers,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { FUNCTIONAL_MODULES } from '../data/metadata/modules';
import { FSCM_RELATIONS } from '../data/metadata/relations';
import { FunctionalModuleId, PSDataType, PSField, PSTable } from '../types/peoplesoft';

interface CatalogPanelProps {
  tables: PSTable[];
  selectedFieldsMap: Set<string>; // 'RECORD.FIELD'
  onToggleField: (table: PSTable, field: PSField) => void;
  onAddAllFields: (table: PSTable) => void;
  onSelectTableForDetails?: (table: PSTable) => void;
}

export const CatalogPanel: React.FC<CatalogPanelProps> = ({
  tables,
  selectedFieldsMap,
  onToggleField,
  onAddAllFields,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<FunctionalModuleId | 'ALL'>('ALL');
  const [selectedDataType, setSelectedDataType] = useState<PSDataType | 'ALL'>('ALL');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ps_favorite_tables');
      return saved ? new Set(JSON.parse(saved)) : new Set(['PO_HDR', 'REQ_HDR', 'RECV_HDR']);
    } catch {
      return new Set(['PO_HDR', 'REQ_HDR']);
    }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [activeRelationsModalTable, setActiveRelationsModalTable] = useState<PSTable | null>(null);

  const toggleFavorite = (recordName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(recordName)) next.delete(recordName);
      else next.add(recordName);
      try {
        localStorage.setItem('ps_favorite_tables', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const toggleExpand = (recordName: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(recordName)) next.delete(recordName);
      else next.add(recordName);
      return next;
    });
  };

  // Filtered tables logic
  const filteredTables = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return tables.filter((table) => {
      // Favorites filter
      if (showOnlyFavorites && !favorites.has(table.recordName)) {
        return false;
      }

      // Module filter
      if (selectedModule !== 'ALL' && table.module !== selectedModule) {
        return false;
      }

      // Data type filter on fields
      if (selectedDataType !== 'ALL') {
        const hasMatchingType = table.fields.some((f) => f.dataType === selectedDataType);
        if (!hasMatchingType) return false;
      }

      // Text search in table and fields
      if (!q) return true;

      const matchesTable =
        table.recordName.toLowerCase().includes(q) ||
        table.sqlName.toLowerCase().includes(q) ||
        table.label.toLowerCase().includes(q) ||
        table.description.toLowerCase().includes(q);

      if (matchesTable) return true;

      // Search inside field names and labels
      const matchesField = table.fields.some(
        (f) => f.fieldName.toLowerCase().includes(q) || f.label.toLowerCase().includes(q)
      );

      return matchesField;
    });
  }, [tables, searchQuery, selectedModule, selectedDataType, showOnlyFavorites, favorites]);

  // Compute total selected fields per table
  const getSelectedCountForTable = (recordName: string) => {
    let count = 0;
    selectedFieldsMap.forEach((key) => {
      if (key.startsWith(`${recordName}.`)) count++;
    });
    return count;
  };

  return (
    <aside className="w-80 md:w-96 flex flex-col h-full bg-slate-900 border-r border-slate-800 shrink-0">
      {/* Top Search & Filter Bar */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5 bg-slate-950/40">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher table (PO_HDR) ou champ..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          {/* Module Select */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value as FunctionalModuleId | 'ALL')}
            className="w-full text-xs bg-slate-900 border border-slate-700/80 rounded-md px-2 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Tous les modules ({tables.length})</option>
            {Object.entries(FUNCTIONAL_MODULES).map(([id, mod]) => {
              const count = tables.filter((t) => t.module === id).length;
              return (
                <option key={id} value={id}>
                  {mod.name} ({count})
                </option>
              );
            })}
          </select>

          {/* Data Type Select */}
          <select
            value={selectedDataType}
            onChange={(e) => setSelectedDataType(e.target.value as PSDataType | 'ALL')}
            className="w-full text-xs bg-slate-900 border border-slate-700/80 rounded-md px-2 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Tous les types</option>
            <option value="VARCHAR2">VARCHAR2</option>
            <option value="NUMBER">NUMBER</option>
            <option value="DATE">DATE</option>
            <option value="CHAR">CHAR</option>
          </select>
        </div>

        {/* Quick Tabs / Toggles */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
          <button
            onClick={() => setShowOnlyFavorites((v) => !v)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
              showOnlyFavorites
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                : 'hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            Favoris ({favorites.size})
          </button>

          <span className="text-[11px] text-slate-400 tabular-nums">
            {filteredTables.length} {filteredTables.length <= 1 ? 'table' : 'tables'} trouvée{filteredTables.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tables & Fields List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {filteredTables.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-300">Aucune table correspondante</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Modifiez vos critères de recherche ou réinitialisez les filtres.
            </p>
          </div>
        ) : (
          filteredTables.map((table) => {
            const isExpanded = expandedTables.has(table.recordName);
            const isFav = favorites.has(table.recordName);
            const selectedCount = getSelectedCountForTable(table.recordName);
            const moduleInfo = FUNCTIONAL_MODULES[table.module];

            // Matching fields for quick highlighting if search query is active
            const q = searchQuery.toLowerCase().trim();

            return (
              <div key={table.recordName} className="group transition-colors">
                {/* Table Header Row */}
                <div
                  onClick={() => toggleExpand(table.recordName)}
                  className={`px-3 py-2.5 flex items-start justify-between gap-2 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 hover:text-slate-200 transition-transform"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-100 tracking-tight">
                          {table.recordName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 font-normal">
                          ({table.sqlName})
                        </span>
                        {table.hasEffdt && (
                          <span
                            className="text-[10px] px-1 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800/50"
                            title="Table gérée à date d'effet (EFFDT)"
                          >
                            EFFDT
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-300 truncate mt-0.5 font-medium">
                        {table.label}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span
                          className="px-1.5 py-0.2 rounded font-medium"
                          style={{
                            backgroundColor: `${moduleInfo?.color || '#94a3b8'}20`,
                            color: moduleInfo?.color || '#cbd5e1',
                          }}
                        >
                          {moduleInfo?.name || table.module}
                        </span>
                        <span>·</span>
                        <span>{table.fields.length} champs</span>
                        {selectedCount > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-amber-400 font-semibold">
                              {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRelationsModalTable(table);
                      }}
                      className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-700/50"
                      title="Voir les relations et jointures connues"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => toggleFavorite(table.recordName, e)}
                      className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-700/50"
                      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Fields List */}
                {isExpanded && (
                  <div className="bg-slate-950/70 pl-8 pr-3 py-2 border-t border-b border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-800/50 text-[11px] text-slate-400">
                      <span className="italic">{table.description}</span>
                      <button
                        onClick={() => onAddAllFields(table)}
                        className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 shrink-0 ml-2"
                        title="Ajouter tous les champs de cette table à la requête"
                      >
                        <Plus className="w-3 h-3" /> Tous
                      </button>
                    </div>

                    {table.fields.map((field) => {
                      const fieldKey = `${table.recordName}.${field.fieldName}`;
                      const isSelected = selectedFieldsMap.has(fieldKey);
                      const isHighlight =
                        q &&
                        (field.fieldName.toLowerCase().includes(q) ||
                          field.label.toLowerCase().includes(q));

                      return (
                        <div
                          key={field.fieldName}
                          onClick={() => onToggleField(table, field)}
                          className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer text-xs transition-colors ${
                            isSelected
                              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
                              : isHighlight
                              ? 'bg-sky-500/10 border border-sky-500/20 text-sky-200'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent div onClick
                              className="rounded border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-800 cursor-pointer"
                            />

                            {field.isKey && (
                              <span title="Clé primaire">
                                <Key className="w-3 h-3 text-amber-400 shrink-0" />
                              </span>
                            )}

                            <span className="font-mono text-[11px] font-medium truncate">
                              {field.fieldName}
                            </span>

                            <span className="text-[11px] text-slate-400 truncate">
                              — {field.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                            <span>{field.dataType}</span>
                            {field.length && <span>({field.length})</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Relations Inspect Modal */}
      {activeRelationsModalTable && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Relations & Jointures connues : {activeRelationsModalTable.recordName}
                  </h3>
                  <p className="text-xs text-slate-400">{activeRelationsModalTable.label}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveRelationsModalTable(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {(() => {
                const rec = activeRelationsModalTable.recordName;
                const rels = FSCM_RELATIONS.filter(
                  (r) => r.sourceTable === rec || r.targetTable === rec
                );

                if (rels.length === 0) {
                  return (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      Aucune relation directe répertoriée dans le catalogue pour cette table.
                    </p>
                  );
                }

                return rels.map((r) => {
                  const isSource = r.sourceTable === rec;
                  const otherTable = isSource ? r.targetTable : r.sourceTable;

                  return (
                    <div
                      key={r.id}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-amber-300 font-mono">
                          {r.sourceTable} → {r.targetTable}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {r.cardinality}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{r.label}</p>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800/80 font-mono text-[11px] text-slate-300">
                        {r.joinConditions.map((cond, idx) => (
                          <div key={idx}>
                            {r.sourceTable}.{cond.sourceField} = {r.targetTable}.{cond.targetField}
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-medium">
                        Fiabilité : {r.reliability}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveRelationsModalTable(null)}
                className="px-4 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
