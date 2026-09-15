import { useState } from "react";
import { ApiError } from "@/types/api";

/**
 * Small, dependency-free form state helper — one place that owns
 * values/field-errors/submitting state and know how to unpack a backend
 * validation error (common/exceptions.py's `{error: {details: {field: [...]}}}`
 * shape) into per-field messages, instead of every form re-implementing this.
 */
export function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setValue<K extends keyof T>(key: K, value: T[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(submitFn: (values: T) => Promise<void>) {
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await submitFn(values);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.details) {
          const mapped: Partial<Record<keyof T, string>> = {};
          for (const [key, messages] of Object.entries(error.details)) {
            mapped[key as keyof T] = messages[0];
          }
          setFieldErrors(mapped);
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return { values, setValue, fieldErrors, formError, isSubmitting, handleSubmit };
}
