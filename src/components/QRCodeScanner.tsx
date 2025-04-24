
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BrowserQRCodeReader } from '@zxing/browser';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Cleanup video stream when component unmounts
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);

      const codeReader = new BrowserQRCodeReader();
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      
      if (!videoInputDevices.length) {
        throw new Error('No camera found');
      }

      // Use the first available camera
      const selectedDeviceId = videoInputDevices[0].deviceId;
      
      const controls = await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            onScan(result.getText());
            controls.stop(); // Stop scanning after successful read
            setIsScanning(false);
          }
          if (error && error?.message !== 'No MultiFormat Readers were able to detect the code.') {
            setError('Failed to read QR code');
            onError?.(error);
          }
        }
      );

    } catch (error) {
      setError('Failed to start camera');
      setIsScanning(false);
      onError?.(error as Error);
      
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please make sure you have granted camera permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsScanning(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
          {isScanning ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">Camera preview will appear here</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <p className="text-destructive">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            variant={isScanning ? "destructive" : "default"}
            onClick={isScanning ? stopScanning : startScanning}
            className="gap-2"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Stop Scanning
              </>
            ) : (
              'Start Scanning'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
