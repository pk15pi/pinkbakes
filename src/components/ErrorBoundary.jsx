import { Component } from "react";

// App-wide safety net (bug 013): a render error shows a friendly page instead of a blank screen.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("pinkbakes UI error", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="policy-page error-fallback" role="alert">
        <div className="policy-page-bar">
          <a className="policy-page-brand" href="/">{this.props.brandName || "pinkbakes"}</a>
        </div>
        <article className="policy-page-sheet">
          <p className="policy-page-kicker">Oops</p>
          <h1>Something went wrong</h1>
          <p className="policy-page-summary">
            This page hit an unexpected problem. Please reload, or head back to the homepage. Your cart may need to be refilled.
          </p>
          <nav className="policy-page-nav" aria-label="Recovery options">
            <button type="button" className="is-current" onClick={() => window.location.reload()}>Reload page</button>
            <button type="button" onClick={() => window.location.assign("/")}>Go to homepage</button>
          </nav>
        </article>
      </div>
    );
  }
}

export default ErrorBoundary;
