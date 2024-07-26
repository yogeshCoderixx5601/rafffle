import { shortenString } from "@/utils";
import React from "react";
import { IoIosAddCircleOutline } from "react-icons/io";

type InscriptionData = {
  address:number;
  inscription_id: string;
  inscription_number: number;
};

const InscriptionSelector = ({
  selectedData,
  onOpenModal,
}: {
  selectedData: InscriptionData | null;
  onOpenModal: () => void;
}) => {
  // console.log("selectedData:", { selectedData });
  return (
    <div
      className="lg:w-[60vh] lg:h-[40vh] flex flex-col justify-center gap-6 border-2 border-customPurple_800 rounded-lg p-10 text-center text-customPurple_800 cursor-pointer hover:bg-transparent hover:text-white transition-colors"
      onClick={onOpenModal}
    >
      <div className="text-5xl w-full flex justify-center items-center">
        <IoIosAddCircleOutline />
      </div>
      <div className="text-lg min-w-vh-50">
        {selectedData
          ? `Selected: ${shortenString(selectedData.inscription_id)}`
          : "Choose Inscription for Auction"}
      </div>
    </div>
  );
};

export default InscriptionSelector;
