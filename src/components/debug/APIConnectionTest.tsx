import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { config } from '../../lib/config';
import { Card } from '../ui/card';

export default function APIConnectionTest() {
  const { 
    data: trips, 
    isLoading, 
    error,
    isSuccess
  } = useQuery({
    queryKey: ['trips-test'],
    queryFn: () => api.getTrips(),
    retry: 1
  });

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        API Connection Test
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm font-medium">API Base URL:</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {config.API_BASE_URL}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm font-medium">Using Mock API:</span>
          <span className={`text-sm font-medium ${
            config.USE_MOCK_API 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-green-600 dark:text-green-400'
          }`}>
            {config.USE_MOCK_API ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
            Connection Status
          </h3>
          
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Testing connection...</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <span className="font-medium">Connection Failed</span>
                <p className="text-sm mt-1">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
              </div>
            </div>
          )}
          
          {isSuccess && trips && Array.isArray(trips) && trips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Connection Successful</span>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                  <strong>Found {Array.isArray(trips) ? trips.length : 0} trips:</strong>
                </p>
                <div className="space-y-2">
                  {Array.isArray(trips) && trips.slice(0, 5).map((trip, index) => (
                    <div key={trip.id || index} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-green-900 dark:text-green-100">
                        {trip.title}
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        ₹{trip.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  {Array.isArray(trips) && trips.length > 5 && (
                    <p className="text-xs text-green-600 dark:text-green-400 italic">
                      ... and {trips.length - 5} more trips
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Sample Trip Data:
                </h4>
                <pre className="text-xs text-blue-800 dark:text-blue-200 overflow-x-auto">
                  {Array.isArray(trips) && trips.length > 0 ? JSON.stringify(trips[0], null, 2) : 'No trip data available'}
                </pre>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Raw API Response:
                </h4>
                <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
                  {JSON.stringify(trips, null, 2)}
                </pre>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Type: {Array.isArray(trips) ? 'Array' : typeof trips} | Length: {Array.isArray(trips) ? trips.length : 'N/A'}
                </p>
              </div>
            </motion.div>
          )}
          
          {isSuccess && (!trips || !Array.isArray(trips) || trips.length === 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-yellow-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">API Connected but No Data</span>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  The API responded successfully but returned no trip data or unexpected format.
                </p>
                <pre className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 overflow-x-auto">
                  Response: {JSON.stringify(trips, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
}