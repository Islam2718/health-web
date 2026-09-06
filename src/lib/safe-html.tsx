import type { ReactNode } from "react";

// Renders the HTML the RichTextEditor (TipTap) produces for post bodies.
// Deliberately never uses dangerouslySetInnerHTML — instead this walks the
// markup with a small allowlist parser and builds real React elements one
// by one, so anything outside the allowlist (a <script>, an onerror=
// attribute, a javascript: href — whether from our own editor or a post
// created by hitting the API directly) can never become live markup. Only
// `href` is ever read off an <a>, and only after rejecting javascript: URLs.

const ALLOWED_TAGS = new Set([
  "p",
  "strong",
  "em",
  "s",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "br",
  "hr",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);

const VOID_TAGS = new Set(["br", "hr"]);

type Token =
  | { type: "text"; text: string }
  | { type: "open"; tag: string; attrs?: string }
  | { type: "close"; tag: string };

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const re = /<(\/?)([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match[4] !== undefined) {
      tokens.push({ type: "text", text: match[4] });
    } else {
      const tag = match[2].toLowerCase();
      if (match[1] === "/") {
        tokens.push({ type: "close", tag });
      } else {
        tokens.push({ type: "open", tag, attrs: match[3] });
      }
    }
  }
  return tokens;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function extractHref(attrs: string | undefined): string | undefined {
  if (!attrs) return undefined;
  const match = /href\s*=\s*"([^"]*)"/i.exec(attrs) ?? /href\s*=\s*'([^']*)'/i.exec(attrs);
  if (!match) return undefined;
  const href = match[1].trim();
  // eslint-disable-next-line no-script-url
  if (/^\s*(javascript|data|vbscript):/i.test(href)) return undefined;
  return href;
}

export function renderSafeHtml(html: string): ReactNode {
  const tokens = tokenize(html);
  let i = 0;
  let keySeed = 0;

  function parseChildren(stopTag: string | null): ReactNode[] {
    const nodes: ReactNode[] = [];
    while (i < tokens.length) {
      const token = tokens[i];

      if (token.type === "close") {
        i++;
        if (token.tag === stopTag) return nodes;
        continue;
      }

      if (token.type === "text") {
        i++;
        const text = decodeEntities(token.text);
        if (text) nodes.push(text);
        continue;
      }

      const { tag, attrs } = token;
      i++;
      if (!ALLOWED_TAGS.has(tag)) continue; // unknown/disallowed tag — drop it, never re-inserted as markup

      const key = `n-${keySeed++}`;

      if (VOID_TAGS.has(tag)) {
        nodes.push(tag === "br" ? <br key={key} /> : <hr key={key} className="my-3 border-border/60" />);
        continue;
      }

      if (tag === "a") {
        const href = extractHref(attrs);
        const children = parseChildren("a");
        nodes.push(
          href ? (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ) : (
            <span key={key}>{children}</span>
          )
        );
        continue;
      }

      const children = parseChildren(tag);
      switch (tag) {
        case "p":
          nodes.push(
            <p key={key} className="mb-2 last:mb-0">
              {children}
            </p>
          );
          break;
        case "strong":
          nodes.push(<strong key={key}>{children}</strong>);
          break;
        case "em":
          nodes.push(<em key={key}>{children}</em>);
          break;
        case "s":
          nodes.push(<s key={key}>{children}</s>);
          break;
        case "code":
          nodes.push(
            <code key={key} className="rounded bg-secondary px-1 py-0.5 text-[0.85em]">
              {children}
            </code>
          );
          break;
        case "pre":
          nodes.push(
            <pre key={key} className="overflow-x-auto rounded-lg bg-secondary p-3 text-xs">
              {children}
            </pre>
          );
          break;
        case "blockquote":
          nodes.push(
            <blockquote key={key} className="border-l-2 border-border pl-3 text-muted-foreground italic">
              {children}
            </blockquote>
          );
          break;
        case "ul":
          nodes.push(
            <ul key={key} className="list-disc space-y-0.5 pl-5">
              {children}
            </ul>
          );
          break;
        case "ol":
          nodes.push(
            <ol key={key} className="list-decimal space-y-0.5 pl-5">
              {children}
            </ol>
          );
          break;
        case "li":
          nodes.push(<li key={key}>{children}</li>);
          break;
        case "h1":
          nodes.push(
            <h1 key={key} className="mt-3 mb-1.5 text-xl font-semibold">
              {children}
            </h1>
          );
          break;
        case "h2":
          nodes.push(
            <h2 key={key} className="mt-3 mb-1.5 text-lg font-semibold">
              {children}
            </h2>
          );
          break;
        default:
          nodes.push(
            <h3 key={key} className="mt-3 mb-1.5 font-semibold">
              {children}
            </h3>
          );
      }
    }
    return nodes;
  }

  return <div className="space-y-1">{parseChildren(null)}</div>;
}

// Used for truncated previews (post cards, list rows) — plain text, tags
// and entities stripped.
export function stripHtmlToText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}
