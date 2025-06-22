This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Visit page in www.suarec.com

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Suarec Frontend

## Flujo de Verificación de Email

### Flujo Automático de Registro y Verificación

El sistema ahora implementa un flujo automático de verificación de email que funciona de la siguiente manera:

#### 1. Registro de Usuario
- El usuario completa el formulario de registro (PERSON o BUSINESS)
- Al enviar el formulario, se crea el usuario/empresa en el sistema
- **Automáticamente** se envía un email de verificación al correo registrado
- El usuario es redirigido a la página de verificación de email

#### 2. Página de Verificación de Email
- **URL**: `/auth/verify-email?email=usuario@email.com`
- Muestra un mensaje de confirmación de que la cuenta fue creada
- Incluye instrucciones claras sobre qué hacer:
  - Revisar la bandeja de entrada
  - Buscar email de "Suarec"
  - Hacer clic en el enlace de verificación
- Permite reenviar el email de verificación si no se recibió
- Incluye un enlace para ir al login si ya verificó el email

#### 3. Verificación del Email
- El usuario hace clic en el enlace del email
- **URL**: `/auth/verify-email?token=token_de_verificacion`
- El sistema verifica el token y marca el email como verificado
- Muestra un mensaje de éxito
- Redirige automáticamente al login con un parámetro `verified=true`

#### 4. Login con Confirmación
- **URL**: `/auth/login?verified=true`
- El formulario de login detecta el parámetro y muestra un mensaje de éxito
- El usuario puede iniciar sesión normalmente

### Características del Nuevo Flujo

✅ **Automático**: No requiere intervención manual para enviar el email de verificación
✅ **Intuitivo**: Guía clara al usuario sobre los pasos a seguir
✅ **Robusto**: Maneja errores y permite reenvío de emails
✅ **Responsive**: Funciona tanto para usuarios PERSON como BUSINESS
✅ **User-friendly**: Mensajes claros y diseño atractivo

### Archivos Modificados

1. **`components/form-register.tsx`**
   - Agregado envío automático de email de verificación
   - Redirección automática a la página de verificación
   - Manejo de errores mejorado

2. **`app/auth/verify-email/page.tsx`**
   - Nueva página con diseño mejorado
   - Estados diferentes para registro vs verificación
   - Instrucciones claras y amigables
   - Funcionalidad de reenvío de email

3. **`components/form-login.tsx`**
   - Detección de verificación exitosa
   - Mensaje de confirmación cuando viene de verificación

4. **`services/EmailVerificationService.ts`**
   - Servicio unificado para manejo de verificación de email

### Endpoints del Backend Requeridos

El frontend espera que el backend tenga los siguientes endpoints:

- `POST /email-verification/send` - Enviar email de verificación
- `POST /email-verification/verify` - Verificar token de email
- `POST /email-verification/resend` - Reenviar email de verificación
- `GET /email-verification/user/:userId` - Obtener estado de verificación

### Configuración de Email (Brevo)

El sistema está configurado para usar Brevo como proveedor de email. Asegúrate de que el backend esté configurado correctamente para enviar emails a través de Brevo.

---

## Instalación y Configuración

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

## Variables de Entorno Requeridas

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Producción
npm run start        # Iniciar producción
npm run lint         # Linting
```
