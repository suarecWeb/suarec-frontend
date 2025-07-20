import Cookies from "js-cookie";

export const logOut = async () => {
  Cookies.remove("email");
  Cookies.remove("role");
  Cookies.remove("token");

  // Forzar actualización del estado global
  if (typeof window !== "undefined") {
    // Disparar un evento personalizado para notificar a los componentes
    window.dispatchEvent(
      new CustomEvent("authStateChanged", {
        detail: { isLoggedIn: false },
      }),
    );

    // Limpiar cualquier estado en localStorage si existe
    localStorage.removeItem("userData");
    sessionStorage.clear();
  }
};
