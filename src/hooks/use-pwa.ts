"use client";
import { useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/utils";

interface InstallEvent extends Event { prompt(): Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }
export function usePwa() {
  const [offlineReady, setOfflineReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [updateReady, setUpdateReady] = useState(false);
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [error, setError] = useState("");
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const prompt = useRef<InstallEvent | null>(null);
  const reloading = useRef(false);

  useEffect(() => {
    let active = true;
    const connection = () => setOnline(navigator.onLine);
    const installEvent = (event: Event) => { event.preventDefault(); prompt.current = event as InstallEvent; setInstallable(true); };
    const installedEvent = () => { setInstalled(true); setInstallable(false); prompt.current = null; };
    const checkCache = () => {
      const worker = navigator.serviceWorker?.controller || registration.current?.active;
      worker?.postMessage({ type: "CACHE_STATUS" });
    };
    const onMessage = (event: MessageEvent) => {
      if (!active) return;
      if (event.data?.type === "CACHE_READY") setOfflineReady(event.data.ready === true);
      if (event.data?.type === "UPDATE_BLOCKED") {
        reloading.current = false;
        setError("Tutup tab Jadual Ustaz Alif yang lain, kemudian tekan kemas kini sekali lagi.");
      }
    };
    const controllerChange = () => {
      checkCache();
      if (reloading.current) window.location.reload();
    };
    const initialize = async () => {
      connection();
      setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
      if (!("serviceWorker" in navigator) || !window.isSecureContext) { setError("Sokongan luar talian tidak tersedia dalam pelayar atau sambungan ini."); return; }
      if (process.env.NODE_ENV !== "production") { setError("Cache luar talian hanya diaktifkan pada binaan pengeluaran."); return; }
      try {
        const reg = await navigator.serviceWorker.register(assetPath("sw.js"), { scope: assetPath(""), updateViaCache: "none" });
        if (!active) return;
        registration.current = reg;
        setUpdateReady(!!reg.waiting);
        checkCache();
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (!active) return;
            if (worker.state === "installed") setUpdateReady(!!navigator.serviceWorker.controller && !!reg.waiting);
            if (worker.state === "activated") checkCache();
            if (worker.state === "redundant") setError("Cache belum siap. Cuba muat semula apabila sambungan tersedia.");
          });
        });
      } catch { if (active) setError("Cache belum tersedia. Cuba muat semula apabila sambungan tersedia."); }
    };
    const task = setTimeout(() => void initialize(), 0);
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    window.addEventListener("beforeinstallprompt", installEvent);
    window.addEventListener("appinstalled", installedEvent);
    navigator.serviceWorker?.addEventListener("message", onMessage);
    navigator.serviceWorker?.addEventListener("controllerchange", controllerChange);
    return () => { active = false; clearTimeout(task); window.removeEventListener("online", connection); window.removeEventListener("offline", connection); window.removeEventListener("beforeinstallprompt", installEvent); window.removeEventListener("appinstalled", installedEvent); navigator.serviceWorker?.removeEventListener("message", onMessage); navigator.serviceWorker?.removeEventListener("controllerchange", controllerChange); };
  }, []);

  async function install() {
    const event = prompt.current;
    if (!event) return;
    try { await event.prompt(); await event.userChoice; } catch { setError("Gunakan pilihan pemasangan dalam menu pelayar."); }
    prompt.current = null;
    setInstallable(false);
  }
  function applyUpdate() {
    if (!registration.current?.waiting) return;
    setError("");
    reloading.current = true;
    registration.current.waiting.postMessage({ type: "SKIP_WAITING" });
  }
  return { offlineReady, online, updateReady, installable, installed, error, install, applyUpdate };
}
