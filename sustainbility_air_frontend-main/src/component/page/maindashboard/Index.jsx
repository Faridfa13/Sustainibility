import { useNavigate } from "react-router-dom";
import { startTransition } from "react";

export default function MainDashboardIndex() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    startTransition(() => {
      navigate(path);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black text-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-shadow-md">Main Dashboard</h1>
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            className="bg-blue-500 text-black p-5 text-lg font-semibold rounded-xl w-full transition transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            onClick={() => handleNavigation("/beranda-air")}
          >
            🌊 Beranda Sustainability Air
          </button>
          <button
            className="bg-green-500 text-black p-5 text-lg font-semibold rounded-xl w-full transition transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            onClick={() => handleNavigation("/")}
          >
            ⚡ Beranda Sustainability Listrik
          </button>
          <button
            className="bg-yellow-500 text-black p-5 text-lg font-semibold rounded-xl w-full transition transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            onClick={() => handleNavigation("/*")}
          >
            🛠️ K3L Kecelakaan Kerja & Lalu Lintas
          </button>
        </main>
        
      </div>
    </div>
  );
}