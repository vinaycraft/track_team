'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  role: string;
}

export default function TeamDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'team') {
      router.push('/admin');
      return;
    }

    setCurrentUser(parsedUser);
  }, [router]);

  const startSharing = async () => {
    if (!currentUser) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsSharing(true);
    setError(null);

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ lat: latitude, lng: longitude, accuracy });
        sendLocation(currentUser.id, latitude, longitude);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setIsSharing(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const sendLocation = async (userId: number, lat: number, lng: number) => {
    try {
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, latitude: lat, longitude: lng }),
      });
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };

  useEffect(() => {
    if (!isSharing || !currentUser) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ lat: latitude, lng: longitude, accuracy });
        sendLocation(currentUser.id, latitude, longitude);
      },
      (err) => {
        setError('Location tracking error. Please check your permissions.');
        setIsSharing(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isSharing, currentUser]);

  const stopSharing = () => {
    setIsSharing(false);
    setLocation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PR Team Location Tracker</h1>
            <p className="text-sm text-gray-600 mt-1">Team Member - Share Your Location</p>
          </div>
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentUser?.name}
              </h2>
              <p className="text-sm text-gray-500">Team Member</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!isSharing ? (
            <button
              onClick={startSharing}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Start Sharing Location
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                  <p className="text-green-800 font-medium">Location Sharing Active</p>
                </div>
              </div>

              {location && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 mb-2">Current Location:</p>
                  <p className="font-mono text-sm">
                    Lat: {location.lat.toFixed(6)}
                  </p>
                  <p className="font-mono text-sm">
                    Lng: {location.lng.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Accuracy: ±{location.accuracy.toFixed(0)} meters
                  </p>
                </div>
              )}

              <button
                onClick={stopSharing}
                className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Stop Sharing
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">How it works</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click "Start Sharing Location" to begin tracking</li>
            <li>• Your location will update every 10 seconds</li>
            <li>• Admin can view your live location on the dashboard</li>
            <li>• Click "Stop Sharing" when you're done</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
