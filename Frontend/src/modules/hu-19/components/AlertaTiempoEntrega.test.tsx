import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test } from 'node:test';
import {
  AlertaTiempoEntrega,
  type EstadoAlertaTiempo,
} from './AlertaTiempoEntrega';

const casos: Array<{ estado: EstadoAlertaTiempo; texto: string }> = [
  { estado: 'on_time', texto: 'El envío avanza según lo programado' },
  { estado: 'early', texto: 'Tu envío llegará antes' },
  { estado: 'delayed_1_day', texto: '1 día de retraso' },
  { estado: 'delayed_2_days', texto: 'Retraso significativo' },
  { estado: 'api_error', texto: 'No pudimos obtener los datos del clima' },
];

for (const caso of casos) {
  test(`muestra la alerta ${caso.estado}`, () => {
    const html = renderToStaticMarkup(
      createElement(AlertaTiempoEntrega, { estado: caso.estado }),
    );

    assert.ok(html.includes(caso.texto));
  });
}

test('no muestra una alerta si no hay estado disponible', () => {
  assert.equal(
    renderToStaticMarkup(createElement(AlertaTiempoEntrega, { estado: null })),
    '',
  );
});
