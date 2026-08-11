import { StatusBadge } from './StatusBadge';

interface ServiceStatusCardProps {
  name: string;
  port: string;
  status: 'UP' | 'DOWN' | 'UNKNOWN';
}

export const ServiceStatusCard = ({ name, port, status }: ServiceStatusCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-500">Port: {port}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
};
