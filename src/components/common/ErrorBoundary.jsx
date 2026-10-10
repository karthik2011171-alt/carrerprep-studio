import { Component } from 'react';
import { ErrorState } from './index';

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('UI error caught by boundary:', error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="p-6">
          <ErrorState message="This page hit an unexpected error. Your saved data is safe." onRetry={() => this.setState({ failed: false })} />
        </div>
      );
    }
    return this.props.children;
  }
}
