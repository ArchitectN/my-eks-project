export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cream-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-sage-100 opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-cream-200 opacity-60 translate-y-1/2 -translate-x-1/2" />
      </div>
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="flex justify-center mb-8">
          <a href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sage-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
              🐾
            </div>
            <span className="font-display text-2xl font-bold text-sage-900">PawDays</span>
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
