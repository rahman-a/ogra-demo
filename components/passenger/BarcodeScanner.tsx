'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { QrCode, X, Camera, Loader2 } from 'lucide-react'
import { scanBarcode, type ScanResult } from '@/actions/ScanBarcode'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'sonner'

interface BarcodeScannerProps {
  onScanSuccess: (result: ScanResult) => void
  onScanError: (error: string) => void
}

export function BarcodeScanner({
  onScanSuccess,
  onScanError,
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [useCameraScanner, setUseCameraScanner] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = 'qr-reader'

  useEffect(() => {
    if (useCameraScanner && isScanning) {
      startCameraScanner()
    }

    return () => {
      stopCameraScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCameraScanner, isScanning])

  const startCameraScanner = async () => {
    setCameraLoading(true)
    try {
      const html5QrCode = new Html5Qrcode(scannerDivId)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          toast.success('Barcode detected!', {
            description: 'Validating and processing...',
            duration: 2000,
          })
          handleScan(decodedText)
          stopCameraScanner()
        },
        (errorMessage) => {
          console.log('scan error: ', errorMessage)
          // Error callback - ignore these as they happen frequently
          // console.log('Scan error:', errorMessage)
        }
      )
      setCameraLoading(false)
      toast.success('Camera ready', {
        description: 'Point your camera at the barcode',
        duration: 3000,
      })
    } catch (err) {
      console.error('Camera start error:', err)
      setCameraLoading(false)
      toast.error('Camera access denied', {
        description:
          'Failed to start camera. Please use manual entry or check permissions.',
        duration: 5000,
      })
      onScanError('Failed to start camera. Please use manual entry.')
      setUseCameraScanner(false)
    }
  }

  const stopCameraScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error('Camera stop error:', err)
      }
    }
    scannerRef.current = null
  }

  const handleScan = async (barcodeData: string) => {
    console.log('barcodeData before: ', barcodeData)
    if (!barcodeData || loading) return

    // Show loading toast
    const loadingToast = toast.loading('Processing barcode...')

    setLoading(true)
    try {
      const result = await scanBarcode(barcodeData)
      console.log('scan result: ', result)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      if (result.success) {
        if (result.autoBooked) {
          // Show success toast for auto-booking
          toast.success('Seat booked successfully!', {
            description: result.message,
            duration: 5000,
          })
        } else {
          // Show info toast for validation success
          toast.info('Route validated', {
            description: result.message,
            duration: 3000,
          })
        }
        onScanSuccess(result)
        setIsScanning(false)
        setUseCameraScanner(false)
        setManualInput('')
      } else {
        // Show error toast
        toast.error('Scan failed', {
          description: result.message,
          duration: 5000,
        })
        onScanError(result.message)
      }
    } catch {
      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Show error toast
      toast.error('Processing failed', {
        description: 'Failed to process barcode. Please try again.',
        duration: 5000,
      })
      onScanError('Failed to process barcode')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      handleScan(manualInput.trim())
    }
  }

  const handleClose = () => {
    stopCameraScanner()
    setIsScanning(false)
    setUseCameraScanner(false)
    setManualInput('')
  }

  if (!isScanning) {
    return (
      <Button
        onClick={() => setIsScanning(true)}
        className='w-full h-32 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl text-white flex flex-col items-center justify-center gap-3'
      >
        <QrCode className='w-16 h-16' />
        <span className='text-lg font-bold'>Scan Barcode to Book</span>
      </Button>
    )
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-bold text-gray-800'>Scan Barcode</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleClose}
            className='rounded-full'
          >
            <X className='w-6 h-6' />
          </Button>
        </div>

        {/* Camera Scanner Option */}
        {!useCameraScanner ? (
          <div className='mb-6'>
            <Button
              type='button'
              variant='default'
              className='w-full h-14 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 mb-4'
              onClick={() => setUseCameraScanner(true)}
              disabled={loading}
            >
              <Camera className='w-5 h-5 mr-2' />
              Open Camera Scanner
            </Button>
          </div>
        ) : (
          <div className='mb-6'>
            {/* Camera Scanner */}
            <div className='mb-4'>
              {cameraLoading ? (
                <div className='bg-gray-200 rounded-xl h-64 flex items-center justify-center'>
                  <div className='text-center'>
                    <Loader2 className='w-12 h-12 text-blue-500 animate-spin mx-auto mb-2' />
                    <p className='text-sm text-gray-600'>Starting camera...</p>
                  </div>
                </div>
              ) : (
                <div
                  id={scannerDivId}
                  className='rounded-xl overflow-hidden border-4 border-blue-500'
                />
              )}
            </div>

            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={() => {
                stopCameraScanner()
                setUseCameraScanner(false)
              }}
              disabled={loading}
            >
              Close Camera
            </Button>

            <p className='text-xs text-gray-500 text-center mt-3'>
              Position the barcode within the frame
            </p>
          </div>
        )}

        {/* Divider */}
        <div className='relative mb-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>
              Or enter manually
            </span>
          </div>
        </div>

        {/* Manual Input */}
        <div className='mb-4'>
          <form onSubmit={handleManualSubmit} className='space-y-3'>
            <label htmlFor='barcode-input' className='sr-only'>
              Enter barcode manually
            </label>
            <input
              id='barcode-input'
              type='text'
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder='routeId:seatId (e.g., abc123:xyz789)'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <Button
              type='submit'
              className='w-full'
              disabled={!manualInput.trim() || loading}
            >
              {loading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </div>

        <p className='text-xs text-gray-500 text-center'>
          Scan the barcode on your seat or enter the code manually
        </p>
      </div>
    </div>
  )
}
