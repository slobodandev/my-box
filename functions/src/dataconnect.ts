/**
 * Data Connect Configuration
 * Provides connector config and GraphQL client for executing queries and mutations
 */

import { GraphQLClient } from 'graphql-request';

export const connectorConfig = {
  connector: 'mybox-connector',
  service: 'mybox-dataconnect',
  location: 'us-central1',
};

/**
 * Get Data Connect GraphQL endpoint URL
 */
function getDataConnectEndpoint(): string {
  const projectId = process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || 'my-box-53040';
  const location = connectorConfig.location;
  const service = connectorConfig.service;
  const connector = connectorConfig.connector;

  // Check if running in Firebase Emulator
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

  if (isEmulator) {
    // Use local Data Connect emulator endpoint
    const emulatorHost = process.env.DATACONNECT_EMULATOR_HOST || '127.0.0.1:9399';
    return `http://${emulatorHost}/v1beta/projects/${projectId}/locations/${location}/services/${service}/connectors/${connector}:executeGraphql`;
  }

  // Production Data Connect GraphQL endpoint format
  return `https://firebasedataconnect.googleapis.com/v1beta/projects/${projectId}/locations/${location}/services/${service}/connectors/${connector}:executeGraphql`;
}

/**
 * Execute GraphQL query or mutation against Data Connect
 */
export async function executeGraphql(params: {
  query: string;
  variables?: Record<string, any>;
}): Promise<any> {
  const endpoint = getDataConnectEndpoint();

  console.log('Data Connect Endpoint:', endpoint);
  console.log('GraphQL Query:', params.query);
  console.log('Variables:', params.variables);

  const client = new GraphQLClient(endpoint);

  try {
    const data = await client.request(params.query, params.variables || {});
    console.log('GraphQL Response:', JSON.stringify(data, null, 2));
    return { data };
  } catch (error: any) {
    console.error('GraphQL execution error:', error);
    console.error('Error response:', error.response);
    return {
      data: null,
      errors: error.response?.errors || [{ message: error.message }]
    };
  }
}
