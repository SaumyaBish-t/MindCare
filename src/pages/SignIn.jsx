import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
    return (
  <main className="flex h-screen items-center justify-center p-3">
      <SignIn />
    </main>
    )
}