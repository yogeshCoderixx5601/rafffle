import React, { useState, useEffect } from "react";
import { convertUtcToLocalZone, end_in_time, shortenString } from "@/utils";
import copy from "copy-to-clipboard";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import { addNotification } from "@/stores/reducers/notificationReducer";
import { useDispatch } from "react-redux";
import { FiCopy } from "react-icons/fi";

interface Item {
  address: string;
  end_date: string;
  createdAt: string;
  price_per_ticket: number;
  total_tickets: number;
  sold_tickets: number;
}

const ActiveTapDetails = ({ item }: { item: Item }) => {
  const walletDetails = useWalletAddress();
  const dispatch = useDispatch();
  const [endInfo, setEndInfo] = useState<{
    isExpired: boolean;
    displayTime: string;
  }>({ isExpired: false, displayTime: "" });

  useEffect(() => {
    const interval = setInterval(() => {
      setEndInfo(end_in_time(convertUtcToLocalZone(item.end_date)));
    }, 1000);

    console.log(endInfo, "---end info");

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [item.end_date]);

  return (
    <div className="w-full flex flex-col justify-between bg-customPurple_800 p-4 rounded-lg gap-3">
     <div className="bg-customPurple_900 p-4 rounded-lg">
       <div className="flex items-center gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-customPurple_950 text-sm">
              {endInfo.isExpired
                ? "Ticket Sale Ended on:"
                : "Ticket Sale Ends In:"}
            </div>
            <div>{endInfo.displayTime}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-customPurple_950 text-sm">
              Raffle Start Date:
            </div>
            <div>{convertUtcToLocalZone(item.createdAt)}</div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-customPurple_950 text-sm">Ticket Cost:</div>
            <div>{item.price_per_ticket}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-customPurple_950 text-sm">
              Tickets Remaining:
            </div>
            <div>
              {item.total_tickets - item.sold_tickets} / {item.total_tickets}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-customPurple_950 text-sm">Raffle Owner:</div>
        <div className="flex gap-2  items-center">
          <div className=""> {shortenString(item.address)}</div>

          <div
            className="cursor-pointer"
            onClick={() => {
              copy(walletDetails?.ordinal_address + "");
              dispatch(
                addNotification({
                  id: new Date().valueOf(),
                  message: "Address Copied",
                  open: true,
                  severity: "success",
                })
              );
            }}
          >
            <FiCopy className="ml-2 hover:text-green-600 transition-all" />
          </div>
        </div>
      </div>
     </div>
    </div>
  );
};

export default ActiveTapDetails;
