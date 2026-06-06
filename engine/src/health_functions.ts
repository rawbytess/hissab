import { UserError } from "./exceptions";

// Pure health & fitness formulas — no tokens, no units. The wrappers in
// function.ts convert argument units (kg / cm / m / inch) before calling these
// and decide how to surface the result.

// Body Mass Index: weight (kg) / height (m)².
export function bmi(kg: number, meters: number): number {
  if (meters <= 0) throw new UserError(9701);
  return kg / (meters * meters);
}

// Basal Metabolic Rate (kcal/day) — Mifflin–St Jeor equation. Weight in kg,
// height in cm, age in years.
export function bmrMale(kg: number, cm: number, age: number): number {
  return 10 * kg + 6.25 * cm - 5 * age + 5;
}

export function bmrFemale(kg: number, cm: number, age: number): number {
  return 10 * kg + 6.25 * cm - 5 * age - 161;
}

// Body fat percentage — Deurenberg equation from BMI and age:
// BF% = 1.20·BMI + 0.23·age − 10.8·sex − 5.4 (sex = 1 male, 0 female).
export function bodyFatMale(bmiValue: number, age: number): number {
  return 1.2 * bmiValue + 0.23 * age - 16.2;
}

export function bodyFatFemale(bmiValue: number, age: number): number {
  return 1.2 * bmiValue + 0.23 * age - 5.4;
}

// Ideal body weight (kg) — Devine formula. Height in inches.
export function devineMale(inches: number): number {
  return 50 + 2.3 * (inches - 60);
}

export function devineFemale(inches: number): number {
  return 45.5 + 2.3 * (inches - 60);
}

// Predicted maximum heart rate (bpm): 220 − age.
export function maxHeartRate(age: number): number {
  return 220 - age;
}

// Calories burned for an activity: MET · weight(kg) · duration(hours).
export function caloriesBurned(
  met: number,
  kg: number,
  minutes: number,
): number {
  return met * kg * (minutes / 60);
}

// Suggested daily water intake (liters): roughly 33 ml per kg of body weight.
export function waterIntakeLiters(kg: number): number {
  return kg * 0.033;
}
