import { useGetAllCouponsQuery } from '@/redux/api/couponApi';
import { useGetProductsQuery } from '@/redux/api/productApi';
import { useSellAProductMutation } from '@/redux/api/sellApi';
import {
  setShopkeeperInLocalState,
  useCurrentShopkeeper,
} from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { TCoupon, TProduct, TShopkeeper } from '@/types/commonTypes';
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { FaHandHoldingUsd } from 'react-icons/fa';
import { GiFlowerPot } from 'react-icons/gi';
import { RxCross2 } from 'react-icons/rx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const currentCustomer = useAppSelector(useCurrentShopkeeper) as TShopkeeper;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<TProduct>(
    {} as TProduct
  );
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [quantityToBeSold, setQuantityToBeSold] = useState<number>(0);
  const [dateOfSell, setDateOfSell] = useState<string>('');
  const shopkeeprInLocal = useAppSelector(useCurrentShopkeeper);
  const { email: localEmail } = shopkeeprInLocal as TShopkeeper;
  const { data: allRunningCoupons } = useGetAllCouponsQuery(undefined);
  const runningCoupons = allRunningCoupons?.data;
  const [sellAProduct, { isLoading: sellProductOngoing }] =
    useSellAProductMutation();

  const shopkeeper = useAppSelector(useCurrentShopkeeper);
  const { email: customerEmail } = shopkeeper as TShopkeeper;

  useEffect(() => {
    const logout = async () => {
      if (currentCustomer?.role !== 'customer') {
        try {
          const response = await fetch(
            'https://bloomhub-assignment6-backend.vercel.app/api/auth/logout',
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.status === 200) {
            dispatch(
              setShopkeeperInLocalState({
                shopkeeper: null,
                token: null,
              })
            );
            navigate('/login');
          } else {
            toast.error('Something went wrong', {
              position: 'top-right',
              duration: 1500,
            });
          }
        } catch (error) {
          console.error('Something went wrong', error);
        }
      }
    };

    logout();
  }, [currentCustomer?.role, navigate]);

  const page = '1';
  const limit = '50';

  const allFilters = {
    page,
    limit,
    search,
  };

  const createQueryString = (obj: any) => {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(
        encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
      );
    }
    return keyValuePairs.join('&');
  };

  const { data, error, isLoading } = useGetProductsQuery(
    createQueryString(allFilters)
  );

  const products = data?.data?.data;

  const handleModal = (id: string) => {
    const productToBeSold = products?.find(
      (product: TProduct) => product?._id === id
    );
    if (productToBeSold) {
      setShowModal(true);
      setSelectedProduct(productToBeSold);
    }
  };

  const handleSellProduct = async (e: any, product: TProduct) => {
    e.preventDefault();

    const isGivenCouponValid = runningCoupons?.find(
      (coupon: TCoupon) => coupon?.code === appliedCoupon
    );

    if (!isGivenCouponValid && appliedCoupon) {
      setAppliedCoupon('');
      toast.error('Please enter a valid coupon code or keep the field empty', {
        position: 'top-right',
        duration: 1500,
      });
      return;
    }

    const discountPercentage = isGivenCouponValid?.discount;
    const discountGiven =
      (product?.price * quantityToBeSold * Number(discountPercentage)) / 100;
    const totalBill =
      product?.price * quantityToBeSold - (appliedCoupon ? discountGiven : 0);

    const productToBeSold = {
      productID: product?._id,
      productName: product?.name,
      productPrice: product?.price,
      appliedCoupon,
      discountPercentage: Number(discountPercentage) || 0,
      quantityToBeSold,
      discountGiven: appliedCoupon ? discountGiven : 0,
      totalBill,
      customerEmail,
      sellerEmail: 'babulakterfsd@gmail.com',
      dateOfSell,
    };

    if (!customerEmail || !dateOfSell || !quantityToBeSold) {
      toast.error('Please fill all the fields', {
        position: 'top-right',
        duration: 1500,
      });
    } else if (product?.quantity < quantityToBeSold) {
      toast.error(
        'We do not have enough quantity to sell, please try again with less quantity',
        {
          position: 'top-right',
          duration: 1500,
        }
      );
    } else if (dateOfSell > new Date().toISOString().split('T')[0]) {
      toast.error('You can not buy a product in future date', {
        position: 'top-right',
        duration: 1500,
      });
    } else {
      const response = await sellAProduct(productToBeSold).unwrap();
      if (response?.statusCode === 201) {
        toast.success(
          `Product bought successfully, you earned ${(totalBill * 0.1).toFixed(
            2
          )}Bhp`,
          {
            position: 'top-right',
            duration: 1500,
          }
        );
        setShowModal(false);
        setDateOfSell('');
        setQuantityToBeSold(0);
        setAppliedCoupon('');
      } else {
        toast.error('Something went wrong, please try again', {
          position: 'top-right',
          duration: 1500,
        });
      }
    }
  };

  return (
    <div className="mb-10 lg:mb-24 lg:mt-10 lg:shadow-md lg:rounded-md lg:py-5 lg:px-6 lg:pb-8 lg:pt-5 overflow-x-hidden">
      {/* header */}
      <div className="grid grid-cols-12 gap-y-3 mt-6 mb-10 lg:mt-0 justify-between items-center">
        <div className=" p-2 rounded-md text-sm font-bold col-span-12 lg:col-span-6 flex gap-x-6">
          <Marquee key={Math.floor(Math.random() * 999)} speed={40}>
            {runningCoupons?.length > 0 &&
              runningCoupons.map((coupon: TCoupon) => {
                return (
                  <span key={Math.random() * 999}>
                    Use coupon code '
                    <span className="text-red-400">{coupon?.code}</span>' to get{' '}
                    <span className="text-red-400 mx-0.5">
                      {' '}
                      {`${coupon.discount}%`}{' '}
                    </span>{' '}
                    discount on your{' '}
                    <span className="text-red-400">total bill</span>. &nbsp;
                  </span>
                );
              })}
          </Marquee>
        </div>
        <input
          type="search"
          id="search"
          className="text-sm rounded-lg w-full mb-1.5 lg:mb-0 sm:w-4/6 lg:w-[320px] pl-10 p-2 focus:outline-none bg-gray-100 h-[44px] col-span-12 lg:col-span-4 mx-auto"
          placeholder="Search by product name or type"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* product list */}
      <div>
        {isLoading ? (
          <div className="flex justify-center mt-12 h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-300"></div>
          </div>
        ) : null}

        {error ? (
          <div className="flex justify-center items-center h-screen">
            <p className="text-red-500 text-xl">{`${error}`}</p>
          </div>
        ) : null}
        {!error && !isLoading && products?.length === 0 ? (
          <div className="flex justify-center items-center h-screen">
            <p className="text-red-500 text-xl">No Product Found</p>
          </div>
        ) : null}
        {products?.length > 0 ? (
          <div className="min-h-screen grid grid-cols-12 gap-8  overflow-x-hidden">
            {products?.map((product: any) => (
              <div
                className="col-span-12 md:col-span-6 lg:col-span-4  flex flex-col justify-between items-center bg-gradient-to-br from-teal-100 to-yellow-50 via-white rounded-md shadow-md p-4 hover:to-teal-200 transition-all duration-300 hover:cursor-pointer h-80 xl:h-72 relative"
                key={product?._id}
              >
                {/* card */}
                <div className="flex flex-col justify-center items-center">
                  <p className="text-sm text-gray-900 font-semibold absolute top-3 left-6">
                    {product?.type}
                  </p>
                  <p className="text-sm text-gray-900 font-semibold absolute top-3 right-10 md:right-5">{`$${product?.price}`}</p>

                  <GiFlowerPot
                    className="mt-12"
                    style={{ height: '80px', width: '80px' }}
                  />
                  <p className="text-lg font-semibold">{product?.name}</p>

                  <p className="text-sm text-gray-500">{`In-stock: ${product?.quantity}`}</p>
                  <div
                    className="bg-red-300 rounded-md px-4 py-2 cursor-pointer text-white hover:bg-red-400 transition-colors duration-300 ease-in-out flex items-center space-x-2 bottom-4 absolute mx-auto"
                    onClick={() => handleModal(product?._id)}
                  >
                    <FaHandHoldingUsd style={{ fontSize: '18px' }} />
                    <span>Buy Now</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {/* modal */}
        <div>
          {showModal ? (
            <>
              <div
                className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                data-aos="zoom-in"
                data-aos-duration="500"
              >
                <div className="relative w-[370px] lg:w-[640px] my-6 mx-auto">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex flex-col items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                      <div className="flex items-start justify-between w-full">
                        <h3 className="text-md font-semibold text-center">
                          Sell : {selectedProduct?.name}
                        </h3>
                        <button
                          className="text-2xl text-red-300 hover:text-red-700 hover:transition-all duration-300 ease-in-out"
                          onClick={() => setShowModal(!showModal)}
                        >
                          <RxCross2 />
                        </button>
                      </div>
                    </div>
                    {/*body*/}

                    <form className="py-6 px-10">
                      <div className="grid gap-4 grid-cols-12 sm:gap-x-6 sm:gap-y-4">
                        {/* customer email */}
                        <div className="col-span-6">
                          <label
                            htmlFor="customeremail"
                            className="block mb-2 text-sm font-medium "
                          >
                            Customer Email
                          </label>

                          <input
                            type="email"
                            name="customeremail"
                            id="customeremail"
                            className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none cursor-not-allowed"
                            placeholder="please write the email on the search bar avobe"
                            required
                            value={localEmail}
                            readOnly
                          />
                        </div>
                        <div className="col-span-6">
                          <label
                            htmlFor="quantitytobesold"
                            className="block mb-2 text-sm font-medium "
                          >
                            Quantity
                          </label>

                          <input
                            type="number"
                            name="quantitytobesold"
                            id="quantitytobesold"
                            className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none"
                            placeholder="e.g. 7"
                            required
                            onChange={(e) =>
                              setQuantityToBeSold(Number(e.target.value))
                            }
                          />
                        </div>
                        {/* sell date */}
                        <div className="col-span-6">
                          <label
                            htmlFor="dateofsell"
                            className="block mb-2 text-sm font-medium "
                          >
                            Date of Sell
                          </label>

                          <input
                            type="date"
                            name="dateofsell"
                            id="dateofsell"
                            className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none"
                            placeholder="e.g. 2024-02-01"
                            required
                            onChange={(e) => setDateOfSell(e.target.value)}
                          />
                        </div>
                        {/* apply coupon */}
                        <div className="col-span-6">
                          <label
                            htmlFor="applycoupon"
                            className="block mb-2 text-sm font-medium "
                          >
                            Coupon Code (optional)
                          </label>

                          <input
                            type="string"
                            name="applycoupon"
                            id="applycoupon"
                            className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none"
                            placeholder="e.g. eid2024"
                            value={appliedCoupon}
                            onChange={(e) => setAppliedCoupon(e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-red-300 rounded-md px-4 py-2 cursor-pointer text-white hover:bg-red-400 transition-colors duration-300 ease-in-out flex items-center space-x-2 mt-6 ml-auto disabled:cursor-not-allowed disabled:bg-red-100"
                        onClick={(e) => handleSellProduct(e, selectedProduct)}
                        disabled={sellProductOngoing}
                      >
                        <FaHandHoldingUsd style={{ fontSize: '18px' }} />
                        <span>Buy Product</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black transition-all duration-300"></div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
