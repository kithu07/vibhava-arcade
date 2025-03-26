"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Define the prop types explicitly
interface QRScannerProps {
  onScan: (result: string) => void;
  onError: (error: Error) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [QrScanner, setQrScanner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only import the scanner component on the client side
    const loadScanner = async () => {
      try {
        const QrScannerModule = await import("@yudiel/react-qr-scanner");
        setQrScanner(() => QrScannerModule.QrScanner);
      } catch (error) {
        console.error("Failed to load QR scanner:", error);
        onError(error instanceof Error ? error : new Error("Failed to load QR scanner"));
      } finally {
        setIsLoading(false);
      }
    };

    loadScanner();
  }, [onError]);

  if (isLoading) {
    return <Skeleton className="w-full h-64" />;
  }

  if (!QrScanner) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-muted">
        <p className="text-sm text-muted-foreground">Camera not available</p>
      </div>
    );
  }

  // Handle the decode event and convert it to our onScan callback
  const handleDecode = (result: string) => {
    console.log("QR code decoded:", result);
    onScan(result);
  };

  return (
    <div style={{ height: "260px", position: "relative" }}>
      <QrScanner
        onDecode={handleDecode}
        onError={onError}
      />
    </div>
  );
}