import jsPDF from 'jspdf'
import QRCode from 'qrcode'

import image from './img.png'

const isLocked = () => true

const _createPaperWalletAsPDF = function (
    ownerkeys,
    activeKeys,
    memoKey,
    accountName
) {
    const width = 1050,
        height = 1150, //mm
        lineMargin = 5,
        qrSize = 50,
        textMarginLeft = qrSize + 7,
        qrMargin = 5,
        qrRightPos = width - qrSize - qrMargin,
        textWidth = width - qrSize * 2 - qrMargin * 2 - 3,
        textHeight = 8,
        logoWidth = (width * 3) / 4,
        logoHeight = logoWidth / 2.8, //  logo original width/height=2.8
        logoPositionX = (width - logoWidth) / 2;
    let rowHeight = 110;
    const keys = [activeKeys, ownerkeys, memoKey]
    const keysName = ['Active Key', 'Owner Key', 'Memo Key']

    let locked = isLocked()

    const pdf = new jsPDF({
        orientation: 'portrait',
        format: [width, height],
        compressPdf: true
    })

    const checkPageH = (pdfInstance, currentPageH, maxPageH) => {
        if (currentPageH >= maxPageH) {
            pdfInstance.addPage()
            rowHeight = 10
        }
        return pdf.internal.getNumberOfPages()
    }

    const keyRow = (privateKey) => {
        let currentPage = checkPageH(pdf, rowHeight, 400)
        gQrcode(privateKey.toPublicKey().toPublicKeyString(), qrMargin, rowHeight + 10, currentPage)
        if (locked && !!privateKey) {
            gQrcode(privateKey.toWif(), 315, rowHeight + 10, currentPage)
        }
        pdf.text('PublicKey', textMarginLeft, rowHeight + 20)
        pdf.text(privateKey.toPublicKey().toPublicKeyString(), textMarginLeft, rowHeight + 30)
        pdf.rect(textMarginLeft - 1, rowHeight + 24, 258, textHeight)
        if (locked) {
            pdf.text('PrivateKey', textMarginLeft, rowHeight + 40)
            if (!!privateKey) {
                pdf.text(privateKey.toWif(), textMarginLeft, rowHeight + 50)
            } else {
                pdf.text('Not found.', textMarginLeft, rowHeight + 50)
            }
            pdf.rect(textMarginLeft - 1, rowHeight + 44, 258, textHeight)
        }
        rowHeight += 50
    }

    const gQrcode = (qrcode, rowWidth, rowHeight, currentPage) => {
        QRCode.toDataURL(qrcode)
            .then((url) => {
                pdf.setPage(currentPage)
                pdf.addImage(url, 'JPEG', rowWidth, rowHeight, qrSize, qrSize)
            })
            .catch((err) => {
                console.error(err)
            })
    }

    let img = new Image()
    img.src = image
    pdf.addImage(img, 'PNG', 115, 30, 150, 50, '', 'MEDIUM')
    pdf.text('Account:', 18, rowHeight - 10)
    pdf.text(accountName, 42, rowHeight - 10)

    let content = keys.map((privateKeys, index) => {
        if (index >= 1) {
            rowHeight += 25 // add margin-top for block
        }
        checkPageH(pdf, rowHeight, 400)
        pdf.text('Public', 22, rowHeight + 7)
        pdf.text(keysName[index], 170, rowHeight + 7)
        if (!locked) {
            pdf.text('Private', 327, rowHeight + 7)
        }
        pdf.line(lineMargin, rowHeight + 1, 365, rowHeight + 1)
        pdf.line(lineMargin, rowHeight + 9, 365, rowHeight + 9)
        keyRow(privateKeys)
    })

    Promise.all(content).then(() => {
        pdf.save(
            'meta' +
                '-paper-wallet-' +
                (locked ? 'public-' : 'private-') +
                accountName +
                '.pdf'
        )
    })
}

const createPaperWalletAsPDF = function (
    account,
    owner_private,
    active_private,
    memo_private,
) {
    _createPaperWalletAsPDF(owner_private, active_private, memo_private, account)
}

export { createPaperWalletAsPDF }
