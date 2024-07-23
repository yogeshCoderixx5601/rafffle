"use client";
import React, { useCallback, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import { createUserAccount } from "@/apiHelper/createUserAccount";
import { useDispatch } from "react-redux";
import { addNotification } from "@/stores/reducers/notificationReducer";
import { verifyingUserAccount } from "@/apiHelper/verifyUserAccount";

const DashboardPage = () => {
  const walletDetails = useWalletAddress();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateUserWallet = useCallback(async () => {
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
      console.log("Verification response:", response);

      if (response?.data?.success === false) {
        await createUserWallet();
      } else {
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

  const createUserWallet = async () => {
    try {
      const response = await createUserAccount(walletDetails);
      console.log("Create user wallet response:", response);

      dispatch(
        addNotification({
          id: Date.now(),
          message: "Account successfully created!",
          open: true,
          severity: "success",
        })
      );
    } catch (err) {
      console.error("Error creating wallet:", err);
      setError("Failed to create wallet. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
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
      <button
        className="p-4 custom-gradient text-white rounded-lg shadow-lg"
        onClick={handleCreateUserWallet}
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : "Create Account"}
      </button>
    </div>
  );
};

export default DashboardPage;
