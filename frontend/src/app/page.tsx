
import Link from 'next/link';

export default function Home() {
    console.log("SOCKET_URL:", process.env.NEXT_PUBLIC_SOCKET_URL);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quix Messenger
          </h1>
          <p className="text-gray-600 mb-8">
            Connect with friends and colleagues
          </p>
          
          <div className="space-y-4">
            <Link
              href="/chat"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors block"
            >
              Open Chat
            </Link>
            
            <Link
              href="/login"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors block"
            >
              Login
            </Link>
            
            <Link
              href="/register"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors block"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
