# 🚀 SUAREC - Plataforma de Conexión Laboral

> **Conectamos talento excepcional con oportunidades extraordinarias**

SUAREC es una plataforma innovadora que revoluciona la forma en que profesionales y empresas se conectan en Colombia. Nuestra misión es crear un ecosistema donde el talento encuentre las mejores oportunidades y las empresas descubran profesionales excepcionales.

## 🌟 Características Principales

### 👥 **Para Profesionales (PERSON)**

- **Perfil Profesional Completo**: Crea un perfil detallado con experiencia, habilidades y portfolio
- **Publicaciones de Servicios**: Ofrece tus servicios profesionales con precios y descripciones
- **Sistema de Calificaciones**: Construye tu reputación con calificaciones de clientes
- **Chat Integrado**: Comunícate directamente con empresas y clientes
- **Dashboard de Estadísticas**: Monitorea tus ingresos, contratos y crecimiento profesional

### 🏢 **Para Empresas (BUSINESS)**

- **Gestión de Empleados**: Administra tu equipo con sistema de asistencia integrado
- **Publicaciones de Oportunidades**: Publica ofertas de trabajo y proyectos
- **Evaluación de Candidatos**: Revisa aplicaciones y califica a los profesionales
- **Sistema de Pagos**: Integración con Wompi para transacciones seguras
- **Análisis de Rendimiento**: Estadísticas detalladas de tu empresa

### 🔐 **Sistema de Autenticación Avanzado**

- **Verificación de Email Automática**: Flujo completo de verificación
- **Roles y Permisos**: Sistema granular de permisos por tipo de usuario
- **Recuperación de Contraseña**: Proceso seguro de recuperación
- **Sesiones Seguras**: JWT con expiración configurable

## 🛠️ Tecnologías Utilizadas

### **Frontend**

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Framework de estilos utility-first
- **Lucide React** - Iconografía moderna
- **React Hook Form** - Manejo eficiente de formularios
- **Axios** - Cliente HTTP para APIs
- **Socket.io** - Comunicación en tiempo real

### **Backend**

- **NestJS** - Framework Node.js para APIs
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos principal
- **JWT** - Autenticación stateless
- **Brevo** - Servicio de emails transaccionales
- **Wompi** - Procesamiento de pagos

### **Infraestructura**

- **Docker** - Containerización
- **Railway** - Despliegue y hosting
- **Supabase** - Storage de archivos
- **Vercel** - Despliegue frontend

## 🚀 Getting Started

### **Prerrequisitos**

- Node.js 18+
- npm, yarn, pnpm o bun
- PostgreSQL (para desarrollo local)

### **Instalación**

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/suarec-frontend.git
cd suarec-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### **Configuración de Variables de Entorno**

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key

# Wompi Configuration
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=tu-wompi-public-key
NEXT_PUBLIC_WOMPI_ENV=test
```

### **Ejecutar en Desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📁 Estructura del Proyecto

```
suarec-frontend/
├── app/                    # App Router de Next.js
│   ├── auth/              # Autenticación y registro
│   ├── companies/         # Gestión de empresas
│   ├── publications/      # Publicaciones y servicios
│   ├── profile/          # Perfiles de usuario
│   ├── chat/             # Sistema de mensajería
│   ├── payments/         # Gestión de pagos
│   └── ...
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Button, Input, etc.)
│   ├── forms/            # Formularios específicos
│   └── ...
├── services/             # Servicios de API
├── interfaces/           # Tipos TypeScript
├── hooks/               # Custom hooks
├── contexts/            # Contextos de React
└── lib/                 # Utilidades y helpers
```

## 🔄 Flujo de Verificación de Email

### **Proceso Automático**

1. **Registro de Usuario**
   - El usuario completa el formulario (PERSON o BUSINESS)
   - Se crea automáticamente la cuenta en el sistema
   - Se envía email de verificación automáticamente
   - Redirección a página de verificación

2. **Página de Verificación**
   - URL: `/auth/verify-email?email=usuario@email.com`
   - Instrucciones claras y amigables
   - Opción de reenvío de email
   - Enlace al login

3. **Verificación del Token**
   - URL: `/auth/verify-email?token=token_de_verificacion`
   - Validación automática del token
   - Confirmación de verificación exitosa
   - Redirección al login con confirmación

### **Características del Sistema**

✅ **Automático**: Sin intervención manual
✅ **Intuitivo**: Guía clara al usuario
✅ **Robusto**: Manejo de errores completo
✅ **Responsive**: Funciona en todos los dispositivos

## 🎯 Funcionalidades Principales

### **Sistema de Publicaciones**

- Creación de publicaciones con imágenes
- Categorización por tipo de servicio
- Sistema de likes y comentarios
- Galería de imágenes integrada
- Filtros avanzados de búsqueda

### **Sistema de Aplicaciones**

- Aplicación directa a publicaciones
- Mensajes personalizados
- Seguimiento de estado de aplicación
- Notificaciones en tiempo real

### **Sistema de Contratos**

- Creación de contratos de trabajo
- Negociación de términos y precios
- Sistema de ofertas múltiples
- Integración con pagos

### **Sistema de Calificaciones**

- Calificación bidireccional (cliente-servidor)
- Promedios y estadísticas
- Comentarios detallados
- Sistema de reputación

### **Sistema de Mensajería**

- Chat en tiempo real
- Notificaciones push
- Historial de conversaciones
- Archivos adjuntos

### **Sistema de Asistencia**

- Registro de entrada/salida
- Configuración de horarios por empresa
- Reportes de asistencia
- Notificaciones de tardanzas

### **Sistema de Pagos**

- Integración con Wompi
- Múltiples métodos de pago
- Historial de transacciones
- Estados de pago en tiempo real

## 🎨 Componentes UI

### **Componentes Base**

- `Button` - Botones con variantes
- `Input` - Campos de entrada
- `Dialog` - Modales y diálogos
- `Card` - Tarjetas de contenido
- `Avatar` - Avatares de usuario
- `ImageWithFallback` - Imágenes con fallback

### **Componentes Específicos**

- `UserAvatar` - Avatar con carga de imagen
- `ImageGallery` - Galería de imágenes
- `RatingModal` - Modal de calificaciones
- `CreatePublicationModal` - Modal de creación
- `NotificationBadge` - Badge de notificaciones

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run start        # Iniciar servidor de producción
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos TypeScript
```

## 🚀 Deploy

### **Vercel (Recomendado)**

```bash
npm run build
vercel --prod
```

### **Otros Plataformas**

- **Netlify**: Compatible con Next.js
- **Railway**: Despliegue full-stack
- **Docker**: Containerización completa

## 📊 Monitoreo y Analytics

- **Vercel Analytics**: Métricas de rendimiento
- **Error Tracking**: Captura de errores
- **Performance Monitoring**: Monitoreo de velocidad
- **User Analytics**: Comportamiento de usuarios

## 🔒 Seguridad

- **JWT Tokens**: Autenticación segura
- **CORS**: Configuración de dominios permitidos
- **Input Validation**: Validación de datos
- **XSS Protection**: Protección contra ataques
- **Rate Limiting**: Limitación de requests

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: soporte@suarec.com
- **Documentación**: [docs.suarec.com](https://docs.suarec.com)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/suarec-frontend/issues)

## 🙏 Agradecimientos

- **Next.js Team** por el increíble framework
- **Vercel** por la plataforma de deploy
- **Tailwind CSS** por el sistema de estilos
- **Lucide** por los iconos hermosos
- **NestJS** por el backend robusto

---

**Desarrollado con ❤️ en Colombia para el mundo**

_SUAREC - Conectando talento, construyendo futuro_
