import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Lock,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Bug,
} from 'lucide-react';

export const AuditDrawer: React.FC = () => {
  const {
    role,
    auditLog,
    verifyAuditChain,
    simulateTampering,
    restoreTampering,
    isTampered,
    exportAuditCsv,
  } = useStore();

  const isStaff = role === 'Staff';

  const [searchTerm, setSearchTerm] = useState('');
  const [nodeFilter, setNodeFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    valid: boolean;
    reason?: string;
  } | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 400));
    const res = verifyAuditChain();
    setVerificationResult({ tested: true, ...res });
    setIsVerifying(false);
  };

  const filteredLogs = auditLog.filter((item) => {
    if (nodeFilter !== 'ALL' && item.nodeId !== nodeFilter && item.nodeOrigin !== nodeFilter) {
      return false;
    }
    if (actionFilter !== 'ALL' && item.action !== actionFilter) {
      return false;
    }
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const match =
        item.resourceId.toLowerCase().includes(q) ||
        (item.resourceName && item.resourceName.toLowerCase().includes(q)) ||
        item.user.toLowerCase().includes(q) ||
        item.hash.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExport = () => {
    exportAuditCsv(filteredLogs);
  };

  if (isStaff) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FACC15]">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold font-heading text-white">
          Auditors Only
        </h3>
        <p className="text-xs text-white/60 max-w-xs leading-relaxed">
          Cryptographic ledger access is restricted to compliance auditors and system administrators.
          Switch role to <span className="text-[#FACC15] font-semibold">Auditor</span> or{' '}
          <span className="text-[#DEC7E7] font-semibold">Admin</span> in the top-right switcher to inspect the tamper-evident log.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-3">
      <div className="space-y-2.5 pb-2.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Filter by hash, resource, or actor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#FACC15] font-sans"
            />
          </div>

          <button
            onClick={handleExport}
            title="Export CSV audit trail"
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <select
              value={nodeFilter}
              onChange={(e) => setNodeFilter(e.target.value)}
              className="bg-[#1F0A2E] border border-white/15 text-white text-[10px] font-mono rounded-lg px-2 py-1 focus:outline-none focus:border-[#FACC15]"
            >
              <option value="ALL">All Nodes</option>
              <option value="EDGE A">Edge A</option>
              <option value="EDGE B">Edge B</option>
              <option value="EDGE C">Edge C</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#1F0A2E] border border-white/15 text-white text-[10px] font-mono rounded-lg px-2 py-1 focus:outline-none focus:border-[#FACC15]"
            >
              <option value="ALL">All Actions</option>
              <option value="UPDATE">UPDATE</option>
              <option value="INSERT">INSERT</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-2.5 py-1 rounded-xl badge-yellow-solid text-[10px] font-mono flex items-center gap-1 hover:bg-[#FEF08A] transition-colors cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{isVerifying ? 'Verifying...' : 'Verify Chain'}</span>
            </button>

            {isTampered ? (
              <button
                onClick={restoreTampering}
                className="px-2 py-1 rounded-xl bg-[#C084FC]/20 hover:bg-[#C084FC]/30 border border-[#C084FC]/50 text-[#DEC7E7] text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restore</span>
              </button>
            ) : (
              <button
                onClick={simulateTampering}
                className="px-2 py-1 rounded-xl bg-[#F43F5E]/20 hover:bg-[#F43F5E]/30 border border-[#F43F5E]/40 text-[#F43F5E] text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Bug className="w-3 h-3" />
                <span>Tamper</span>
              </button>
            )}
          </div>
        </div>

        {verificationResult?.tested && (
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-mono ${
              verificationResult.valid
                ? 'bg-[#C084FC]/10 border-[#C084FC]/40 text-[#DEC7E7]'
                : 'bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]'
            }`}
          >
            {verificationResult.valid ? (
              <>
                <ShieldCheck className="w-4 h-4 text-[#FACC15] shrink-0" />
                <span>Cryptographic proof intact. SHA-256 chain is valid.</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-[#F43F5E] shrink-0" />
                <span>{verificationResult.reason || 'Hash mismatch: ledger corrupted!'}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-xs font-mono">
            No audit records matching filter criteria.
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const isUpdate = entry.action === 'UPDATE';
            return (
              <div
                key={entry.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isTampered && entry.id === 'LOG-004'
                    ? 'bg-[#F43F5E]/10 border-[#F43F5E]/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-white/[0.03] border-white/8 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono pb-1.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold badge-yellow px-1.5 py-0.5 rounded text-[10px]">
                      {entry.id}
                    </span>
                    <span className="text-white/80">{entry.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] text-[#DEC7E7]">
                      {entry.nodeOrigin || entry.nodeId}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isUpdate
                          ? 'bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40'
                          : 'bg-[#C084FC]/20 text-[#DEC7E7] border border-[#C084FC]/40'
                      }`}
                    >
                      {entry.action}
                    </span>
                    {!entry.synced && (
                      <span className="px-1.5 py-0.5 rounded bg-[#FACC15]/20 text-[#FACC15] text-[9px] font-bold animate-pulse">
                        QUEUED
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-2 text-xs">
                  <div className="flex items-center justify-between text-white/90 font-medium">
                    <span className="truncate">{entry.resourceName || entry.resourceId}</span>
                    <span className="text-[10px] text-white/50 font-mono shrink-0 ml-2">
                      by {entry.user || entry.performedBy}
                    </span>
                  </div>

                  {entry.oldValue && entry.newValue && (
                    <div className="mt-1 flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-white/40 line-through">{entry.oldValue}</span>
                      <span className="text-white/30">→</span>
                      <span className="text-[#FACC15] font-semibold">{entry.newValue}</span>
                    </div>
                  )}
                </div>

                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/40">
                  <div className="flex items-center gap-1 truncate max-w-[220px]">
                    <span className="text-white/20">SHA:</span>
                    <span className="text-white/60 truncate">{entry.hash}</span>
                  </div>

                  <button
                    onClick={() => handleCopyHash(entry.hash)}
                    className="flex items-center gap-1 text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedHash === entry.hash ? (
                      <Check className="w-2.5 h-2.5 text-[#FACC15]" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                    <span>{copiedHash === entry.hash ? 'Copied' : 'Hash'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
