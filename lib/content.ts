import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ContentItem {
  slug: string;

  id?: string;

  title: string;

  date: string;
  updated?: string;

  version?: string;

  category?: string;
  author?: string;

  tags: string[];

  excerpt?: string;

  doi?: string;
  pdf?: string;
  github?: string;

  readingTime: number;

  content: string;

  systemLayer?: string;
  analysisType?: string;
  domain?: string;
  status?: string;
  venue?: string;
  publisher?: string;
  severity?: string;
  jurisdiction?: string;
  statuteRef?: string;
  mitigationAction?: string;
}

export function getContent(
  folder: string
): ContentItem[] {
  const directory = path.join(
    process.cwd(),
    "content",
    folder
  );

  if (!fs.existsSync(directory)) {
    return [];
  }

  const files = fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"));

  return files.map((file) => {
    const filePath = path.join(
      directory,
      file
    );

    const source = fs.readFileSync(
      filePath,
      "utf8"
    );

    const { data, content } = matter(source);

    const wordCount =
      content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    const readingTime = Math.max(
      1,
      Math.ceil(wordCount / 220)
    );

    return {
      slug: file.replace(".md", ""),

      id: data.id ?? "",

      title: data.title ?? "Untitled",

      date: data.date
        ? new Date(data.date)
            .toISOString()
            .split("T")[0]
        : "",

      updated: data.updated
        ? new Date(data.updated)
            .toISOString()
            .split("T")[0]
        : "",

      version: data.version ?? "",

      category: data.category ?? "",

      author: data.author ?? "",

      tags: data.tags ?? [],

      excerpt: data.excerpt ?? "",

      doi: data.doi ?? "",

      pdf: data.pdf ?? "",

      github: data.github ?? "",

      systemLayer: data.systemLayer ?? "",
      analysisType: data.analysisType ?? "",
      domain: data.domain ?? "",
      status: data.status ?? "",
      venue: data.venue ?? "",
      publisher: data.publisher ?? "",
      severity: data.severity ?? "",
      jurisdiction: data.jurisdiction ?? "",
      statuteRef: data.statuteRef ?? "",
      mitigationAction: data.mitigationAction ?? "",

      readingTime,

      content,
    };
  });
}