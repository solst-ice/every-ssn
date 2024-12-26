import React from "react";
import { uuidToIndex, indexToUUID } from "../lib/uuidTools";
import { MAX_UUID } from "../lib/constants";
const PADDING_SENTINEL = "X";

function getPatternWithPadding(search, leftPadding) {
  const uuidTemplate = `001-01-0001`;

  for (let pos = 0; pos < search.length; pos++) {
    const patternPos = leftPadding + pos;
    const inputChar = search[pos];
    const templateChar = uuidTemplate[patternPos];

    if (
      (inputChar === "-" && templateChar !== "-") ||
      (templateChar === "-" && inputChar !== "-")
    ) {
      return null;
    }
  }

  const pattern =
    uuidTemplate.slice(0, leftPadding) +
    search +
    uuidTemplate.slice(leftPadding + search.length);

  const sections = pattern.split("-");
  if (
    sections[0].length === 3 &&
    sections[1].length === 2 &&
    sections[2].length === 4 
  ) {
    return pattern;
  }

  return null;
}

function getAllValidPatterns(search) {
  const patterns = [];
  const uuidTemplate = `001-01-0001`;

  for (
    let leftPadding = 0;
    leftPadding < uuidTemplate.length - search.length + 1;
    leftPadding++
  ) {
    const pattern = getPatternWithPadding(search, leftPadding);
    if (pattern) {
      patterns.push({ pattern, leftPadding });
    }
  }

  return patterns;
}

function generateRandomUUID(pattern) {
  // Try up to 100 times to generate a valid SSN
  for (let attempts = 0; attempts < 100; attempts++) {
    const result = pattern
      .replace(
        new RegExp(PADDING_SENTINEL, "g"),
        () => "0123456789"[Math.floor(Math.random() * 10)]
      );

    // Validate the generated SSN
    const [area, group, serial] = result.split('-').map(n => parseInt(n, 10));
    
    // Check area number (001-899, excluding 666)
    if (area <= 0 || area >= 900 || area === 666) {
      continue;
    }

    // Check group number (01-99) 
    if (group <= 0 || group > 99) {
      continue;
    }

    // Check serial number (0001-9999)
    if (serial <= 0 || serial > 9999) {
      continue;
    }

    return result;
  }

  // If we couldn't generate a valid SSN after max attempts, return a default valid SSN
  console.warn("Could not generate valid SSN after max attempts");
  return "001-01-0001";
}

const SEARCH_LOOKBACK = 50;
const SEARCH_LOOKAHEAD = 25;
const RANDOM_SEARCH_ITERATIONS = 1000;

export function useUUIDSearch({ virtualPosition, displayedUUIDs }) {
  const [search, setSearch] = React.useState(null);
  const [uuid, setUUID] = React.useState(null);
  // Stack of complete states we've seen
  const [nextStates, setNextStates] = React.useState([]);

  const previousUUIDs = React.useMemo(() => {
    let hasComputed = false;
    let value = null;
    const getValue = () => {
      const compute = () => {
        const prev = [];
        for (let i = 1; i <= SEARCH_LOOKBACK; i++) {
          i = BigInt(i);
          let index = BigInt(virtualPosition) - i;
          if (index < 0n) {
            index = MAX_UUID + index;
          }
          const uuid = indexToUUID(index);
          prev.push({ index, uuid });
        }
        return prev;
      };
      if (!hasComputed) {
        value = compute();
        hasComputed = true;
      }
      return value;
    };
    return getValue;
  }, [virtualPosition]);

  const nextUUIDs = React.useMemo(() => {
    let hasComputed = false;
    let value = null;
    const getValue = () => {
      const compute = () => {
        const next = [];
        for (let i = 1; i <= SEARCH_LOOKAHEAD; i++) {
          i = BigInt(i);
          let index = virtualPosition + i;
          if (index > MAX_UUID) {
            index = index - MAX_UUID;
          }
          const uuid = indexToUUID(index);
          next.push({ index, uuid });
        }
        return next;
      };
      if (!hasComputed) {
        value = compute();
        hasComputed = true;
      }
      return value;
    };
    return getValue;
  }, [virtualPosition]);

  const searchAround = React.useCallback(
    ({ input, wantHigher, canUseCurrentIndex }) => {
      if (wantHigher) {
        const startPosition = canUseCurrentIndex ? 0 : 1;
        for (let i = startPosition; i < displayedUUIDs.length; i++) {
          const uuid = displayedUUIDs[i].uuid;
          if (uuid.includes(input)) {
            return { uuid, index: displayedUUIDs[i].index };
          }
        }
        const next = nextUUIDs();
        for (let i = 0; i < next.length; i++) {
          const uuid = next[i].uuid;
          if (uuid.includes(input)) {
            return { uuid, index: nextUUIDs[i].index };
          }
        }
      } else {
        // canUseCurrentIndex isn't relevant when searching backwards!
        const prev = previousUUIDs();
        for (const { uuid, index } of prev) {
          if (uuid.includes(input)) {
            return { uuid, index };
          }
        }
      }
      return null;
    },
    [displayedUUIDs, previousUUIDs, nextUUIDs]
  );

  const searchRandomly = React.useCallback(
    ({ input, wantHigher }) => {
      const patterns = getAllValidPatterns(input);
      if (patterns.length === 0) return null;
      let best = null;
      let compareIndex = virtualPosition;
      for (let i = 0; i < RANDOM_SEARCH_ITERATIONS; i++) {
        const { pattern, leftPadding } =
          patterns[Math.floor(Math.random() * patterns.length)];
        const uuid = generateRandomUUID(pattern);
        const index = uuidToIndex(uuid);
        const satisfiesConstraint = wantHigher
          ? index > compareIndex
          : index < compareIndex;
        const notInHistory = !nextStates.some(
          ({ uuid: nextUUID }) => nextUUID === uuid
        );
        if (satisfiesConstraint && notInHistory) {
          const isBetter =
            best === null
              ? true
              : wantHigher
                ? index < best.index
                : index > best.index;
          if (isBetter) {
            best = { uuid, pattern, leftPadding, index };
          }
        }
      }
      if (best) {
        return best;
      }
      const { pattern: fallbackPattern, leftPadding: fallbackLeftPadding } =
        patterns[Math.floor(Math.random() * patterns.length)];
      return {
        uuid: generateRandomUUID(fallbackPattern),
        pattern: fallbackPattern,
        leftPadding: fallbackLeftPadding,
        index: uuidToIndex(uuid),
      };
    },
    [nextStates, uuid, virtualPosition]
  );

  const searchUUID = React.useCallback(
    (input) => {
      const invalid = input.toLowerCase().replace(/[^0-9-]/g, "");
      if (invalid !== input) {
        return null;
      }
      const newSearch = input.toLowerCase().replace(/[^0-9-]/g, "");
      if (!newSearch) return null;

      // Clear next states stack when search changes
      setNextStates([]);

      const inner = () => {
        const around = searchAround({
          input,
          wantHigher: true,
          canUseCurrentIndex: true,
        });
        if (around) return around;
        return searchRandomly({ input, wantHigher: true });
      };

      const result = inner();
      if (result) {
        setSearch(newSearch);
        setUUID(result.uuid);
        setNextStates((prev) => [...prev, result]);
      }
      return result?.uuid ?? null;
    },
    [searchAround, searchRandomly]
  );

  const nextUUID = React.useCallback(() => {
    if (!uuid || !search) return null;
    const inner = () => {
      const around = searchAround({
        input: search,
        wantHigher: true,
        canUseCurrentIndex: false,
      });
      if (around) return around;
      return searchRandomly({ input: search, wantHigher: true });
    };
    const result = inner();
    if (result) {
      setUUID(result.uuid);
      setNextStates((prev) => [...prev, result]);
      return result.uuid;
    }
    return null;
  }, [uuid, search, searchAround, searchRandomly]);

  const previousUUID = React.useCallback(() => {
    if (!uuid || !search) return null;

    if (nextStates.length > 1) {
      setNextStates((prev) => prev.slice(0, -1));
      const prevState = nextStates[nextStates.length - 2];
      setUUID(prevState.uuid);
      return prevState.uuid;
    }

    const inner = () => {
      const around = searchAround({
        input: search,
        wantHigher: false,
        canUseCurrentIndex: false,
      });
      if (around) return around;
      return searchRandomly({ input: search, wantHigher: false });
    };
    const result = inner();
    if (result) {
      setUUID(result.uuid);
      return result.uuid;
    }
    return null;
  }, [uuid, search, nextStates, searchAround, searchRandomly]);

  return {
    searchUUID,
    nextUUID,
    previousUUID,
    currentUUID: uuid,
  };
}
