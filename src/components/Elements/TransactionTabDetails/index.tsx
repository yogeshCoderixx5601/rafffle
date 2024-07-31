import { convertUtcToLocalZone, formattedTime, shortenString } from "@/utils";
import React from "react";

const TransactionTabDetails = ({ items }: { items: any[] }) => {
  return (
    <div className="w-full flex flex-col bg-customPurple_800 p-4 rounded-lg gap-3">
      <div className="bg-customPurple_900 p-4 rounded-lg">
        {/* Scrollable Container */}
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-80"> {/* Adjust max-height as needed */}
            <div className="flex flex-col gap-2">
              {/* Header Row */}
              <div className="flex font-bold border-b border-gray-600 bg-customPurple_700 p-2">
                <div className="w-1/4 px-4">Txn</div>
                <div className="w-1/4 px-4">Buyer</div>
                <div className="w-1/4 px-4">Date</div>
                <div className="w-1/4 px-4">Tickets</div>
              </div>

              {/* Data Rows */}
              <div className="flex flex-col"> 
                {items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex mb-2 bg-customPurple_800 hover:bg-customPurple_700 transition-colors duration-200 p-2 rounded-lg"
                    // Ensure there's a 4px gap between data elements
                  >
                    <div className="w-1/4 px-4">{shortenString(item._id)}</div>
                    <div className="w-1/4 px-4">{shortenString(item.ordinal_address)}</div>
                    <div className="w-1/4 px-4">{formattedTime(convertUtcToLocalZone(item.date))}</div>
                    <div className="w-1/4 px-4">{item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTabDetails;
