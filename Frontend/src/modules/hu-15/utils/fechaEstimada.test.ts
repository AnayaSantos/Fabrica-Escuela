import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  esFechaEstimadaValida,
  formatearFechaEstimada,
  obtenerFechaActualISO,
} from './fechaEstimada';

test('muestra la fecha estimada del envío en español', () => {
  assert.equal(
    formatearFechaEstimada('2026-10-15'),
    'jueves, 15 de octubre de 2026',
  );
});

test('rechaza fechas anteriores al mínimo y acepta el día mínimo', () => {
  assert.equal(esFechaEstimadaValida('2026-10-14', '2026-10-15'), false);
  assert.equal(esFechaEstimadaValida('2026-10-15', '2026-10-15'), true);
  assert.equal(esFechaEstimadaValida('', '2026-10-15'), true);
});

test('obtiene la fecha local en formato de control date', () => {
  assert.match(obtenerFechaActualISO(), /^\d{4}-\d{2}-\d{2}$/);
});
