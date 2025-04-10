"use client";

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { extractClientIdFromQR } from '@/lib/qrcode-service';

interface QrScannerProps {
  onScanSuccess: (clientId: string, notes?: string) => Promise<void>;
  fps?: number;
  qrbox?: number;
  clients: { id: string; name: string; }[];
  currentSessionId?: string;
}

export function QrScanner({ 
  onScanSuccess, 
  fps = 10, 
  qrbox = 250, 
  clients = [],
  currentSessionId
}: QrScannerProps) {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; clientId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [scannedClientName, setScannedClientName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cameraId, setCameraId] = useState<string>('');
  const scannerContainerId = 'scanner-container';
  const [cameraStarted, setCameraStarted] = useState<boolean>(false);
  
  // Get available cameras
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const getAvailableCameras = async () => {
      try {
        // Create HTML5 QR code instance
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        setScanner(html5QrCode);
        
        // Get available camera devices
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          console.log('Cameras found:', devices.length);
          setCameraId(devices[0].id); // Use the first camera by default
        } else {
          setError('No camera devices found');
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
        setError('Failed to access camera. Please make sure you have given camera permissions.');
      }
    };
    
    getAvailableCameras();
    
    // Cleanup scanner on unmount
    return () => {
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, []);
  
  // Start camera when camera ID is available
  useEffect(() => {
    if (!scanner || !cameraId || !isScanning || scanResult || cameraStarted) return;
    
    const startCamera = async () => {
      try {
        // Ensure we stop any existing scan first
        if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
          await scanner.stop();
        }
        
        // Configure and start the camera
        await scanner.start(
          cameraId, 
          {
            fps,
            qrbox: { width: qrbox, height: qrbox },
            aspectRatio: 1.0,
          },
          (decodedText) => handleSuccessfulScan(decodedText),
          (errorMessage) => console.log('QR scanning:', errorMessage)
        );
        
        setCameraStarted(true);
        console.log('Camera started successfully with ID:', cameraId);
      } catch (err) {
        console.error('Error starting camera:', err);
        setError(`Failed to start camera: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    startCamera();
  }, [scanner, cameraId, isScanning, scanResult, cameraStarted, fps, qrbox]);
  
  // Process successful scan
  const handleSuccessfulScan = (decodedText: string) => {
    try {
      console.log('QR code scanned content:', decodedText);
      
      // Extract client ID from QR code using the proper format extraction
      let clientId: string | null = null;
      
      // First try to extract using the standard format (swimfit:client:ID)
      clientId = extractClientIdFromQR(decodedText.trim());
      
      // If that fails, try other possible formats
      if (!clientId) {
        // Try to parse as JSON in case it's a JSON object with client info
        try {
          const parsedData = JSON.parse(decodedText);
          if (parsedData && parsedData.id) {
            clientId = parsedData.id;
          }
        } catch (e) {
          // Not JSON, use the raw string as last resort
          clientId = decodedText.trim();
        }
      }
      
      console.log('Extracted client ID:', clientId);
      
      if (!clientId) {
        setError('Invalid QR code format');
        return;
      }
      
      // More robust client lookup - try multiple matching strategies
      console.log('All available clients:', clients);
      
      // Strategy 1: Direct ID match
      let client = clients.find(c => c.id === clientId);
      
      // Strategy 2: Case-insensitive ID match
      if (!client && typeof clientId === 'string') {
        console.log('Trying case-insensitive match...');
        client = clients.find(c => 
          typeof c.id === 'string' && c.id.toLowerCase() === clientId.toLowerCase()
        );
      }
      
      // Strategy 3: ID contained in client ID (for partial matches)
      if (!client && typeof clientId === 'string' && clientId.length > 5) {
        console.log('Trying partial ID match...');
        client = clients.find(c => 
          typeof c.id === 'string' && 
          (c.id.includes(clientId) || clientId.includes(c.id))
        );
      }
      
      // Strategy 4: Try matching by name for QR codes that might encode the name
      if (!client && typeof clientId === 'string' && clientId.length > 3) {
        console.log('Trying name-based match...');
        // This might be a name in the QR code
        const possibleName = clientId.toLowerCase();
        client = clients.find(c => 
          c.name.toLowerCase().includes(possibleName) || 
          possibleName.includes(c.name.toLowerCase())
        );
      }
      
      if (client) {
        console.log('Client found with strategy:', client);
        setScannedClientName(client.name);
      } else {
        console.log('Client not found with any strategy for ID:', clientId);
        setScannedClientName('Unknown Client');
      }
      
      // Set success state with green visual indicator
      setScanResult({
        success: true,
        message: 'QR code scanned successfully!',
        clientId
      });
      
      // Stop scanning to prevent multiple scans
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(err => console.error('Error stopping scanner:', err));
      }
      
      setIsScanning(false);
      setCameraStarted(false);
    } catch (error) {
      console.error('Error processing scan:', error);
      setError('Failed to process QR code. Please try again.');
    }
  };
  
  // Stop scanning
  const stopScanner = async () => {
    if (!scanner) return;
    
    try {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
      }
      setIsScanning(false);
      setCameraStarted(false);
    } catch (error) {
      console.error('Error stopping scanner:', error);
      setError('Failed to stop scanner');
    }
  };
  
  // Restart camera scanning
  const startScanner = () => {
    setIsScanning(true);
    setScanResult(null);
    setError(null);
    setScannedClientName('');
    setNotes('');
    setCameraStarted(false); // This will trigger the useEffect to start the camera again
  };
  
  // Handle submit button click
  const handleSubmit = async () => {
    if (!scanResult?.clientId) {
      console.error('No client ID available for submission');
      setError('Missing client information. Please scan again.');
      return;
    }
    
    console.log('Submitting attendance for client ID:', scanResult.clientId);
    console.log('Notes:', notes);
    console.log('Client name:', scannedClientName);
    
    setIsSubmitting(true);
    
    try {
      // Submit attendance with client ID and optional notes
      console.log('Calling onScanSuccess with clientId:', scanResult.clientId);
      await onScanSuccess(scanResult.clientId, notes);
      console.log('onScanSuccess completed successfully');
      
      // Reset form after successful submission
      setScanResult({
        ...scanResult,
        message: 'Attendance recorded successfully!'
      });
      
      // Explicitly log success
      console.log('Attendance logged successfully for client:', scannedClientName);
      
      // Wait 2 seconds then restart scanner for next scan
      setTimeout(() => {
        setScanResult(null);
        setScannedClientName('');
        setNotes('');
        setIsScanning(true);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setError(`Failed to submit attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Restart scanner for another scan
  const handleScanAnother = () => {
    setScanResult(null);
    setScannedClientName('');
    setNotes('');
    setError(null);
    setIsScanning(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Only show scanner when actively scanning */}
      {isScanning ? (
        <>
          {/* Scanner Status Message */}
          <Card className="border-cyan-200 bg-cyan-50">
            <CardContent className="p-4 text-center text-cyan-800">
              <p className="text-lg font-semibold">Scan Client QR Code</p>
              <p className="text-xs mt-1 text-cyan-600">Position the QR code within the camera view</p>
            </CardContent>
          </Card>
          
          {/* Camera permission prompt if no camera started */}
          {!cameraStarted && !error && (
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md">
              <Camera className="w-8 h-8 mr-2 text-cyan-600 animate-pulse" />
              <p className="text-cyan-800">Requesting camera access...</p>
            </div>
          )}
          
          {/* Scanner container */}
          <div id={scannerContainerId} className="relative overflow-hidden rounded-lg bg-white shadow-md min-h-[350px]">
            {/* Camera will be mounted here */}
          </div>
          
          {/* Scanner Controls */}
          <div className="flex justify-center mt-4">
            <Button onClick={stopScanner} variant="outline">
              Cancel Scanning
            </Button>
          </div>
        </>
      ) : scanResult?.success ? (
        /* Show results and form after successful scan - with green success styling */
        <Card className="border-green-500 bg-green-50">
          <CardContent className="p-6">
            {/* Success header with green check */}
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            <h3 className="mb-4 text-center text-xl font-semibold text-green-700">
              {scanResult.message}
            </h3>
            
            {/* Client information confirmation */}
            <div className="mb-6 rounded-md bg-white p-4 shadow-sm">
              <h4 className="mb-1 text-sm font-medium text-gray-500">Client</h4>
              <p className="text-xl font-semibold text-cyan-700">{scannedClientName}</p>
              {currentSessionId && (
                <p className="mt-1 text-sm text-gray-500">Session ID: {currentSessionId}</p>
              )}
            </div>
            
            {/* Notes field */}
            <div className="mb-6">
              <Label htmlFor="notes" className="mb-2 block text-sm font-medium">Notes (optional):</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this attendance"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] border-gray-300"
              />
            </div>
            
            {/* Submit and scan again buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Attendance'
                )}
              </Button>
              <Button 
                onClick={handleScanAnother}
                variant="outline" 
                className="flex-1"
                disabled={isSubmitting}
              >
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Show errors or default state */
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="mb-4 text-lg font-medium">QR Code Scanner</h3>
              <Button 
                onClick={handleScanAnother} 
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Start Scanning
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
