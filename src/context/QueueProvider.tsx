import { useState, type ReactNode } from "react";
import { layananList } from "../data/layanan";
import { QueueContext, type LoketStatus } from "./QueueContext";

export function QueueProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    layananList.forEach((l) => (initial[l.id] = l.jumlahAntrianAwal));
    return initial;
  });

  const [currentServing, setCurrentServing] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    layananList.forEach((l) => (initial[l.id] = 0));
    return initial;
  });

  const [loketStatus, setLoketStatus] = useState<Record<string, LoketStatus>>(() => {
    const initial: Record<string, LoketStatus> = {};
    layananList.forEach((l) => (initial[l.id] = "buka"));
    return initial;
  });

  const ambilAntrian = (id: string) => {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const panggilSelanjutnya = (id: string) => {
    setCurrentServing((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const tutupLoket = (id: string) => {
    setLoketStatus((prev) => ({ ...prev, [id]: "tutup" }));
  };

  const bukaLoket = (id: string) => {
    setLoketStatus((prev) => ({ ...prev, [id]: "buka" }));
  };

  const resetSemuaAntrian = () => {
    const resetCounts: Record<string, number> = {};
    const resetServing: Record<string, number> = {};
    const resetStatus: Record<string, LoketStatus> = {};
    layananList.forEach((l) => {
      resetCounts[l.id] = 0;
      resetServing[l.id] = 0;
      resetStatus[l.id] = "buka";
    });
    setCounts(resetCounts);
    setCurrentServing(resetServing);
    setLoketStatus(resetStatus);
  };

  return (
    <QueueContext.Provider
      value={{
        counts,
        currentServing,
        loketStatus,
        ambilAntrian,
        panggilSelanjutnya,
        tutupLoket,
        bukaLoket,
        resetSemuaAntrian,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}