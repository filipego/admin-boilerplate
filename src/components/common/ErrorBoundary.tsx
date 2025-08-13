"use client";

import React from "react";
import UIButton from "@/components/common/UIButton";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-10">
          {this.props.fallback ?? (
            <>
              <div className="text-sm text-destructive">Something went wrong</div>
              <div className="mt-3">
                <UIButton variant="outline" onClick={this.handleRetry}>Try again</UIButton>
              </div>
            </>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}


