'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FieldError, FieldLabel, Input } from '@/components/ui/Input';
import { useCreateTenantMutation } from '@/hooks/useTenants';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api/client';

// Frontend validation is a UX convenience only — the backend re-validates
// (and normalizes the mobile number / enforces the real password policy)
// authoritatively; see docs on the backend for the canonical rules.
const createBusinessSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  mobileNumber: z.string().min(10, 'Enter a valid 10-digit mobile number'),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type CreateBusinessValues = z.infer<typeof createBusinessSchema>;

export default function NewBusinessPage() {
  const router = useRouter();
  const toast = useToast();
  const createTenant = useCreateTenantMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateBusinessValues>({ resolver: zodResolver(createBusinessSchema) });

  async function onSubmit(values: CreateBusinessValues) {
    try {
      // The same mobile number is used both as the business's contact
      // number and the owner's login credential — the form only collects
      // one, since in practice they're the same person/number for a new
      // business's first account. tenantId is never sent: the backend
      // derives and creates it (createTenantWithOwner), the frontend never
      // decides it.
      await createTenant.mutateAsync({
        businessName: values.businessName,
        ownerName: values.ownerName,
        businessMobileNumber: values.mobileNumber,
        email: values.email || undefined,
        adminUser: {
          name: values.ownerName,
          mobileNumber: values.mobileNumber,
          password: values.password,
        },
      });
      toast.success('Business created successfully');
      router.push('/businesses');
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach((fe) => {
          if (fe.field && fe.field in ({} as CreateBusinessValues)) {
            setError(fe.field as keyof CreateBusinessValues, { message: fe.message });
          }
        });
      }
      toast.error(getApiErrorMessage(error, 'Failed to create business'));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/businesses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Businesses
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create Business</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <FieldLabel htmlFor="businessName" required>
                Business Name
              </FieldLabel>
              <Input
                id="businessName"
                placeholder="e.g. Sharma Building Materials"
                error={!!errors.businessName}
                {...register('businessName')}
              />
              <FieldError message={errors.businessName?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="ownerName" required>
                Owner Name
              </FieldLabel>
              <Input
                id="ownerName"
                placeholder="e.g. Rakesh Sharma"
                error={!!errors.ownerName}
                {...register('ownerName')}
              />
              <FieldError message={errors.ownerName?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="mobileNumber" required>
                Mobile Number
              </FieldLabel>
              <Input
                id="mobileNumber"
                type="tel"
                inputMode="tel"
                placeholder="9876543210"
                error={!!errors.mobileNumber}
                {...register('mobileNumber')}
              />
              <FieldError message={errors.mobileNumber?.message} />
              <p className="mt-1 text-xs text-slate-400">
                Used as both the business contact number and the owner&apos;s login.
              </p>
            </div>

            <div>
              <FieldLabel htmlFor="email">Email (optional)</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="owner@business.com"
                error={!!errors.email}
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="password" required>
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set an initial password for the owner"
                  className="pr-10"
                  error={!!errors.password}
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
              <p className="mt-1 text-xs text-slate-400">
                The owner will be asked to change this on first login.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/businesses">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                Create Business
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
