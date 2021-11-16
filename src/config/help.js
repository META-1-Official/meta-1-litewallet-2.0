
export const helpTextPortfolio = {
    qty:
        'This column shows how much of each digital asset held in the wallet.',
    valueUsd:
        'This column shows the USD value of the digital asset held in the wallet.',
    priceUsd: 'This column shows USD price per 1 of the digital asset.',
    hrsChange: 'This column shows the change in the price of the cryptocurrency for 24 hours.',
    trade:
        'Click "trade" next to the coin that you want to exchange for another coin.',
    send:
        'Click "send" next to the coin that you want to transfer to another user. This action will transfer only between Meta1 accounts.'
}

// Trade Component

export const helpInput = (cur1, cur2) =>
    `Type in this field how much of ${cur1} you want to get for ${cur2}`
export const helpMax1 = (cur1) => `Click this button to sell all your ${cur1}`
export const helpMax2 = (cur) => `Click this button to buy the same amount of ${cur} as you have on your balance`

export const helpSwap = (cur1, cur2) => `Click this button to exchange ${cur1} with ${cur2} `

// Send Component

export const helpSendTo = 'Type in this field the recipient user id (account name)'
export const helpAmount = (acc, cur1) => `Type in this field how much ${cur1 || ''} to send to ${acc || 'account'}`











