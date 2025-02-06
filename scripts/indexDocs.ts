/**
 * Docusaurus AI Search Indexing Script
 *
 * This script indexes Docusaurus documentation by:
 * 1. Finding all markdown/MDX files in the docs directory
 * 2. Splitting them into sections based on headings
 * 3. Storing the sections in Upstash Vector for hybrid search
 */

import { Index } from '@upstash/vector';
import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';

// Types and Interfaces
interface SearchMetadata {
  title: string;
  path: string;
  level: number;
  type: string;
  content: string;
  documentTitle: string;
  [key: string]: string | number;
}

interface DocumentSection {
  level?: number;
  title?: string;
  content?: string;
}

// Configuration Constants
const DEFAULT_INDEX_NAMESPACE = 'docusaurus-ai-search-upstash';
const indexNamespace =
  process.env.UPSTASH_VECTOR_INDEX_NAMESPACE ?? DEFAULT_INDEX_NAMESPACE;
const docsPath = 'docs';

// Initialize Upstash Vector client
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

/**
 * Utility Functions
 */

/**
 * Converts text to a URL-friendly slug
 * @param text The text to slugify
 * @returns A URL-friendly version of the text
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .trim()
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Extracts title from markdown frontmatter or generates one from filename
 * @param content The markdown content
 * @param fileName The name of the file
 * @returns The extracted or generated title
 */
function extractTitle(content: string, fileName: string): string {
  const titleMatch = content.match(
    /^---[\s\S]*?\ntitle:\s*["']?(.*?)["']?\n[\s\S]*?---/
  );
  if (titleMatch) {
    return titleMatch[1].replace(/['"]/g, '').trim();
  }
  return path
    .basename(fileName, path.extname(fileName))
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * File Processing Functions
 */

/**
 * Recursively finds all markdown/MDX files in a directory
 * @param dir Directory to search in
 * @returns Array of file paths
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir, { withFileTypes: true });
  let markdownFiles: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory() && !file.name.startsWith('.')) {
      const subFiles = await findMarkdownFiles(fullPath);
      markdownFiles = [...markdownFiles, ...subFiles];
    } else if (file.name.match(/\.(md|mdx)$/)) {
      markdownFiles.push(fullPath);
    }
  }

  return markdownFiles;
}

/**
 * Processes a single markdown file and returns its content and metadata
 * @param filePath Path to the markdown file
 */
async function processMarkdownFile(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const relativePath = path
    .relative(process.cwd(), filePath)
    .replace(/\.(md|mdx)$/, '');
  const fileName = path.basename(filePath);
  const title = extractTitle(content, fileName);

  return {
    content,
    title,
    _meta: {
      path: relativePath,
    },
  };
}

/**
 * Content Processing Functions
 */

/**
 * Splits MDX content into sections based on headings
 * @param mdx The MDX content to split
 * @returns Array of sections with their headings and content
 */
function splitMdxByHeadings(mdx: string): DocumentSection[] {
  const sections = mdx.split(/(?=^#{1,6}\s)/m);

  return sections
    .map((section) => {
      const lines = section.trim().split('\n');
      const headingMatch = lines[0]?.match(/^(#{1,6})\s+(.+)$/);

      if (!headingMatch) return null;

      const [, hashes, title] = headingMatch;
      const content = lines.slice(1).join('\n').trim();

      return {
        level: hashes?.length,
        title,
        content,
      };
    })
    .filter(Boolean) as DocumentSection[];
}

/**
 * Main indexing function
 */
async function indexDocs() {
  try {
    console.log('Starting indexing process...');
    console.log('Using index namespace:', indexNamespace);

    // Find and process markdown files
    console.log('Finding markdown files...');
    const markdownFiles = await findMarkdownFiles(
      path.join(process.cwd(), docsPath)
    );
    console.log(`Found ${markdownFiles.length} markdown files`);

    console.log('Processing markdown files...');
    const allDocs = await Promise.all(markdownFiles.map(processMarkdownFile));
    console.log(`Processed ${allDocs.length} documents`);

    // Reset the index for fresh indexing
    await index.reset({ namespace: indexNamespace });
    console.log('Reset index for fresh indexing');

    // Process each document
    for (const doc of allDocs) {
      try {
        const sections = splitMdxByHeadings(doc.content);

        for (const section of sections) {
          if (!section || !section.content) continue;

          const headingId = `${doc._meta.path}#${slugify(section.title!)}`;

          const metadata: SearchMetadata = {
            title: section.title ?? '<Error displaying title>',
            path: doc._meta.path,
            level: section.level ?? 2,
            type: 'section',
            content: section.content,
            documentTitle: doc.title,
          };

          await index.upsert(
            {
              id: headingId,
              data: `${section.title}\n\n${section.content}`,
              metadata,
            },
            { namespace: indexNamespace }
          );
        }

        console.log(`✅ Indexed document sections: ${doc.title}`);
      } catch (error) {
        console.error(`❌ Failed to index ${doc.title}:`, error);
      }
    }

    console.log('✅ Finished indexing docs');
  } catch (error) {
    console.error('❌ Failed to index docs:', error);
    throw error;
  }
}

// Start the indexing process
indexDocs().catch(console.error);
