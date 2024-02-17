import {
  setShopkeeperInLocalState,
  useCurrentShopkeeper,
} from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { TShopkeeper } from '@/types/commonTypes';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentCustomer = useAppSelector(useCurrentShopkeeper) as TShopkeeper;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (currentCustomer?.role !== 'customer') {
      dispatch(
        setShopkeeperInLocalState({
          shopkeeper: null,
          token: null,
        })
      );
      navigate('/login');
    }
  }, [location.pathname, currentCustomer?.role, navigate]);

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
