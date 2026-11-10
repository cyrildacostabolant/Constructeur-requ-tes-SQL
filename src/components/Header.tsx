import { Check, Copy, Database, Download, FileCode, FolderOpen, Info, RefreshCw, Save, Sparkles } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { PeopleSoftQuery, SqlDialect } from '../types/peoplesoft';

interface HeaderProps {
  query: PeopleSoftQuery;
  dialect: SqlDialect;
  onDialectChange: (dialect: SqlDialect) => void;
  onOpenCoverage: () => void;
  onOpenPresets: () => void;
  onResetQuery: () => void;
  onImportQuery: (query: PeopleSoftQuery) => void;
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
  onImportQuery,
  tableCount,
  fieldCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(query, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `requete_peoplesoft_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.baseTable && Array.isArray(parsed.selectedFields)) {
          onImportQuery(parsed as PeopleSoftQuery);
        } else {
          alert('Le fichier importé n’est pas une configuration de requête PeopleSoft valide.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier JSON de requête.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Wordmark & Brand title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 text-slate-950 font-bold">
          <Database className="w-5 h-5 text-slate-950" />
        </div>
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
            Catalogue intégré · {tableCount} tables vérifiées · {fieldCount} champs référencés
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
          onClick={handleExportJson}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="Sauvegarder la requête en cours au format JSON"
        >
          {exportSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-slate-400" />}
          Exporter JSON
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="Ouvrir une requête précédemment sauvegardée"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          Importer JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJson}
          className="hidden"
        />

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
          className="px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="Réinitialiser la requête en cours"
        >
          <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
          Effacer
        </button>
      </div>

      {/* Zone 3: Dialect Switcher & Primary target */}
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
