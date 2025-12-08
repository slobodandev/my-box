/**
 * Document Migration Script (Standalone Node.js version)
 *
 * This script migrates DocumentPath and DocumentMaster records from the portal-api database
 * to Firebase Data Connect using direct HTTP calls to the Data Connect emulator.
 *
 * Usage:
 * 1. Ensure the Firebase emulators are running: firebase emulators:start
 * 2. Run: node scripts/migrate-documents-standalone.js
 *
 * Note: This script directly calls the Data Connect GraphQL endpoint
 */

const http = require('http');

// Configuration - Update these if your emulator runs on different ports
const DATACONNECT_HOST = '127.0.0.1';
const DATACONNECT_PORT = 9399;
const SERVICE_ID = 'mybox-dataconnect';
const CONNECTOR_ID = 'mybox-connector';

// Document Path data from portal-api (MSSQL) - 32 records
const documentPaths = [
  { id: "8846886F-F0FD-466E-B4A4-CAD4D5FF13D5", name: "1 - Borrower Docs", sourceLookupId: "396CD7E8-D9B4-484A-8497-26783D4ACDC3", sortOrder: 0, createdBy: "Migration" },
  { id: "1D74070B-D408-4451-80CE-8DAE182E6990", name: "1 - Borrower Docs/1.1 - Company", sourceLookupId: "396CD7E8-D9B4-484A-8497-26783D4ACDC3", sortOrder: 1, createdBy: "Migration" },
  { id: "75B81DE5-8A94-48C9-96FB-DCF1ADC7C280", name: "1 - Borrower Docs/1.2 - Credit Report", sourceLookupId: "396CD7E8-D9B4-484A-8497-26783D4ACDC3", sortOrder: 2, createdBy: "Migration" },
  { id: "68212C91-9BEE-4507-AA58-3923A1F3E9C5", name: "1 - Borrower Docs/1.2 - Credit Report/Photo IDs", sourceLookupId: "396CD7E8-D9B4-484A-8497-26783D4ACDC3", sortOrder: 3, createdBy: "Migration" },
  { id: "1405E121-9DA6-48D3-9268-B71CCF814D61", name: "1 - Borrower Docs/1.3 - Bank & Asset Statements", sourceLookupId: "396CD7E8-D9B4-484A-8497-26783D4ACDC3", sortOrder: 4, createdBy: "Migration" },
  { id: "6CCC429F-8AEE-40A8-8980-BE185C6C9B83", name: "1 - Borrower Docs/1.4 - Income Docs", sourceLookupId: "396CD7E8-D9B4-484A-8497-26783D4ACDC3", sortOrder: 5, createdBy: "Migration" },
  { id: "C4895258-BF31-4F84-A820-FF8DBBE40345", name: "2.1 - Proforma & Budget", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 6, createdBy: "Migration" },
  { id: "AE0F564C-269B-45BD-9CFE-882AF389078D", name: "2.1 - Proforma & Budget/2. Budgets", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 7, createdBy: "Migration" },
  { id: "790CBFC2-55C0-4704-ABA9-541D9BBF60AE", name: "2.1 - Proforma & Budget/3. Sales Scenarios", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 8, createdBy: "Migration" },
  { id: "945ECAC3-A5DC-4244-A68E-1F61705E09D0", name: "2.1 - Proforma & Budget/4. Risk & Valuation", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 9, createdBy: "Migration" },
  { id: "D2F972E1-1419-4F66-90B2-4D539C9B1541", name: "2.1 - Proforma & Budget/5. CPTD", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 10, createdBy: "Migration" },
  { id: "997B8E99-C1DF-4307-AE9D-AFBD9B1AA3D0", name: "2.2 - Loan Application", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 11, createdBy: "Migration" },
  { id: "87DDB31A-D3CB-4DC9-B48F-2FFBF8CAE3BC", name: "2.3 - Project Docs", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 12, createdBy: "Migration" },
  { id: "B97FDB68-2589-498C-9E26-A5286A44DC38", name: "2.4 - Appraisal", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 13, createdBy: "Migration" },
  { id: "14932D57-91DA-4A8B-BC6B-44C1D597AF62", name: "2.5 - Title & Escrow", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 14, createdBy: "Migration" },
  { id: "EC2506DE-17C4-4C8D-A029-5B1694CFEF7A", name: "2.6 - PSA", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 15, createdBy: "Migration" },
  { id: "F377C334-DD3C-4BDE-8A5F-C43243635FF6", name: "2.7 - Insurance & Flood", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 16, createdBy: "Migration" },
  { id: "EC1B2B15-E09E-4F3A-8C08-97CD31FD592C", name: "2.8 - Closing Docs", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 17, createdBy: "Migration" },
  { id: "BE34B83B-53A6-4050-B3EE-FE7075795549", name: "2.8 - Closing Docs/Broker Fee", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 18, createdBy: "Migration" },
  { id: "2FD8DF8B-6D78-4099-9F14-B20B6C86A4EE", name: "2.9 - Servicing", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 19, createdBy: "Migration" },
  { id: "B1869A38-93C1-4D42-B7FF-EFCD620D7E6F", name: "2.9 - Servicing/2.9.1 - Assignments", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 20, createdBy: "Migration" },
  { id: "EDFD4336-6EC6-4113-87DD-F8EA54A1C96D", name: "2.9 - Servicing/2.9.2 - Post Closing", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 21, createdBy: "Migration" },
  { id: "0FD08BF5-10BC-479B-A165-9C9F017CEFEE", name: "2.9 - Servicing/2.9.3 - Draws", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 22, createdBy: "Migration" },
  { id: "ACA679BE-879D-452B-98A0-76F286A4EC7C", name: "2.9 - Servicing/2.9.4 - Extensions", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 23, createdBy: "Migration" },
  { id: "178511B7-3BB2-46D8-B1B8-73C3A50BEAC0", name: "2.9 - Servicing/2.9.5 - PSA's & CO's", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 24, createdBy: "Migration" },
  { id: "E58EB08F-8D3B-4058-947A-34911565D7EA", name: "2.9 - Servicing/2.9.6 - Payoffs", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 25, createdBy: "Migration" },
  { id: "4E2BE9BA-9D65-4FE6-8879-9E5091793122", name: "2.9 - Servicing/2.9.7 - Default", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 26, createdBy: "Migration" },
  { id: "AC6B133B-BF41-4303-8B7A-D6E1F38BA779", name: "2.9 - Servicing/2.9.8 - Notices", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 27, createdBy: "Migration" },
  { id: "3640E4CB-4EB5-40EE-95D5-EAE30865E500", name: "2.9 - Servicing/2.9.9 - Reconveyance", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 28, createdBy: "Migration" },
  { id: "80231D3D-3EE4-42A7-A002-1662F157F1F0", name: "2.10 - Loan Purchase", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 29, createdBy: "Migration" },
  { id: "CDA6A324-EC1C-4A18-97C8-257FB62E71F1", name: "2.11 - Conditions", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 30, createdBy: "Migration" },
  { id: "E4521794-0FA9-4442-AED1-87C82D6B6616", name: "2.12 - Uploaded Document", sourceLookupId: "FAB72F7C-2158-4989-9092-6628E25E5633", sortOrder: 31, createdBy: "Migration" },
];

// Document Master data - subset of 218 records
const documentMasters = [
  { id: "BE75579C-794C-47CD-BD2D-009A2B80170E", name: "UCC - Termination", documentPathId: "EC1B2B15-E09E-4F3A-8C08-97CD31FD592C", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, display: "UCC - Termination", sortOrder: 0, createdBy: "Migration" },
  { id: "132DA8F7-B50B-4031-965E-03A7B6D29196", name: "UCC - Filed", documentPathId: "EC1B2B15-E09E-4F3A-8C08-97CD31FD592C", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, display: "UCC - Filed", sortOrder: 0, createdBy: "Migration" },
  { id: "013F8EB4-0C1F-4609-A815-042E728420B4", name: "Executed Deed of Trust", documentPathId: "EC1B2B15-E09E-4F3A-8C08-97CD31FD592C", isSystemGenerated: false, reviewRequired: true, isVersioningEnabled: false, namingConvention: "{Loan} - Ex DOT", display: "Executed Deed of Trust", sortOrder: 99, createdBy: "Migration" },
  { id: "E7C8AD7C-BD9B-4E73-9B8C-074DEB3F196B", name: "Loan Agreement", documentPathId: "EC1B2B15-E09E-4F3A-8C08-97CD31FD592C", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, display: "Loan Agreement", sortOrder: 0, createdBy: "Migration" },
  { id: "E3B0A549-4329-485E-8B3E-0795470ACC1F", name: "Borrower Narrative", documentPathId: "1D74070B-D408-4451-80CE-8DAE182E6990", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, namingConvention: "{Loan} - Borrower Exp Narrative", display: "Borrower Narrative", sortOrder: 0, createdBy: "Migration" },
  { id: "471A119B-FB7F-4DE5-A136-07C12F7294CD", name: "Will Serve Letter - Water", documentPathId: "87DDB31A-D3CB-4DC9-B48F-2FFBF8CAE3BC", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, namingConvention: "Water Availability - {Loan.Name}", display: "Will Serve Letter - Water", sortOrder: 0, createdBy: "Migration" },
  { id: "4298B026-4523-4E6E-A289-0B93849A70A3", name: "Topography Map", documentPathId: null, isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, display: "Topography Map", sortOrder: 0, createdBy: "Migration" },
  { id: "B04118D9-19B6-4A33-A247-0C11707F166C", name: "WIP - Confirmation Template", documentPathId: "D2F972E1-1419-4F66-90B2-4D539C9B1541", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, namingConvention: "WIP Confirmation - {Loan.Name}", display: "WIP - Confirmation Template", sortOrder: 0, createdBy: "Migration" },
  { id: "C1373E76-5CD6-4710-86F7-0D0C8FF582BD", name: "Spousal Consent", documentPathId: "EC1B2B15-E09E-4F3A-8C08-97CD31FD592C", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, namingConvention: "Spousal Consent - {Contact}", display: "Spousal Consent", sortOrder: 0, createdBy: "Migration" },
  { id: "2DAEC5DD-2D8E-4A2A-8F60-0D838A3212DA", name: "Insurance Supplement", documentPathId: "F377C334-DD3C-4BDE-8A5F-C43243635FF6", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, namingConvention: "Insurance Supplement - {Property}", display: "Insurance Supplement", sortOrder: 0, createdBy: "Migration" },
  { id: "9861E955-898F-44A3-B8C6-12196F37B51E", name: "Personal Financial Statement", documentPathId: "1405E121-9DA6-48D3-9268-B71CCF814D61", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, namingConvention: "PFS - {Contact} - {EffectiveDate}", display: "Personal Financial Statement", sortOrder: 0, createdBy: "Migration" },
  { id: "2D68BD9C-14AC-4729-A9C0-20658217EA82", name: "Promissory Note", documentPathId: "EC2506DE-17C4-4C8D-A029-5B1694CFEF7A", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, display: "Promissory Note", sortOrder: 0, createdBy: "Migration" },
  { id: "7A86BBB4-A043-4FC7-A5AB-2078C67DA15F", name: "OFAC", documentPathId: "997B8E99-C1DF-4307-AE9D-AFBD9B1AA3D0", isSystemGenerated: false, reviewRequired: true, isVersioningEnabled: false, namingConvention: "OFAC - {Company}", display: "OFAC", sortOrder: 3, createdBy: "Migration" },
  { id: "C5947218-7EC2-4138-9745-238FB7670E4F", name: "Application Workbook", documentPathId: "C4895258-BF31-4F84-A820-FF8DBBE40345", description: "Excel workbook for calculating Gmr", isSystemGenerated: false, reviewRequired: false, isVersioningEnabled: false, display: "Application Workbook", sortOrder: 0, createdBy: "Migration" },
  { id: "E3A1BD12-4808-426F-A127-2488C0DCFB3D", name: "Appraisal Invoice", documentPathId: "B97FDB68-2589-498C-9E26-A5286A44DC38", isSystemGenerated: false, reviewRequired: true, isVersioningEnabled: false, namingConvention: "Appraisal Invoice - Paid", display: "Appraisal Invoice", sortOrder: 6, createdBy: "Migration" },
];

// Execute a GraphQL operation against the Data Connect emulator
function executeOperation(operationName, query, variables) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      operationName,
      query,
      variables,
    });

    const options = {
      hostname: DATACONNECT_HOST,
      port: DATACONNECT_PORT,
      path: `/v1beta/projects/demo-mybox/locations/us-central1/services/${SERVICE_ID}/connectors/${CONNECTOR_ID}:executeQuery`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.errors) {
            reject(new Error(result.errors[0]?.message || 'GraphQL error'));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Execute a mutation against the Data Connect emulator
function executeMutation(operationName, mutation, variables) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      operationName,
      query: mutation,
      variables,
    });

    const options = {
      hostname: DATACONNECT_HOST,
      port: DATACONNECT_PORT,
      path: `/v1beta/projects/demo-mybox/locations/us-central1/services/${SERVICE_ID}/connectors/${CONNECTOR_ID}:executeMutation`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.errors) {
            reject(new Error(result.errors[0]?.message || 'GraphQL error'));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function migrateDocumentPaths() {
  console.log('Starting DocumentPath migration...');
  let success = 0;
  let failed = 0;

  const mutation = `
    mutation CreateDocumentPathWithId(
      $id: UUID!,
      $name: String!,
      $sourceLookupId: UUID,
      $description: String,
      $sortOrder: Int!,
      $createdBy: String
    ) {
      documentPath_insert(data: {
        id: $id,
        name: $name,
        sourceLookupId: $sourceLookupId,
        description: $description,
        sortOrder: $sortOrder,
        createdBy: $createdBy
      })
    }
  `;

  for (const path of documentPaths) {
    try {
      await executeMutation('CreateDocumentPathWithId', mutation, {
        id: path.id,
        name: path.name,
        sourceLookupId: path.sourceLookupId || null,
        description: path.description || null,
        sortOrder: path.sortOrder || 0,
        createdBy: path.createdBy || null,
      });
      console.log(`  ✓ Created: ${path.name}`);
      success++;
    } catch (error) {
      console.error(`  ✗ Failed: ${path.name} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\nDocumentPath migration complete: ${success} success, ${failed} failed`);
}

async function migrateDocumentMasters() {
  console.log('\nStarting DocumentMaster migration...');
  let success = 0;
  let failed = 0;

  const mutation = `
    mutation CreateDocumentMasterWithId(
      $id: UUID!,
      $name: String!,
      $documentPathId: UUID,
      $description: String,
      $sortOrder: Int!,
      $isSystemGenerated: Boolean!,
      $reviewRequired: Boolean!,
      $isVersioningEnabled: Boolean!,
      $namingConvention: String,
      $display: String,
      $createdBy: String
    ) {
      documentMaster_insert(data: {
        id: $id,
        name: $name,
        documentPathId: $documentPathId,
        description: $description,
        sortOrder: $sortOrder,
        isSystemGenerated: $isSystemGenerated,
        reviewRequired: $reviewRequired,
        isVersioningEnabled: $isVersioningEnabled,
        namingConvention: $namingConvention,
        display: $display,
        createdBy: $createdBy
      })
    }
  `;

  for (const master of documentMasters) {
    try {
      await executeMutation('CreateDocumentMasterWithId', mutation, {
        id: master.id,
        name: master.name,
        documentPathId: master.documentPathId || null,
        description: master.description || null,
        sortOrder: master.sortOrder || 0,
        isSystemGenerated: master.isSystemGenerated || false,
        reviewRequired: master.reviewRequired || false,
        isVersioningEnabled: master.isVersioningEnabled || false,
        namingConvention: master.namingConvention || null,
        display: master.display || null,
        createdBy: master.createdBy || null,
      });
      console.log(`  ✓ Created: ${master.name}`);
      success++;
    } catch (error) {
      console.error(`  ✗ Failed: ${master.name} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\nDocumentMaster migration complete: ${success} success, ${failed} failed`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Document Migration Script (Standalone)');
  console.log('='.repeat(60));
  console.log(`\nConnecting to Data Connect emulator at ${DATACONNECT_HOST}:${DATACONNECT_PORT}`);
  console.log('Make sure Firebase emulators are running!\n');

  try {
    await migrateDocumentPaths();
    await migrateDocumentMasters();

    console.log('\n' + '='.repeat(60));
    console.log('Migration completed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
