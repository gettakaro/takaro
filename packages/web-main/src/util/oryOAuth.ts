import { FrontendApi, LoginFlow, SettingsFlow } from '@ory/client';

export interface OryOAuthOptions {
  provider: 'discord' | 'google' | 'github' | 'microsoft' | 'facebook' | 'steam';
  returnTo?: string;
  loginFlow?: LoginFlow;
  settingsFlow?: SettingsFlow;
  flowType?: 'login' | 'settings';
}

/**
 * Initiates an OAuth flow with Ory Kratos for the specified provider
 * @param oryClient The Ory Frontend API client
 * @param options OAuth options including provider and optional return URL
 */
export async function initiateOryOAuth(oryClient: FrontendApi, options: OryOAuthOptions): Promise<void> {
  const {
    provider,
    returnTo = window.location.href,
    loginFlow: existingLoginFlow,
    settingsFlow: existingSettingsFlow,
    flowType = 'settings',
  } = options;

  try {
    let flow: LoginFlow | SettingsFlow;

    // Use existing flow or create a new one based on flow type
    if (flowType === 'settings') {
      flow = existingSettingsFlow || (await oryClient.createBrowserSettingsFlow({ returnTo })).data;
    } else {
      flow = existingLoginFlow || (await oryClient.createBrowserLoginFlow({ refresh: true, returnTo })).data;
    }

    if (!flow?.id || !flow?.ui) {
      throw new Error(`Failed to obtain valid ${flowType} flow`);
    }

    // Find the OIDC form in the UI nodes - for settings flow, look for link method
    const oidcForm = flow.ui.nodes.find((node) => {
      if (!node.attributes || !('name' in node.attributes) || !('type' in node.attributes)) {
        return false;
      }

      // For settings flow linking social accounts
      if (
        flowType === 'settings' &&
        node.attributes.type === 'submit' &&
        node.attributes.name === 'link' &&
        'value' in node.attributes &&
        node.attributes.value === provider
      ) {
        return true;
      }

      // For login flow
      if (
        flowType === 'login' &&
        node.attributes.type === 'submit' &&
        node.attributes.name === 'provider' &&
        'value' in node.attributes &&
        node.attributes.value === provider
      ) {
        return true;
      }

      return false;
    });

    if (!oidcForm || !flow.ui.action) {
      console.error(
        'Available nodes:',
        flow.ui.nodes.map((n) => ({
          name: 'name' in n.attributes ? n.attributes.name : undefined,
          type: 'type' in n.attributes ? n.attributes.type : undefined,
          value: 'value' in n.attributes ? n.attributes.value : undefined,
          node_type: n.attributes.node_type,
        })),
      );
      throw new Error(`OAuth provider ${provider} not found in ${flowType} flow`);
    }

    // Create a form and submit it
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = flow.ui.action;

    // Add the provider/link input based on flow type
    const providerInput = document.createElement('input');
    providerInput.type = 'hidden';
    providerInput.name = flowType === 'settings' ? 'link' : 'provider';
    providerInput.value = provider;
    form.appendChild(providerInput);

    // Add CSRF token if present
    const csrfNode = flow.ui.nodes.find(
      (node) => node.attributes && 'name' in node.attributes && node.attributes.name === 'csrf_token',
    );

    if (csrfNode && 'value' in csrfNode.attributes) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrf_token';
      csrfInput.value = csrfNode.attributes.value as string;
      form.appendChild(csrfInput);
    }

    // Submit the form
    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error(`Failed to initiate ${provider} OAuth:`, error);
    throw error;
  }
}

/**
 * Checks if the current URL contains OAuth callback parameters
 * This can be used to detect when returning from an OAuth flow
 */
export function isOAuthCallback(): boolean {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.has('flow') || searchParams.has('code') || searchParams.has('state');
}

/**
 * Gets the provider from OAuth callback URL if present
 */
export function getOAuthProvider(): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('provider');
}

/**
 * Checks if a specific OAuth provider can be unlinked in the settings flow
 * @param settingsFlow The current settings flow
 * @param provider The OAuth provider to check
 * @returns true if the provider can be unlinked
 */
export function canUnlinkProvider(settingsFlow: SettingsFlow, provider: string): boolean {
  if (!settingsFlow?.ui?.nodes) {
    return false;
  }

  // Look for an unlink node for this provider
  const unlinkNode = settingsFlow.ui.nodes.find((node) => {
    if (!node.attributes || !('name' in node.attributes) || !('type' in node.attributes)) {
      return false;
    }

    return (
      node.attributes.type === 'submit' &&
      node.attributes.name === 'unlink' &&
      'value' in node.attributes &&
      node.attributes.value === provider
    );
  });

  return !!unlinkNode;
}

/**
 * Unlinks an OAuth provider from the user's account
 * @param oryClient The Ory Frontend API client
 * @param settingsFlow The current settings flow
 * @param provider The OAuth provider to unlink
 */
export async function unlinkOAuthProvider(
  oryClient: FrontendApi,
  settingsFlow: SettingsFlow,
  provider: string,
): Promise<void> {
  if (!settingsFlow?.ui?.action) {
    throw new Error('Invalid settings flow');
  }

  // Check if unlink is allowed
  if (!canUnlinkProvider(settingsFlow, provider)) {
    throw new Error(`Cannot unlink ${provider} - it may be your only authentication method`);
  }

  // Create a form and submit it
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = settingsFlow.ui.action;

  // Add the unlink input
  const unlinkInput = document.createElement('input');
  unlinkInput.type = 'hidden';
  unlinkInput.name = 'unlink';
  unlinkInput.value = provider;
  form.appendChild(unlinkInput);

  // Add CSRF token if present
  const csrfNode = settingsFlow.ui.nodes.find(
    (node) => node.attributes && 'name' in node.attributes && node.attributes.name === 'csrf_token',
  );

  if (csrfNode && 'value' in csrfNode.attributes) {
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    csrfInput.value = csrfNode.attributes.value as string;
    form.appendChild(csrfInput);
  }

  // Submit the form
  document.body.appendChild(form);
  form.submit();
}
