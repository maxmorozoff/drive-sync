import google from "@googleapis/drive";
import { getGoogleServiceKey } from "../utils.mjs";

// const re = /https?:\/\/drive\.google\.com\/file\/d\/([-\w]+)\//;
const GOOGLE_SERVICE_CREDENTIALS = getGoogleServiceKey();
export const auth = await google.auth.getClient({
  credentials: GOOGLE_SERVICE_CREDENTIALS,

  scopes: [
    //
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.readonly",
  ],
});
