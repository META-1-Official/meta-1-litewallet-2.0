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

export async function changeLastLocation(login, location) {
  const { data } = await axios.post(
    `https://${env.BACK_URL_DEV}/saveLocation`,
    {
      login: login,
      location: location,
    }
  );
  return data;
}

export async function getLastLocation(login) {
  try {
    const { data } = await axios.post(
      `https://${env.BACK_URL_DEV}/getLastLocation`,
      {
        login: login,
      }
    );
    return data;
  } catch (e) {
    return { message: null };
  }
}

export async function sendEmail(type, data) {
  try {
    const { data } = await axios.post(
      `https://${env.BACK_URL_DEV}/sendEmail`,
      {type, data}
    );
    return data;
  } catch (e) {
    return { message: null };
  }
}
