import styles from "./Input.module.scss";
import cn from "classnames";
import { useState } from "react";

export function Input({
  id = "",
  value,
  onChange,
  placeholder = "",
  containerClassName = "",
  className = "",
  regex = /.*/gi,
  disabled = false,
  customValidator = (value): boolean => true,
  onEnter = (): any => {},
  onDelete = (): any => {},
  forceError = false,
  type = "text",
  maxLength = undefined,
  textarea = false,
  onPaste = (e: ClipboardEvent) => {},
  errorMessage = "",
}: {
  id?: string;
  value: string;
  onChange: Function;
  placeholder?: string;
  containerClassName?: string;
  className?: string;
  regex?: RegExp;
  disabled?: boolean;
  customValidator?: (value: any) => boolean;
  onEnter?: Function;
  onDelete?: Function;
  forceError?: boolean;
  type?: "text" | "password" | "email" | "number";
  maxLength?: number;
  textarea?: boolean;
  onPaste?: (e: ClipboardEvent) => any;
  errorMessage?: string;
}) {
  const [pristine, setPristine] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isValid = (val: any, prstn = pristine) => {
    /**
     * Have to use a new RegExp object so that
     * it doesn't skip subsequent calls
     */
    return (
      !forceError &&
      (disabled ||
        prstn ||
        (new RegExp(regex).test(val) && customValidator(val)))
    );
  };

  return (
    <div
      className={cn({
        [styles.container]: true,
        [containerClassName]: !!containerClassName,
        [styles.input__invalid]: !isValid(value),
      })}
    >
      {!textarea && (
        <input
          id={id}
          maxLength={maxLength}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onEnter();
            } else if (e.key === "Backspace" || e.key === "Delete") {
              onDelete();
            }
          }}
          className={cn({
            [styles.input]: true,
            [className]: !!className,
          })}
          type={type === "password" ? (passwordVisible ? "text" : type) : type}
          value={value}
          onChange={(e) => {
            setPristine(false);
            onChange(e.target.value, isValid(e.target.value, false));
          }}
          onPaste={(e) => {
            onPaste(e as any);
          }}
          placeholder={placeholder}
        />
      )}
      {textarea && (
        <textarea
          id={id}
          maxLength={maxLength}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onEnter();
            } else if (e.key === "Backspace" || e.key === "Delete") {
              onDelete();
            }
          }}
          style={{
            minHeight: "150px",
          }}
          className={cn({
            [styles.input]: true,
            [className]: !!className,
          })}
          value={value}
          onChange={(e) => {
            setPristine(false);
            onChange(e.target.value, isValid(e.target.value, false));
          }}
          placeholder={placeholder}
        />
      )}
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      {type === "password" && (
        <button
          onClick={() => {
            setPasswordVisible((prev) => !prev);
          }}
          className={styles.reveal__password__btn}
        >
          {!passwordVisible && (
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9.005a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM12 5.5c4.613 0 8.596 3.15 9.701 7.564a.75.75 0 1 1-1.455.365 8.503 8.503 0 0 0-16.493.004.75.75 0 0 1-1.455-.363A10.003 10.003 0 0 1 12 5.5Z"
                fill="#4F4F4F"
              />
            </svg>
          )}
          {passwordVisible && (
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.22 2.22a.75.75 0 0 0-.073.976l.073.084 4.034 4.035a9.986 9.986 0 0 0-3.955 5.75.75.75 0 0 0 1.455.364 8.49 8.49 0 0 1 3.58-5.034l1.81 1.81A4 4 0 0 0 14.8 15.86l5.919 5.92a.75.75 0 0 0 1.133-.977l-.073-.084-6.113-6.114.001-.002-1.2-1.198-2.87-2.87h.002L8.719 7.658l.001-.002-1.133-1.13L3.28 2.22a.75.75 0 0 0-1.06 0Zm7.984 9.045 3.535 3.536a2.5 2.5 0 0 1-3.535-3.535ZM12 5.5c-1 0-1.97.148-2.889.425l1.237 1.236a8.503 8.503 0 0 1 9.899 6.272.75.75 0 0 0 1.455-.363A10.003 10.003 0 0 0 12 5.5Zm.195 3.51 3.801 3.8a4.003 4.003 0 0 0-3.801-3.8Z"
                fill="#4F4F4F"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
