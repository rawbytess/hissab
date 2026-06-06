// Navigation manifest for the in-app docs. Each page's markdown is loaded
// lazily via a Vite `?raw` dynamic import, so it is code-split into its own
// chunk and fetched only when the page is opened.
//
// This is the base scaffolding — add sections/pages here as content is
// migrated from the website. The syntax reference itself lives in
// lib/documentation/ (the LLM/CLI source of truth); don't duplicate it.

export interface DocPage {
  /** URL slug after `#/docs/`, e.g. "guide/arithmetic". May contain slashes. */
  slug: string;
  title: string;
  load: () => Promise<{ default: string }>;
}

export interface DocSection {
  title: string;
  pages: DocPage[];
}

export const docSections: DocSection[] = [
  {
    title: "Getting Started",
    pages: [
      {
        slug: "introduction",
        title: "Introduction",
        load: () => import("./content/introduction.md?raw"),
      },
      {
        slug: "getting-started/writing-expressions",
        title: "Writing Expressions",
        load: () =>
          import("./content/getting-started/writing-expressions.md?raw"),
      },
      {
        slug: "getting-started/install",
        title: "Install Hissab",
        load: () => import("./content/getting-started/install.md?raw"),
      },
      {
        slug: "getting-started/engine-library",
        title: "Hissab Engine Library",
        load: () => import("./content/getting-started/engine-library.md?raw"),
      },
      {
        slug: "getting-started/cli",
        title: "Hissab CLI",
        load: () => import("./content/getting-started/cli.md?raw"),
      },
      {
        slug: "getting-started/ai-calculations",
        title: "AI Calculations",
        load: () => import("./content/getting-started/ai-calculations.md?raw"),
      },
      {
        slug: "getting-started/skills",
        title: "Hissab Agent Skills",
        load: () => import("./content/getting-started/skills.md?raw"),
      },
      {
        slug: "getting-started/faq",
        title: "FAQs",
        load: () => import("./content/getting-started/faq.md?raw"),
      },
    ],
  },
  {
    title: "Calculator Guide",
    pages: [
      {
        slug: "guide/arithmetic",
        title: "Arithmetic",
        load: () => import("./content/guide/arithmetic.md?raw"),
      },
      {
        slug: "guide/number-theory",
        title: "Number Theory",
        load: () => import("./content/guide/number-theory.md?raw"),
      },
      {
        slug: "guide/random",
        title: "Random & IDs",
        load: () => import("./content/guide/random.md?raw"),
      },
      {
        slug: "guide/percentages",
        title: "Percentages",
        load: () => import("./content/guide/percentages.md?raw"),
      },
      {
        slug: "guide/finance",
        title: "Finance",
        load: () => import("./content/guide/finance.md?raw"),
      },
      {
        slug: "guide/health",
        title: "Health & Fitness",
        load: () => import("./content/guide/health.md?raw"),
      },
      {
        slug: "guide/unit-conversion",
        title: "Unit Conversion",
        load: () => import("./content/guide/unit-conversion.md?raw"),
      },
      {
        slug: "guide/compound-units",
        title: "Compound Units",
        load: () => import("./content/guide/compound-units.md?raw"),
      },
      {
        slug: "guide/sets-combinatorics",
        title: "Sets And Combinatorics",
        load: () => import("./content/guide/sets-combinatorics.md?raw"),
      },
      {
        slug: "guide/logarithms",
        title: "Logarithms",
        load: () => import("./content/guide/logarithms.md?raw"),
      },
      {
        slug: "guide/symbolic-algebra",
        title: "Symbolic Algebra",
        load: () => import("./content/guide/symbolic-algebra.md?raw"),
      },
    ],
  },
  {
    title: "Science & Data",
    pages: [
      {
        slug: "science-data/statistics",
        title: "Statistics",
        load: () => import("./content/science-data/statistics.md?raw"),
      },
      {
        slug: "science-data/probability",
        title: "Probability",
        load: () => import("./content/science-data/probability.md?raw"),
      },
      {
        slug: "science-data/trigonometry",
        title: "Trigonometry",
        load: () => import("./content/science-data/trigonometry.md?raw"),
      },
      {
        slug: "science-data/geometry",
        title: "Geometry",
        load: () => import("./content/science-data/geometry.md?raw"),
      },
      {
        slug: "science-data/date-time",
        title: "Date & Time",
        load: () => import("./content/science-data/date-time.md?raw"),
      },
      {
        slug: "science-data/number-systems",
        title: "Number Systems",
        load: () => import("./content/science-data/number-systems.md?raw"),
      },
      {
        slug: "science-data/complex-numbers",
        title: "Complex Numbers",
        load: () => import("./content/science-data/complex-numbers.md?raw"),
      },
      {
        slug: "science-data/coordinate-systems",
        title: "Coordinate Systems",
        load: () => import("./content/science-data/coordinate-systems.md?raw"),
      },
      {
        slug: "science-data/matrices",
        title: "Matrices",
        load: () => import("./content/science-data/matrices.md?raw"),
      },
      {
        slug: "science-data/graphing",
        title: "Graphing",
        load: () => import("./content/science-data/graphing.md?raw"),
      },
      {
        slug: "science-data/bitwise",
        title: "Bitwise Operations",
        load: () => import("./content/science-data/bitwise.md?raw"),
      },
      {
        slug: "science-data/ip-addresses",
        title: "IP Addresses",
        load: () => import("./content/science-data/ip-addresses.md?raw"),
      },
      {
        slug: "science-data/colors",
        title: "Colors",
        load: () => import("./content/science-data/colors.md?raw"),
      },
      {
        slug: "science-data/hashing",
        title: "Hashing",
        load: () => import("./content/science-data/hashing.md?raw"),
      },
    ],
  },
  {
    title: "Workflow",
    pages: [
      {
        slug: "workflow/labels-references",
        title: "Labels And References",
        load: () => import("./content/workflow/labels-references.md?raw"),
      },
      {
        slug: "workflow/syntax-pitfalls",
        title: "Common Syntax Pitfalls",
        load: () => import("./content/workflow/syntax-pitfalls.md?raw"),
      },
    ],
  },
  {
    title: "Reference",
    pages: [
      {
        slug: "reference/operators",
        title: "Operators & Precedence",
        load: () => import("./content/reference/operators.md?raw"),
      },
      {
        slug: "reference/functions",
        title: "Functions",
        load: () => import("./content/reference/functions.md?raw"),
      },
      {
        slug: "reference/units",
        title: "Units & Prefixes",
        load: () => import("./content/reference/units.md?raw"),
      },
    ],
  },
];

export const defaultDocSlug = "introduction";

const pagesBySlug = new Map(
  docSections
    .flatMap((section) => section.pages)
    .map((page) => [page.slug, page]),
);

export function findDoc(slug: string): DocPage | undefined {
  return pagesBySlug.get(slug);
}
