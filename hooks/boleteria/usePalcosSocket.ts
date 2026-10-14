"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { AvisoPalcoAdmin } from "@/interfaces/palcos.interface";

export type LiveStatus =
  | { status: "connecting" }
  | { status: "live" }
  | { status: "offline"; motivo: string };

const NAMESPACE = "/boleteria/palcos";
const JOIN_TIMEOUT_MS = 10000;

// Live palco notices of one event (admin room). onJoined runs after every
// (re)join so the map is fetched again and nothing is missed
export function usePalcosSocket(
  eventoId: number,
  onAviso: (aviso: AvisoPalcoAdmin) => void,
  onJoined: () => void,
): LiveStatus {
  const [live, setLive] = useState<LiveStatus>({ status: "connecting" });
  const handlers = useRef({ onAviso, onJoined });
  useEffect(() => {
    handlers.current = { onAviso, onJoined };
  });

  useEffect(() => {
    let joined = false;
    let closed = false;
    setLive({ status: "connecting" });

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.suarec.com"}${NAMESPACE}`,
      {
        // Read on every attempt, so a renewed token is used
        auth: (cb) => cb({ token: Cookies.get("token") }),
        // Polling does not survive behind the load balancer
        transports: ["websocket"],
        // Retries without limit, waiting longer each time (up to 10 s)
        reconnectionDelayMax: 10000,
      },
    );

    const join = async () => {
      setLive({ status: "connecting" });
      try {
        const answer = await socket
          .timeout(JOIN_TIMEOUT_MS)
          .emitWithAck("join", { eventoId, admin: true });
        if (closed) return;
        if (answer?.ok) {
          joined = true;
          setLive({ status: "live" });
          handlers.current.onJoined();
          return;
        }
        // Closed, finished or sold out: nothing to listen to
        setLive({
          status: "offline",
          motivo: answer?.motivo ?? "No se pudo conectar",
        });
        socket.disconnect();
      } catch {
        if (!closed && socket.connected) {
          setLive({ status: "offline", motivo: "El servidor no respondió" });
        }
      }
    };

    socket.on("connect", join);
    socket.on("palco:state", (aviso: AvisoPalcoAdmin) => {
      if (aviso?.eventoId === eventoId) handlers.current.onAviso(aviso);
    });
    socket.on("connect_error", (error) => {
      let motivo = "Reconectando…";
      if (!socket.active) {
        motivo = error.message.startsWith("Unauthorized")
          ? "No se pudo validar tu sesión"
          : "No se pudo conectar";
      }
      setLive({ status: "offline", motivo });
    });
    socket.on("disconnect", (reason) => {
      joined = false;
      // Own disconnect (rejected join): keep its reason on screen
      if (reason === "io client disconnect") return;
      setLive({
        status: "offline",
        motivo: socket.active
          ? "Reconectando…"
          : "El servidor cerró la conexión",
      });
    });

    // Back on the tab: catch up, or try again
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (joined) handlers.current.onJoined();
      else if (socket.connected) join();
      else if (!socket.active) socket.connect();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      closed = true;
      document.removeEventListener("visibilitychange", onVisible);
      socket.off();
      socket.disconnect();
    };
  }, [eventoId]);

  return live;
}
