'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { QrCode, X, Camera, Loader2, Keyboard, Car } from 'lucide-react'
import {
  scanBarcode,
  bookBySeatCode,
  bookByPlateNumber,
  type ScanResult,
} from '@/actions/ScanBarcode'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

type InputMethod = 'camera' | 'seatCode' | 'plateNumber'

interface BarcodeScannerProps {
  onScanSuccess: (result: ScanResult) => void
  onScanError: (error: string) => void
  lng: Locale
}

export function BarcodeScanner({
  onScanSuccess,
  onScanError,
  lng,
}: BarcodeScannerProps) {
  const { t } = useTranslation(lng, 'dashboard')
  const [isScanning, setIsScanning] = useState(false)
  const [inputMethod, setInputMethod] = useState<InputMethod>('camera')
  const [seatCodeInput, setSeatCodeInput] = useState('')
  const [plateNumberInput, setPlateNumberInput] = useState('')
  const [seatNumberInput, setSeatNumberInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = 'qr-reader'

  useEffect(() => {
    if (inputMethod === 'camera' && cameraActive && isScanning) {
      startCameraScanner()
    }

    return () => {
      stopCameraScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMethod, cameraActive, isScanning])

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
          toast.success(t('scanner.toast.barcodeDetected'), {
            description: t('scanner.toast.validating'),
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
      toast.success(t('scanner.toast.cameraReady'), {
        description: t('scanner.toast.cameraReadyDesc'),
        duration: 3000,
      })
    } catch (err) {
      console.error('Camera start error:', err)
      setCameraLoading(false)
      toast.error(t('scanner.toast.cameraError'), {
        description: t('scanner.toast.cameraErrorDesc'),
        duration: 5000,
      })
      onScanError('Failed to start camera. Please use manual entry.')
      setCameraActive(false)
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
    const loadingToast = toast.loading(t('scanner.toast.processing'))

    setLoading(true)
    try {
      const result = await scanBarcode(barcodeData)
      console.log('scan result: ', result)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      if (result.success) {
        if (result.autoBooked) {
          // Show success toast for auto-booking
          toast.success(t('scanner.toast.seatBooked'), {
            description: result.message,
            duration: 5000,
          })
        } else {
          // Show info toast for validation success
          toast.info(t('scanner.toast.routeValidated'), {
            description: result.message,
            duration: 3000,
          })
        }
        onScanSuccess(result)
        setIsScanning(false)
        setCameraActive(false)
        setSeatCodeInput('')
        setPlateNumberInput('')
        setSeatNumberInput('')
      } else {
        // Show error toast
        toast.error(t('scanner.toast.scanFailed'), {
          description: result.message,
          duration: 5000,
        })
        onScanError(result.message)
      }
    } catch {
      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Show error toast
      toast.error(t('scanner.toast.processingFailed'), {
        description: t('scanner.toast.processingFailedDesc'),
        duration: 5000,
      })
      onScanError('Failed to process barcode')
    } finally {
      setLoading(false)
    }
  }

  const handleSeatCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!seatCodeInput.trim() || loading) return

    // Show loading toast
    const loadingToast = toast.loading(t('scanner.toast.processingSeatCode'))

    setLoading(true)
    try {
      const result = await bookBySeatCode(seatCodeInput.trim())
      console.log('seat code result: ', result)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      if (result.success) {
        if (result.autoBooked) {
          toast.success(t('scanner.toast.seatBooked'), {
            description: result.message,
            duration: 5000,
          })
        } else {
          toast.info(t('scanner.toast.routeValidated'), {
            description: result.message,
            duration: 3000,
          })
        }
        onScanSuccess(result)
        setIsScanning(false)
        setSeatCodeInput('')
        setSeatNumberInput('')
      } else {
        toast.error(t('scanner.toast.scanFailed'), {
          description: result.message,
          duration: 5000,
        })
        onScanError(result.message)
      }
    } catch {
      toast.dismiss(loadingToast)
      toast.error(t('scanner.toast.processingFailed'), {
        description: t('scanner.toast.processingFailedDesc'),
        duration: 5000,
      })
      onScanError('Failed to process seat code')
    } finally {
      setLoading(false)
    }
  }

  const handlePlateNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plateNumberInput.trim() || !seatNumberInput.trim() || loading) return

    // Show loading toast
    const loadingToast = toast.loading(t('scanner.toast.processingPlate'))

    setLoading(true)
    try {
      // Parse seat number
      const seatNum = parseInt(seatNumberInput.trim(), 10)

      if (isNaN(seatNum) || seatNum < 1) {
        toast.dismiss(loadingToast)
        toast.error(t('scanner.toast.invalidSeatNumber'), {
          description: t('scanner.toast.invalidSeatNumberDesc'),
          duration: 5000,
        })
        setLoading(false)
        return
      }

      const result = await bookByPlateNumber(plateNumberInput.trim(), seatNum)
      console.log('plate number result: ', result)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      if (result.success) {
        if (result.autoBooked) {
          toast.success(t('scanner.toast.seatBooked'), {
            description: result.message,
            duration: 5000,
          })
        } else {
          toast.info(t('scanner.toast.routeValidated'), {
            description: result.message,
            duration: 3000,
          })
        }
        onScanSuccess(result)
        setIsScanning(false)
        setPlateNumberInput('')
        setSeatNumberInput('')
      } else {
        toast.error(t('scanner.toast.scanFailed'), {
          description: result.message,
          duration: 5000,
        })
        onScanError(result.message)
      }
    } catch {
      toast.dismiss(loadingToast)
      toast.error(t('scanner.toast.processingFailed'), {
        description: t('scanner.toast.processingFailedDesc'),
        duration: 5000,
      })
      onScanError('Failed to process plate number')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    stopCameraScanner()
    setIsScanning(false)
    setCameraActive(false)
    setSeatCodeInput('')
    setPlateNumberInput('')
    setSeatNumberInput('')
  }

  if (!isScanning) {
    return (
      <Button
        onClick={() => setIsScanning(true)}
        className='w-full h-32 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl text-white flex flex-col items-center justify-center gap-3'
      >
        <QrCode className='w-16 h-16' />
        <span className='text-lg font-bold'>{t('passenger.scanButton')}</span>
      </Button>
    )
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-bold text-gray-800'>
            {t('scanner.title')}
          </h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleClose}
            className='rounded-full'
          >
            <X className='w-6 h-6' />
          </Button>
        </div>

        {/* Method Selection Tabs */}
        <div className='grid grid-cols-3 gap-2 mb-6'>
          <Button
            type='button'
            variant={inputMethod === 'camera' ? 'default' : 'outline'}
            onClick={() => {
              setInputMethod('camera')
              setCameraActive(false)
            }}
            disabled={loading}
            className='flex flex-col items-center gap-1 h-auto py-3'
          >
            <Camera className='w-5 h-5' />
            <span className='text-xs'>{t('scanner.methods.camera')}</span>
          </Button>
          <Button
            type='button'
            variant={inputMethod === 'seatCode' ? 'default' : 'outline'}
            onClick={() => {
              setInputMethod('seatCode')
              stopCameraScanner()
              setCameraActive(false)
            }}
            disabled={loading}
            className='flex flex-col items-center gap-1 h-auto py-3'
          >
            <Keyboard className='w-5 h-5' />
            <span className='text-xs'>{t('scanner.methods.seatCode')}</span>
          </Button>
          <Button
            type='button'
            variant={inputMethod === 'plateNumber' ? 'default' : 'outline'}
            onClick={() => {
              setInputMethod('plateNumber')
              stopCameraScanner()
              setCameraActive(false)
            }}
            disabled={loading}
            className='flex flex-col items-center gap-1 h-auto py-3'
          >
            <Car className='w-5 h-5' />
            <span className='text-xs'>{t('scanner.methods.plateNumber')}</span>
          </Button>
        </div>

        {/* Camera Scanner */}
        {inputMethod === 'camera' && (
          <div className='mb-4'>
            {!cameraActive ? (
              <div className='text-center py-8'>
                <Camera className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                <p className='text-sm text-gray-600 mb-4'>
                  {t('scanner.camera.instruction')}
                </p>
                <Button
                  type='button'
                  variant='default'
                  className='w-full h-14 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  onClick={() => setCameraActive(true)}
                  disabled={loading}
                >
                  <Camera className='w-5 h-5 mr-2' />
                  {t('scanner.camera.startButton')}
                </Button>
              </div>
            ) : (
              <div>
                <div className='mb-4'>
                  {cameraLoading ? (
                    <div className='bg-gray-200 rounded-xl h-64 flex items-center justify-center'>
                      <div className='text-center'>
                        <Loader2 className='w-12 h-12 text-blue-500 animate-spin mx-auto mb-2' />
                        <p className='text-sm text-gray-600'>
                          {t('scanner.camera.starting')}
                        </p>
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
                    setCameraActive(false)
                  }}
                  disabled={loading}
                >
                  {t('scanner.camera.closeButton')}
                </Button>

                <p className='text-xs text-gray-500 text-center mt-3'>
                  {t('scanner.camera.positionTip')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Seat Code Input */}
        {inputMethod === 'seatCode' && (
          <div className='mb-4'>
            <div className='text-center py-4 mb-4'>
              <Keyboard className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-sm text-gray-600'>
                {t('scanner.seatCode.instruction')}
              </p>
            </div>

            <form onSubmit={handleSeatCodeSubmit} className='space-y-3'>
              <label htmlFor='seat-code-input' className='sr-only'>
                {t('scanner.seatCode.placeholder')}
              </label>
              <input
                id='seat-code-input'
                type='text'
                value={seatCodeInput}
                onChange={(e) => setSeatCodeInput(e.target.value)}
                placeholder={t('scanner.seatCode.placeholder')}
                maxLength={14}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-wider font-mono'
              />
              <div className='text-xs text-gray-500 text-center'>
                {t('scanner.seatCode.charactersCount', {
                  count: seatCodeInput.length,
                })}
              </div>
              <Button
                type='submit'
                className='w-full h-12'
                disabled={seatCodeInput.length !== 14 || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    {t('scanner.processing')}
                  </>
                ) : (
                  t('scanner.seatCode.submitButton')
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Plate Number Input */}
        {inputMethod === 'plateNumber' && (
          <div className='mb-4'>
            <div className='text-center py-4 mb-4'>
              <Car className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-sm text-gray-600'>
                {t('scanner.plateNumber.instruction')}
              </p>
            </div>

            <form onSubmit={handlePlateNumberSubmit} className='space-y-3'>
              <div>
                <label
                  htmlFor='plate-number-input'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  {t('scanner.plateNumber.plateLabel')}
                </label>
                <input
                  id='plate-number-input'
                  type='text'
                  value={plateNumberInput}
                  onChange={(e) =>
                    setPlateNumberInput(e.target.value.toUpperCase())
                  }
                  placeholder={t('scanner.plateNumber.platePlaceholder')}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-wider font-mono uppercase'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='seat-number-input'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  {t('scanner.plateNumber.seatLabel')}
                </label>
                <input
                  id='seat-number-input'
                  type='number'
                  min='1'
                  value={seatNumberInput}
                  onChange={(e) => setSeatNumberInput(e.target.value)}
                  placeholder={t('scanner.plateNumber.seatPlaceholder')}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg'
                  required
                />
                <p className='text-xs text-gray-500 mt-1 text-center'>
                  {t('scanner.plateNumber.seatTip')}
                </p>
              </div>

              <Button
                type='submit'
                className='w-full h-12'
                disabled={
                  !plateNumberInput.trim() || !seatNumberInput.trim() || loading
                }
              >
                {loading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    {t('scanner.processing')}
                  </>
                ) : (
                  t('scanner.plateNumber.submitButton')
                )}
              </Button>
            </form>
          </div>
        )}

        <p className='text-xs text-gray-500 text-center mt-6'>
          {t('scanner.tip')}
        </p>
      </div>
    </div>
  )
}
