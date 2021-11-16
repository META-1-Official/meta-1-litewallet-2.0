export default async function linkAccount(email, accountName, url) {
    const linkUrl = url || 'https://meta1.io/api/link'
    try {
        await fetch(linkUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                userId: email,
                walletId: accountName
            })
        })
    } catch (e) {
        console.log('Error Linking Account', e)
    }
}
