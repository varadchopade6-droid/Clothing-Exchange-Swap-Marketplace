const categoryBase = { shirt: 850, tshirt: 600, 't-shirt': 600, jacket: 1800, jeans: 1400, trousers: 1200, dress: 1600, shoes: 1900, sweater: 1300, skirt: 1000, default: 1000 };
const premiumBrands = ['levi', 'zara', 'nike', 'adidas', 'uniqlo', 'fabindia', 'mango', 'marks'];
const conditionMultiplier = { 'new with tags': 1.2, 'like new': 1.05, good: 0.82, fair: 0.58 };

export function calculateValue({ type, brand, condition }) {
  if (!type || !brand || !condition || !conditionMultiplier[condition]) throw new Error('Type, brand, and a valid condition are required for valuation.');
  const normalized = type.toLowerCase().replace(/\s/g, '');
  const base = categoryBase[normalized] || categoryBase.default;
  const brandMultiplier = premiumBrands.some((name) => brand.toLowerCase().includes(name)) ? 1.18 : 1;
  return { baseValue: base, brandMultiplier, conditionMultiplier: conditionMultiplier[condition], estimatedValue: Math.round(base * brandMultiplier * conditionMultiplier[condition]), explanation: `₹${base} category base × ${brandMultiplier} brand tier × ${conditionMultiplier[condition]} condition.` };
}

export function compareValues(offeredValue, requestedValue) {
  const difference = offeredValue - requestedValue;
  return { offeredValue, requestedValue, difference: Math.abs(difference), direction: difference === 0 ? 'even' : difference > 0 ? 'offered item is higher' : 'requested item is higher', balance: Math.abs(difference) <= Math.max(offeredValue, requestedValue) * 0.15 ? 'close match' : 'value difference to discuss' };
}
