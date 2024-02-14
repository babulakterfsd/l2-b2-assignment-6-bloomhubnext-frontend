import {
  setShopkeeperInLocalState,
  useCurrentToken,
} from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = useAppSelector(useCurrentToken);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
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
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace={true} />;
  }

  return children as JSX.Element;
};

export default ProtectedRoute;
