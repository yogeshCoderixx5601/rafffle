"use client";
import { getPurchasedRaffle } from '@/apiHelper/getPurchasedRaffle';
import { getRaffles } from '@/apiHelper/getRaffles';
import ViewRaffleCard from '@/components/Elements/ViewRaffleCard';
import { RaffleItem } from '@/types';
import { useWalletAddress } from 'bitcoin-wallet-adapter';
import React, { useCallback, useEffect, useState } from 'react';

const RaffleIdPage = ({ raffleId }: { raffleId: string }) => {
  const walletDetails = useWalletAddress();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRaffle, setViewRaffle] = useState<RaffleItem | null>(null);
  const [purchasedRaffles, setPurchasedRaffles] = useState<any[]>([]);

  const fetchRaffle = useCallback(async () => {
    try {
      const ordinalAddress = walletDetails?.ordinal_address;
      if (ordinalAddress) {
        const response = await getRaffles({ raffleId });
        if (response?.data.success) {
          setViewRaffle(response.data.result[0]);
        } else {
          setError("Failed to fetch raffle data");
        }
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching the raffle data");
    } finally {
      setLoading(false);
    }
  }, [raffleId, walletDetails]);

  const fetchPurchasedRaffles = useCallback(async () => {
    try {
      const ordinalAddress = walletDetails?.ordinal_address;
      if (ordinalAddress) {
        const response = await getPurchasedRaffle({ raffle: raffleId });
        if (response?.data.success) {
          // console.log(response.data.result,"-----------response.data.result")
          setPurchasedRaffles(response.data.result);
        } else {
          setError("Failed to fetch purchased raffle data");
        }
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching the purchased raffle data");
    } finally {
      setLoading(false);
    }
  }, [walletDetails]);

  useEffect(() => {
    if (walletDetails) {
      fetchRaffle();
      fetchPurchasedRaffles();
    }
  }, [walletDetails, fetchRaffle]);

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
    <div className=" bg-gray-900 text-white flex items-center justify-center">
      {viewRaffle ? (
        <ViewRaffleCard item={viewRaffle} purchaseRaffles={purchasedRaffles} />
      ) : (
        <div>No raffle data available.</div>
      )}
    </div>
  );
};

export default RaffleIdPage;
