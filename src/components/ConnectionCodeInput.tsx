
import React from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent } from './ui/card';

interface ConnectionCodeInputProps {
  onComplete: (code: string) => void;
  loading?: boolean;
}

const ConnectionCodeInput: React.FC<ConnectionCodeInputProps> = ({
  onComplete,
  loading = false,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-4">
          <InputOTP
            maxLength={8}
            render={({ slots }) => (
              <InputOTPGroup className="gap-2">
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} />
                ))}
              </InputOTPGroup>
            )}
            disabled={loading}
            onComplete={onComplete}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionCodeInput;
