"use client";

import { useState } from "react";
import { ChevronDown, FileText, Hash, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

// Types for page structure from backend
export interface PageSection {
  id: string;
  tag: string;
  title: string;
  anchor: string;
}

export interface Page {
  path: string;
  file: string;
  title: string;
  sections: PageSection[];
  internal_links: string[];
}

interface PageSelectorProps {
  pages: Page[];
  currentPath: string;
  currentAnchor?: string;
  onNavigate: (path: string, anchor?: string) => void;
  className?: string;
}

export default function PageSelector({
  pages,
  currentPath,
  currentAnchor,
  onNavigate,
  className,
}: PageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Find current page
  const currentPage = pages.find((p) => p.path === currentPath) || pages[0];

  // Get display text for current location
  const getDisplayText = () => {
    if (!currentPage) return "/";

    let text = currentPage.path;
    if (currentAnchor) {
      text += currentAnchor;
    }
    return text;
  };

  // Handle page navigation
  const handlePageClick = (page: Page) => {
    onNavigate(page.path);
    setIsOpen(false);
  };

  // Handle section/anchor navigation
  const handleSectionClick = (page: Page, section: PageSection) => {
    onNavigate(page.path, section.anchor);
    setIsOpen(false);
  };

  if (!pages || pages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1.5 px-2 font-mono text-xs hover:bg-gray-100",
            className
          )}
        >
          <FileText className="h-3.5 w-3.5 text-gray-500" />
          <span className="max-w-[200px] truncate">{getDisplayText()}</span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-gray-500">
          Pages
        </DropdownMenuLabel>
        {pages.map((page) => (
          <div key={page.path}>
            {page.sections && page.sections.length > 0 ? (
              // Page with sections - use submenu
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className={cn(
                    "cursor-pointer",
                    currentPath === page.path && !currentAnchor && "bg-accent"
                  )}
                >
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="flex-1 font-mono text-xs">{page.path}</span>
                  {currentPath === page.path && !currentAnchor && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  {/* Page root */}
                  <DropdownMenuItem
                    onClick={() => handlePageClick(page)}
                    className={cn(
                      "cursor-pointer",
                      currentPath === page.path && !currentAnchor && "bg-accent"
                    )}
                  >
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-mono text-xs">{page.path}</span>
                    {currentPath === page.path && !currentAnchor && (
                      <Check className="h-4 w-4 ml-auto text-blue-500" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-gray-400">
                    Sections
                  </DropdownMenuLabel>
                  {/* Sections */}
                  {page.sections.map((section) => (
                    <DropdownMenuItem
                      key={section.id}
                      onClick={() => handleSectionClick(page, section)}
                      className={cn(
                        "cursor-pointer pl-6",
                        currentPath === page.path &&
                          currentAnchor === section.anchor &&
                          "bg-accent"
                      )}
                    >
                      <Hash className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      <span className="flex-1 text-xs truncate">
                        {section.title}
                      </span>
                      {currentPath === page.path &&
                        currentAnchor === section.anchor && (
                          <Check className="h-4 w-4 ml-auto text-blue-500" />
                        )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              // Page without sections - simple item
              <DropdownMenuItem
                onClick={() => handlePageClick(page)}
                className={cn(
                  "cursor-pointer",
                  currentPath === page.path && "bg-accent"
                )}
              >
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="flex-1 font-mono text-xs">{page.path}</span>
                {currentPath === page.path && (
                  <Check className="h-4 w-4 ml-auto text-blue-500" />
                )}
              </DropdownMenuItem>
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
