type AuthMessageProps = {
  kind?: "error" | "info";
  message: string;
};

export const AuthMessage = ({ kind = "info", message }: AuthMessageProps) => (
  <div className={`auth-message auth-message--${kind}`}>{message}</div>
);
