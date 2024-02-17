import {
  useCheckCustomerExistanceMutation,
  useGetProfileQuery,
} from '@/redux/api/authApi';
import {
  useCreateCouponMutation,
  useGetAllCouponsQuery,
} from '@/redux/api/couponApi';
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
import { IoIosAddCircleOutline } from 'react-icons/io';
import { RxCross2 } from 'react-icons/rx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ProductList = () => {
  const [search, setSearch] = useState<string>('');
  const [showCreateCouponModal, setShowCreateCouponodal] =
    useState<boolean>(false);
  const [newCouponCode, setNewCouponCode] = useState<string>('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<string>('');
  const [newCouponValidity, setNewCoupnValidity] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<TProduct>(
    {} as TProduct
  );
  const [showExistingCustomerSellingForm, setShowExistingCustomerSellingForm] =
    useState<boolean>(false);
  const [showNewCustomerSellingForm, setShowNewCustomerSellingForm] =
    useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerEmailToShow, setCustomerEmailToShow] = useState<string>('');
  const [customerPassword, setCustomerPassword] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [searchedCustomerEmail, setSearchedCustomerEmail] =
    useState<string>('');
  const [isCustomerExists, setIsCustomerExists] = useState<boolean>(false);
  const [quantityToBeSold, setQuantityToBeSold] = useState<number>(0);
  const [dateOfSell, setDateOfSell] = useState<string>('');
  const { data: profileData } = useGetProfileQuery(undefined);
  const shopkeeperFromDb = profileData?.data;
  const shopkeeprInLocal = useAppSelector(useCurrentShopkeeper);
  const { role: localRole, email: localEmail } =
    shopkeeprInLocal as TShopkeeper;

  const [createCoupon] = useCreateCouponMutation();
  const { data: allRunningCoupons } = useGetAllCouponsQuery(undefined);
  const runningCoupons = allRunningCoupons?.data;
  const [sellAProduct, { isLoading: sellProductOngoing }] =
    useSellAProductMutation();
  const [checkCustomerExistance] = useCheckCustomerExistanceMutation();

  const shopkeeper = useAppSelector(useCurrentShopkeeper);
  const { role } = shopkeeper as TShopkeeper;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const logout = async () => {
      if (role === 'customer') {
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
  }, [role, navigate]);

  const checkIfCustomerExists = async (e: any) => {
    e.preventDefault();

    if (localRole !== 'seller') {
      toast.error(
        'Only sellers can sell products. So, you need not to check if customer already exists or not',
        {
          position: 'top-right',
          duration: 1500,
        }
      );
      return;
    }

    const isEmail = new RegExp(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i
    );
    if (isEmail.test(searchedCustomerEmail)) {
      const response = await checkCustomerExistance(
        searchedCustomerEmail
      ).unwrap();

      if (response?.data === true) {
        setIsCustomerExists(true);
        setShowNewCustomerSellingForm(false);
        setShowExistingCustomerSellingForm(true);
        setCustomerEmail(searchedCustomerEmail);
        setCustomerEmailToShow(searchedCustomerEmail);
        toast.success(
          'Customer already exists with that email, sell directly',
          {
            position: 'top-right',
            duration: 1500,
          }
        );
      } else {
        setIsCustomerExists(false);
        setShowExistingCustomerSellingForm(false);
        setShowNewCustomerSellingForm(true);
        setCustomerEmail(searchedCustomerEmail);
        setCustomerEmailToShow(searchedCustomerEmail);
        toast.error(
          'Customer does not exists. Create a new customer as well as sell product.',
          {
            position: 'top-right',
            duration: 1500,
          }
        );
      }
    } else {
      toast.error('Please enter a valid email', {
        position: 'top-right',
        duration: 1500,
      });
    }
  };

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

    if (localRole !== 'seller') {
      toast.error('Only sellers can sell products.', {
        position: 'top-right',
        duration: 1500,
      });
      return;
    }

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

    if (isCustomerExists) {
      const productToBeSold = {
        productID: product?._id,
        productName: product?.name,
        productPrice: product?.price,
        appliedCoupon,
        discountPercentage: Number(discountPercentage) || 0,
        quantityToBeSold,
        discountGiven: appliedCoupon ? discountGiven : 0,
        totalBill:
          product?.price * quantityToBeSold -
          (appliedCoupon ? discountGiven : 0),
        customerEmail,
        sellerEmail: localEmail,
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
        toast.error('You can not sell a product in future date', {
          position: 'top-right',
          duration: 1500,
        });
      } else {
        const response = await sellAProduct(productToBeSold).unwrap();
        if (response?.statusCode === 201) {
          toast.success('Product sold successfully', {
            position: 'top-right',
            duration: 1500,
          });
          setShowModal(false);
          setDateOfSell('');
          setQuantityToBeSold(0);
          setAppliedCoupon('');
          setCustomerEmail('');
          setIsCustomerExists(false);
          setShowNewCustomerSellingForm(false);
          setShowExistingCustomerSellingForm(false);
          setSearchedCustomerEmail('');
        } else {
          toast.error('Something went wrong, please try again', {
            position: 'top-right',
            duration: 1500,
          });
        }
      }
    } else {
      const productToBeSold = {
        productID: product?._id,
        productName: product?.name,
        productPrice: product?.price,
        appliedCoupon,
        discountPercentage: Number(discountPercentage) || 0,
        quantityToBeSold,
        discountGiven: appliedCoupon ? discountGiven : 0,
        totalBill:
          product?.price * quantityToBeSold -
          (appliedCoupon ? discountGiven : 0),
        customerEmail,
        customerName,
        customerPassword,
        sellerEmail: localEmail,
        dateOfSell,
      };

      if (
        !customerEmail ||
        !dateOfSell ||
        !quantityToBeSold ||
        !customerName ||
        !customerPassword
      ) {
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
        toast.error('You can not sell a product in future date', {
          position: 'top-right',
          duration: 1500,
        });
      } else if (customerPassword.length < 6 || !/\d/.test(customerPassword)) {
        toast.error(
          'Password should be at least 6 characters long and contain a number',
          {
            position: 'top-right',
            icon: '😢',
            duration: 2500,
          }
        );
        return;
      } else {
        const response = await sellAProduct(productToBeSold).unwrap();
        if (response?.statusCode === 201) {
          toast.success('Product sold successfully', {
            position: 'top-right',
            duration: 1500,
          });
          setShowModal(false);
          setDateOfSell('');
          setQuantityToBeSold(0);
          setAppliedCoupon('');
          setCustomerEmail('');
          setCustomerName('');
          setCustomerPassword('');
          setIsCustomerExists(false);
          setShowNewCustomerSellingForm(false);
          setShowExistingCustomerSellingForm(false);
          setSearchedCustomerEmail('');
        } else {
          toast.error('Something went wrong, please try again', {
            position: 'top-right',
            duration: 1500,
          });
        }
      }
    }
  };

  const handleCreateCoupon = async (e: any) => {
    e.preventDefault();

    if (shopkeeperFromDb?.role !== 'manager') {
      toast.error(
        'You are not authorized to create coupon,only managers can create coupon',
        {
          position: 'top-right',
          duration: 1500,
        }
      );
      return;
    }

    const isCouponAlreadyExist = runningCoupons?.find(
      (coupon: TCoupon) => coupon?.code === newCouponCode
    );

    if (isCouponAlreadyExist) {
      toast.error('Coupon code already exists', {
        position: 'top-right',
        duration: 1500,
      });
      return;
    }

    if (!newCouponCode || !newCouponDiscount || !newCouponValidity) {
      toast.error('Please fill all the fields', {
        position: 'top-right',
        duration: 1500,
      });
      return;
    } else {
      if (newCouponCode.length < 5) {
        toast.error(
          'Minimum length of coupon code should be equal or greater than 5',
          {
            position: 'top-right',
            duration: 1500,
          }
        );
        return;
      } else if (newCouponCode.length > 10) {
        toast.error(
          'Maximum length of coupon code should be equal or less than 10',
          {
            position: 'top-right',
            duration: 1500,
          }
        );
        return;
      } else if (Number(newCouponDiscount) < 1) {
        toast.error('Minimum discount should be equal or greater than 1', {
          position: 'top-right',
          duration: 1500,
        });
        return;
      } else if (Number(newCouponDiscount) > 100) {
        toast.error('Maximum discount should be equal or less than 100', {
          position: 'top-right',
          duration: 1500,
        });
        return;
      } else {
        const response = await createCoupon({
          code: newCouponCode,
          discount: newCouponDiscount,
          validTill: newCouponValidity,
        }).unwrap();
        if (response?.statusCode === 201) {
          toast.success('Coupon created successfully', {
            position: 'top-right',
            duration: 1500,
          });
          setShowCreateCouponodal(false);
          setNewCouponCode('');
          setNewCouponDiscount('');
          setNewCoupnValidity('');
        } else {
          toast.error('Something went wrong, please try again', {
            position: 'top-right',
            duration: 1500,
          });
        }
      }
    }
  };

  return (
    <div className="mb-10 lg:mb-24 lg:mt-10 lg:shadow-md lg:rounded-md lg:py-5 lg:px-6 lg:pb-8 lg:pt-5 overflow-x-hidden">
      {/* header */}
      <div className="grid grid-cols-12 gap-y-3 mt-6 mb-10 lg:mt-0 justify-between items-center">
        <button
          className="bg-red-300 rounded-md px-4 py-2 cursor-pointer text-white hover:bg-red-400 transition-colors duration-300 ease-in-out flex items-center space-x-2 mt-3 col-span-12 lg:col-span-2 w-48 mx-auto z-50"
          onClick={() => setShowCreateCouponodal(true)}
        >
          <IoIosAddCircleOutline style={{ fontSize: '18px' }} />{' '}
          <span>Create Coupon</span>
        </button>
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
      {/* add coupon modal */}
      <div>
        {showCreateCouponModal ? (
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
                  <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                    <h3 className="text-md font-semibold text-center">
                      Create Coupon Code for customers
                    </h3>
                    <button
                      className="text-2xl text-red-300 hover:text-red-700 hover:transition-all duration-300 ease-in-out"
                      onClick={() => setShowCreateCouponodal(false)}
                    >
                      <RxCross2 />
                    </button>
                  </div>
                  {/*body*/}
                  <form className="py-6 px-10">
                    <div className="grid gap-4 grid-cols-1 sm:gap-x-6 sm:gap-y-4">
                      {/*  code */}
                      <div className="w-full">
                        <label
                          htmlFor="couponcode"
                          className="block mb-2 text-sm font-medium "
                        >
                          Code
                        </label>

                        <input
                          type="text"
                          name="couponcode"
                          id="couponcode"
                          className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none"
                          placeholder="e.g. ABCD123"
                          required
                          onChange={(e) => setNewCouponCode(e.target.value)}
                        />
                      </div>
                      {/*  discount */}
                      <div className="w-full">
                        <label
                          htmlFor="discount"
                          className="block mb-2 text-sm font-medium "
                        >
                          Discount
                        </label>

                        <input
                          type="text"
                          name="discount"
                          id="discount"
                          className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none"
                          placeholder="e.g. 7"
                          required
                          onChange={(e) => setNewCouponDiscount(e.target.value)}
                        />
                      </div>
                      {/* bloom date */}
                      <div className="w-full">
                        <label
                          htmlFor="validity"
                          className="block mb-2 text-sm font-medium "
                        >
                          Coupon Validity
                        </label>

                        <input
                          type="date"
                          name="validity"
                          id="validity"
                          className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none"
                          placeholder="e.g. January 28, 2024"
                          required
                          value={newCouponValidity}
                          onChange={(e) => setNewCoupnValidity(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-red-300 rounded-md px-4 py-2 cursor-pointer text-white hover:bg-red-400 transition-colors duration-300 ease-in-out flex items-center space-x-2 mt-6 ml-auto disabled:cursor-not-allowed disabled:bg-gray-300"
                      onClick={(e) => handleCreateCoupon(e)}
                    >
                      Create Coupon
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black transition-all duration-300"></div>
          </>
        ) : null}
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
                    <span>Sell Now</span>
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
                      <div>
                        <p className="text-sm my-4">
                          Search customer by their email, if customer already
                          exists, seller will directly sell product and if
                          customer doesn't exists with the given email, seller
                          will create a customer as well as sell the product.
                        </p>
                        <form className="flex justify-start flex-col gap-y-2">
                          <input
                            type="search"
                            id="searchcustomer"
                            className="text-sm rounded-lg w-full mb-1.5 lg:mb-0 sm:w-4/6 lg:w-[320px] pl-10 p-2 focus:outline-none bg-gray-100 h-[44px] col-span-12 lg:col-span-4 mx-auto"
                            placeholder="Search customer by email"
                            value={searchedCustomerEmail}
                            onChange={(e) =>
                              setSearchedCustomerEmail(e.target.value)
                            }
                          />
                          <button
                            type="submit"
                            onClick={checkIfCustomerExists}
                            className="bg-red-300 rounded-md p-2 cursor-pointer text-white hover:bg-red-400 transition-colors duration-300 w-44 ease-in-out mx-auto"
                          >
                            search customer
                          </button>
                        </form>
                      </div>
                    </div>
                    {/*body*/}
                    {showExistingCustomerSellingForm ? (
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
                              value={customerEmailToShow}
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
                          <span>Sell Product</span>
                        </button>
                      </form>
                    ) : null}
                    {showNewCustomerSellingForm ? (
                      <form className="py-6 px-10">
                        <div className="grid gap-4 grid-cols-12 sm:gap-x-6 sm:gap-y-4">
                          {/* customer name */}
                          <div className="col-span-6">
                            <label
                              htmlFor="customername"
                              className="block mb-2 text-sm font-medium "
                            >
                              Customer Name
                            </label>

                            <input
                              type="text"
                              name="customername"
                              id="customername"
                              className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none"
                              placeholder="e.g. Babul Akter"
                              required
                              onChange={(e) => setCustomerName(e.target.value)}
                              value={customerName}
                            />
                          </div>
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
                              placeholder="e.g. customer@bloomhub.com"
                              required
                              value={customerEmailToShow}
                              readOnly
                            />
                          </div>
                          {/* customer password */}
                          <div className="col-span-6">
                            <label
                              htmlFor="customerpassword"
                              className="block mb-2 text-sm font-medium "
                            >
                              Customer Password
                            </label>

                            <input
                              type="passwprd"
                              name="customerpassword"
                              id="customerpassword"
                              className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none"
                              placeholder="e.g. awal123"
                              required
                              onChange={(e) =>
                                setCustomerPassword(e.target.value)
                              }
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
                          <span>Sell Product</span>
                        </button>
                      </form>
                    ) : null}
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

export default ProductList;
