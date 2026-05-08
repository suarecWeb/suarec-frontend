# suarec-frontend — Contexto del Repositorio

**Stack:** Next.js 14 + TypeScript + Tailwind CSS + React Hook Form + Lucide React
**Rama activa:** `vibe_crudo`
**Puerto local:** `3000`
**Arquitectura:** App Router (`app/` directory)

---

## Comandos

```bash
npm run dev       # desarrollo (localhost:3000)
npm run build     # build de producción
npm run start     # servir el build
```

---

## Estructura del proyecto

```
suarec-frontend/
├── app/              # Rutas (App Router de Next.js 14) — cada carpeta es una ruta
│   ├── auth/
│   ├── admin/
│   ├── applications/
│   ├── attendance/
│   ├── balance/
│   ├── chat/
│   ├── comments/
│   ├── companies/
│   ├── contracts/
│   ├── feed/
│   ├── my-applications/
│   ├── my-employees/
│   ├── payments/
│   ├── profile/
│   ├── layout.tsx    # Layout raíz
│   └── page.tsx      # Home
├── components/       # Componentes reutilizables entre rutas
├── services/         # Toda la comunicación con el backend (fetch/axios)
├── hooks/            # Hooks personalizados con estado reutilizable
├── interfaces/       # Tipos e interfaces TypeScript
├── contexts/         # Contextos de React (estado global)
├── actions/          # Server Actions de Next.js 14
├── schemas/          # Schemas de validación (Zod u otros)
└── lib/              # Utilidades y helpers generales
```

### Rutas existentes en `app/`

`auth`, `admin`, `applications`, `attendance`, `balance`, `chat`, `comments`, `companies`,
`contracts`, `feed`, `my-applications`, `my-employees`, `payments`, `profile`, `access-denied`

---

## Reglas de arquitectura

- **Rutas:** solo en `app/` — no crear rutas fuera de esta carpeta
- **Componentes:** si es reutilizable entre rutas → `components/`. Si es específico de una ruta → co-ubicado en esa carpeta
- **Fetch al backend:** siempre en `services/` — nunca `fetch()` o `axios` directamente en un componente
- **Estado con lógica:** siempre en `hooks/` — no poner `useState` + lógica compleja inline en componentes grandes
- **Tipos:** en `interfaces/` — no definir tipos inline en componentes de más de 50 líneas
- **Formularios:** usar React Hook Form — no formularios controlados manuales

### Services existentes en `services/`

`AuthService`, `UsersService`, `CompanyService`, `PublicationsService`, `ApplicationService`,
`ContractService`, `MessageService`, `AttendanceService`, `PaymentService`, `CommentsService`,
`NotificationService`, `RatingService`, `WompiService`, `BadgeService`, `LevelService`,
`ModerationService`, `EmailVerificationService`, `WorkContractService`, `BulkEmployeeService`, y más.

**Antes de crear un service nuevo → verificar que no exista ya en `services/`.**

---

## Estándares de calidad para este repo

### Al crear un componente nuevo

1. ¿Es reutilizable? → `components/`. ¿Solo se usa en una ruta? → dentro de la carpeta de esa ruta
2. Si hace llamadas al backend → extraer a `services/`
3. Si tiene estado complejo → extraer a un hook en `hooks/`
4. Tipos propios del componente → definirlos en `interfaces/` si el componente supera 50 líneas
5. Estilos solo con clases de Tailwind — sin CSS inline

### Métricas a respetar

| Métrica                           | ✅ Bien               | ⚠️ Revisar | ❌ Problema             |
| --------------------------------- | --------------------- | ---------- | ----------------------- |
| Líneas por componente             | < 150                 | 150–300    | > 300                   |
| Responsabilidades por componente  | 1                     | 2          | 3+                      |
| Fetch directo en componente       | Nunca                 | —          | ❌ Siempre en services/ |
| Tipos inline en componente grande | Ninguno               | 1–2        | Todos inline            |
| Estado sin hook                   | Simple (1–2 useState) | —          | Lógica compleja inline  |

### Señales de alerta a mencionar siempre

- ❗ `fetch()` o `axios` directamente dentro de un componente
- ❗ Tipos definidos inline en componentes grandes (deben ir a `interfaces/`)
- ❗ Lógica de negocio mezclada con la UI en el mismo componente
- ❗ Componentes de más de 300 líneas (evaluar split)
- ❗ `useEffect` con lógica compleja (candidato a hook personalizado)
- ❗ URLs del backend hardcodeadas (deben consumirse desde `services/`)

---

## Hooks existentes en `hooks/`

`useAuth`, `useBalance`, `useNitVisibility`, `usePublicationLikes`, `useSileo`, `useWebSocket`

---

## Reglas para Claude en este repo

- Leer el componente o servicio existente antes de modificar
- Seguir el patrón ya establecido en esa sección del proyecto
- No hacer push a `main` — trabajar siempre en `vibe_crudo`
- No commitear `.env` ni credenciales
- Respetar App Router — no mezclar con Pages Router
- Señalar deuda técnica detectada, pero no refactorizar sin pedido explícito

---

## Modelo Financiero — Reglas de precios en frontend

### Principio base

El proveedor define su precio neto. El frontend calcula y muestra al cliente el total con comisiones. Nunca al revés.

### Fórmula canónica (única fuente de verdad: `lib/pricing.ts` — por crear)

```typescript
const SUAREC_FEE_RATE = 0.12; // 12% sobre neto del proveedor
const WOMPI_FEE_RATE = 0.0482; // 4.82% sobre total del cliente

function calculatePricing(providerNetAmount: number) {
  const suarecFee = Math.round(providerNetAmount * SUAREC_FEE_RATE);
  const subtotal = providerNetAmount + suarecFee;
  const customerTotal = Math.round(subtotal / (1 - WOMPI_FEE_RATE));
  const wompiFee = customerTotal - subtotal;
  return {
    provider_net_amount: providerNetAmount,
    suarec_fee_amount: suarecFee,
    payment_processing_fee: wompiFee,
    customer_total_amount: customerTotal,
  };
}
```

### Reglas de implementación

- ❗ **`ContractModal` debe mostrar `customer_total_amount` al cliente**, no el precio publicado por el proveedor
- ❗ **El desglose en el modal debe mostrar los 4 campos** — neto proveedor, comisión SUAREC, fee Wompi, total cliente
- ❗ **No usar comisión mínima de $7.000** — eliminada, solo aplica el 12% puro
- ❗ **Precio mínimo de publicación: $50.000 COP** — validar en el formulario de creación
- ❗ **El proveedor en su wallet/balance ve `provider_net_amount`** — nunca el total bruto
- ❗ **No hardcodear las tasas en componentes** — importar siempre desde `lib/pricing.ts`

### Orden de cobro (inamovible)

```
1. Wompi cobra primero  → sobre customer_total_amount
2. SUAREC cobra después → sobre provider_net_amount
```

### Ejemplo con $50.000 netos para el proveedor

```
provider_net_amount:    $50.000   ← lo que ve el proveedor
suarec_fee_amount:       $6.000   ← 12% de $50.000
payment_processing_fee:  $2.836   ← 4.82% de $58.836
customer_total_amount:  $58.836   ← lo que ve el cliente en ContractModal
```
