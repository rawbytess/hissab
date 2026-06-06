# Health & Fitness

Body-composition and fitness metrics, written as functions with
comma-separated arguments.

```hissab
bmi(70, 1.75)
bmr male(80, 180, 30)
calories burned(8, 70, 30)
target heart rate(30, 70%)
```

## Argument conventions

- **Units are accepted and converted.** Weights take `kg` or `pound`; heights
  take `m`, `cm`, `feet`, or `inch`.
- **A bare number is metric** — kilograms for weight, metres for height in BMI,
  and centimetres for height in BMR and ideal weight.
- **Sex-specific formulas are split** into `… male` / `… female` functions.

Formula standards: **BMR** is Mifflin–St Jeor, **body fat** is Deurenberg (from
BMI), and **ideal weight** is Devine.

## Body mass and composition

| Function | Description | Example |
| ------------------------------ | ------------------------------- | --------------------------- |
| `bmi(weight, height)` | Body Mass Index, weight(kg)/height(m)² | `bmi(70, 1.75)` |
| `body fat male(w, h, age)` | Body fat % (Deurenberg) | `body fat male(80, 1.8, 30)` |
| `body fat female(w, h, age)` | Body fat % (Deurenberg) | `body fat female(65, 1.68, 28)` |
| `ideal weight male(height)` | Ideal body weight, kg (Devine) | `ideal weight male(180 cm)` |
| `ideal weight female(height)` | Ideal body weight, kg (Devine) | `ideal weight female(165 cm)` |

```hissab
bmi(70 kg, 1.75 meter)
bmi(154 pound, 5.9 feet)
body fat male(80, 1.8, 30)
ideal weight male(180 cm)
```

## Energy

| Function | Description | Example |
| ----------------------------------------- | ------------------------------- | --------------------------- |
| `bmr male(w, h, age)` | Basal metabolic rate, kcal/day | `bmr male(80, 180, 30)` |
| `bmr female(w, h, age)` | Basal metabolic rate, kcal/day | `bmr female(65, 168, 28)` |
| `tdee(bmr, activityFactor)` | Total daily energy expenditure | `tdee(1780, 1.55)` |
| `calories burned(met, weight, minutes)` | Calories for an activity | `calories burned(8, 70, 30)` |

Activity factors for `tdee`: 1.2 sedentary, 1.375 light, 1.55 moderate, 1.725
very active, 1.9 athlete.

```hissab
bmr male(80, 180, 30)
tdee(1780, 1.55)
calories burned(8, 70, 30)
```

## Heart rate and hydration

| Function | Description | Example |
| ------------------------------------ | ------------------------------- | --------------------------- |
| `max heart rate(age)` | Maximum heart rate, bpm (220 − age) | `max heart rate(30)` |
| `target heart rate(age, intensity)` | Target heart-rate zone, bpm | `target heart rate(30, 70%)` |
| `water intake(weight)` | Suggested daily water (~33 ml/kg) | `water intake(70 kg)` |

```hissab
max heart rate(30)
target heart rate(30, 70%)
water intake(70 kg)
```

## Common mistakes

:::caution

- **`bmr(80, 180, 30)`** errors — there is no unisex `bmr`. Pick `bmr male(...)`
  or `bmr female(...)`.
- **`bmi(154, 5.9)`** for a 154 lb, 5'9" person returns `4.4` — the bare numbers
  are read as 154 kg and 5.9 m. Use `bmi(154 pound, 5.9 feet)`.
- Intensity in `target heart rate` is a percentage: write `70` or `70%`.

:::

:::note

These are population-formula estimates, not medical advice.

:::
