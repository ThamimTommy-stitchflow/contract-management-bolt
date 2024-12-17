import { ServiceDetails } from '../types/app';

export function calculateTotalCost(costPerUser: string, numberOfLicenses: string): string {
  // Remove any non-numeric characters except decimal points
  const cleanCost = costPerUser.replace(/[^\d.]/g, '');
  const cleanLicenses = numberOfLicenses.replace(/[^\d.]/g, '');

  // Parse the cleaned values
  const cost = parseFloat(cleanCost);
  const licenses = parseFloat(cleanLicenses);

  // Check if both values are valid numbers
  if (!isNaN(cost) && !isNaN(licenses)) {
    const total = cost * licenses;
    // Format with 2 decimal places
    return total.toFixed(2);
  }

  // Return empty string if calculation isn't possible
  return '';
}

export function calculateOverallTotalValue(services: ServiceDetails[]): string {
  // Filter out services with empty or invalid total costs
  const validTotalCosts = services
    .map(service => parseFloat(service.totalCost))
    .filter(cost => !isNaN(cost));

  // If there are no valid costs, return empty string
  if (validTotalCosts.length === 0) {
    return '';
  }

  // Sum up all valid total costs
  const overallTotal = validTotalCosts.reduce((sum, cost) => sum + cost, 0);
  
  // Format with 2 decimal places
  return overallTotal.toFixed(2);
}