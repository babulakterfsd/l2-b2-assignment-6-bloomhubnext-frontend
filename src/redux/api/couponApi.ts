import { baseApi } from './baseApi';

const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCoupon: builder.mutation({
      query: (coupon) => {
        console.log(coupon);
        return {
          url: '/coupons',
          method: 'POST',
          body: coupon,
        };
      },
      invalidatesTags: ['coupons'],
    }),
    getAllCoupons: builder.query({
      query: () => {
        return {
          url: '/coupons',
          method: 'GET',
        };
      },
      providesTags: ['coupons'],
    }),
  }),
});

export const { useCreateCouponMutation, useGetAllCouponsQuery } = couponApi;
