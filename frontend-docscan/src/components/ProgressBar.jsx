export default function ProgressBar({ progress = 0 }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Progreso de extracción</span>
        <span>{progress}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-sky-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
