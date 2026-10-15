"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[3D Viewport ErrorBoundary Caught]", error, errorInfo);
  }

  public retry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/95 backdrop-blur-sm p-6 z-30 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-red-200 max-w-md w-full flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {this.props.fallbackTitle || "3D Viewport Error"}
            </h3>
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg w-full font-mono break-all text-left max-h-32 overflow-y-auto">
              {this.state.error?.message || "An unexpected error occurred while rendering the 3D canvas."}
            </p>
            <button
              type="button"
              onClick={this.retry}
              className="mt-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Rendering</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
