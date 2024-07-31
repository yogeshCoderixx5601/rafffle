import axios from "axios";
import moment from "moment";

export function shortenString(str: string, length?: number): string {
  if (str.length <= (length || 5)) {
    return str;
  }
  const start = str.slice(0, 5);
  const end = str.slice(-8);
  return `${start}...${end}`;
}

export async function getBTCPriceInDollars() {
  try {
    const response = await fetch(
      "https://api.coinbase.com/v2/prices/BTC-USD/spot"
    );
    const data = await response.json();
    const priceInDollars = Number(data["data"]["amount"]);
    return priceInDollars;
  } catch (error) {
    console.error("Error fetching BTC price:", error);
    return null;
  }
}

export function convertBTCPriceInDollars(
  marketplaceFeeBTC: number,
  btcPrice: number
) {
  const priceInUSD = marketplaceFeeBTC * btcPrice;
  return priceInUSD;
}

export function convertSatoshiToBTC(satoshi: number) {
  const SATOSHI_IN_ONE_BTC = 100000000;
  return satoshi / SATOSHI_IN_ONE_BTC;
}

export function convertSatoshiToUSD(satoshi: number, btcPrice: number) {
  const SATOSHI_IN_ONE_BTC = 100000000;
  return (satoshi / SATOSHI_IN_ONE_BTC) * btcPrice;
}

export const satsToDollars = async (sats: number) => {
  // Fetch the current bitcoin price from session storage
  const bitcoin_price = await getBitcoinPriceFromCoinbase();
  // Convert satoshis to bitcoin, then to USD
  const value_in_dollars = (sats / 100_000_000) * bitcoin_price;
  return value_in_dollars;
};

export const getBitcoinPriceFromCoinbase = async () => {
  var { data } = await axios.get(
    "https://api.coinbase.com/v2/prices/BTC-USD/spot"
  );
  var price = data.data.amount;
  return price;
};

export function formatNumber(num: number) {
  if (num >= 1e9) {
    // Billions
    return (num / 1e9).toFixed(1) + "B";
  } else if (num >= 1e6) {
    // Millions
    return (num / 1e6).toFixed(1) + "M";
  } else if (num >= 1e3) {
    // Thousands
    return (num / 1e3).toFixed(1) + "K";
  } else {
    // Less than thousands
    return num.toFixed(5);
  }
}

export const convertUtcToLocalZone = (utcDateString: string): string => {
  // Parse the UTC date string
  const date = moment.utc(utcDateString);

  // Convert to local time
  const localDate = date.local();

  // Format the local date
  const formattedLocalDate = localDate.format("YYYY-MM-DD HH:mm:ss");

  return formattedLocalDate;
};

export function end_in_time(end_in: string): { isExpired: boolean, displayTime: string } {
  const now: Date = new Date();
  const endDate: Date = new Date(end_in);
  const diff: number = now.getTime() - endDate.getTime(); // Difference in milliseconds

  if (diff > 0) {
    return { isExpired: true, displayTime: endDate.toLocaleString() };
  } else {
    const absDiff: number = Math.abs(diff); // Absolute difference in milliseconds
    const seconds: number = Math.floor(absDiff / 1000) % 60;
    const minutes: number = Math.floor(absDiff / (1000 * 60)) % 60;
    const hours: number = Math.floor(absDiff / (1000 * 60 * 60)) % 24;

    return { isExpired: false, displayTime: `${hours} hrs ${minutes} mins ${seconds} s` };
  }
}



export function formattedTime(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" });
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${hours}:${minutes}`;
}

// Import moment.js if you are using it in a Node.js environment
// const moment = require('moment');

function checkEndDate(endDateStr: string) {
  // Parse the end_date string to a moment object
  const endDate = moment(endDateStr);

  // Get the current date and time
  const currentDate = moment();

  // Check if the end_date is less than the current date and time
  if (endDate.isBefore(currentDate)) {
    return false;
  }
  return true;
}
