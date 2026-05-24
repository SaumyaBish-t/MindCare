import { SignIn } from "@clerk/clerk-react";
import AuthShell from "./AuthShell.jsx";

export default function SignInPage() {
  return (
    <AuthShell heading="Welcome back" sub="Pick up where you left off.">
      <SignIn signUpUrl="/get-started" afterSignInUrl="/dashboard" />
    </AuthShell>
  );
}
