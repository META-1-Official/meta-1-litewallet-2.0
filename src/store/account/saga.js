import { takeEvery, call, put } from 'redux-saga/effects';
import { checkOldUser, deleteAvatar, getUserData, loginRequest, sendEmail, uploadAvatar, validateSignature } from '../../API/API';
import { setAccessToken, setLocation, setLoginDetail } from '../../utils/localstorage';
import { checkTokenRequest, checkAccountSignatureError, checkAccountSignatureSuccess, checkTransferableError, checkTransferableSuccess, deleteAvatarSuccess, getUserError, getUserSuccess, loginError, loginSuccess, sendMailError, sendMailSuccess, uploadAvatarSuccess, passKeyErrorService, passKeySuccessService } from './actions';
import * as types from './types';
import Meta1 from "meta1-vision-dex";
import { signUpHandler } from '../../utils/common';
function* loginHandler(data) {
    try {
        if (data?.payload?.fromSignUpFlag) {
            const result = yield signUpHandler(data.payload.login, data.payload.emailOrPassword);
            if (result && !result.status) {
                yield put(loginError({ accountName: null, token: '', msg: 'Account Creation is under process. Please try after sometime' }));
                return;
            }
        }
        const response = yield call(loginRequest, data.payload.login, data.payload.signUpEmail ? data.payload.signUpEmail: data.payload.emailOrPassword);
        if (!response.error) {
            setAccessToken(response.token);
            setLoginDetail(response.accountName)
            setLocation('wallet');
            yield put(loginSuccess({ accountName: response.accountName, token: response.token, fromSignUp: data?.payload?.fromSignUpFlag }));
        } else {
            yield put(loginError({ accountName: null, token: '', msg: 'Wallet name or Passkey is wrong' }));
        }
    } catch (e) {
        data.payload.setLoginDataError(true);
        yield put(loginError({ accountName: null, token: '', msg: 'Wallet name or Passkey is wrong' }));
    }
}
function* getUserHandler(data) {
    const response = yield call(getUserData, data.payload);
    if (response['tokenExpired']) {
        yield put(getUserError({ msg: response.responseMsg }));
    } else {
        if (response?.message?.userAvatar != null) {
            let avatarImage = `${process.env.REACT_APP_BACK_URL}/public/${response.message.userAvatar}`;
            yield put(getUserSuccess({ user: response, avatarImage }));
        } else {
            yield put(getUserSuccess({ user: response, avatarImage: null }));
        }
    }
}
function* uploadAvatarHandler(data) {
    const response = yield call(uploadAvatar, data.payload);
    if (response['tokenExpired']) {
        yield put(getUserError({ msg: response.responseMsg }));
    } else {
        let avatarImage = `${process.env.REACT_APP_BACK_URL}/public/${response.message}`;
        yield put(uploadAvatarSuccess({ avatarImage }));
    }
}
function* deleteAvatarHandler(data) {
    const response = yield call(deleteAvatar, data.payload);
    if (response['tokenExpired']) {
        yield put(getUserError({ msg: response.responseMsg }));
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
            yield put(getUserError({ msg: response.responseMsg }));
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
    }
}


function* checkTokenHandler(data) {
    const response = yield call(getUserData, data.payload);
    if (response['tokenExpired']) {
        yield put(getUserError({ msg: response.responseMsg }));
    }
}

function* passKeyHandler(data) {
    try {
        yield Meta1.connect(process.env.REACT_APP_MAIA);
        const loginResult = yield Meta1.login(data.payload.login, data.payload.password);
        if (loginResult) {
            yield put(passKeySuccessService());
        } else {
            yield put(passKeyErrorService());
        }
    } catch (err) {
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
    yield takeEvery(types.CHECK_ACCOUNT_SIGNATURE_REQUEST, CheckAccountSignatureHandler);
    yield takeEvery(types.CHECK_TOKEN_REQUEST, checkTokenHandler);
    yield takeEvery(types.PASS_KEY_REQUEST, passKeyHandler);
}
