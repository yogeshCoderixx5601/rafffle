import React from "react";
import {
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface RuneDetails {
  pkscript: string;
  wallet_addr: string;
  rune_id: string;
  rune_name: string;
  divisibility: number;
  total_balance: string;
}

type AuctionDetailsFormProps = {
  endDate: string;
  totalTickets: string;
  pricePerTicket: string;
  setEndDate: (value: string) => void;
  setTotalTickets: (value: string) => void;
  setPricePerTicket: (value: string) => void;
  onClick: () => void;
  loading: boolean;
  runes: RuneDetails[];
  setRunes: (value: RuneDetails[]) => void;
  selectedRune: RuneDetails | null;
  setSelectedRune: (value: RuneDetails | null) => void;
};

const AuctionDetailsForm = ({
  loading,
  endDate,
  totalTickets,
  pricePerTicket,
  runes,
  selectedRune,
  setEndDate,
  setTotalTickets,
  setPricePerTicket,
  setRunes,
  setSelectedRune,
  onClick,
}: AuctionDetailsFormProps) => {
  const handleTotalTicketsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value, 10));
    setTotalTickets(value.toString());
  };

  const handlePricePerTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value, 10));
    setPricePerTicket(value.toString());
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the local date-time from the input field
    const localDateTime = e.target.value;
    
    // Convert to UTC date-time
    const localDate = new Date(localDateTime);
    const utcDateTime = localDate.toISOString(); // Format as ISO 8601 string (UTC)
    console.log(utcDateTime,"utc date and time")
    // Update the endDate state with the UTC date-time
    setEndDate(utcDateTime);
  };

  return (
    <div className="rounded-lg w-full max-w-2xl">
      <div className="mt-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <TextField
            type="datetime-local"
            label="Auction End Date"
            value={endDate ? new Date(endDate).toISOString().slice(0, 16) : ""} // Format value to match input
            onChange={handleEndDateChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <TextField
            type="number"
            label="Total Tickets"
            value={totalTickets}
            onChange={handleTotalTicketsChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            type="number"
            label="Price Per Ticket"
            value={pricePerTicket}
            onChange={handlePricePerTicketChange}
            fullWidth
            variant="outlined"
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="select-rune">Select Rune</InputLabel>
            <Select
              labelId="select-rune"
              value={selectedRune?.rune_name || ""}
              onChange={(e) => {
                const selected = runes.find((rune) => rune.rune_name === e.target.value);
                setSelectedRune(selected || null);
              }}
              label="Rune"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {runes?.map((rune, index) => (
                <MenuItem key={index} value={rune.rune_name}>
                  {rune.rune_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      <div className="w-full flex">
        <div
          className="px-3 py-1 rounded custom-gradient cursor-pointer flex items-center justify-center"
          onClick={onClick}
        >
          {loading ? <CircularProgress size={24} /> : "Create Raffle"}
        </div>
      </div>
    </div>
  );
};


export default AuctionDetailsForm;
