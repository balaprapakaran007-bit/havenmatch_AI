const BASE = 'http://localhost:5000';

async function runDatabaseMasterSuite() {
  console.log('======================================================================');
  console.log('🌟 HAVENMATCH AI — DATABASE ARCHITECTURE & RELATIONSHIP TEST SUITE');
  console.log('   Testing Steps 25 through 34 (Full E2E Database Flows)');
  console.log('======================================================================\n');

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
    // 0. HEALTH CHECK
    console.log('--- 0. System Health & MongoDB Atlas Connectivity ---');
    const healthRes = await fetch(`${BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.ok, `Health endpoint returns 200 OK`);
    assert(healthData.status === 'healthy', `Server status is healthy`);
    assert(healthData.database === 'connected', `MongoDB Atlas connected to database: "${healthData.mongoDatabase}"`);

    const ts = Date.now();

    // =========================================================================
    // STEP 25 — DATABASE RELATIONSHIP TEST
    // =========================================================================
    console.log('\n--- STEP 25: Database Relationship Test ---');
    
    // Create Seller A
    const sellerAEmail = `seller_a_${ts}@havenmatch.io`;
    const sellerARes = await fetch(`${BASE}/api/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sellerAEmail,
        name: 'Arunachalam (Seller A)',
        phone: `+91 98401 ${String(ts).slice(-5)}`,
        role: 'SELLER',
        ownerType: 'OWNER',
        location: 'Peelamedu, Coimbatore',
        bio: 'Verified property owner in Coimbatore'
      })
    });
    const sellerAData = await sellerARes.json();
    const sellerAId = sellerAData.user?.userId || sellerAData.user?.id;
    assert(sellerARes.ok && !!sellerAId, `Seller A registered: ${sellerAEmail} (${sellerAId})`);

    // Create Seller B
    const sellerBEmail = `seller_b_${ts}@havenmatch.io`;
    const sellerBRes = await fetch(`${BASE}/api/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sellerBEmail,
        name: 'Bhavani Shankar (Seller B)',
        phone: `+91 98402 ${String(ts).slice(-5)}`,
        role: 'SELLER',
        ownerType: 'OWNER',
        location: 'Race Course, Coimbatore',
        bio: 'Independent luxury real estate owner'
      })
    });
    const sellerBData = await sellerBRes.json();
    const sellerBId = sellerBData.user?.userId || sellerBData.user?.id;
    assert(sellerBRes.ok && !!sellerBId, `Seller B registered: ${sellerBEmail} (${sellerBId})`);

    // Create Buyer A
    const buyerEmail = `buyer_a_${ts}@havenmatch.io`;
    const buyerRes = await fetch(`${BASE}/api/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: buyerEmail,
        name: 'Karthik Raja (Buyer A)',
        phone: `+91 98403 ${String(ts).slice(-5)}`,
        role: 'BUYER',
        location: 'Coimbatore'
      })
    });
    const buyerData = await buyerRes.json();
    const buyerId = buyerData.user?.userId || buyerData.user?.id;
    assert(buyerRes.ok && !!buyerId, `Buyer A registered: ${buyerEmail} (${buyerId})`);

    // Seller A creates A1 and A2
    const propA1Res = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'A1 - Prime 2BHK Apartment in Peelamedu',
        listingType: 'BUY',
        intent: 'BUY',
        propertyType: 'Apartment',
        price: 6500000,
        bhk: 2,
        bedrooms: 2,
        bathrooms: 2,
        city: 'Coimbatore',
        locality: 'Peelamedu',
        address: 'Avinashi Road, Peelamedu',
        ownerId: sellerAId,
        sellerId: sellerAId,
        sellerEmail: sellerAEmail,
        sellerName: 'Arunachalam (Seller A)',
        noiseLevel: 'LOW',
        waterSupply: '24/7 Siruvani Water',
        parking: 'Reserved Covered Parking',
        publicTransport: 'Direct City Bus Stop at 100m',
        petFriendly: true,
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200']
      })
    });
    const a1 = (await propA1Res.json()).property;
    const a1Id = a1.id || a1.propertyId || a1._id;

    const propA2Res = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'A2 - Modern 3BHK Flat in RS Puram',
        listingType: 'BUY',
        intent: 'BUY',
        propertyType: 'Apartment',
        price: 8500000,
        bhk: 3,
        bedrooms: 3,
        bathrooms: 3,
        city: 'Coimbatore',
        locality: 'RS Puram',
        address: 'DB Road, RS Puram',
        ownerId: sellerAId,
        sellerId: sellerAId,
        sellerEmail: sellerAEmail,
        sellerName: 'Arunachalam (Seller A)',
        noiseLevel: 'LOW',
        waterSupply: 'Siruvani Water',
        parking: 'Covered Car Park',
        publicTransport: 'Bus Corridor Nearby',
        petFriendly: false,
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200']
      })
    });
    const a2 = (await propA2Res.json()).property;
    const a2Id = a2.id || a2.propertyId || a2._id;

    // Seller B creates B1 and B2
    const propB1Res = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'B1 - Executive 2BHK Residence in Race Course',
        listingType: 'BUY',
        intent: 'BUY',
        propertyType: 'Apartment',
        price: 7200000,
        bhk: 2,
        bedrooms: 2,
        bathrooms: 2,
        city: 'Coimbatore',
        locality: 'Race Course',
        address: 'Race Course Road',
        ownerId: sellerBId,
        sellerId: sellerBId,
        sellerEmail: sellerBEmail,
        sellerName: 'Bhavani Shankar (Seller B)',
        noiseLevel: 'HIGH',
        waterSupply: 'Borewell Only',
        parking: 'None',
        publicTransport: 'Limited',
        petFriendly: false,
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200']
      })
    });
    const b1 = (await propB1Res.json()).property;
    const b1Id = b1.id || b1.propertyId || b1._id;

    const propB2Res = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'B2 - Compact 1BHK Studio Rental in Race Course',
        listingType: 'RENT',
        intent: 'RENT',
        propertyType: 'Studio Apartment',
        price: 18000,
        bhk: 1,
        bedrooms: 1,
        bathrooms: 1,
        city: 'Coimbatore',
        locality: 'Race Course',
        address: 'South Race Course',
        ownerId: sellerBId,
        sellerId: sellerBId,
        sellerEmail: sellerBEmail,
        sellerName: 'Bhavani Shankar (Seller B)',
        noiseLevel: 'LOW',
        waterSupply: 'Corporation Water',
        parking: 'Bike Parking',
        petFriendly: false,
        images: ['https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200']
      })
    });
    const b2 = (await propB2Res.json()).property;
    const b2Id = b2.id || b2.propertyId || b2._id;

    // Verify Ownership References in DB
    assert(a1.ownerId === sellerAId, `A1.ownerId equals Seller A ID (${sellerAId})`);
    assert(a2.ownerId === sellerAId, `A2.ownerId equals Seller A ID (${sellerAId})`);
    assert(b1.ownerId === sellerBId, `B1.ownerId equals Seller B ID (${sellerBId})`);
    assert(b2.ownerId === sellerBId, `B2.ownerId equals Seller B ID (${sellerBId})`);

    // Buyer A Feed (Must see ALL properties)
    const buyerFeedRes = await fetch(`${BASE}/api/properties/list`);
    const buyerFeedData = await buyerFeedRes.json();
    const feedProps = buyerFeedData.properties || [];
    assert(feedProps.some(p => p.id === a1Id), `Buyer feed contains A1`);
    assert(feedProps.some(p => p.id === a2Id), `Buyer feed contains A2`);
    assert(feedProps.some(p => p.id === b1Id), `Buyer feed contains B1`);
    assert(feedProps.some(p => p.id === b2Id), `Buyer feed contains B2`);

    // Seller A Listings (Must see ONLY A1 and A2)
    const sellerAListRes = await fetch(`${BASE}/api/properties/list?sellerId=${encodeURIComponent(sellerAId)}`);
    const sellerAListData = await sellerAListRes.json();
    const sellerAProps = sellerAListData.properties || [];
    assert(sellerAProps.some(p => p.id === a1Id), `Seller A sees A1`);
    assert(sellerAProps.some(p => p.id === a2Id), `Seller A sees A2`);
    assert(!sellerAProps.some(p => p.id === b1Id || p.id === b2Id), `Seller A dashboard strictly excludes Seller B properties (B1, B2)`);

    // =========================================================================
    // STEP 26 — EDIT TEST
    // =========================================================================
    console.log('\n--- STEP 26: In-Place Edit Test (A1) ---');
    const editA1Res = await fetch(`${BASE}/api/properties/${a1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'A1 - Renovated Luxury 2BHK Apartment in Peelamedu',
        price: 6800000,
        bhk: 2,
        description: 'Fully renovated with Italian marble flooring and modular kitchen.',
        noiseLevel: 'LOW',
        parking: '2 Covered Reserved Car Parks',
        userId: sellerAId
      })
    });
    const editA1Data = await editA1Res.json();
    assert(editA1Res.ok, `PUT /api/properties/${a1Id} returned 200 OK`);
    assert(editA1Data.property?.id === a1Id, `A1 unique ID remains unchanged (${a1Id})`);
    assert(editA1Data.property?.price === 6800000, `A1 price updated to ₹68 Lakhs in MongoDB`);
    assert(editA1Data.property?.title === 'A1 - Renovated Luxury 2BHK Apartment in Peelamedu', `A1 title updated`);
    assert(editA1Data.property?.parking === '2 Covered Reserved Car Parks', `A1 parking updated`);

    // =========================================================================
    // STEP 27 — SECURITY TEST (CROSS-OWNER PROTECTION)
    // =========================================================================
    console.log('\n--- STEP 27: Security & 403 Authorization Test ---');
    
    // Seller A attempts to edit Seller B's property (B1)
    const hackEditRes = await fetch(`${BASE}/api/properties/${b1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'HACKED BY SELLER A',
        price: 1,
        userId: sellerAId
      })
    });
    assert(hackEditRes.status === 403, `Unauthorized cross-owner edit rejected with 403 Forbidden (${hackEditRes.status})`);

    // Verify B1 is completely intact in MongoDB
    const verifyB1Res = await fetch(`${BASE}/api/properties/${b1Id}`);
    const verifyB1Data = await verifyB1Res.json();
    assert(verifyB1Data.property?.price === 7200000, `B1 price remains untouched at ₹72 Lakhs`);
    assert(verifyB1Data.property?.title === 'B1 - Executive 2BHK Residence in Race Course', `B1 title remains untouched`);

    // Seller A attempts to delete Seller B's property (B1)
    const hackDelRes = await fetch(`${BASE}/api/properties/${b1Id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: sellerAId
      })
    });
    assert(hackDelRes.status === 403, `Unauthorized cross-owner delete rejected with 403 Forbidden (${hackDelRes.status})`);

    // =========================================================================
    // STEP 28 — DELETE TEST
    // =========================================================================
    console.log('\n--- STEP 28: Delete Test (Seller A deletes A1) ---');
    const deleteA1Res = await fetch(`${BASE}/api/properties/${a1Id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: sellerAId })
    });
    assert(deleteA1Res.ok, `Seller A successfully deleted A1`);

    // Verify A1 is gone from Seller A listings, but A2 remains intact
    const verifySellerAListRes = await fetch(`${BASE}/api/properties/list?sellerId=${encodeURIComponent(sellerAId)}`);
    const verifySellerAData = await verifySellerAListRes.json();
    const updatedAProps = verifySellerAData.properties || [];
    assert(!updatedAProps.some(p => p.id === a1Id), `A1 no longer appears in Seller A dashboard`);
    assert(updatedAProps.some(p => p.id === a2Id), `A2 remains safely intact in Seller A dashboard`);

    // =========================================================================
    // STEP 29 — SAVE TEST (SHORTLISTS IN MONGODB)
    // =========================================================================
    console.log('\n--- STEP 29: Save & Shortlists Test ---');
    const saveB1Res = await fetch(`${BASE}/api/saved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: buyerId, propertyId: b1Id })
    });
    assert(saveB1Res.ok, `Buyer A saved B1 into shortlists collection`);

    const getSavedRes = await fetch(`${BASE}/api/saved?userId=${encodeURIComponent(buyerId)}`);
    const getSavedData = await getSavedRes.json();
    const savedIds = (getSavedData.shortlists || []).map(s => s.propertyId || s.property_id || s.id);
    assert(savedIds.includes(b1Id), `Saved properties contains B1 (${b1Id})`);

    // Remove B1
    const removeSavedRes = await fetch(`${BASE}/api/saved/${b1Id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: buyerId })
    });
    assert(removeSavedRes.ok, `Buyer A removed B1 from saved`);

    const getSavedAfterRes = await fetch(`${BASE}/api/saved?userId=${encodeURIComponent(buyerId)}`);
    const getSavedAfterData = await getSavedAfterRes.json();
    const savedIdsAfter = (getSavedAfterData.shortlists || []).map(s => s.propertyId || s.property_id || s.id);
    assert(!savedIdsAfter.includes(b1Id), `B1 successfully removed from shortlists in MongoDB`);

    // =========================================================================
    // STEP 30 — PROPERTY ROUTING TEST
    // =========================================================================
    console.log('\n--- STEP 30: Property Routing Test ---');
    const routeB1Res = await fetch(`${BASE}/api/properties/${b1Id}`);
    const routeB1Data = await routeB1Res.json();
    assert(routeB1Res.ok && routeB1Data.property?.id === b1Id, `GET /property/${b1Id} returns authentic B1 data`);

    const routeA2Res = await fetch(`${BASE}/api/properties/${a2Id}`);
    const routeA2Data = await routeA2Res.json();
    assert(routeA2Res.ok && routeA2Data.property?.id === a2Id, `GET /property/${a2Id} returns authentic A2 data`);
    assert(routeB1Data.property?.title !== routeA2Data.property?.title, `Routing isolation verified: B1 and A2 return distinct records`);

    // =========================================================================
    // STEP 31 — INTEREST TEST
    // =========================================================================
    console.log('\n--- STEP 31: Interest Expression Test ---');
    const interestRes = await fetch(`${BASE}/api/interest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId,
        propertyId: b1Id,
        sellerId: sellerBId,
        message: 'Interested in exploring purchase of B1.'
      })
    });
    const interestData = await interestRes.json();
    assert(interestRes.ok, `POST /api/interest returned 200 OK`);
    assert(interestData.interest?.sellerId === sellerBId, `Interest record references Seller B (${sellerBId})`);

    // Seller B reads received interests
    const sellerBInterestsRes = await fetch(`${BASE}/api/interests/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: sellerBId })
    });
    const sellerBInterestsData = await sellerBInterestsRes.json();
    const foundInterest = (sellerBInterestsData.interests || []).find(i => i.propertyId === b1Id);
    assert(!!foundInterest, `Seller B can view interest inquiry submitted by Buyer A for B1`);

    // =========================================================================
    // STEP 32 — VISIT TEST
    // =========================================================================
    console.log('\n--- STEP 32: Site Visit Scheduling Test ---');
    const visitRes = await fetch(`${BASE}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitData: {
          buyerId,
          buyerName: 'Karthik Raja (Buyer A)',
          propertyId: b1Id,
          sellerId: sellerBId,
          date: '2026-09-25',
          timeSlot: '04:00 PM',
          notes: 'Inspection of electricals and plumbing.'
        }
      })
    });
    const visitData = await visitRes.json();
    assert(visitRes.ok, `POST /api/visits scheduled visit successfully`);
    assert(visitData.visit?.propertyId === b1Id, `Visit record references property B1`);
    assert(visitData.visit?.status === 'Scheduled', `Visit record has Scheduled status`);

    // =========================================================================
    // STEP 33 — AI MATCH TEST
    // =========================================================================
    console.log('\n--- STEP 33: AI Lifestyle Match Scoring Test ---');
    const matchResBefore = await fetch(`${BASE}/api/matching/buyer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: buyerId,
        intent: 'BUY',
        city: 'Coimbatore',
        budgetMax: 7500000,
        bhk: [2],
        lifestyle: {
          priorities: { quietness: 'HIGH' },
          atmospherePreference: 'Peaceful & Quiet'
        }
      })
    });
    const matchDataBefore = await matchResBefore.json();
    assert(matchResBefore.ok, `AI match engine returned 200 OK`);
    const b1MatchBefore = (matchDataBefore.recommendations || []).find(r => r.propertyId === b1Id || r.property?.id === b1Id);
    assert(!!b1MatchBefore, `B1 evaluated by AI matching engine`);
    console.log(`  📊 B1 Initial Match Score (with noiseLevel=HIGH, parking=None): ${b1MatchBefore.matchScore}%`);

    // =========================================================================
    // STEP 34 — OWNER PROPERTY EDIT → DYNAMIC AI MATCH UPDATE
    // =========================================================================
    console.log('\n--- STEP 34: Owner Property Edit → Dynamic AI Match Update Test ---');
    
    // Seller B edits B1: updates noiseLevel from HIGH to LOW, adds parking and public transport
    const updateB1ForAIRes = await fetch(`${BASE}/api/properties/${b1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noiseLevel: 'LOW',
        waterSupply: '24/7 Siruvani Water',
        parking: 'Reserved Covered Parking',
        publicTransport: 'Bus Corridor Available',
        userId: sellerBId
      })
    });
    assert(updateB1ForAIRes.ok, `Seller B updated B1 lifestyle signals (noiseLevel: LOW, Siruvani Water)`);

    // Run AI Matching again for Buyer A
    const matchResAfter = await fetch(`${BASE}/api/matching/buyer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: buyerId,
        intent: 'BUY',
        city: 'Coimbatore',
        budgetMax: 7500000,
        bhk: [2],
        lifestyle: {
          priorities: { quietness: 'HIGH' },
          atmospherePreference: 'Peaceful & Quiet'
        }
      })
    });
    const matchDataAfter = await matchResAfter.json();
    const b1MatchAfter = (matchDataAfter.recommendations || []).find(r => r.propertyId === b1Id || r.property?.id === b1Id);
    assert(!!b1MatchAfter, `B1 re-evaluated by AI matching engine`);
    console.log(`  📊 B1 Updated Match Score (after noiseLevel=LOW & Siruvani Water): ${b1MatchAfter.matchScore}%`);
    assert(b1MatchAfter.matchScore > b1MatchBefore.matchScore, `Dynamic AI Match Score increased from ${b1MatchBefore.matchScore}% to ${b1MatchAfter.matchScore}% based on updated MongoDB data!`);
    assert(b1MatchAfter.whyThisProperty.some(r => r.toLowerCase().includes('quiet') || r.toLowerCase().includes('noise')), `B1 match explanation includes quiet residential zone highlight`);

    // Clean up test properties
    await fetch(`${BASE}/api/properties/${a2Id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: sellerAId }) });
    await fetch(`${BASE}/api/properties/${b1Id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: sellerBId }) });
    await fetch(`${BASE}/api/properties/${b2Id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: sellerBId }) });

    console.log(`\n======================================================================`);
    console.log(`🏁 DATABASE MASTER TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal Database Master Test Suite Error:', err);
    process.exit(1);
  }
}

runDatabaseMasterSuite();
