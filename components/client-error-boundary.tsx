"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

import { sendClientLog } from "@/lib/client-log"

type FallbackRender = (reset: () => void) => ReactNode

interface ClientErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | FallbackRender
  name?: string
}

interface ClientErrorBoundaryState {
  hasError: boolean
}

export class ClientErrorBoundary extends Component<
  ClientErrorBoundaryProps,
  ClientErrorBoundaryState
> {
  state: ClientErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    sendClientLog({
      level: "error",
      message: error.message,
      context: {
        boundary: this.props.name ?? "ClientErrorBoundary",
        componentStack: info.componentStack,
      },
    })
  }

  private handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props

      if (typeof fallback === "function") {
        return (fallback as FallbackRender)(this.handleReset)
      }

      if (fallback) {
        return fallback
      }

      return (
        <div className="rounded-2xl border border-border/40 bg-background/80 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No pudimos cargar esta sección. Por favor, inténtalo nuevamente.
          </p>
          <button
            className="mt-4 inline-flex items-center justify-center rounded-full border border-border/60 px-4 py-2 text-xs font-medium text-foreground transition hover:bg-foreground/10"
            onClick={this.handleReset}
            type="button"
          >
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
