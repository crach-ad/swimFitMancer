"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QrCode } from "lucide-react"

interface QRCodeDisplayProps {
  clientId: string
  clientName: string
  qrCodeDataUrl: string
}

/**
 * Component to display a client's QR code
 * The QR code is shown in a dialog when clicked
 */
export function QRCodeDisplay({ clientId, clientName, qrCodeDataUrl }: QRCodeDisplayProps) {
  // Function to download the QR code as an image
  const downloadQRCode = () => {
    // Create a temporary link element
    const link = document.createElement("a")
    link.href = qrCodeDataUrl
    link.download = `${clientName.replace(/\s+/g, '_')}_QRCode.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Function to print the QR code
  const printQRCode = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${clientName} - QR Code</title>
            <style>
              body {
                font-family: system-ui, sans-serif;
                text-align: center;
                padding: 20px;
              }
              h2 {
                margin-bottom: 20px;
                color: #333;
              }
              img {
                max-width: 300px;
                border: 1px solid #eee;
              }
              .id {
                margin-top: 10px;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h2>${clientName}</h2>
            <img src="${qrCodeDataUrl}" alt="QR Code" />
            <p class="id">ID: ${clientId}</p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" title="View QR Code">
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{clientName}'s QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="relative mb-4 h-48 w-48 overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={qrCodeDataUrl}
              alt={`QR code for ${clientName}`}
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="mb-4 text-center text-sm text-gray-500">
            This QR code uniquely identifies {clientName} in the SwimFit system.
            <br />
            Use it for quick check-ins at sessions.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadQRCode}>
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={printQRCode}>
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
