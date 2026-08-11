export const StatusBadge = ({ status }: { status: 'UP' | 'DOWN' | 'UNKNOWN' }) => {
  const colors = {
    UP: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    DOWN: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)] animate-pulse',
    UNKNOWN: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const indicatorColors = {
    UP: 'bg-emerald-500',
    DOWN: 'bg-rose-500',
    UNKNOWN: 'bg-slate-500'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border tracking-wide transition-all ${colors[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${indicatorColors[status]}`}></span>
      {status}
    </span>
  );
};
