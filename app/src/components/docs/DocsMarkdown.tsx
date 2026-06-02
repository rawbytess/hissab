import { Check, Copy } from "lucide-react";
import {
  isValidElement,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button.tsx";
import { HissabExample } from "./HissabExample.tsx";

interface MdastNode {
  type: string;
  name?: string;
  data?: { hName?: string; hProperties?: Record<string, unknown> };
  children?: MdastNode[];
}

const CALLOUT_KINDS = new Set(["tip", "note", "caution", "warning", "danger"]);

// remark-directive parses `:::tip … :::` into container-directive nodes; this
// transform maps the supported kinds to styled <div> callouts so remark-rehype
// can render them (styles live in styles/docs.css).
function remarkHissabCallouts() {
  const visit = (node: MdastNode): void => {
    if (
      node.type === "containerDirective" &&
      node.name &&
      CALLOUT_KINDS.has(node.name)
    ) {
      const data = node.data ?? {};
      data.hName = "div";
      data.hProperties = {
        className: `docs-callout docs-callout-${node.name}`,
      };
      node.data = data;
    }
    node.children?.forEach(visit);
  };
  return (tree: unknown) => visit(tree as MdastNode);
}

const HISSAB_LANG = /\blanguage-hissab\b/;
const TS_LANGS = new Set([
  "ts",
  "tsx",
  "typescript",
  "javascript",
  "js",
  "jsx",
]);
const SHELL_LANGS = new Set(["sh", "shell", "bash", "zsh"]);
const COPY_RESET_MS = 1600;
const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn"] as const;

type PackageManager = (typeof PACKAGE_MANAGERS)[number];

const TYPESCRIPT_KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "of",
  "return",
  "satisfies",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "var",
]);

const TYPESCRIPT_TOKEN =
  /(\/\/.*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,:;<>?=+\-*/%|&!]+)/g;

function codeText(children: ReactNode): string {
  return String(children).replace(/\n$/, "");
}

function languageFromClassName(className?: string) {
  return className?.match(/language-([\w-]+)/)?.[1]?.toLowerCase();
}

function languageLabel(language?: string) {
  if (!language) return "Code";
  if (language === "ts" || language === "tsx" || language === "typescript")
    return "TypeScript";
  if (language === "js" || language === "jsx" || language === "javascript")
    return "JavaScript";
  if (SHELL_LANGS.has(language)) return "Terminal";
  return language;
}

function parseNpmInstallCommand(command: string) {
  const lines = command
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length !== 1) return null;

  const match = lines[0].match(/^npm install\s+(?:(-g|--global)\s+)?(.+)$/);
  if (!match) return null;

  const isGlobal = Boolean(match[1]);
  const packages = match[2].trim();
  if (!packages || packages.startsWith("-")) return null;

  return {
    npm: `npm install ${isGlobal ? "-g " : ""}${packages}`,
    pnpm: `pnpm add ${isGlobal ? "-g " : ""}${packages}`,
    yarn: isGlobal ? `yarn global add ${packages}` : `yarn add ${packages}`,
  };
}

function tokenClass(token: string, offset: number, source: string) {
  if (token.startsWith("//") || token.startsWith("/*")) return "comment";
  if (/^['"`]/.test(token)) return "string";
  if (/^\d/.test(token)) return "number";
  if (TYPESCRIPT_KEYWORDS.has(token)) return "keyword";
  if (/^[A-Z]/.test(token)) return "type";

  const rest = source.slice(offset + token.length);
  if (/^[\s\n]*\(/.test(rest)) return "function";
  return undefined;
}

function renderTypeScript(code: string) {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of code.matchAll(TYPESCRIPT_TOKEN)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(code.slice(cursor, index));

    const kind = tokenClass(token, index, code);
    nodes.push(
      kind ? (
        <span className={`docs-token-${kind}`} key={`${index}-${token}`}>
          {token}
        </span>
      ) : (
        token
      ),
    );
    cursor = index + token.length;
  }

  if (cursor < code.length) nodes.push(code.slice(cursor));
  return nodes;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    return () => window.clearTimeout(id);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="docs-code-copy"
      aria-label={copied ? "Copied" : "Copy code"}
      title={copied ? "Copied" : "Copy code"}
      onClick={handleCopy}
    >
      {copied ? (
        <Check data-icon="inline-start" />
      ) : (
        <Copy data-icon="inline-start" />
      )}
    </Button>
  );
}

function CodeSurface({
  code,
  language,
  label,
  showHeader = true,
}: {
  code: string;
  language?: string;
  label?: string;
  showHeader?: boolean;
}) {
  const highlighted = language && TS_LANGS.has(language);

  return (
    <div className="docs-code-block">
      {showHeader && (
        <div className="docs-code-head">
          <span>{label ?? languageLabel(language)}</span>
          <CopyButton value={code} />
        </div>
      )}
      <pre className="docs-code-pre">
        <code className={language ? `language-${language}` : undefined}>
          {highlighted ? renderTypeScript(code) : code}
        </code>
      </pre>
    </div>
  );
}

function PackageInstallTabs({
  commands,
}: {
  commands: Record<PackageManager, string>;
}) {
  const [manager, setManager] = useState<PackageManager>("npm");

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = PACKAGE_MANAGERS.indexOf(manager);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const count = PACKAGE_MANAGERS.length;
    setManager(PACKAGE_MANAGERS[(index + delta + count) % count]);
  };

  return (
    <div className="docs-pm-tabs">
      <div className="docs-pm-tabs-head">
        <div
          className="docs-pm-tabs-list"
          role="tablist"
          onKeyDown={handleKeyDown}
        >
          {PACKAGE_MANAGERS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              className="docs-pm-tab"
              aria-selected={manager === item}
              tabIndex={manager === item ? 0 : -1}
              onClick={() => setManager(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <CopyButton value={commands[manager]} />
      </div>
      <div className="docs-pm-tabs-panel" role="tabpanel">
        <CodeSurface
          code={commands[manager]}
          language="sh"
          showHeader={false}
        />
      </div>
    </div>
  );
}

const components: Components = {
  a: ({ node: _node, ...props }) => (
    <a {...props} target="_blank" rel="noreferrer" />
  ),
  // Unwrap the <pre> around a ```hissab block so the live example can render
  // as a block-level element (a <div> nested in <pre> is invalid markup).
  pre: ({ node: _node, children, ...props }) => {
    if (
      isValidElement<{ className?: string; children?: ReactNode }>(children) &&
      HISSAB_LANG.test(children.props.className ?? "")
    ) {
      return <>{children}</>;
    }

    if (
      isValidElement<{ className?: string; children?: ReactNode }>(children)
    ) {
      const language = languageFromClassName(children.props.className);
      const text = codeText(children.props.children);
      const installCommands =
        language && SHELL_LANGS.has(language)
          ? parseNpmInstallCommand(text)
          : null;

      if (installCommands)
        return <PackageInstallTabs commands={installCommands} />;
      return <CodeSurface code={text} language={language} />;
    }

    return <pre {...props}>{children}</pre>;
  },
  code: ({ node: _node, className, children, ...props }) => {
    if (HISSAB_LANG.test(className ?? "")) {
      return <HissabExample text={codeText(children)} />;
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

interface DocsMarkdownProps {
  children: string;
}

export function DocsMarkdown({ children }: DocsMarkdownProps) {
  return (
    <div className="docs-md">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
          remarkDirective,
          remarkHissabCallouts,
        ]}
        rehypePlugins={[rehypeKatex]}
        skipHtml
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
