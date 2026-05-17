import { Archive, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-500 text-white shadow-lg">
          <Archive size={28} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">DocScan Finance</p>
          <h1 className="text-3xl font-semibold">Extracción de datos con IA</h1>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-3xl bg-slate-900/80 p-5">
        <p className="max-w-3xl text-slate-300">
          Procesa tus facturas y XMLs desde la carpeta <strong>facturas_pendientes/</strong>. El frontend muestra el avance y los resultados extraídos por el backend.
        </p>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-sky-200">
          <Sparkles size={16} />
          Interfaz rápida con React + Tailwind + Vite
        </div>
      </div>
    </header>
  );
}
