'use client';

import { useActionState } from 'react';
import { signUp } from '@/lib/auth/actions';

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signUp, null);

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
          autoComplete="new-password"
          minLength={6}
          className="mt-1 block w-full bg-black border border-[rgba(214,235,253,0.19)] text-[#f0f0f0] placeholder:text-[#5c5c5c] rounded-[4px] px-3 py-2 focus:outline-none focus:border-[#3b9eff]"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-white text-black rounded-[9999px] font-medium py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}
