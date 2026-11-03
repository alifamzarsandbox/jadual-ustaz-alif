"use client";
import { Sheet } from "./sheet";
import { Button } from "./button";

export function ConfirmSheet({ title, message, confirmLabel, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void;
}) {
  return <Sheet title={title} onClose={onCancel}><p>{message}</p><div className="settings-buttons"><Button variant="outline" data-sheet-initial-focus onClick={onCancel}>Batal</Button><Button className="danger-button" variant="outline" onClick={onConfirm}>{confirmLabel}</Button></div></Sheet>;
}
