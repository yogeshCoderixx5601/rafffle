"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useWalletAddress } from "bitcoin-wallet-adapter";
import { fetchInscriptions } from "@/apiHelper/fetchInscriptionsParams";
import InscriptionSelector from "@/components/Elements/InscriptionSelector";
import AuctionDetailsForm from "@/components/Elements/AuctionsDetailsForm";
import InscriptionModal from "@/components/Elements/InscriptionModal";
import { createRaffle } from "@/apiHelper/createRaffle";
import { useDispatch } from "react-redux";
import { addNotification } from "@/stores/reducers/notificationReducer";
import { getVaultBalance } from "@/apiHelper/getVaultBalance";
import { getRaffle } from "@/apiHelper/getRaffle";
import { RaffleItem } from "@/types";

type InscriptionData = {
  address: number;
  inscription_id: string;
  inscription_number: number;
};

const RafflePage = () => {
  const walletDetails = useWalletAddress();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<InscriptionData | null>(
    null
  );
  const [endDate, setEndDate] = useState("");
  const [totalTickets, setTotalTickets] = useState("");
  const [pricePerTicket, setPricePerTicket] = useState("");
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [runes, setRunes] = useState<any[]>([]);
  const [selectedRune, setSelectedRune] = useState<any | null>(null); // New state for selected rune
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [raffle, setRaffle] = useState<RaffleItem>();

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleSelectData = useCallback(
    (data: InscriptionData) => {
      setSelectedData(data);
      handleClose();
    },
    [handleClose]
  );

  const fetchInscriptionsData = useCallback(async () => {
    if (walletDetails && walletDetails.ordinal_address) {
      setLoading(true);
      try {
        const response = await fetchInscriptions(walletDetails.ordinal_address);
        setInscriptions(response?.data.inscriptions);
      } catch (error) {
        setError("Failed to fetch inscriptions");
      } finally {
        setLoading(false);
      }
    }
  }, [walletDetails]);

  useEffect(() => {
    fetchInscriptionsData();
  }, [walletDetails, fetchInscriptionsData]);

   const fetchingRaffle = async () => {

    try {
      const ordinal_address = walletDetails?.ordinal_address;
      console.log(ordinal_address)
     if(ordinal_address){
       const response = await getRaffle("ordinal_address");
      console.log(response?.data, "RAFFLE DATA")
       if (response?.data.success === true) {
        setRaffle(response.data.result);
      };
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
  }, [walletDetails]);

  console.log(raffle,"--raffle create")

  const fetchRunes = async () => {
    try {
      if (walletDetails && walletDetails.ordinal_address) {
        const response = await getVaultBalance(walletDetails.ordinal_address);
        // console.log(response, "runes i get from getVaultBalance");
        setRunes(response?.data.rune);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRunes();
  }, [walletDetails]);

  const handleCreateRaffle = async () => {
    setLoading(true);
    try {
      const raffleDetails = {
        inscription_id: selectedData?.inscription_id,
        inscription_number: selectedData?.inscription_number,
        rune_id: selectedRune.rune_id,
        rune_name: selectedRune.rune_name,
        total_balance: selectedRune.total_balance,
        rune_divisibility: selectedRune.divisibility,
        address: selectedData?.address,
        endDate,
        totalTickets,
        pricePerTicket,
      };

      const response = await createRaffle(raffleDetails);
      if (response?.data.success) {
        dispatch(
          addNotification({
            id: Date.now(),
            message: "Raffle created successfully!",
            open: true,
            severity: "success",
          })
        );
        setSelectedData(null);
        setTotalTickets("");
        setPricePerTicket("");
      } else {
        throw new Error("Raffle creation failed");
      }
    } catch (error) {
      setError("Failed to create raffle");
      dispatch(
        addNotification({
          id: Date.now(),
          message: "Raffle not created",
          open: true,
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  console.log(selectedRune, "selected rune");

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-5 p-4 h-full">
        <div className="w-full lg:w-4/12 flex">
          <div className="w-full">
            <InscriptionSelector
              selectedData={selectedData}
              onOpenModal={handleOpen}
            />
          </div>
        </div>
        <div className="w-full lg:w-7/12 bg-customPurple_950 py-2 px-6 rounded-lg">
          <AuctionDetailsForm
            endDate={endDate}
            totalTickets={totalTickets}
            pricePerTicket={pricePerTicket}
            runes={runes} // Pass the array of runes
            setEndDate={setEndDate}
            setTotalTickets={setTotalTickets}
            setPricePerTicket={setPricePerTicket}
            setRunes={setRunes} // Function to update the array of runes
            selectedRune={selectedRune} // New prop for selected rune
            setSelectedRune={setSelectedRune} // New prop for setting selected rune
            onClick={handleCreateRaffle}
            loading={loading}
          />
        </div>
      </div>

      <InscriptionModal
        open={open}
        onClose={handleClose}
        onSelect={handleSelectData}
        inscriptions={inscriptions}
      />

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default RafflePage;
