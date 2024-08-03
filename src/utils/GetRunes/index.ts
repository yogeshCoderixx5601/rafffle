// import { any, IRune, Rune } from "@/types";
import axios from "axios";

export async function getInscription(payment_address: string) {
  let allUtxos: any[];
  let runesUtxos: any[] | undefined;
  
  try {
    allUtxos = await getUtxosByAddress(payment_address);
  } catch (e) {
    console.error(e);
    throw new Error("Mempool error");
  }
  console.log({allUtxos})

  try {
    runesUtxos = await selectRunesUTXOs(allUtxos,payment_address);
    return runesUtxos
  } catch (err: any) {
    throw new Error(err);
  }
}


export async function getUtxosByAddress(address: string): Promise<any[]> {
  const url =
    process.env.NEXT_PUBLIC_NETWORK === "testnet"
      ? `https://mempool.space/testnet/api/address/${address}/utxo`
      : `https://mempool-api.ordinalnovus.com/address/${address}/utxo`;
  
  const { data } = await axios.get(url);
  return data;
}

export async function selectRunesUTXOs(utxos: any[],payment_address: string): Promise<any[]> {
  const selectedUtxos: any = [];
  // Sort descending by value, and filter out dummy UTXOs
  utxos = utxos.sort((a, b) => b.value - a.value);
  
  for (const utxo of utxos) {
    const rune = await doesUtxoContainRunes(utxo);
    if (rune) {
      utxo.rune = rune
      utxo.utxo_id = `${utxo.txid}:${utxo.vout}`;
      utxo.address = `${payment_address}`
      selectedUtxos.push(utxo);
    }
  }
  return selectedUtxos;
}

export async function doesUtxoContainRunes(utxo: any): Promise<any> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
      ? "http://192.168.1.17:8080/"
      : `${process.env.NEXT_PUBLIC_PROVIDER}/`;
    
    if (!apiUrl) {
      console.warn("API provider URL is not defined in environment variables");
      return undefined;
    }

    const url = `${apiUrl}output/${utxo.txid}:${utxo.vout}`;
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });
    
    console.log( response.data.runes, "RUNES RESPONSE FROM ORD SERVER")
    const runeEntries = Object.entries(response.data.runes)
    if ( runeEntries.length > 0) {
      console.log("Runes data found:", response.data.runes);
      return response.data.runes;
    } else {
      console.log("No runes data found or it is empty.");
      return false;
    }
  } catch (error) {
    console.error("Error in doesUtxoContainRunes:", error);
    return true;
  }
}

// export const extractDetails = (rune: any | null | undefined): any[] => {
//   if (!rune) {
//     return []; // Return an empty array if rune is null or undefined
//   }

//   const entries = Object.entries(rune);
//   const result = entries.map(([rune_name, details]) => ({
//     rune_name,
//     rune_amount: details.amount,
//     rune_divisibility: details.divisibility,
//     rune_symbol: details.symbol,
//   }));

//   return result;
// };


// export const aggregateRuneAmounts = (runesUtxos: any[]) => {
//   const runeMap = new Map<string, { rune_amount: number, rune_divisibility: number, rune_symbol: string }>();

//   for (const runesUtxo of runesUtxos) {
//     const rune = runesUtxo.rune; // Assuming runesUtxo is an any object

//     const runeDetails = extractDetails(rune);

//     for (const { rune_name, rune_amount, rune_divisibility, rune_symbol } of runeDetails) {
//       if (runeMap.has(rune_name)) {
//         runeMap.set(rune_name, {
//           rune_amount: runeMap.get(rune_name)!.rune_amount + rune_amount,
//           rune_divisibility,
//           rune_symbol,
//         });
//       } else {
//         runeMap.set(rune_name, {
//           rune_amount,
//           rune_divisibility,
//           rune_symbol,
//         });
//       }
//     }
//   }

//   // Convert the Map to an array of objects
//   const result = Array.from(runeMap, ([rune_name, { rune_amount, rune_divisibility, rune_symbol }]) => ({ rune_name, rune_amount, rune_divisibility, rune_symbol }));

//   return result;
// };


