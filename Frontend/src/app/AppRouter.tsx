import { useEffect, useLayoutEffect, useState, type ComponentType } from 'react';
import Hu01 from '../modules/hu-01/App';
import Hu02 from '../modules/hu-02/App';
import Hu03 from '../modules/hu-03/App';
import Hu04 from '../modules/hu-04/App';
import Hu05 from '../modules/hu-05/App';
import Hu07 from '../modules/hu-07/App';
import Hu13 from '../modules/hu-13/App';
import Hu14 from '../modules/hu-14/App';
import Hu15 from '../modules/hu-15/App';
import Hu19 from '../modules/hu-19/App';
import { getModuleId, type ModuleId } from './routes';

const modules = {
  'hu-01': Hu01,
  'hu-02': Hu02,
  'hu-03': Hu03,
  'hu-04': Hu04,
  'hu-05': Hu05,
  'hu-07': Hu07,
  'hu-13': Hu13,
  'hu-14': Hu14,
  'hu-15': Hu15,
  'hu-19': Hu19,
} satisfies Record<ModuleId, ComponentType>;

const pageTitles: Record<ModuleId, string> = {
  'hu-01': 'Registrar Envío',
  'hu-02': 'Consultar Envío',
  'hu-03': 'Actualizar Estado',
  'hu-04': 'Registrar Evento',
  'hu-05': 'Registrar Usuario',
  'hu-07': 'Asignación de Transporte',
  'hu-13': 'Centros de Distribución',
  'hu-14': 'Registrar Ruta de Transporte',
  'hu-15': 'Fecha Estimada de Entrega',
  'hu-19': 'Alerta de Tiempo de Entrega',
};

export default function AppRouter() {
  const [moduleId, setModuleId] = useState(() => getModuleId(window.location.hash));

  useEffect(() => {
    const updateRoute = () => setModuleId(getModuleId(window.location.hash));
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useLayoutEffect(() => {
    const root = document.getElementById('module-root');
    if (!root) {
      throw new Error('No se encontró el contenedor principal de TraceLog.');
    }

    root.classList.remove(...Object.keys(modules).map((id) => `module-${id}`));
    root.classList.add(`module-${moduleId}`);
  }, [moduleId]);

  useEffect(() => {
    document.title = `${pageTitles[moduleId]} | TraceLog`;
  }, [moduleId]);

  const Module = modules[moduleId];

  return <Module />;
}
