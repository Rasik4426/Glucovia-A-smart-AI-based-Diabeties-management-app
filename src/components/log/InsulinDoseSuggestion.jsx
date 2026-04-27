import React from 'react';
import { Syringe, AlertTriangle, Info } from 'lucide-react';

/**
 * Correction dose using 1500 Rule:
 *   IS Ratio = 1500 / Total Daily Dose (actrapid)
 *   Correction dose = (Current BG - Target BG) / IS Ratio
 */
export function calculateISRatio(tdd) {
  const t = parseFloat(tdd) || 0;
  if (t <= 0) return null;
  return Math.round(1500 / t);
}

export function calculateCorrectionDose({ currentGlucose, targetGlucose, isRatio }) {
  const bg = parseFloat(currentGlucose) || 0;
  const target = parseFloat(targetGlucose) || 140;
  const isr = parseFloat(isRatio) || 0;
  if (isr <= 0 || bg <= target) return 0;
  return Math.round(((bg - target) / isr) * 10) / 10;
}

export default function InsulinDoseSuggestion({ currentGlucose, targetGlucose = 140, tdd, isRatio }) {
  const bg = parseFloat(currentGlucose);
  if (!bg || bg <= 0) return null;

  // Compute IS ratio from TDD if not directly provided
  const computedISRatio = isRatio || calculateISRatio(tdd);
  if (!computedISRatio) return null;

  const correctionDose = calculateCorrectionDose({ currentGlucose, targetGlucose, isRatio: computedISRatio });
  const needsCorrection = bg > parseFloat(targetGlucose || 140);

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Syringe className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-purple-800 text-sm">Insulin Correction Dose Guidance</h3>
      </div>

      {/* IS Ratio Info */}
      <div className="bg-white rounded-xl p-3 border border-purple-100 text-sm flex items-start gap-2">
        <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-slate-500">Your IS Ratio (1500 ÷ {tdd || '?'} units)</p>
          <p className="text-lg font-bold text-purple-700">1 unit drops BG by ~{computedISRatio} mg/dL</p>
        </div>
      </div>

      {/* Correction dose breakdown */}
      <div className="bg-white rounded-xl p-3 border border-purple-100">
        <p className="text-xs text-slate-500 mb-1">Correction Calculation</p>
        <p className="text-xs text-slate-400 mb-2">
          ({bg} − {targetGlucose}) ÷ {computedISRatio} = <strong>{correctionDose} unit{correctionDose !== 1 ? 's' : ''}</strong>
        </p>
        {needsCorrection ? (
          <div className="bg-purple-100 rounded-lg p-3">
            <p className="text-xs text-purple-600">Suggested Correction Dose</p>
            <p className="text-3xl font-extrabold text-purple-800">{correctionDose} unit{correctionDose !== 1 ? 's' : ''}</p>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-sm font-bold text-green-700">✅ Blood sugar is at or below target — no correction needed!</p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>Guidance only.</strong> Always confirm with your doctor or parent before taking insulin. This is not a medical prescription.
        </p>
      </div>
    </div>
  );
}