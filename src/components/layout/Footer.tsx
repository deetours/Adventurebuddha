import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="Adventure Buddha Logo"
                className="h-6 w-6"
              />
              <span className="text-xl font-bold">Adventure Buddha</span>
            </div>
            <p className="text-gray-300">
              Your trusted partner for unforgettable travel experiences across incredible destinations.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/trips" className="block text-gray-300 hover:text-primary transition-colors">
                Browse Trips
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/blog" className="block text-gray-300 hover:text-primary transition-colors">
                Travel Blog
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <div className="space-y-2">
              <Link to="/help" className="block text-gray-300 hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link to="/terms" className="block text-gray-300 hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="block text-gray-300 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refund" className="block text-gray-300 hover:text-primary transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-gray-300">+91 80734 65622</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-gray-300">adventurebuddha@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  1359/4 2nd Main, 3rd Cross Rd<br />
                  Yeswanthpur, Bengaluru
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © {currentYear} Adventure Buddha. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}