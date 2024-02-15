import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/redux/api/authApi';
import { useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { RxCross2 } from 'react-icons/rx';
import { toast } from 'sonner';
import demoPic from '../../assets/images/babul.png';

const Profile = () => {
  const [showProfilePhotoUpdateModal, setShowProfilePhotoUpdateModal] =
    useState<boolean>(false);
  const [newProfileImage, setNewProfileImage] = useState('' as any);
  const [updateProfilePhotoOngoing, setUpdateProfilePhotoOngoing] =
    useState(false);
  const { data: profileData, isLoading } = useGetProfileQuery(undefined);
  const shopkeeperProfileFromDb = profileData?.data;
  const [updateProfile] = useUpdateProfileMutation();

  const bhpHandler = async () => {
    if (shopkeeperProfileFromDb?.bhp < 1) {
      alert(
        'Bhp means bloomhub point. For each $10 spending, you will get 1 Bhp. And if you redeem 1 Bhp, you will get $0.1 cashback.You have not enough Bhp yet. You need to purchase something to get Bhp.'
      );
    } else {
      const allow = window.confirm(
        'Bhp means bloomhub point. For each $10 spending, you will get 1 Bhp. And if you redeem 1 Bhp, you will get $0.1 cashback. Do you want to redeem your existing bhp?'
      );
      if (!allow) {
        toast.error('Redeem cancelled', {
          position: 'top-right',
          duration: 1500,
        });
      } else {
        let bhp = shopkeeperProfileFromDb?.bhp;
        const dollarShouldBeAdded = (Number(bhp) * 0.1).toFixed(2);
        const response = await updateProfile({
          bhp: '0',
          profileImage: shopkeeperProfileFromDb?.profileImage,
        }).unwrap();

        if (response?.statusCode === 200) {
          toast.success(
            `Bhp redeempt successful, you got $${dollarShouldBeAdded} in your account!`,
            {
              position: 'top-right',
              duration: 1500,
            }
          );
        } else {
          toast.error('Bhp redeem failed', {
            position: 'top-right',
            duration: 1500,
          });
        }
      }
    }
  };

  // handle profile image upload
  const handleProfilePhotoUpload = (e: any) => {
    e.preventDefault();
    setUpdateProfilePhotoOngoing(true);

    const preset_key = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const cloud_name = import.meta.env.VITE_CLODINARY_CLOUD_NAME;

    const formData = new FormData();

    if (!newProfileImage) {
      setUpdateProfilePhotoOngoing(false);
      toast.error('Please select an image to upload', {
        position: 'top-right',
        duration: 1500,
      });
      return;
    }

    // check if image size is less than 1MB and type is jpg, jpeg or png
    if (newProfileImage) {
      if (newProfileImage.size > 1024 * 1024) {
        setUpdateProfilePhotoOngoing(false);
        toast.error('Image size should be less than 1MB', {
          position: 'top-right',
          duration: 1500,
        });
        return;
      } else if (
        newProfileImage.type !== 'image/jpeg' &&
        newProfileImage.type !== 'image/jpg' &&
        newProfileImage.type !== 'image/png'
      ) {
        setUpdateProfilePhotoOngoing(false);
        toast.error('We accept only jpg, jpeg and png type images', {
          position: 'top-right',
          duration: 1500,
        });
        return;
      } else {
        formData.append('file', newProfileImage);
        formData.append('upload_preset', preset_key);
      }
    }

    fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then(async (data) => {
        const response = await updateProfile({
          bhp: shopkeeperProfileFromDb?.bhp,
          profileImage: data?.secure_url
            ? data?.secure_url
            : shopkeeperProfileFromDb?.profileImage,
        }).unwrap();

        if (response?.statusCode === 200) {
          toast.success('Profile photo updated successfully', {
            position: 'top-right',
            duration: 1500,
          });
          setShowProfilePhotoUpdateModal(!showProfilePhotoUpdateModal);
          setUpdateProfilePhotoOngoing(false);
          setNewProfileImage('');
        } else {
          toast.error('Profile photo update failed', {
            position: 'top-right',
            duration: 1500,
          });
          setUpdateProfilePhotoOngoing(false);
        }
      })
      .catch(() => {
        toast.error('Image upload failed', {
          position: 'top-right',
          duration: 1500,
        });
        setUpdateProfilePhotoOngoing(false);
      });
  };

  return (
    <div>
      <h3 className="text-center lg:mt-8 text-2xl font-semibold">
        Profile Management
      </h3>
      <p className="text-center lg:mt-2 text-md lg:w-2/3 lg:mx-auto">
        In this section, you can manage your profile, update your information,
        can see how many products you have added and how many sales you have
        made.
      </p>
      <div className="w-full lg:w-6/12 mx-auto mt-12 lg:mt-24">
        <div className="h-56 mx-auto py-5 px-3 shadow-md rounded-md flex flex-col justify-center items-center relative">
          {isLoading ? (
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-300"></div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <div className="relative">
                <img
                  src={
                    shopkeeperProfileFromDb?.profileImage
                      ? shopkeeperProfileFromDb?.profileImage
                      : demoPic
                  }
                  alt={shopkeeperProfileFromDb?.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
                <CiEdit
                  style={{ fontSize: '24px', fontWeight: 'bold' }}
                  className="absolute text-red-400 top-1 -right-6 cursor-pointer"
                  title="update profile photo"
                  onClick={() => setShowProfilePhotoUpdateModal(true)}
                />
                {showProfilePhotoUpdateModal ? (
                  <>
                    <div
                      className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none transition-all"
                      data-aos="zoom-in"
                      data-aos-duration="500"
                    >
                      <div className="relative w-[370px] lg:w-[640px] my-6 mx-auto">
                        {/*content*/}
                        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                          {/*header*/}
                          <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                            <h3 className="text-md font-semibold text-center">
                              Update Profile Photo
                            </h3>
                            <button
                              className="text-2xl text-red-300 hover:text-red-700 hover:transition-all duration-300 ease-in-out"
                              onClick={() =>
                                setShowProfilePhotoUpdateModal(false)
                              }
                            >
                              <RxCross2 />
                            </button>
                          </div>
                          {/*body*/}
                          <form className="py-6 px-10">
                            <div className="grid gap-4 grid-cols-1 sm:gap-x-6 sm:gap-y-4">
                              {/* profile image */}
                              <div className="w-full">
                                <label
                                  htmlFor="profileimage"
                                  className="block mb-2 text-sm font-medium "
                                >
                                  Profile Photo
                                </label>

                                <input
                                  type="file"
                                  name="profileimage"
                                  id="profileimage"
                                  className="text-sm rounded-lg block w-full p-2.5 bg-gray-50 border-gray-600  focus:outline-none"
                                  required
                                  onChange={(e) => {
                                    const selectedFile =
                                      e.target.files && e.target.files[0];
                                    if (selectedFile) {
                                      setNewProfileImage(selectedFile);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              className="bg-red-300 rounded-md px-4 py-2 cursor-pointer text-white hover:bg-red-400 transition-colors duration-300 ease-in-out flex items-center space-x-2 mt-6 ml-auto disabled:cursor-not-allowed disabled:bg-gray-300"
                              onClick={(e) => handleProfilePhotoUpload(e)}
                              disabled={updateProfilePhotoOngoing}
                            >
                              {updateProfilePhotoOngoing
                                ? 'Updating Profile Photo ...'
                                : 'Update Profile Photo'}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black transition-all duration-300"></div>
                  </>
                ) : null}
              </div>
              <h3 className="text-xl font-semibold mt-4">
                {shopkeeperProfileFromDb?.name}
              </h3>
              <h3 className="text-sm font-bold mt-4 capitalize">
                {`${shopkeeperProfileFromDb?.role}, Bloomhub`}
              </h3>
              <h3 className="text-sm">{shopkeeperProfileFromDb?.email}</h3>
              <h3
                className="text-md absolute right-0 top-0 text-red-400 cursor-pointer shadow-md p-2 rounded-md"
                onClick={bhpHandler}
              >
                {`${shopkeeperProfileFromDb?.bhp} Bhp`}
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
