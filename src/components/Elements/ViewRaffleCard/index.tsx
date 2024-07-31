"use client";
import { RaffleItem } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import ActiveTapDetails from "../ActiveTabDetails";
import ParticipantsTabDetails from "../ParticipantTabDetails";
import TransactionTabDetails from "../TransactionTabDetails";
import { updateSoldTickets } from "@/apiHelper/updateSoldTickets";
import { buyTickets } from "@/apiHelper/buyTickets";
import { useRouter } from "next/navigation";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import { addNotification } from "@/stores/reducers/notificationReducer";
import { useDispatch } from "react-redux";

interface Iraffle {
  item: RaffleItem;
  purchaseRaffles: any;
}
const ViewRaffleCard = ({ item, purchaseRaffles }: Iraffle) => {
  console.log(item, "item view raffle");
  const walletDetails = useWalletAddress();
  const dispatch = useDispatch();
  const router = useRouter();

  const [quantity, setQuantity] = useState<number | "">(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  // Click handler to change the active tab
  const handleTabClick = (tab: React.SetStateAction<string>) => {
    setActiveTab(tab);
  };

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

  console.log(quantity, item, "quantity");

  const handleBuyTicket = async () => {
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
    {
      setLoading(true);
      setError(null);
      try {
        const buyerDetails = {
          raffle: item._id,
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
        console.log(response?.data.success, quantity, "inside if");
        if (response?.data.success) {
          const body = { _id: item._id, sold_tickets: quantity };
          const soldTicketUpdated = await updateSoldTickets(body);
          console.log(soldTicketUpdated);
          dispatch(
            addNotification({
              id: Date.now(),
              message: "Ticket Purchased successfully",
              open: true,
              severity: "success",
            })
          );
          router.refresh(); // Reload the page after successfully buying the ticket
        } else {
          console.log("Failed to purchase tickets.");
          dispatch(
            addNotification({
              id: Date.now(),
              message: "Failed to purchase tickets.",
              open: true,
              severity: "error",
            })
          );
        }
      } catch (error:any) {
        setError(error.message || "Failed to buy tickets. Please try again.");
        console.error(error);
        dispatch(
          addNotification({
            id: Date.now(),
            message: "Failed to purchase tickets.",
            open: true,
            severity: "error",
          })
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full  flex flex-col lg:w-11/12 lg:flex-row gap-4 bg-customPurple_950 text-white rounded-lg shadow-lg ">
      <div className="w-full lg:w-4/12 flex flex-col gap-4 p-4">
        <div className="w-full flex justify-center gap-2">
          <img
            src={`http://192.168.1.17:8080/content/${item.inscription_id}`}
            alt="Raffle"
            className="w-full h-[400px] rounded"
          />
        </div>
        {item?.live ? (
          <div className="w-full flex justify-between items-center gap-2">
            <input
              type="number"
              value={quantity || ""}
              onChange={handleChange}
              placeholder="QTY"
              className="flex-1 bg-transparent border border-customPurple_800 rounded px-3 py-2 w-full max-w-xs outline-none focus:border-customPurple_900 transition-colors duration-300"
            />
            <button
              onClick={handleBuyTicket}
              className="custom-gradient text-white rounded px-4 py-2 cursor-pointer hover:opacity-80 transition-opacity duration-300"
              disabled={loading}
            >
              {loading ? "Processing..." : "Buy"}
            </button>
          </div>
        ) : (
          <div className="flex justify-center">{`Auction Completed for this raffle try another one`}</div>
        )}
      </div>
      <div className="w-full lg:w-8/12 flex flex-col gap-2 p-4 lg:p-6 ">
        {/* Tab Headers */}
        <div className="flex gap-4 pb-4 border-b border-customPurple_800">
          <button
            className={`p-2 ${
              activeTab === "details"
                ? "bg-customPurple_800 rounded text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleTabClick("details")}
          >
            Details
          </button>
          <button
            className={`p-2 ${
              activeTab === "participants"
                ? "bg-customPurple_800 rounded text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleTabClick("participants")}
          >
            Participants
          </button>
          <button
            className={`p-2 ${
              activeTab === "transactions"
                ? "bg-customPurple_800 rounded text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleTabClick("transactions")}
          >
            Transactions
          </button>
        </div>

        {/* Tab Content */}
        <div className="lg:p-4">
          {activeTab === "details" && <ActiveTapDetails item={item} />}

          {activeTab === "participants" && (
            <ParticipantsTabDetails items={purchaseRaffles} />
          )}
          {activeTab === "transactions" && (
            <TransactionTabDetails items={purchaseRaffles} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRaffleCard;
