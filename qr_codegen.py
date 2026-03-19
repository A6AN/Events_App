import qrcode
from PIL import Image, ImageDraw

# Create QR with high error correction
qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)

qr.add_data("https://www.google.com")
qr.make(fit=True)

matrix = qr.get_matrix()

# Settings
box_size = 20
gap = 6  # spacing between squares
img_size = len(matrix) * box_size

img = Image.new("RGB", (img_size, img_size), "white")
draw = ImageDraw.Draw(img)

for y in range(len(matrix)):
    for x in range(len(matrix)):
        if matrix[y][x]:
            x1 = x * box_size + gap // 2
            y1 = y * box_size + gap // 2
            x2 = x1 + box_size - gap
            y2 = y1 + box_size - gap
            
            draw.rectangle([x1, y1, x2, y2], fill="black")

# Save QR
img.save("styled_qr.png")
print("QR code saved as styled_qr.png")