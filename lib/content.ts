import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { parse as parseYaml } from 'yaml';

export const contentKinds = ['notes', 'posts', 'articles'] as const;
export type ContentKind = (typeof contentKinds)[number];

export type ContentItem = {
  kind: ContentKind;
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  draft: boolean;
  cover?: string;
  body: string;
  sourcePath: string;
  url: string;
};

const markdownFiles = import.meta.glob(
  '/content/{notes,posts,articles}/**/index.md',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
) as Record<string, string>;

const assetFiles = import.meta.glob(
  '/content/{notes,posts,articles}/**/*.{avif,gif,jpeg,jpg,png,svg,webp}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>;

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeHighlight, { detect: false })
  .use(rehypeStringify);

function fail(sourcePath: string, message: string): never {
  throw new Error(`Invalid content at ${sourcePath}: ${message}`);
}

function parseFrontmatter(source: string, sourcePath: string) {
  const normalized = source.replace(/\r\n/g, '\n');

  if (!normalized.startsWith('---\n')) {
    fail(sourcePath, 'frontmatter must begin with ---');
  }

  const closing = normalized.indexOf('\n---\n', 4);
  if (closing === -1) {
    fail(sourcePath, 'frontmatter must end with ---');
  }

  let frontmatter: unknown;

  try {
    frontmatter = parseYaml(normalized.slice(4, closing));
  } catch (error) {
    fail(
      sourcePath,
      `frontmatter is not valid YAML: ${error instanceof Error ? error.message : 'unknown error'}`,
    );
  }

  if (!frontmatter || typeof frontmatter !== 'object') {
    fail(sourcePath, 'frontmatter must be a YAML object');
  }

  return {
    data: frontmatter as Record<string, unknown>,
    body: normalized.slice(closing + 5).trim(),
  };
}

function normalizeRepositoryPath(path: string) {
  const output: string[] = [];

  for (const segment of path.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') output.pop();
    else output.push(segment);
  }

  return `/${output.join('/')}`;
}

function resolveAsset(sourcePath: string, relativePath: string) {
  if (!relativePath.startsWith('./')) {
    fail(
      sourcePath,
      `local images must use ./ paths, received ${relativePath}`,
    );
  }

  const directory = sourcePath.slice(0, sourcePath.lastIndexOf('/'));
  const assetPath = normalizeRepositoryPath(
    `${directory}/${relativePath.slice(2)}`,
  );
  const assetUrl = assetFiles[assetPath];

  if (!assetUrl) {
    fail(sourcePath, `image not found: ${relativePath}`);
  }

  return assetUrl;
}

function validateAndResolveImages(body: string, sourcePath: string) {
  return body.replace(
    /!\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g,
    (match, alt: string, imagePath: string, suffix: string) => {
      if (!alt.trim()) {
        fail(sourcePath, `image ${imagePath} needs alt text`);
      }

      if (!imagePath.startsWith('./')) return match;

      const assetUrl = resolveAsset(sourcePath, imagePath);
      return `![${alt}](${assetUrl}${suffix})`;
    },
  );
}

function createSummary(body: string) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

function parseDate(value: unknown, sourcePath: string) {
  if (typeof value !== 'string') {
    fail(sourcePath, 'date must be a string using YYYY-MM-DD');
  }

  const date = value;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    fail(sourcePath, 'date must use YYYY-MM-DD');
  }

  if (Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    fail(sourcePath, `invalid date: ${date}`);
  }

  return date;
}

function parseItem(sourcePath: string, source: string): ContentItem {
  const pathMatch = sourcePath.match(
    /^\/content\/(notes|posts|articles)\/([^/]+)\/index\.md$/,
  );

  if (!pathMatch) fail(sourcePath, 'expected content/<kind>/<slug>/index.md');

  const [, kind, slug] = pathMatch as [string, ContentKind, string];
  const { data, body } = parseFrontmatter(source, sourcePath);
  const title = typeof data.title === 'string' ? data.title.trim() : '';

  if (!title) fail(sourcePath, 'title is required');
  if (!body) fail(sourcePath, 'body cannot be empty');

  const tags = data.tags ?? [];
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
    fail(sourcePath, 'tags must be a list of strings');
  }

  if (data.cover != null && typeof data.cover !== 'string') {
    fail(sourcePath, 'cover must be a string path');
  }

  if (data.summary != null && typeof data.summary !== 'string') {
    fail(sourcePath, 'summary must be a string');
  }

  const cover =
    typeof data.cover === 'string' && data.cover
      ? resolveAsset(sourcePath, data.cover)
      : undefined;
  const summary =
    typeof data.summary === 'string'
      ? data.summary.trim()
      : createSummary(body);

  if (!summary) fail(sourcePath, 'summary cannot be empty');

  validateAndResolveImages(body, sourcePath);

  return {
    kind,
    slug,
    title,
    date: parseDate(data.date, sourcePath),
    summary,
    tags: tags.map((tag) => tag.trim()).filter(Boolean),
    draft: data.draft === true,
    cover,
    body,
    sourcePath,
    url: `/${kind}/${slug}`,
  };
}

const parsedItems = Object.entries(markdownFiles).map(([path, source]) =>
  parseItem(path, source),
);

const duplicate = parsedItems.find(
  (item, index) =>
    parsedItems.findIndex(
      (candidate) =>
        candidate.kind === item.kind && candidate.slug === item.slug,
    ) !== index,
);

if (duplicate) {
  fail(duplicate.sourcePath, `duplicate slug: ${duplicate.slug}`);
}

const visibleItems = parsedItems
  .filter((item) => import.meta.env.DEV || !item.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export function getAllContent() {
  return visibleItems;
}

export function getContentByKind(kind: ContentKind) {
  return visibleItems.filter((item) => item.kind === kind);
}

export function getContentItem(kind: string, slug: string) {
  if (!contentKinds.includes(kind as ContentKind)) return undefined;

  return visibleItems.find((item) => item.kind === kind && item.slug === slug);
}

export async function renderContent(item: ContentItem) {
  const markdown = validateAndResolveImages(item.body, item.sourcePath);
  const rendered = await markdownProcessor.process(markdown);
  return String(rendered);
}

export function formatContentDate(date: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
