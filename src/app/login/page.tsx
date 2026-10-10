'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Warehouse, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { getApiErrorMessage } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { FieldError, FieldLabel, Input } from '@/components/ui/Input';

const loginSchema = z.object({
  mobileNumber: z.string().min(6, 'Enter your mobile number'),
  password: z.string().min(1, 'Enter your password'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, status } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values.mobileNumber, values.password);
      router.replace('/dashboard');
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to log in. Please try again.'));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
            <Warehouse className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Inventry Super Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your platform</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {formError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="mb-4">
              <FieldLabel htmlFor="mobileNumber" required>
                Mobile Number
              </FieldLabel>
              <Input
                id="mobileNumber"
                type="tel"
                inputMode="tel"
                autoComplete="username"
                placeholder="9876543210"
                error={!!errors.mobileNumber}
                {...register('mobileNumber')}
              />
              <FieldError message={errors.mobileNumber?.message} />
            </div>

            <div className="mb-6">
              <FieldLabel htmlFor="password" required>
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  error={!!errors.password}
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
