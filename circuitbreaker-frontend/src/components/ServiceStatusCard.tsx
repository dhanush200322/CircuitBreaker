import { StatusBadge, type StatusType } from './StatusBadge';

interface ServiceStatusCardProps {
  name: string;
  port: string;
  status: StatusType;
}

export const ServiceStatusCard = ({ name, port, status }: ServiceStatusCardProps) => {
  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 flex flex-col justify-between gap-3 hover:bg-slate-800 transition-colors shadow-lg shadow-black/20">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-200 text-sm">{name}</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Port: {port}</p>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
};
