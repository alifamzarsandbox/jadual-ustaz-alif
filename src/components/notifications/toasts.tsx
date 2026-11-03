import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ToastMessage } from "@/types/planner";

export function Toasts({ messages, dismiss }: { messages: ToastMessage[]; dismiss: (id: string) => void }) {
  return <div className="toast-stack" aria-live="polite" aria-atomic="false"><AnimatePresence>{messages.map((message) => <motion.div key={message.id} className="toast-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><div><strong>{message.title}</strong>{message.body && <p>{message.body}</p>}</div><button type="button" aria-label={`Tutup mesej: ${message.title}`} onClick={() => dismiss(message.id)}><X aria-hidden="true" /></button></motion.div>)}</AnimatePresence></div>;
}
