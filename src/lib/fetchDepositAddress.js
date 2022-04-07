import env from "react-dotenv";

export default async function fetchDepositAddress(params) {
  const { accountName, asset } = params;
  return await fetch(`${env.GATEWAY}${asset}`, {
    credentials: "omit",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: `{"metaId":"${accountName}"}`,
    method: "POST",
    mode: "cors",
  });
}
