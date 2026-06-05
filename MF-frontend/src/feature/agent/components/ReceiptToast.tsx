// src/feature/agent/components/ReceiptToast.tsx
import { toast } from 'sonner';
import { CheckCircle2, Share2, Printer } from 'lucide-react';
import { formatRupee } from '../../../data/demoData';

interface ReceiptToastProps {
  receiptNo: string;
  customerName: string;
  amount: number;
}

export const showReceiptToast = ({ receiptNo, customerName, amount }: ReceiptToastProps) => {
  toast.custom((t) => (
    <div className="bg-white border border-gray-100 shadow-2xl p-4 rounded-3xl w-full max-w-sm animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">Collection Successful</h4>
          <p className="text-xs text-gray-500">Receipt generated: <span className="font-bold text-primary">{receiptNo}</span></p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-3 mb-4 border border-dashed border-gray-200">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="text-gray-500 font-medium">Customer</span>
          <span className="font-bold text-gray-900">{customerName}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Amount Received</span>
          <span className="font-extrabold text-primary">{formatRupee(amount)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => toast.dismiss(t)}
          className="flex-1 bg-white border border-gray-200 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
        <button className="flex items-center justify-center gap-1.5 bg-gray-900 text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer">
          <Share2 size={14} />
          Share
        </button>
        <button className="flex items-center justify-center gap-1.5 bg-primary text-white py-2 px-4 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer">
          <Printer size={14} />
          Print
        </button>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-center',
  });
};
