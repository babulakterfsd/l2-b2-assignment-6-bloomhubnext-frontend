import { baseApi } from './baseApi';

const sellApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sellAProduct: builder.mutation({
      query: (productToBeSoldData) => {
        return {
          url: '/sells',
          method: 'POST',
          body: productToBeSoldData,
        };
      },
      invalidatesTags: ['products', 'product', 'sells', 'shopkeeper'],
    }),
    getAllSoldProducts: builder.query({
      query: (timeframe) => {
        timeframe = timeframe ? timeframe : 'yearly';
        return {
          url: `/sells?timeframe=${timeframe}`,
          method: 'GET',
        };
      },
      providesTags: ['sells'],
    }),
  }),
});

export const { useSellAProductMutation, useGetAllSoldProductsQuery } = sellApi;
