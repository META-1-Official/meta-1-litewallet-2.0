export const removeExponent = (value) => {
    const newData = value.toFixed(10)
    let count = 0
    for (let data of newData) {
        if (data == 0) {
            count++
        } else {
            count = 0
        }
    }
    return newData.slice(0, newData.length - count)
}