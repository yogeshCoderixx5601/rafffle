"use client";
import React, { useState } from "react";
import { IVaultDetails } from "@/types";
import { shortenString } from "@/utils";
import { createUserAccount } from "@/apiHelper/createUserAccount";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import { useDispatch } from "react-redux";
import { setVaultAndOrdinalAddress } from "@/stores/reducers/generalReducer";
import { addNotification } from "@/stores/reducers/notificationReducer";
import { CircularProgress } from "@mui/material";
import copy from "copy-to-clipboard";
import { FiCopy } from "react-icons/fi";

interface UserVaultProps {
  vault: IVaultDetails;
  userExist?: boolean;
}

const UserProfile = ({ vault, userExist }: UserVaultProps) => {
  const walletDetails = useWalletAddress();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleCreateUserWallet = async () => {
    if (!walletDetails?.ordinal_address || !walletDetails.connected) {
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

    setLoading(true);
    try {
      const response = await createUserAccount(walletDetails);
      const vaultData = response?.data?.result[0];

      if (vaultData) {
        dispatch(setVaultAndOrdinalAddress(vaultData));
        dispatch(
          addNotification({
            id: Date.now(),
            message: "Account successfully created!",
            open: true,
            severity: "success",
          })
        );
      } else {
        throw new Error("No vault data received");
      }
    } catch (err:any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to create account. Please try again.";
      console.error("Error creating wallet:", err);
      dispatch(
        addNotification({
          id: Date.now(),
          message: errorMessage,
          open: true,
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (walletDetails?.ordinal_address) {
      copy(walletDetails.ordinal_address);
      dispatch(
        addNotification({
          id: Date.now(),
          message: "Address Copied",
          open: true,
          severity: "success",
        })
      );
    }
  };

  return (
    <div className="w-full p-4 bg-purple-900 rounded-lg text-white">
      {userExist ? (
        <div className="w-full flex justify-between items-center">
          <span>Vault</span>
          <div className="flex gap-2 items-center">
            <span className="text-teal-300">{shortenString(vault.vault)}</span>
            <span
              className="cursor-pointer"
              onClick={handleCopyAddress}
              aria-label="Copy address"
            >
              <FiCopy className="ml-2 hover:text-green-600 transition-all" />
            </span>
          </div>
        </div>
      ) : (
        <button
          className="p-4 text-white rounded-lg shadow-lg flex flex-col justify-center items-center"
          onClick={handleCreateUserWallet}
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Create Account"}
        </button>
      )}
    </div>
  );
};

export default UserProfile;
