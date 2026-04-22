import { RegisterForm } from '@/features/auth/register/ui/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Create account</h1>
        <RegisterForm />
      </div>
    </main>
  )
}
