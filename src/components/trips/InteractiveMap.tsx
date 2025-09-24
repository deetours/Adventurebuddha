import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Destination {
  id: number;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  trips: number;
  region: string;
  description: string;
  image: string;
}

interface InteractiveMapProps {
  destinations: Destination[];
  selectedDestination?: number;
  onDestinationSelect: (destinationId: number | null) => void;
  className?: string;
}

export function InteractiveMap({
  destinations,
  selectedDestination,
  onDestinationSelect,
  className = ""
}: InteractiveMapProps) {
  const [zoom, setZoom] = useState(1);
  const [hoveredDestination, setHoveredDestination] = useState<number | null>(null);

  // India bounds for zoom limits
  const indiaBounds = {
    north: 37.6,
    south: 6.7,
    east: 97.4,
    west: 68.1
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));

  const handleDestinationClick = (destinationId: number) => {
    const destination = destinations.find(d => d.id === destinationId);
    if (destination) {
      setZoom(2);
      onDestinationSelect(destinationId);
    }
  };

  // Convert lat/lng to pixel coordinates (simplified projection)
  const latLngToPixel = (lat: number, lng: number) => {
    const x = ((lng - indiaBounds.west) / (indiaBounds.east - indiaBounds.west)) * 400;
    const y = ((indiaBounds.north - lat) / (indiaBounds.north - indiaBounds.south)) * 300;
    return [x, y];
  };

  return (
    <div className={`relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden ${className}`}>
      {/* Map Container */}
      <div className="relative h-96 bg-gradient-to-br from-blue-100 to-green-100">
        {/* Simplified India Map Background */}
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full"
          style={{ transform: `scale(${zoom}) translate(${(1 - zoom) * 200}px, ${(1 - zoom) * 150}px)` }}
        >
          {/* Simplified India outline */}
          <path
            d="M150 50 L180 45 L200 40 L220 45 L240 50 L250 60 L255 80 L250 100 L240 120 L230 140 L220 160 L210 180 L200 200 L190 220 L180 240 L170 250 L160 255 L150 250 L140 240 L130 220 L120 200 L110 180 L100 160 L90 140 L80 120 L75 100 L80 80 L90 60 L110 50 Z"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* Destination Markers */}
          {destinations.map((destination) => {
            const [x, y] = latLngToPixel(destination.coordinates[1], destination.coordinates[0]);
            const isSelected = selectedDestination === destination.id;
            const isHovered = hoveredDestination === destination.id;

            return (
              <g key={destination.id}>
                {/* Marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8 : isHovered ? 6 : 4}
                  fill={isSelected ? "#ea580c" : "#f97316"}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleDestinationClick(destination.id)}
                  onMouseEnter={() => setHoveredDestination(destination.id)}
                  onMouseLeave={() => setHoveredDestination(null)}
                />

                {/* Pulse effect for selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="2"
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}

                {/* Trip count indicator */}
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className="text-xs font-bold fill-gray-700"
                >
                  {destination.trips}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomIn}
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomOut}
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Destinations</span>
            </div>
            <div className="text-xs text-gray-500">
              ({destinations.length} locations)
            </div>
          </div>
        </div>
      </div>

      {/* Destination Details Panel */}
      <AnimatePresence>
        {selectedDestination && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg overflow-y-auto"
          >
            {(() => {
              const destination = destinations.find(d => d.id === selectedDestination);
              if (!destination) return null;

              return (
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
                      <p className="text-sm text-gray-600">{destination.region}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDestinationSelect(null)}
                      className="p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mb-4">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(destination.name)}&size=256&background=orange&color=white`;
                      }}
                    />
                  </div>

                  <p className="text-gray-700 text-sm mb-4">{destination.description}</p>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {destination.trips} trip{destination.trips !== 1 ? 's' : ''} available
                    </Badge>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Navigation className="w-4 h-4 mr-1" />
                      View Trips
                    </Button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}