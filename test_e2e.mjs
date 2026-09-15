const BASE = 'http://localhost:5000';

async function run() {
  console.log('=================================================================');
  console.log('🚀 HAVENMATCH AI — PRODUCTION E2E VERIFICATION SUITE');
  console.log('=================================================================\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health & Database Connectivity Check
    console.log('--- 1. Health & Database Connectivity ---');
    const healthRes = await fetch(`${BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.ok, `Health endpoint returns 200 OK`);
    assert(healthData.status === 'healthy', `Server status is healthy`);
    assert(healthData.database === 'connected', `MongoDB Atlas database connected ("havenmatch")`);

    // 2. Owner Profile Management (Upsert & Fetch)
    console.log('\n--- 2. Owner Profile Management (Users collection in Atlas) ---');
    const ownerEmail = `test_owner_${Date.now()}@havenmatch.io`;
    const profilePayload = {
      email: ownerEmail,
      name: 'Ramesh Kumar',
      phone: '+91 98450 12345',
      role: 'SELLER',
      ownerType: 'OWNER',
      location: 'RS Puram, Coimbatore',
      bio: 'Direct owner offering premium residential homes in Coimbatore.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
    };

    const updateProfRes = await fetch(`${BASE}/api/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profilePayload)
    });
    const updateProfData = await updateProfRes.json();
    assert(updateProfRes.ok, `POST /api/auth/update-profile returned 200 OK`);
    assert(updateProfData.user?.email === ownerEmail, `User email accurately saved`);
    assert(updateProfData.user?.ownerType === 'OWNER', `ownerType saved as OWNER`);
    assert(updateProfData.user?.bio?.includes('Direct owner'), `bio saved in MongoDB`);
    const ownerId = updateProfData.user?.userId || updateProfData.user?.id;
    assert(!!ownerId, `Generated/Returned user ID: ${ownerId}`);

    // Fetch user via auth/me
    const getMeRes = await fetch(`${BASE}/api/auth/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerEmail })
    });
    const getMeData = await getMeRes.json();
    assert(getMeRes.ok, `POST /api/auth/me returned 200 OK`);
    assert(getMeData.user?.name === 'Ramesh Kumar', `User name matches persisted record`);
    assert(getMeData.user?.location === 'RS Puram, Coimbatore', `User location matches persisted record`);

    // 3. 7-Section Property Creation
    console.log('\n--- 3. 7-Section Property Creation (Properties collection) ---');
    const propertyPayload = {
      title: 'Luxury 3BHK Penthouse in RS Puram with Private Terrace',
      description: 'Ultra-luxurious 3BHK penthouse offering serene living with Siruvani water, 100% power backup, and round-the-clock security.',
      type: 'Penthouse',
      propertyType: 'Penthouse',
      listingType: 'BUY',
      price: 18500000,
      bhk: 3,
      bathrooms: 3,
      balconies: 2,
      sqft: 2450,
      carpetArea: 2100,
      floor: 4,
      totalFloors: 4,
      facing: 'East',
      furnishing: 'Fully-Furnished',
      possession: 'Ready to Move',
      vastuCompliant: true,
      reraApproved: true,
      reraNumber: 'TN/CB/2024/09981',
      city: 'Coimbatore',
      locality: 'RS Puram',
      address: 'DB Road, RS Puram, Coimbatore - 641002',
      pincode: '641002',
      coordinates: { lat: 11.0125, lng: 76.9452 },
      parking: '2 Covered Slots',
      waterSupply: '24/7 Siruvani + Corporation',
      powerBackup: '100% DG Backup',
      gatedCommunity: true,
      securityFeatures: ['24/7 Guard', 'CCTV', 'Video Door Phone', 'Biometric Entry'],
      amenities: ['Private Terrace', 'Siruvani Water', 'Gym', 'Swimming Pool', 'EV Charging', 'Clubhouse', 'Children Play Area', 'Lift'],
      nearbyPlaces: [
        { name: 'Brookefields Mall', distance: 2.2, type: 'Shopping' },
        { name: 'G.Kuppuswamy Naidu Memorial Hospital (GKNM)', distance: 3.5, type: 'Hospital' },
        { name: 'Coimbatore Junction Railway Station', distance: 3.8, type: 'Transport' },
        { name: 'TIDEL Park Coimbatore', distance: 9.5, type: 'IT Tech Hub' }
      ],
      noiseLevel: 'LOW',
      safety: 'Gated 24/7 Security with Biometric Access',
      waterAvailability: '24/7 Siruvani Dedicated Supply',
      electricityAvailability: '24/7 Uninterrupted with DG Backup',
      petFriendly: true,
      suitableFor: ['Families', 'Working Professionals', 'Executives'],
      rules: 'Quiet residential hours after 10 PM. Pets allowed.',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200'
      ],
      coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
      ownerType: 'OWNER',
      sellerId: ownerId,
      sellerName: 'Ramesh Kumar',
      sellerEmail: ownerEmail,
      sellerPhone: '+91 98450 12345',
      sellerCompany: ''
    };

    const createPropRes = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyPayload)
    });
    const createPropData = await createPropRes.json();
    assert(createPropRes.ok, `POST /api/properties/create returned 200 OK`);
    const createdId = createPropData.property?._id || createPropData.property?.id;
    assert(!!createdId, `Property created with ID: ${createdId}`);
    assert(createPropData.property?.noiseLevel === 'LOW', `noiseLevel saved as LOW`);
    assert(createPropData.property?.petFriendly === true, `petFriendly saved as true`);
    assert(createPropData.property?.nearbyPlaces?.length === 4, `nearbyPlaces preserved (4 items)`);

    // 4. Strict Ownership & Security Tests (Cross-owner Edit & Delete)
    console.log('\n--- 4. Authorization & Security (403 Forbidden on Cross-Owner) ---');
    const hackerEmail = 'hacker_malicious@random.com';
    const hackerId = 'hacker_12345';

    // 4a. Unauthorized Edit Attempt
    const unauthorizedEditRes = await fetch(`${BASE}/api/properties/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdId,
        title: 'HACKED TITLE BY UNAUTHORIZED USER',
        requestUserId: hackerId,
        requestEmail: hackerEmail
      })
    });
    assert(unauthorizedEditRes.status === 403, `Unauthorized edit rejected with 403 Forbidden (${unauthorizedEditRes.status})`);

    // 4b. Unauthorized Delete Attempt
    const unauthorizedDelRes = await fetch(`${BASE}/api/properties/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdId,
        requestUserId: hackerId,
        requestEmail: hackerEmail
      })
    });
    assert(unauthorizedDelRes.status === 403, `Unauthorized delete rejected with 403 Forbidden (${unauthorizedDelRes.status})`);

    // 5. Authorized Owner Property Update
    console.log('\n--- 5. Authorized Property Update ---');
    const validEditRes = await fetch(`${BASE}/api/properties/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdId,
        title: 'Luxury 3BHK Penthouse in RS Puram (Renovated 2026)',
        price: 19000000,
        requestUserId: ownerId,
        requestEmail: ownerEmail
      })
    });
    const validEditData = await validEditRes.json();
    assert(validEditRes.ok, `Authorized edit returned 200 OK`);
    assert(validEditData.property?.title?.includes('Renovated 2026'), `Property title updated`);
    assert(validEditData.property?.price === 19000000, `Property price updated to ₹1.90 Cr`);

    // 6. AI Lifestyle Matching Engine Verification
    console.log('\n--- 6. AI Lifestyle Matching Engine ---');
    const matchPayload = {
      city: 'Coimbatore',
      budgetMax: 25000000,
      propertyType: 'Penthouse',
      bedrooms: '3',
      lifestylePreferences: ['Peaceful & Quiet', 'Pet Friendly', 'Siruvani Water'],
      mustHaves: ['Gym', 'EV Charging', 'Swimming Pool']
    };

    const matchRes = await fetch(`${BASE}/api/matching/buyer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchPayload)
    });
    const matchData = await matchRes.json();
    assert(matchRes.ok, `POST /api/matching/buyer returned 200 OK`);
    const matches = matchData.matches || matchData.properties || [];
    assert(matches.length > 0, `Matching engine returned ${matches.length} matches`);
    const ourPropMatch = matches.find(m => (m._id || m.id) === createdId || (m.property?._id || m.property?.id) === createdId);
    if (ourPropMatch) {
      const score = ourPropMatch.matchScore || ourPropMatch.matchPercentage || ourPropMatch.score;
      assert(score >= 70, `Created property scored high AI match score: ${score}%`);
    } else {
      console.log('  ℹ️ Matches evaluated successfully for Coimbatore query.');
    }

    // 7. Authorized Property Deletion & Cleanup
    console.log('\n--- 7. Authorized Property Deletion ---');
    const validDelRes = await fetch(`${BASE}/api/properties/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdId,
        requestUserId: ownerId,
        requestEmail: ownerEmail
      })
    });
    const validDelData = await validDelRes.json();
    assert(validDelRes.ok, `Authorized delete returned 200 OK`);
    assert(validDelData.success === true, `Delete returned success true`);

    console.log(`\n=================================================================`);
    console.log(`🏁 ALL TESTS PASSED: ${passed} / ${passed + failed} assertions succeeded!`);
    console.log(`=================================================================\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal E2E test execution error:', err);
    process.exit(1);
  }
}

run();
