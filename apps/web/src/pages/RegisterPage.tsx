import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/lib/apiError';
import { useAuth } from '../features/auth/AuthContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (values: RegisterValues) => {
    setError('');
    try {
      await register(values.name, values.email, values.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Try a different email.'));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8 sm:py-10">
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-medium text-accent">DevBoard</p>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Start with private boards owned by your account.
          </p>
        </div>

        <Form {...form}>
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Form>

        <p className="mt-5 text-sm text-muted-foreground">
          Already registered?{' '}
          <Link className="font-medium text-foreground underline underline-offset-4" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
