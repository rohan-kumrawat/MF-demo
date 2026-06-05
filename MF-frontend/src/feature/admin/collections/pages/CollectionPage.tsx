// src/feature/admin/collections/pages/CollectionPage.tsx
import { useState } from "react";
import { Wallet, CheckCircle, TrendingDown, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  useCollectionData,
  CollectionCard,
  CollectionModal,
} from "@/feature/admin/customers";

const formatRupee = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function CollectionPage() {
  const { data, isLoading } = useCollectionData();
  const [collectOpen, setCollectOpen] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#005eb0]" />
        <p className="text-xs font-bold text-[#717784] uppercase tracking-widest">
          Loading Collections...
        </p>
      </div>
    );
  }

  const {
    collections = [],
    totalDue = 0,
    totalCollected = 0,
    totalPending = 0,
  } = data || {};

  const handleCollectSubmit = (data: any) => {
    console.log("Submitting collection", data);
    setCollectOpen(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2
          className="text-xl font-black text-[#121c28]"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Daily Collections
        </h2>
        <p className="text-xs text-[#717784] font-medium">
          Track and collect payments due today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Due Today"
          value={formatRupee(totalDue)}
          icon={Wallet}
          gradient="gradient-primary"
        />
        <StatCard
          label="Collected"
          value={formatRupee(totalCollected)}
          icon={CheckCircle}
          gradient="gradient-secondary"
        />
        <StatCard
          label="Still Pending"
          value={formatRupee(totalPending)}
          icon={TrendingDown}
          gradient="gradient-card-amber"
        />
      </div>

      {/* Customer cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.length === 0 ? (
          <div className="col-span-full text-center py-20 text-[#717784] bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-ambient">
            No collections due today
          </div>
        ) : (
          collections.map((item: any) => (
            <CollectionCard
              key={item.id}
              item={item}
              onCollect={() => setCollectOpen(item)}
            />
          ))
        )}
      </div>

      {collectOpen && (
        <CollectionModal
          item={collectOpen}
          onClose={() => setCollectOpen(null)}
          onSubmit={handleCollectSubmit}
        />
      )}
    </div>
  );
}
