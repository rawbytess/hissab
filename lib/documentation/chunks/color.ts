export const color = `
## Color operations

### Representations

- Hex (with optional alpha): \`#1c1c1c\`, \`#1c1c1cff\`
- rgb: \`rgb(12, 124, 201)\`
- rgba: \`rgba(12, 124, 201, 0.5)\`
- hsl: \`hsl(60, 0.03703, 0.1058)\`
- Named colors (CSS named colors): \`pink\`, \`red\`, \`steelblue\`
- Color number (single integer): \`1842202\`

### Operations

- Format conversion: \`#ffa2b3 to rgb color\`
- Mixing two colors: \`red + blue\` → \`#800080\`
- Color temperature (Kelvin): \`#ffa2b3 to color temperature\`
- Darker shade (positive number darkens): \`#ffa2b3 + 1.3\`
- Lighter shade (negative number lightens): \`#ffa2b3 - 0.3\`
- Complement / inverse: \`~teal\`

### Examples

User: convert #ffa2b3 to rgb
Expression: \`#ffa2b3 to rgb color\`

User: name of #ff69b4
Expression: \`#ff69b4 to color name\` → hotpink

User: mix red and blue
Expression: \`red + blue\` → \`#800080\`

User: make #ffa2b3 a bit darker
Expression: \`#ffa2b3 + 1.3\`

### Common mistakes

Incorrect: \`#8100ff to rgb\`
Result: errors
Correct: \`#8100ff to rgb color\` → rgb(129, 0, 255)
Why: color conversion targets need the \`color\` keyword: \`to rgb color\`,
\`to hex color\`, \`to rgba color\`, \`to hsl color\`, \`to color name\`,
\`to color number\`, \`to color temperature\`.

Incorrect: \`#8100ff to hex\` (intending a color conversion)
Result: \`#8100ff\` (no error — \`to hex\` is a number-base op, so it no-ops)
Correct: \`#8100ff to hex color\`
Why: without the \`color\` keyword, \`to hex\` is read as a number-system
conversion and does nothing useful to a color.

### Notes

- For shading, \`+ x\` darkens by \`x\` (in HSL lightness space) and \`- x\` lightens
  by \`x\`. The sign convention follows the chroma-js darken/brighten ordering.
`;

export default color;
