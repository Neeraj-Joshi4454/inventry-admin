'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FieldError, FieldLabel, Input } from '@/components/ui/Input';
import { useUpdateTenantMutation } from '@/hooks/useTenants';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api/client';
import type { Tenant } from '@/types/tenant';

const editBusinessSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  businessMobileNumber: z.string().min(6, 'Enter a valid mobile number'),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  gstNumber: z.string().optional(),
});

type EditBusinessValues = z.infer<typeof editBusinessSchema>;

export function EditBusinessDialog({
  open,
  onClose,
  tenant,
}: {
  open: boolean;
  onClose: () => void;
  tenant: Tenant;
}) {
  const toast = useToast();
  const updateTenant = useUpdateTenantMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditBusinessValues>({ resolver: zodResolver(editBusinessSchema) });

  useEffect(() => {
    if (open) {
      reset({
        businessName: tenant.businessName,
        ownerName: tenant.ownerName,
        businessMobileNumber: tenant.mobileNumber,
        email: tenant.email ?? '',
        gstNumber: tenant.gstNumber ?? '',
      });
    }
  }, [open, tenant, reset]);

  async function onSubmit(values: EditBusinessValues) {
    try {
      await updateTenant.mutateAsync({
        id: tenant._id,
        payload: { ...values, email: values.email || undefined },
      });
      toast.success('Business updated successfully');
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update business'));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit business" className="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="edit-businessName" required>
              Business Name
            </FieldLabel>
            <Input
              id="edit-businessName"
              error={!!errors.businessName}
              {...register('businessName')}
            />
            <FieldError message={errors.businessName?.message} />
          </div>
          <div>
            <FieldLabel htmlFor="edit-ownerName" required>
              Owner Name
            </FieldLabel>
            <Input id="edit-ownerName" error={!!errors.ownerName} {...register('ownerName')} />
            <FieldError message={errors.ownerName?.message} />
          </div>
          <div>
            <FieldLabel htmlFor="edit-mobile" required>
              Mobile Number
            </FieldLabel>
            <Input
              id="edit-mobile"
              error={!!errors.businessMobileNumber}
              {...register('businessMobileNumber')}
            />
            <FieldError message={errors.businessMobileNumber?.message} />
          </div>
          <div>
            <FieldLabel htmlFor="edit-email">Email</FieldLabel>
            <Input id="edit-email" type="email" error={!!errors.email} {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="edit-gst">GST Number</FieldLabel>
            <Input id="edit-gst" {...register('gstNumber')} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
