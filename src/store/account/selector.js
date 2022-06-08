import get from 'lodash/get';

export const accountsSelector = (state) => get(state, ['accounts', 'account']);
export const tokenSelector = (state) => get(state, ['accounts', 'token']);
export const loaderSelector = (state) => get(state, ['accounts', 'loading']);
export const isLoginSelector = (state) => get(state, ['accounts', 'isLogin']);
export const loginErrorSelector = (state) => get(state, ['accounts', 'loginError']);
export const isTokenValidSelector = (state) => get(state, ['accounts', 'isTokenValid']);
export const userDataSelector = (state) => get(state, ['accounts', 'user']);
export const errorMsgSelector = (state) => get(state, ['accounts', 'msg']);
export const profileImageSelector = (state) => get(state, ['accounts', 'profileImage']);
export const navbarProfileImageSelector = (state) => get(state, ['accounts', 'navbarProfileImage']);
export const sendEmailSelector = (state) => get(state, ['accounts', 'sentMailSuccess']);


export const demoSelector = (state) => get(state, ['accounts']);
