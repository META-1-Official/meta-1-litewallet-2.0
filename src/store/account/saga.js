import { takeEvery, call, put } from 'redux-saga/effects';
import { checkOldUser, deleteAvatar, getUserData, loginRequest, sendEmail, uploadAvatar, validateSignature } from '../../API/API';
import { setAccessToken, setLoginDetail } from '../../utils/localstorage';
import { checkAccountSignatureError, checkAccountSignatureSuccess, checkTransferableError, checkTransferableSuccess, deleteAvatarSuccess, getUserError, getUserSuccess, loginError, loginSuccess, sendMailError, sendMailSuccess, uploadAvatarSuccess } from './actions';
import { checkTokenRequest, checkTransferableError, checkTransferableSuccess, deleteAvatarSuccess, getUserError, getUserSuccess, loginError, loginSuccess, sendMailError, sendMailSuccess, uploadAvatarSuccess } from './actions';
import { checkTokenRequest, checkTransferableError, checkTransferableSuccess, deleteAvatarSuccess, getUserError, getUserSuccess, loginError, loginSuccess, passKeyErrorService, passKeySuccessService, sendMailError, sendMailSuccess, uploadAvatarSuccess } from './actions';
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
    if (response['tokenExpired']) {
        yield put(getUserError({msg: response.responseMsg}));
    } else {
        if (response?.message?.userAvatar != null) {
            let avatarImage = `https://${process.env.REACT_APP_BACK_URL}/public/${response.message.userAvatar}`;
            yield put(getUserSuccess({user: response,avatarImage }));
        } else {
            yield put(getUserSuccess({user: response,avatarImage: null }));
        }
    }
}
function* uploadAvatarHandler(data) {
    const response = yield call(uploadAvatar, data.payload);
    if (response['tokenExpired']) {
        yield put(getUserError({msg: response.responseMsg}));
    } else {
        let avatarImage = `https://${process.env.REACT_APP_BACK_URL}/public/${response.message}`;
        yield put(uploadAvatarSuccess({avatarImage }));
    }
}
function* deleteAvatarHandler(data) {
    const response = yield call(deleteAvatar, data.payload);
    if (response['tokenExpired']) {
        yield put(getUserError({msg: response.responseMsg}));
    } else {
        yield put(deleteAvatarSuccess());
    }
}
function* sendMailHandler(data) {
    const response = yield call(sendEmail, data.payload.emailType, data.payload.emailData);
    if (response.success === 'success') {
        yield put(sendMailSuccess());
    } else {
        if (response['tokenExpired']) {
            yield put(getUserError({msg: response.responseMsg}));
        } else {
            alert("Oops, something went wrong. Try again");
            yield put(sendMailError());
        }
    }
}

function* checkTransferableHandler(data) {
    const response = yield call(checkOldUser, data.payload.login);
    if (!response.error) {
        if (response.found) {
            yield put(checkTransferableSuccess({ oldUser: response.found }));
        } else {
            yield put(checkTransferableError());
        }
    } else {
        yield put(checkTransferableError());
    }
}

function* CheckAccountSignatureHandler(data) {
    const response = yield call(validateSignature, data.payload.login, data.payload.password);
    if (!response.error) {
        yield put(checkAccountSignatureSuccess());
    } else {
        yield put(checkAccountSignatureError());

function* checkTokenHandler(data) {
    const response = yield call(getUserData,data.payload);
    if (response['tokenExpired']) {
        yield put(getUserError({msg: response.responseMsg}));
    }
}

function* passKeyHandler(data) {
    const response = yield call(passKeyRequest,data.payload.login,data.payload.password);
    if (!response.error) {
        yield put(passKeySuccessService());
    } else {
        yield put(passKeyErrorService());
    }
}

export function* waitForAccount() {
    yield takeEvery(types.LOGIN_REQUEST, loginHandler);
    yield takeEvery(types.GET_USER_REQUEST, getUserHandler);
    yield takeEvery(types.UPLOAD_AVATAR_REQUEST, uploadAvatarHandler);
    yield takeEvery(types.DELETE_AVATAR_REQUEST, deleteAvatarHandler);
    yield takeEvery(types.SEND_MAIL_REQUEST, sendMailHandler);
    yield takeEvery(types.CHECK_TRANSFERABLE_REQUEST, checkTransferableHandler);
    yield takeEvery(types.CHECK_ACCOUNT_SIGNATURE_REQUEST, CheckAccountSignatureHandler );
    yield takeEvery(types.CHECK_TOKEN_REQUEST, checkTokenHandler);
    yield takeEvery(types.PASS_KEY_REQUEST, passKeyHandler);
}
