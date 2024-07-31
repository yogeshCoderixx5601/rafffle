"use client";
import { getRaffles } from "@/apiHelper/getRaffles";
import RaffleCard from "@/components/Elements/RaffleCard";
import { RaffleItem } from "@/types";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import React, { useCallback, useEffect, useState } from "react";

const HomePage = () => {
  const walletDetails = useWalletAddress();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raffle, setRaffle] = useState<RaffleItem[]>([]);

  const fetchingRaffles = useCallback(async () => {
    console.log("Inside fetchingRaffles HomePage");
    try {
      if (walletDetails && walletDetails.ordinal_address) {
        console.log("Wallet details are available:", walletDetails);
        const response = await getRaffles({ live: true });
        console.log("Response from getRaffles:", response);
        
        if (response?.data?.success === true) {
          console.log("Raffle data received:", response.data.result);
          setRaffle(response.data.result);
        } else {
          setError("Failed to fetch raffle data");
        }
      } else {
        console.log("Wallet details are not available");
      }
    } catch (error) {
      console.error("Error occurred while fetching raffle data:", error);
      setError("An error occurred while fetching the raffle data");
    } finally {
      setLoading(false);
    }
  }, [walletDetails]);

  useEffect(() => {
    fetchingRaffles();
  }, [fetchingRaffles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="flex items-center flex-wrap pb-10 lg:px-6">
      {raffle.map((item) => (
        <RaffleCard item={item} key={item.inscription_id} />
      ))}
    </div>
  );
};

export default HomePage;
