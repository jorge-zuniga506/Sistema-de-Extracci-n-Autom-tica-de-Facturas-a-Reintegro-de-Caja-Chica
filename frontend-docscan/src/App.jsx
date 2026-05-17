import { useState } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle, DownloadCloud } from 'lucide-react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import ResultTable from './components/ResultTable';

function App() {
  const [adelanto, setAdelanto] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('reposo');
  const [message, setMessage] = useState('Completa el monto de adelanto y presiona Iniciar.');
  const [validationError, setValidationError] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [reportName, setReportName] = useState('');
  const [totalProcesados, setTotalProcesados] = useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setValidationError('');
    setReportUrl('');
    setReportName('');

    const monto = Number(adelanto);
    if (adelanto.trim() === '' || Number.isNaN(monto) || monto < 0) {
      setValidationError('Ingresa un monto de adelanto válido y mayor o igual a 0.');
      return;
    }

    setLoading(true);
    setStatus('procesando');
    setProgress(10);
    setMessage('Validando el monto de adelanto...');

    try {
      setTimeout(() => setProgress(25), 100);
      setMessage('Leyendo PDFs y XMLs desde el servidor...');

      const response = await axios.post('http://localhost:3000/api/procesar-reintegro', {
        adelanto: monto,
      });

      if (response?.data) {
        const data = response.data;
        if (data.exito) {
          setResults(data.detalle_datos || []);
          setTotalProcesados(data.total_procesados || 0);
          setReportName(data.reporte_nombre || 'reporte.xlsx');
          setReportUrl(`http://localhost:3000/api/reporte/${encodeURIComponent(data.reporte_nombre || '')}`);
          setStatus('exito');
          setMessage(data.mensaje || 'Proceso completado con éxito.');
          setProgress(100);
          return;
        }

        setStatus('error');
        setError(data.error || data.mensaje || 'El backend respondió con un error.');
        setMessage('Ocurrió un problema durante el procesamiento.');
        setProgress(100);
        return;
      }

      setStatus('error');
      setError('Respuesta inválida desde el servidor.');
      setMessage('No se pudo interpretar la respuesta del backend.');
      setProgress(100);
    } catch (err) {
      setStatus('error');
      const messageError = err.response?.data?.error || err.message || 'Error desconocido en la conexión.';
      setError(messageError);
      setMessage('No se pudo conectar con el backend; revisa la consola o el servidor.');
      setProgress(100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <Header />
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Control de reintegros</h2>
              <p className="mt-3 text-slate-600">Ingresa el adelanto y ejecuta el procesamiento. El frontend mostrará el estado, los datos extraídos y la descarga del reporte.</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Adelanto CRC
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={adelanto}
                    onChange={(event) => setAdelanto(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Ejemplo: 15000"
                  />
                </label>
                {validationError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {validationError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? 'Iniciando...' : 'Iniciar proceso'}
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                </button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Estado actual</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{status === 'reposo' ? 'En reposo' : status === 'procesando' ? 'Procesando' : status}</p>
                    </div>
                    {status === 'procesando' && <Loader2 className="h-5 w-5 animate-spin text-sky-600" />}
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{message}</p>
                </div>

                {error && (
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Error al procesar
                    </div>
                    <p className="mt-2">{error}</p>
                  </div>
                )}

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Total procesados</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900">{totalProcesados}</p>
                    </div>
                    {reportUrl && (
                      <a
                        href={reportUrl}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <DownloadCloud className="h-4 w-4" /> Descargar reporte
                      </a>
                    )}
                  </div>
                  {reportName && <p className="mt-4 text-sm text-slate-600">Archivo generado: <strong>{reportName}</strong></p>}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Progreso visual</h2>
              <p className="mt-3 text-slate-600">Una barra de progreso indica el estado general del procesamiento.</p>
              <div className="mt-6">
                <ProgressBar progress={progress} />
              </div>
              <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Consejo</p>
                <p className="mt-3 text-slate-700">No cierres esta página mientras se genera el reporte. El backend procesa las facturas y envía el resultado por correo automáticamente.</p>
              </div>
            </div>
          </div>

          <ResultTable results={results} />
        </div>
      </div>
    </div>
  );
}

export default App;
