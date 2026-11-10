import React, { useMemo, useState } from 'react';
import { CatalogPanel } from './components/CatalogPanel';
import { CoverageModal } from './components/CoverageModal';
import { Header } from './components/Header';
import { PresetsModal } from './components/PresetsModal';
import { QueryBuilderPanel } from './components/QueryBuilderPanel';
import { SqlViewerPanel } from './components/SqlViewerPanel';
import { PRESET_QUERIES } from './data/metadata/presets';
import { FSCM_TABLES } from './data/metadata/tables';
import { graphEngine } from './services/graphEngine';
import { sqlGenerator } from './services/sqlGenerator';
import {
  ActiveJoin,
  PeopleSoftQuery,
  PSField,
  PSTable,
  SelectedField,
  SqlDialect,
} from './types/peoplesoft';

const createEmptyQuery = (dialect: SqlDialect = 'oracle'): PeopleSoftQuery => ({
  name: 'Nouvelle requête',
  baseTable: '',
  selectedFields: [],
  joins: [],
  sorts: [],
  isDistinct: false,
  rowLimit: 100,
  dialect,
  useBindVariables: false,
  effdtOptions: {},
});

export default function App() {
  // Completely blank query on application launch
  const [query, setQuery] = useState<PeopleSoftQuery>(() => createEmptyQuery('oracle'));

  const [isCoverageOpen, setIsCoverageOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  // Fast lookup set of selected fields: "RECORDNAME.FIELDNAME"
  const selectedFieldsMap = useMemo(() => {
    const set = new Set<string>();
    query.selectedFields.forEach((f) => {
      set.add(`${f.recordName}.${f.fieldName}`);
    });
    return set;
  }, [query.selectedFields]);

  // Compute intermediate tables and auto-resolve joins when involved tables change
  const { intermediateTables } = useMemo(() => {
    const distinctTables = Array.from(
      new Set(query.selectedFields.map((f) => f.recordName)).values()
    );

    if (distinctTables.length <= 1 || !query.baseTable) {
      return { intermediateTables: [] };
    }

    const res = graphEngine.resolveJoinsForTables(query.baseTable, distinctTables);
    return {
      intermediateTables: res.intermediateTables,
    };
  }, [query.baseTable, query.selectedFields]);

  // Toggle field in query
  const handleToggleField = (table: PSTable, field: PSField) => {
    const key = `${table.recordName}.${field.fieldName}`;
    const exists = selectedFieldsMap.has(key);

    if (exists) {
      // Remove field
      setQuery((prev) => {
        const remainingFields = prev.selectedFields.filter(
          (f) => !(f.recordName === table.recordName && f.fieldName === field.fieldName)
        );

        // If table has no remaining fields and was not base table, check if joins should adapt
        const remainingTables = Array.from(new Set(remainingFields.map((f) => f.recordName)));
        let newBase = prev.baseTable;
        if (!remainingTables.includes(newBase)) {
          newBase = remainingTables.length > 0 ? remainingTables[0] : '';
        }

        // Auto-recalculate joins
        let newJoins = prev.joins;
        if (remainingTables.length > 1) {
          const autoRes = graphEngine.resolveJoinsForTables(newBase, remainingTables);
          newJoins = autoRes.joins;
        } else if (remainingTables.length <= 1) {
          newJoins = [];
        }

        return {
          ...prev,
          baseTable: newBase,
          selectedFields: remainingFields,
          joins: newJoins,
        };
      });
    } else {
      // Add field
      setQuery((prev) => {
        const newField: SelectedField = {
          id: `field_${table.recordName}_${field.fieldName}_${Date.now()}`,
          recordName: table.recordName,
          fieldName: field.fieldName,
          alias: field.fieldName,
          isVisible: true,
          filterActive: false,
          logicalOperator: 'AND',
        };

        const newFields = [...prev.selectedFields, newField];
        const newBase = prev.baseTable || table.recordName;

        // Check if new table requires join
        const distinctTables = Array.from(new Set(newFields.map((f) => f.recordName)));
        let newJoins = prev.joins;

        if (distinctTables.length > 1) {
          const autoRes = graphEngine.resolveJoinsForTables(newBase, distinctTables);
          // Keep user-modified join types if exists, otherwise take auto
          newJoins = autoRes.joins.map((aj) => {
            const existing = prev.joins.find(
              (ej) =>
                (ej.leftTable === aj.leftTable && ej.rightTable === aj.rightTable) ||
                (ej.leftTable === aj.rightTable && ej.rightTable === aj.leftTable)
            );
            if (existing && existing.userModified) {
              return { ...aj, joinType: existing.joinType, userModified: true };
            }
            return aj;
          });
        }

        // Enable EFFDT rule by default if table has EFFDT
        const updatedEffdt = { ...prev.effdtOptions };
        if (table.hasEffdt && !updatedEffdt[table.recordName]) {
          updatedEffdt[table.recordName] = {
            recordName: table.recordName,
            enabled: true,
            filterEffStatusActive: table.hasEffStatus ?? false,
          };
        }

        return {
          ...prev,
          baseTable: newBase,
          selectedFields: newFields,
          joins: newJoins,
          effdtOptions: updatedEffdt,
        };
      });
    }
  };

  // Add all fields of a table
  const handleAddAllFields = (table: PSTable) => {
    setQuery((prev) => {
      const existingInTable = new Set(
        prev.selectedFields
          .filter((f) => f.recordName === table.recordName)
          .map((f) => f.fieldName)
      );

      const toAdd: SelectedField[] = table.fields
        .filter((f) => !existingInTable.has(f.fieldName))
        .map((f) => ({
          id: `field_${table.recordName}_${f.fieldName}_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 5)}`,
          recordName: table.recordName,
          fieldName: f.fieldName,
          alias: f.fieldName,
          isVisible: true,
          filterActive: false,
          logicalOperator: 'AND',
        }));

      const newFields = [...prev.selectedFields, ...toAdd];
      const newBase = prev.baseTable || table.recordName;

      const distinctTables = Array.from(new Set(newFields.map((f) => f.recordName)));
      let newJoins = prev.joins;
      if (distinctTables.length > 1) {
        const autoRes = graphEngine.resolveJoinsForTables(newBase, distinctTables);
        newJoins = autoRes.joins;
      }

      return {
        ...prev,
        baseTable: newBase,
        selectedFields: newFields,
        joins: newJoins,
      };
    });
  };

  const handleDialectChange = (dialect: SqlDialect) => {
    setQuery((prev) => ({ ...prev, dialect }));
  };

  const handleResetQuery = () => {
    if (query.selectedFields.length === 0) return;
    if (confirm('Voulez-vous vraiment effacer tous les champs et réinitialiser la requête ?')) {
      setQuery(createEmptyQuery(query.dialect));
    }
  };

  const handleSelectPreset = (presetQuery: PeopleSoftQuery) => {
    setQuery(presetQuery);
  };

  // Real-time SQL Generation
  const generationResult = useMemo(() => {
    return sqlGenerator.generateSql(query);
  }, [query]);

  const totalFields = useMemo(() => {
    return FSCM_TABLES.reduce((sum, t) => sum + t.fields.length, 0);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        query={query}
        dialect={query.dialect}
        onDialectChange={handleDialectChange}
        onOpenCoverage={() => setIsCoverageOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onResetQuery={handleResetQuery}
        tableCount={FSCM_TABLES.length}
        fieldCount={totalFields}
      />

      {/* 3-Zone Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Metadata Catalog */}
        <CatalogPanel
          tables={FSCM_TABLES}
          selectedFieldsMap={selectedFieldsMap}
          onToggleField={handleToggleField}
          onAddAllFields={handleAddAllFields}
        />

        {/* Center: Query Builder ("Ma requête") */}
        <QueryBuilderPanel
          query={query}
          onUpdateQuery={setQuery}
          intermediateTables={intermediateTables}
        />

        {/* Right: Generated SQL & Explanations */}
        <SqlViewerPanel
          generationResult={generationResult}
          query={query}
          onUpdateQuery={setQuery}
        />
      </div>

      {/* Coverage & Verification Modal */}
      <CoverageModal isOpen={isCoverageOpen} onClose={() => setIsCoverageOpen(false)} />

      {/* Preset Queries Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
