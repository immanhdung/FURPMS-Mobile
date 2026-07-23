import { uploadService, type PickedFile } from '@/services/upload.service';
import type { AiExtractionResult, SimilarityCheckResult } from '../types/ai.types';

// Only extract + similarity-check are ported to mobile — semantic search and AI summary/feedback
// are cut as non-essential extras (see plan scope decisions).
export const aiService = {
  async extractFromFile(file: PickedFile): Promise<AiExtractionResult> {
    return uploadService.uploadFile<AiExtractionResult>(file, '/ai/extract', 'file');
  },

  async checkSimilarity(file: PickedFile, topicId: number): Promise<SimilarityCheckResult> {
    return uploadService.uploadFile<SimilarityCheckResult>(file, '/ai/similarity-check', 'file', {
      topicId: String(topicId),
    });
  },
};
