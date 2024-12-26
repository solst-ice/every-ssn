import React from "react";
import styled from "styled-components";
import UnstyledButton from "../UnstyledButton/UnstyledButton";
import { X, ChevronUp, ChevronDown } from "../Icons/Icons";
import { uuidToIndex } from "../../../lib/uuidTools";
import { useUUIDSearch } from "../../../hooks/use-uuid-search";
import { querySmallScreen, SCROLLBAR_WIDTH } from "../../../lib/constants";

const Button = styled(UnstyledButton)`
  font-size: 0.875rem;
  aspect-ratio: 1;
  max-height: 80%;
  padding: 4px;
  color: var(--neutral-700);
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  @media (hover: hover) {
    &:hover {
      background-color: var(--slate-200);
    }
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  height: 2rem;
  position: fixed;
  top: 0;
  right: 4rem;
  padding: 0 0.5rem;

  /* max-width: max-content; */
  max-width: calc(100vw - ${SCROLLBAR_WIDTH}px);

  @media ${querySmallScreen} {
    right: calc(${SCROLLBAR_WIDTH}px);
  }

  transform: translateY(var(--y-offset));
  transition: transform 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
  z-index: 1000;
  background-color: var(--slate-50);
  align-items: center;
`;

const ShowSearchButton = styled(UnstyledButton)`
  background-color: var(--slate-50);
  border-radius: 0 0 8px 8px;
  font-size: 0.875rem;
  font-family: monospace;
  padding: 0rem 1rem;

  /* transform: translateY(var(--y-offset));
  transition: transform 0.1s cubic-bezier(0.215, 0.61, 0.355, 1); */
  display: flex;
  align-items: center;

  position: absolute;
  z-index: 999;
  right: 10rem;
  color: inherit;
  @media ${querySmallScreen} {
    right: calc(${SCROLLBAR_WIDTH}px);
    bottom: 0;
    border-radius: 8px 0 0 8px;
  }

  outline: none;
  &:focus {
    outline: none;
  }
  cursor: pointer;
  transition: background-color 0.1s ease-in-out;
  @media (hover: hover) {
    &:hover {
      background-color: var(--slate-400);
    }
  }
`;

const Input = styled.input`
  font-family: monospace;
  font-size: 1rem;
  width: 100%;
  padding: 0.25rem;
  outline: none;
  border: none;
  background-color: var(--slate-50);

  &:focus {
    outline: none;
  }
`;

const Form = styled.form`
  flex: 1 1 38ch;
  width: 38ch;
  min-width: 6ch;
`;

const Line = styled.div`
  height: 60%;
  width: 1px;
  background-color: var(--neutral-400);
  margin-right: 0.5rem;
  flex-shrink: 0;
`;

function useShiftIsHeldDown() {
  const [shiftIsHeldDown, setShiftIsHeldDown] = React.useState(false);
  React.useEffect(() => {
    const listener = (e) => setShiftIsHeldDown(e.shiftKey);
    window.addEventListener("keydown", listener);
    window.addEventListener("keyup", listener);
    return () => {
      window.removeEventListener("keydown", listener);
      window.removeEventListener("keyup", listener);
    };
  }, []);
  return shiftIsHeldDown;
}

function SearchWidget({
  setVirtualPosition,
  search,
  setSearch,
  searchDisplayed,
  setSearchDisplayed,
  displayedUUIDs,
  virtualPosition,
  MAX_POSITION,
}) {
  const inputRef = React.useRef(null);
  const cmdKey = React.useMemo(() => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    return isMac ? "metaKey" : "ctrlKey";
  }, []);
  const shiftIsHeldDown = useShiftIsHeldDown();

  const { searchUUID, currentUUID, nextUUID, previousUUID } = useUUIDSearch({
    displayedUUIDs,
    virtualPosition,
  });
  const index = React.useMemo(() => {
    if (currentUUID) {
      const index = uuidToIndex(currentUUID);

      return index;
    }
    return null;
  }, [currentUUID]);

  React.useEffect(() => {
    if (index) {
      if (index < 0n) {
        setVirtualPosition(0n);
      } else if (index >= MAX_POSITION) {
        setVirtualPosition(MAX_POSITION);
      } else {
        setVirtualPosition(index);
      }
    }
  }, [setVirtualPosition, index]);

  React.useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (!inputRef.current) {
        return;
      }
      if (e[cmdKey] && e.key === "f") {
        e.preventDefault();
        if (searchDisplayed) {
          // check if the input is focused
          if (document.activeElement === inputRef.current) {
            // nothing
          } else {
            inputRef.current.focus();
          }
        } else {
          setSearchDisplayed(true);
          inputRef.current.focus();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSearchDisplayed(false);
      }
    });
  }, [searchDisplayed, cmdKey]);

  return (
    <>
      <ShowSearchButton
        onClick={() => {
          if (!searchDisplayed && inputRef.current) {
            inputRef.current.focus();
          }
          setSearchDisplayed((prev) => !prev);
        }}
      >
        search!
      </ShowSearchButton>
      <Wrapper style={{ "--y-offset": searchDisplayed ? "0" : "-110%" }}>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (shiftIsHeldDown) {
              previousUUID();
            } else {
              nextUUID();
            }
          }}
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for an SSN"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value.toLowerCase());
              searchUUID(e.target.value.toLowerCase());
            }}
          />
        </Form>
        <Line />
        <Button onClick={() => previousUUID()}>
          <ChevronUp style={{ height: "100%", width: "100%" }} />
        </Button>
        <Button onClick={() => nextUUID()}>
          <ChevronDown style={{ height: "100%", width: "100%" }} />
        </Button>
        <Button onClick={() => setSearchDisplayed(false)}>
          <X style={{ height: "100%", width: "100%" }} />
        </Button>
      </Wrapper>
    </>
  );
}

export default SearchWidget;

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function splitmix32(a) {
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

const KINDS = {
  four: 4,
  three: 3,
  two: 2,
};

function selectableIndices(kind, chunks) {
  const maxBits = KINDS[kind];
  const indices = [];
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].length <= maxBits) {
      indices.push(i);
    }
  }
}

const emptySearchIndex = (index, maxChars) => ({
  index,
  maxChars,
  value: null,
});

function candidatesForSearchString(search) {
  // Clean the input to only keep numbers and dashes
  const cleaned = search.replace(/[^\d-]/g, '');
  if (!cleaned) return null;

  // Helper function to validate area number
  const isValidArea = (area) => {
    const areaNum = parseInt(area, 10);
    return areaNum > 0 && areaNum < 900 && areaNum !== 666;
  };

  // Helper function to validate group number
  const isValidGroup = (group) => {
    const groupNum = parseInt(group, 10);
    return groupNum > 0 && groupNum <= 99;
  };

  // Helper function to validate serial number
  const isValidSerial = (serial) => {
    const serialNum = parseInt(serial, 10);
    return serialNum > 0 && serialNum <= 9999;
  };

  // Handle non-dashed input
  if (!cleaned.includes('-')) {
    const len = cleaned.length;
    if (len === 0) return null;
    
    // Pad with valid numbers based on position
    if (len <= 4) {
      // Assume it's the last part
      const serial = cleaned.padEnd(4, '1');
      return isValidSerial(serial) ? `001-01-${serial}` : null;
    } else if (len <= 6) {
      // Assume starts at group number
      const group = cleaned.slice(0, 2).padEnd(2, '1');
      const serial = cleaned.slice(2).padEnd(4, '1');
      return (isValidGroup(group) && isValidSerial(serial)) ? 
        `001-${group}-${serial}` : null;
    } else {
      // Assume starts at area number
      const area = cleaned.slice(0, 3);
      const group = cleaned.slice(3, 5).padEnd(2, '1');
      const serial = cleaned.slice(5, 9).padEnd(4, '1');
      return (isValidArea(area) && isValidGroup(group) && isValidSerial(serial)) ? 
        `${area}-${group}-${serial}` : null;
    }
  }

  // Handle dashed input
  const parts = cleaned.split('-');
  const [area = '', group = '', serial = ''] = parts;

  const paddedArea = area.padEnd(3, '1');
  const paddedGroup = group.padEnd(2, '1');
  const paddedSerial = serial.padEnd(4, '1');

  // Validate all parts
  if (!isValidArea(paddedArea) || !isValidGroup(paddedGroup) || !isValidSerial(paddedSerial)) {
    return null;
  }

  return `${paddedArea}-${paddedGroup}-${paddedSerial}`;
}

function createUUIDPattern(input) {
  // Clean input to valid hex chars and dashes
  const cleaned = input.toLowerCase().replace(/[^0-9-]/g, "");
  if (!cleaned) return null;

  // Template for SSN 
  const ssnTemplate = `000-00-0000`;

  // Single chunk case (no dashes)
  if (!cleaned.includes("-")) {
    const len = cleaned.length;
    // Handle different length inputs by padding appropriately
    if (len <= 4) {
      return `000-00-${cleaned.padEnd(4, "0")}`;
    }
    if (len <= 6) {
      return `000-${cleaned.padEnd(2, "0")}-${cleaned.substring(2).padEnd(4, "0")}`;
    }
    if (len <= 9) {
      return `${cleaned.substring(0,3)}-${cleaned.substring(3,5)}-${cleaned.substring(5).padEnd(4, "0")}`;
    }
    return null;
  }

  // Try each possible position in the UUID
  for (let i = 0; i < uuidTemplate.length - cleaned.length + 1; i++) {
    // Only try positions where our dashes would align
    if (cleaned.includes("-")) {
      const firstDashInInput = cleaned.indexOf("-");
      const positionInPattern = i + firstDashInInput;

      // Check if this position would align our dashes with pattern dashes
      let dashesAlign = true;
      let wouldConflict = false;

      // Check each character of our input against the template
      for (let pos = 0; pos < cleaned.length; pos++) {
        const patternPos = i + pos;
        const inputChar = cleaned[pos];
        const templateChar = ssnTemplate[patternPos];

        if (inputChar === "-") {
          if (templateChar !== "-") {
            dashesAlign = false;
            break;
          }
        } else if (templateChar === "-") {
          dashesAlign = false;
          break;
        } else {
          // Validate numeric characters
          if (isNaN(parseInt(inputChar))) {
            wouldConflict = true;
            break;
          }
          
          // Check area number (first 3 digits)
          if (patternPos < 3) {
            const areaStr = cleaned.substring(0, 3);
            if (areaStr.length === 3) {
              const area = parseInt(areaStr);
              if (area === 666 || area === 0) {
                wouldConflict = true;
                break;
              }
            }
          }
        }
      }

      if (!dashesAlign || wouldConflict) continue;
    }

    // Create the result by overlaying our input at this position
    let result =
      uuidTemplate.slice(0, i) +
      cleaned +
      uuidTemplate.slice(i + cleaned.length);

    // Verify it's a valid SSN pattern 
    const sections = result.split("-");
    if (
      sections[0].length === 3 &&
      sections[1].length === 2 &&
      sections[2].length === 4
    ) {
      return result;
    }
  }

  return null;
}
