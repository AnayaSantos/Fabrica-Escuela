import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getModuleId, MODULE_IDS } from './routes';

test('resuelve las diez rutas de módulo', () => {
  for (const moduleId of MODULE_IDS) {
    assert.equal(getModuleId(`#/${moduleId}`), moduleId);
  }
});

test('usa Consultar Envío para la ruta inicial o una ruta desconocida', () => {
  assert.equal(getModuleId(''), 'hu-02');
  assert.equal(getModuleId('#/no-existe'), 'hu-02');
});
