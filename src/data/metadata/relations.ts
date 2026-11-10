import { PSRelation } from '../../types/peoplesoft';

export const FSCM_RELATIONS: PSRelation[] = [
  // ==========================================
  // PURCHASING (PO) RELATIONS
  // ==========================================
  {
    id: 'rel_po_line_po_hdr',
    sourceTable: 'PO_LINE',
    targetTable: 'PO_HDR',
    cardinality: 'N-1',
    label: 'Rattachement de la ligne à l’entête de commande d’achat',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'PO_ID', targetField: 'PO_ID' },
    ],
  },
  {
    id: 'rel_po_ship_po_line',
    sourceTable: 'PO_LINE_SHIP',
    targetTable: 'PO_LINE',
    cardinality: 'N-1',
    label: 'Rattachement du programme d’expédition à la ligne de commande',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'PO_ID', targetField: 'PO_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },
  {
    id: 'rel_po_distrib_po_line',
    sourceTable: 'PO_LINE_DISTRIB',
    targetTable: 'PO_LINE',
    cardinality: 'N-1',
    label: 'Ventilation analytique vers la ligne de commande d’achat',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'PO_ID', targetField: 'PO_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },
  {
    id: 'rel_po_hdr_vendor',
    sourceTable: 'PO_HDR',
    targetTable: 'VENDOR',
    cardinality: 'N-1',
    label: 'Fournisseur titulaire de la commande d’achat',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'VENDOR_SETID', targetField: 'SETID' },
      { sourceField: 'VENDOR_ID', targetField: 'VENDOR_ID' },
    ],
  },
  {
    id: 'rel_recv_ln_recv_hdr',
    sourceTable: 'RECV_LN',
    targetTable: 'RECV_HDR',
    cardinality: 'N-1',
    label: 'Rattachement de la ligne au bon de réception',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'RECEIVER_ID', targetField: 'RECEIVER_ID' },
    ],
  },
  {
    id: 'rel_recv_ln_po_line',
    sourceTable: 'RECV_LN',
    targetTable: 'PO_LINE',
    cardinality: 'N-1',
    label: 'Rapprochement de la réception physique avec la ligne de commande',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'PO_ID', targetField: 'PO_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },

  // ==========================================
  // ACCOUNTS PAYABLE (AP) RELATIONS
  // ==========================================
  {
    id: 'rel_voucher_line_voucher',
    sourceTable: 'VOUCHER_LINE',
    targetTable: 'VOUCHER',
    cardinality: 'N-1',
    label: 'Ligne de facture vers entête de facture fournisseur (Voucher)',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'VOUCHER_ID', targetField: 'VOUCHER_ID' },
    ],
  },
  {
    id: 'rel_vchr_acctg_voucher_line',
    sourceTable: 'VCHR_ACCTG_LINE',
    targetTable: 'VOUCHER_LINE',
    cardinality: 'N-1',
    label: 'Imputation comptable vers la ligne de facture fournisseur',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'VOUCHER_ID', targetField: 'VOUCHER_ID' },
      { sourceField: 'VOUCHER_LINE_NUM', targetField: 'VOUCHER_LINE_NUM' },
    ],
  },
  {
    id: 'rel_voucher_vendor',
    sourceTable: 'VOUCHER',
    targetTable: 'VENDOR',
    cardinality: 'N-1',
    label: 'Fournisseur émetteur de la facture',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'VENDOR_SETID', targetField: 'SETID' },
      { sourceField: 'VENDOR_ID', targetField: 'VENDOR_ID' },
    ],
  },
  {
    id: 'rel_voucher_line_po_line',
    sourceTable: 'VOUCHER_LINE',
    targetTable: 'PO_LINE',
    cardinality: 'N-1',
    label: 'Rapprochement 3-voies (Matching) Facture vers Commande d’achat',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'PO_BU', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'PO_ID', targetField: 'PO_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },
  {
    id: 'rel_pymnt_vchr_voucher',
    sourceTable: 'PYMNT_VCHR_XREF',
    targetTable: 'VOUCHER',
    cardinality: 'N-1',
    label: 'Liaison paiement vers la facture fournisseur réglée',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'VOUCHER_ID', targetField: 'VOUCHER_ID' },
    ],
  },
  {
    id: 'rel_pymnt_vchr_payment_tbl',
    sourceTable: 'PYMNT_VCHR_XREF',
    targetTable: 'PAYMENT_TBL',
    cardinality: 'N-1',
    label: 'Liaison facture vers le décaissement bancaire émis',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BANK_SETID', targetField: 'BANK_SETID' },
      { sourceField: 'BANK_CD', targetField: 'BANK_CD' },
      { sourceField: 'BANK_ACCT_KEY', targetField: 'BANK_ACCT_KEY' },
      { sourceField: 'PYMNT_ID_REF', targetField: 'PYMNT_ID_REF' },
    ],
  },
  {
    id: 'rel_vendor_addr_vendor',
    sourceTable: 'VENDOR_ADDR',
    targetTable: 'VENDOR',
    cardinality: 'N-1',
    label: 'Adresse postale vers fiche fournisseur',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'SETID', targetField: 'SETID' },
      { sourceField: 'VENDOR_ID', targetField: 'VENDOR_ID' },
    ],
  },

  // ==========================================
  // EPROCUREMENT (REQ) RELATIONS
  // ==========================================
  {
    id: 'rel_req_line_req_hdr',
    sourceTable: 'REQ_LINE',
    targetTable: 'REQ_HDR',
    cardinality: 'N-1',
    label: 'Ligne de demande d’achat vers son entête',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
    ],
  },
  {
    id: 'rel_req_distrib_req_line',
    sourceTable: 'REQ_LINE_DISTRIB',
    targetTable: 'REQ_LINE',
    cardinality: 'N-1',
    label: 'Imputation vers ligne de demande d’achat',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },
  {
    id: 'rel_po_distrib_req_distrib',
    sourceTable: 'PO_LINE_DISTRIB',
    targetTable: 'REQ_LINE_DISTRIB',
    cardinality: 'N-1',
    label: 'Traçabilité Commande d’achat vers Demande d’achat ePro',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
      { sourceField: 'REQ_LINE_NBR', targetField: 'LINE_NBR' },
      { sourceField: 'REQ_DISTRIB_NBR', targetField: 'DISTRIB_LINE_NUM' },
    ],
  },

  // ==========================================
  // GENERAL LEDGER (GL) RELATIONS
  // ==========================================
  {
    id: 'rel_jrnl_ln_jrnl_hdr',
    sourceTable: 'JRNL_LN',
    targetTable: 'JRNL_HEADER',
    cardinality: 'N-1',
    label: 'Lignes d’écritures vers entête de journal comptable',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'JOURNAL_ID', targetField: 'JOURNAL_ID' },
      { sourceField: 'JOURNAL_DATE', targetField: 'JOURNAL_DATE' },
      { sourceField: 'UNPOST_SEQ', targetField: 'UNPOST_SEQ' },
    ],
  },
  {
    id: 'rel_jrnl_ln_gl_account',
    sourceTable: 'JRNL_LN',
    targetTable: 'GL_ACCOUNT_TBL',
    cardinality: 'N-1',
    label: 'Compte comptable de la ligne de journal vers le plan de comptes',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'ACCOUNT', targetField: 'ACCOUNT' },
    ],
  },
  {
    id: 'rel_jrnl_ln_dept',
    sourceTable: 'JRNL_LN',
    targetTable: 'DEPT_TBL',
    cardinality: 'N-1',
    label: 'Centre de coût de la ligne de journal vers référentiel départements',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'DEPTID', targetField: 'DEPTID' },
    ],
  },
  {
    id: 'rel_ledger_gl_account',
    sourceTable: 'LEDGER',
    targetTable: 'GL_ACCOUNT_TBL',
    cardinality: 'N-1',
    label: 'Soldes du grand livre vers le plan de comptes',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'ACCOUNT', targetField: 'ACCOUNT' },
    ],
  },

  // ==========================================
  // BILLING & ACCOUNTS RECEIVABLE (BI & AR)
  // ==========================================
  {
    id: 'rel_bi_line_bi_hdr',
    sourceTable: 'BI_LINE',
    targetTable: 'BI_HDR',
    cardinality: 'N-1',
    label: 'Ligne de facture client vers l’entête de facturation',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'INVOICE', targetField: 'INVOICE' },
    ],
  },
  {
    id: 'rel_bi_acct_bi_line',
    sourceTable: 'BI_ACCT_ENTRY',
    targetTable: 'BI_LINE',
    cardinality: 'N-1',
    label: 'Écritures comptables vers ligne de facturation client',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'INVOICE', targetField: 'INVOICE' },
      { sourceField: 'LINE_SEQ_NUM', targetField: 'LINE_SEQ_NUM' },
    ],
  },
  {
    id: 'rel_bi_hdr_customer',
    sourceTable: 'BI_HDR',
    targetTable: 'CUSTOMER',
    cardinality: 'N-1',
    label: 'Client facturé vers le référentiel des clients',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BILL_TO_CUST_ID', targetField: 'CUST_ID' },
    ],
  },
  {
    id: 'rel_item_customer',
    sourceTable: 'ITEM',
    targetTable: 'CUSTOMER',
    cardinality: 'N-1',
    label: 'Poste ouvert de créance vers le référentiel des clients',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'CUST_ID', targetField: 'CUST_ID' },
    ],
  },
  {
    id: 'rel_item_activity_item',
    sourceTable: 'ITEM_ACTIVITY',
    targetTable: 'ITEM',
    cardinality: 'N-1',
    label: 'Encaissements et mouvements vers la pièce créance client',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'CUST_ID', targetField: 'CUST_ID' },
      { sourceField: 'ITEM', targetField: 'ITEM' },
      { sourceField: 'ITEM_SEQ_NUM', targetField: 'ITEM_SEQ_NUM' },
    ],
  },

  // ==========================================
  // ASSET MANAGEMENT (AM) RELATIONS
  // ==========================================
  {
    id: 'rel_book_asset',
    sourceTable: 'BOOK',
    targetTable: 'ASSET',
    cardinality: 'N-1',
    label: 'Registre d’amortissement vers la fiche d’immobilisation',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'ASSET_ID', targetField: 'ASSET_ID' },
    ],
  },
  {
    id: 'rel_cost_asset',
    sourceTable: 'COST',
    targetTable: 'ASSET',
    cardinality: 'N-1',
    label: 'Coûts et valeur d’actif vers la fiche d’immobilisation',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'ASSET_ID', targetField: 'ASSET_ID' },
    ],
  },
  {
    id: 'rel_asset_loc_asset',
    sourceTable: 'ASSET_LOCATION',
    targetTable: 'ASSET',
    cardinality: 'N-1',
    label: 'Emplacement physique vers l’immobilisation',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'ASSET_ID', targetField: 'ASSET_ID' },
    ],
  },

  // ==========================================
  // INVENTORY & ORDER MANAGEMENT
  // ==========================================
  {
    id: 'rel_bu_items_master_item',
    sourceTable: 'BU_ITEMS_INV',
    targetTable: 'MASTER_ITEM_TBL',
    cardinality: 'N-1',
    label: 'Stock par magasin vers catalogue article maître',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'INV_ITEM_ID', targetField: 'INV_ITEM_ID' },
    ],
  },
  {
    id: 'rel_in_demand_bu_items',
    sourceTable: 'IN_DEMAND',
    targetTable: 'BU_ITEMS_INV',
    cardinality: 'N-1',
    label: 'Réservation de stock vers le stock en magasin',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'INV_ITEM_ID', targetField: 'INV_ITEM_ID' },
    ],
  },
  {
    id: 'rel_ord_line_ord_hdr',
    sourceTable: 'ORD_LINE',
    targetTable: 'ORD_HEADER',
    cardinality: 'N-1',
    label: 'Ligne de vente vers commande client',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'ORDER_NO', targetField: 'ORDER_NO' },
    ],
  },

  // ==========================================
  // PROJECT COSTING (PC) RELATIONS
  // ==========================================
  {
    id: 'rel_proj_actv_project',
    sourceTable: 'PROJ_ACTIVITY',
    targetTable: 'PROJECT',
    cardinality: 'N-1',
    label: 'Activités vers projet',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'PROJECT_ID', targetField: 'PROJECT_ID' },
    ],
  },
  {
    id: 'rel_proj_resource_proj_actv',
    sourceTable: 'PROJ_RESOURCE',
    targetTable: 'PROJ_ACTIVITY',
    cardinality: 'N-1',
    label: 'Coûts analytiques vers activité de projet',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'PROJECT_ID', targetField: 'PROJECT_ID' },
      { sourceField: 'ACTIVITY_ID', targetField: 'ACTIVITY_ID' },
    ],
  },

  // ==========================================
  // EXPENSES (EX) RELATIONS
  // ==========================================
  {
    id: 'rel_ex_line_ex_hdr',
    sourceTable: 'EX_SHEET_LINE',
    targetTable: 'EX_SHEET_HDR',
    cardinality: 'N-1',
    label: 'Ligne de dépense vers note de frais',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'SHEET_ID', targetField: 'SHEET_ID' },
    ],
  },

  // ==========================================
  // TREASURY & CONTRACTS RELATIONS
  // ==========================================
  {
    id: 'rel_bank_acct_bank_cd',
    sourceTable: 'BANK_ACCT_TBL',
    targetTable: 'BANK_CD_TBL',
    cardinality: 'N-1',
    label: 'Compte bancaire vers établissement bancaire',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'SETID', targetField: 'SETID' },
      { sourceField: 'BANK_CD', targetField: 'BANK_CD' },
    ],
  },
  {
    id: 'rel_ca_detail_ca_hdr',
    sourceTable: 'CA_DETAIL_LINE',
    targetTable: 'CA_CONTR_HDR',
    cardinality: 'N-1',
    label: 'Ligne contractuelle vers contrat commercial',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'CONTRACT_NUM', targetField: 'CONTRACT_NUM' },
    ],
  },
];
