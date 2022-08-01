import Cache from './Cache';
import axios from 'axios';

const UseAccount = async (accountId) => {
  const URL = `${process.env.REACT_APP_EXPLORER_META1_URL}/api/v1/explorer/account_name?account_id=${accountId}`;

  const name = Cache.get('accounts', accountId);
  if (!name) {
    const response = await axios.get(URL);
    Cache.put('accounts', accountId, response.data);
    return Promise.resolve(response.data);
  } else {
    return Promise.resolve(name);
  }
};

export default UseAccount;
