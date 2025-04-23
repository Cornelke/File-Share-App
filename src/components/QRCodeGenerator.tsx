
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

// This is a placeholder component that will be replaced when we add the QR code library
const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 200 
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
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
        {loading ? (
          <div 
            className="w-[200px] h-[200px] flex items-center justify-center bg-muted/30 rounded-lg"
          >
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="bg-white p-2 rounded-lg border">
            {/* Mock QR code display */}
            <div 
              className="w-[200px] h-[200px] bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-md flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">QR Code Placeholder</div>
                <div className="text-sm font-medium mb-2">Scan to connect</div>
                <div className="grid grid-cols-5 grid-rows-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-6 h-6 rounded-sm ${Math.random() > 0.7 ? 'bg-primary' : 'bg-transparent'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
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
