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

