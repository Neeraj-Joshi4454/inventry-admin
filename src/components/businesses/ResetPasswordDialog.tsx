'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FieldError, FieldLabel, Input } from '@/components/ui/Input';
import { useResetUserPasswordMutation } from '@/hooks/useUsers';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api/client';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm the new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordDialog({
  open,
  onClose,
  userId,
  ownerName,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  ownerName: string;
}) {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const resetPassword = useResetUserPasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(values: ResetPasswordValues) {
    try {
      await resetPassword.mutateAsync({ id: userId, newPassword: values.newPassword });
      toast.success(`Password reset for ${ownerName}. Share the new password with them securely.`);
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reset password'));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Reset owner password"
      description={`Set a new temporary password for ${ownerName}. They'll be required to change it on next login.`}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <FieldLabel htmlFor="newPassword" required>
            New Password
          </FieldLabel>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              className="pr-10"
              error={!!errors.newPassword}
              {...register('newPassword')}
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
          <FieldError message={errors.newPassword?.message} />
        </div>

        <div>
          <FieldLabel htmlFor="confirmPassword" required>
            Confirm Password
          </FieldLabel>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            error={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Reset Password
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
