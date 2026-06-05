import { StatusBadge } from "@/components/StatusBadge";

const AVATAR_COLORS = [
  "#001e40",
  "#006c49",
  "#1e4d8c",
  "#7c3aed",
  "#b45309",
  "#0e7490",
];
function getAvatarBg(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const statusBorderMap: Record<string, string> = {
  green: "border-l-[#006c49]",
  yellow: "border-l-[#d97706]",
  orange: "border-l-[#c2410c]",
  red: "border-l-[#ba1a1a]",
};

const formatRupee = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    amount,
  );

export function CollectionCard({
  item,
  onCollect,
}: {
  item: any;
  onCollect: (item: any) => void;
}) {
  const isPaid = item.emiStatus === "green";
  const hasEmi = item.emi !== null && item.emi !== undefined;

  return (
    <div
      className={`bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border-l-4 ${statusBorderMap[item.emiStatus] || "border-l-muted"}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: getAvatarBg(item.customerName) }}
          >
            {item.customerName[0]}
          </div>
          <div>
            <p
              className="text-sm font-bold text-[#121c28]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {item.customerName}
            </p>
            <p className="text-xs text-[#43474f]">
              {item.accountNo} · {item.agent}
            </p>
          </div>
        </div>
        <StatusBadge status={item.emiStatus} label={item.emiLabel} />
      </div>

      {hasEmi && (
        <div className="flex items-center justify-between py-2 border-t border-[#c3c6d1]/15">
          <div>
            <p className="text-xs text-[#43474f]">EMI Due</p>
            <p
              className="text-base font-bold text-[#001e40]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {formatRupee(item.emi)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#43474f]">Collected</p>
            <p
              className={`text-base font-bold ${isPaid ? "text-[#006c49]" : "text-[#43474f]"}`}
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {isPaid ? formatRupee(item.emi) : "₹0"}
            </p>
          </div>

          {!isPaid ? (
            <button
              onClick={() => onCollect(item)}
              className="px-4 py-2 gradient-primary rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Collect
            </button>
          ) : (
            <span className="status-green px-3 py-1 rounded-full text-xs font-semibold">
              ✓ Collected
            </span>
          )}
        </div>
      )}
    </div>
  );
}
