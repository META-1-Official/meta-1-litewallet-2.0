export const removeExponent = (value) => {
    return Number.isSafeInteger(value) ? value : value.toFixed(8)
}
