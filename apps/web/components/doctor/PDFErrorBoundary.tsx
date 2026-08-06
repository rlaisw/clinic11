"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  downloadUrl?: string;
  certificateId?: string;
}

interface State {
  hasError: boolean;
}

export class PDFErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">PDF preview failed to load.</p>
          {this.props.onRetry && (
            <Button variant="outline" onClick={() => { this.setState({ hasError: false }); this.props.onRetry?.(); }}>
              Retry
            </Button>
          )}
          {this.props.downloadUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Or download the PDF directly:</p>
              <a href={this.props.downloadUrl} download className="text-blue-600 underline text-sm">
                Download sick-leave-certificate-{this.props.certificateId || "document"}.pdf
              </a>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}