import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DATOS_GUIA_EJEMPLO,
  FECHA_ESTIMADA_EJEMPLO,
  GUIA_EJEMPLO,
  esGuiaEjemplo,
  formatearFechaEstimada,
} from './ejemplos';

test('reconoce la guía de demostración sin distinguir espacios o mayúsculas', () => {
  assert.equal(esGuiaEjemplo(` ${GUIA_EJEMPLO.toLowerCase()} `), true);
  assert.equal(esGuiaEjemplo('LG-2026-00000001'), false);
});

test('la guía compartida incluye fecha y alerta de demostración', () => {
  assert.equal(DATOS_GUIA_EJEMPLO.numeroGuia, GUIA_EJEMPLO);
  assert.equal(DATOS_GUIA_EJEMPLO.fechaEstimadaEntrega, FECHA_ESTIMADA_EJEMPLO);
  assert.equal(DATOS_GUIA_EJEMPLO.alertaTiempo, 'delayed_1_day');
  assert.equal(formatearFechaEstimada(FECHA_ESTIMADA_EJEMPLO), 'jueves, 15 de octubre de 2026');
});
