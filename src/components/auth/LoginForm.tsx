'use client';

import { useActionState } from 'react';
import { signIn, signInWithGoogle } from '@/lib/auth/actions';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, null);

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-[rgba(255,32,71,0.15)] border border-[rgba(255,32,71,0.3)] text-[#ff2047] rounded-[4px] p-3 text-sm">
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm text-[#a1a4a5]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full bg-black border border-[rgba(214,235,253,0.19)] text-[#f0f0f0] placeholder:text-[#5c5c5c] rounded-[4px] px-3 py-2 focus:outline-none focus:border-[#3b9eff]"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm text-[#a1a4a5]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full bg-black border border-[rgba(214,235,253,0.19)] text-[#f0f0f0] placeholder:text-[#5c5c5c] rounded-[4px] px-3 py-2 focus:outline-none focus:border-[#3b9eff]"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-white text-black rounded-[9999px] font-medium py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Signing in...' : 'Log In'}
      </button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[rgba(214,235,253,0.19)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-black px-2 text-[#464a4d]">or</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center gap-2 bg-transparent border border-[rgba(214,235,253,0.19)] text-[#f0f0f0] rounded-[9999px] px-4 py-2 text-sm font-medium hover:bg-[rgba(255,255,255,0.08)]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
