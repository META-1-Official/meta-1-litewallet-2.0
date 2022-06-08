import * as types from './types';
const initialState = {
    cryptoData: null,
    error: false,
    loading: false,
    msg: null,
    portfolioReceiver: null,
    trader: null,
    checkPasswordObj: null,
    senderApi: null,
    userCurrency: '$ USD 1',
    changeCurrency: false
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
            const {portfolioReceiver, trader, checkPasswordObj, senderApi} = action.payload;
            console.log(portfolioReceiver, trader, checkPasswordObj, senderApi);
            return {...state, portfolioReceiver, trader, checkPasswordObj, senderApi };
        case types.SET_USER_CURRENCY:
            return {...state, userCurrency: action.payload };
        case types.SAVE_USER_CURRENCY_REQUEST:
            return {...state, loading: true, error: false };
        case types.SAVE_USER_CURRENCY_SUCCESS:
            return {...state, loading: false, userCurrency: action.payload, changeCurrency: true };
        case types.SAVE_USER_CURRENCY_ERROR:
            return {...state, loading: false, error: true, msg:action.payload };
        case types.SAVE_USER_CURRENCY_RESET:
            return {...state, changeCurrency:false };
        default:
            return state;
    }
}
export default meta1Reducer;
