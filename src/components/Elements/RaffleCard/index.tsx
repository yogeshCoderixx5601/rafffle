"use client";
import { buyTickets } from "@/apiHelper/buyTickets";
import { updateSoldTickets } from "@/apiHelper/updateSoldTickets";
import { RaffleItem } from "@/types";
import { shortenString } from "@/utils";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from Next.js

const RaffleCard = ({ item }: { item: RaffleItem }) => {
  const walletDetails = useWalletAddress();
  const router = useRouter(); // Initialize the router
  console.log(item, "item");

  const [quantity, setQuantity] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const numericValue = Number(newValue);

    if (
      newValue === "" ||
      (numericValue >= 1 &&
        numericValue <= item.total_tickets - item.sold_tickets)
    ) {
      setQuantity(newValue === "" ? "" : numericValue);
    }
  };

  console.log(quantity, "quantity");

  const handleBuyTicket = async () => {
    setLoading(true);
    setError(null);

    if (
      walletDetails &&
      walletDetails.ordinal_address &&
      walletDetails.connected
    ) {
      try {
        const buyerDetails = {
          raffle_id: item._id,
          ordinal_address: walletDetails.ordinal_address,
          cardinal_address: walletDetails.cardinal_address,
          ordinal_pubkey: walletDetails.ordinal_pubkey,
          cardinal_pubkey: walletDetails.cardinal_pubkey,
          wallet: walletDetails.wallet,
          quantity,
          rune_id: item.rune_id,
          rune_name: item.rune_name,
        };

        const response = await buyTickets(buyerDetails);
        console.log(response, "response buy ticket");
        console.log(response?.data.success, quantity, "inside if");
        if (response?.data.success) {
          const body = { _id: item._id, sold_tickets: quantity };
          console.log(response.data.success, "inside if");
          await updateSoldTickets(body);
          router.refresh(); // Reload the page after successfully buying the ticket
        } else {
          throw new Error("Failed to purchase tickets.");
        }
      } catch (error: any) {
        setError(error.message || "Failed to buy tickets. Please try again.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Wallet not connected.");
      setLoading(false);
    }
  };

  return (
    <Link href={``} className="w-full sm:w-full md:w-1/2 lg:w-1/4 p-2">
      <div className="group border border-customPurple_800 bg-gray-800 rounded-lg transition-all duration-300 ease-in-out hover:border-gray-600 hover:bg-gray-700 shadow-md hover:shadow-lg">
        <div className="relative w-full overflow-hidden rounded-t-lg">
          <img
            className="object-cover w-full h-[200px] transition-transform duration-300 ease-in-out transform group-hover:scale-110 rounded-t-lg"
            src={`http://192.168.1.17:8080/content/${item.inscription_id}`}
            alt="Raffle Item"
          />
        </div>
        <div className="p-4">
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
            <div>
              <p className="font-semibold">Remaining Tickets</p>
              <p>
                {item.total_tickets - item.sold_tickets} / {item.total_tickets}
              </p>
            </div>
            <div>
              <p className="font-semibold">Price / ticket</p>
              <p>{item.price_per_ticket} </p>
            </div>
          </div>
          <div className="w-full flex justify-between items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={quantity === "" ? "" : quantity}
                onChange={handleChange}
                placeholder="QTY"
                className="bg-transparent border border-customPurple_800 rounded px-3 py-2 w-full max-w-xs outline-none focus:border-customPurple_900 transition-colors duration-300"
              />
            </div>
            <button
              onClick={handleBuyTicket}
              className="custom-gradient text-white rounded px-4 py-2 cursor-pointer hover:opacity-80 transition-opacity duration-300"
              disabled={loading}
            >
              {loading ? "Processing..." : "Buy"}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </Link>
  );
};

export default RaffleCard;

