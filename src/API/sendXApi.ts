import axios, { AxiosInstance } from 'axios';

const SENDX_BASE_URL = process.env.REACT_APP_SENDX_API_URL;
const SENDX_API_KEY = process.env.REACT_APP_SENDX_API_KEY;
const listId = process.env.REACT_APP_SENDX_LIST_ID;

interface SubscribeParams {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  tags?: Array<string>;
}

class SendXApi {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: SENDX_BASE_URL,
      headers: {
        authorization: SENDX_API_KEY,
      },
    });
  }

  subscribe = async (payload: SubscribeParams) => {
    const { data } = await this.api.post(`/lists/${listId}/subscribers`, payload);
    return data;
  };
}

export default new SendXApi();
