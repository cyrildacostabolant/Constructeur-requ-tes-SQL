import { FSCM_RELATIONS } from '../data/metadata/relations';
import { FSCM_TABLES } from '../data/metadata/tables';
import { ActiveJoin, JoinCondition, PSRelation } from '../types/peoplesoft';

export interface GraphEdge {
  relation: PSRelation;
  targetTable: string;
  sourceTable: string;
  isReverse: boolean; // if true, join conditions flip
}

export interface GraphPath {
  tables: string[];
  edges: GraphEdge[];
  length: number;
}

export class PeopleSoftGraphEngine {
  private adjacencyList: Map<string, GraphEdge[]> = new Map();

  constructor() {
    this.buildGraph();
  }

  private buildGraph() {
    // Register all tables
    for (const table of FSCM_TABLES) {
      if (!this.adjacencyList.has(table.recordName)) {
        this.adjacencyList.set(table.recordName, []);
      }
    }

    // Build undirected edges
    for (const rel of FSCM_RELATIONS) {
      const src = rel.sourceTable;
      const tgt = rel.targetTable;

      if (!this.adjacencyList.has(src)) this.adjacencyList.set(src, []);
      if (!this.adjacencyList.has(tgt)) this.adjacencyList.set(tgt, []);

      // Forward edge: src -> tgt
      this.adjacencyList.get(src)!.push({
        relation: rel,
        sourceTable: src,
        targetTable: tgt,
        isReverse: false,
      });

      // Backward edge: tgt -> src
      this.adjacencyList.get(tgt)!.push({
        relation: rel,
        sourceTable: tgt,
        targetTable: src,
        isReverse: true,
      });
    }
  }

  /**
   * Find shortest path between two tables using BFS
   */
  public findShortestPath(startTable: string, endTable: string): GraphPath | null {
    if (startTable === endTable) {
      return { tables: [startTable], edges: [], length: 0 };
    }

    const queue: { current: string; path: string[]; edges: GraphEdge[] }[] = [
      { current: startTable, path: [startTable], edges: [] },
    ];
    const visited = new Set<string>([startTable]);

    while (queue.length > 0) {
      const { current, path, edges } = queue.shift()!;

      const neighbors = this.adjacencyList.get(current) || [];
      for (const edge of neighbors) {
        const nextTable = edge.targetTable;

        if (nextTable === endTable) {
          return {
            tables: [...path, nextTable],
            edges: [...edges, edge],
            length: edges.length + 1,
          };
        }

        if (!visited.has(nextTable)) {
          visited.add(nextTable);
          queue.push({
            current: nextTable,
            path: [...path, nextTable],
            edges: [...edges, edge],
          });
        }
      }
    }

    return null;
  }

  /**
   * Find all alternative paths between two tables up to a max depth
   */
  public findAllPaths(startTable: string, endTable: string, maxDepth = 4): GraphPath[] {
    const results: GraphPath[] = [];

    const dfs = (current: string, visited: Set<string>, path: string[], edges: GraphEdge[]) => {
      if (current === endTable) {
        results.push({ tables: [...path], edges: [...edges], length: edges.length });
        return;
      }
      if (edges.length >= maxDepth) return;

      const neighbors = this.adjacencyList.get(current) || [];
      for (const edge of neighbors) {
        const next = edge.targetTable;
        if (!visited.has(next)) {
          visited.add(next);
          dfs(next, visited, [...path, next], [...edges, edge]);
          visited.delete(next);
        }
      }
    };

    dfs(startTable, new Set([startTable]), [startTable], []);
    // Sort shortest first
    return results.sort((a, b) => a.length - b.length);
  }

  /**
   * Automatically resolve joins for a set of target tables starting from baseTable
   */
  public resolveJoinsForTables(
    baseTable: string,
    targetTables: string[]
  ): {
    joins: ActiveJoin[];
    intermediateTables: { table: string; reason: string }[];
    unconnectedTables: string[];
    allConnectedTables: string[];
  } {
    const uniqueTargets = Array.from(new Set(targetTables.filter((t) => t !== baseTable)));
    if (uniqueTargets.length === 0) {
      return {
        joins: [],
        intermediateTables: [],
        unconnectedTables: [],
        allConnectedTables: [baseTable],
      };
    }

    const connectedTables = new Set<string>([baseTable]);
    const joins: ActiveJoin[] = [];
    const intermediateTablesMap = new Map<string, string>(); // intermediateTable -> reason
    const unconnectedTables: string[] = [];

    // For each target table, if not already in connectedTables, find shortest path from any connected table
    for (const target of uniqueTargets) {
      if (connectedTables.has(target)) continue;

      let shortestPath: GraphPath | null = null;
      let bestFromTable: string | null = null;

      // Find the best connection from ANY currently connected table to target
      for (const from of connectedTables) {
        const path = this.findShortestPath(from, target);
        if (path) {
          if (!shortestPath || path.length < shortestPath.length) {
            shortestPath = path;
            bestFromTable = from;
          }
        }
      }

      if (!shortestPath || !bestFromTable) {
        unconnectedTables.push(target);
        continue;
      }

      // Add each step in the path as a join
      let curr = bestFromTable;
      for (let i = 0; i < shortestPath.edges.length; i++) {
        const edge = shortestPath.edges[i];
        const next = edge.targetTable;

        if (!connectedTables.has(next)) {
          // If next is not in uniqueTargets and not baseTable, it's an intermediate bridge table!
          const isIntermediate = !uniqueTargets.includes(next) && next !== baseTable;
          if (isIntermediate) {
            intermediateTablesMap.set(
              next,
              `Table intermédiaire ajoutée pour relier ${baseTable} à ${target}`
            );
          }

          // Build join conditions with proper direction
          const conditions: JoinCondition[] = edge.isReverse
            ? edge.relation.joinConditions.map((c) => ({
                sourceField: c.targetField,
                targetField: c.sourceField,
              }))
            : edge.relation.joinConditions.map((c) => ({
                sourceField: c.sourceField,
                targetField: c.targetField,
              }));

          joins.push({
            id: `join_${curr}_${next}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            leftTable: curr,
            rightTable: next,
            joinType: 'INNER JOIN',
            conditions,
            isAutoDetected: true,
            intermediateFor: isIntermediate ? target : undefined,
          });

          connectedTables.add(next);
        }
        curr = next;
      }
    }

    const intermediateTables = Array.from(intermediateTablesMap.entries()).map(
      ([table, reason]) => ({ table, reason })
    );

    return {
      joins,
      intermediateTables,
      unconnectedTables,
      allConnectedTables: Array.from(connectedTables),
    };
  }

  /**
   * Generates short, human-friendly, collision-free SQL aliases for tables
   */
  public generateTableAliases(tableNames: string[]): Map<string, string> {
    const aliasMap = new Map<string, string>();
    const usedAliases = new Set<string>();

    // Preferred semantic abbreviations
    const semanticRules: Record<string, string> = {
      PO_HDR: 'PO_HDR',
      S1_PO_HDR: 'S1_PO_HDR',
      PO_CHNG_ORD: 'PO_CORD',
      PO_CHNG_HDR: 'PO_CHDR',
      PO_HDR_MISC: 'PO_HMIS',
      PO_COMMENTS: 'PO_COM',
      PO_LINE: 'PO_LN',
      PO_LN_MSC_DTL: 'PO_LMSD',
      PO_LINE_MISC: 'PO_LMIS',
      PO_CHNG_LINE: 'PO_CLN',
      PO_LINE_SHIP: 'PO_SHP',
      PO_LN_SHIP_MTCH: 'PO_SMTC',
      PO_CHNG_SHIP: 'PO_CSHP',
      PO_LN_SHIP_MISC: 'PO_SMIS',
      PO_VAL_ADJ: 'PO_VADJ',
      PO_ADDR_TBL: 'PO_ADR',
      PO_LINE_DISTRIB: 'PO_DST',
      PO_LINE_DIST_NP: 'PO_DNP',
      PO_LN_DIST_EXS: 'PO_DEXS',
      PO_DFLT_TBL: 'PO_DFLT',
      PO_DFLT_DISTRIB: 'PO_DDST',
      PO_EST_SHIP: 'PO_EST',
      PO_FRT_CHRG: 'PO_FRT',
      PO_FRT_SET: 'PO_FRTS',
      PO_DISPATCHED: 'PO_DISP',
      PO_EMAIL_QUEUE: 'PO_EMLQ',
      PO_HDR_OUT_EC: 'PO_ECHO',
      PO_LINE_OUT_EC: 'PO_ECLO',
      PO_SHIP_OUT_EC: 'PO_ECSO',
      BUYER_TBL: 'BUYER',
      COMMENTS_TBL: 'CMMT',
      STD_COMM_TBL_PO: 'STD_COM',
      RFQ_COMMENTS: 'RFQ_COM',
      RECV_HDR: 'RCV_HDR',
      RECV_LN: 'RCV_LN',
      RECV_LN_SHIP: 'RCV_SHP',
      RECV_LN_DISTRIB: 'RCV_DST',
      PSOPRDEFN: 'OPR',
      OPR_DEF_TBL_FS: 'OPR_FS',
      INV_ITEMS: 'INV_ITM',
      ITEM_SPEX_PUR: 'ITM_SPX',
      VOUCHER: 'VCHR',
      VOUCHER_LINE: 'VCHR_LN',
      VCHR_ACCTG_LINE: 'VCHR_ACC',
      PYMNT_VCHR_XREF: 'PYMNT_XREF',
      PAYMENT_TBL: 'PYMNT',
      VENDOR: 'VNDR',
      VENDOR_ADDR: 'VNDR_ADR',
      VENDOR_LOC: 'VNDR_LOC',
      JRNL_HEADER: 'JRNL_HDR',
      JRNL_LN: 'JRNL_LN',
      LEDGER: 'LEDGER',
      GL_ACCOUNT_TBL: 'GL_ACCT',
      DEPT_TBL: 'DEPT',
      REQ_HDR: 'REQ_HDR',
      REQ_DFLT_TBL: 'REQ_DFLT',
      REQ_DFLT_DISTRIB: 'REQ_DDST',
      REQ_CHNG_HDR: 'REQ_CHDR',
      REQ_CHNG_ORD: 'REQ_CORD',
      REQ_ACTIVITY: 'REQ_ACTV',
      REQ_COMMENTS: 'REQ_COM',
      REQUESTOR_TBL: 'RQSTR',
      REQUESTOR_ITEMS: 'RQST_ITM',
      REQUESTOR_CAT: 'RQST_CAT',
      REQ_LOADER_DFL: 'REQ_LDFL',
      PO_REQLOAD_RQST: 'REQ_LOAD',
      REQ_LINE: 'REQ_LN',
      REQ_CHNG_LINE: 'REQ_CLN',
      REQ_LINE_SHIP: 'REQ_SHP',
      REQ_CHNG_SHIP: 'REQ_CSHP',
      REQ_VAL_ADJ: 'REQ_VADJ',
      REQ_LN_DISTRIB: 'REQ_DST',
      BI_HDR: 'BI_HDR',
      BI_LINE: 'BI_LN',
      BI_ACCT_ENTRY: 'BI_ACC',
      ITEM: 'AR_ITEM',
      ITEM_ACTIVITY: 'AR_ACTV',
      CUSTOMER: 'CUST',
      ASSET: 'ASSET',
      BOOK: 'BOOK',
      COST: 'COST',
      ASSET_LOCATION: 'ASSET_LOC',
      MASTER_ITEM_TBL: 'ITEM_MSTR',
      BU_ITEMS_INV: 'INV_STOCK',
      IN_DEMAND: 'INV_DEMAND',
      ORD_HEADER: 'ORD_HDR',
      ORD_LINE: 'ORD_LN',
      PROJECT: 'PROJ',
      PROJ_ACTIVITY: 'PROJ_ACTV',
      PROJ_RESOURCE: 'PROJ_RES',
      EX_SHEET_HDR: 'EX_HDR',
      EX_SHEET_LINE: 'EX_LN',
      BANK_CD_TBL: 'BANK',
      BANK_ACCT_TBL: 'BANK_ACC',
      CNTRCT_HDR: 'CTR_HDR',
      CNTRCT_LINE: 'CTR_LN',
      CNTRCT_BU_DSTRB: 'CTR_BU',
      CNTRCT_DSTRB: 'CTR_DST',
      CNTRCT_LN_SHIP: 'CTR_SHP',
      CNTRCT_MILESTN: 'CTR_MIL',
      CNTRCT_CATEGORY: 'CTR_CAT',
      CNTRCT_CAT_EXC: 'CTR_EXC',
      CNTRCT_CAT_RLS: 'CTR_CRLS',
      CNTRCT_HDR_RLS: 'CTR_HRLS',
      CNTRCT_LN_RLS: 'CTR_LRLS',
      CNTRCT_LINE_UOM: 'CTR_UOM',
      CNTRCT_ADJ_SET: 'CTR_ADJS',
      CNTRCT_ADJ_RULE: 'CTR_ADJR',
      CNTRCT_ADJ_DTL: 'CTR_ADJD',
      CNTRCT_HDR_MISC: 'CTR_HMIS',
      CNTRCT_LN_MISC: 'CTR_LMIS',
      CNTRCT_ACTIVITY: 'CTR_ACT',
      CNTRCT_COMMENTS: 'CTR_COM',
      CNTRCT_DEFAULTS: 'CTR_DFLT',
      CNTRCT_MSTR: 'CTR_MSTR',
      CNTRCT_RELTN: 'CTR_REL',
      CNTRCT_STYLE: 'CTR_STY',
      CNTRCT_STYLE_DT: 'CTR_STYD',
      CNTRCT_CONTROL: 'CTR_CTRL',
      CNTRCT_DISPATCH: 'CTR_DISP',
      CNTRCT_EMAIL_QU: 'CTR_MAIL',
      BUS_UNIT_TBL_FS: 'BU_FS',
      PSXLATITEM: 'XLAT',
    };

    // Assign aliases
    for (const table of tableNames) {
      let base = semanticRules[table];
      if (!base) {
        // Fallback: initials or first 4 chars
        base = table.length <= 4 ? table : table.substring(0, 4);
      }

      let candidate = base;
      let counter = 1;
      while (usedAliases.has(candidate)) {
        counter++;
        candidate = `${base}_${counter}`;
      }

      usedAliases.add(candidate);
      aliasMap.set(table, candidate);
    }

    return aliasMap;
  }
}

export const graphEngine = new PeopleSoftGraphEngine();
