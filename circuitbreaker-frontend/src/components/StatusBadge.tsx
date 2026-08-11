export const StatusBadge = ({ status }: { status: 'UP' | 'DOWN' | 'UNKNOWN' }) => {
  const colors = {
    UP: 'bg-green-100 text-green-800 border-green-200',
    DOWN: 'bg-red-100 text-red-800 border-red-200',
    UNKNOWN: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
      {status}
    </span>
  );
};
