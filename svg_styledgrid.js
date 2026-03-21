const QRCode = require('qrcode');
const fs = require('fs');

const data = "https://chat.whatsapp.com/GzTG445P70x8MfifnKg1uy?mode=gi_t";

// Get the raw logical matrix from the library
const qr = QRCode.create(data, { errorCorrectionLevel: 'H' });
const size = qr.modules.size;
const matrix = qr.modules.data; // 1D array of 0s and 1s

const boxSize = 10;
const r = boxSize * 0.45; // 45% radius for the modules (gives slightly soft disconnected dots, but fully thick connections)
let newRects = "";

const finderSize = 7 * boxSize;
const alignSize = 5 * boxSize;

// We use #FAF1E4 to perfectly match the warm beige background in the photo
const bgColor = "#FAF1E4";

function isReserved(gridX, gridY) {
    if (gridX < 8 && gridY < 8) return true; // top-left
    if (gridX >= size - 8 && gridY < 8) return true; // top-right
    if (gridX < 8 && gridY >= size - 8) return true; // bottom-left
    // Alignment Pattern (Positioned at 22,22 center for size 29)
    if (size === 29 && gridX >= 20 && gridX <= 24 && gridY >= 20 && gridY <= 24) return true;
    return false;
}

function get(x, y) {
    if (x < 0 || y < 0 || x >= size || y >= size) return false;
    return matrix[y * size + x];
}

// THE "LIQUID / CONNECTED" QR ALGORITHM
for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
        if (isReserved(x, y)) continue;
        
        if (get(x, y)) {
            const cx = x * boxSize + boxSize / 2;
            const cy = y * boxSize + boxSize / 2;
            
            // 1. Draw the base rounded dot
            newRects += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="black" />\n`;
            
            // 2. Connect to Right neighbor (forms horizontal pills)
            if (get(x + 1, y) && !isReserved(x + 1, y)) {
                newRects += `<rect x="${cx}" y="${cy - r}" width="${boxSize}" height="${r * 2}" fill="black" />\n`;
            }
            
            // 3. Connect to Bottom neighbor (forms vertical pills)
            if (get(x, y + 1) && !isReserved(x, y + 1)) {
                newRects += `<rect x="${cx - r}" y="${cy}" width="${r * 2}" height="${boxSize}" fill="black" />\n`;
            }
            
            // 4. Connect Diagonal intersections (prevents tiny white pinholes in 2x2 solid blocks)
            if (get(x + 1, y) && get(x, y + 1) && get(x + 1, y + 1) && 
                !isReserved(x + 1, y) && !isReserved(x, y + 1) && !isReserved(x + 1, y + 1)) {
                newRects += `<rect x="${cx}" y="${cy}" width="${boxSize}" height="${boxSize}" fill="black" />\n`;
            }
        }
    }
}

// Draw flawlessly rounded Finder Patterns
function drawFinder(pxX, pxY) {
  return `
    <rect x="${pxX}" y="${pxY}" width="${finderSize}" height="${finderSize}" fill="black" rx="${boxSize * 1.6}"/>
    <rect x="${pxX + boxSize}" y="${pxY + boxSize}" width="${finderSize - 2*boxSize}" height="${finderSize - 2*boxSize}" fill="${bgColor}" rx="${boxSize * 1.1}"/>
    <rect x="${pxX + 2*boxSize}" y="${pxY + 2*boxSize}" width="${finderSize - 4*boxSize}" height="${finderSize - 4*boxSize}" fill="black" rx="${boxSize * 0.75}"/>
  `;
}

// Draw the Alignment Pattern
function drawAlignment(pxX, pxY) {
  return `
    <rect x="${pxX}" y="${pxY}" width="${alignSize}" height="${alignSize}" fill="black" rx="${boxSize * 1.0}"/>
    <rect x="${pxX + boxSize}" y="${pxY + boxSize}" width="${alignSize - 2*boxSize}" height="${alignSize - 2*boxSize}" fill="${bgColor}" rx="${boxSize * 0.5}"/>
    <rect x="${pxX + 2*boxSize}" y="${pxY + 2*boxSize}" width="${alignSize - 4*boxSize}" height="${alignSize - 4*boxSize}" fill="black" rx="${boxSize * 0.45}"/>
  `;
}

newRects += drawFinder(0, 0);
newRects += drawFinder((size - 7) * boxSize, 0);
newRects += drawFinder(0, (size - 7) * boxSize);

if (size === 29) {
    newRects += drawAlignment(20 * boxSize, 20 * boxSize);
}

// 2-space Quiet Zone Padding
const quietZone = 2 * boxSize;
const totalSize = size * boxSize + (quietZone * 2);

const newSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <g transform="translate(${quietZone}, ${quietZone})">
    ${newRects}
  </g>
</svg>
`;

fs.writeFileSync("styled_qr.svg", newSVG);
console.log("Styled SVG QR generated: styled_qr.svg");
