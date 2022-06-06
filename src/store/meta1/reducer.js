import * as types from './types';
const initialState = {
    cryptoData: null,
    error: false,
    loading: false,
    msg: null,
    portfolioReceiver: null,
    trader: null,
    checkPasswordObj: null,
    fetchDepositFn: null,
    senderApi: null
};

const meta1Reducer = (state = initialState, action) => {
    switch (action.type) {
        case types.GET_CRYPTOS_CHANGE_REQUEST:
            return {...state, loading:true, msg: null };
        case types.GET_CRYPTOS_CHANGE_SUCCESS:
            return {...state, loading: false, cryptoData:action.payload.cryptoData, error: false };
        case types.GET_CRYPTOS_CHANGE_ERROR:
            return {...state, loading: false, error: true, msg: 'something went wrong' };
        case types.META1_CONNECT_SUCCESS:
            const {portfolio, tradeWithPassword, checkPassword, sendWithPassword} = action.payload;
            console.log(portfolio, tradeWithPassword, checkPassword, sendWithPassword);
            return {...state  };
        default:
            return state;
    }
}
export default meta1Reducer;
