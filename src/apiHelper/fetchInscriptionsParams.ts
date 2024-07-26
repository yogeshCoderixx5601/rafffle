'use server';
import { getInscriptionFromMempoolAPI } from '@/utils/getInscriptionsFromMempoolAPI';
import axios from 'axios';



export async function fetchInscriptions(
  ordinal_address: string
): Promise<{ data: any; error: string | null } | undefined> {
  try {
    if (process.env.NEXT_PUBLIC_NETWORK !== 'testnet') {
     
    }

    else {
    //   if (!wallet) return undefined;
      const inscriptions = await getInscriptionFromMempoolAPI(ordinal_address);

      if (inscriptions.length > 0) {
        const result = {
          data:
            {
              inscriptions,
              pagination: {
                page: 1,
                limit: inscriptions.length,
                total: inscriptions.length,
              },
            } || [],
          error: null,
        };

        //@ts-ignore
        return result;
      } else {
        return undefined;
      }
    }
  } catch (error) {
    return undefined;
  }
}