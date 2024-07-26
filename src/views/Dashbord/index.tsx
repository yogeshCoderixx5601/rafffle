"use client";
import React, { useCallback, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import { createUserAccount } from "@/apiHelper/createUserAccount";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "@/stores/reducers/notificationReducer";
import { verifyingUserAccount } from "@/apiHelper/verifyUserAccount";
import { setVaultAndOrdinalAddress } from "@/stores/reducers/generalReducer";
import { RootState } from "@/stores";
import { IVaultDetails } from "@/types";
import { shortenString } from "@/utils";
import { getVaultBalance } from "@/apiHelper/getVaultBalance";
import { fetchInscriptions } from "@/apiHelper/fetchInscriptionsParams";

const DashboardPage = () => {
  const walletDetails = useWalletAddress();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userExist, setUserExist] = useState<boolean>();
  const [inscriptions, setInscriptions] = useState<any[]>([]);

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
      // console.log("Verification response:", response?.data?.result);
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
  }, [walletDetails]);

  const handleCreateUserWallet = async () => {
    try {
      if (walletDetails && walletDetails.ordinal_address) {
        const response = await createUserAccount(walletDetails);
        // console.log("Create user wallet response:", response?.data?.result);

        dispatch(setVaultAndOrdinalAddress(response?.data?.result[0]));

        dispatch(
          addNotification({
            id: Date.now(),
            message: "Account successfully created!",
            open: true,
            severity: "success",
          })
        );
      }
    } catch (err) {
      console.error("Error creating wallet:", err);
      setError("Failed to create wallet. Please try again.");
    }
  };

  const userVaultDetails = useSelector(
    (state: RootState) => state.general.userAccount
  );
  // console.log(userVaultDetails, "---------USER VAULT DETAILS");


  console.log(inscriptions, "insriptions");

  return (
    <div className="w-full h-screen px-4 flex items-center justify-center">
      {loading && (
        <div className="mb-4">
          <CircularProgress />
        </div>
      )}
      {error && (
        <div className="mb-4 text-red-500">
          <p>{error}</p>
        </div>
      )}
      {!userExist ? (
        <button
          className="p-4 custom-gradient text-white rounded-lg shadow-lg flex flex-col justify-center items-center"
          onClick={handleCreateUserWallet}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Create Account"}
        </button>
      ) : (
        <div className="absolute top-[20%] right-4 p-4 custom-gradient text-white rounded-lg shadow-lg">
          {shortenString(userVaultDetails.vault)}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
