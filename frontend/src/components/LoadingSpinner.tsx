import "./LoadingSpinner.css";

interface Props {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 32, text }: Props) {
  return (
    <div className="loading-spinner-wrapper">
      <div className="loading-spinner" style={{ width: size, height: size }} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
