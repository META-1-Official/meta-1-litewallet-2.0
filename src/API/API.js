import axios from "axios";
import { getAccessToken, tokenFail } from "../utils/localstorage";

export async function getCryptosChange() {
  const { data } = await axios.get(`https://${process.env.REACT_APP_BACK_URL}/getExchangeRate`);

  return data;
}

export async function getUserData(login) {
  if (login === null || login === 'null' || login === undefined || login === 'undefined') return null;
  const config = {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken()
    }
  }
  try {
    const { data } = await axios.post(`https://${process.env.REACT_APP_BACK_URL}/getUserData`, {
      login: login,
    }, config);
    return data;
  } catch (err) {
    if (err?.response?.data?.error?.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed" };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message };
  }
}

export async function saveUserCurrency(login, currency) {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken()
    }
  }
  try {
    const { data } = await axios.post(
      `https://${process.env.REACT_APP_BACK_URL}/saveUserCurrency`,
      {
        login: login,
        currency: currency,
      },
      config
    );
    return data;
  } catch (err) {
    if (err.response.data.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed" };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message };
  }
}

export async function deleteAvatar(login) {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken()
    }
  }
  try {
    const { data } = await axios.post(`https://${process.env.REACT_APP_BACK_URL}/deleteAvatar`, {
      login: login,
    }, config);
    return data;
  } catch (err) {
    if (err.response.data.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed" };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message };
  }
}

export async function changeLastLocation(login, location) {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken()
    }
  }
  try {
    const { data } = await axios.post(`https://${process.env.REACT_APP_BACK_URL}/saveLocation`, {
      login: login,
      location: location,
    }, config);
    return data;
  } catch (err) {
    if (err.response.data.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed" };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message };
  }
}

export async function getLastLocation(login) {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken()
    }
  }
  try {
    const { data } = await axios.post(
      `https://${process.env.REACT_APP_BACK_URL}/getLastLocation`,
      {
        login: login,
      },
      config
    );
    return data;
  } catch (err) {
    if (err.response.data.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed" };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message };
  }
}

export async function sendEmail(emailType, emailData) {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken()
    }
  }
  try {
    const { data } = await axios.post(
      `https://${process.env.REACT_APP_BACK_URL}/sendEmail`,
      { emailType, emailData },
      config
    );
    return data;
  } catch (err) {
    if (err.response.data.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed" };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message };
  }
}

export async function loginRequest(accountName, password) {
  try {
    const { data } = await axios.post(
      `https://${process.env.REACT_APP_BACK_URL}/login`,
      { accountName, password }
    );
    return { ...data, error: false };
  } catch (e) {
    return { message: "Wallet name or password is wrong", error: true };
  }
}