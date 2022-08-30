import { removeAccessToken, removeLoginDetail } from '../../utils/localstorage';
import * as types from './types';

export const loginRequestService = (payload) => {
    return {
        type: types.LOGIN_REQUEST,
        payload
    }
}

export const loginSuccess = (payload) => {
    return {
        type: types.LOGIN_SUCCESS,
        payload
    }
}

export const loginError = (payload) => {
    return {
        type: types.LOGIN_ERROR,
        payload
    }
}

export const logoutRequest = () => {
    removeLoginDetail();
    removeAccessToken();
    return {
        type: types.LOGOUT_REQUEST
    }
}

export const getUserRequest = (payload) => {
    return {
        type: types.GET_USER_REQUEST,
        payload
    }
}

export const getUserSuccess = (payload) => {
    return {
        type: types.GET_USER_SUCCESS,
        payload
    }
}

export const getUserError = (payload) => {
    return {
        type: types.GET_USER_ERROR,
        payload
    }
}

export const uploadAvatarRequest = (payload) => {
    return {
        type: types.UPLOAD_AVATAR_REQUEST,
        payload
    }
}

export const uploadAvatarSuccess = (payload) => {
    return {
        type: types.UPLOAD_AVATAR_SUCCESS,
        payload
    }
}

export const deleteAvatarRequest = (payload) => {
    return {
        type: types.DELETE_AVATAR_REQUEST,
        payload
    }
}

export const deleteAvatarSuccess = (payload) => {
    return {
        type: types.DELETE_AVATAR_SUCCESS,
    }
}

export const sendMailRequest = (payload) => {
    return {
        type: types.SEND_MAIL_REQUEST,
        payload
    }
}

export const sendMailSuccess = () => {
    return {
        type: types.SEND_MAIL_SUCCESS
    }
}

export const sendMailError = () => {
    return {
        type: types.SEND_MAIL_ERROR
    }
}

export const sendMailReset = () => {
    return {
        type: types.SEND_MAIL_RESET
    }
}
export const checkTransferableModelAction = (payload) => {
    return {
        type: types.CHECK_TRANSFERABLE_WALLET_MODAL,
        payload
    }
}
export const checkTransferableRequest = (payload) => {
    return {
        type: types.CHECK_TRANSFERABLE_REQUEST,
        payload
    }
}

export const checkTransferableSuccess = (payload) => {
    return {
        type: types.CHECK_TRANSFERABLE_SUCCESS,
        payload
    }
}
export const checkTransferableError = () => {
    return {
        type: types.CHECK_TRANSFERABLE_ERROR,
    }
}

export const checkTokenRequest = (payload) => {
    return {
        type: types.CHECK_TOKEN_REQUEST,
        payload
    }
}

export const passKeyRequestService = (payload) => {
    return {
        type: types.PASS_KEY_REQUEST,
        payload
    }
}

export const passKeySuccessService = (payload) => {
    return {
        type: types.PASS_KEY_SUCCESS,
        payload
    }
}

export const passKeyErrorService = (payload) => {
    return {
        type: types.PASS_KEY_ERROR,
        payload
    }
}

export const passKeyResetService = () => {
    return {
        type: types.PASS_KEY_RESET,
    }
}
