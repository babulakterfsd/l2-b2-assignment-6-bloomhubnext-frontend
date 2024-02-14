import AllProductsContainer from './AllProductsContainer';

const ProductManagement = () => {
  return (
    <div>
      <h3 className="text-center lg:mt-8 text-2xl font-semibold">
        All products in the inventory
      </h3>
      <p className="text-center lg:mt-2 text-md lg:w-1/2 lg:mx-auto">
        A flower, also known as a bloom or blossom, is the reproductive
        structure found in flowering plants Flowers consist of a combination of
        vegetative organ
      </p>
      <div className="lg:w-11/12 lg:mx-auto">
        <AllProductsContainer />
      </div>
    </div>
  );
};

export default ProductManagement;
