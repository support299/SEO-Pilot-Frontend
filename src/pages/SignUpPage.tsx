import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";

export function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { values, setValue, fieldErrors, formError, isSubmitting, handleSubmit } = useForm({
    email: "",
    password: "",
    full_name: "",
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    handleSubmit(async (v) => {
      await register(v);
      navigate("/");
    });
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your business's search performance"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/sign-in" className="font-medium text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Full name" htmlFor="full_name">
          <TextInput id="full_name" value={values.full_name} onChange={(e) => setValue("full_name", e.target.value)} placeholder="Jane Doe" />
        </Field>
        <Field label="Email" htmlFor="email">
          <TextInput id="email" type="email" required value={values.email} onChange={(e) => setValue("email", e.target.value)} placeholder="you@business.com" />
          <ErrorText>{fieldErrors.email}</ErrorText>
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 8 characters">
          <TextInput id="password" type="password" required minLength={8} value={values.password} onChange={(e) => setValue("password", e.target.value)} placeholder="••••••••" />
          <ErrorText>{fieldErrors.password}</ErrorText>
        </Field>
        <ErrorText>{formError}</ErrorText>
        <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
