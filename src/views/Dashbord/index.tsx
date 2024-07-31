"use client";
import React, { useCallback, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "@/stores/reducers/notificationReducer";
import { verifyingUserAccount } from "@/apiHelper/verifyUserAccount";
import { setVaultAndOrdinalAddress } from "@/stores/reducers/generalReducer";
import { RootState } from "@/stores";
import DashboardSideBar from "@/components/Elements/DashboardSideBar";
import UserPurchasedRaffle from "@/components/Elements/UserPurchasedRaffle";
import UserCreatedRaffles from "@/components/Elements/UserCreatedRaffles";

const DashboardPage = () => {
  const walletDetails = useWalletAddress();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userExist, setUserExist] = useState<boolean>();
  const [activeLink, setActiveLink] = useState("user-created"); // Add state for active link

  const vetifyUserWallet = useCallback(async () => {
    if (
      !walletDetails ||
      !walletDetails.ordinal_address ||
      !walletDetails.connected
    ) {
      dispatch(
        addNotification({
          id: Date.now(),
          message: "Please connect your wallet.",
          open: true,
          severity: "error",
        })
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await verifyingUserAccount(
        walletDetails.ordinal_address
      );
      setUserExist(response?.data?.user_exist);
      dispatch(setVaultAndOrdinalAddress(response?.data?.result[0]));

      if (response?.data?.user_exist === false) {
      } else {
        dispatch(setVaultAndOrdinalAddress(response?.data?.result[0]));
        dispatch(
          addNotification({
            id: Date.now(),
            message: "User account already exists.",
            open: true,
            severity: "info",
          })
        );
      }
    } catch (err) {
      console.error("Error verifying user account:", err);
      dispatch(
        addNotification({
          id: Date.now(),
          message: "Failed to verify user account. Please try again.",
          open: true,
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [walletDetails, dispatch]);

  useEffect(() => {
    vetifyUserWallet();
  }, [walletDetails, vetifyUserWallet]);

  const userVaultDetails = useSelector(
    (state: RootState) => state.general.userAccount
  );

  console.log(userVaultDetails, "--------userVaultDetails");

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <CircularProgress size={50} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
     <div className="w-full lg:w-3/12">
       <DashboardSideBar
        vault={userVaultDetails}
        userExist={userExist}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
      />
     </div>
      <div className="w-full lg:w-9/12 details overflow-y-auto max-h-screen no-scrollbar">
        {activeLink === "user-created" && (
          <div className="w-full flex">
            <UserCreatedRaffles userVaultDetails={userVaultDetails} />
          </div>
        )}
        {activeLink === "user-purchesed" && (
          <div className="w-full flex">
            <UserPurchasedRaffle />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;



// "use client";
// import React, { useCallback, useEffect, useState } from "react";
// import { CircularProgress } from "@mui/material";
// import { useWalletAddress } from "bitcoin-wallet-adapter";
// import { useDispatch, useSelector } from "react-redux";
// import { addNotification } from "@/stores/reducers/notificationReducer";
// import { verifyingUserAccount } from "@/apiHelper/verifyUserAccount";
// import { setVaultAndOrdinalAddress } from "@/stores/reducers/generalReducer";
// import { RootState } from "@/stores";
// import DashboardSideBar from "@/components/Elements/DashboardSideBar";

// const DashboardPage = () => {
//   const walletDetails = useWalletAddress();
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [userExist, setUserExist] = useState<boolean>();

//   const vetifyUserWallet = useCallback(async () => {
//     if (
//       !walletDetails ||
//       !walletDetails.ordinal_address ||
//       !walletDetails.connected
//     ) {
//       dispatch(
//         addNotification({
//           id: Date.now(),
//           message: "Please connect your wallet.",
//           open: true,
//           severity: "error",
//         })
//       );
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const response = await verifyingUserAccount(
//         walletDetails.ordinal_address
//       );
//       // console.log("Verification response:", response?.data?.result);
//       setUserExist(response?.data?.user_exist);
//       dispatch(setVaultAndOrdinalAddress(response?.data?.result[0]));

//       if (response?.data?.user_exist === false) {
//       } else {
//         dispatch(setVaultAndOrdinalAddress(response?.data?.result[0]));
//         dispatch(
//           addNotification({
//             id: Date.now(),
//             message: "User account already exists.",
//             open: true,
//             severity: "info",
//           })
//         );
//       }
//     } catch (err) {
//       console.error("Error verifying user account:", err);
//       dispatch(
//         addNotification({
//           id: Date.now(),
//           message: "Failed to verify user account. Please try again.",
//           open: true,
//           severity: "error",
//         })
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [walletDetails, dispatch]);

//   useEffect(() => {
//     vetifyUserWallet();
//   }, [walletDetails]);

//   const userVaultDetails = useSelector(
//     (state: RootState) => state.general.userAccount
//   );

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <CircularProgress size={80}/>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-red-500 text-center">{error}</div>;
//   }

//   return (
//     <div className="flex gap-6">
//       <DashboardSideBar vault={userVaultDetails} userExist={userExist}/>
//       <div className="">
//         details
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;
