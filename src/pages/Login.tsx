import { useLoginMutation } from '@/redux/api/authApi';
import {
  setShopkeeperInLocalState,
  useCurrentToken,
} from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { FieldValues, useForm } from 'react-hook-form';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import Styles from '../styles/home.module.css';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { register, handleSubmit } = useForm();
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector(useCurrentToken);

  useEffect(() => {
    fetch(
      'https://bloomhub-assignment6-backend.vercel.app/api/auth/verify-token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }
    )
      .then((res) => res.json())
      .then((data: any) => {
        if (data?.data !== true) {
          dispatch(
            setShopkeeperInLocalState({ shopkeeper: null, token: null })
          );
        } else {
          navigate('/dashboard');
        }
      });
  }, [token, navigate, dispatch]);

  const handleLogin = async (loginData: FieldValues) => {
    if (!loginData?.email || !loginData?.password) {
      toast.error('Email or Password is missing', {
        position: 'top-right',
        icon: '😢',
        duration: 1500,
      });
    } else {
      const response = await login(loginData).unwrap();

      const shopkeeperFromDB = response?.data?.shopkeeper;
      const accessToken = response?.data?.token;

      if (shopkeeperFromDB && accessToken) {
        toast.success('Login Successful', {
          position: 'top-right',
          icon: '👏',
          duration: 1500,
        });
        dispatch(
          setShopkeeperInLocalState({
            shopkeeper: shopkeeperFromDB,
            token: accessToken,
          })
        );
        setTimeout(() => {
          navigate('/dashboard/profile');
        }, 500);
      }
    }
  };

  const toggleShowingPassword = () => {
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      setIsPasswordVisible(true);
    } else {
      passwordInput.type = 'password';
      setIsPasswordVisible(false);
    }
  };

  return (
    <div className="grid h-screen grid-cols-12">
      <div
        className={`${Styles.bannerbg} col-span-12 lg:col-span-6 hidden lg:block`}
      ></div>
      <div className="flex justify-center items-center col-span-12 lg:col-span-6">
        <div className="border border-slate-100 w-5/6 md:w-4/6 px-4 lg:px-8 py-4 lg:py-10">
          <h3 className="text-xl text-center font-semibold capitalize mb-6">
            Please login to continue !
          </h3>

          <form
            className="space-y-4 md:space-y-6"
            onSubmit={handleSubmit(handleLogin)}
          >
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500  focus:outline-none"
                placeholder="name@company.com"
                {...register('email')}
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white  focus:outline-none"
                {...register('password')}
              />
              <span
                className="absolute cursor-pointer top-10 right-3"
                onClick={toggleShowingPassword}
              >
                {isPasswordVisible ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </span>
            </div>
            <button
              type="submit"
              className="w-full text-white bg-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Sign in
            </button>
            <div className="flex items-center justify-between">
              <p className="text-sm">Not Registered Yet?</p>
              <Link to="/signup">
                <span className="text-sm hover:text-red-300  hover:transition-all duration-300 underline">
                  Go to Signup
                </span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
