import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';

interface VideoBackgroundProps {
  videoSrcs: string[]; // Changed to array of video sources
  posterSrc?: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export function VideoBackground({
  videoSrcs,
  posterSrc,
  title,
  subtitle,
  ctaText = "Explore Our Adventures",
  onCtaClick
}: VideoBackgroundProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video end - move to next video
  const handleVideoEnd = useCallback(() => {
    const nextIndex = (currentVideoIndex + 1) % videoSrcs.length;
    setCurrentVideoIndex(nextIndex);
  }, [currentVideoIndex, videoSrcs.length]);

  // Auto-play next video when current one ends
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('ended', handleVideoEnd);
      return () => video.removeEventListener('ended', handleVideoEnd);
    }
  }, [handleVideoEnd]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <video
        key={currentVideoIndex} // Force re-render when video changes
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        poster={posterSrc}
        muted={isMuted}
        autoPlay
        playsInline
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={videoSrcs[currentVideoIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white max-w-4xl px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-white/90"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              size="lg"
              onClick={onCtaClick}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {ctaText}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Video Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute bottom-8 right-8 flex flex-col space-y-2"
      >
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={togglePlay}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={toggleMute}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Video Indicators */}
        <div className="flex space-x-1">
          {videoSrcs.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVideoIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentVideoIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Switch to video ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}