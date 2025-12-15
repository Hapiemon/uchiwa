import { LoginForm } from '@/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        Uchiwa へようこそ
      </h1>
      <p className="text-center text-gray-600 mb-8">ログインして思い出を共有しましょう</p>
      <LoginForm />
      <p className="text-center text-sm text-gray-600 mt-6">
        アカウントをお持ちでない方?{' '}
        <Link href="/register" className="text-pastel-pink hover:underline font-semibold">
          こちら
        </Link>
      </p>
    </div>
  );
}
