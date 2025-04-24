
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 200 
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
    <Card className="border border-border bg-white shadow-md">
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="bg-white p-2 rounded-lg border">
          <QRCodeSVG
            value={value}
            size={size}
            level="H"
            includeMargin
            imageSettings={{
              src: "/icon-192.png",
              x: undefined,
              y: undefined,
              height: 40,
              width: 40,
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
