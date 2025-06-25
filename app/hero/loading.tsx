:\Users\ojade\Downloads\traveltrouve-app (1)\app\hero\loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700">
      <div className="animate-pulse">
        <div className="h-8 bg-white/20 rounded w-64 mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-96 mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-80"></div>
      </div>
    </div>
  );
}