# Colors

Color operations cover conversion, mixing, shading, complements, and color
temperature.

## Representations

- **Hex** (optional alpha) — `#1c1c1c`, `#1c1c1cff`
- **RGB** — `rgb(12, 124, 201)`
- **RGBA** — `rgba(12, 124, 201, 0.5)`
- **HSL** — `hsl(60, 0.03703, 0.1058)`
- **CSS named colors** — `pink`, `red`, `steelblue`
- **Color number** — `1842202`

```hissab
#1c1c1c
rgb(12, 124, 201)
rgba(12, 124, 201, 0.5)
hsl(60, 0.03703, 0.1058)
pink
1842202 to hex color
```

## Operations

- **Format conversion** — `#ffa2b3 to rgb color`
- **Mix colors** — `red + blue`
- **Color temperature** — `#ffa2b3 to color temperature`
- **Darken** — `#ffa2b3 + 1.3`
- **Lighten** — `#ffa2b3 - 0.3`
- **Complement / inverse** — `~teal`

```hissab
#ffa2b3 to rgb color
#ff69b4 to color name
red + blue
#ffa2b3 + 1.3
#ffa2b3 - 0.3
~teal
```

Conversion targets include `rgb color`, `hex color`, `rgba color`, `hsl color`,
`color name`, `color number`, and `color temperature`.

:::tip

For shading, **positive values darken** and **negative values lighten**.

:::

## Common mistakes

:::caution

- **`#8100ff to rgb`** is invalid — include the `color` keyword:
  `#8100ff to rgb color`.
- **`#8100ff to hex`** is a number-base operation, not a color conversion. Use
  `#8100ff to hex color`.

:::

```hissab
#8100ff to rgb color
#8100ff to hex color
```
