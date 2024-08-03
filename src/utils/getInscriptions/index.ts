// import axios from "axios";
// import { AddressTxsUtxo } from "bitcoin-wallet-adapter/dist/types/types";
// import * as bitcoin from "bitcoinjs-lib";
// import secp256k1 from "@bitcoinerlab/secp256k1";
// // import { UTXO } from "@/types/psbt/index";
// const DUMMY_UTXO_VALUE = 1000;


// export async function generateUnsignedPsbtForInscription(
//   payment_address: string,
//   publickey: string | undefined,
//   fee_rate: number,
//   wallet: string,
//   submittedData:any[],
//   network:string
// ) {
  
//   let payerUtxos: AddressTxsUtxo[];
//   let paymentUtxos: AddressTxsUtxo[] | undefined;
//   try {

//     payerUtxos = await getUtxosByAddress(payment_address);
//     // get users "all" utxo
//   } catch (e) {
//     console.error(e);
//     return Promise.reject("Mempool error");
//   }
//   const totalAmount = sumAmounts(submittedData);
//   try {
//     paymentUtxos = await selectPaymentUTXOs(
//       payerUtxos, // all utxos
//       totalAmount,
//       Math.floor(Math.random() * 3) + 3, // number between 3-5 vins length
//       submittedData.length + 1, //voutlength
//       fee_rate,
//       payment_address.startsWith("bc1p")
//     );
// // 
//     if (!paymentUtxos) throw Error("Balance not enough");
//     let psbt = null;
//     let inputs = null; // Assuming inputs is not declared elsewhere
//     psbt = await generateUnsignedPsbtForInscriptionPSBTBase64(
//       payment_address,
//       publickey,
//       paymentUtxos,
//       fee_rate,
//       wallet,
//       submittedData,
//       totalAmount
//     );
//     console.log({ psbt });
//     return { psbt }; // return { psbt, inputs };
//   } catch (err: any) {
//     throw Error(err);
//   }
// }

// function sumAmounts(submittedData: any[]) {
//   return submittedData.reduce((total, item) => total + (item.amount || 0), 0);
// }

// async function getUtxosByAddress(address: string) {
//   console.log("--------------inside getUtxosByAddress",address)
//   const url =
//     process.env.NEXT_PUBLIC_NETWORK === "testnet"
//       ? `https://mempool.space/testnet/api/address/${address}/utxo`
//       : `https://mempool-api.ordinalnovus.com/address/${address}/utxo`;
//       console.log("---------------getUtxosByAddress:",url)
//   const { data } = await axios.get(url);
//   console.log("---------------getUtxosByAddress:",data)
//   return data;
// } //done

// export async function selectPaymentUTXOs(
//   utxos: AddressTxsUtxo[],
//   amount: number, // amount is expected total output (except tx fee)
//   vinsLength: number,
//   voutsLength: number,
//   fee_rate: number,
//   taprootAddress?: boolean
// ) {
//   const selectedUtxos: any = [];
//   let selectedAmount = 0;
//   // Sort descending by value, and filter out dummy utxos
//   utxos = utxos
//     .filter((x) => x.value > DUMMY_UTXO_VALUE) // filter the utxos greater than DUMMY_UTXO_VALUE
//     .sort((a, b) => b.value - a.value);  // shore the utxos in descending order
//   for (const utxo of utxos) {  // loop over the every utxo
//     // Never spend a utxo that contains an inscription for cardinal purposes
//     if (await doesUtxoContainInscription(utxo)) {
//       continue;
//     }
//     if (await doesUtxoContainRunes(utxo)) {
//       continue;
//     }
//     selectedUtxos.push(utxo);  // push the utxos in selectedUtxos array
//     selectedAmount += utxo.value;
//     if (  //checking if the selected utxos is greater than the amount and the other conditions
//       selectedAmount >=
//       amount +
//         calculateTxFee(
//           vinsLength + selectedUtxos.length,
//           voutsLength,
//           fee_rate,
//           taprootAddress ? "taproot" : "pwpkh", // Adjust based on actual use
//           taprootAddress ? "taproot" : "pwpkh",
//           1, // Include change output
//           taprootAddress ? "taproot" : "pwpkh" // Change output type
//         )
//     ) {
//       break;
//     }
//   }
//   // here checking the selected amount is lessthan the amount so throuw an error or show some message
//   if (selectedAmount < amount) {
//     throw `Your wallet needs ${Number(
//       await satsToDollars(amount - selectedAmount)
//     ).toFixed(2)} USD more`;
//   }

//   return selectedUtxos;
// } //done


// async function generateUnsignedPsbtForInscriptionPSBTBase64(
//   payment_address: string,
//   publickey: string | undefined,
//   unqualifiedUtxos: AddressTxsUtxo[],
//   fee_rate: number,
//   wallet: string,
//   submittedData: any[],
//   totalAmount: number
// ): Promise<string> {
//   wallet = wallet?.toLowerCase();
//   bitcoin.initEccLib(secp256k1);
//   // generating empty psbt
//   // pushing set amount of function
//   let psbt = new bitcoin.Psbt({
//     network:
//       process.env.NEXT_PUBLIC_NETWORK === "testnet"
//         ? bitcoin.networks.testnet
//         : undefined,
//   });
//   const [mappedUnqualifiedUtxos, recommendedFee] = await Promise.all([
//     mapUtxos(unqualifiedUtxos),
//     fee_rate,
//   ]);
//   // Loop the unqualified utxos until we have enough to create a dummy utxo
//   let totalValue = 0;
//   let paymentUtxoCount = 0;
//   const taprootAddress =
//     payment_address.startsWith("bc1p") || payment_address.startsWith("tb1p");
//   const segwitAddress =
//     payment_address.startsWith("bc1q") || payment_address.startsWith("tb1q");
//   for (const utxo of mappedUnqualifiedUtxos) {
//     if (await doesUtxoContainInscription(utxo)) {
//       continue;
//     }
//     if (await doesUtxoContainRunes(utxo)) {
//       continue;
//     }
    
//     const input: any = {
//       hash: utxo.txid,
//       index: utxo.vout,
//       ...(taprootAddress && {
//         nonWitnessUtxo: utxo.tx.toBuffer(),
//       }),
//     };
//     if (!taprootAddress) {
//       // p2wpkh ----> segwit, p2tr ---> taproot, p2sh ----> nested segwit
//       const redeemScript = bitcoin.payments.p2wpkh({
//         pubkey: Buffer.from(publickey!, "hex"),
//       }).output;
//       const p2sh = bitcoin.payments.p2sh({
//         redeem: { output: redeemScript },
//       });
//       if (wallet !== "unisat") {
//         // i.e., xverse, leather, magiceden, fantom, etc.
//         input.witnessUtxo = utxo.tx.outs[utxo.vout];
//         if (!segwitAddress && (wallet === "xverse" || wallet === "magiceden"))
//           input.redeemScript = p2sh.redeem?.output;
//       } else {
//         // unisat wallet should not have redeemscript for buy tx (for native segwit)
//         input.witnessUtxo = utxo.tx.outs[utxo.vout];
//         // if (!payment_address.startsWith("bc1q")) {
//         //   input.redeemScript = p2sh.redeem?.output;
//         // }
//       }
//     } else {
//       // unisat
//       input.witnessUtxo = utxo.tx.outs[utxo.vout];
//       input.tapInternalKey = toXOnly(
//         utxo.tx.toBuffer().constructor(publickey, "hex")
//       );
//     }
//     psbt.addInput(input);
//     totalValue += utxo.value;
//     paymentUtxoCount += 1;
//     const fees = calculateTxFee(
//       paymentUtxoCount,
//       submittedData.length + 1, // payment + service fee output
//       fee_rate,
//       taprootAddress ? "taproot" : "pwpkh", // Adjust based on actual use
//       taprootAddress ? "taproot" : "pwpkh",
//       1, // Include change output
//       taprootAddress ? "taproot" : "pwpkh" // Change output type
//     );
   
//     if (totalValue >= submittedData.reduce((sum, payment) => sum + Number(payment.satsAmount), 0) + fees) {
//       break;
//     }
//   }
//   const finalFees = calculateTxFee(
//     paymentUtxoCount,
//     submittedData.length + 1, // payment + service fee output
//     fee_rate,
//     taprootAddress ? "taproot" : "pwpkh", // Adjust based on actual use
//     taprootAddress ? "taproot" : "pwpkh",
//     1, // Include change output
//     taprootAddress ? "taproot" : "pwpkh" // Change output type
//   );
//   console.log({ totalValue, finalFees });
//   // changeValue = totalvalue - inscription_fee + final_fees
//   const changeValue =
//     totalValue -
//    totalAmount-
//     Math.floor(fee_rate < 150 ? finalFees / 1.5 : finalFees / 1.3);
//   console.log({ changeValue });

 
//   // We must have enough value to create a dummy utxo and pay for tx fees
//   if (changeValue < 0) {
//     throw new Error(
//       `You might have pending transactions or not enough fund to complete tx at the provided FeeRate`
//     );
//   }
//   submittedData.map((i: any) => {
//     psbt.addOutput({
//       address: i.address,
//       value: i.amount,
//     });
//   });
//   // psbt.addOutput({
//   //   address: "bc1qqv48lhfhqjz8au3grvnc6nxjcmhzsuucj80frr",
//   //   value: order.service_fee,
//   // });
//   // to avoid dust
//   if (changeValue > DUMMY_UTXO_VALUE) {
//     psbt.addOutput({
//       address: payment_address,
//       value: changeValue,
//     });
//   }
//   console.log("psbt made");
//   return psbt.toBase64();
// }

// async function doesUtxoContainInscription(
//   utxo: AddressTxsUtxo
// ): Promise<boolean> {
//   const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
//     ? "http://64.20.33.102:56018"
//     : "https://ord.ordinalnovus.com/api";
//   // console.log({ apiUrl }, "ins");
//   if (!apiUrl) {
//     // If the API URL is not set, return true as per your requirement
//     console.warn("API provider URL is not defined in environment variables");
//     return true;
//   }
//   try {
//     const url = `${apiUrl}/output/${utxo.txid}:${utxo.vout}`;
//     const response = await axios.get(url, {
//       headers: {
//         Accept: "application/json",
//       },
//     });
//     // console.log({ url, data: response.data });
//     if (response.data && Array.isArray(response.data.inscriptions)) {
//       return response.data.inscriptions.length > 0;
//     } else if (response.data.length === 0) {
//       // If the data is empty array, return false
//       console.warn("Empty Array is returned");
//       return false;
//     } else {
//       return true;
//     }
//   } catch (error) {
//     // In case of any API error, return true
//     console.error("Error in doesUtxoContainInscription:", error);
//     return true;
//   }
// }
// export async function doesUtxoContainRunes(
//   utxo: AddressTxsUtxo
// ): Promise<boolean> {
//   const cacheKey = `rune_utxo:${utxo.txid}:${utxo.vout}`;
//   try {
//     // First, try to retrieve data from cache
//     // const cachedRunes = await getCache(cacheKey);
//     // if (cachedRunes !== null) {
//     //   console.log(
//     //     "Returning runes data from cache...",
//     //     // cachedRunes,
//     //     typeof cachedRunes
//     //   );
//     //   return cachedRunes; // Ensure the string from the cache is converted back to boolean
//     // }
//     const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
//       ? "http://64.20.33.102:56018/"
//       : `${process.env.NEXT_PUBLIC_PROVIDER}/`;
//     if (!apiUrl) {
//       console.warn("API provider URL is not defined in environment variables");
//       return true; // Defaulting to true if the API URL isn't set
//     }
//     const response = await axios.get(
//       `${apiUrl}output/${utxo.txid}:${utxo.vout}`,
//       {
//         headers: {
//           Accept: "application/json",
//         },
//       }
//     );
//     // Store result in cache if no runes are found
//     if (response.data.runes?.length) {
//       // await setCache(cacheKey, response.data.runes, 172800);
//       return response.data.runes;
//     } else {
//       // await setCache(cacheKey, false, 172800); // Store the information for 2 days (172800 seconds)
//       return false;
//     }
//   } catch (error) {
//     console.error("Error in doesUtxoContainRunes:", error);
//     return true; // Defaulting to true in case of an error
//   }
// }

// function calculateTxFee(
//   vinsLength: number,
//   voutsLength: number,
//   feeRate: number,
//   inputAddressType: "pwpkh" | "taproot" | "p2sh_p2wpkh",
//   outputAddressType: "pwpkh" | "taproot" | "p2sh_p2wpkh",
//   includeChangeOutput: 0 | 1 = 1,
//   changeAddressType: "pwpkh" | "taproot" | "p2sh_p2wpkh" = "pwpkh"
// ): number {
//   const inputSizes = {
//     pwpkh: { base: 31, witness: 107 },
//     taproot: { base: 43, witness: 65 },
//     p2sh_p2wpkh: { base: 58, witness: 107 },
//   };
//   const outputSizes = {
//     pwpkh: 31,
//     taproot: 43,
//     p2sh_p2wpkh: 32,
//   };
//   // Calculate transaction overhead, considering whether any input uses SegWit
//   function getTxOverhead(
//     vins: number,
//     vouts: number,
//     isSegWit: boolean
//   ): number {
//     return (
//       10 + // Basic non-witness transaction overhead (version, locktime)
//       getSizeOfVarInt(vins) + // Input count
//       getSizeOfVarInt(vouts) + // Output count
//       (isSegWit ? 2 : 0)
//     ); // SegWit marker and flag only if SegWit inputs are present
//   }
//   let totalBaseSize = getTxOverhead(
//     vinsLength,
//     voutsLength,
//     inputAddressType.startsWith("p2")
//   );
//   let totalWitnessSize = 0;
//   // Calculate total base size and witness size for inputs
//   for (let i = 0; i < vinsLength; i++) {
//     totalBaseSize += inputSizes[inputAddressType].base;
//     totalWitnessSize += inputSizes[inputAddressType].witness;
//   }
//   // Calculate total base size for outputs
//   totalBaseSize += voutsLength * outputSizes[outputAddressType];
//   // Include change output if specified
//   if (includeChangeOutput) {
//     totalBaseSize += outputSizes[changeAddressType];
//   }
//   // Calculate total vbytes considering witness discount for SegWit inputs
//   const totalVBytes = totalBaseSize + Math.ceil(totalWitnessSize / 4);
//   const fee = totalVBytes * feeRate;
//   console.log(
//     `Final Transaction Size: ${totalVBytes} vbytes, Fee Rate: ${feeRate}, Calculated Fee: ${fee}`,
//     { totalVBytes, feeRate, fee }
//   );
//   return fee;
// }
// export const satsToDollars = async (sats: number) => {
//   // Fetch the current bitcoin price from session storage
//   const bitcoin_price = await getBitcoinPriceFromCoinbase();
//   // Convert satoshis to bitcoin, then to USD
//   const value_in_dollars = (sats / 100_000_000) * bitcoin_price;
//   return value_in_dollars;
// };
// export const getBitcoinPriceFromCoinbase = async () => {
//   var { data } = await axios.get(
//     "https://api.coinbase.com/v2/prices/BTC-USD/spot"
//   );
//   var price = data.data.amount;
//   return price;
// };




// async function mapUtxos(utxosFromMempool: AddressTxsUtxo[]): Promise<any[]> {
//   const ret: any[] = [];
//   for (const utxoFromMempool of utxosFromMempool) {
//     const txHex = await getTxHexById(utxoFromMempool.txid);
//     ret.push({
//       txid: utxoFromMempool.txid,
//       vout: utxoFromMempool.vout,
//       value: utxoFromMempool.value,
//       status: utxoFromMempool.status,
//       tx: bitcoin.Transaction.fromHex(txHex),
//     });
//   }
//   return ret;
// }

// async function getTxHexById(txId: string): Promise<string> {
//   // if (!txHexByIdCache[txId]) {
//   const url =
//     process.env.NEXT_PUBLIC_NETWORK === "testnet"
//       ? `https://mempool.space/testnet/api/tx/${txId}/hex`
//       : `https://mempool-api.ordinalnovus.com/tx/${txId}/hex`;
//   return await fetch(url).then((response) => response.text());
//   // }
// }
// function calculateTxBytesFeeWithRate(
//   vinsLength: number,
//   voutsLength: number,
//   feeRate: number,
//   includeChangeOutput: 0 | 1 = 1
// ): number {
//   const baseTxSize = 10;
//   const inSize = 180;
//   const outSize = 34;
//   const txSize =
//     baseTxSize +
//     vinsLength * inSize +
//     voutsLength * outSize +
//     includeChangeOutput * outSize;
//   const fee = txSize * feeRate;
//   console.log(
//     `Transaction Size: ${txSize}, Fee Rate: ${feeRate}, Calculated Fee: ${fee}`
//   );
//   return fee;
// }
// const toXOnly = (pubKey: string | any[]) =>
//   pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
// function getSizeOfVarInt(length: number): number {
//   if (length < 253) {
//     return 1;
//   } else if (length < 65536) {
//     return 3;
//   } else if (length < 4294967296) {
//     return 5;
//   } else {
//     return 9; // Handling very large counts
//   }
// }



// const mempoolNetwork = () =>
//   process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? "" : "testnet/";

// export const getMaxFeeRate = async () => {
//   try {
//     const { data } = await axios.get(
//       `https://mempool.space/${mempoolNetwork()}api/v1/fees/recommended`
//     );
//     if ("fastestFee" in data) {
//       return data.fastestFee;
//     }
//     throw new Error("fastestFee not found in response data");
//   } catch (error) {
//     console.error(error);
//     return "error -- site down or data format changed";
//   }
// };