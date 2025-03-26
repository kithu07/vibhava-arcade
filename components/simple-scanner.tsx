"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SimpleScannerProps {
  onScan: (result: string) => void;
  onCancel: () => void;
}

export default function SimpleScanner({ onScan, onCancel }: SimpleScannerProps) {
  const [manualId, setManualId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let scanner: any = null;
    
    const initializeScanner = async () => {
      try {
        // First check if camera is available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoDevices = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasVideoDevices);
        
        if (!hasVideoDevices) {
          console.log("No camera devices found");
          return;
        }
        
        // Dynamically import the library
        const Html5QrcodeScanner = (await import('html5-qrcode')).Html5QrcodeScanner;
        
        // Create scanner with a fixed ID that already exists in the DOM
        scanner = new Html5QrcodeScanner(
          "qr-reader", 
          { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
          },
          false // Don't start scanning immediately
        );
        
        scannerRef.current = scanner;
        
        // Render the scanner UI
        scanner.render(
          (decodedText: string) => {
            console.log("QR Code detected:", decodedText);
            onScan(decodedText);
            if (scanner) {
              scanner.clear();
            }
          },
          (errorMessage: string) => {
            // Don't show transient errors to user
            console.log(errorMessage);
          }
        );
        
        setIsScanning(true);
      } catch (err) {
        console.error("Error initializing scanner:", err);
        setError("Failed to initialize camera scanner");
      }
    };
    
    if (qrBoxRef.current) {
      initializeScanner();
    }
    
    // Cleanup function
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error("Error cleaning up scanner:", err);
        }
      }
    };
  }, [onScan]);
  
  const handleManualSubmit = () => {
    if (manualId.trim()) {
      onScan(manualId.trim());
    } else {
      setError("Please enter a valid ID");
    }
  };
  
  return (
    <div className="space-y-4">
      {hasCamera ? (
        <div className="rounded-lg overflow-hidden bg-muted" ref={qrBoxRef}>
          <div id="qr-reader" style={{ width: '100%', minHeight: '250px' }}></div>
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Camera access not available</p>
        </div>
      )}
      
      <div className="pt-4 border-t border-border">
        <p className="text-sm font-medium mb-2">Or enter player ID manually:</p>
        <div className="flex space-x-2">
          <Input 
            placeholder="Enter player ID" 
            value={manualId} 
            onChange={(e) => setManualId(e.target.value)}
          />
          <Button onClick={handleManualSubmit}>Submit</Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-2 rounded flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
      
      <Button variant="outline" onClick={onCancel} className="w-full">
        Cancel
      </Button>
    </div>
  );
} 