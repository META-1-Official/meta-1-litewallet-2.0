export const getAccessToken = () => {
    return localStorage.getItem('accessToken') || '';
}
export const setAccessToken = (val) => {
    localStorage.setItem('accessToken', val);
}
export const removeAccessToken = () => {
    localStorage.removeItem('accessToken');
}
export const getLoginDetail = () => {
    return localStorage.getItem('login') || '';
}
export const setLoginDetail = (val) => {
    localStorage.setItem('login', val);
}
export const removeLoginDetail = () => {
    localStorage.removeItem('login');
}
export const getLocation = () => {
    return sessionStorage.getItem('location') || '';
}
export const setLocation = (val) => {
    sessionStorage.setItem('location', val);
}
export const removeLocation = () => {
    sessionStorage.removeItem('location');
}
export const tokenFail = () => {
    removeLoginDetail();
    removeAccessToken();
    removeLocation();
  }