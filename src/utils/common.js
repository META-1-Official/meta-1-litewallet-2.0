import Meta1 from "meta1-vision-dex";
export const sleepHandler = (ms) =>  {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const isUserExistHandler = async (login, password, checkCount, status) => {
    try {
        await Meta1.connect(process.env.REACT_APP_MAIA);
        await Meta1.login(login, password);
        if (!status) {
            status = true;
        }
        return { status };
    } catch(err) {
        if (checkCount === 10 ){
            status = false;
            return { status };
        }
        await sleepHandler(300);
        checkCount = checkCount + 1;
        const response = await isUserExistHandler(login, password, checkCount);
        if (response.status) {
            return { status: true };
        } else {
            return { status: false };
        }
    }
}
export const signUpHandler = async (login, password) => {
    let checkCount = 0;
    let status = false;
    await sleepHandler(3000);
    const result = await isUserExistHandler(login, password, checkCount, status);
    if (result && result.status) {
        return { status: true };
    }
    return { status: false };
}
