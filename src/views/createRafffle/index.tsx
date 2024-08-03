"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useSignTx, useWalletAddress } from "bitcoin-wallet-adapter";
import { fetchInscriptions } from "@/apiHelper/fetchInscriptionsParams";
import InscriptionSelector from "@/components/Elements/InscriptionSelector";
import AuctionDetailsForm from "@/components/Elements/AuctionsDetailsForm";
import InscriptionModal from "@/components/Elements/InscriptionModal";
import { createRaffle } from "@/apiHelper/createRaffle";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "@/stores/reducers/notificationReducer";
import { getVaultBalance } from "@/apiHelper/getVaultBalance";
import { RootState } from "@/stores";
import { updateOrder } from "@/apiHelper/brodcast";
import axios from "axios";
import { setNewActivity } from "@/stores/reducers/generalReducer";
import { listItems } from "@/apiHelper/listItem";

type InscriptionData = {
  address: number;
  inscription_id: string;
  inscription_number: number;
};

const CreateRafflePage = () => {
  const walletDetails = useWalletAddress();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [endDate, setEndDate] = useState("");
  const [totalTickets, setTotalTickets] = useState("");
  const [pricePerTicket, setPricePerTicket] = useState("");
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [runes, setRunes] = useState<any[]>([]);
  const [selectedRune, setSelectedRune] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error2, setError] = useState<string | null>(null);
  const { loading: signLoading, result, error, signTx: sign } = useSignTx();
  const [unsignedPsbtBase64, setUnsignedPsbtBase64] = useState<string>("");
  const [action, setAction] = useState<string>("dummy");
  const [txLink, setTxLink] = useState("");
  const [inputLength, setInputLength] = useState(0);
   const [tapInternalKey, setInternalKey] = useState('');
  const [signPsbt, setSignPsbt] = useState("");
  const [utxoId, setUtxoId] = useState()
  const [listItem, setlistitems] = useState<any | null>(null);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const userVaultDetails = useSelector(
    (state: RootState) => state.general.userAccount
  );
  console.log(userVaultDetails, "valut");

  const handleSelectData = useCallback(
    (data: InscriptionData) => {
      setSelectedData(data);
      handleClose();
    },
    [handleClose]
  );

  const fetchInscriptionsData = useCallback(async () => {
    if (walletDetails?.ordinal_address) {
      setLoading(true);
      try {
        const response = await fetchInscriptions(walletDetails.ordinal_address);
        setInscriptions(response?.data.inscriptions || []);
      } catch {
        setError("Failed to fetch inscriptions");
      } finally {
        setLoading(false);
      }
    }
  }, [walletDetails]);

  const fetchRunes = useCallback(async () => {
    if (walletDetails?.ordinal_address) {
      try {
        const response = await getVaultBalance(walletDetails.ordinal_address);
        setRunes(response?.data.rune || []);
      } catch (error) {
        console.error("Failed to fetch runes:", error);
      }
    }
  }, [walletDetails]);

  useEffect(() => {
    fetchInscriptionsData();
    fetchRunes();
  }, [fetchInscriptionsData, fetchRunes]);

  const handleCreateRaffle = async () => {
    console.log("Create Raffle Button Clicked");
    setLoading(true);
    try {
      console.log("Inside Try Block");

      if (!selectedData) {
        console.error("Missing required data for creating raffle");
        setLoading(false);
        return;
      }

      const raffleDetails = {
        inscription_id: selectedData.inscription_id,
        inscription_number: selectedData.inscription_number,
        txid: selectedData.txid,
        vout: selectedData.vout,
        value: selectedData.value,
        ordinal_address: walletDetails?.ordinal_address,
        ordinal_pubkey: walletDetails?.ordinal_pubkey,
        cardinal_address: walletDetails?.cardinal_address,
        cardinal_pubkey: walletDetails?.cardinal_pubkey,
        wallet: walletDetails?.wallet,
        vault: "tb1pal6unxavle2s6v8d990yrthgvl3wcja6f2ph8asdtu202mf8fs7q7lee9a",
        endDate,
        totalTickets,
        pricePerTicket,
      };

      console.log("Raffle Details:", raffleDetails);

      const response = await createRaffle(raffleDetails);
      console.log("Create Raffle Response:", response);

      if (response?.data.success) {
        console.log(response.data);
        setUnsignedPsbtBase64(response.data.unsignedPsbtBase64);
        setlistitems(response?.data);
        setInputLength(response?.data?.totalInput);
        setInternalKey(response.data.tap_internal_key)
        setUtxoId(response.data.utxo_id)
        dispatch(
          addNotification({
            id: Date.now(),
            message: "Raffle created successfully!",
            open: true,
            severity: "success",
          })
        );
        // Reset form states
        // setSelectedData(null);
        setTotalTickets("");
        setPricePerTicket("");
        setEndDate("");
      } else {
        dispatch(
          addNotification({
            id: Date.now(),
            message: "Raffle not created",
            open: true,
            severity: "error",
          })
        );
      }
    } catch (error) {
      console.error("Error Creating Raffle:", error);
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

  const signTx = useCallback(async () => {
    if (!walletDetails) {
      alert("Connect wallet to proceed");
      return;
    }
    let inputs: any[] = [];
    console.log(inputLength, "-input length");
    new Array(inputLength).fill(1).map((item: number, idx: number) => {
      if (idx === 0)
        inputs.push({
          address: walletDetails.ordinal_address,
          publickey: walletDetails.ordinal_pubkey,
          index: [idx],
        });

      if (idx > 0)
        inputs.push({
          address: walletDetails.cardinal_address,
          publickey: walletDetails.cardinal_pubkey,
          index: [idx],
        });
    });
    const options: any = {
      psbt: unsignedPsbtBase64,
      network: process.env.NEXT_PUBLIC_NETWORK || "Mainnet",
      action: "dummy",
      inputs,
    };
    console.log(options, "OPTIONS");
    console.log(inputLength, "INPUT LENGTH");

    await sign(options);
  }, [unsignedPsbtBase64, walletDetails]);

  useEffect(() => {
    if (unsignedPsbtBase64) {
      signTx();
    }
  }, [unsignedPsbtBase64]);

  useEffect(() => {
    if (result) {
      setSignPsbt(result);
    }

    if (error) {
      console.error("Sign Error:", error);
      alert("Wallet error occurred");
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: "Wallet error occurred.",
          open: true,
          severity: "error",
        })
      );
      setLoading(false);
    }

    setLoading(false);
  }, [result, error]);


   const sendSignedPsbtAndListItems = async (signedPsbt: string, listItem:any) => {
    if (!signedPsbt ) return;
    const listData = {
      wallet:walletDetails?.wallet,
      receive_address:walletDetails?.ordinal_address,
      receive_ubkey:walletDetails?.ordinal_pubkey,
      unsigned_listing_psbt_base64: unsignedPsbtBase64,
      tap_internal_key: tapInternalKey,
      signed_listing_psbt_base64: signedPsbt,
      utxo_id: utxoId,
      value: listItem.value,
    };

    try {
      const response = await listItems(listData);
      console.log("Response from list item:", response);
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: "Items listed successfully.",
          open: true,
          severity: "success",
        })
      );
    } catch (error) {
      console.error("Error listing item:", error);
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: "Error listing item.",
          open: true,
          severity: "error",
        })
      );
    }
  };

  useEffect(() => {
    sendSignedPsbtAndListItems(signPsbt, listItem);
  }, [signPsbt]);


  const broadcast = async (signedPsbt: string) => {
    console.log(signedPsbt, "-----------------signedPsbt");
    try {
      const { data } = await axios.post("/api/orders/broadcast", {
        signed_psbt: signedPsbt,
        activity_tag: action === "dummy" ? "prepare" : "buy",
        user_address: walletDetails?.cardinal_address,
      });
      setLoading(false);

      dispatch(setNewActivity(true));
      window.open(
        `https://mempool.space/${
          process.env.NEXT_PUBLIC_NETWORK === "testnet" ? "testnet/" : ""
        }tx/${data.data.txid}`,
        "_blank"
      );
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: `Broadcasted ${action} Tx Successfully`,
          open: true,
          severity: "success",
        })
      );
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: `Txid: ${data.data.txid}`,
          open: true,
          severity: "success",
        })
      );
    } catch (err:any) {
      setLoading(false);
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: err.response.data.message || "Error broadcasting tx",
          open: true,
          severity: "error",
        })
      );
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-5 p-4 h-full">
        <div className="w-full lg:w-4/12 flex">
          <InscriptionSelector
            selectedData={selectedData}
            onOpenModal={handleOpen}
          />
        </div>
        <div className="w-full lg:w-7/12 bg-customPurple_950 py-2 px-6 rounded-lg">
          <AuctionDetailsForm
            loading={loading}
            endDate={endDate}
            totalTickets={totalTickets}
            pricePerTicket={pricePerTicket}
            runes={runes}
            selectedRune={selectedRune}
            setEndDate={setEndDate}
            setTotalTickets={setTotalTickets}
            setPricePerTicket={setPricePerTicket}
            setRunes={setRunes}
            setSelectedRune={setSelectedRune}
            onClick={handleCreateRaffle}
          />
        </div>
      </div>

      <InscriptionModal
        open={open}
        onClose={handleClose}
        onSelect={handleSelectData}
        inscriptions={inscriptions}
      />
    </div>
  );
};

export default CreateRafflePage;
