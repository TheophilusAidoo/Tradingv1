import React, { Component, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from './Router'
import './index.css'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined as Error | undefined }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: 24, maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui', color: '#e4e4e7', background: '#16161a', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 12px', color: '#ef4444' }}>Something went wrong</h2>
          <pre style={{ overflow: 'auto', fontSize: 12, margin: 0 }}>{this.state.error.message}</pre>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{ marginTop: 16, padding: '10px 20px', background: '#22c55e', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  </React.StrictMode>
)
