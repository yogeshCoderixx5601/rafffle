// bitcoin

// import { IListingStateUTXO } from "@/types";
import axios from "axios";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";

type TxId = string | number;
const txHexByIdCache: Record<TxId, string> = {};

// getting hex by id
export async function getTxHexById(txId: TxId): Promise<string> {
  if (!txHexByIdCache[txId]) {
    const url =
      process.env.NEXT_PUBLIC_NETWORK === "testnet"
        ? `https://mempool.space/testnet/api/tx/${txId}/hex`
        : `https://mempool-api.ordinalnovus.com/tx/${txId}/hex`;
    txHexByIdCache[txId] = await fetch(url).then((response) => response.text());
  }
  // console.log(txHexByIdCache[txId], "----------txHexByIdCache[txId]");
  return txHexByIdCache[txId];
}

export const toXOnly = (pubKey: string | any[]) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

export function getSellerOrdOutputValue(
  price: number,
  makerFeeBp: number | undefined,
  prevUtxoValue: number
): number {
  if (makerFeeBp === undefined || makerFeeBp === null) {
    // console.log(
    //   "makerFeeBp was undefined or null, setting to default 100 basis points"
    // );
    makerFeeBp = 100; // if makerFeeBp is undefined or null, set it to 100 basis points (1%)
  }
  // console.log("makerFeeBp: ", makerFeeBp);

  const makerFeePercent = makerFeeBp / 10000; // converting basis points to percentage
  // console.log("makerFeePercent: ", makerFeePercent);

  const makerFee = Math.floor(price * makerFeePercent);
  // console.log("Maker's fee: ", makerFee);

  const outputValue = price - makerFee + prevUtxoValue;
  // console.log("Output Value: ", outputValue);

  return Math.floor(outputValue);
}

export function validatePsbt(signedPsbt: string) {
  console.log("*********inside validatePsbt api**********");
  try {
    // Initialize the bitcoinjs-lib library with secp256k1
    bitcoin.initEccLib(ecc);
    let currentPsbt: any;

    if (/^[0-9a-fA-F]+$/.test(signedPsbt)) {
      // If the input is in hex format, create Psbt from hex
      currentPsbt = bitcoin.Psbt.fromHex(signedPsbt);
    } else {
      // If the input is in base64 format, create Psbt from base64
      currentPsbt = bitcoin.Psbt.fromBase64(signedPsbt);
    }

    // console.log(currentPsbt, "CPSBT");
    console.log(
      currentPsbt.validateSignaturesOfInput(0, schnorrValidator),
      "CURRENTPSBT"
    );

    const validator = currentPsbt.data.inputs[0].tapInternalKey
      ? schnorrValidator
      : ecdsaValidator;
    const isValid = currentPsbt.validateSignaturesOfInput(0, validator);
    console.log(isValid, "-----------isValid");
    return isValid;
  } catch (error) {
    // Handle the error here
    console.error("Error while validating PSBT:", error);
    // You can return false, throw a custom error, or handle the error in any way you prefer.
    return false;
  }
}

function schnorrValidator(
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer
): boolean {
  return ecc.verifySchnorr(msghash, pubkey, signature);
}

function ecdsaValidator(
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer
): boolean {
  return ecc.verify(msghash, signature, pubkey);
}

export async function mapUtxos(
  utxosFromMempool: any[]
): Promise<any[]> {
  const ret: any[] = [];
  for (const utxoFromMempool of utxosFromMempool) {
    const txHex = await getTxHexById(utxoFromMempool.txid);
    ret.push({
      txid: utxoFromMempool.txid,
      vout: utxoFromMempool.vout,
      value: utxoFromMempool.value,
      status: utxoFromMempool.status,
      tx: bitcoin.Transaction.fromHex(txHex),
    });
  }
  return ret;
}

export async function fetchLatestUtxoData(utxo_id: string): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_PROVIDER}/output/${utxo_id}`;
  // console.log("**************url:", url);
  try {
    // console.log("------------before response");
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });
    // console.log(response, "------------response");
    const data = response.data;
    return data;
  } catch (error:any) {
    throw new Error(`Failed to fetch data: ${error.response.data}`);
  }
}

export const fromXOnly = (buffer: Buffer): string => {
  // Check if buffer has a length of 32, which means it was not sliced
  if (buffer.length === 32) {
    return buffer.toString("hex");
  } else {
    throw Error("Wrong pubkey");
  }
};






export async function getVaultBalance(address: string) {
  console.log("********GETTING VAULT BALANCE UTILS***********");
  try {
    const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
      ? "http://192.168.1.17:8003/"
      : `${process.env.NEXT_PUBLIC_PROVIDER}/`;
      console.log(apiUrl, "api url")

    if (!apiUrl) {
      console.warn("API provider URL is not defined in environment variables");
      return undefined;
    }

    const url = `${apiUrl}v1/runes/get_current_balance_of_wallet?address=${address}`;
    console.log({ url });
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });
    console.log(response.data, "api getVaultBalance utils");

    return response.data;
  } catch (error) {}
}
// http://192.168.1.17:8003/v1/runes/get_current_balance_of_wallet?address=tb1pf54fmtpk00d8afkh5f74pne73ppq64fhqdn5vflgzt75pn3gmnlsm6fcfy

export async function doesUtxoContainInscription(utxo: any): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
    ? process.env.NEXT_PUBLIC_PROVIDER_TESTNET
    : "https://ord.ordinalnovus.com/api";

  if (!apiUrl) {
    // If the API URL is not set, return true as per your requirement
    console.warn("API provider URL is not defined in environment variables");
    return true;
  }

  try {
    const url = `${apiUrl}/output/${utxo.txid}:${utxo.vout}`;
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });

    // console.log(
    //   Array.isArray(response.data.inscriptions),
    //   "CHECK",
    //   response.data.inscriptions
    // );
    if (
      response.data &&
      Array.isArray(response.data.inscriptions) &&
      response.data.inscriptions.length > 0
    ) {
      return response.data.inscriptions[0];
    } else if (response.data.inscriptions.length === 0) {
      // If the data is empty array, return false
      // console.warn('Empty Array is returned');
      return false;
    } else {
      return true;
    }
  } catch (error) {
    // In case of any API error, return true
    console.error("Error in doesUtxoContainInscription:", error);
    return true;
  }
}

