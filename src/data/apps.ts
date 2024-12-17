import { App } from '../types/app';

export const apps: App[] = [
  // Identity & Access Management
  { id: 'azure-ad', name: 'Azure AD (Entra ID)', category: 'Identity & Access Management' },
  { id: 'google-workspace', name: 'Google Workspace', category: 'Identity & Access Management' },
  { id: 'jumpcloud', name: 'JumpCloud', category: 'Identity & Access Management' },
  { id: 'onelogin', name: 'OneLogin', category: 'Identity & Access Management' },
  { id: 'okta', name: 'Okta', category: 'Identity & Access Management' },
  { id: 'duo', name: 'Duo', category: 'Identity & Access Management' },
  { id: 'lastpass', name: 'Lastpass', category: 'Identity & Access Management' },
  { id: 'workos', name: 'WorkOS', category: 'Identity & Access Management' },

  // HR & People
  { id: 'adp', name: 'ADP', category: 'HR & People' },
  { id: 'bamboohr', name: 'BambooHR', category: 'HR & People' },
  { id: 'charthop', name: 'ChartHop', category: 'HR & People' },
  { id: 'checkr', name: 'Checkr', category: 'HR & People' },
  { id: 'deel', name: 'Deel', category: 'HR & People' },
  { id: 'fountain', name: 'Fountain', category: 'HR & People' },
  { id: 'greenhouse', name: 'Greenhouse', category: 'HR & People' },
  { id: 'hackerrank', name: 'HackerRank', category: 'HR & People' },
  { id: 'hibob', name: 'HiBob', category: 'HR & People' },
  { id: 'ukg', name: 'UKG', category: 'HR & People' },

  // Finance & Operations
  { id: 'bill-com', name: 'Bill.com', category: 'Finance & Operations' },
  { id: 'quickbooks', name: 'Intuit Quickbooks', category: 'Finance & Operations' },
  { id: 'netsuite', name: 'Netsuite', category: 'Finance & Operations' },
  { id: 'ramp', name: 'Ramp', category: 'Finance & Operations' },

  // Development & DevOps
  { id: 'aws', name: 'AWS', category: 'Development & DevOps' },
  { id: 'gcp', name: 'GCP', category: 'Development & DevOps' },
  { id: 'github', name: 'Github', category: 'Development & DevOps' },
  { id: 'datadog', name: 'Datadog', category: 'Development & DevOps' },
  { id: 'dbtcloud', name: 'DBTCloud', category: 'Development & DevOps' },
  { id: 'fivetran', name: 'Fivetran', category: 'Development & DevOps' },
  { id: 'launchdarkly', name: 'LaunchDarkly', category: 'Development & DevOps' },
  { id: 'mode', name: 'Mode Analytics', category: 'Development & DevOps' },
  { id: 'postman', name: 'Postman (Enterprise)', category: 'Development & DevOps' },
  { id: 'sentry', name: 'Sentry', category: 'Development & DevOps' },
  { id: 'snowflake', name: 'Snowflake', category: 'Development & DevOps' },

  // Productivity & Collaboration
  { id: 'adobe', name: 'Adobe', category: 'Productivity & Collaboration' },
  { id: 'asana', name: 'Asana', category: 'Productivity & Collaboration' },
  { id: 'box', name: 'Box', category: 'Productivity & Collaboration' },
  { id: 'calendly', name: 'Calendly', category: 'Productivity & Collaboration' },
  { id: 'canva', name: 'Canva', category: 'Productivity & Collaboration' },
  { id: 'clickup', name: 'ClickUp', category: 'Productivity & Collaboration' },
  { id: 'docusign', name: 'Docusign', category: 'Productivity & Collaboration' },
  { id: 'donut', name: 'Donut', category: 'Productivity & Collaboration' },
  { id: 'dropbox', name: 'Dropbox', category: 'Productivity & Collaboration' },
  { id: 'front', name: 'Front', category: 'Productivity & Collaboration' },
  { id: 'grammarly', name: 'Grammarly', category: 'Productivity & Collaboration' },
  { id: 'lucidchart', name: 'Lucidchart', category: 'Productivity & Collaboration' },
  { id: 'microsoft-365', name: 'Microsoft 365', category: 'Productivity & Collaboration' },
  { id: 'miro', name: 'Miro', category: 'Productivity & Collaboration' },
  { id: 'monday', name: 'Monday.com', category: 'Productivity & Collaboration' },
  { id: 'notion', name: 'Notion', category: 'Productivity & Collaboration' },
  { id: 'slack', name: 'Slack', category: 'Productivity & Collaboration' },
  { id: 'zoom', name: 'Zoom', category: 'Productivity & Collaboration' },

  // Sales & Marketing
  { id: 'gong', name: 'Gong', category: 'Sales & Marketing' },
  { id: 'hubspot', name: 'Hubspot', category: 'Sales & Marketing' },
  { id: 'intercom', name: 'Intercom', category: 'Sales & Marketing' },
  { id: 'leadiq', name: 'LeadIQ', category: 'Sales & Marketing' },
  { id: 'outreach', name: 'Outreach', category: 'Sales & Marketing' },
  { id: 'salesforce', name: 'Salesforce', category: 'Sales & Marketing' },
  { id: 'salesloft', name: 'SalesLoft', category: 'Sales & Marketing' },
  { id: 'seismic', name: 'Seismic Learning', category: 'Sales & Marketing' },
  { id: 'zoominfo', name: 'ZoomInfo (Chorus)', category: 'Sales & Marketing' },

  // Analytics & Customer Success
  { id: 'fullstory', name: 'Fullstory', category: 'Analytics & Customer Success' },
  { id: 'gainsight', name: 'Gainsight', category: 'Analytics & Customer Success' },
  { id: 'gem', name: 'Gem', category: 'Analytics & Customer Success' },
  { id: 'hotjar', name: 'HotJar', category: 'Analytics & Customer Success' },
  { id: 'looker', name: 'Looker', category: 'Analytics & Customer Success' },
  { id: 'segment', name: 'Segment', category: 'Analytics & Customer Success' },
  { id: 'thoughtspot', name: 'ThoughtSpot', category: 'Analytics & Customer Success' },

  // Security & Compliance
  { id: 'code42', name: 'Code42', category: 'Security & Compliance' },
  { id: 'drata', name: 'Drata', category: 'Security & Compliance' },
  { id: 'intune', name: 'Intune', category: 'Security & Compliance' },
  { id: 'jamf', name: 'JAMF', category: 'Security & Compliance' },
  { id: 'kandji', name: 'Kandji', category: 'Security & Compliance' },
  { id: 'knowbe4', name: 'KnowBe4', category: 'Security & Compliance' },
  { id: 'vanta', name: 'Vanta', category: 'Security & Compliance' },
  { id: 'wiz', name: 'Wiz', category: 'Security & Compliance' },

  // Support & Service
  { id: 'freshdesk', name: 'Freshdesk', category: 'Support & Service' },
  { id: 'freshservice', name: 'Freshservice', category: 'Support & Service' },
  { id: 'pagerduty', name: 'Pagerduty', category: 'Support & Service' },
  { id: 'ringcentral', name: 'RingCentral', category: 'Support & Service' },
  { id: 'talkdesk', name: 'Talkdesk', category: 'Support & Service' },
  { id: 'zendesk', name: 'Zendesk', category: 'Support & Service' },

  // Asset & Resource Management
  { id: 'airtable', name: 'Airtable (Enterprise)', category: 'Asset & Resource Management' },
  { id: 'asset-panda', name: 'Asset Panda', category: 'Asset & Resource Management' },
  { id: 'atlassian', name: 'Atlassian', category: 'Asset & Resource Management' },
  { id: 'elastic', name: 'Elastic', category: 'Asset & Resource Management' },
  { id: 'envoy', name: 'Envoy', category: 'Asset & Resource Management' },
  { id: 'fileshare', name: 'Fileshare', category: 'Asset & Resource Management' },
  { id: 'northpass', name: 'Northpass', category: 'Asset & Resource Management' },
  { id: 'shopify', name: 'Shopify', category: 'Asset & Resource Management' },
  { id: 'spotdraft', name: 'Spotdraft', category: 'Asset & Resource Management' },
  { id: 'tray-io', name: 'Tray.io', category: 'Asset & Resource Management' },
];