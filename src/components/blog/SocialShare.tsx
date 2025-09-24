import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Facebook, Twitter, Instagram, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface SocialShareProps {
  title: string;
  url: string;
  hashtags?: string[];
}

export function SocialShare({ title, url, hashtags = [] }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = encodeURIComponent(title);
  const shareHashtags = hashtags.join(',');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}&hashtags=${shareHashtags}`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`, // Instagram doesn't support direct sharing
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-10"
          >
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.open(shareLinks.facebook, '_blank')}
              >
                <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                Facebook
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.open(shareLinks.twitter, '_blank')}
              >
                <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                Twitter
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.open(shareLinks.instagram, '_blank')}
              >
                <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                Instagram
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}