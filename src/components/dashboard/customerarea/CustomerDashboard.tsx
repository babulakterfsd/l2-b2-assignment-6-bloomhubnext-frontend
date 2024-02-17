import {
  setShopkeeperInLocalState,
  useCurrentShopkeeper,
} from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { TShopkeeper } from '@/types/commonTypes';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const currentCustomer = useAppSelector(useCurrentShopkeeper) as TShopkeeper;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const logout = async () => {
      if (currentCustomer?.role !== 'customer') {
        try {
          const response = await fetch(
            'http://localhost:5000/api/auth/logout',
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

  return (
    <div>
      <h3 className="text-center lg:mt-8 text-2xl font-semibold">
        Buy your favorite flowers from our store
      </h3>
      <p className="text-center lg:mt-2 text-md lg:w-1/2 lg:mx-auto">
        This is the Bloomhub store for customers. You can buy your favorite
        flowers from here. We have a wide range of flowers available for you.
        You can choose from the list and buy them.
      </p>
      <div className="lg:w-11/12 lg:mx-auto overflow-x-hidden"></div>
    </div>
  );
};

export default CustomerDashboard;
