import React, { useMemo } from 'react';
import QRCode from 'qrcode';

interface TicketQRCodeProps {
  data: string;
  size?: number; // Size in pixels
}

/**
 * Custom Liquid/Connected QR Code Generator.
 * Matches the premium exclusive brand aesthetic of Project Milo.
 */
export const TicketQRCode = ({ data, size = 200 }: TicketQRCodeProps) => {
  const qrData = useMemo(() => {
    try {
      const qr = QRCode.create(data, { errorCorrectionLevel: 'H' });
      return {
        matrix: qr.modules.data as Uint8Array,
        modulesSize: qr.modules.size,
      };
    } catch (err) {
      console.error("Failed to generate QR:", err);
      return null;
    }
  }, [data]);

  if (!qrData) return null;

  const { matrix, modulesSize } = qrData;
  const boxSize = 10;
  const r = boxSize * 0.45;
  const finderSize = 7 * boxSize;
  const alignSize = 5 * boxSize;
  const bgColor = "#FAF1E4"; // Matching brand beige

  const isReserved = (gridX: number, gridY: number) => {
    if (gridX < 8 && gridY < 8) return true;
    if (gridX >= modulesSize - 8 && gridY < 8) return true;
    if (gridX < 8 && gridY >= modulesSize - 8) return true;
    // Specific Alignment Pattern (Size 29 = Version 3)
    if (modulesSize === 29 && gridX >= 20 && gridX <= 24 && gridY >= 20 && gridY <= 24) return true;
    return false;
  };

  const get = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= modulesSize || y >= modulesSize) return false;
    return matrix[y * modulesSize + x];
  };

  const rects: React.ReactNode[] = [];

  for (let y = 0; y < modulesSize; y++) {
    for (let x = 0; x < modulesSize; x++) {
      if (isReserved(x, y)) continue;

      if (get(x, y)) {
        const cx = x * boxSize + boxSize / 2;
        const cy = y * boxSize + boxSize / 2;
        const keyBase = `${x}-${y}`;

        // Module dot
        rects.push(<circle key={`c-${keyBase}`} cx={cx} cy={cy} r={r} fill="black" />);

        // Horizontal pill connection
        if (get(x + 1, y) && !isReserved(x + 1, y)) {
          rects.push(
            <rect key={`r-${keyBase}`} x={cx} y={cy - r} width={boxSize} height={r * 2} fill="black" />
          );
        }

        // Vertical pill connection
        if (get(x, y + 1) && !isReserved(x, y + 1)) {
          rects.push(
            <rect key={`d-${keyBase}`} x={cx - r} y={cy} width={r * 2} height={boxSize} fill="black" />
          );
        }

        // Fill 2x2 cluster intersections
        if (
          get(x + 1, y) &&
          get(x, y + 1) &&
          get(x + 1, y + 1) &&
          !isReserved(x + 1, y) &&
          !isReserved(x, y + 1) &&
          !isReserved(x + 1, y + 1)
        ) {
          rects.push(
            <rect key={`diag-${keyBase}`} x={cx} y={cy} width={boxSize} height={boxSize} fill="black" />
          );
        }
      }
    }
  }

  const drawFinder = (pxX: number, pxY: number, key: string) => (
    <g key={key}>
      <rect x={pxX} y={pxY} width={finderSize} height={finderSize} fill="black" rx={boxSize * 1.6} />
      <rect x={pxX + boxSize} y={pxY + boxSize} width={finderSize - 2 * boxSize} height={finderSize - 2 * boxSize} fill={bgColor} rx={boxSize * 1.1} />
      <rect x={pxX + 2 * boxSize} y={pxY + 2 * boxSize} width={finderSize - 4 * boxSize} height={finderSize - 4 * boxSize} fill="black" rx={boxSize * 0.75} />
    </g>
  );

  const drawAlignment = (pxX: number, pxY: number, key: string) => (
    <g key={key}>
      <rect x={pxX} y={pxY} width={alignSize} height={alignSize} fill="black" rx={boxSize * 1.0} />
      <rect x={pxX + boxSize} y={pxY + boxSize} width={alignSize - 2 * boxSize} height={alignSize - 2 * boxSize} fill={bgColor} rx={boxSize * 0.5} />
      <rect x={pxX + 2 * boxSize} y={pxY + 2 * boxSize} width={alignSize - 4 * boxSize} height={alignSize - 4 * boxSize} fill="black" rx={boxSize * 0.45} />
    </g>
  );

  rects.push(drawFinder(0, 0, 'finder-tl'));
  rects.push(drawFinder((modulesSize - 7) * boxSize, 0, 'finder-tr'));
  rects.push(drawFinder(0, (modulesSize - 7) * boxSize, 'finder-bl'));

  if (modulesSize === 29) {
    rects.push(drawAlignment(20 * boxSize, 20 * boxSize, 'alignment'));
  }

  const quietZone = 2 * boxSize;
  const totalInternalSize = modulesSize * boxSize + quietZone * 2;

  return (
    <div style={{ width: size, height: size, borderRadius: '16px', overflow: 'hidden' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${totalInternalSize} ${totalInternalSize}`}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        <rect width="100%" height="100%" fill={bgColor} />
        <g transform={`translate(${quietZone}, ${quietZone})`}>
          {rects}
        </g>
      </svg>
    </div>
  );
};
