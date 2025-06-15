import React, { Component, ReactNode } from 'react';
import { Box, Text } from 'ink';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box 
          flexDirection="column" 
          borderStyle="double" 
          borderColor="red" 
          padding={1}
          margin={1}
        >
          <Text color="red" bold>
            🚨 Application Error
          </Text>
          
          <Text color="red" marginY={1}>
            Something went wrong in the application.
          </Text>
          
          {this.state.error && (
            <Box flexDirection="column" marginY={1}>
              <Text color="gray" bold>Error Details:</Text>
              <Text color="gray">{this.state.error.message}</Text>
              {this.state.error.stack && (
                <Text color="gray" wrap="wrap">
                  {this.state.error.stack}
                </Text>
              )}
            </Box>
          )}
          
          <Box marginTop={1} borderTop borderColor="gray" paddingTop={1}>
            <Text color="yellow">
              Press Ctrl+C to exit and restart the application.
            </Text>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}
