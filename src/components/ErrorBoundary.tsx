import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    this.handleReset();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Something went wrong</h1>
              <p className="text-slate-600">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-mono text-slate-700 break-all">
                  {this.state.error.toString()}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-sm font-semibold text-slate-700 cursor-pointer hover:text-slate-900">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-slate-600 overflow-auto max-h-64">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-600">
              <p>If this problem persists, please contact support.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
