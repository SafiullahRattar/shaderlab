import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            padding: 40,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 24, marginBottom: 12, color: "var(--text-primary)" }}>
            Something went wrong
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: "10px 24px",
              background: "var(--accent-dim)",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
