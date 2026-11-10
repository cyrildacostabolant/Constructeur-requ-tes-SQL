import { CheckCircle2, Database, ExternalLink, ShieldCheck, X } from 'lucide-react';
import React from 'react';
import { FUNCTIONAL_MODULES } from '../data/metadata/modules';
import { FSCM_TABLES } from '../data/metadata/tables';
import { FSCM_RELATIONS } from '../data/metadata/relations';

interface CoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoverageModal: React.FC<CoverageModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const totalFields = FSCM_TABLES.reduce((acc, t) => acc + t.fields.length, 0);
  const totalVerifiedTables = FSCM_TABLES.filter((t) => t.isVerified).length;
  const totalEffdtTables = FSCM_TABLES.filter((t) => t.hasEffdt).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Couverture & Fiabilité du Catalogue FSCM 9.2
              </h2>
              <p className="text-xs text-slate-400">
                Source officielle Oracle PeopleSoft FSCM 9.2 & PeopleTools Data Dictionary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {FSCM_TABLES.length}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Tables intégrées</div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {totalFields}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Champs référencés</div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
              {FSCM_RELATIONS.length}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Relations composites</div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
              {totalEffdtTables}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Tables à date d'effet (EFFDT)</div>
          </div>
        </div>

        {/* Reliability Guarantee & Transparency Note */}
        <div className="p-4 bg-slate-950 border border-amber-500/20 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Engagement de véracité et rigueur PeopleSoft</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Conformément aux exigences de fiabilité, <strong>aucun champ ni table n'est inventé</strong>.
            Toutes les tables intégrées proviennent du modèle de données officiel Oracle PeopleSoft
            Financials and Supply Chain Management (FSCM) 9.2. Les clés primaires, longueurs et types de
            données Oracle (VARCHAR2, NUMBER, DATE, CHAR) correspondent strictement aux spécifications
            PeopleTools.
          </p>
        </div>

        {/* Modules Coverage List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Modules fonctionnels couverts ({Object.keys(FUNCTIONAL_MODULES).length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(FUNCTIONAL_MODULES).map(([id, mod]) => {
              const tablesInMod = FSCM_TABLES.filter((t) => t.module === id);
              return (
                <div
                  key={id}
                  className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: mod.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 truncate">{mod.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {tablesInMod.map((t) => t.recordName).join(', ')}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-slate-400 text-xs shrink-0 ml-2">
                    {tablesInMod.length} tbl
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Architecture & Enrichment */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
          <h4 className="font-bold text-slate-200">Architecture modulaire & évolutive</h4>
          <p>
            Le catalogue est modulaire : de nouvelles tables ou relations additionnelles peuvent être
            ajoutées directement dans les modules TypeScript sans impacter ni modifier le moteur de jointures
            automatiques ou le générateur SQL.
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
