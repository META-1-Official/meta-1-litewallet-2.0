import axios from 'axios';

const SENDX_BASE_URL = process.env.REACT_APP_SENDX_API_URL;
const SENDX_API_KEY = process.env.REACT_APP_SENDX_API_KEY;
const SENDX_TEAM_ID = process.env.REACT_APP_SENDX_TEAM_ID;

// interface SubscribeParams {
//   email: string;
//   tags: Array<string>;
//   firstName?: string;
//   lastName?: string;
//   newEmail?: string;
//   company?: string;
//   birthday?: string;
//   customFields?: any;
// }

class SendXApi {
  // private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: SENDX_BASE_URL,
      headers: {
        api_key: SENDX_API_KEY,
      },
    });
  }

  // subscribe = async (payload: SubscribeParams) => {
  subscribe = async (payload) => {
    const { data } = await this.api.post(
      `/contact/identify?team_id=${SENDX_TEAM_ID}`,
      payload,
    );
    return data;
  };
}

export default new SendXApi();
