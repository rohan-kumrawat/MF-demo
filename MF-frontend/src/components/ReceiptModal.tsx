import { X, Printer } from 'lucide-react';
import { formatRupee } from '../data/demoData';

interface ReceiptData {
  receiptNo: string;
  date: string;
  from: string;
  accountNo: string;
  amount: number;
  mode: string;
  towards: string;
  balanceAfter: number;
  collector: string;
}

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

export function ReceiptModal({ open, onClose, data }: ReceiptModalProps) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#121c28]/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-ambient-xl w-full max-w-sm mx-4 animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="gradient-primary px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white text-sm font-bold">GK</span>
              </div>
              <span className="text-sm font-semibold opacity-90" style={{ fontFamily: 'Manrope, sans-serif' }}>Guru Kripa Connect</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-lg font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>Payment Receipt</h3>
          <p className="text-xs opacity-70 mt-0.5">Receipt No: {data.receiptNo}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          <ReceiptRow label="Date" value={data.date} />
          <ReceiptRow label="From" value={data.from} />
          <ReceiptRow label="Account No" value={data.accountNo} />
          <ReceiptRow label="Payment Mode" value={data.mode} />
          <ReceiptRow label="Towards" value={data.towards} />
          <div className="border-t border-[#c3c6d1]/30 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#43474f]">Amount Paid</span>
              <span className="text-xl font-bold text-[#001e40]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {formatRupee(data.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-xs text-[#43474f]">Balance After</span>
              <span className="text-sm font-semibold text-[#006c49]">{formatRupee(data.balanceAfter)}</span>
            </div>
          </div>
          <ReceiptRow label="Collected By" value={data.collector} />
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#c3c6d1] rounded-xl text-sm font-semibold text-[#43474f] hover:bg-[#eef4ff] transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 gradient-primary rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-[#43474f]" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>
      <span className="text-sm font-medium text-[#121c28]" style={{ fontFamily: 'Inter, sans-serif' }}>{value}</span>
    </div>
  );
}
