
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Connect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    
    if (!code) {
      toast({
        title: "Invalid connection",
        description: "No connection code provided. Please try again.",
        variant: "destructive",
      });
      navigate('/receive');
      return;
    }
    
    // Store the code in session storage
    sessionStorage.setItem('connectionCode', code);
    
    // Redirect to receive page after a short delay
    const timer = setTimeout(() => {
      navigate('/receive');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate, toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Connecting...</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Establishing secure connection...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connect;
