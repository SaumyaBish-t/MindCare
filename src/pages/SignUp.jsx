import { SignUp } from "@clerk/clerk-react";
import AuthShell from "./AuthShell.jsx";

export default function SignUpPage() {
  return (
    <AuthShell heading="Create your account" sub="Begin gently — you can change anything later.">
      <SignUp signInUrl="/login" afterSignUpUrl="/dashboard" />
    </AuthShell>
  );
}
