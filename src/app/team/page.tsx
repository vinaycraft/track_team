'use client';

import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  role: string;
}

export default function TeamDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      const teamMembers = data.filter((u: User) => u.role === 'team');
      setUsers(teamMembers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load team members');
    }
  };

  const startSharing = async () => {
    if (!selectedUser) return;

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
        sendLocation(selectedUser.id, latitude, longitude);
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
    if (!isSharing || !selectedUser) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ lat: latitude, lng: longitude, accuracy });
        sendLocation(selectedUser.id, latitude, longitude);
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
  }, [isSharing, selectedUser]);

  const stopSharing = () => {
    setIsSharing(false);
    setLocation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">PR Team Location Tracker</h1>
          <p className="text-sm text-gray-600 mt-1">Team Member - Share Your Location</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {!selectedUser ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Profile</h2>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No team members found</p>
                  <a
                    href="/create-user"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Team Member
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">Team Member</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedUser.name}
                  </h2>
                  <p className="text-sm text-gray-500">Team Member</p>
                </div>
                {!isSharing && (
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Change User
                  </button>
                )}
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
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">How it works</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Select your profile from the list above</li>
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
