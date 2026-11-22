import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F7F4] text-[#171614] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#171614]/12 rounded-xl p-8 space-y-4">
            <h1 className="font-display text-2xl font-medium text-[#171614]">
              Something went wrong
            </h1>
            <p className="text-sm text-[#5C5852] leading-relaxed">
              We hit an unexpected issue while syncing with the shop database. Reloading usually resolves this right away.
            </p>
            <pre className="text-xs font-mono bg-[#EFECE6] p-3 rounded-lg overflow-x-auto text-[#5C5852]">
              {this.state.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] rounded-lg transition-colors cursor-pointer"
            >
              Reload One Spice
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
