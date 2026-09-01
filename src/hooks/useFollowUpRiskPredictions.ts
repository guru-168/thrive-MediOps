import { useEffect, useState } from "react";
import { rankPatients, ApiError } from "../services/api";
import { followUpPatients } from "../data/followUpPatients";
import type { PredictionResult } from "../types/followUp";

/**
 * Shared, session-cached batch risk ranking for the whole demo patient
 * directory. Patients/Follow-ups/Analytics all need "what's this
 * patient's current predicted risk" - rather than each page firing its
 * own /patients/rank call (and each showing a different loading flicker),
 * this hook fetches once per app session and every consumer re-renders
 * off the same cached result.
 *
 * This is the deliberate boundary between "mock" and "live" in this
 * prototype: `followUpPatients` supplies synthetic demographic/
 * appointment-history *inputs* (id, age, distance, etc. - see
 * data/followUpPatients.ts), but the risk score/level/reasons shown
 * anywhere in the UI always come from this live API call, never from
 * static data.
 */

interface CacheState {
  promise: Promise<Map<string, PredictionResult>> | null;
  data: Map<string, PredictionResult> | null;
  error: string | null;
}

const cache: CacheState = { promise: null, data: null, error: null };
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function load(force = false) {
  if (cache.promise && !force) return cache.promise;
  cache.error = null;
  cache.promise = rankPatients(followUpPatients)
    .then((result) => {
      cache.data = result;
      notify();
      return result;
    })
    .catch((err: unknown) => {
      cache.error = err instanceof ApiError ? err.message : "Failed to load risk predictions.";
      cache.promise = null;
      notify();
      throw err;
    });
  return cache.promise;
}

export interface UseFollowUpRiskPredictions {
  predictions: Map<string, PredictionResult> | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFollowUpRiskPredictions(): UseFollowUpRiskPredictions {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    load().catch(() => {
      /* surfaced via cache.error / re-render */
    });
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    predictions: cache.data,
    loading: cache.data === null && cache.error === null,
    error: cache.error,
    refetch: () => {
      cache.data = null;
      notify();
      load(true).catch(() => {});
    },
  };
}
