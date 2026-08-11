import { useContext } from "react";
import { QueueContext } from "./QueueContext";

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used inside QueueProvider");
  return ctx;
}