import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-8 text-center text-2xl font-bold">Sign Up</h1>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account yet?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
