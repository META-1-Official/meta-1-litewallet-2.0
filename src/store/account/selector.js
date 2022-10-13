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
export const oldUserSelector = (state) => get(state, ['accounts', 'oldUser']);
export const checkTransferableModelSelector = (state) => get(state, ['accounts', 'checkTransferableModel']);
export const signatureErrorSelector = (state) => get(state, ['accounts', 'signatureError']);
export const isSignatureValidSelector = (state) => get(state, ['accounts', 'isSignatureValid']);
export const isValidPasswordKeySelector = (state) => get(state, ['accounts', 'isValidPasswordKey']);
export const passwordKeyErrorSelector = (state) => get(state, ['accounts', 'passwordKeyError']);
export const loginErrorMsgSelector = (state) => get(state, ['accounts', 'loginErrorMsg']);
export const openOrderCustomColumnsSelector = (state) => get(state, ['accounts', 'openOrderCustomColumns']);
export const passwordRequestFlagSelector = (state) => get(state, ['accounts', 'passwordRequestFlag']);

export const demoSelector = (state) => get(state, ['accounts']);
