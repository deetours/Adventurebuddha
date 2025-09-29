import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { config } from '../lib/config';
import type { Trip } from '../lib/types';

export default function TestApiPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testApi() {
      try {
        console.log('🧪 Testing API connection...');
        console.log('API URL:', config.API_BASE_URL);
        
        setLoading(true);
        const result = await apiClient.getTrips();
        
        console.log('✅ API Test Result:', result);
        setTrips(result);
        setError(null);
      } catch (err) {
        console.error('❌ API Test Failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    testApi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2">
            <p><strong>API Base URL:</strong> {config.API_BASE_URL}</p>
            <p><strong>Fallback URL:</strong> {config.FALLBACK_API_URL}</p>
            <p><strong>VM URL:</strong> {config.VM_API_URL}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Response</h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading trips...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          {!loading && !error && (
            <div>
              <p className="mb-4"><strong>Trips loaded:</strong> {trips.length}</p>
              
              {trips.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">First Trip:</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(trips[0], null, 2)}
                  </pre>
                  
                  <h3 className="text-lg font-medium">All Trip Titles:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {trips.map((trip, index) => (
                      <li key={index}>
                        <strong>{trip.title}</strong> - ${trip.price} ({trip.featured_status || 'none'})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}