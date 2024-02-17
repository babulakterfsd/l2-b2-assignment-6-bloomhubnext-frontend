import {
  setShopkeeperInLocalState,
  useCurrentShopkeeper,
} from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { TShopkeeper } from '@/types/commonTypes';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SellsSummary from './SellsSummary';

const SalesHistoryManagement = () => {
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

  return (
    <div>
      <h3 className="text-center lg:mt-8 text-2xl font-semibold">
        Sells summary and history of Bloomhub Shop
      </h3>
      <p className="text-center lg:mt-2 text-md lg:w-1/2 lg:mx-auto">
        A flower, also known as a bloom or blossom, is the reproductive
        structure found in flowering plants Flowers consist of a combination of
        vegetative organ
      </p>
      <div className="lg:w-11/12 lg:mx-auto">
        <SellsSummary />
      </div>
    </div>
  );
};

export default SalesHistoryManagement;
