'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminApprovals() {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchPendingUsers();
  }, [router]);

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/auth/approve');
      const data = await response.json();
      setPendingUsers(data);
    } catch (error) {
      setError('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      if (response.ok) {
        // Refresh the list
        fetchPendingUsers();
      }
    } catch (error) {
      setError('Failed to update user status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PR Team Location Tracker</h1>
            <p className="text-sm text-gray-600 mt-1">Admin - User Approvals</p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </a>
            <button
              onClick={handleLogout}
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
            <h2 className="text-lg font-semibold text-gray-900">Pending Registrations</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending registrations
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproval(user.id, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(user.id, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
