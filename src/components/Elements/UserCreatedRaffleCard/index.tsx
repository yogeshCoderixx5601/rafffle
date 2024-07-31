"use client";
import { RaffleItem } from "@/types";
import { shortenString } from "@/utils";
import Link from "next/link";
import React, { useState } from "react";

const UserCreatedRaffleCard = ({ item }: { item: RaffleItem }) => {
  console.log(item, "item");

  return (
    <Link href={`raffle/${item._id}`}  className="w-full sm:w-full md:w-1/2 lg:w-1/3 p-2">
      <div className="group border border-customPurple_800 bg-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:border-gray-600 hover:bg-gray-700 shadow-md hover:shadow-lg">
        <div className="relative w-full overflow-hidden rounded-t-lg">
          <img
            className="object-cover w-full h-[200px] transition-transform duration-300 ease-in-out transform group-hover:scale-110 rounded-t-lg"
            src={`http://192.168.1.17:8080/content/${item.inscription_id}`}
            alt="Raffle Item"
          />
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="text-sm text-white mb-2">
              <p className="font-semibold">Inscription Id</p>
              <p>{shortenString(item.inscription_id)}</p>
            </div>
            <div className="text-sm text-white mb-2">
              <p className="font-semibold">Inscription No</p>
              <p>{item.inscription_number}</p>
            </div>
          </div>
          <div className="flex justify-between text-white mb-2">
            <div className="text-sm text-white mb-2">
              <p className="font-semibold">Remaining Tickets</p>
              <p>
                {item.total_tickets - item.sold_tickets} / {item.total_tickets}
              </p>
            </div>
            <div className="text-sm text-white mb-2">
              <p className="font-semibold">Price / ticket</p>
              <p>{item.price_per_ticket} </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserCreatedRaffleCard;

