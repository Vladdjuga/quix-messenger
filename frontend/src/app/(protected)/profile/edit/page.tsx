"use client";
import React from 'react';
import { useCurrentUser } from '@/lib/hooks/data/user/userHook';
import { api } from '@/app/api';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateUserDto } from '@/lib/dto/UpdateUserDto';

const editSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128).optional().or(z.literal('')),
});

type EditForm = z.infer<typeof editSchema>;

export default function EditProfilePage() {
  const { user, loading, setUser } = useCurrentUser();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: {
      username: user?.username ?? '',
      email: user?.email ?? '',
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0,10) : '',
      password: '',
    },
  });

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">You must be logged in.</div>;

  const onSubmit = async (data: EditForm) => {
    const dto = new UpdateUserDto({
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      password: data.password || undefined,
    });
    const resp = await api.user.update(dto);
    setUser(resp.data);
    // Redirect back to profile and indicate saved
    router.push('/profile?saved=1');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Profile</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input className="input-primary w-full" {...register('username')} />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="input-primary w-full" type="email" {...register('email')} />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">First name</label>
            <input className="input-primary w-full" {...register('firstName')} />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Last name</label>
            <input className="input-primary w-full" {...register('lastName')} />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Date of birth</label>
          <input className="input-primary w-full" type="date" {...register('dateOfBirth')} />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">New password (optional)</label>
          <input className="input-primary w-full" type="password" placeholder="Leave blank to keep current" {...register('password')} />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div className="flex gap-3">
          <button className="btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save changes'}</button>
          <button type="button" className="btn-secondary" onClick={() => router.back()} disabled={isSubmitting}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
