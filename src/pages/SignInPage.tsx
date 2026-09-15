import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";

export function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { values, setValue, formError, isSubmitting, handleSubmit } = useForm({ email: "", password: "" });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    handleSubmit(async (v) => {
      await login(v);
      navigate("/");
    });
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" className="font-medium text-primary hover:text-primary-hover">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="email">
          <TextInput id="email" type="email" required value={values.email} onChange={(e) => setValue("email", e.target.value)} placeholder="you@business.com" />
        </Field>
        <Field label="Password" htmlFor="password">
          <TextInput id="password" type="password" required value={values.password} onChange={(e) => setValue("password", e.target.value)} placeholder="••••••••" />
        </Field>
        <ErrorText>{formError}</ErrorText>
        <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
