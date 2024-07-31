"use client";
import { getRaffles } from "@/apiHelper/getRaffles";
import UserCreatedRaffleCard from "@/components/Elements/UserCreatedRaffleCard";
import { RaffleItem } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

const UserCreatedRaffles = ({ userVaultDetails }: { userVaultDetails: any }) => {
  console.log(userVaultDetails, "------------userVaultDetails UserCreatedRaffles");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raffle, setRaffle] = useState<RaffleItem[]>([]);

  const fetchingRaffles = useCallback(async () => {
    console.log("in side fetchingRaffles");
    try {
      const response = await getRaffles({ ordinal_address: userVaultDetails?.ordinal_address, });
      console.log(response?.data, "--------UserCreatedRaffles DATA");
      if (response?.data.success === true) {
        setRaffle(response.data.result);
      } else {
        setError("Failed to fetch raffle data");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching the raffle data");
    } finally {
      setLoading(false);
    }
  }, [userVaultDetails?.ordinal_address]);

  useEffect(() => {
    fetchingRaffles();
  }, [fetchingRaffles]);

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
    <div className="w-full flex items-center flex-wrap pb-10 lg:px-6 ">
      {raffle.length === 0 ? (
        <div className="text-center w-full flex justify-center items-center">No raffle created</div>
      ) : (
        raffle.map((item, idx) => (
          <UserCreatedRaffleCard item={item} key={idx} />
        ))
      )}
    </div>
  );
};

export default UserCreatedRaffles;
