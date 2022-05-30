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
