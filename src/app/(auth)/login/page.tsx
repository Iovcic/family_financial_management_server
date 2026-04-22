import { LoginForm } from '@/features/auth/login/ui/LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  )
}
