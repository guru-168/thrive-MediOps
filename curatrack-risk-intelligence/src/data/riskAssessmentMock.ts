import type {
  RiskAssessmentInput,
  RiskAssessmentResult,
  RiskContributingFactor,
  RiskLevel,
} from "../types/prenatal";

/**
 * MOCK scoring logic only - there is no real clinical model behind this.
 * It exists so the Risk Assessment workflow is fully interactive in the
 * frontend prototype. The function signature and return shape
 * (RiskAssessmentResult) are deliberately API-response-shaped so this
 * can be swapped for a real backend/model call later without touching
 * the page that calls it - see RiskAssessmentPage's `runAssessment`.
 */
export function computeMockRiskAssessment(input: RiskAssessmentInput): RiskAssessmentResult {
  const factors: RiskContributingFactor[] = [];

  const systolic = input.systolicBP ?? 0;
  const diastolic = input.diastolicBP ?? 0;
  if (systolic >= 160 || diastolic >= 110) {
    factors.push({ label: "Severe-range blood pressure", weight: 30 });
  } else if (systolic >= 140 || diastolic >= 90) {
    factors.push({ label: "Elevated blood pressure", weight: 20 });
  }

  const bmi = input.bmi ?? 0;
  if (bmi >= 35) factors.push({ label: "BMI ≥ 35 (obesity class II+)", weight: 14 });
  else if (bmi >= 30) factors.push({ label: "BMI 30–34.9 (obesity class I)", weight: 9 });

  const age = input.age ?? 0;
  if (age >= 40) factors.push({ label: "Advanced maternal age (40+)", weight: 12 });
  else if (age >= 35) factors.push({ label: "Maternal age 35+", weight: 7 });

  if (input.priorPreeclampsia) factors.push({ label: "History of preeclampsia", weight: 22 });
  if (input.chronicHypertension) factors.push({ label: "Chronic hypertension", weight: 18 });
  if (input.multiplePregnancy) factors.push({ label: "Multiple pregnancy", weight: 14 });
  if (input.previousPretermBirth) factors.push({ label: "Previous preterm birth", weight: 12 });
  if (input.familyHistoryPreeclampsia)
    factors.push({ label: "Family history of preeclampsia", weight: 8 });

  if (input.diabetesStatus === "type1" || input.diabetesStatus === "type2") {
    factors.push({ label: "Pre-existing diabetes", weight: 16 });
  } else if (input.diabetesStatus === "gestational") {
    factors.push({ label: "Gestational diabetes", weight: 10 });
  }

  if (input.smokingStatus === "current") factors.push({ label: "Current smoker", weight: 9 });

  const gestationalAge = input.gestationalAgeWeeks ?? 0;
  if (gestationalAge > 0 && gestationalAge < 34) {
    factors.push({ label: "Early gestational age (<34 weeks)", weight: 6 });
  }

  if (factors.length === 0) {
    factors.push({ label: "No significant risk factors identified", weight: 8 });
  }

  const rawScore = factors.reduce((sum, f) => sum + f.weight, 0);
  const riskScore = Math.max(4, Math.min(96, rawScore + 6));

  let riskLevel: RiskLevel;
  if (riskScore >= 65) riskLevel = "high";
  else if (riskScore >= 35) riskLevel = "moderate";
  else riskLevel = "low";

  const sortedFactors = [...factors].sort((a, b) => b.weight - a.weight).slice(0, 6);

  const interpretation: Record<RiskLevel, string> = {
    high: "Multiple significant risk factors identified. This pregnancy meets criteria for high-risk obstetric monitoring.",
    moderate:
      "Some risk factors present that warrant closer-than-routine monitoring, but no immediate escalation indicated.",
    low: "No significant risk factors identified at this time. Standard prenatal care schedule is appropriate.",
  };

  const monitoring: Record<RiskLevel, string> = {
    high: "Weekly clinical review with BP and urine protein checks; consider maternal-fetal medicine referral.",
    moderate: "Biweekly review with targeted labs/scans based on flagged factors.",
    low: "Standard prenatal visit schedule per gestational age.",
  };

  const action: Record<RiskLevel, string> = {
    high: "Schedule an urgent follow-up within 48 hours and flag for specialist review.",
    moderate: "Schedule a follow-up within 1–2 weeks and monitor flagged factors.",
    low: "Continue routine prenatal care; no additional follow-up required beyond the standard schedule.",
  };

  return {
    riskLevel,
    riskScore,
    contributingFactors: sortedFactors,
    interpretation: interpretation[riskLevel],
    recommendedMonitoring: monitoring[riskLevel],
    recommendedAction: action[riskLevel],
  };
}
