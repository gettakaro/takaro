import { ErrorPage } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useOry } from '../hooks/useOry';
import { FlowError } from '@ory/client';

export const Route = createFileRoute('/error')({
  component: Component,
});

interface ErrorDetails {
  code?: number;
  message?: string;
  reason?: string;
  debug?: string;
  error?: string;
  error_description?: string;
}

function Component() {
  useDocumentTitle('Error');
  const { oryClient } = useOry();
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);

  // Get error ID from query params
  const searchParams = new URLSearchParams(window.location.search);
  const errorId = searchParams.get('id');

  useEffect(() => {
    async function fetchError() {
      if (!errorId) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await oryClient.getFlowError({ id: errorId });
        const flowError = data as FlowError;

        // Extract error details from the nested error object
        if (flowError.error && typeof flowError.error === 'object') {
          setErrorDetails(flowError.error as ErrorDetails);
        }
      } catch (err) {
        console.error('Failed to fetch error details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchError();
  }, [errorId, oryClient]);

  // Determine error code and messages
  const errorCode = errorDetails?.code || 500;
  const title = errorDetails?.error || errorDetails?.message || 'Authentication Error';
  const description =
    errorDetails?.error_description ||
    errorDetails?.reason ||
    'An error occurred during authentication. Please try again or contact support if the issue persists.';

  if (loading) {
    return <ErrorPage errorCode={0} title="Loading..." description="Fetching error details..." homeRoute="/" />;
  }

  return <ErrorPage errorCode={errorCode} title={title} description={description} homeRoute="/" />;
}
