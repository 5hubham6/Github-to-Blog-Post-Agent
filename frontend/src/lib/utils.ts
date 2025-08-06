import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRepoUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
}

export function extractRepoName(url: string): string {
  const match = url.match(/github\.com\/[^\/]+\/([^\/]+)/);
  return match ? match[1] : "";
}
