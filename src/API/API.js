import axios from "axios";
import { buildSignature } from "../utils/signature";
import { getAccessToken, tokenFail } from "../utils/localstorage";

export async function getCryptosChange() {
  const { data } = await axios.get(`${process.env.REACT_APP_BACK_URL}/getExchangeRate`);

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
    const { data } = await axios.post(`${process.env.REACT_APP_BACK_URL}/getUserData`, {
      login: login,
    }, config);
    return data;
  } catch (err) {
    if (err?.response?.data?.error?.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed" };
    }
    return { message: null, tokenExpired: false, responseMsg: err?.response?.data?.message ? err?.response?.data?.message : 'error' };
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
      `${process.env.REACT_APP_BACK_URL}/saveUserCurrency`,
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
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed", error: true };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message, error: true };
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
    const { data } = await axios.post(`${process.env.REACT_APP_BACK_URL}/saveAvatar`,
      formData,
      config
    );
    return {...data, error: false};
  } catch (err) {
    if (err?.response?.data?.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed", error: true };
    }
    return { message: null, tokenExpired: false, responseMsg: 'error', error: true };
  }
}

export async function deleteAvatar(login) {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken()
    }
  }
  try {
    const { data } = await axios.post(`${process.env.REACT_APP_BACK_URL}/deleteAvatar`, {
      login: login,
    }, config);
    return {...data, error: false};
  } catch (err) {
    if (err.response?.data?.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed", error: true };
    }
    return { message: null, tokenExpired: false, responseMsg: 'error', error: true };
  }
}

export async function changeLastLocation(login, location) {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + getAccessToken()
    }
  }
  try {
    const { data } = await axios.post(`${process.env.REACT_APP_BACK_URL}/saveLocation`, {
      login: login,
      location: location,
    }, config);
    return data;
  } catch (err) {
    if (err?.response?.data?.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed" };
    }
    return { message: null, tokenExpired: false, responseMsg: 'error' };
  }
}

export async function saveBalance(login) {
  const config = {}
  try {
    const { data } = await axios.post(`${process.env.REACT_APP_BACK_URL}/saveBalance`, {
      accountName: login,
    }, config);
    return data;
  } catch (err) {
    return { message: 'fail' };
  }
}

export async function signUp(acc) {
  try {
    const { data } = await axios.post(`${process.env.REACT_APP_BACK_URL}/signUp`, {
      accountName: acc,
    });
    return data;
  } catch (err) {
    return { message: 'sign up failed' };
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
      `${process.env.REACT_APP_BACK_URL}/getLastLocation`,
      {
        login: login,
      },
      config
    );
    return { ...data, error: false };
  } catch (err) {
    if (err?.response?.data?.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed", error: true };
    }
    return { message: null, tokenExpired: false, responseMsg: 'error', error: true };
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
      `${process.env.REACT_APP_BACK_URL}/sendEmail`,
      { emailType, emailData },
      config
    );
    return { ...data, error: false };
  } catch (err) {
    if (err?.response?.data?.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed", error: true };
    }
    return { message: null, tokenExpired: false, responseMsg: err?.response?.data?.message ? err?.response?.data?.message : 'error', error: true };
  }
}

export async function loginRequest(accountName, email, web3Token, web3PubKey) {
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/login`,
      { accountName, email, idToken: web3Token, appPubKey: web3PubKey }
    );
    return { ...data, error: false };
  } catch (e) {
    return { message: "Wallet name or email is wrong", error: true };
  }
}

export async function checkToken(token) {
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/check_token`,
      { token }
    );
    return { ...data, error: false };
  } catch (e) {
    return { message: "invalid token", error: true };
  }
}

export async function getHistoryData(accountName, from, size, searchFilterValues = '') {
  let url = `${process.env.REACT_APP_EXPLORER_META1_URL}/api/v1/es/account_history?account_id=${accountName}&from=${from}&size=${size}&type=data&sort_by=-account_history.sequence`;
  if (searchFilterValues) {
    url += `&object_ids=${searchFilterValues}`;
  } else if (searchFilterValues === 0) {
    url += `&object_ids=${searchFilterValues}`;
  }
  try {
    const { data } = await axios.get(url);
    return { ...data, error: false };
  } catch (e) {
    return { message: "something went wrong", error: true };
  }
}

// ESIGNATURE
export async function getUserKycProfile(email) {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_ESIGNATURE_URL}/apiewallet/users?email=${email}`
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

export async function getUserKycProfileByAccount(acc) {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_ESIGNATURE_URL}/apiewallet/users/acc?acc=${acc}`
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

export async function updateUserKycProfile(email, payload, token) {
  try {
    const { data } = await axios.patch(
      `${process.env.REACT_APP_ESIGNATURE_URL}/apiewallet/users/update?email=${email}`,
      payload,
      {
        headers: {
          authorization: token,
        }
      }
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

export async function postUserKycProfile(email, facekiID) {
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_ESIGNATURE_URL}/apiewallet/users`,
      {
        email,
        facekiID,
      }
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
};

export async function getESigToken(email) {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_ESIGNATURE_URL}/apiewallet/sign/token?email=${email}`
    );

    if (response.headers.authorization) {
      return response.headers.authorization;
    } else return undefined;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
};

// FACEKI
export async function livenessCheck(image) {
  try {
    let form_data = new FormData();
    form_data.append('image', image);

    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/face/attribute`,
      form_data,
      { headers: { 'content-type': 'multipart/form-data' } },
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
};

// export async function enroll(image, name) {
//   try {
//     let form_data = new FormData();
//     form_data.append('image', image);
//     form_data.append('name', name);

//     const { data } = await axios.post(
//       `${process.env.REACT_APP_BACK_URL}/enroll_user`,
//       form_data,
//       { headers: { 'content-type': 'multipart/form-data' } },
//     );
//     return data;
//   } catch (e) {
//     return { message: "Something is wrong", error: true };
//   }
// };

export async function enroll(image, email, privKey) {
  try {
    let form_data = new FormData();
    form_data.append('image', image);
    form_data.append('email', email);
    form_data.append('privKey', privKey);

    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/face_enroll`,
      form_data,
      { headers: { 'content-type': 'multipart/form-data' } },
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
};

export async function verify(image) {
  try {
    let form_data = new FormData();
    form_data.append('image', image);

    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/verify_user`,
      form_data,
      { headers: { 'content-type': 'multipart/form-data' } },
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
};

// export async function remove(name) {
//   try {
//     const { data } = await axios.post(
//       `${process.env.REACT_APP_BACK_URL}/remove_user`,
//       { name }
//     );
//     return data;
//   } catch (e) {
//     return { message: "Something is wrong", error: true };
//   }
// };

// MIGRATION
export async function checkOldUser(accountName) {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_BACK_URL}/checkTransferable?accountName=${accountName}`
    );
    return { ...data, error: false };
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

export async function validateSignature(accountName, password) {
  try {
    const payload = await buildSignature(accountName, password, true);
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/validateSignature`,
      payload
    );
    return data;
  } catch (e) {
    return { message: "Invalid Signature", error: true };
  }
}

export async function checkMigrationable(accountName) {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_BACK_URL}/migration-status?identifier=${accountName}`
    );
    return { ...data, error: false };
  } catch (e) {
    return { message: "Not able to migrate", error: true };
  }
}

export async function migrate(accountName, password) {
  try {
    const payload = await buildSignature(accountName, password, true);
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/migrate`,
      payload
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

export async function createQRPoll(qr_hash) {
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/createPoll`,
      {qr_hash}
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

export async function findQRPoll(qr_hash) {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_BACK_URL}/findPoll?qr_hash=${qr_hash}`
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

export async function setQRPollVerified(qr_hash, bio_blob) {
  let form_data = new FormData();
  form_data.append('image', bio_blob);

  try {
    const { data } = await axios.patch(
      `${process.env.REACT_APP_BACK_URL}/updatePoll?qr_hash=${qr_hash}`,
      form_data,
      { headers: { 'content-type': 'multipart/form-data' } },
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

export async function removeQRPoll(qr_hash) {
  try {
    const { data } = await axios.delete(
      `${process.env.REACT_APP_BACK_URL}/removePoll?qr_hash=${qr_hash}`
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

// ANNOUNCEMENT & EVENTS CALENDAR
export async function addEvent(title, description, location, location_bg_url, start, end, plus_title, plus_description) {
  const config = {
    headers: {
      authorization: getAccessToken()
    }
  }

  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/add_event`,
      {
        title,
        description,
        location,
        location_bg_url,
        start,
        end,
        plus_title,
        plus_description
      },
      config
    );
    return data;
  } catch (err) {
    if (err.response.data.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed", error: true };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message, error: true };
  }
}

export async function getEvent(id) {
  const { data } = await axios.get(`${process.env.REACT_APP_BACK_URL}/get_event?id=${id}`);
  return data;
}

export async function updateEvent(id, title, description, location, location_bg_url, start, end, plus_title, plus_description) {
  try {
    const { data } = await axios.patch(
      `${process.env.REACT_APP_BACK_URL}/update_event?id=${id}`,
      {title, description, location, location_bg_url, start, end, plus_title, plus_description},
      {
        headers: {
          authorization: getAccessToken()
        }
      }
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

export async function getEventsInMonth(month) {
  const { data } = await axios.get(`${process.env.REACT_APP_BACK_URL}/get_all_events_in_month?month=${month}`);
  return data;
}

export async function addAnnouncement(type, title, description, announced_time) {
  const config = {
    headers: {
      authorization: getAccessToken()
    }
  }

  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACK_URL}/add_announcement`,
      {
        type,
        title,
        description,
        announced_time
      },
      config
    );
    return data;
  } catch (err) {
    if (err.response.data.error.toLowerCase() === 'unauthorized') {
      tokenFail();
      return { message: null, tokenExpired: true, responseMsg: "Authentication failed", error: true };
    }
    return { message: null, tokenExpired: false, responseMsg: err.response.data.message, error: true };
  }
}

export async function getAnnouncement(id) {
  const { data } = await axios.get(`${process.env.REACT_APP_BACK_URL}/get_announcement?id=${id}`);
  return data;
}

export async function getAllAnnouncements() {
  const { data } = await axios.get(`${process.env.REACT_APP_BACK_URL}/get_all_announcements`);
  return data;
}

export async function updateAnnouncement(id, type, title, description, announced_time) {
  try {
    const { data } = await axios.patch(
      `${process.env.REACT_APP_BACK_URL}/update_announcement?id=${id}`,
      {type, title, description, announced_time},
      {
        headers: {
          authorization: getAccessToken()
        }
      }
    );
    return data;
  } catch (e) {
    return { message: "Something is wrong", error: true };
  }
}

