import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-8 text-center text-2xl font-bold">Log In</h1>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
