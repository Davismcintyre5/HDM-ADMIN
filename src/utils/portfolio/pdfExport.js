import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

async function waitForImages(element, timeoutMs = 5000) {
  if (!element) return;
  const imgs = Array.from(element.querySelectorAll('img'));
  const waitOne = (img) =>
    new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) return resolve();
      const done = () => {
        img.removeEventListener('load', done);
        img.removeEventListener('error', done);
        resolve();
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      setTimeout(done, timeoutMs);
    });
  await Promise.all(imgs.map(waitOne));
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export async function exportElementToPdf(element, filename = 'document.pdf') {
  if (!element) throw new Error('Nothing to export');

  await waitForImages(element);

  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(3, Math.ceil(dpr * 2));

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    imageTimeout: 15000,
    removeContainer: true,
  });

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas is empty — element has no size');
  }

  const imgData = canvas.toDataURL('image/png');

  const a4WidthPt = 595.28;
  const ratio = canvas.height / canvas.width;
  const pageHeightPt = a4WidthPt * ratio;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [a4WidthPt, pageHeightPt],
    compress: false,
  });

  pdf.addImage(imgData, 'PNG', 0, 0, a4WidthPt, pageHeightPt, undefined, 'NONE');

  const blob = pdf.output('blob');
  triggerBlobDownload(blob, filename);
  return true;
}

export async function printElement(element) {
  if (!element) throw new Error('Nothing to print');

  await waitForImages(element);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '800px';
  iframe.style.height = '1123px';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Print</title>
        <style>
          @page { margin: 12mm; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            -webkit-font-smoothing: antialiased !important;
            text-rendering: geometricPrecision !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: 'Times New Roman', Georgia, serif;
          }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `);
  doc.close();

  await new Promise((resolve) => {
    const check = () => {
      const imgs = Array.from(doc.querySelectorAll('img'));
      if (!imgs.length) return resolve();
      Promise.all(
        imgs.map(
          (img) =>
            new Promise((r) => {
              if (img.complete && img.naturalWidth > 0) return r();
              img.addEventListener('load', r, { once: true });
              img.addEventListener('error', r, { once: true });
              setTimeout(r, 3000);
            })
        )
      ).then(resolve);
    };
    setTimeout(check, 100);
  });

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1500);
  };

  iframe.contentWindow.focus();
  if (typeof iframe.contentWindow.addEventListener === 'function') {
    iframe.contentWindow.addEventListener('afterprint', cleanup);
  }

  setTimeout(() => {
    try {
      iframe.contentWindow.print();
    } catch {
      const win = window.open('', '_blank', 'width=900,height=700');
      if (win) {
        win.document.write(doc.documentElement.outerHTML);
        win.document.close();
        win.focus();
        win.print();
      }
    }
    cleanup();
  }, 250);
}