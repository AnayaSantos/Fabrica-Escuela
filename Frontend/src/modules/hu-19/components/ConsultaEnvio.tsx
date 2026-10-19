import { useState } from 'react';
import { 
  Search, 
  CloudOff, 
  Sun, 
  Map, 
  CloudRain, 
  Construction, 
  CloudLightning, 
  MinusCircle 
} from 'lucide-react';

type ShipmentStatus = 'on_time' | 'early' | 'delayed_1_day' | 'delayed_2_days' | 'api_error' | null;

export function ConsultaEnvio() {
  const [trackingNumber, setTrackingNumber] = useState('LG-2026-00000001');
  const [status, setStatus] = useState<ShipmentStatus>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
    if (!status) setStatus('on_time');
  };

  const renderStatusCard = () => {
    if (!status) return null;

    switch (status) {
      case 'on_time':
        return (
          <div className="mt-4 border-2 border-black rounded-xl py-6 px-4 bg-white w-full max-w-md mx-auto text-center shadow-sm">
            <p className="text-black text-sm font-medium">El envío avanza según lo programado</p>
          </div>
        );

      case 'early':
        return (
          <div className="mt-4 border-2 border-green-500 rounded-xl p-4 bg-[#7cfc00] w-full max-w-md mx-auto text-left shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Sun className="w-5 h-5 text-black" />
              <Map className="w-5 h-5 text-black" />
              <p className="text-black font-semibold text-sm">¡Buenas noticias! Tú envío llegará antes.</p>
            </div>
            <p className="text-black text-sm leading-snug">
              Llegará 1 dia antes de lo estimado debido a un buen clima y ruta despejada.
            </p>
          </div>
        );

      case 'delayed_1_day':
        return (
          <div className="mt-4 border-2 border-[#ff7f50] rounded-xl p-4 bg-[#ffb38a] w-full max-w-md mx-auto text-left shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <CloudRain className="w-5 h-5 text-gray-700" />
              <Construction className="w-5 h-5 text-yellow-600" />
              <p className="text-black font-semibold text-sm">Posible retraso en la ruta.</p>
            </div>
            <p className="text-black text-sm leading-snug">
              Estimamos 1 dia de retraso debido al mal clima y congestión en la vía.
            </p>
          </div>
        );

      case 'delayed_2_days':
        return (
          <div className="mt-4 border-2 border-red-600 rounded-xl p-4 bg-[#ff8a8a] w-full max-w-md mx-auto text-left shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <CloudLightning className="w-5 h-5 text-white fill-white stroke-black" />
              <MinusCircle className="w-5 h-5 text-red-600 fill-white" />
              <p className="text-black font-semibold text-sm">Retraso significativo.</p>
            </div>
            <p className="text-black text-sm leading-snug">
              El envío presenta 2 o más días de retraso por tormentas fuertes y cierre total de la vía.
            </p>
          </div>
        );

      case 'api_error':
        return (
          <div className="mt-4 border-2 border-black rounded-xl p-6 bg-[#b3b3b3] w-full max-w-md mx-auto text-center shadow-sm flex flex-col items-center justify-center">
            <CloudOff className="w-10 h-10 text-black mb-3" />
            <p className="text-black text-sm font-medium leading-snug">
              No pudimos obtener los datos del<br />
              clima y ruta en este momento.<br />
              Intenta nuevamente más tarde.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-16 px-4 font-sans">
      
      <h1 className="text-4xl md:text-5xl font-normal text-black mb-1 text-center">
        Consultar envío
      </h1>
      <p className="text-black text-lg mb-4 text-center">Ingrese el No.de guía</p>

      <div className="relative w-full max-w-[260px] mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-600" />
        </div>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="block w-full pl-9 pr-3 py-1 border-2 border-black rounded-full bg-gray-200 text-black placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-black text-sm"
          placeholder="LG-2026-00000001"
        />
      </div>

      <button
        onClick={handleSearch}
        className="px-8 py-1 bg-[#8b8b9a] text-black text-sm font-medium rounded-full border-2 border-black hover:bg-gray-400 transition-colors"
      >
        Consultar
      </button>

      {hasSearched && (
        <div className="mt-6 text-center w-full">
          <p className="text-[#32cd32] text-sm mb-2">
            No. de guía encontrado con éxito
          </p>
          {renderStatusCard()}
        </div>
      )}

      {/* Simulador de Estados para pruebas para el equipo de backend */}
      <div className="mt-20 p-4 border-t-2 border-dashed border-gray-300 w-full max-w-2xl flex flex-col items-center bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">
          Simulador de Estados (HU-019)
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => { setStatus('on_time'); setHasSearched(true); }} className="px-3 py-1 bg-white border border-gray-400 rounded text-xs hover:bg-gray-100">CA-19-A (A tiempo)</button>
          <button onClick={() => { setStatus('early'); setHasSearched(true); }} className="px-3 py-1 bg-[#7cfc00] border border-green-600 rounded text-xs hover:bg-green-400">CA-19-B (Adelantado)</button>
          <button onClick={() => { setStatus('delayed_1_day'); setHasSearched(true); }} className="px-3 py-1 bg-[#ffb38a] border border-[#ff7f50] rounded text-xs hover:bg-orange-300">CA-19-C (1 día retraso)</button>
          <button onClick={() => { setStatus('delayed_2_days'); setHasSearched(true); }} className="px-3 py-1 bg-[#ff8a8a] border border-red-600 rounded text-xs hover:bg-red-300">CA-19-C (2+ días)</button>
          <button onClick={() => { setStatus('api_error'); setHasSearched(true); }} className="px-3 py-1 bg-[#b3b3b3] border border-black rounded text-xs hover:bg-gray-400">CA-19-D (Falla API)</button>
        </div>
      </div>
      
    </div>
  );
}