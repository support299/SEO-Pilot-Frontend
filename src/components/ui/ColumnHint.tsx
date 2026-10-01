import { useId } from "react";

export function ColumnHint({ label, hint }: { label: string; hint: string }) {
  const id = useId();

  return (
    <span tabIndex={0} aria-describedby={id} className="group relative inline-block cursor-help outline-none">
      <span className="underline decoration-dotted underline-offset-4">{label}</span>
      <span
        id={id}
        role="tooltip"
        className="invisible absolute top-full right-0 z-20 mt-2 w-56 rounded-lg bg-foreground px-3 py-2 text-left text-xs font-normal normal-case leading-5 tracking-normal text-white opacity-0 shadow-lg group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100"
      >
        {hint}
      </span>
    </span>
  );
}
