import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";
import { useForm } from "@/hooks/useForm";

export function WordPressConnectForm({ onConnect }: { onConnect: (input: { website_url: string; username: string; application_password: string }) => Promise<void> }) {
  const { values, setValue, fieldErrors, formError, isSubmitting, handleSubmit } = useForm({
    website_url: "",
    username: "",
    application_password: "",
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    handleSubmit(async (v) => onConnect(v));
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Website URL" htmlFor="wp-url">
        <TextInput id="wp-url" required value={values.website_url} onChange={(e) => setValue("website_url", e.target.value)} placeholder="https://example.com" />
        <ErrorText>{fieldErrors.website_url}</ErrorText>
      </Field>
      <Field label="WordPress username" htmlFor="wp-username">
        <TextInput id="wp-username" required value={values.username} onChange={(e) => setValue("username", e.target.value)} placeholder="admin" />
        <ErrorText>{fieldErrors.username}</ErrorText>
      </Field>
      <Field
        label="Application password"
        htmlFor="wp-app-password"
        hint="Generate one from WordPress: Users → Profile → Application Passwords. Not your login password."
      >
        <TextInput
          id="wp-app-password"
          required
          type="password"
          value={values.application_password}
          onChange={(e) => setValue("application_password", e.target.value)}
          placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
        />
        <ErrorText>{fieldErrors.application_password}</ErrorText>
      </Field>
      <ErrorText>{formError}</ErrorText>
      <Button type="submit" loading={isSubmitting} className="w-full">
        Connect WordPress
      </Button>
    </form>
  );
}
