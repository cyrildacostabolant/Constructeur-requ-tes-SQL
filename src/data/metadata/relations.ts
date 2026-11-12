import { PSRelation } from '../../types/peoplesoft';

export const FSCM_RELATIONS: PSRelation[] = [
  // ==========================================
  // COMMANDES D'ACHAT - CDA (PO)
  // ==========================================
  {
    id: 'rel_po_line_po_hdr',
    sourceTable: 'PO_LINE',
    targetTable: 'PO_HDR',
    cardinality: 'N-1',
    label: 'Rattachement de la ligne à l’entête de commande d’achat (CDA)',
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
    label: 'Rattachement de l’expédition à la ligne de commande (CDA)',
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
    label: 'Ventilation analytique vers la ligne de commande (CDA)',
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
    id: 'rel_po_hdr_buyer_user',
    sourceTable: 'PO_HDR',
    targetTable: 'PSOPRDEFN',
    cardinality: 'N-1',
    label: 'Acheteur responsable (BUYER_ID -> OPRID)',
    reliability: 'Standard PeopleTools',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUYER_ID', targetField: 'OPRID' },
    ],
  },
  {
    id: 'rel_po_line_item',
    sourceTable: 'PO_LINE',
    targetTable: 'MASTER_ITEM_TBL',
    cardinality: 'N-1',
    label: 'Article référencé de la ligne de commande',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'INV_ITEM_ID', targetField: 'INV_ITEM_ID' },
    ],
  },
  {
    id: 'rel_po_distrib_req_distrib',
    sourceTable: 'PO_LINE_DISTRIB',
    targetTable: 'REQ_LINE_DISTRIB',
    cardinality: 'N-1',
    label: 'Traçabilité Commande d’achat vers Demande d’achat (REQ)',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
      { sourceField: 'REQ_LINE_NBR', targetField: 'LINE_NBR' },
      { sourceField: 'REQ_DISTRIB_NBR', targetField: 'DISTRIB_LINE_NUM' },
    ],
  },

  // ==========================================
  // RÉCEPTIONS (RECV)
  // ==========================================
  {
    id: 'rel_recv_ln_recv_hdr',
    sourceTable: 'RECV_LN',
    targetTable: 'RECV_HDR',
    cardinality: 'N-1',
    label: 'Ligne de réception vers entête de réception physique',
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
    label: 'Rapprochement Réception physique vers Ligne de commande',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'PO_ID', targetField: 'PO_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },
  {
    id: 'rel_recv_ln_ship_recv_ln',
    sourceTable: 'RECV_LN_SHIP',
    targetTable: 'RECV_LN',
    cardinality: 'N-1',
    label: 'Détail livraison réception vers ligne de réception',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'RECEIVER_ID', targetField: 'RECEIVER_ID' },
      { sourceField: 'RECV_LN_NBR', targetField: 'RECV_LN_NBR' },
    ],
  },
  {
    id: 'rel_recv_ln_distrib_recv_ln',
    sourceTable: 'RECV_LN_DISTRIB',
    targetTable: 'RECV_LN',
    cardinality: 'N-1',
    label: 'Ventilation réception vers ligne de réception',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'RECEIVER_ID', targetField: 'RECEIVER_ID' },
      { sourceField: 'RECV_LN_NBR', targetField: 'RECV_LN_NBR' },
    ],
  },
  {
    id: 'rel_recv_hdr_vendor',
    sourceTable: 'RECV_HDR',
    targetTable: 'VENDOR',
    cardinality: 'N-1',
    label: 'Fournisseur expéditeur de la réception',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'VENDOR_SETID', targetField: 'SETID' },
      { sourceField: 'VENDOR_ID', targetField: 'VENDOR_ID' },
    ],
  },
  {
    id: 'rel_recv_ln_item',
    sourceTable: 'RECV_LN',
    targetTable: 'MASTER_ITEM_TBL',
    cardinality: 'N-1',
    label: 'Article réceptionné vers catalogue maître',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'INV_ITEM_ID', targetField: 'INV_ITEM_ID' },
    ],
  },

  // ==========================================
  // DEMANDES D'ACHAT (REQ)
  // ==========================================
  {
    id: 'rel_req_line_req_hdr',
    sourceTable: 'REQ_LINE',
    targetTable: 'REQ_HDR',
    cardinality: 'N-1',
    label: 'Ligne de demande d’achat vers son entête (REQ)',
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
    label: 'Imputation vers ligne de demande d’achat (REQ)',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },
  {
    id: 'rel_req_ship_req_line',
    sourceTable: 'REQ_LINE_SHIP',
    targetTable: 'REQ_LINE',
    cardinality: 'N-1',
    label: 'Expédition vers ligne de réquisition',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },
  {
    id: 'rel_req_hdr_comment_req_hdr',
    sourceTable: 'REQ_HDR_COMMENT',
    targetTable: 'REQ_HDR',
    cardinality: 'N-1',
    label: 'Commentaires d’entête vers demande d’achat',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
    ],
  },
  {
    id: 'rel_req_line_comment_req_line',
    sourceTable: 'REQ_LINE_COMMENT',
    targetTable: 'REQ_LINE',
    cardinality: 'N-1',
    label: 'Commentaires de ligne vers ligne de réquisition',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },
  {
    id: 'rel_pv_req_status_req_line',
    sourceTable: 'PV_REQ_STATUS',
    targetTable: 'REQ_LINE',
    cardinality: 'N-1',
    label: 'Circuit d’approbation AWE vers ligne de réquisition',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
    ],
  },
  {
    id: 'rel_req_exp_req_distrib',
    sourceTable: 'REQ_LN_DIST_EXP',
    targetTable: 'REQ_LINE_DISTRIB',
    cardinality: 'N-1',
    label: 'Détail engagements vers ventilation réquisition',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'BUSINESS_UNIT', targetField: 'BUSINESS_UNIT' },
      { sourceField: 'REQ_ID', targetField: 'REQ_ID' },
      { sourceField: 'LINE_NBR', targetField: 'LINE_NBR' },
      { sourceField: 'DISTRIB_LINE_NUM', targetField: 'DISTRIB_LINE_NUM' },
    ],
  },
  {
    id: 'rel_req_hdr_user',
    sourceTable: 'REQ_HDR',
    targetTable: 'PSOPRDEFN',
    cardinality: 'N-1',
    label: 'Demandeur / Utilisateur à l’origine (REQUESTOR_ID -> OPRID)',
    reliability: 'Standard PeopleTools',
    isVerified: true,
    joinConditions: [
      { sourceField: 'REQUESTOR_ID', targetField: 'OPRID' },
    ],
  },
  {
    id: 'rel_req_hdr_comment_user',
    sourceTable: 'REQ_HDR_COMMENT',
    targetTable: 'PSOPRDEFN',
    cardinality: 'N-1',
    label: 'Auteur du commentaire d’entête (OPRID)',
    reliability: 'Standard PeopleTools',
    isVerified: true,
    joinConditions: [
      { sourceField: 'OPRID', targetField: 'OPRID' },
    ],
  },
  {
    id: 'rel_req_line_comment_user',
    sourceTable: 'REQ_LINE_COMMENT',
    targetTable: 'PSOPRDEFN',
    cardinality: 'N-1',
    label: 'Auteur du commentaire de ligne (OPRID)',
    reliability: 'Standard PeopleTools',
    isVerified: true,
    joinConditions: [
      { sourceField: 'OPRID', targetField: 'OPRID' },
    ],
  },
  {
    id: 'rel_pv_req_status_user',
    sourceTable: 'PV_REQ_STATUS',
    targetTable: 'PSOPRDEFN',
    cardinality: 'N-1',
    label: 'Approbateur AWE (OPRID)',
    reliability: 'Standard PeopleTools',
    isVerified: true,
    joinConditions: [
      { sourceField: 'OPRID', targetField: 'OPRID' },
    ],
  },
  {
    id: 'rel_req_line_vendor',
    sourceTable: 'REQ_LINE',
    targetTable: 'VENDOR',
    cardinality: 'N-1',
    label: 'Fournisseur suggéré sur la réquisition',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'VENDOR_ID', targetField: 'VENDOR_ID' },
    ],
  },
  {
    id: 'rel_req_line_item',
    sourceTable: 'REQ_LINE',
    targetTable: 'MASTER_ITEM_TBL',
    cardinality: 'N-1',
    label: 'Article du catalogue maître sur la réquisition',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'INV_ITEM_ID', targetField: 'INV_ITEM_ID' },
    ],
  },

  // ==========================================
  // FOURNISSEURS (VENDOR)
  // ==========================================
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
  {
    id: 'rel_vendor_loc_vendor',
    sourceTable: 'VENDOR_LOC',
    targetTable: 'VENDOR',
    cardinality: 'N-1',
    label: 'Site de commande / facturation vers fiche fournisseur',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'SETID', targetField: 'SETID' },
      { sourceField: 'VENDOR_ID', targetField: 'VENDOR_ID' },
    ],
  },

  // ==========================================
  // ARTICLES & CATALOGUE (ITEM)
  // ==========================================
  {
    id: 'rel_inv_items_master_item',
    sourceTable: 'INV_ITEMS',
    targetTable: 'MASTER_ITEM_TBL',
    cardinality: 'N-1',
    label: 'Paramètres inventaire vers catalogue maître article',
    reliability: 'Vérifié - ERD Oracle 9.2',
    isVerified: true,
    joinConditions: [
      { sourceField: 'SETID', targetField: 'SETID' },
      { sourceField: 'INV_ITEM_ID', targetField: 'INV_ITEM_ID' },
    ],
  },
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

  // ==========================================
  // UTILISATEURS (USER - PSOPRDEFN)
  // ==========================================
  {
    id: 'rel_opr_def_fs_psoprdefn',
    sourceTable: 'OPR_DEF_TBL_FS',
    targetTable: 'PSOPRDEFN',
    cardinality: '1-1',
    label: 'Préférences Finance FSCM vers compte utilisateur',
    reliability: 'Standard PeopleTools',
    isVerified: true,
    joinConditions: [
      { sourceField: 'OPRID', targetField: 'OPRID' },
    ],
  },
];
