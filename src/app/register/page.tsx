import { RegisterForm } from "@/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        登録
      </h1>
      <p className="text-center text-gray-600 mb-8">
        ラブラブ思い出づくりを始めましょう
      </p>
      <RegisterForm />
      <p className="text-center text-sm text-gray-600 mt-6">
        既にアカウントをお持ちですか?{" "}
        <Link
          href="/login"
          className="text-pastel-pink hover:underline font-semibold"
        >
          ログイン
        </Link>
      </p>
    </div>
  );
}
