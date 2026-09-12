/**
 * HavenMatch AI - SNS Workbench API Configuration
 * Connected to SNS Workbench Workflow Agent Webhook:
 * https://api.agents.snsihub.ai/webhook/havenmatch/match
 */
export const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.agents.snsihub.ai',
  MATCH_WEBHOOK_URL: (import.meta as any).env?.VITE_MATCH_WEBHOOK_URL || 'https://api.agents.snsihub.ai/webhook/havenmatch/match',
  MATCH_WEBHOOK_TEST_URL: (import.meta as any).env?.VITE_MATCH_WEBHOOK_TEST_URL || 'https://api.agents.snsihub.ai/webhook-test/havenmatch/match',
  IS_MOCK_MODE: false,
  ENDPOINTS: {
    PROPERTIES: '/properties',
    MATCHING: '/webhook/havenmatch/match',
    MATCHING_TEST: '/webhook-test/havenmatch/match',
    LOCATION: '/location/intelligence',
    BUYER_PROFILE: '/buyer/profile',
    VISITS: '/visits',
    MESSAGES: '/messages',
    COMPATIBLE_BUYERS: '/seller/compatible-buyers'
  }
};

