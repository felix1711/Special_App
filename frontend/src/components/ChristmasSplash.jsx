import { useEffect } from "react";

export default function ChristmasSplash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    },3800); // 3.8 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center
                    bg-gradient-to-br from-red-600 via-red-500 to-green-600
                    text-white overflow-hidden">

      {/* Snow animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <span
            key={i}
            className="absolute top-0 text-white animate-snow"
            style={{
              left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 2 + "s",
              fontSize: Math.random() * 12 + 10
            }}
          >
            ❄
          </span>
        ))}
      </div>

      {/* Tree */}
      <div className="text-7xl mb-6 animate-bounce">🎄</div>

      {/* Text */}
      <h1 className="text-3xl font-bold tracking-wide animate-fade-in">
        Merry Christmas
      </h1>

      <p className="mt-2 text-lg italic animate-fade-in-delay">
        Simmi Love 💜
      </p>
    </div>
  );
}
