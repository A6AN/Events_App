const QRCode = require('qrcode');
const fs = require('fs');

const data = "https://www.google.com";

QRCode.toString(data, {
    type: "svg",
    errorCorrectionLevel: "H", // VERY important
    margin: 4, // quiet zone (don’t reduce this)
}, (err, svg) => {
    if (err) throw err;
    fs.writeFileSync("qr.svg", svg);
});