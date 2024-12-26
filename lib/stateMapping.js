export function getStateFromAreaNumber(areaNumber) {
  // Convert to number if it's a string or BigInt
  const area = Number(areaNumber);
  
  if (area >= 729 && area <= 999) {
    return "Not in use";
  }
  
  const mappings = [
    { range: [1, 3], state: "New Hampshire" },
    { range: [4, 7], state: "Maine" },
    { range: [8, 9], state: "Vermont" },
    { range: [10, 34], state: "Massachusetts" },
    { range: [35, 39], state: "Rhode Island" },
    { range: [40, 49], state: "Connecticut" },
    { range: [50, 134], state: "New York" },
    { range: [135, 158], state: "New Jersey" },
    { range: [159, 211], state: "Pennsylvania" },
    { range: [212, 220], state: "Maryland" },
    { range: [221, 222], state: "Delaware" },
    { range: [223, 231], state: "Virginia" },
    { range: [232, 232], state: "North Carolina/West Virginia" },
    { range: [233, 236], state: "West Virginia" },
    { range: [237, 246], state: "North Carolina" },
    { range: [247, 251], state: "South Carolina" },
    { range: [252, 260], state: "Georgia" },
    { range: [261, 267], state: "Florida" },
    { range: [268, 302], state: "Ohio" },
    { range: [303, 317], state: "Indiana" },
    { range: [318, 361], state: "Illinois" },
    { range: [362, 386], state: "Michigan" },
    { range: [387, 399], state: "Wisconsin" },
    { range: [400, 407], state: "Kentucky" },
    { range: [408, 415], state: "Tennessee" },
    { range: [416, 424], state: "Alabama" },
    { range: [425, 428], state: "Mississippi" },
    { range: [429, 432], state: "Arkansas" },
    { range: [433, 439], state: "Louisiana" },
    { range: [440, 448], state: "Oklahoma" },
    { range: [449, 467], state: "Texas" },
    { range: [468, 477], state: "Minnesota" },
    { range: [478, 485], state: "Iowa" },
    { range: [486, 500], state: "Missouri" },
    { range: [501, 502], state: "North Dakota" },
    { range: [503, 504], state: "South Dakota" },
    { range: [505, 508], state: "Nebraska" },
    { range: [509, 515], state: "Kansas" },
    { range: [516, 517], state: "Montana" },
    { range: [518, 519], state: "Idaho" },
    { range: [520, 520], state: "Wyoming" },
    { range: [521, 524], state: "Colorado" },
    { range: [525, 525], state: "New Mexico" },
    { range: [526, 526], state: "Arizona" },
    { range: [527, 527], state: "Arizona" },
    { range: [528, 529], state: "Utah" },
    { range: [530, 530], state: "Nevada" },
    { range: [531, 539], state: "Washington" },
    { range: [540, 544], state: "Oregon" },
    { range: [545, 573], state: "California" },
    { range: [574, 574], state: "Alaska" },
    { range: [575, 576], state: "Hawaii" },
    { range: [577, 579], state: "District of Columbia" },
    { range: [580, 580], state: "Virgin Islands" },
    { range: [581, 584], state: "Puerto Rico" },
    { range: [585, 585], state: "New Mexico" },
    { range: [586, 586], state: "Pacific Territories" },
    { range: [587, 588], state: "Mississippi" },
    { range: [589, 595], state: "Florida" },
    { range: [600, 601], state: "Arizona" },
    { range: [602, 626], state: "California" },
    { range: [700, 728], state: "Railroad Retirement" }
  ];

  for (const { range, state } of mappings) {
    if (area >= range[0] && area <= range[1]) {
      return state;
    }
  }
  
  return "Unknown";
} 