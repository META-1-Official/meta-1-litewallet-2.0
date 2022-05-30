import get from 'lodash/get';

export const accountsSelector = (state) => get(state, ['accounts', 'account']);
export const tokenSelector = (state) => get(state, ['accounts', 'token']);
export const loaderSelector = (state) => get(state, ['accounts', 'loading']);
export const isLoginSelector = (state) => get(state, ['accounts', 'isLogin']);
export const loginErrorSelector = (state) => get(state, ['accounts', 'loginError']);
export const demoSelector = (state) => get(state, ['accounts']);