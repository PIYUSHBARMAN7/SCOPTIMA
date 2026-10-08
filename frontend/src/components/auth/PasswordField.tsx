import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Props {
  value: string;

  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function PasswordField({
  value,
  onChange,
}: Props) {
  const [visible, setVisible] =
    useState(false);

  return (
    <div className="password-wrapper">
      <input
        type={
          visible
            ? "text"
            : "password"
        }
        value={value}
        onChange={onChange}
        placeholder="Enter your password"
        autoComplete="current-password"
      />

      <button
        type="button"
        className="password-toggle"
        aria-label={
          visible
            ? "Hide password"
            : "Show password"
        }
        onClick={() =>
          setVisible(!visible)
        }
      >
        {visible ? (
          <EyeOff size={19} />
        ) : (
          <Eye size={19} />
        )}
      </button>
    </div>
  );
}