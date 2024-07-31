import { shortenString } from "@/utils";
import React, { useState } from "react";

const ParticipantsTabDetails = ({items}:any) => {
  console.log(items,"------------purchaseRaffle")
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col justify-between bg-customPurple_800 p-4 rounded-lg gap-3">
      <div className="bg-customPurple_900 p-4 rounded-lg">
        <div className="flex justify-between text-white font-bold mb-4">
          <span>Wallet</span>
          <span>Tickets Bought</span>
        </div>
        {items?.map((item: any, idx:number) => (
          <div key={idx} className="bg-customPurple_800 p-2 rounded-md mb-2 flex justify-between items-center">
            <div className="flex items-center">
              <span>{shortenString(item.ordinal_address)}</span>
            </div>
            <span>{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsTabDetails;
