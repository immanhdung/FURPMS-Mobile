import { useMutation } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
import type { PickedFile } from '@/services/upload.service';

export function useExtractProposalMutation() {
  return useMutation({
    mutationFn: (file: PickedFile) => aiService.extractFromFile(file),
  });
}

export function useSemanticSearch() { return useMutation({ mutationFn: (query: string) => aiService.semanticSearch(query) }); }
