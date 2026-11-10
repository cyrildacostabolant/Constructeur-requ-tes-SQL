import { FunctionalModule, FunctionalModuleId } from '../../types/peoplesoft';

export const FUNCTIONAL_MODULES: Record<FunctionalModuleId, FunctionalModule> = {
  PO: {
    id: 'PO',
    name: 'Achats',
    nameEn: 'Purchasing',
    description: 'Commandes d’achats, réceptions, lignes de livraison et accords-cadres.',
    color: '#0284c7', // sky-600
    iconName: 'ShoppingBag',
  },
  AP: {
    id: 'AP',
    name: 'Comptes Fournisseurs',
    nameEn: 'Accounts Payable',
    description: 'Factures fournisseurs (Vouchers), imputations, échéanciers et règlements.',
    color: '#ea580c', // orange-600
    iconName: 'Receipt',
  },
  GL: {
    id: 'GL',
    name: 'Comptabilité Générale',
    nameEn: 'General Ledger',
    description: 'Journaux comptables, soldes du grand livre, plan de comptes et départements.',
    color: '#16a34a', // green-600
    iconName: 'BookOpen',
  },
  REQ: {
    id: 'REQ',
    name: 'eProcurement & Demandes',
    nameEn: 'eProcurement',
    description: 'Demandes d’achats (Requisitions), lignes et ventilations budgétaires.',
    color: '#8b5cf6', // purple-500
    iconName: 'FileCheck',
  },
  BI: {
    id: 'BI',
    name: 'Facturation Clients',
    nameEn: 'Billing',
    description: 'Factures clients émises, lignes de facturation, taxes et écritures.',
    color: '#059669', // emerald-600
    iconName: 'FileText',
  },
  AR: {
    id: 'AR',
    name: 'Comptes Clients',
    nameEn: 'Accounts Receivable',
    description: 'Postes ouverts clients, encaissements, mouvements et créances.',
    color: '#d97706', // amber-600
    iconName: 'Coins',
  },
  AM: {
    id: 'AM',
    name: 'Gestion des Immobilisations',
    nameEn: 'Asset Management',
    description: 'Fiches d’actifs, livres d’amortissement, coûts d’acquisition et dotations.',
    color: '#6366f1', // indigo-500
    iconName: 'Building2',
  },
  IN: {
    id: 'IN',
    name: 'Gestion des Stocks',
    nameEn: 'Inventory',
    description: 'Articles en stock, inventaires physiques, réservations et mouvements d’entrepôt.',
    color: '#0891b2', // cyan-600
    iconName: 'Boxes',
  },
  OM: {
    id: 'OM',
    name: 'Gestion des Commandes Clients',
    nameEn: 'Order Management',
    description: 'Commandes de vente clients, lignes d’expédition et échéanciers.',
    color: '#f59e0b', // amber-500
    iconName: 'Truck',
  },
  PC: {
    id: 'PC',
    name: 'Gestion des Projets',
    nameEn: 'Project Costing',
    description: 'Projets, activités, ressources engagées et coûts analytiques.',
    color: '#ec4899', // pink-500
    iconName: 'FolderKanban',
  },
  EX: {
    id: 'EX',
    name: 'Notes de Frais',
    nameEn: 'Expenses',
    description: 'Notes de frais des collaborateurs, justificatifs et imputations.',
    color: '#14b8a6', // teal-500
    iconName: 'CreditCard',
  },
  TR: {
    id: 'TR',
    name: 'Trésorerie & Banques',
    nameEn: 'Treasury & Cash Management',
    description: 'Comptes bancaires de l’entreprise, banques et rapprochement bancaire.',
    color: '#3b82f6', // blue-500
    iconName: 'Landmark',
  },
  CA: {
    id: 'CA',
    name: 'Gestion des Contrats',
    nameEn: 'Contracts',
    description: 'Contrats clients/fournisseurs, jalons de facturation et lignes contractuelles.',
    color: '#84cc16', // lime-500
    iconName: 'ScrollText',
  },
  COMMON: {
    id: 'COMMON',
    name: 'Référentiels Communs & PeopleTools',
    nameEn: 'Core & Shared Tables',
    description: 'Unités commerciales (BU), SetID de partage, tables Translate et devises.',
    color: '#94a3b8', // slate-400
    iconName: 'Database',
  },
};
