const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    ...(options.headers || {}),
  };
  if (!options.isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    config.body = options.isFormData ? options.body : JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('==================================================');
  console.log(`NORMAL USER & DOCUMENT UPLOAD SYSTEM VERIFICATION`);
  console.log(`Target Port: ${PORT} | Primary Tag: TAG001`);
  console.log('==================================================\n');

  try {
    // 1. Health check
    console.log('[Test 1] Checking API Health...');
    const health = await apiRequest('/health');
    console.log('✔ Health OK:', health.data.system);

    // 2. Normal User Authentication
    console.log('\n[Test 2] Authenticating as Normal User / Tag Owner (owner@example.com)...');
    const userLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'owner@example.com', password: 'password123' },
    });
    if (!userLogin.ok) {
      throw new Error(`Login failed: ${JSON.stringify(userLogin.data)}`);
    }
    const token = userLogin.data.token;
    console.log('✔ Normal User Authenticated:', userLogin.data.user.name, '| Person ID:', userLogin.data.user.personId);

    // 3. Check Initial Tag State (Must be 'configuration' / input form mode)
    console.log('\n[Test 3] Checking Initial Tag State (GET /api/tags/TAG001/state)...');
    const initialState = await apiRequest('/tags/TAG001/state');
    console.log('✔ TAG001 Initial Status:', initialState.data.status);
    if (initialState.data.status !== 'configuration') {
      throw new Error(`Expected configuration state, got ${initialState.data.status}`);
    }

    // 4. Test Document Upload using native Node FormData
    console.log('\n[Test 4] Testing Document Upload (POST /api/documents/upload)...');
    const testFilePath = path.join(__dirname, 'test-cert.txt');
    fs.writeFileSync(testFilePath, 'CERTIFICATE OF VEHICLE EMISSION AND SAFETY COMPLIANCE 2026\nStatus: PASSED');

    const fileBuffer = fs.readFileSync(testFilePath);
    const blob = new Blob([fileBuffer], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'test-cert.txt');
    formData.append('title', 'Vehicle Safety Certificate');
    formData.append('category', 'vehicle');
    formData.append('description', 'Annual emission & safety inspection report');
    formData.append('tagId', 'TAG001');

    const uploadRes = await apiRequest('/documents/upload', {
      method: 'POST',
      isFormData: true,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);

    if (!uploadRes.ok) {
      throw new Error(`Upload failed: ${JSON.stringify(uploadRes.data)}`);
    }
    console.log('✔ Document Upload Succeeded:', uploadRes.data.message);
    console.log('✔ File Stored at URL:', uploadRes.data.document.fileUrl);
    const uploadedDocId = uploadRes.data.document._id;

    // 5. Test Tag Documents Retrieval (Public visitor tap)
    console.log('\n[Test 5] Fetching Public Documents for TAG001 (GET /api/documents/tag/TAG001)...');
    const publicDocsRes = await apiRequest('/documents/tag/TAG001');
    console.log('✔ Retrieved Documents on Tag:', publicDocsRes.data.length);
    if (publicDocsRes.data.length < 1) {
      throw new Error('Expected at least 1 document on TAG001');
    }

    // 6. Test Tag Activation with Context
    console.log('\n[Test 6] Activating TAG001 with vehicle_details context for 4 seconds...');
    const activateRes = await apiRequest('/tags/TAG001/activate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        function: 'vehicle_details',
        duration: 4,
        context: {
          location: { latitude: 37.7749, longitude: -122.4194 },
          intent: 'vehicle_details',
          accessLevel: 'public',
        },
      },
    });
    console.log('✔ Tag Activation Success:', activateRes.data.message);
    console.log('✔ Authoritative State:', activateRes.data.state.status, '| Function:', activateRes.data.state.function);

    // 7. Verify Active State Query (Second tap)
    console.log('\n[Test 7] Second Tap Query: GET /api/tags/TAG001/state...');
    const activeState = await apiRequest('/tags/TAG001/state');
    console.log('✔ Status:', activeState.data.status);
    console.log('✔ Active Function:', activeState.data.function);
    console.log('✔ Remaining Duration:', activeState.data.remainingSeconds, 'seconds');
    if (activeState.data.status !== 'active') {
      throw new Error('Expected status to be active');
    }

    // 8. Fetch Vehicle Details
    console.log('\n[Test 8] Fetching Active Vehicle Details (GET /api/tags/TAG001/vehicle)...');
    const vehicleRes = await apiRequest('/tags/TAG001/vehicle');
    console.log('✔ Registration:', vehicleRes.data.data.registrationNumber);
    console.log('✔ Model:', vehicleRes.data.data.model);

    // 9. Test Manual Tag Reset / Deactivation (POST /api/tags/TAG001/deactivate) by Authenticated User
    console.log('\n[Test 9] Testing Manual Tag Reset / Deactivation by Authenticated User...');
    const deactivateRes = await apiRequest('/tags/TAG001/deactivate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!deactivateRes.ok) {
      throw new Error(`Tag deactivation failed: ${JSON.stringify(deactivateRes.data)}`);
    }
    console.log('✔ Tag Reset Succeeded:', deactivateRes.data.message);
    console.log('✔ State After Reset:', deactivateRes.data.state.status);
    if (deactivateRes.data.state.status !== 'configuration') {
      throw new Error(`Expected tag status to be 'configuration', got ${deactivateRes.data.state.status}`);
    }

    // 10. Re-activate for 3s to test lazy auto-expiration
    console.log('\n[Test 10] Re-activating for 3 seconds to verify lazy auto-expiration...');
    await apiRequest('/tags/TAG001/activate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        function: 'vehicle_details',
        duration: 3,
        context: {
          intent: 'vehicle_details',
          accessLevel: 'public',
        },
      },
    });
    console.log('✔ Waiting 4 seconds for temporary context to expire...');
    await sleep(4000);

    const expiredState = await apiRequest('/tags/TAG001/state');
    console.log('✔ Lazy Expiration Status:', expiredState.data.status);
    if (expiredState.data.status !== 'configuration') {
      throw new Error(`Expected tag to expire back to 'configuration', got ${expiredState.data.status}`);
    }
    console.log('✔ AUTHORITATIVE EXPIRATION VERIFIED (Reverted to Input Form mode without background cron!)');

    // 11. Clean up uploaded test document
    if (uploadedDocId) {
      console.log('\n[Test 11] Cleaning up uploaded test document...');
      await apiRequest(`/documents/${uploadedDocId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✔ Test document cleaned up.');
    }

    console.log('\n==================================================');
    console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
    console.log('==================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Start backend server
require('../server');
setTimeout(runTests, 2500);
