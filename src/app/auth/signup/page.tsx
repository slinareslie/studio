import AuthForm from '@/components/auth/auth-form';

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <AuthForm isSignUp />
    </div>
  );
}
