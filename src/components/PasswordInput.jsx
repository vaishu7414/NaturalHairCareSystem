import { useId, useState } from 'react'

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.7a3 3 0 0 0 4.2 4.2" />
      <path d="M9.9 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a18.3 18.3 0 0 1-2.2 3.1" />
      <path d="M6.6 6.7C4.4 8.2 3 12 3 12a18.4 18.4 0 0 0 9 7 10.6 10.6 0 0 0 5-.9" />
    </svg>
  )
}

function PasswordInput({ label, className = '', id, ...props }) {
  const generatedId = useId()
  const inputId = id || generatedId
  const [visible, setVisible] = useState(false)

  return (
    <div className={className}>
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="password-input-wrapper">
        <input
          {...props}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className="form-control password-input-field"
        />
        <button
          type="button"
          className="password-toggle-button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
    </div>
  )
}

export default PasswordInput
