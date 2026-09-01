import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, getHealth, predictRisk, rankPatients } from "./api";
import type { FollowUpPatient } from "../types/followUp";
import type { PredictionFormInput } from "../types/followUp";

/**
 * Frontend/backend integration-contract tests for the ONLY module that
 * talks to the API (services/api.ts). These pin down the wire shape
 * (camelCase frontend <-> snake_case backend) and error handling that a
 * silent regression here would otherwise slip through TypeScript - see
 * the real bug this test suite was written to catch: rankPatients once
 * sent camelCase field names straight to the backend and every request
 * failed 422 validation.
 */

function mockFetchOnce(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const VALID_INPUT: PredictionFormInput = {
  patientId: "P001",
  patientName: "Jordan Lee",
  age: 45,
  gender: "F",
  neighbourhood: "JARDIM DA PENHA",
  scholarship: 0,
  hipertension: 1,
  diabetes: 0,
  alcoholism: 0,
  handcap: 0,
  smsReceived: 1,
  waitingTimeDays: 7,
  appointmentDayOfWeek: 2,
  appointmentMonth: 9,
  scheduledHour: 10,
  previousAppointments: 8,
  previousNoShows: 3,
  daysSincePreviousAppointment: 14,
  distanceKm: 18,
  treatmentDurationMonths: 6,
  appointmentFrequencyDays: 14,
  totalAppointments: 8,
  missedAppointments: 3,
};


const PREDICTION_RESPONSE_BODY = {
  patient_id: "P001",
  patient_name: "Jordan Lee",
  risk_score: 0.52,
  risk_percent: 52,
  risk_level: "moderate",
  intervention_required: true,
  reasons: [
    {
      factor: "missed_appointments",
      label: "Previous missed appointments",
      value: "3 of 8 missed (38% no-show rate)",
      impact: "high",
      contribution_percent: 38,
    },
  ],
  summary: "This patient is at MODERATE risk...",
  recommended_action: "Send a reminder 48-72 hours before the appointment.",
  model_type: "rule_based",
  generated_at: "2026-09-01T12:00:00Z",
};

describe("predictRisk", () => {
  it("sends the request body in the backend's snake_case wire format", async () => {
    const fetchMock = mockFetchOnce(200, PREDICTION_RESPONSE_BODY);
    await predictRisk(VALID_INPUT);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/predict");
    const sentBody = JSON.parse(init.body as string);
    expect(sentBody.patient_id).toBe("P001");
    expect(sentBody.patient_name).toBe("Jordan Lee");
    expect(sentBody.age).toBe(45);
    expect(sentBody.previous_appointments).toBe(8);
    expect(sentBody.previous_no_shows).toBe(3);
    // Every key must be snake_case - no leftover camelCase fields.
    for (const key of Object.keys(sentBody)) {
      expect(key).not.toMatch(/[A-Z]/);
    }
  });

  it("maps the snake_case response back into the frontend's PredictionResult shape", async () => {
    mockFetchOnce(200, PREDICTION_RESPONSE_BODY);
    const result = await predictRisk(VALID_INPUT);

    expect(result).toEqual({
      riskLevel: "moderate",
      riskScore: 52,
      interventionRequired: true,
      reasons: [
        {
          factor: "missed_appointments",
          label: "Previous missed appointments",
          value: "3 of 8 missed (38% no-show rate)",
          impact: "high",
          contributionPercent: 38,
        },
      ],
      summary: "This patient is at MODERATE risk...",
      recommendedAction: "Send a reminder 48-72 hours before the appointment.",
      modelType: "rule_based",
    });
  });

  it("throws an ApiError carrying the backend's detail message on a non-2xx response", async () => {
    mockFetchOnce(422, { detail: "Invalid request data." });
    await expect(predictRisk(VALID_INPUT)).rejects.toMatchObject({
      name: "ApiError",
      message: "Invalid request data.",
      status: 422,
    });
  });

  it("throws an ApiError (not a raw exception) when the network request fails outright", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(predictRisk(VALID_INPUT)).rejects.toBeInstanceOf(ApiError);
  });

  it("refuses to call the API with incomplete form input", async () => {
    const fetchMock = mockFetchOnce(200, PREDICTION_RESPONSE_BODY);
    await expect(predictRisk({ ...VALID_INPUT, age: null })).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("rankPatients", () => {
  const patients: FollowUpPatient[] = [
    {
      id: "MB-1042",
      name: "Amara Chen",
      age: 34,
      distanceKm: 42,
      treatmentDurationMonths: 8,
      appointmentFrequencyDays: 14,
      totalAppointments: 12,
      missedAppointments: 5,
      treatmentType: "Hypertension management",
      assignedClinician: "Dr. A. Smith",
      lastAppointmentDate: "2026-08-30",
      nextFollowUpDate: "2026-09-02",
    },
  ];

  it("sends each patient in the backend's snake_case wire format (regression: previously sent camelCase and always 422'd)", async () => {
    const fetchMock = mockFetchOnce(200, [{ ...PREDICTION_RESPONSE_BODY, patient_id: "MB-1042" }]);
    await rankPatients(patients);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/patients/rank");
    const sentBody = JSON.parse(init.body as string);
    expect(sentBody.patients).toHaveLength(1);
    expect(sentBody.patients[0].patient_id).toBe("MB-1042");
    expect(sentBody.patients[0].age).toBe(34);
    // Every key must be snake_case - no leftover camelCase fields.
    for (const key of Object.keys(sentBody.patients[0])) {
      expect(key).not.toMatch(/[A-Z]/);
    }
  });


  it("returns a Map keyed by patient_id, matching the backend's ranked order", async () => {
    mockFetchOnce(200, [
      { ...PREDICTION_RESPONSE_BODY, patient_id: "HIGH1", risk_level: "high" },
      { ...PREDICTION_RESPONSE_BODY, patient_id: "LOW1", risk_level: "low" },
    ]);
    const result = await rankPatients(patients);

    expect([...result.keys()]).toEqual(["HIGH1", "LOW1"]);
    expect(result.get("HIGH1")?.riskLevel).toBe("high");
    expect(result.get("LOW1")?.riskLevel).toBe("low");
  });
});

describe("getHealth", () => {
  it("maps the snake_case health response into camelCase", async () => {
    mockFetchOnce(200, {
      status: "ok",
      app_name: "Patient Follow-up Risk Predictor API",
      app_version: "0.1.0",
      model_type: "rule_based",
      model_loaded: false,
    });
    const health = await getHealth();
    expect(health).toEqual({
      status: "ok",
      appName: "Patient Follow-up Risk Predictor API",
      appVersion: "0.1.0",
      modelType: "rule_based",
      modelLoaded: false,
    });
  });
});
