import { useMutation } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
import type { PickedFile } from '@/services/upload.service';

export function useExtractProposalMutation() {
  return useMutation({
    mutationFn: (file: PickedFile) => aiService.extractFromFile(file),
  });
}

export function useSimilarityCheckMutation() {
  return useMutation({
    mutationFn: ({ file, topicId }: { file: PickedFile; topicId: number }) => aiService.checkSimilarity(file, topicId),
  });
}
