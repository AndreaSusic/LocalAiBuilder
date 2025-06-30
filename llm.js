// LLM query builder for stock image searches
async function buildQueries(serviceType, country) {
  // For now, return predefined queries - in production would use OpenAI API
  const queries = {
    'dentist': [
      `dentist ${country} smiling professional`,
      `dental clinic interior ${country}`,
      `dental equipment modern office`
    ],
    'lawyer': [
      `lawyer ${country} professional portrait`,
      `law office interior ${country}`,
      `legal consultation meeting`
    ],
    'restaurant': [
      `chef ${country} professional kitchen`,
      `restaurant interior ${country}`,
      `food preparation professional`
    ]
  };

  return queries[serviceType.toLowerCase()] || [
    `${serviceType} professional ${country}`,
    `${serviceType} office interior`,
    `${serviceType} business professional`
  ];
}

module.exports = {
  buildQueries
};