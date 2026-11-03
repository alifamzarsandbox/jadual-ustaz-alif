"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

let openSheets = 0;
let previousOverflow = "";

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    if (openSheets === 0) previousOverflow = document.body.style.overflow;
    openSheets++;
    element.showModal();
    element.querySelector<HTMLElement>("[data-sheet-initial-focus]")?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    return () => { element.close(); openSheets--; if (openSheets === 0) document.body.style.overflow = previousOverflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); else document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={dialog} className="bottom-sheet" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); event.stopPropagation(); close.current(); }}><div className="sheet-handle" aria-hidden="true" /><div className="sheet-header"><h2 id={titleId}>{title}</h2><Button variant="ghost" size="icon" aria-label="Tutup" onClick={onClose}><X aria-hidden="true" /></Button></div><div className="sheet-content">{children}</div></dialog>;
}
