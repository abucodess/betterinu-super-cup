import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy, ArrowRight, Settings, ShieldCheck, Activity, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#B8F34A]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#B8F34A]/5 blur-[120px] pointer-events-none" />

      {/* Top Bar with Options/Settings for Management Access */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#141414] border border-[#303030] flex items-center justify-center text-[#B8F34A]">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-base sm:text-lg block leading-tight">
              IFL PLATFORM
            </span>
            <span className="text-[11px] text-[#9AA69B] uppercase tracking-wider block leading-tight">
              Institute Football League
            </span>
          </div>
        </div>

        {/* Discreet Management Entry Point */}
        <Link
          to="/login"
          title="Management Login"
          className="h-11 w-11 rounded-xl bg-[#141414] border border-[#303030] flex items-center justify-center text-[#9AA69B] hover:text-[#B8F34A] hover:border-[#B8F34A]/50 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 max-w-3xl mx-auto my-auto text-center py-12 px-4">
        <Badge variant="brand" className="mb-6 px-3.5 py-1 text-xs">
          OFFICIAL TOURNAMENT PLATFORM
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F4F7F2] leading-tight sm:leading-none mb-6">
          The Premier Institute <br />
          <span className="text-[#B8F34A]">Football Experience</span>
        </h1>

        <p className="text-base sm:text-lg text-[#9AA69B] max-w-xl mx-auto mb-10 leading-relaxed">
          Follow live matches with real-time scoreboards, official fixture schedules, dual spin-wheel player drafting, and authoritative league standings.
        </p>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 text-base font-bold shadow-lg shadow-[#B8F34A]/10"
            onClick={() => navigate('/public')}
          >
            <span>Continue to Tournament</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => navigate('/login')}
          >
            <ShieldCheck className="h-4 w-4 mr-2 text-[#9AA69B]" />
            <span>Staff Login</span>
          </Button>
        </div>

        {/* Tournament Highlights Badges */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-16 max-w-lg mx-auto pt-8 border-t border-[#202020]">
          <div className="text-center">
            <span className="text-xl sm:text-2xl font-bold text-[#F4F7F2] tabular-nums block">3</span>
            <span className="text-[11px] text-[#9AA69B] uppercase tracking-wider">Teams</span>
          </div>
          <div className="text-center">
            <span className="text-xl sm:text-2xl font-bold text-[#F4F7F2] tabular-nums block">15</span>
            <span className="text-[11px] text-[#9AA69B] uppercase tracking-wider">Players</span>
          </div>
          <div className="text-center">
            <span className="text-xl sm:text-2xl font-bold text-[#B8F34A] tabular-nums block">Live</span>
            <span className="text-[11px] text-[#9AA69B] uppercase tracking-wider">Realtime</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-[#9AA69B] max-w-6xl mx-auto w-full pt-6">
        <p>© 2026 Institute Football League Platform. Built with React & Supabase.</p>
      </footer>
    </div>
  )
}

