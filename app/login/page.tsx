'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { Wallet, PieChart, ShieldCheck, Sparkles } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase/client';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

const FEATURES = [
  { icon: Wallet, label: 'Track every wallet in one place' },
  { icon: PieChart, label: 'Visual budgets, reports & trends' },
  { icon: ShieldCheck, label: 'Private — only you see your data' },
];

export default function LoginPage() {
  const router = useRouter();
  const status = useAppSelector((s) => s.auth.status);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        toast.error('Sign-in failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-background">
      {/* ── Decorative gradient mesh backdrop ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full blur-[110px] opacity-60 dark:opacity-40"
          style={{ background: 'radial-gradient(circle, hsl(var(--apple-blue)) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-16 w-[460px] h-[460px] rounded-full blur-[120px] opacity-50 dark:opacity-35"
          style={{ background: 'radial-gradient(circle, hsl(var(--apple-indigo)) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[280px] h-[280px] rounded-full blur-[100px] opacity-40 dark:opacity-25"
          style={{ background: 'radial-gradient(circle, hsl(var(--apple-teal)) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-spring-in">
        {/* ── Logo mark ── */}
        <div className="flex justify-center mb-7">
          <div
            className={cn(
              'relative w-16 h-16 rounded-[22px] flex items-center justify-center',
              'bg-gradient-to-br from-primary to-[hsl(var(--apple-indigo))]',
              'shadow-[0_8px_32px_rgba(0,122,255,0.4)]'
            )}
          >
            <div className="absolute inset-0 rounded-[22px] bg-primary/40 blur-xl -z-10" />
            <Wallet size={28} className="text-white" strokeWidth={2.2} />
          </div>
        </div>

        {/* ── Card ── */}
        <div
          className={cn(
            'rounded-[28px] p-8 text-center',
            'bg-white/70 dark:bg-white/[0.06]',
            'backdrop-blur-2xl backdrop-saturate-150',
            'border border-white/60 dark:border-white/10',
            'shadow-[0_8px_40px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)]',
            'dark:shadow-[0_8px_40px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]'
          )}
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold mb-4">
            <Sparkles size={11} /> Personal Finance, Simplified
          </div>

          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            Welcome to FinFlow
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sign in to track your money with clarity.
          </p>

          {/* ── Google Sign-in button (Google brand style) ── */}
          <button
            type="button"
            disabled={signingIn}
            onClick={handleSignIn}
            className={cn(
              'w-full mt-7 h-12 rounded-2xl flex items-center justify-center gap-3',
              'bg-white text-[#1F1F1F] font-semibold text-[15px]',
              'border border-black/10',
              'shadow-[0_2px_8px_rgba(0,0,0,0.12)]',
              'transition-all duration-150 active:scale-[0.97]',
              'hover:shadow-[0_4px_16px_rgba(0,0,0,0.16)]',
              'disabled:opacity-60 disabled:pointer-events-none'
            )}
          >
            <GoogleIcon />
            {signingIn ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* ── Feature highlights ── */}
          <div className="mt-7 pt-6 border-t border-black/6 dark:border-white/8 space-y-3 text-left">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 flex-shrink-0">
                  <Icon size={13} className="text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/70 mt-6">
          Your data stays private to your account.
        </p>
      </div>
    </div>
  );
}
