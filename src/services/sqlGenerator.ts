import { FSCM_TABLES } from '../data/metadata/tables';
import {
  PeopleSoftQuery,
  QueryValidationError,
  SelectedField,
  SqlGenerationResult,
} from '../types/peoplesoft';
import { graphEngine } from './graphEngine';

export class PeopleSoftSqlGenerator {
  /**
   * Generates formatted SQL from the query model
   */
  public generateSql(query: PeopleSoftQuery): SqlGenerationResult {
    const errors: QueryValidationError[] = [];
    const parameters: { index: number; name: string; value: string; field: string }[] = [];
    let paramCounter = 1;

    // 1. Gather all tables involved
    const tableSet = new Set<string>();
    if (query.baseTable) {
      tableSet.add(query.baseTable);
    }

    for (const f of query.selectedFields) {
      tableSet.add(f.recordName);
    }

    for (const j of query.joins) {
      tableSet.add(j.leftTable);
      tableSet.add(j.rightTable);
    }

    const involvedTables = Array.from(tableSet);

    if (involvedTables.length === 0) {
      return {
        sql: '-- Aucune table sélectionnée pour le moment.\n-- Cliquez sur un champ dans le catalogue à gauche pour commencer à construire votre requête.',
        parameters: [],
        explanation: {
          baseTableLabel: '',
          tablesUsed: [],
          selectedColumns: [],
          joinsExplained: [],
          filtersExplained: [],
          sortsExplained: [],
          effdtRules: [],
        },
        errors: [
          {
            type: 'warning',
            title: 'Requête vide',
            message: 'Sélectionnez au moins un champ dans le catalogue pour composer une requête.',
          },
        ],
      };
    }

    // 2. Generate table aliases
    const aliasMap = graphEngine.generateTableAliases(involvedTables);

    // 3. Metadata lookup maps
    const tablesMap = new Map(FSCM_TABLES.map((t) => [t.recordName, t]));

    // 4. Check for disconnected tables
    const joinedTables = new Set<string>();
    if (query.baseTable) joinedTables.add(query.baseTable);
    for (const j of query.joins) {
      joinedTables.add(j.leftTable);
      joinedTables.add(j.rightTable);
    }

    const orphanTables = involvedTables.filter((t) => !joinedTables.has(t));
    if (orphanTables.length > 0) {
      errors.push({
        type: 'warning',
        title: 'Tables non jointes (Risque de produit cartésien)',
        message: `Les tables suivantes ne possèdent pas de jointure explicite : ${orphanTables.join(', ')}. Vérifiez la section Jointures au centre pour les relier.`,
      });
    }

    // 5. Build SELECT clause
    const visibleFields = query.selectedFields.filter((f) => f.isVisible);
    const selectItems: string[] = [];
    const selectedColumnsExplained: { alias: string; fieldName: string; label: string; table: string }[] = [];

    if (visibleFields.length === 0) {
      errors.push({
        type: 'warning',
        title: 'Aucune colonne sélectionnée pour l’affichage',
        message: 'Toutes les colonnes sont masquées. Un littéral "1" ou les clés primaires seront projetées par défaut.',
      });
      const baseAlias = aliasMap.get(query.baseTable) || query.baseTable;
      selectItems.push(`${baseAlias}.*`);
    } else {
      for (const f of visibleFields) {
        const tableAlias = aliasMap.get(f.recordName) || f.recordName;
        const colRef = `${tableAlias}.${f.fieldName}`;
        const aliasPart = f.alias && f.alias.trim() ? ` AS ${f.alias.trim()}` : '';
        selectItems.push(`  ${colRef}${aliasPart}`);

        const tblMeta = tablesMap.get(f.recordName);
        const fldMeta = tblMeta?.fields.find((field) => field.fieldName === f.fieldName);

        selectedColumnsExplained.push({
          alias: f.alias || f.fieldName,
          fieldName: f.fieldName,
          label: fldMeta?.label || f.fieldName,
          table: tblMeta?.label || f.recordName,
        });
      }
    }

    // 6. Build FROM & JOINS
    const baseTableMeta = tablesMap.get(query.baseTable);
    const baseSqlName = baseTableMeta ? baseTableMeta.sqlName : `PS_${query.baseTable}`;
    const baseAlias = aliasMap.get(query.baseTable) || query.baseTable;

    let fromClause = `FROM ${baseSqlName} ${baseAlias}`;
    const joinsExplained: string[] = [];

    // Order joins safely starting from baseTable
    for (const j of query.joins) {
      const rightMeta = tablesMap.get(j.rightTable);
      const rightSqlName = rightMeta ? rightMeta.sqlName : `PS_${j.rightTable}`;
      const leftAlias = aliasMap.get(j.leftTable) || j.leftTable;
      const rightAlias = aliasMap.get(j.rightTable) || j.rightTable;

      const condStrings = j.conditions.map((c) => {
        return `${leftAlias}.${c.sourceField} = ${rightAlias}.${c.targetField}`;
      });

      const onClause = condStrings.length > 0 ? condStrings.join(' AND ') : '1 = 1';
      fromClause += `\n${j.joinType} ${rightSqlName} ${rightAlias}\n  ON (${onClause})`;

      const leftLabel = tablesMap.get(j.leftTable)?.label || j.leftTable;
      const rightLabel = tablesMap.get(j.rightTable)?.label || j.rightTable;
      joinsExplained.push(
        `${j.joinType === 'INNER JOIN' ? 'Jointure interne' : 'Jointure externe gauche'} entre ${leftLabel} (${leftAlias}) et ${rightLabel} (${rightAlias}) sur [${condStrings.join(', ')}]`
      );
    }

    // 7. Build WHERE clause (Filters & EFFDT)
    const whereConditions: string[] = [];
    const filtersExplained: string[] = [];

    // A. User filters
    const activeFilters = query.selectedFields.filter((f) => f.filterActive && f.filterOperator);
    for (let i = 0; i < activeFilters.length; i++) {
      const f = activeFilters[i];
      const tableAlias = aliasMap.get(f.recordName) || f.recordName;
      const colRef = `${tableAlias}.${f.fieldName}`;
      const tblMeta = tablesMap.get(f.recordName);
      const fldMeta = tblMeta?.fields.find((field) => field.fieldName === f.fieldName);
      const isNumeric = fldMeta?.dataType === 'NUMBER';

      const conditionStr = this.buildFilterCondition(
        colRef,
        f,
        isNumeric,
        query.useBindVariables,
        parameters,
        paramCounter
      );

      if (conditionStr) {
        whereConditions.push(conditionStr);
        filtersExplained.push(
          `${fldMeta?.label || f.fieldName} (${colRef}) ${f.filterOperator} ${f.filterValue ?? ''} ${f.filterValue2 ? 'ET ' + f.filterValue2 : ''}`
        );
        if (query.useBindVariables && (f.filterValue || f.filterValue2)) {
          paramCounter += f.filterOperator === 'BETWEEN' ? 2 : 1;
        }
      }
    }

    // B. EFFDT Subqueries (PeopleSoft specific)
    const effdtRules: string[] = [];
    for (const [recName, opt] of Object.entries(query.effdtOptions || {})) {
      if (opt.enabled && involvedTables.includes(recName)) {
        const tblMeta = tablesMap.get(recName);
        if (tblMeta && tblMeta.hasEffdt) {
          const tAlias = aliasMap.get(recName) || recName;
          const subAlias = `${tAlias}_ED`;
          const subSqlName = tblMeta.sqlName;
          const keys = tblMeta.effdtKeys || ['SETID'];

          const keyMatches = keys
            .map((k) => `${subAlias}.${k} = ${tAlias}.${k}`)
            .join('\n        AND ');

          const nowKeyword = query.dialect === 'sqlserver' ? 'GETDATE()' : 'SYSDATE';

          let effdtSubquery = `${tAlias}.EFFDT = (\n      SELECT MAX(${subAlias}.EFFDT)\n      FROM ${subSqlName} ${subAlias}\n      WHERE ${keyMatches}\n        AND ${subAlias}.EFFDT <= ${nowKeyword}\n    )`;

          whereConditions.push(effdtSubquery);
          effdtRules.push(
            `Table ${tblMeta.label} (${recName}) : Retient la dernière date d'effet en vigueur (EFFDT <= ${nowKeyword})`
          );

          if (opt.filterEffStatusActive && tblMeta.hasEffStatus) {
            whereConditions.push(`${tAlias}.EFF_STATUS = 'A'`);
            effdtRules.push(`Table ${tblMeta.label} : Statut d'effet actif uniquement (EFF_STATUS = 'A')`);
          }
        }
      }
    }

    // 8. Build ORDER BY
    const orderByItems: string[] = [];
    const sortsExplained: string[] = [];
    for (const s of query.sorts) {
      const tableAlias = aliasMap.get(s.recordName) || s.recordName;
      orderByItems.push(`${tableAlias}.${s.fieldName} ${s.direction}`);
      const fldMeta = tablesMap.get(s.recordName)?.fields.find((f) => f.fieldName === s.fieldName);
      sortsExplained.push(
        `${fldMeta?.label || s.fieldName} (${tableAlias}.${s.fieldName}) en ordre ${s.direction === 'ASC' ? 'croissant (ASC)' : 'décroissant (DESC)'}`
      );
    }

    // 9. Assemble full SQL query with proper dialect
    let sql = 'SELECT';
    if (query.isDistinct) {
      sql += ' DISTINCT';
    }

    // SQL Server TOP clause
    if (query.dialect === 'sqlserver' && query.rowLimit && query.rowLimit > 0) {
      sql += ` TOP (${query.rowLimit})`;
    }

    sql += '\n' + selectItems.join(',\n');
    sql += '\n' + fromClause;

    if (whereConditions.length > 0) {
      sql += '\nWHERE ' + whereConditions.join('\n  AND ');
    }

    if (orderByItems.length > 0) {
      sql += '\nORDER BY ' + orderByItems.join(', ');
    }

    // Oracle FETCH FIRST clause
    if (query.dialect === 'oracle' && query.rowLimit && query.rowLimit > 0) {
      sql += `\nFETCH FIRST ${query.rowLimit} ROWS ONLY`;
    }

    sql += ';';

    // Summary metadata
    const tablesUsed = involvedTables.map((t) => {
      const meta = tablesMap.get(t);
      const isIntermediate = !visibleFields.some((f) => f.recordName === t) && t !== query.baseTable;
      return {
        recordName: t,
        sqlName: meta?.sqlName || `PS_${t}`,
        label: meta?.label || t,
        alias: aliasMap.get(t) || t,
        isIntermediate,
      };
    });

    return {
      sql,
      parameters,
      explanation: {
        baseTableLabel: baseTableMeta?.label || query.baseTable,
        tablesUsed,
        selectedColumns: selectedColumnsExplained,
        joinsExplained,
        filtersExplained,
        sortsExplained,
        effdtRules,
      },
      errors,
    };
  }

  private buildFilterCondition(
    colRef: string,
    f: SelectedField,
    isNumeric: boolean,
    useBindVariables: boolean,
    params: { index: number; name: string; value: string; field: string }[],
    paramCounter: number
  ): string | null {
    const op = f.filterOperator;
    if (!op) return null;

    if (op === 'IS NULL' || op === 'IS NOT NULL') {
      return `${colRef} ${op}`;
    }

    const val = f.filterValue !== undefined ? f.filterValue.trim() : '';

    if (op === 'BETWEEN') {
      const val2 = f.filterValue2 !== undefined ? f.filterValue2.trim() : '';
      if (useBindVariables) {
        const p1 = `:${paramCounter}`;
        const p2 = `:${paramCounter + 1}`;
        params.push({ index: paramCounter, name: p1, value: val, field: colRef });
        params.push({ index: paramCounter + 1, name: p2, value: val2, field: colRef });
        return `${colRef} BETWEEN ${p1} AND ${p2}`;
      } else {
        const lit1 = isNumeric ? val : `'${val.replace(/'/g, "''")}'`;
        const lit2 = isNumeric ? val2 : `'${val2.replace(/'/g, "''")}'`;
        return `${colRef} BETWEEN ${lit1} AND ${lit2}`;
      }
    }

    if (op === 'IN' || op === 'NOT IN') {
      // Split by commas or newlines
      const rawItems = val.split(/[,\n]/).map((s) => s.trim()).filter((s) => s.length > 0);
      if (rawItems.length === 0) return null;

      if (useBindVariables) {
        const bindRefs: string[] = [];
        let curr = paramCounter;
        for (const item of rawItems) {
          const pName = `:${curr}`;
          bindRefs.push(pName);
          params.push({ index: curr, name: pName, value: item, field: colRef });
          curr++;
        }
        return `${colRef} ${op} (${bindRefs.join(', ')})`;
      } else {
        const literals = rawItems.map((item) => {
          return isNumeric ? item : `'${item.replace(/'/g, "''")}'`;
        });
        return `${colRef} ${op} (${literals.join(', ')})`;
      }
    }

    if (op === 'LIKE') {
      if (useBindVariables) {
        const pName = `:${paramCounter}`;
        params.push({ index: paramCounter, name: pName, value: val, field: colRef });
        return `${colRef} LIKE ${pName}`;
      } else {
        return `${colRef} LIKE '${val.replace(/'/g, "''")}'`;
      }
    }

    // Standard binary operators: =, <>, >, >=, <, <=
    if (useBindVariables) {
      const pName = `:${paramCounter}`;
      params.push({ index: paramCounter, name: pName, value: val, field: colRef });
      return `${colRef} ${op} ${pName}`;
    } else {
      const lit = isNumeric ? val : `'${val.replace(/'/g, "''")}'`;
      return `${colRef} ${op} ${lit}`;
    }
  }
}

export const sqlGenerator = new PeopleSoftSqlGenerator();
