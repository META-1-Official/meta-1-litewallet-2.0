export const setTheme = (key="theme", value) => {
    window.localStorage.setItem(key, JSON.stringify(value));
}

export const getTheme = (key="theme") => {
    const value = window.localStorage.getItem(key);

    if (value) {
        return JSON.parse(value);
    } else {
        return "light";
    }
}