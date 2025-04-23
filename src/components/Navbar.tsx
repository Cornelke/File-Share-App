
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Send, Download } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b">
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <Logo />
      </Link>
      
      <div className="flex items-center gap-4">
        <Link to="/send">
          <Button variant="ghost" className="gap-2">
            <Send size={18} />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </Link>
        <Link to="/receive">
          <Button variant="default" className="gap-2">
            <Download size={18} />
            <span className="hidden sm:inline">Receive</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
