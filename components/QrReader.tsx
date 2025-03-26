"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface QrReaderProps {
  onResult: (result: string) => void;
  onCancel: () => void;
}

export default function QrReader({ onResult, onCancel }: QrReaderProps) {
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setError('Please enter a player ID');
      return;
    }
    
    onResult(manualInput.trim());
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-muted rounded-lg p-6 text-center">
        <p className="mb-4">Camera access is currently not available.</p>
        <p className="text-sm text-muted-foreground">Please enter the player ID manually.</p>
      </div>
      
      <div className="pt-4">
        <p className="text-sm font-medium mb-2">Enter player ID:</p>
        <div className="flex space-x-2">
          <Input 
            placeholder="Enter player ID" 
            value={manualInput} 
            onChange={(e) => setManualInput(e.target.value)}
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