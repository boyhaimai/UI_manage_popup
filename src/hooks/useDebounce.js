import React from "react";
import { useEffect } from "react";
import { useState } from "react";

function useDebounce({ value, delay }) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const handleTimeout = setTimeout(() => setDebounceValue(value), delay);

    return () => clearTimeout(handleTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return debounceValue;
}

export default useDebounce;
