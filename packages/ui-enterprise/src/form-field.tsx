"use client";

import type { ReactNode } from "react";
import type { ControllerRenderProps, FieldPath, FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";

export interface FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
  extends UseControllerProps<TFieldValues, TName> {
  label: string;
  children: (props: {
    field: ControllerRenderProps<TFieldValues, TName>;
    error?: string;
  }) => ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ label, children, ...controllerProps }: FormFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController(controllerProps);
  const error = fieldState.error?.message;

  return (
    <div className="space-y-1.5">
      <label htmlFor={field.name} className="block text-sm font-medium text-text-secondary">
        {label}
      </label>
      {children({ field, error })}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
