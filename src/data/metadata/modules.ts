import { FunctionalModule, FunctionalModuleId } from '../../types/peoplesoft';

export const FUNCTIONAL_MODULES: Record<FunctionalModuleId, FunctionalModule> = {
  PO: {
    id: 'PO',
    name: 'Commandes d’achat (CDA)',
    nameEn: 'Purchase Orders',
    description: 'Entêtes (PO_HDR, S1_PO_HDR), lignes, expéditions, ventilations, avenants, frais annexes, taxes EXS, transport, diffusion/EDI, acheteurs (BUYER_TBL) et commentaires.',
    color: '#0284c7', // sky-600
    iconName: 'ShoppingBag',
  },
  REQ: {
    id: 'REQ',
    name: 'Demandes d’achat (REQ)',
    nameEn: 'Requisitions',
    description: 'Entêtes (REQ_HDR), lignes, expéditions, ventilations (REQ_LN_DISTRIB), avenants, commentaires (REQ_COMMENTS), demandeurs (REQUESTOR_TBL) et chargeur.',
    color: '#8b5cf6', // purple-500
    iconName: 'FileCheck',
  },
  RECV: {
    id: 'RECV',
    name: 'Réceptions (REC)',
    nameEn: 'Receiving',
    description: 'Bons de réception physique (RECV_HDR), lignes reçues (RECV_LN), expéditions et ventilations de réception.',
    color: '#059669', // emerald-600
    iconName: 'Truck',
  },
  CNTRCT: {
    id: 'CNTRCT',
    name: 'Contrats (CNTRCT)',
    nameEn: 'Procurement Contracts',
    description: 'Contrats d’achat (CNTRCT_HDR), lignes (CNTRCT_LINE), jalons, imputations, tarifications, styles et libérations.',
    color: '#ec4899', // pink-500
    iconName: 'FileSignature',
  },
  VENDOR: {
    id: 'VENDOR',
    name: 'Fournisseurs (VENDOR)',
    nameEn: 'Suppliers / Vendors',
    description: 'Fiches tiers fournisseurs (VENDOR), adresses postales (VENDOR_ADDR) et sites / coordonnées bancaires (VENDOR_LOC).',
    color: '#ea580c', // orange-600
    iconName: 'Building2',
  },
  ITEM: {
    id: 'ITEM',
    name: 'Articles (ITEM)',
    nameEn: 'Item Master & Inventory',
    description: 'Catalogue articles maîtres (MASTER_ITEM_TBL), articles stockés (INV_ITEMS), stock par magasin (BU_ITEMS_INV) et spécifications d’achat (ITEM_SPEX_PUR).',
    color: '#0891b2', // cyan-600
    iconName: 'Boxes',
  },
  USER: {
    id: 'USER',
    name: 'Utilisateurs (PSOPRDEFN)',
    nameEn: 'PeopleTools Operators',
    description: 'Comptes opérateurs PeopleTools (PSOPRDEFN), acheteurs, demandeurs et préférences utilisateurs (OPR_DEF_TBL_FS).',
    color: '#f59e0b', // amber-500
    iconName: 'Users',
  },
};
