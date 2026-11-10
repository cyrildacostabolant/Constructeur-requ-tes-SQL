import { Info, RefreshCw, Sparkles } from 'lucide-react';
import React from 'react';
import { PeopleSoftQuery, SqlDialect } from '../types/peoplesoft';

interface HeaderProps {
  query: PeopleSoftQuery;
  dialect: SqlDialect;
  onDialectChange: (dialect: SqlDialect) => void;
  onOpenCoverage: () => void;
  onOpenPresets: () => void;
  onResetQuery: () => void;
  tableCount: number;
  fieldCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  query,
  dialect,
  onDialectChange,
  onOpenCoverage,
  onOpenPresets,
  onResetQuery,
  tableCount,
  fieldCount,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Organization Logo & Brand title */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src="/assets/aistudio/image_039319d1.png"
          alt="Logo eSNCF SOLUTIONS"
          className="h-10 w-auto rounded object-contain bg-[#081836] p-1 border border-blue-900/60 shadow-sm shadow-blue-950/40"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              Constructeur de requêtes PeopleSoft 9.2
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
              FSCM Oracle
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            eSNCF SOLUTIONS · Catalogue intégré · {tableCount} tables vérifiées · {fieldCount} champs référencés
          </p>
        </div>
      </div>

      {/* Zone 2: Query Actions & Navigation links */}
      <div className="hidden lg:flex items-center gap-2">
        <button
          onClick={onOpenPresets}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="Charger un modèle de requête préconfiguré"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Modèles de requêtes
        </button>

        <button
          onClick={onOpenCoverage}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="Consulter le niveau de vérification et la couverture du modèle"
        >
          <Info className="w-3.5 h-3.5 text-sky-400" />
          Couverture & ERD
        </button>

        <button
          onClick={onResetQuery}
          disabled={query.selectedFields.length === 0}
          className="px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
          title="Réinitialiser la requête en cours"
        >
          <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
          Effacer
        </button>
      </div>

      {/* Zone 3: Dialect Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => onDialectChange('oracle')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              dialect === 'oracle'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Oracle (9.2)
          </button>
          <button
            onClick={() => onDialectChange('sqlserver')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              dialect === 'sqlserver'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SQL Server
          </button>
        </div>
      </div>
    </header>
  );
};
