/**
 * @spec VH-013: Branch Merging - Shared Types
 */

export interface MergeConflict {
  id: string;
  sectionId: string;
  lineStart: number;
  lineEnd: number;
  ourContent: string;
  theirContent: string;
  baseContent?: string;
  resolution?: 'ours' | 'theirs' | 'manual';
  resolvedContent?: string;
}
