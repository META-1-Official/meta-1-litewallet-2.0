import { takeEvery, call, put } from 'redux-saga/effects';
import { deleteAvatar, getUserData, loginRequest, uploadAvatar } from '../../API/API';
import { setAccessToken, setLoginDetail } from '../../utils/localstorage';
import { deleteAvatarSuccess, getUserError, getUserSuccess, loginError, loginSuccess, uploadAvatarSuccess } from './actions';
import * as types from './types';
function* loginHandler(data) {
    try {
        const response = yield call(loginRequest,data.payload.login,data.payload.password)
        if(!response.error){
            setAccessToken(response.token);
            setLoginDetail(response.accountName)
            yield put(loginSuccess({accountName: response.accountName, token: response.token}));
        } else {
            yield put(loginError({accountName: null, token: ''}));
        }
    } catch(e){
        data.payload.setLoginDataError(true);
        yield put(loginError({accountName: null, token: ''}));
    }
}
function* getUserHandler(data) {
    const response = yield call(getUserData,data.payload);
    console.log("response",response);
    if (response['tokenExpired']) {
        yield put(getUserError({msg: response.responseMsg}));
    } else {
        if (response?.message.userAvatar != null) {
            let avatarImage = `https://${process.env.REACT_APP_BACK_URL}/public/${response.message.userAvatar}`;
            yield put(getUserSuccess({user: response,avatarImage }));
        } else {
            yield put(getUserSuccess({user: response,avatarImage: null }));
        }
    }
}
function* uploadAvatarHandler(data) {
    const response = yield call(uploadAvatar, data.payload);
    console.log("response",response);
    if (response['tokenExpired']) {
        yield put(getUserError({msg: response.responseMsg}));
    } else {
        let avatarImage = `https://${process.env.REACT_APP_BACK_URL}/public/${response.message}`;
        yield put(uploadAvatarSuccess({avatarImage }));
    }
}
function* deleteAvatarHandler(data) {
    const response = yield call(deleteAvatar, data.payload);
    console.log("response",response);
    if (response['tokenExpired']) {
        yield put(getUserError({msg: response.responseMsg}));
    } else {
        yield put(deleteAvatarSuccess());
    }
}
export function* waitForAccount() {
    yield takeEvery(types.LOGIN_REQUEST, loginHandler);
    yield takeEvery(types.GET_USER_REQUEST, getUserHandler);
    yield takeEvery(types.UPLOAD_AVATAR_REQUEST, uploadAvatarHandler);
    yield takeEvery(types.DELETE_AVATAR_REQUEST, deleteAvatarHandler);
}
