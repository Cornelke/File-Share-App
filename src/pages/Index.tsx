
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Send, Download, Wifi, MoveRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <Logo size="lg" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-light-blue text-transparent bg-clip-text">
              Share Files Seamlessly <br className="hidden md:block" />
              Over WiFi
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transfer files between Windows and Android devices quickly without 
              cables or internet. Simply connect to the same WiFi network or hotspot.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/send">
                <Button size="lg" className="gap-2">
                  <Send size={18} />
                  Send Files
                </Button>
              </Link>
              
              <Link to="/receive">
                <Button size="lg" variant="outline" className="gap-2">
                  <Download size={18} />
                  Receive Files
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features */}
        <section className="py-12 px-6 bg-gradient-to-b from-white to-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Transfer Files with Ease
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-border/50 shadow-sm bg-white">
                <CardContent className="pt-6">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Wifi className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium text-center mb-2">
                    No Internet Required
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Transfer files over your local WiFi network or personal hotspot without internet access.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-border/50 shadow-sm bg-white">
                <CardContent className="pt-6">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium text-center mb-2">
                    Fast Transfer Speed
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Send files at maximum speed supported by your local network. No upload or download limits.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-border/50 shadow-sm bg-white">
                <CardContent className="pt-6">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Send className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium text-center mb-2">
                    Simple & Secure
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Intuitive interface makes sharing easy. All transfers stay on your local network for privacy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* How it works */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-10 w-10 rounded-full bg-brand-purple/20 flex items-center justify-center font-bold text-brand-purple">
                  1
                </div>
                <h3 className="text-xl font-medium mb-2">Connect Devices</h3>
                <p className="text-muted-foreground">
                  Ensure both devices are connected to the same WiFi network or hotspot.
                </p>
              </div>
              
              <div className="flex items-center justify-center text-muted-foreground">
                <MoveRight className="hidden md:block" size={24} />
                <div className="md:hidden h-px w-16 bg-muted-foreground/30"></div>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-10 w-10 rounded-full bg-brand-purple/20 flex items-center justify-center font-bold text-brand-purple">
                  2
                </div>
                <h3 className="text-xl font-medium mb-2">Choose Files</h3>
                <p className="text-muted-foreground">
                  Select files you want to send from your device.
                </p>
              </div>
              
              <div className="flex items-center justify-center text-muted-foreground">
                <div className="md:hidden h-px w-16 bg-muted-foreground/30"></div>
                <MoveRight className="hidden md:block" size={24} />
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-10 w-10 rounded-full bg-brand-purple/20 flex items-center justify-center font-bold text-brand-purple">
                  3
                </div>
                <h3 className="text-xl font-medium mb-2">Start Transfer</h3>
                <p className="text-muted-foreground">
                  Connect by scanning the QR code or entering the link and transfer files instantly.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 px-6 bg-gradient-to-br from-brand-purple/5 to-brand-blue/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transfer Files?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start sharing files between your devices with just a few clicks.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/send">
                <Button size="lg" className="gap-2">
                  <Send size={18} />
                  Start Sending Files
                </Button>
              </Link>
              
              <Link to="/receive">
                <Button size="lg" variant="outline" className="gap-2">
                  <Download size={18} />
                  Receive Files
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
