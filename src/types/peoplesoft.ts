export type FunctionalModuleId =
  | 'PO'
  | 'REQ'
  | 'RECV'
  | 'VENDOR'
  | 'ITEM'
  | 'USER';

export interface FunctionalModule {
  id: FunctionalModuleId;
  name: string;
  nameEn: string;
  description: string;
  color: string;
  iconName: string;
}

export type PSDataType = 'VARCHAR2' | 'NUMBER' | 'DATE' | 'CHAR' | 'TIMESTAMP';

export interface PSField {
  fieldName: string;
  label: string;
  dataType: PSDataType;
  length?: number | string;
  isKey: boolean;
  isAltKey?: boolean;
  isRequired?: boolean;
  descr?: string;
}

export interface PSTable {
  recordName: string;
  sqlName: string;
  label: string;
  module: FunctionalModuleId;
  objectType: 'TABLE' | 'VIEW';
  hasEffdt: boolean;
  effdtKeys?: string[];
  hasEffStatus?: boolean;
  isVerified: boolean;
  source: string;
  description: string;
  fields: PSField[];
}

export interface JoinCondition {
  sourceField: string;
  targetField: string;
}

export interface PSRelation {
  id: string;
  sourceTable: string;
  targetTable: string;
  joinConditions: JoinCondition[];
  cardinality: '1-1' | '1-N' | 'N-1' | 'N-N';
  label: string;
  reliability: 'Vérifié - ERD Oracle 9.2' | 'Standard PeopleTools';
  isVerified: boolean;
}

export type SqlDialect = 'oracle' | 'sqlserver';

export type FilterOperator =
  | '='
  | '<>'
  | 'IN'
  | 'NOT IN'
  | 'LIKE'
  | '>'
  | '>='
  | '<'
  | '<='
  | 'BETWEEN'
  | 'IS NULL'
  | 'IS NOT NULL';

export interface SelectedField {
  id: string; // unique selection id
  recordName: string;
  fieldName: string;
  alias: string;
  isVisible: boolean; // Afficher dans le SELECT
  filterOperator?: FilterOperator;
  filterValue?: string;
  filterValue2?: string; // pour BETWEEN
  filterActive: boolean;
  logicalOperator: 'AND' | 'OR';
}

export type JoinType = 'INNER JOIN' | 'LEFT JOIN';

export interface ActiveJoin {
  id: string;
  leftTable: string;
  rightTable: string;
  joinType: JoinType;
  conditions: JoinCondition[];
  isAutoDetected: boolean;
  intermediateFor?: string; // Table name this bridge connects
  userModified?: boolean;
}

export interface QuerySort {
  id: string;
  recordName: string;
  fieldName: string;
  direction: 'ASC' | 'DESC';
}

export interface EffdtOption {
  recordName: string;
  enabled: boolean;
  filterEffStatusActive: boolean;
}

export interface PeopleSoftQuery {
  name: string;
  description?: string;
  baseTable: string;
  selectedFields: SelectedField[];
  joins: ActiveJoin[];
  sorts: QuerySort[];
  isDistinct: boolean;
  rowLimit?: number;
  dialect: SqlDialect;
  useBindVariables: boolean;
  effdtOptions: Record<string, EffdtOption>;
}

export interface QueryValidationError {
  type: 'error' | 'warning';
  title: string;
  message: string;
}

export interface SqlGenerationResult {
  sql: string;
  parameters: { index: number; name: string; value: string; field: string }[];
  explanation: {
    baseTableLabel: string;
    tablesUsed: { recordName: string; sqlName: string; label: string; alias: string; isIntermediate?: boolean }[];
    selectedColumns: { alias: string; fieldName: string; label: string; table: string }[];
    joinsExplained: string[];
    filtersExplained: string[];
    sortsExplained: string[];
    effdtRules: string[];
  };
  errors: QueryValidationError[];
}
