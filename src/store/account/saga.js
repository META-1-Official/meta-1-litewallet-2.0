import { takeEvery, call, put } from 'redux-saga/effects';
import { checkOldUser, deleteAvatar, getUserData, loginRequest, sendEmail, uploadAvatar, validateSignature } from '../../API/API';
import { setAccessToken, setLoginDetail } from '../../utils/localstorage';
import { checkTokenRequest, checkAccountSignatureError, checkAccountSignatureSuccess, checkTransferableError, checkTransferableSuccess, deleteAvatarSuccess, getUserError, getUserSuccess, loginError, loginSuccess, sendMailError, sendMailSuccess, uploadAvatarSuccess, passKeyErrorService, passKeySuccessService } from './actions';
import * as types from './types';
import Meta1 from "meta1-vision-dex";
import { signUpHandler } from '../../utils/common';
function* loginHandler(data) {
    try {
        if (data?.payload?.fromSignUpFlag) {
            console.log("signup log 9 after regiser check user register")
            const result = yield signUpHandler(data.payload.login, data.payload.password);
            console.log("signup log 10 after regiser check user register status",result)
            if (result && !result.status) {
                console.log("signup log 11 after regiser check user register status fail")
                yield put(loginError({accountName: null, token: '', msg: 'Account Creation is under process. Please try after sometime' }));
                return;
            }
        }
        console.log("signup log 12 after regiser check user login before")
        const response = yield call(loginRequest,data.payload.login, data.payload.password);
        console.log("signup log after regiser check user login status",response)
        if(!response.error){
            setAccessToken(response.token);
            setLoginDetail(response.accountName)
            console.log("signup log after regiser check user login status success")
            yield put(loginSuccess({accountName: response.accountName, token: response.token}));
        } else {
            console.log("signup log after regiser check user login status error")
            yield put(loginError({accountName: null, token: '', msg: 'Wallet name or Passkey is wrong' }));
        }
    } catch(e){
        data.payload.setLoginDataError(true);
        yield put(loginError({accountName: null, token: '', msg: 'Wallet name or Passkey is wrong' }));
    }
}
function* getUserHandler(data) {
    const response = yield call(getUserData,data.payload);
    console.log("signup log getUserHandler response",response)
    if (response['tokenExpired']) {
        console.log("signup log getUserHandler response 1",response)
        yield put(getUserError({msg: response.responseMsg}));
    } else if (response['error']) {
        console.log("signup log getUserHandler response 2",response)
        yield put(getUserError({msg: "userFail"}));
    } else {
        console.log("signup log getUserHandler response 3 ok")
        if (response?.message?.userAvatar != null) {
            console.log("signup log getUserHandler response 4 ok success")
            let avatarImage = `${process.env.REACT_APP_BACK_URL}/public/${response.message.userAvatar}`;
            yield put(getUserSuccess({user: response,avatarImage }));
        } else {
            console.log("signup log getUserHandler response 5 ok error")
            yield put(getUserSuccess({user: response,avatarImage: null }));
        }
    }
}
function* uploadAvatarHandler(data) {
    const response = yield call(uploadAvatar, data.payload);
    if (response['tokenExpired']) {
        yield put(getUserError({msg: response.responseMsg}));
    } else {
        let avatarImage = `${process.env.REACT_APP_BACK_URL}/public/${response.message}`;
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
    console.log("signup log submit 105 checkTransferableHandler");
    const response = yield call(checkOldUser, data.payload.login);
    console.log("signup log submit 106 checkTransferableHandler response",response);
    if (!response.error) {
        console.log("signup log submit 107 checkTransferableHandler no error");
        if (response.found) {
            console.log("signup log submit 108 checkTransferableHandler no error found");
            yield put(checkTransferableSuccess({ oldUser: response.found }));
        } else {
            console.log("signup log submit 109 checkTransferableHandler error");
            yield put(checkTransferableError());
        }
    } else {
        console.log("signup log submit 110 checkTransferableHandler error");
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
    const response = yield call(getUserData,data.payload);
    if (response['tokenExpired']) {
        yield put(getUserError({msg: response.responseMsg}));
    } else if (response['error']) {
        yield put(getUserError({msg: "userFail"}));
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
    yield takeEvery(types.CHECK_ACCOUNT_SIGNATURE_REQUEST, CheckAccountSignatureHandler );
    yield takeEvery(types.CHECK_TOKEN_REQUEST, checkTokenHandler);
    yield takeEvery(types.PASS_KEY_REQUEST, passKeyHandler);
}
