"use client";
import { getRaffle } from "@/apiHelper/getRaffle";
import RaffleCard from "@/components/Elements/RaffleCard";
import { RaffleItem } from "@/types";
import React, { useEffect, useState } from "react";



const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raffle, setRaffle] = useState<RaffleItem[]>([]);

  const fetchingRaffle = async () => {
    try {
      const response = await getRaffle();
      console.log(response?.data, "RAFFLE DATA");
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
  };

  useEffect(() => {
    fetchingRaffle();
  }, []);

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


