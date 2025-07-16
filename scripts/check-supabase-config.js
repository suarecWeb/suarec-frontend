// Script para verificar la configuración de Supabase
// Ejecutar con: node scripts/check-supabase-config.js

console.log("🔍 Verificando configuración de Supabase...\n");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("📋 Variables de entorno:");
console.log(
  "NEXT_PUBLIC_SUPABASE_URL:",
  supabaseUrl ? "✅ Configurada" : "❌ No configurada",
);
console.log(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  supabaseKey ? "✅ Configurada" : "❌ No configurada",
);

if (!supabaseUrl || !supabaseKey) {
  console.log("\n❌ ERROR: Faltan variables de entorno");
  console.log("📝 Crea un archivo .env.local con:");
  console.log("NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co");
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key");
  process.exit(1);
}

// Verificar formato de URL
if (!supabaseUrl.startsWith("https://")) {
  console.log("\n❌ ERROR: NEXT_PUBLIC_SUPABASE_URL debe empezar con https://");
  console.log("❌ URL actual:", supabaseUrl);
  console.log("✅ Ejemplo correcto: https://xkwybhxcytfhnqrdvcel.supabase.co");
  process.exit(1);
}

// Verificar formato de anon key
if (!supabaseKey.startsWith("eyJ")) {
  console.log(
    "\n❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY debe ser una JWT válida",
  );
  console.log("❌ Key actual:", supabaseKey.substring(0, 20) + "...");
  console.log("✅ Ejemplo correcto: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
  process.exit(1);
}

console.log("\n✅ Configuración de Supabase correcta!");
console.log("🌐 URL:", supabaseUrl);
console.log("🔑 Key:", supabaseKey.substring(0, 20) + "...");
