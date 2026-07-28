import { uploadService, type PickedFile } from '@/services/upload.service';
import type { AiExtractionResult } from '../types/ai.types';

// Only content extraction is ported to mobile — semantic search, similarity-check, and AI
// summary/feedback are cut as non-essential extras (see plan scope decisions).
export const aiService = {
  async extractFromFile(file: PickedFile): Promise<AiExtractionResult> {
    return uploadService.uploadFile<AiExtractionResult>(file, '/ai/extract', 'file');
  },
};
