import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Radio, Sparkles } from 'lucide-react';
import { ZONES } from '../data/mockData';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nodeData: { name: string; zoneId: string; isNewZone: boolean; zoneName?: string }) => Promise<void>;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('Edge Node Delta');
  const [selectedZone, setSelectedZone] = useState('new-zone');
  const [newZoneName, setNewZoneName] = useState('Innovation Quad');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignProgress, setAssignProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setName('Edge Node Delta');
      setSelectedZone('new-zone');
      setIsAssigning(false);
      setAssignProgress(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAssigning) return;

    setIsAssigning(true);
    setAssignProgress(0);

    const startTime = Date.now();
    const duration = 2800;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setAssignProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(async () => {
          await onSubmit({
            name,
            zoneId: selectedZone,
            isNewZone: selectedZone === 'new-zone',
            zoneName: selectedZone === 'new-zone' ? newZoneName : undefined,
          });
          setIsAssigning(false);
          onClose();
        }, 200);
      }
    }, 40);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        className="glass-panel w-full max-w-md p-4 sm:p-6 shadow-2xl relative border border-white/20"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FACC15]/15 border border-[#FACC15]/40 flex items-center justify-center text-[#FACC15]">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">
                ADMIN CONSOLE
              </span>
              <h3 className="text-sm sm:text-base font-bold font-heading text-white">
                Deploy Edge Node
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAssigning}
            className="p-1 rounded-full text-white/40 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAssigning ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-[#C084FC]/20 border-t-[#C084FC]"
              />
              <span className="text-xs font-mono font-bold text-[#FACC15]">
                {assignProgress}%
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold font-heading text-white">
                Assigning partition...
              </h4>
              <p className="text-xs text-white/60 font-mono">
                Reallocating boundary mesh & vector quorum
              </p>
            </div>

            <div className="w-full max-w-xs h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#FACC15] rounded-full shadow-[0_0_8px_#FACC15] transition-all duration-75"
                style={{ width: `${assignProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-white/80 block mb-1">
                Node Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#1F0A2E] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FACC15]"
                placeholder="e.g. Edge Node Delta"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/80 block mb-1">
                Campus Partition / Zone
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-[#1F0A2E] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FACC15]"
              >
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.code} • {z.name}
                  </option>
                ))}
                <option value="new-zone">+ Deploy New Zone D (Innovation Quad)</option>
              </select>
            </div>

            {selectedZone === 'new-zone' && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <label className="text-[11px] font-mono text-[#FACC15] block">
                  New Partition Identifier
                </label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  required
                  className="w-full bg-[#1F0A2E] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FACC15]"
                  placeholder="e.g. Innovation Quad"
                />
                <span className="text-[10px] text-white/50 block">
                  Zone D will spawn on East quad with auto-partitioned assets.
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl badge-yellow-solid text-xs flex items-center gap-1.5 hover:bg-[#FEF08A] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deploy Node</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
