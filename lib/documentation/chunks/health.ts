export const health = `
## Health & Fitness

Body-composition and fitness metrics, written as functions with
comma-separated arguments: \`bmi(70, 1.75)\`, \`bmr male(80, 180, 30)\`,
\`calories burned(8, 70, 30)\`.

### Argument conventions

- **Units are accepted and converted.** Weights may carry \`kg\` / \`pound\`
  (converted to kilograms); heights may carry \`m\` / \`cm\` / \`feet\` / \`inch\`.
- **A bare number is metric** — kilograms for weight, and metres for height in
  BMI, centimetres in BMR, centimetres in ideal weight.
  → \`bmi(70, 1.75)\` is 70 kg and 1.75 m; \`bmi(154 pound, 5.9 feet)\` is the same
  person in imperial.
- **Sex-specific formulas are split** into \`… male\` / \`… female\` functions
  (functions take no text arguments).
- Formula standards used: **BMR** = Mifflin–St Jeor, **body fat** = Deurenberg
  (from BMI), **ideal weight** = Devine.

### Body mass & composition

- Body Mass Index: \`bmi(weight, height)\` = weight(kg) / height(m)²
  → \`bmi(70 kg, 1.75 m)\` → 22.8571
- Body fat %: \`body fat male(weight, height, age)\` /
  \`body fat female(weight, height, age)\` (Deurenberg, returns a percentage)
  → \`body fat male(80, 1.8, 30)\` → 20.3296
- Ideal body weight: \`ideal weight male(height)\` /
  \`ideal weight female(height)\` (Devine, returns kilograms)
  → \`ideal weight male(180 cm)\` → 74.9921 kilogram

### Energy

- Basal metabolic rate (kcal/day): \`bmr male(weight, height, age)\` /
  \`bmr female(weight, height, age)\` (Mifflin–St Jeor)
  → \`bmr male(80, 180, 30)\` → 1,780
- Total daily energy expenditure: \`tdee(bmr, activityFactor)\` = bmr · factor
  (1.2 sedentary, 1.375 light, 1.55 moderate, 1.725 very active, 1.9 athlete)
  → \`tdee(1780, 1.55)\` → 2,759
- Calories burned for an activity: \`calories burned(met, weight, minutes)\` =
  MET · weight(kg) · minutes/60
  → \`calories burned(8, 70, 30)\` → 280

### Heart rate & hydration

- Maximum heart rate (bpm): \`max heart rate(age)\` = 220 − age
- Target heart-rate zone (bpm): \`target heart rate(age, intensity)\` =
  (220 − age) · intensity — \`target heart rate(30, 70%)\` → 133
- Suggested daily water (liters): \`water intake(weight)\` ≈ 33 ml per kg
  → \`water intake(70 kg)\` → 2.31 liter

### Examples

User: what's my BMI at 70 kg and 1.75 m?
Expression: \`bmi(70, 1.75)\` → 22.8571

User: resting calories for a 30-year-old man, 80 kg, 180 cm?
Expression: \`bmr male(80, 180, 30)\` → 1,780

User: target heart rate at 70% intensity, age 30?
Expression: \`target heart rate(30, 70%)\` → 133

### Common mistakes

Incorrect: \`bmr(80, 180, 30)\`
Result: errors — there is no unisex \`bmr\`.
Correct: pick \`bmr male(...)\` or \`bmr female(...)\`.

Incorrect: \`bmi(154, 5.9)\` for a 154 lb, 5'9" person
Result: 4.4 — the bare numbers are read as 154 kg and 5.9 m.
Correct: \`bmi(154 pound, 5.9 feet)\` → 21.5999

### Notes

- These are population-formula estimates, not medical advice.
- Intensity in \`target heart rate\` is a percentage: write \`70\` or \`70%\`.
`;

export default health;
