// for demonstration purposes only
export function intToUUID(n) {
  if (typeof n !== "bigint") {
    n = BigInt(n);
  }
  if (n < 0n) throw new Error("Number must be non-negative");
  if (n >= 1n << 122n) throw new Error("Number too large (max 122 bits)");

  // Layout the bits for SSN:
  // - 3 digits (9 bits) for area number
  // - 2 digits (7 bits) for group number 
  // - 4 digits (14 bits) for serial number

  const areaNumber = n & 0x1ffn; // 9 bits for 3 digits (000-999)
  const groupNumber = (n >> 9n) & 0x7fn; // 7 bits for 2 digits (00-99)
  const serialNumber = (n >> 16n) & 0x3fffn; // 14 bits for 4 digits (0000-9999)

  // Add version 4 and variant 2
  // const timeHiAndVersion = timeHi | 0x4000n;
  // const clockSeqAndReserved = clockSeq | 0x8000n;

  // Convert to decimal strings with padding
  const p1 = timeLow.toString(10).padStart(3, "0");
  const p2 = timeMid.toString(10).padStart(2, "0");
  const p3 = timeHiAndVersion.toString(10).padStart(4, "0");

  return `${p1}-${p2}-${p3}`;
}

const ROUND_CONSTANTS = [
  BigInt("0x123456789"), // Area number mixing constant
  BigInt("0x987654321"), // Group number mixing constant 
  BigInt("0x246813579"), // Serial number mixing constant
  BigInt("0x135792468"), // Additional mixing for area
  BigInt("0x975318642"), // Additional mixing for group
  BigInt("0x864209753"), // Additional mixing for serial
  BigInt("0x951847362"), // Final area mixing
  BigInt("0x753951846"), // Final group/serial mixing
];

// N has one bit from left and one from right (2 for variant)
// bits from left          bits from right
// ------------------------------------
// |                  |                |
// xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx

// just using 4 rounds seems to produce a good enough distribution to appear
// random
const ROUNDS_USED = 4;

export function indexToUUID(index) {
  if (index < 0n) {
    throw new Error("Index must be non-negative");
  }

  // Calculate valid area number (001-899, excluding 666)
  let areaNumber = (index % 898n) + 1n; // 1-898
  if (areaNumber >= 666n) {
    areaNumber += 1n; // Skip 666
  }

  // Group number (01-99)
  const groupNumber = ((index / 898n) % 99n) + 1n;

  // Serial number (0001-9999)
  const serialNumber = ((index / (898n * 99n)) % 9999n) + 1n;

  // Check if the index is too large
  if (index >= 898n * 99n * 9999n) {
    throw new Error("Index out of range");
  }

  // Convert to decimal strings with padding
  const p1 = areaNumber.toString(10).padStart(3, "0");
  const p2 = groupNumber.toString(10).padStart(2, "0");
  const p3 = serialNumber.toString(10).padStart(4, "0");

  return `${p1}-${p2}-${p3}`;
}

export function uuidToIndex(ssn) {
  // Handle partial SSN searches
  if (!ssn.match(/^\d{3}-\d{2}-\d{4}$/)) {
    // If it's not a complete SSN, return null or throw error
    return null;
  }

  // Parse the SSN string only if it's complete
  const [area, group, serial] = ssn.split('-').map(part => BigInt(parseInt(part, 10)));
  
  // Rest of validation and conversion...
  if (area <= 0n || area >= 900n || area === 666n) {
    throw new Error("Invalid area number");
  }
  if (group <= 0n || group > 99n) {
    throw new Error("Invalid group number");
  }
  if (serial <= 0n || serial > 9999n) {
    throw new Error("Invalid serial number");
  }

  let areaIndex = area;
  if (area > 666n) {
    areaIndex -= 1n;
  }
  areaIndex -= 1n;

  return (serial - 1n) * (898n * 99n) + 
         (group - 1n) * 898n + 
         areaIndex;
}
