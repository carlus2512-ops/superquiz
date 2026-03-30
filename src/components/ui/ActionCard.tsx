import { ReactNode } from 'react';

type ActionCardProps = {
  key?: string | number;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  iconColorClass?: string;
  hoverBorderClass?: string;
};

export function ActionCard({ 
  onClick, 
  icon, 
  title, 
  iconColorClass = "text-cyan-400",
  hoverBorderClass = "hover:border-cyan-400/50"
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-white/5 hover:bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 ${hoverBorderClass} shadow-xl transition-all flex flex-col items-center gap-4 group`}
    >
      <div className={`${iconColorClass} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-xl font-bold">{title}</span>
    </button>
  );
}
