"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  const renderMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let listItems: string[] = [];
    let listType: "ul" | "ol" | null = null;

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag
            key={`list-${elements.length}`}
            className={listType === "ul" ? "list-disc ml-6 my-2" : "list-decimal ml-6 my-2"}
          >
            {listItems.map((item, i) => (
              <li key={i} className="my-1">
                {renderInline(item)}
              </li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    const renderInline = (line: string): React.ReactNode => {
      // Process inline elements: bold, italic, code, links
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let key = 0;

      while (remaining.length > 0) {
        // Bold: **text** or __text__
        const boldMatch = remaining.match(/^(.*?)(\*\*|__)(.+?)\2(.*)$/s);
        if (boldMatch) {
          if (boldMatch[1]) parts.push(boldMatch[1]);
          parts.push(
            <strong key={key++} className="font-semibold">
              {boldMatch[3]}
            </strong>
          );
          remaining = boldMatch[4];
          continue;
        }

        // Italic: *text* or _text_
        const italicMatch = remaining.match(/^(.*?)(\*|_)(.+?)\2(.*)$/s);
        if (italicMatch && !italicMatch[1].endsWith("*") && !italicMatch[1].endsWith("_")) {
          if (italicMatch[1]) parts.push(italicMatch[1]);
          parts.push(
            <em key={key++} className="italic">
              {italicMatch[3]}
            </em>
          );
          remaining = italicMatch[4];
          continue;
        }

        // Inline code: `code`
        const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/s);
        if (codeMatch) {
          if (codeMatch[1]) parts.push(codeMatch[1]);
          parts.push(
            <code
              key={key++}
              className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
            >
              {codeMatch[2]}
            </code>
          );
          remaining = codeMatch[3];
          continue;
        }

        // No more matches, add remaining text
        parts.push(remaining);
        break;
      }

      return parts.length === 1 ? parts[0] : <>{parts}</>;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start/end
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // End code block
          flushList();
          elements.push(
            <pre
              key={`code-${elements.length}`}
              className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto"
            >
              <code className="text-sm font-mono">{codeBlockContent.join("\n")}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          flushList();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        flushList();
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const headerClasses: Record<number, string> = {
          1: "text-2xl font-bold mt-4 mb-2",
          2: "text-xl font-bold mt-3 mb-2",
          3: "text-lg font-semibold mt-2 mb-1",
          4: "text-base font-semibold mt-2 mb-1",
          5: "text-sm font-semibold mt-1 mb-1",
          6: "text-sm font-medium mt-1 mb-1",
        };
        const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
        elements.push(
          React.createElement(
            HeaderTag,
            { key: `h-${elements.length}`, className: headerClasses[level] },
            renderInline(text)
          )
        );
        continue;
      }

      // Unordered list item: - item or * item
      const ulMatch = line.match(/^[\s]*[-*]\s+(.+)$/);
      if (ulMatch) {
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        listItems.push(ulMatch[1]);
        continue;
      }

      // Ordered list item: 1. item
      const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
      if (olMatch) {
        if (listType !== "ol") {
          flushList();
          listType = "ol";
        }
        listItems.push(olMatch[1]);
        continue;
      }

      // Horizontal rule
      if (/^[-*_]{3,}$/.test(line.trim())) {
        flushList();
        elements.push(<hr key={`hr-${elements.length}`} className="my-4 border-gray-200" />);
        continue;
      }

      // Empty line
      if (line.trim() === "") {
        flushList();
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="my-1">
          {renderInline(line)}
        </p>
      );
    }

    // Flush any remaining list
    flushList();

    // Handle unclosed code block
    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <pre
          key={`code-${elements.length}`}
          className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto"
        >
          <code className="text-sm font-mono">{codeBlockContent.join("\n")}</code>
        </pre>
      );
    }

    return elements;
  };

  return <div className={`markdown-content ${className}`}>{renderMarkdown(content)}</div>;
}
