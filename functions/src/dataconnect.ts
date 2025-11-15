/**
 * Data Connect Configuration
 * Provides connector config and GraphQL client for executing queries and mutations
 */

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

  // Log all environment variables for debugging
  console.log('=== Environment Variables ===');
  console.log('FUNCTIONS_EMULATOR:', process.env.FUNCTIONS_EMULATOR);
  console.log('DATACONNECT_EMULATOR_HOST:', process.env.DATACONNECT_EMULATOR_HOST);
  console.log('FIREBASE_DATACONNECT_EMULATOR_HOST:', process.env.FIREBASE_DATACONNECT_EMULATOR_HOST);
  console.log('GCLOUD_PROJECT:', process.env.GCLOUD_PROJECT);
  console.log('PROJECT_ID:', process.env.PROJECT_ID);
  console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('DATA') || k.includes('EMULATOR')));

  // Check if running in Firebase Emulator
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

  if (isEmulator) {
    // Use local Data Connect emulator endpoint
    // The emulator uses the same path structure as production but on localhost
    const emulatorHost = process.env.DATACONNECT_EMULATOR_HOST ||
                        process.env.FIREBASE_DATACONNECT_EMULATOR_HOST ||
                        '127.0.0.1:9399';
    const endpoint = `http://${emulatorHost}/v1beta/projects/${projectId}/locations/${location}/services/${service}/connectors/${connector}:executeGraphql`;
    console.log('Using emulator endpoint:', endpoint);
    return endpoint;
  }

  // Production Data Connect GraphQL endpoint format
  const endpoint = `https://firebasedataconnect.googleapis.com/v1beta/projects/${projectId}/locations/${location}/services/${service}/connectors/${connector}:executeGraphql`;
  console.log('Using production endpoint:', endpoint);
  return endpoint;
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

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: params.query,
        variables: params.variables || {},
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('GraphQL Response:', JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      return {
        data: result.data || null,
        errors: result.errors
      };
    }

    return { data: result.data };
  } catch (error: any) {
    console.error('GraphQL execution error:', error);
    return {
      data: null,
      errors: [{ message: error.message }]
    };
  }
}
