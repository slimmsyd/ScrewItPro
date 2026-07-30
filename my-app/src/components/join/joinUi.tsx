"use client";

import { useState, type CSSProperties } from "react";

export function GoogleMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export const socialBtn: CSSProperties = {
  width: "100%",
  height: 50,
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--gray-200)",
  background: "var(--white)",
  color: "var(--ink-900)",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
};

export const fieldStyle = (hasError: boolean): CSSProperties => ({
  width: "100%",
  height: 50,
  borderRadius: "var(--radius-md)",
  border: `1px solid ${hasError ? "var(--status-error)" : "var(--gray-200)"}`,
  padding: "0 14px",
  fontFamily: "var(--font-body)",
  fontSize: 15.5,
  color: "var(--ink-900)",
  outline: "none",
  boxSizing: "border-box",
});

export const passwordInputStyle = (hasError: boolean): CSSProperties => ({
  ...fieldStyle(hasError),
  paddingRight: 48,
});

export const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-body)",
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--ink-700)",
  marginBottom: 8,
  marginTop: 14,
};

function EyeOpenIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.5 10.6a2.75 2.75 0 003.9 3.9M9.4 5.1A10.4 10.4 0 0112 4.75c6 0 9.75 7.25 9.75 7.25a17.7 17.7 0 01-3.2 4.1M6.4 6.5A17.5 17.5 0 002.25 12S6 18.75 12 18.75c1.2 0 2.33-.22 3.38-.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  onEnter,
  placeholder,
  autoComplete,
  hasError,
  visible,
  onToggleVisible,
  showLabel,
  hideLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder: string;
  autoComplete: string;
  hasError: boolean;
  visible: boolean;
  onToggleVisible: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEnter?.();
          }}
          placeholder={placeholder}
          style={passwordInputStyle(hasError)}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            border: "none",
            background: "transparent",
            color: "var(--ink-500)",
            cursor: "pointer",
            borderRadius: "var(--radius-md)",
            padding: 0,
          }}
        >
          {visible ? <EyeOffIcon /> : <EyeOpenIcon />}
        </button>
      </div>
    </>
  );
}
