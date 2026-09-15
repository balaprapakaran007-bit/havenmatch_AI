const BASE = 'http://localhost:5000';

async function runMasterTestSuite() {
  console.log('======================================================================');
  console.log('🌟 HAVENMATCH AI — MASTER PRODUCTION E2E VERIFICATION SUITE');
  console.log('   Testing: Real Data + Owner/Seller + Buyer + AI Match + Saved + DB');
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

    // =========================================================================
    // TEST A — SELLER A & 3 PROPERTIES (A1, A2, A3)
    // =========================================================================
    console.log('\n--- TEST A: Seller A Setup & Property Creation (A1, A2, A3) ---');
    const ts = Date.now();
    const sellerAEmail = `seller_a_${ts}@havenmatch.io`;
    const sellerAPhone = `+91 98401 ${String(ts).slice(-5)}`;

    const sellerAProfileRes = await fetch(`${BASE}/api/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sellerAEmail,
        name: 'Arunachalam (Seller A)',
        phone: sellerAPhone,
        role: 'SELLER',
        ownerType: 'OWNER',
        location: 'Peelamedu, Coimbatore',
        bio: 'Direct owner of prime properties in Peelamedu & RS Puram.'
      })
    });
    const sellerAData = await sellerAProfileRes.json();
    assert(sellerAProfileRes.ok, `Seller A profile created in MongoDB`);
    const sellerAId = sellerAData.user?.userId || sellerAData.user?.id;
    assert(!!sellerAId, `Seller A ID: ${sellerAId}`);

    // A1 (BUY)
    const propA1Res = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'A1 - Luxury 3BHK Apartment in Peelamedu',
        intent: 'BUY',
        listingType: 'BUY',
        propertyType: 'Apartment',
        price: 7500000,
        bhk: 3,
        city: 'Coimbatore',
        locality: 'Peelamedu',
        sellerId: sellerAId,
        sellerEmail: sellerAEmail,
        sellerName: 'Arunachalam (Seller A)',
        noiseLevel: 'LOW',
        waterSupply: '24/7 Siruvani + Borewell',
        petFriendly: true,
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200']
      })
    });
    const propA1 = (await propA1Res.json()).property;
    const a1Id = propA1.id || propA1._id;
    assert(propA1Res.ok && !!a1Id, `A1 (BUY) created in MongoDB with ID: ${a1Id}`);

    // A2 (BUY)
    const propA2Res = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'A2 - Modern 2BHK Flat in RS Puram',
        intent: 'BUY',
        listingType: 'BUY',
        propertyType: 'Apartment',
        price: 5800000,
        bhk: 2,
        city: 'Coimbatore',
        locality: 'RS Puram',
        sellerId: sellerAId,
        sellerEmail: sellerAEmail,
        sellerName: 'Arunachalam (Seller A)',
        noiseLevel: 'LOW',
        waterSupply: 'Siruvani Water',
        petFriendly: false,
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200']
      })
    });
    const propA2 = (await propA2Res.json()).property;
    const a2Id = propA2.id || propA2._id;
    assert(propA2Res.ok && !!a2Id, `A2 (BUY) created in MongoDB with ID: ${a2Id}`);

    // A3 (RENT)
    const propA3Res = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'A3 - Spacious 2BHK Rental Home in Peelamedu',
        intent: 'RENT',
        listingType: 'RENT',
        propertyType: 'Apartment',
        price: 22000,
        bhk: 2,
        city: 'Coimbatore',
        locality: 'Peelamedu',
        sellerId: sellerAId,
        sellerEmail: sellerAEmail,
        sellerName: 'Arunachalam (Seller A)',
        noiseLevel: 'MEDIUM',
        waterSupply: 'Corporation Water',
        petFriendly: true,
        images: ['https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200']
      })
    });
    const propA3 = (await propA3Res.json()).property;
    const a3Id = propA3.id || propA3._id;
    assert(propA3Res.ok && !!a3Id, `A3 (RENT) created in MongoDB with ID: ${a3Id}`);

    // =========================================================================
    // TEST B — SELLER B & 2 PROPERTIES (B1, B2)
    // =========================================================================
    console.log('\n--- TEST B: Seller B Setup & Property Creation (B1, B2) ---');
    const sellerBEmail = `seller_b_${ts}@havenmatch.io`;
    const sellerBPhone = `+91 98402 ${String(ts).slice(-5)}`;

    const sellerBProfileRes = await fetch(`${BASE}/api/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sellerBEmail,
        name: 'Bhavani Shankar (Seller B)',
        phone: sellerBPhone,
        role: 'SELLER',
        ownerType: 'OWNER',
        location: 'Race Course, Coimbatore',
        bio: 'Independent owner offering luxury villas and executive rentals.'
      })
    });
    const sellerBData = await sellerBProfileRes.json();
    assert(sellerBProfileRes.ok, `Seller B profile created in MongoDB`);
    const sellerBId = sellerBData.user?.userId || sellerBData.user?.id;
    assert(!!sellerBId, `Seller B ID: ${sellerBId}`);

    // B1 (BUY)
    const propB1Res = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'B1 - Elite 4BHK Villa in Race Course',
        intent: 'BUY',
        listingType: 'BUY',
        propertyType: 'Villa',
        price: 18500000,
        bhk: 4,
        city: 'Coimbatore',
        locality: 'Race Course',
        sellerId: sellerBId,
        sellerEmail: sellerBEmail,
        sellerName: 'Bhavani Shankar (Seller B)',
        noiseLevel: 'LOW',
        waterSupply: '24/7 Siruvani',
        petFriendly: true,
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200']
      })
    });
    const propB1 = (await propB1Res.json()).property;
    const b1Id = propB1.id || propB1._id;
    assert(propB1Res.ok && !!b1Id, `B1 (BUY) created in MongoDB with ID: ${b1Id}`);

    // B2 (RENT)
    const propB2Res = await fetch(`${BASE}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'B2 - Executive 1BHK Studio Rental in Race Course',
        intent: 'RENT',
        listingType: 'RENT',
        propertyType: 'Studio Apartment',
        price: 18000,
        bhk: 1,
        city: 'Coimbatore',
        locality: 'Race Course',
        sellerId: sellerBId,
        sellerEmail: sellerBEmail,
        sellerName: 'Bhavani Shankar (Seller B)',
        noiseLevel: 'LOW',
        waterSupply: 'Corporation Water',
        petFriendly: false,
        images: ['https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200']
      })
    });
    const propB2 = (await propB2Res.json()).property;
    const b2Id = propB2.id || propB2._id;
    assert(propB2Res.ok && !!b2Id, `B2 (RENT) created in MongoDB with ID: ${b2Id}`);

    // =========================================================================
    // TEST C — BUYER PROPERTY FEED (MUST SEE PROPERTIES FROM ALL SELLERS)
    // =========================================================================
    console.log('\n--- TEST C: Buyer Property Feed (Properties from ALL Sellers) ---');
    const buyerEmail = `buyer_${ts}@havenmatch.io`;
    const buyerProfileRes = await fetch(`${BASE}/api/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: buyerEmail,
        name: 'Karthik Raja (Buyer)',
        phone: `+91 98403 ${String(ts).slice(-5)}`,
        role: 'BUYER',
        location: 'Coimbatore'
      })
    });
    const buyerData = await buyerProfileRes.json();
    const buyerId = buyerData.user?.userId || buyerData.user?.id;
    assert(buyerProfileRes.ok && !!buyerId, `Buyer account registered: ${buyerEmail} (${buyerId})`);

    const feedRes = await fetch(`${BASE}/api/properties/list`);
    const feedData = await feedRes.json();
    assert(feedRes.ok, `GET /api/properties/list returns 200 OK`);
    const allProps = feedData.properties || [];

    const foundA1 = allProps.find(p => (p.id === a1Id || p.propertyId === a1Id));
    const foundA2 = allProps.find(p => (p.id === a2Id || p.propertyId === a2Id));
    const foundA3 = allProps.find(p => (p.id === a3Id || p.propertyId === a3Id));
    const foundB1 = allProps.find(p => (p.id === b1Id || p.propertyId === b1Id));
    const foundB2 = allProps.find(p => (p.id === b2Id || p.propertyId === b2Id));

    assert(!!foundA1 && !!foundA2 && !!foundA3, `Buyer feed contains all Seller A properties (A1, A2, A3)`);
    assert(!!foundB1 && !!foundB2, `Buyer feed contains all Seller B properties (B1, B2)`);

    // =========================================================================
    // TEST D — BUY FILTER
    // =========================================================================
    console.log('\n--- TEST D: BUY Filter Verification ---');
    const buyRes = await fetch(`${BASE}/api/properties/list?intent=BUY`);
    const buyData = await buyRes.json();
    assert(buyRes.ok, `GET /api/properties/list?intent=BUY returns 200 OK`);
    const buyProps = buyData.properties || [];
    const hasOnlyBuy = buyProps.every(p => p.intent === 'BUY' || p.listingType === 'BUY' || p.intent === 'SELL');
    assert(hasOnlyBuy, `All properties returned under BUY filter have intent = BUY`);
    assert(buyProps.some(p => p.id === a1Id || p.propertyId === a1Id), `BUY list includes A1`);
    assert(buyProps.some(p => p.id === b1Id || p.propertyId === b1Id), `BUY list includes B1`);
    assert(!buyProps.some(p => p.id === a3Id || p.id === b2Id), `BUY list excludes RENT properties (A3, B2)`);

    // =========================================================================
    // TEST E — RENT FILTER
    // =========================================================================
    console.log('\n--- TEST E: RENT Filter Verification ---');
    const rentRes = await fetch(`${BASE}/api/properties/list?intent=RENT`);
    const rentData = await rentRes.json();
    assert(rentRes.ok, `GET /api/properties/list?intent=RENT returns 200 OK`);
    const rentProps = rentData.properties || [];
    const hasOnlyRent = rentProps.every(p => p.intent === 'RENT' || p.listingType === 'RENT' || p.intent === 'RENT_OUT');
    assert(hasOnlyRent, `All properties returned under RENT filter have intent = RENT`);
    assert(rentProps.some(p => p.id === a3Id || p.propertyId === a3Id), `RENT list includes A3`);
    assert(rentProps.some(p => p.id === b2Id || p.propertyId === b2Id), `RENT list includes B2`);
    assert(!rentProps.some(p => p.id === a1Id || p.id === a2Id || p.id === b1Id), `RENT list excludes BUY properties (A1, A2, B1)`);

    // =========================================================================
    // TEST F — AI MATCH SCORE & RECALCULATION
    // =========================================================================
    console.log('\n--- TEST F: AI Match Scoring & Real Data Differentiation ---');
    const matchRes1 = await fetch(`${BASE}/api/matching/buyer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: buyerId,
        intent: 'BUY',
        city: 'Coimbatore',
        budgetMax: 8000000,
        bhk: [3],
        preferredLocalities: ['Peelamedu'],
        lifestyle: {
          priorities: { quietness: 'HIGH', commute: 'HIGH' },
          atmospherePreference: 'Peaceful & Quiet',
          hasPets: true
        }
      })
    });
    const matchData1 = await matchRes1.json();
    assert(matchRes1.ok, `POST /api/matching/buyer returns 200 OK`);
    const recs = matchData1.recommendations || [];
    assert(recs.length > 0, `AI Matching Engine returned ${recs.length} ranked recommendations`);

    const a1Match = recs.find(r => r.propertyId === a1Id || r.property?.id === a1Id);
    const b1Match = recs.find(r => r.propertyId === b1Id || r.property?.id === b1Id);
    assert(!!a1Match, `A1 scored by matching engine`);
    assert(!!b1Match, `B1 scored by matching engine`);

    if (a1Match && b1Match) {
      console.log(`  📊 A1 Match Score (within ₹80L budget, 3BHK Peelamedu): ${a1Match.matchScore}%`);
      console.log(`  📊 B1 Match Score (exceeds budget at ₹1.85 Cr, 4BHK): ${b1Match.matchScore}%`);
      assert(a1Match.matchScore > b1Match.matchScore, `A1 scores significantly higher than B1 due to exact budget and BHK fit (${a1Match.matchScore}% vs ${b1Match.matchScore}%)`);
      assert(a1Match.whyThisProperty?.length > 0, `A1 has genuine why-this-property bullet points derived from real data`);
      assert(b1Match.tradeOffs?.length > 0, `B1 has genuine trade-offs explaining budget / BHK variance`);
    }

    // =========================================================================
    // TEST G — SAVE PROPERTY (SHORTLISTS IN MONGODB)
    // =========================================================================
    console.log('\n--- TEST G: Save Property B1 into Shortlists Collection ---');
    const saveRes = await fetch(`${BASE}/api/saved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: buyerId, propertyId: b1Id })
    });
    assert(saveRes.ok, `POST /api/saved saved B1 to database`);

    const getSavedRes = await fetch(`${BASE}/api/saved?userId=${encodeURIComponent(buyerId)}`);
    const getSavedData = await getSavedRes.json();
    assert(getSavedRes.ok, `GET /api/saved returns saved list for buyer`);
    const savedIds = (getSavedData.shortlists || []).map(s => s.propertyId);
    assert(savedIds.includes(b1Id), `Saved properties contains B1 (${b1Id})`);

    // =========================================================================
    // TEST H — VIEW PROPERTY BY UNIQUE ID
    // =========================================================================
    console.log('\n--- TEST H: View Single Property by Unique ID ---');
    const viewB1Res = await fetch(`${BASE}/api/properties/${b1Id}`);
    const viewB1Data = await viewB1Res.json();
    assert(viewB1Res.ok, `GET /api/properties/${b1Id} returns 200 OK`);
    assert(viewB1Data.property?.id === b1Id, `Property ID matches requested B1 ID`);
    assert(viewB1Data.property?.price === 18500000, `Price matches database record (₹1.85 Cr)`);
    assert(viewB1Data.property?.seller?.name === 'Bhavani Shankar (Seller B)', `Owner details match Seller B`);

    // =========================================================================
    // TEST I — EXPRESS INTEREST
    // =========================================================================
    console.log('\n--- TEST I: Express Interest on B1 ---');
    const interestRes = await fetch(`${BASE}/api/interest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: buyerId,
        propertyId: b1Id,
        message: 'Hello, I am interested in this luxury 4BHK villa.'
      })
    });
    const interestData = await interestRes.json();
    assert(interestRes.ok, `POST /api/interest returns 200 OK`);
    assert(interestData.message === 'Interest sent successfully.', `Response returns message: "Interest sent successfully."`);
    assert(interestData.interest?.sellerId === sellerBId, `Interest record resolved real sellerId (${sellerBId})`);

    // =========================================================================
    // TEST J — SCHEDULE VISIT
    // =========================================================================
    console.log('\n--- TEST J: Schedule Property Visit for B1 ---');
    const visitRes = await fetch(`${BASE}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitData: {
          buyerId,
          buyerName: 'Karthik Raja (Buyer)',
          propertyId: b1Id,
          sellerId: sellerBId,
          date: '2026-09-22',
          timeSlot: '11:00 AM',
          notes: 'Looking forward to weekend walkthrough.'
        }
      })
    });
    const visitData = await visitRes.json();
    assert(visitRes.ok, `POST /api/visits scheduled visit successfully`);
    assert(visitData.visit?.propertyId === b1Id, `Visit record references property B1`);
    assert(visitData.visit?.status === 'Scheduled', `Visit status is Scheduled`);

    // =========================================================================
    // TEST K — SECURITY & 403 AUTHORIZATION (CROSS-OWNER PROTECTION)
    // =========================================================================
    console.log('\n--- TEST K: Security & Authorization (403 on Cross-Owner Edit/Delete) ---');
    
    // Seller A tries to edit Seller B's property (B1)
    const unauthorizedEditRes = await fetch(`${BASE}/api/properties/${b1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'HACKED TITLE BY SELLER A',
        price: 100,
        userId: sellerAId,
        userEmail: sellerAEmail
      })
    });
    assert(unauthorizedEditRes.status === 403, `Seller A cannot edit Seller B's property -> 403 Forbidden (${unauthorizedEditRes.status})`);

    // Seller A tries to delete Seller B's property (B1)
    const unauthorizedDelRes = await fetch(`${BASE}/api/properties/${b1Id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: sellerAId,
        userEmail: sellerAEmail
      })
    });
    assert(unauthorizedDelRes.status === 403, `Seller A cannot delete Seller B's property -> 403 Forbidden (${unauthorizedDelRes.status})`);

    // Verify B1 is completely intact
    const verifyIntactRes = await fetch(`${BASE}/api/properties/${b1Id}`);
    const verifyIntactData = await verifyIntactRes.json();
    assert(verifyIntactData.property?.price === 18500000, `B1 remains completely unchanged in MongoDB`);

    // Clean up test properties
    await fetch(`${BASE}/api/properties/${a1Id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: sellerAId }) });
    await fetch(`${BASE}/api/properties/${a2Id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: sellerAId }) });
    await fetch(`${BASE}/api/properties/${a3Id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: sellerAId }) });
    await fetch(`${BASE}/api/properties/${b1Id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: sellerBId }) });
    await fetch(`${BASE}/api/properties/${b2Id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: sellerBId }) });

    console.log(`\n======================================================================`);
    console.log(`🏁 MASTER TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal Master Test Suite Execution Error:', err);
    process.exit(1);
  }
}

runMasterTestSuite();
