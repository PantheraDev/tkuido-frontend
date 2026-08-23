# Plan Frontend — Pasarela de Pago (React.js)

> **Stack frontend:** React.js · Axios/Fetch · React Router
> **Backend:** NestJS (Tkuido-API) · Bancamiga (cargo directo bolívares + página alojada 3DS dólares)
>
> Este documento describe, por fases, cómo integrar correctamente la pasarela de pago
> desde el frontend, alineado con los endpoints **reales** del backend.
>
> Documentos backend relacionados:
> - `.github/prompts/plan-tarjeta-internacional.md` (orden + página alojada + callback)
> - `.github/prompts/plan-validacion-pagos-bancamiga.md` (GET estatus / reconciliación)

---

## 0. Los dos flujos (entender antes de codear)

El backend expone **dos pasarelas distintas**. El frontend debe tratarlas diferente.

| Aspecto | Nacional — TDC Bolívares | Internacional — TDC Dólares |
|---|---|---|
| Endpoint | `POST /tdc-nacional` | `POST /international-pay/tdc` |
| Modelo | **Cargo directo** (una sola llamada) | **Orden + página alojada + callback** |
| ¿Dónde se ingresa la tarjeta? | **En tu formulario React** | **En el formulario de Bancamiga** (redirect) |
| Datos de tarjeta tocan tu front | **Sí** (número, CVV, vencimiento) | **No** (solo nombre, DNI, monto) |
| Confirmación | **Inmediata** en la respuesta | **Asíncrona** (redirect + GET estatus) |
| PCI scope del front | **Alto** | **Bajo** |
| Auth | `Bearer JWT` | `Bearer JWT` |

> ⚠️ **Regla de oro internacional:** nunca confíes en el redirect para confirmar el pago.
> El estado real siempre se confirma consultando `GET /international-pay/:orderId`.

---

## Fase 1 — Configuración base del cliente HTTP

### 1.1 Variables de entorno del frontend

```env
# .env (React / Vite usa VITE_, CRA usa REACT_APP_)
VITE_API_URL=https://api.tuapp.com
VITE_CHECKOUT_RETURN_BASE=https://tuapp.com   # dominio donde viven /checkout/*
```

### 1.2 Instancia Axios con JWT

```js
// src/api/http.js
import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
});

// Inyecta el JWT en cada request (ambos pagos requieren @Auth())
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normaliza errores del backend (HttpException → { message })
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ?? 'Error de comunicación con el servidor';
    return Promise.reject(new Error(message));
  },
);
```

> **Seguridad:** El JWT autentica al usuario. El token de Bancamiga (`sandbox_7625372:1`
> o el de producción) **vive solo en el backend** — nunca debe aparecer en el frontend.

---

## Fase 2 — Capa de servicios (API)

Separa las llamadas HTTP de los componentes. Un archivo por pasarela.

### 2.1 Pago nacional (bolívares, cargo directo)

```js
// src/api/nationalPay.js
import { http } from './http';

/**
 * POST /tdc-nacional → respuesta inmediata.
 * @returns { idPago, ... , success, message } (forma del Result<PayResponse>)
 */
export async function payNational(payload) {
  // payload: { idCliente, amount, creditCardNumber, expirationMonth,
  //            expirationYear, cvv, ci, reference }
  const { data } = await http.post('/tdc-nacional', payload);
  return data;
}
```

### 2.2 Pago internacional (dólares, orden alojada)

```js
// src/api/intlPay.js
import { http } from './http';

/**
 * POST /international-pay/tdc → crea la orden y devuelve la URL alojada.
 * @returns TdcPayResponse: { idPago, idPoliza, idTdcInternacional, success, message, data }
 *          data normalmente contiene { ordenID, url, Status }
 */
export async function createIntlOrder(payload) {
  // payload: { idCliente, Monto, Descripcion, Dni, Name, token, expireMinute?, externalId? }
  const { data } = await http.post('/international-pay/tdc', payload);
  return data;
}

/**
 * GET /international-pay/:orderId → estatus real reconciliado contra Bancamiga.
 * @returns StatusResponse: { status, ... }
 */
export async function getIntlOrderStatus(orderId) {
  const { data } = await http.get(`/international-pay/${orderId}`);
  return data;
}
```

---

## Fase 3 — Validación en el cliente (espejo del backend)

Valida **antes** de enviar para dar feedback inmediato. El backend re-valida igual,
así que esto es UX, no seguridad. Reglas extraídas de los DTO reales:

### 3.1 Nacional (`nationalPay` DTO)

| Campo | Regla | Mensaje |
|---|---|---|
| `amount` | `^\d+(\.\d{1,2})?$` | Monto numérico, hasta 2 decimales |
| `creditCardNumber` | 15–16 dígitos | Tarjeta de 15 o 16 dígitos |
| `cvv` | 3–4 dígitos | CVV de 3 o 4 dígitos |
| `expirationMonth` | `^(0[1-9]\|1[0-2])$` | Mes entre 01 y 12 |
| `expirationYear` | 2 dígitos | Año de 2 dígitos (ej. 25) |
| `ci` | 6–12 dígitos | Cédula 6–12 dígitos |
| `reference` | máx. 10 dígitos | Referencia numérica |

### 3.2 Internacional (`InternacionalPayDto`)

| Campo | Regla | Mensaje |
|---|---|---|
| `Monto` | decimal hasta 2 decimales | Monto con hasta 2 decimales |
| `Descripcion` | máx. 255 | Descripción ≤ 255 caracteres |
| `Dni` | `^[VEJP]\d{6,12}$` | Inicia con V/E/J/P + 6 a 12 dígitos |
| `Name` | máx. 100 | Nombre ≤ 100 caracteres |
| `token` | requerido | Token de la pasarela (provisto por backend/config) |
| `expireMinute` | entero ≥ 1 (opcional) | Default 10 |
| `externalId` | máx. 50 (opcional) | Referencia interna para idempotencia |

```js
// src/validation/payments.js
export const nationalRules = {
  amount: (v) => /^\d+(\.\d{1,2})?$/.test(v) || 'Monto inválido',
  creditCardNumber: (v) => /^\d{15,16}$/.test(v) || 'Tarjeta de 15 o 16 dígitos',
  cvv: (v) => /^\d{3,4}$/.test(v) || 'CVV de 3 o 4 dígitos',
  expirationMonth: (v) => /^(0[1-9]|1[0-2])$/.test(v) || 'Mes 01–12',
  expirationYear: (v) => /^\d{2}$/.test(v) || 'Año de 2 dígitos',
  ci: (v) => /^\d{6,12}$/.test(v) || 'Cédula 6–12 dígitos',
  reference: (v) => /^\d{1,10}$/.test(v) || 'Referencia ≤ 10 dígitos',
};

export const intlRules = {
  Monto: (v) => /^\d+(\.\d{1,2})?$/.test(v) || 'Monto inválido',
  Descripcion: (v) => v.length <= 255 || 'Máx. 255 caracteres',
  Dni: (v) => /^[VEJP]\d{6,12}$/.test(v) || 'Formato V/E/J/P + dígitos',
  Name: (v) => v.length <= 100 || 'Máx. 100 caracteres',
};

export function validate(rules, values) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const result = rule(values[field] ?? '');
    if (result !== true) errors[field] = result;
  }
  return errors; // {} = válido
}
```

---

## Fase 4 — Formulario de pago NACIONAL (bolívares)

Cargo directo: el usuario ingresa la tarjeta en tu form, una sola llamada, respuesta inmediata.

```jsx
// src/components/NationalPayForm.jsx
import { useState } from 'react';
import { payNational } from '../api/nationalPay';
import { validate, nationalRules } from '../validation/payments';

export function NationalPayForm({ idCliente }) {
  const [form, setForm] = useState({
    amount: '', creditCardNumber: '', expirationMonth: '',
    expirationYear: '', cvv: '', ci: '', reference: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | ok | error
  const [message, setMessage] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(nationalRules, form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus('loading');
    try {
      const res = await payNational({ idCliente, ...form });
      setStatus('ok');
      setMessage(res.message ?? 'Pago procesado correctamente');
      // TODO: limpiar datos sensibles de memoria (ver Fase 7)
      setForm((f) => ({ ...f, creditCardNumber: '', cvv: '' }));
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <form onSubmit={onSubmit} autoComplete="off">
      {/* Render de inputs controlados con errors[campo]; usa inputMode="numeric" */}
      {/* ... campos: amount, creditCardNumber, expirationMonth/Year, cvv, ci, reference ... */}
      <button disabled={status === 'loading'}>
        {status === 'loading' ? 'Procesando…' : 'Pagar'}
      </button>
      {message && <p className={status === 'error' ? 'error' : 'ok'}>{message}</p>}
    </form>
  );
}
```

> **Doble submit:** deshabilita el botón mientras `status === 'loading'` para evitar cargos dobles.

---

## Fase 5 — Flujo de pago INTERNACIONAL (dólares, página alojada)

Tres pasos: (A) crear orden → (B) redirigir a Bancamiga → (C) confirmar estado al volver.

### 5.1 Paso A+B — Crear orden y redirigir

```jsx
// src/components/IntlPayButton.jsx
import { useState } from 'react';
import { createIntlOrder } from '../api/intlPay';
import { validate, intlRules } from '../validation/payments';

export function IntlPayButton({ idCliente, gatewayToken, order }) {
  // order: { Monto, Descripcion, Dni, Name, externalId? }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pay = async () => {
    const errs = validate(intlRules, order);
    if (Object.keys(errs).length) { setError(Object.values(errs)[0]); return; }

    setLoading(true);
    setError('');
    try {
      const res = await createIntlOrder({
        idCliente,
        token: gatewayToken,
        expireMinute: 10,
        ...order,
      });

      const hostedUrl = res.data?.url;          // URL del formulario alojado
      const ordenID  = res.data?.ordenID;
      if (!hostedUrl) throw new Error('La pasarela no devolvió URL de pago');

      // Guarda el ordenID para reconciliar al volver (por si el ref viene incompleto)
      sessionStorage.setItem('intl_ordenID', ordenID ?? '');
      sessionStorage.setItem('intl_externalId', order.externalId ?? '');

      // Redirige el navegador al formulario alojado de Bancamiga (3DS)
      window.location.assign(hostedUrl);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={pay} disabled={loading}>
        {loading ? 'Redirigiendo…' : 'Pagar con tarjeta internacional'}
      </button>
      {error && <p className="error">{error}</p>}
    </>
  );
}
```

### 5.2 Paso C — Páginas de retorno `/checkout/*`

El backend (callbacks `done`/`cancel`) reconcilia y **redirige al frontend** a:

| Ruta frontend | Cuándo | Query |
|---|---|---|
| `/checkout/success` | Orden `approved` | `?ref={externalId\|orderId}` |
| `/checkout/failed` | Orden `rejected` / no aprobada | `?ref=…` |
| `/checkout/cancelled` | Cancelada / expirada | `?ref=…` |

```jsx
// src/pages/CheckoutResult.jsx  (una página por estado, o una con prop)
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getIntlOrderStatus } from '../api/intlPay';

export function CheckoutResult({ outcome }) {
  // outcome: 'success' | 'failed' | 'cancelled' (según la ruta)
  const [params] = useSearchParams();
  const ref = params.get('ref');
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    // RECONFIRMACIÓN opcional pero recomendada: re-verifica contra el backend.
    // No confíes solo en la ruta a la que te redirigió el callback.
    const ordenID = sessionStorage.getItem('intl_ordenID');
    if (!ordenID) { setStatus(outcome); return; }

    getIntlOrderStatus(ordenID)
      .then((res) => setStatus(res.status))   // 'approved' | 'rejected' | 'pending' | 'expired'
      .catch(() => setStatus(outcome))        // fallback al outcome de la ruta
      .finally(() => {
        sessionStorage.removeItem('intl_ordenID');
        sessionStorage.removeItem('intl_externalId');
      });
  }, [outcome]);

  // Render por estado: approved → éxito; rejected/failed → reintento; pending → "en verificación"
  return <ResultView status={status} reference={ref} />;
}
```

Rutas:

```jsx
// src/router.jsx
<Route path="/checkout/success"   element={<CheckoutResult outcome="approved" />} />
<Route path="/checkout/failed"    element={<CheckoutResult outcome="rejected" />} />
<Route path="/checkout/cancelled" element={<CheckoutResult outcome="cancelled" />} />
```

> El backend ya reconcila contra Bancamiga antes de redirigir. El `getIntlOrderStatus`
> del front es una **segunda confirmación** para mostrar el estado real con certeza.

---

## Fase 6 — Manejo de estado y reintentos

### 6.1 Mapeo de estados → UI

| `status` (backend) | UI | Acción del usuario |
|---|---|---|
| `approved` | ✅ Pago confirmado | Continuar / ver comprobante |
| `rejected` | ❌ Pago rechazado | Reintentar con **nueva orden** (nuevo `externalId`) |
| `pending` | ⏳ En verificación | Mostrar spinner / "te avisaremos"; permitir re-consultar |
| `expired` | ⌛ Orden vencida | Crear una orden nueva |

### 6.2 Polling opcional para `pending`

Si la página de resultado recibe `pending` (cliente volvió antes de que Bancamiga
confirmara), el front puede sondear el estatus unas pocas veces:

```js
async function pollStatus(orderId, { tries = 5, intervalMs = 4000 } = {}) {
  for (let i = 0; i < tries; i++) {
    const { status } = await getIntlOrderStatus(orderId);
    if (status !== 'pending') return status;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return 'pending';
}
```

> El backend además corre un **cron de reconciliación** de respaldo, así que aunque el
> usuario cierre el navegador la orden se resolverá del lado servidor. El polling del
> front es solo para refrescar la UI mientras el usuario sigue presente.

### 6.3 Idempotencia desde el front

Genera y reutiliza un `externalId` estable por intento de compra (ej. `A-100001`).
Si el usuario reintenta el **mismo** carrito, reusar el `externalId` evita órdenes
duplicadas (el backend lo deduplica). Para un pago **nuevo**, genera uno nuevo.

---

## Fase 7 — Seguridad y cumplimiento (frontend)

- [ ] **JWT** en cada request a `/tdc-nacional` y `/international-pay/*` (ambos `@Auth()`).
- [ ] **Token de Bancamiga nunca en el front** — vive solo en el backend.
- [ ] **Nacional toca datos de tarjeta:** servir el front **siempre por HTTPS**, no
      loguear PAN/CVV, `autoComplete="off"`, y limpiar `creditCardNumber`/`cvv` del
      estado tras enviar. No persistir tarjeta en `localStorage`/`sessionStorage`.
- [ ] **Internacional NO toca tarjeta:** la tarjeta se ingresa en Bancamiga → menor
      scope PCI. Preferir esta vía cuando aplique.
- [ ] **No confiar en el redirect** del internacional: reconfirmar con `GET /:orderId`.
- [ ] **Validar formato** en cliente (Fase 3) — el backend re-valida igual.
- [ ] **Deshabilitar el botón** durante la petición para evitar doble cargo.
- [ ] **Mensajes de error genéricos** al usuario; el detalle queda en el backend.

---

## Fase 8 — Pruebas (sandbox)

### 8.1 Tarjetas de prueba internacional (se ingresan en el form de Bancamiga)

| Escenario | Número | CVC | Mes | Año | Resultado |
|---|---|---|---|---|---|
| ✅ Aprobada | `4242424242424242` | `0742` | `05` | `25` | `approved` |
| ❌ Rechazada | `9879879879879879` | `000` | `02` | `25` | `rejected` |

### 8.2 Checklist de prueba end-to-end

- [ ] Nacional: pago válido → respuesta `success` inmediata.
- [ ] Nacional: validaciones del front bloquean envíos inválidos.
- [ ] Internacional: crear orden → recibo `data.url` y redirige.
- [ ] Internacional: pago aprobado → vuelvo a `/checkout/success` y `getStatus` = `approved`.
- [ ] Internacional: pago rechazado → `/checkout/failed`, `getStatus` = `rejected`.
- [ ] Internacional: cancelar/expirar → `/checkout/cancelled`.
- [ ] `pending` en retorno → polling refresca a estado final.
- [ ] Reintento con mismo `externalId` no crea orden duplicada.

---

## Checklist final de implementación frontend

- [ ] Instancia Axios con `baseURL` y JWT interceptor (Fase 1)
- [ ] Servicios `payNational`, `createIntlOrder`, `getIntlOrderStatus` (Fase 2)
- [ ] Validaciones espejo de los DTO (Fase 3)
- [ ] Formulario de pago nacional con anti-doble-submit (Fase 4)
- [ ] Botón internacional que crea orden y redirige a `data.url` (Fase 5.1)
- [ ] Rutas `/checkout/success|failed|cancelled` con reconfirmación (Fase 5.2)
- [ ] Mapeo de estados a UI + reintentos + idempotencia (Fase 6)
- [ ] Higiene de seguridad: HTTPS, no loguear tarjeta, limpiar estado (Fase 7)
- [ ] Pruebas con tarjetas sandbox (Fase 8)
- [ ] Configurar `VITE_API_URL` y dominio de retorno por entorno
