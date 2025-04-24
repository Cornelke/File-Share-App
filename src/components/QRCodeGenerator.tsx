
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  logoSize?: number;
  bgColor?: string;
  fgColor?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 200,
  logoSize = 40,
  bgColor = "#FFFFFF",
  fgColor = "#000000"
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    
    toast({
      title: "Link copied!",
      description: "The connection link has been copied to your clipboard."
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card className="border border-border shadow-md">
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="bg-white p-3 rounded-lg shadow-inner border-2 border-gray-100">
          <QRCodeSVG
            value={value}
            size={size}
            level="H" // Highest error correction level
            includeMargin={true}
            bgColor={bgColor}
            fgColor={fgColor}
            imageSettings={{
              src: "/icon-192.png",
              x: undefined,
              y: undefined,
              height: logoSize,
              width: logoSize,
              excavate: true,
            }}
          />
        </div>
        
        <div className="w-full flex items-center gap-2">
          <code className="flex-1 bg-muted p-2 rounded text-xs sm:text-sm text-muted-foreground truncate">
            {value}
          </code>
          <Button 
            size="icon" 
            variant="outline" 
            onClick={handleCopy}
            className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
