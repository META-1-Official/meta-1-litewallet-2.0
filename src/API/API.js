import axios from "axios";
import env from "react-dotenv";

export async function getCryptosChange() {
  const { data } = await axios.get(`https://${env.BACK_URL}/getExchangeRate`);

  return data;
}

export async function getAvatar(login) {
  const { data } = await axios.post(`https://${env.BACK_URL}/getAvatar`, {
    login: login,
  });
  return data;
}
