import axios from "axios";
import { buildSignature } from "../utils/signature";
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
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed", error:true };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message, error:true };
  }
}

export async function uploadAvatar(formData) {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken(),
      "Content-Type": "multipart/form-data",
    }
  }
  try {
    const { data } = await axios.post(`https://${process.env.REACT_APP_BACK_URL}/saveAvatar`,
      formData,
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

export async function saveBalance(login) {
  const config = {}
  try {
    const { data } = await axios.post(`https://${process.env.REACT_APP_BACK_URL}/saveBalance`, {
      accountName: login,
    }, config);
    return data;
  } catch (err) {}
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
    const payload = buildSignature(accountName, password);
    const { data } = await axios.post(
      `https://${process.env.REACT_APP_BACK_URL}/login`,
      payload
    );
    return { ...data, error: false };
  } catch (e) {
    return { message: "Wallet name or passkey is wrong", error: true };
  }
}

export async function getHistoryData(accountName,from, size, searchFilterValues = '') {
  let url = `${process.env.REACT_APP_EXPLORER_META1_URL}/api/v1/es/account_history?account_id=${accountName}&from=${from}&size=${size}&type=data&sort_by=-account_history.sequence`;
  if (searchFilterValues) {
    url+=`&object_ids=${searchFilterValues}`;
  } else if (searchFilterValues === 0) {
    url+=`&object_ids=${searchFilterValues}`;
  }
  try {
    const { data } = await axios.get(url);
    return { ...data, error: false };
  } catch (e) {
    return { message: "something went wrong", error: true };
  }
}

export async function checkOldUser(accountName) {
  try {
    const { data } = await axios.get(
      `https://${process.env.REACT_APP_BACK_URL}/checkTransferable?accountName=${accountName}`
    );
    return { ...data, error: false };
  } catch (e) {
    return { message: "Wallet name or passkey is wrong", error: true };
  }
}

export async function validateSignature(accountName, password) {
    try {
        const payload = buildSignature(accountName, password);
        const { data } = await axios.post(
            `https://${process.env.REACT_APP_BACK_URL}/validateSignature`,
            payload
        );
        if (!data.isValid) {
            return { message: "Invalid Signature", error: true };
        }
        return { ...data, error: false };
    } catch (e) {
        return { message: "Invalid Signature", error: true };
    }
}
