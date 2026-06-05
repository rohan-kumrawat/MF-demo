// src/feature/agent/components/HistoryRow.tsx
import React from 'react';
import { Calendar, Wallet, CheckCircle2 } from 'lucide-react';
import { type  CollectionRecord } from '../types';
import { formatRupee } from '../../../data/demoData';
import { cn } from '../../../lib/utils';

interface Props {
  record: CollectionRecord;
}

export const HistoryRow = React.memo(function HistoryRow({ record }: Props) {
  const modeColors = {
    'Cash': 'text-amber-600 bg-amber-50',
    'UPI': 'text-blue-600 bg-blue-50',
    'Cheque': 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-primary/20 transition-all group">
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", modeColors[record.mode])}>
        <Wallet size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h4 className="font-bold text-gray-900 truncate">{record.customerName}</h4>
          <span className="font-extrabold text-primary">{formatRupee(record.amount)}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-3 text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {record.date}
            </span>
            <span className="font-bold uppercase tracking-widest">{record.receiptNo}</span>
          </div>
          {record.usedDiary && (
            <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter flex items-center gap-0.5">
              <CheckCircle2 size={8} /> Diary
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
