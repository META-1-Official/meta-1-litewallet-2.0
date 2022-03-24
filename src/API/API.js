import axios from "axios";
import env from "react-dotenv";

export async function getCryptosChange() {
  const { data } = await axios.get(
    `https://${env.BACK_URL_DEV}/getExchangeRate`
  );

  return data;
}

export async function getUserData(login) {
  const { data } = await axios.post(`https://${env.BACK_URL_DEV}/getUserData`, {
    login: login,
  });
  return data;
}

export async function saveUserCurrency(login, currency) {
  const { data } = await axios.post(
    `https://${env.BACK_URL_DEV}/saveUserCurrency`,
    {
      login: login,
      currency: currency,
    }
  );
  return data;
}

export async function deleteAvatar(login) {
  const { data } = await axios.post(
    `https://${env.BACK_URL_DEV}/deleteAvatar`,
    {
      login: login,
    }
  );
  return data;
}
