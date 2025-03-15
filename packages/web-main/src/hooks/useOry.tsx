import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { createContext, useCallback, useContext } from 'react';
import { Configuration, FrontendApi } from '@ory/client';
import { getConfigVar } from '../util/getConfigVar';

interface OryContext {
  oryClient: FrontendApi;
  oryError: (
    getFlow: ((flowId: string) => Promise<void | AxiosError>) | undefined,
    setFlow: React.Dispatch<React.SetStateAction<any>> | undefined,
    defaultNav: string | undefined,
    fatalToDash?: boolean,
  ) => (error: AxiosError<any>) => Promise<AxiosError | void>;
}
const OryContext = createContext<OryContext | null>(null);

export function OryProvider({ children }: { children: React.ReactNode }) {
  const oryClient = new FrontendApi(
    new Configuration({
      basePath: getConfigVar('oryUrl'),
      baseOptions: {
        withCredentials: true,
      },
    }),
  );

  const useOryError = (
    /**
     * @param getFlow - Should be function to load a flow make it visible (Login.getFlow)
     * @param setFlow - Update flow data to view (Login.setFlow)
     * @param defaultNav - Default navigate target for errors
     * @param fatalToDash - When true and error can not be handled, then redirect to dashboard, else rethrow error
     */
    getFlow: ((flowId: string) => Promise<void | AxiosError>) | undefined,

    setFlow: React.Dispatch<React.SetStateAction<any>> | undefined,
    defaultNav: string | undefined,
    fatalToDash = false,
  ) => {
    const navigate = useNavigate();

    return useCallback(
      (error: AxiosError<any>): Promise<AxiosError | void> => {
        const responseData = error.response?.data || ({} as any);

        switch (error.response?.status) {
          case 400: {
            if (error.response.data?.error?.id === 'session_already_available') {
              console.warn('sdkError 400: `session_already_available`. Navigate to /');
              navigate({ to: '/', replace: true });
              return Promise.resolve();
            }
            // the request could contain invalid parameters which would set error messages in the flow
            if (setFlow !== undefined) {
              console.warn('sdkError 400: update flow data');
              setFlow(responseData);
              return Promise.resolve();
            }
            break;
          }
          case 401: {
            console.warn('sdkError 401: Navigate to /login');
            navigate({ to: '/login', replace: true });
            return Promise.resolve();
          }

          // we currently don't handle 403 errors.
          case 403: {
            // the user might have a session, but would require 2FA (Two-Factor Authentication)

            /*if (responseData.error?.id === 'session_aal2_required') {
              navigate({ to: '/login?aal2=true', replace: true, search });
              return Promise.resolve();
            }*/

            if (responseData.error?.id === 'session_refresh_required' && responseData.redirect_browser_to) {
              console.warn('sdkError 403: Redirect browser to');
              window.location = responseData.redirect_browser_to;
              return Promise.resolve();
            }
            break;
          }
          case 404: {
            if (defaultNav !== undefined) {
              console.warn('sdkError 404: Navigate to Error');
              /*
              const errorMsg = {
                data: error.response?.data || error,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: window.location.href,
              };
              */

              // navigate({ to: `/error?error=${encodeURIComponent(JSON.stringify(errorMsg))}`, replace: true });
              return Promise.resolve();
            }
            break;
          }
          case 410: {
            if (getFlow !== undefined && responseData.use_flow_id !== undefined) {
              console.warn('sdkError 410: Update flow');
              return getFlow(responseData.use_flow_id).catch((error) => {
                // Something went seriously wrong - log and redirect to defaultNav if possible
                console.error(error);

                if (defaultNav !== undefined) {
                  //navigate({ to: defaultNav, replace: true });
                } else {
                  // Rethrow error when can't navigate and let caller handle
                  throw error;
                }
              });
            } else if (defaultNav !== undefined) {
              console.warn('sdkError 410: Navigate to', defaultNav);
              // navigate({ to: defaultNav, replace: true });
              return Promise.resolve();
            }
            break;
          }
          case 422: {
            if (responseData.redirect_browser_to !== undefined) {
              const currentUrl = new URL(window.location.href);
              const redirect = new URL(
                responseData.redirect_browser_to,
                // need to add the base url since the `redirect_browser_to` is a relative url with no hostname
                window.location.origin,
              );

              // Path has changed
              if (currentUrl.pathname !== redirect.pathname) {
                console.warn('sdkError 422: Update path');
                // remove /ui prefix from the path in case it is present (not setup correctly inside the project config)
                // since this is an SPA we don't need to redirect to the Account Experience.
                redirect.pathname = redirect.pathname.replace('/ui', '');
                // navigate({ to: redirect.pathname + redirect.search, replace: true });
                return Promise.resolve();
              }

              // for webauthn we need to reload the flow
              const flowId = redirect.searchParams.get('flow');

              if (flowId != null && getFlow !== undefined) {
                // get new flow data based on the flow id in the redirect url
                console.warn('sdkError 422: Update flow');
                return getFlow(flowId).catch((error) => {
                  // Something went seriously wrong - log and redirect to defaultNav if possible
                  console.error(error);

                  if (defaultNav !== undefined) {
                    // navigate({ to: defaultNav, replace: true });
                  } else {
                    // Rethrow error when can't navigate and let caller handle
                    throw error;
                  }
                });
              } else {
                console.warn('sdkError 422: Redirect browser to');
                window.location = responseData.redirect_browser_to;
                return Promise.resolve();
              }
            }
          }
        }

        console.error(error);

        if (fatalToDash) {
          console.warn('sdkError: fatal error redirect to dashboard');
          navigate({ to: '/', replace: true });
          return Promise.resolve();
        }

        throw error;
      },
      [navigate, getFlow],
    );
  };

  return (
    <OryContext.Provider
      value={{
        oryClient,
        oryError: useOryError,
      }}
    >
      {children}
    </OryContext.Provider>
  );
}

export function useOry() {
  const context = useContext(OryContext);
  if (!context) {
    throw new Error('useOryClient must be used within a OryClientProvider');
  }
  return context;
}
