'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
});

interface TeamLocation {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  updated_at: string;
  name: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [locations, setLocations] = useState<TeamLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'admin') {
      router.push('/team');
      return;
    }

    fetchLocations();

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchLocations, 10000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PR Team Location Tracker</h1>
            <p className="text-sm text-gray-600 mt-1">Admin Dashboard - Live Team Locations</p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/admin/approvals" className="text-sm text-gray-600 hover:text-gray-900">
              Approvals
            </a>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Team Locations</h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Live
                </span>
                <span className="text-sm text-gray-500">
                  {locations.length} {locations.length === 1 ? 'member' : 'members'} tracked
                </span>
              </div>
            </div>
          </div>
          
          <div className="h-[600px] relative">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">Loading locations...</div>
              </div>
            ) : locations.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">No team members sharing location yet</div>
              </div>
            ) : (
              <Map locations={locations} />
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {locations.map((location) => (
              <div key={location.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{location.name}</p>
                  <p className="text-sm text-gray-500">
                    Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{location.role}</p>
                  <p className="text-xs text-gray-400">
                    Updated: {new Date(location.updated_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {locations.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No team members currently sharing location
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
