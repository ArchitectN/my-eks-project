import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-sage-100 opacity-60" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-cream-200 opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-sage-50 opacity-40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        {/* Nav */}
        <nav className="flex items-center justify-between mb-24">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-600 rounded-2xl flex items-center justify-center text-white text-lg">
              🐾
            </div>
            <span className="font-display text-xl font-bold text-sage-900">PawDays</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-secondary text-sm py-2">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm py-2">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="text-center mb-20 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span>🌿</span> Trusted by 500+ pet families
          </div>
          <h1 className="font-display text-6xl md:text-7xl font-bold text-sage-900 leading-tight mb-6">
            Daycare your pets
            <br />
            <em className="text-sage-500 font-normal">will adore</em>
          </h1>
          <p className="text-sage-600 text-xl max-w-xl mx-auto mb-10 font-body leading-relaxed">
            Book safe, loving care for your companions with just a few clicks.
            Track their days, manage bookings, and never worry again.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-4">
              Book a spot today →
            </Link>
            <Link href="/auth/login" className="text-sage-600 font-medium hover:text-sage-800 transition-colors">
              I have an account
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { emoji: "🐶", title: "Multiple Pets", desc: "Add all your furry family members and manage them from one place." },
            { emoji: "📅", title: "Easy Booking", desc: "See available days at a glance and book in seconds — no phone calls needed." },
            { emoji: "🔒", title: "Secure & Private", desc: "Your pet's data is encrypted and only you can see it. Always." },
          ].map((f, i) => (
            <div
              key={f.title}
              className="card p-8"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="section-title mb-2">{f.title}</h3>
              <p className="text-sage-500 font-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center text-sage-400 text-sm font-body">
          © 2024 PawDays · Made with 🐾 for pets everywhere
        </footer>
      </div>
    </main>
  );
}
