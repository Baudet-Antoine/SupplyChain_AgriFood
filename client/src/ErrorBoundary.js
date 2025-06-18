import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    console.log('🛡️ ErrorBoundary initialized');
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary details:');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      console.log('🚨 ErrorBoundary rendering error fallback');
      return (
        <div style={{ padding: '20px', border: '1px solid red', margin: '20px' }}>
          <h1>Something went wrong!</h1>
          <p>Check the browser console for detailed error information.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    console.log('🛡️ ErrorBoundary rendering children normally');
    return this.props.children;
  }
}

export default ErrorBoundary;
