import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * Catches render errors so one broken component shows a friendly message
 * instead of a blank page.
 *
 *   <ErrorBoundary>                         full-screen fallback (app root)
 *   <ErrorBoundary inline resetKey={path}>  in-page fallback; the sidebar and
 *                                           top bar stay usable, and moving to
 *                                           another page clears the error
 */
export default class ErrorBoundary extends Component {
  state = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error) {
    return { error }
  }

  static getDerivedStateFromProps(props, state) {
    // Navigating elsewhere (a new resetKey) gives the new page a fresh start.
    if (props.resetKey !== state.resetKey) return { error: null, resetKey: props.resetKey }
    return null
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    const inline = this.props.inline
    return (
      <div
        role="alert"
        className={`flex flex-col items-center justify-center gap-3 px-4 text-center ${inline ? 'py-20' : 'min-h-screen'}`}
      >
        <AlertTriangle size={40} className="text-red-500" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="max-w-sm text-sm text-gray-500">
          {inline
            ? 'This page hit an unexpected error. You can try again or use the menu to go elsewhere.'
            : 'An unexpected error occurred. Reloading the page usually fixes it.'}
        </p>
        <button
          type="button"
          className="btn-primary mt-2"
          onClick={() => (inline ? this.setState({ error: null }) : window.location.reload())}
        >
          <RotateCcw size={16} aria-hidden="true" /> {inline ? 'Try again' : 'Reload page'}
        </button>
      </div>
    )
  }
}
