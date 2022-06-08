import get from 'lodash/get';
export const meta1Selector = (state) => get(state, ['meta1']);
export const cryptoDataSelector = (state) => get(state, ['meta1', 'cryptoData']);
export const portfolioReceiverSelector = (state) => get(state, ['meta1', 'portfolioReceiver']);
export const traderSelector = (state) => get(state, ['meta1', 'trader']);
export const checkPasswordObjSelector = (state) => get(state, ['meta1', 'checkPasswordObj']);
export const senderApiSelector = (state) => get(state, ['meta1', 'senderApi']);
export const userCurrencySelector = (state) => get(state, ['meta1', 'userCurrency']);
export const changeCurrencySelector = (state) => get(state, ['meta1', 'changeCurrency']);