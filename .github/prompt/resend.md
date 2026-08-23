# Plan de consumo del módulo de correos (Resend) desde el Frontend

Esta guía describe **cómo el frontend consume los flujos de correo** de Tkuido-API.

> 🔑 **Concepto clave:** el frontend **nunca llama a Resend ni envía correos directamente**. El backend dispara los correos como efecto secundario de endpoints de negocio normales. El frontend solo consume esos endpoints REST; el correo se manda solo.

---

## 1. Información general

| Dato | Valor |
|------|-------|
| Base URL (dev) | `http://localhost:3000` |
| Documentación Swagger | `GET /docs` |
| Formato | JSON (`Content-Type: application/json`) |
| CORS permitido | `http://localhost:5173`, `https://pantheradev.github.io` |

> ⚠️ **CORS:** solo esos dos orígenes están habilitados (ver `src/main.ts`). Si el front corre en otro host/puerto, hay que añadirlo en `app.enableCors(...)` del backend o las peticiones serán bloqueadas por el navegador.

### Validación global
La API usa `ValidationPipe` con `whitelist: true` y `forbidNonWhitelisted: true`. Esto significa:
- **No envíes campos extra** en el body: cualquier propiedad no esperada produce `400 Bad Request`.
- Respeta tipos y nombres exactos de cada campo (los detallamos abajo).

### Formato de errores
Hay dos tipos de error que el front debe manejar:

**a) Error de validación** (campos mal formados/faltantes):
```json
{
  "statusCode": 400,
  "message": ["correo must be an email", "..."],
  "error": "Bad Request"
}
```
`message` es un **array** de strings.

**b) Error de negocio** (lanzado por el servicio):
```json
{
  "statusCode": 400,
  "message": "Código inválido o expirado."
}
```
`message` es un **string**.

> 💡 Recomendación: en el front, normaliza ambos casos con algo como
> `const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;`

---

## 2. Resumen de flujos

| # | Flujo | Endpoint | Auth | El correo es… |
|---|-------|----------|------|---------------|
| 1 | Bienvenida | `POST /usuario` | Pública | Automático (fire-and-forget) |
| 2 | Recuperar contraseña — solicitar | `POST /password/forgot` | Pública | La operación principal |
| 2 | Recuperar contraseña — confirmar | `POST /password/reset` | Pública | — (consume el código) |
| 3 | Recibo de pago | `POST /PM` | **Bearer JWT** | Automático (fire-and-forget) |

---

## 3. Flujo 1 — Correo de bienvenida

Se envía **solo** como efecto del registro. El front no hace nada especial: registra al usuario como siempre.

### Request
```http
POST /usuario
Content-Type: application/json
```
```json
{
  "ci": "V12345678",
  "correo": "alguien@gmail.com",
  "password": "perro12345678",
  "fk_rol": "1",
  "vendedores": "1"
}
```

### Respuesta exitosa — `201 Created`
Devuelve el usuario creado. El registro se considera exitoso **aunque el correo falle** (es fire-and-forget). El front **no debe** mostrar error si el correo no llegó.

### Ejemplo (fetch)
```ts
async function registrarUsuario(data) {
  const res = await fetch(`${API_BASE_URL}/usuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message);
  }
  return res.json(); // usuario creado — el correo de bienvenida va en camino
}
```

### UX sugerida
- Mensaje: *"¡Cuenta creada! Te enviamos un correo de bienvenida."*
- No bloquees la navegación esperando el correo.

---

## 4. Flujo 2 — Recuperación de contraseña (2 pasos)

Es el único flujo donde el front orquesta una secuencia: **pedir código → ingresar código + nueva contraseña**.

### Paso 1 — Solicitar código

```http
POST /password/forgot
Content-Type: application/json
```
```json
{ "email": "alguien@gmail.com" }
```

#### Respuesta — `200 OK`
```json
{ "message": "Si el correo existe, se enviará un código de recuperación." }
```

> 🔒 **Anti enumeración de usuarios:** el backend responde **siempre 200 con el mismo mensaje genérico**, exista o no la cuenta. El front **no puede** (ni debe) saber si el email existe. Muestra siempre: *"Si el correo está registrado, recibirás un código."*

El usuario recibe por correo un **código de 6 dígitos** que expira en **15 minutos** (`EMAIL_RESET_CODE_TTL_MIN`).

#### Posibles errores
- `400` — email con formato inválido (validación).
- `500` — el correo no pudo enviarse (problema de Resend/infra). En ese caso sí muestra error e invita a reintentar.

### Paso 2 — Confirmar nueva contraseña

```http
POST /password/reset
Content-Type: application/json
```
```json
{
  "email": "alguien@gmail.com",
  "code": "123456",
  "newPassword": "nuevaClaveSegura123"
}
```

**Reglas de los campos:**
- `email`: formato email válido.
- `code`: string de **exactamente 6 caracteres**.
- `newPassword`: mínimo **6 caracteres**.

#### Respuesta exitosa — `200 OK`
```json
{ "message": "Contraseña actualizada correctamente." }
```
Tras esto, las sesiones activas se invalidan (refresh tokens revocados): el usuario deberá **volver a iniciar sesión**.

#### Errores de negocio — `400 Bad Request` (`message` string)
| Mensaje | Causa | Qué mostrar |
|---------|-------|-------------|
| `Código inválido o expirado.` | Código incorrecto, vencido, ya usado o inexistente | Pide reintentar o solicitar uno nuevo |
| `Se superó el número de intentos. Solicita un nuevo código.` | 5 intentos fallidos | Forzar volver al Paso 1 |
| `No se pudo actualizar la contraseña.` | Error al persistir | Reintentar |

> El backend permite **máximo 5 intentos** de código por solicitud. Tras eso el código se invalida y hay que pedir uno nuevo.

### Ejemplo de orquestación (front)
```ts
// Paso 1
await fetch(`${API_BASE_URL}/password/forgot`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});
// Mostrar SIEMPRE: "Si el correo está registrado, recibirás un código."

// Paso 2 (con el código que el usuario tecleó)
const res = await fetch(`${API_BASE_URL}/password/reset`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, code, newPassword }),
});
if (!res.ok) {
  const err = await res.json();
  throw new Error(err.message); // string en errores de negocio
}
// Éxito → redirigir al login
```

### UX sugerida
- Pantalla 1: input de email → botón "Enviar código".
- Pantalla 2: input de código (6 dígitos) + nueva contraseña + confirmar.
- Muestra un contador de **15 min** y un enlace "Reenviar código" (vuelve al Paso 1).
- Valida en cliente: código de 6 dígitos y contraseña ≥ 6 caracteres (espejo de las reglas del backend) para evitar viajes innecesarios.

---

## 5. Flujo 3 — Recibo de pago

El recibo al **cliente** se envía automáticamente cuando un pago se verifica con éxito. El front solo llama al endpoint de verificación de pago como ya lo hace.

> ℹ️ La notificación al **proveedor** está pendiente de definición de negocio y **no** está activa todavía. Solo se envía el recibo al cliente.

### Request — requiere autenticación
```http
POST /PM
Authorization: Bearer <accessToken>
Content-Type: application/json
```
```json
{
  "idCliente": "1",
  "phone": "584241234567",
  "bank": "0102",
  "date": "2021-01-01",
  "reference": "123456"
}
```
- `date` debe tener formato **`YYYY-MM-DD`**.

### Respuesta exitosa — `202 Accepted`
Devuelve el detalle del pago verificado. El recibo se manda **fire-and-forget**: si el correo falla, el pago **igual se considera exitoso** y el front no debe mostrar error por el correo.

> Para que el correo llegue, el cliente debe tener un usuario asociado con `correo` (relación `fk_user`). Si no lo tiene, el pago funciona igual pero no se envía recibo.

### Obtener el `accessToken` (login previo)
```http
POST /login
Content-Type: application/json
```
```json
{ "email": "alguien@gmail.com", "password": "perro12345678" }
```
Respuesta `202`:
```json
{
  "accessToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "refreshToken": "...",
  "refreshTokenExpiresAt": "..."
}
```
Usa `accessToken` en el header `Authorization: Bearer ...` del `POST /PM`.

---

## 6. Checklist para el equipo de Frontend

- [ ] Configurar `API_BASE_URL` por entorno (dev/prod).
- [ ] Asegurar que el origen del front esté en la lista CORS del backend.
- [ ] **Registro:** consumir `POST /usuario`; no depender del correo para el éxito.
- [ ] **Recuperación:** implementar pantalla de 2 pasos (`/password/forgot` → `/password/reset`).
- [ ] Mostrar **siempre** el mensaje genérico en `forgot` (no revelar si el email existe).
- [ ] Validar en cliente: código de 6 dígitos, contraseña ≥ 6.
- [ ] Manejar los 3 mensajes de error de `reset` (código inválido, intentos, fallo al actualizar).
- [ ] Tras `reset` exitoso, **forzar nuevo login** (las sesiones se invalidan).
- [ ] **Pago:** enviar `Authorization: Bearer` en `/PM`; `date` en formato `YYYY-MM-DD`.
- [ ] Normalizar errores: `message` puede ser **string** o **array**.

---

## 7. Notas para el backend (no es trabajo del front)

Para que los correos lleguen **a destinatarios reales** (no solo a la cuenta dueña de la API key), el backend debe:
1. Verificar un dominio en [resend.com/domains](https://resend.com/domains) (registros DNS SPF + DKIM).
2. Cambiar `EMAIL_FROM` en `.env` a un remitente de ese dominio (ej. `Tkuido <no-reply@tkuido.com>`).

Mientras se use `onboarding@resend.dev`, Resend **solo entrega al email de la cuenta** dueña de la `RESEND_API_KEY` — útil para pruebas, no para producción.

---

## 8. Referencia rápida de endpoints

| Método | Ruta | Auth | Body | Éxito |
|--------|------|------|------|-------|
| POST | `/usuario` | — | `{ ci, correo, password, fk_rol, vendedores }` | `201` |
| POST | `/password/forgot` | — | `{ email }` | `200` |
| POST | `/password/reset` | — | `{ email, code, newPassword }` | `200` |
| POST | `/login` | — | `{ email, password }` | `202` |
| POST | `/PM` | Bearer | `{ idCliente, phone, bank, date, reference }` | `202` |
