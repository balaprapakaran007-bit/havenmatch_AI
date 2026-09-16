import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLifestyleMatch } from '../controllers/matchingController.js';

test('AI Matching Engine - Dynamic Score Calculation (No Mock Scores)', () => {
  const sampleProperty = {
    id: 'prop-test-1',
    title: 'Modern 3 BHK Villa in RS Puram',
    city: 'Coimbatore',
    locality: 'RS Puram',
    price: 12500000,
    bhk: 3,
    intent: 'BUY',
    status: 'ACTIVE',
    builtUpAreaSqFt: 2200
  };

  const buyerCriteria = {
    intent: 'BUY',
    city: 'Coimbatore',
    preferredLocalities: ['RS Puram'],
    budgetMax: 15000000,
    bhk: [3]
  };

  const matchResult = calculateLifestyleMatch(sampleProperty, buyerCriteria);

  assert.ok(matchResult, 'Match result should be generated');
  assert.ok(typeof matchResult.matchScore === 'number', 'Score must be a number');
  assert.ok(matchResult.matchScore >= 45 && matchResult.matchScore <= 98, 'Match score must be bounded between 45% and 98%');
  assert.ok(matchResult.whyThisProperty.length > 0, 'Explanation reasons must be provided');
});
