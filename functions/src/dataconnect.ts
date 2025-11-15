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
  const projectId = process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || 'my-box';
  const location = connectorConfig.location;
  const service = connectorConfig.service;
  const connector = connectorConfig.connector;

  // Data Connect GraphQL endpoint format
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
  const client = new GraphQLClient(endpoint);

  try {
    const data = await client.request(params.query, params.variables || {});
    return { data };
  } catch (error: any) {
    console.error('GraphQL execution error:', error);
    return { errors: [error.response?.errors || error.message] };
  }
}
