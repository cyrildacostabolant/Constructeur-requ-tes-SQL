import { Check, Sparkles, X } from 'lucide-react';
import React from 'react';
import { PRESET_QUERIES, PresetQuery } from '../data/metadata/presets';
import { PeopleSoftQuery } from '../types/peoplesoft';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (query: PeopleSoftQuery) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 text-slate-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Modèles de requêtes PeopleSoft 9.2</h2>
              <p className="text-xs text-slate-400">
                Sélectionnez un cas d'usage métier prêt à l'emploi
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

        <div className="space-y-3">
          {PRESET_QUERIES.map((preset) => (
            <div
              key={preset.id}
              className="p-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer group space-y-2"
              onClick={() => {
                onSelectPreset(preset.query);
                onClose();
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100 group-hover:text-amber-300 text-sm">
                  {preset.title}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Module : {preset.module}
                </span>
              </div>

              <p className="text-xs text-slate-400">{preset.description}</p>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-400">
                <span>
                  Table pivot : <strong className="font-mono text-slate-200">{preset.query.baseTable}</strong> ·{' '}
                  {preset.query.selectedFields.length} champs · {preset.query.joins.length} jointures
                </span>
                <span className="text-amber-400 font-semibold group-hover:underline">
                  Charger ce modèle →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};
