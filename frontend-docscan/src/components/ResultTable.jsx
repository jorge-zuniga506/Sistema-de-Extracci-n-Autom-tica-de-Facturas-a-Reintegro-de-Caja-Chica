export default function ResultTable({ results = [] }) {
  const hasResults = results.length > 0;

  const getEstado = (item) => {
    if (item.proveedor === 'ERROR') return 'Error';
    if (item.incompleta) return 'Revisar';
    return 'Válido';
  };

  const formatMonto = (item) => {
    const monto = Number(item.monto_crc || item.monto || 0);
    return Number.isNaN(monto) ? '-' : monto.toLocaleString('es-CR');
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Resultados extraídos</h2>
          <p className="text-sm text-slate-500">Revisa el resumen de facturas procesadas y el estado de validación.</p>
        </div>
        <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">{hasResults ? `${results.length} facturas` : 'Sin resultados aún'}</span>
      </div>

      {!hasResults ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Inicia el proceso para cargar los resultados de las facturas y obtener la vista previa.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">Archivo</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Cédula</th>
                <th className="px-4 py-3">Monto CRC</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {results.map((item, index) => (
                <tr key={`${item.archivo_origen || index}-${index}`} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-800">{item.archivo_origen || '-'}</td>
                  <td className="px-4 py-4 text-slate-600">{item.proveedor || '-'}</td>
                  <td className="px-4 py-4 text-slate-600">{item.cedula_fisica_juridica || '-'}</td>
                  <td className="px-4 py-4 text-slate-600">{formatMonto(item)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getEstado(item) === 'Revisar' ? 'bg-amber-100 text-amber-700' : getEstado(item) === 'Error' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {getEstado(item)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{item.notas_revision || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
