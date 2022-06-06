import get from 'lodash/get';
export const meta1Selector = (state) => get(state, ['meta1']);
export const cryptoDataSelector = (state) => get(state, ['meta1', 'cryptoData']);