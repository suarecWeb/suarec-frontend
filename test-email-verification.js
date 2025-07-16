// Script de prueba para verificar el endpoint de email verification
// Ejecutar con: node test-email-verification.js

const axios = require("axios");

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/suarec`;

async function testEmailVerification() {
  console.log("🧪 Probando endpoint de email verification...");
  console.log("🌐 API Base URL:", API_BASE_URL);

  try {
    // Probar el endpoint de envío de email
    console.log("\n📧 Probando POST /email-verification/send...");
    const sendResponse = await axios.post(
      `${API_BASE_URL}/email-verification/send`,
      {
        userId: 1,
        email: "test@example.com",
      },
    );
    console.log("✅ Respuesta:", sendResponse.data);
  } catch (error) {
    console.log("❌ Error en /email-verification/send:");
    console.log("   Status:", error.response?.status);
    console.log("   Data:", error.response?.data);
    console.log("   Message:", error.message);
  }

  try {
    // Probar el endpoint de verificación
    console.log("\n🔍 Probando POST /email-verification/verify...");
    const verifyResponse = await axios.post(
      `${API_BASE_URL}/email-verification/verify`,
      {
        token: "test-token",
      },
    );
    console.log("✅ Respuesta:", verifyResponse.data);
  } catch (error) {
    console.log("❌ Error en /email-verification/verify:");
    console.log("   Status:", error.response?.status);
    console.log("   Data:", error.response?.data);
    console.log("   Message:", error.message);
  }

  try {
    // Probar el endpoint de reenvío
    console.log("\n🔄 Probando POST /email-verification/resend...");
    const resendResponse = await axios.post(
      `${API_BASE_URL}/email-verification/resend`,
      {
        email: "test@example.com",
      },
    );
    console.log("✅ Respuesta:", resendResponse.data);
  } catch (error) {
    console.log("❌ Error en /email-verification/resend:");
    console.log("   Status:", error.response?.status);
    console.log("   Data:", error.response?.data);
    console.log("   Message:", error.message);
  }
}

testEmailVerification().catch(console.error);
