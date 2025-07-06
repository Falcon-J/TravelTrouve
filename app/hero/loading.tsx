
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="animate-pulse">
        <div className="h-8 bg-white/20 rounded w-64 mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-96 mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-80"></div>
      </div>
    </div>
  );
}