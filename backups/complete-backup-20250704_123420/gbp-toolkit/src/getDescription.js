import { businessInfoClient } from './googleClient.js';
import dotenv from 'dotenv';
dotenv.config();

export async function fetchDescription(locationId = process.env.LOCATION_ID) {
  const gmb = businessInfoClient();
  const res = await gmb.locations.get({
    name: `locations/${locationId}`,
    readMask: 'attributes'
  });

  const attr = res.data.attributes?.find(a => a.attributeId === 'general:DESCRIPTION');
  return attr?.values?.[0]?.stringValue || '(No description set)';
}

// Run from CLI:  npm run get:description
if (process.argv[1].includes('getDescription.js')) {
  fetchDescription().then(console.log).catch(err => {
    console.error('❌ Error fetching description:', err.response?.data || err.message);
    process.exit(1);
  });
}