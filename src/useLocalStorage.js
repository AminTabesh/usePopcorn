import { useState, useEffect } from "react";

export function useLocalStorageState(initialValue, key) {
  const [value, setvalue] = useState(function () {
    const value = JSON.parse(localStorage.getItem(key));
    return value || initialValue;
  });
  useEffect(
    function () {
      let array = JSON.stringify(value);
      localStorage.setItem("watched", array);
    },
    [value]
  );

  return [value, setvalue];
}
