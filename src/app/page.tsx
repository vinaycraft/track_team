
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PR Team Location Tracker</h1>
          <p className="text-lg text-gray-600">Real-time location tracking for your PR team</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">Admin Dashboard</h2>
            <p className="text-gray-600 mb-6 text-center">View live locations of all team members on an interactive map</p>
            <a
              href="/admin"
              className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center transition-colors"
            >
              Go to Admin Dashboard
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">Team Member</h2>
            <p className="text-gray-600 mb-6 text-center">Share your real-time location with the admin</p>
            <a
              href="/team"
              className="block w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-center transition-colors"
            >
              Share My Location
            </a>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Simple • Secure • Real-time</p>
        </div>
      </div>
    </div>
  );
}
