import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { ExpectedProduct, ExpectedProductPayload } from '../types/expected-product.types';

export const expectedProductService = {
  async list(proposalId: string): Promise<ExpectedProduct[]> {
    const { data } = await httpClient.get<ApiResponse<ExpectedProduct[]>>(`/proposals/${proposalId}/expected-products`);
    return data.data;
  },

  async create(proposalId: string, payload: ExpectedProductPayload): Promise<ExpectedProduct> {
    const { data } = await httpClient.post<ApiResponse<ExpectedProduct>>(`/proposals/${proposalId}/expected-products`, payload);
    return data.data;
  },

  async update(proposalId: string, productId: string, payload: ExpectedProductPayload): Promise<ExpectedProduct> {
    const { data } = await httpClient.put<ApiResponse<ExpectedProduct>>(
      `/proposals/${proposalId}/expected-products/${productId}`,
      payload,
    );
    return data.data;
  },

  async remove(proposalId: string, productId: string): Promise<void> {
    await httpClient.delete<ApiResponse<null>>(`/proposals/${proposalId}/expected-products/${productId}`);
  },
};
