import { convertUtcToLocalZone, formattedTime, shortenString } from "@/utils";
import React from "react";

const TransactionTabDetails = ({ items }: { items: any[] }) => {
  return (
    <div className="w-full flex flex-col bg-customPurple_800 p-4 rounded-lg gap-3">
      <div className="bg-customPurple_900 p-4 rounded-lg">
        {/* Scrollable Container */}
        <div className="overflow-x-auto overflow-y-auto max-h-80 no-scrollbar">
          <table className="min-w-full divide-y divide-gray-700">
            {/* Table Header */}
            <thead className="bg-customPurple_700">
              <tr>
                <th className="px-4 py-2 text-left text-white font-bold">Txn</th>
                <th className="px-4 py-2 text-left text-white font-bold">Buyer</th>
                <th className="px-4 py-2 text-left text-white font-bold">Date</th>
                <th className="px-4 py-2 text-left text-white font-bold">Tickets</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody className="divide-y divide-gray-600">
              {items?.map((item, idx) => (
                <tr
                  key={idx}
                  className="bg-customPurple_800 hover:bg-customPurple_700 transition-colors duration-200"
                >
                  <td className="px-4 py-2">{shortenString(item._id)}</td>
                  <td className="px-4 py-2">{shortenString(item.ordinal_address)}</td>
                  <td className="px-4 py-2">{formattedTime(convertUtcToLocalZone(item.date))}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionTabDetails;
