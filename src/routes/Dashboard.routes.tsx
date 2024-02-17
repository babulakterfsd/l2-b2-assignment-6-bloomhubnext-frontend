import Profile from '@/components/dashboard/Profile';
import CustomerDashboard from '@/components/dashboard/customerarea/CustomerDashboard';
import AddProduct from '@/components/dashboard/productmanagement/AddProduct';
import CreateVariant from '@/components/dashboard/productmanagement/CreateVariant';

import ProductManagement from '@/components/dashboard/productmanagement/ProductManagement';
import UpdateProduct from '@/components/dashboard/productmanagement/UpdateProduct';
import SalesHistoryManagement from '@/components/dashboard/saleshistory/SalesHistoryManagement';
import SalesManagement from '@/components/dashboard/salesmanagement/SalesManagement';
import NotFound from '@/pages/NotFound';

export const dashboardRoutePaths = [
  { index: true, element: <Profile /> },
  { path: 'profile', element: <Profile /> },
  { path: 'productmanagement', element: <ProductManagement /> },
  { path: 'productmanagement/addproduct', element: <AddProduct /> },
  { path: 'productmanagement/updateproduct/:id', element: <UpdateProduct /> },
  { path: 'productmanagement/createvariant/:id', element: <CreateVariant /> },
  { path: 'customerdashboard', element: <CustomerDashboard /> },
  { path: 'salesmanagement', element: <SalesManagement /> },
  { path: 'saleshistory', element: <SalesHistoryManagement /> },
  { path: '*', element: <NotFound /> },
];
