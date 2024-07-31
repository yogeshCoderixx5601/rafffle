"use client";
import { getPurchasedRaffle } from "@/apiHelper/getPurchasedRaffle";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import React, { useCallback, useEffect, useState } from "react";
import UserPurchasedRaffleCard from "../UserPurchasedRaffleCard";
import { CircularProgress } from "@mui/material";
import { IUserRaffle } from "@/types";
import { useDispatch } from "react-redux";
import { addNotification } from "@/stores/reducers/notificationReducer";

const UserPurchasedRaffle = () => {
  const walletDetails = useWalletAddress();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raffle, setRaffle] = useState<IUserRaffle[]>([]);

  const fetchingRaffles = useCallback(async () => {
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
      if (walletDetails && walletDetails.ordinal_address) {
        const ordinal_address = walletDetails.ordinal_address;
        const response = await getPurchasedRaffle({ ordinal_address });
        console.log(response?.data, "--------getPurchasedRaffle DATA");
        if (response?.data.success === true) {
          setRaffle(response.data.result);
        } else {
          setError("Failed to fetch raffle data");
        }
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching the raffle data");
      dispatch(
        addNotification({
          id: Date.now(),
          message: "An error occurred while fetching the raffle data",
          open: true,
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchingRaffles();
  }, []);

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

  // console.log(raffle[0].raffle, "----purcheased raffle ");
  return (
    <div className="w-full flex  items-center flex-wrap pb-10 lg:px-6">
      {raffle.length === 0 ? (
        <div className="text-center w-full flex justify-center items-center">
          No raffle purchased
        </div>
      ) : (
        raffle.map((item, idx) => (
          <UserPurchasedRaffleCard item={item} key={idx} />
        ))
      )}
    </div>

    // <div className="w-full flex items-center flex-wrap pb-10 lg:px-6">
    //   {raffle.map((item, idx) => (
    //     <UserPurchasedRaffleCard item={item} key={idx} />
    //   ))}
    // </div>
  );
};

export default UserPurchasedRaffle;
