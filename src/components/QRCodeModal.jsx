import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Download, Printer } from 'lucide-react'

export default function QRCodeModal({ horse, onClose }) {
  const printRef = useRef()
  const url = `${window.location.origin}/hest/${horse.id}`

  function handlePrint() {
    const content = printRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Kode – ${horse.name}</title>
          <style>
            body { font-family: Georgia, serif; display: flex; flex-direction: column;
                   align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            h1 { font-size: 28px; margin-bottom: 4px; }
            p  { color: #666; margin: 4px 0 16px; font-size: 14px; }
            svg { border: 8px solid white; box-shadow: 0 0 0 1px #eee; border-radius: 8px; }
            .url { margin-top: 12px; font-size: 11px; color: #999; word-break: break-all; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  function handleDownload() {
    const svg = printRef.current.querySelector('svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.download = `qr-${horse.name.toLowerCase().replace(/\s+/g, '-')}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        <div ref={printRef} className="text-center">
          <h1 className="font-serif text-2xl font-semibold text-stone-800">{horse.name}</h1>
          <p className="text-stone-500 text-sm mb-6">Boks {horse.box} · {horse.ownerName}</p>
          <div className="flex justify-center">
            <QRCodeSVG
              value={url}
              size={220}
              bgColor="#ffffff"
              fgColor="#1c1917"
              level="M"
              includeMargin
            />
          </div>
          <p className="url text-xs text-stone-400 mt-3 break-all">{url}</p>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={handlePrint} className="btn-secondary flex-1 justify-center text-sm">
            <Printer size={15} />
            Print
          </button>
          <button onClick={handleDownload} className="btn-primary flex-1 justify-center text-sm">
            <Download size={15} />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
