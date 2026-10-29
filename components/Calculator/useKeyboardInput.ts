import { useEffect } from "react";
import type { CalculatorActions } from "./Calculator";

type KeyboardMap = {
  [key: string]: CalculatorActions;
};

export const useKeyboardInput = (
  handler: (action: CalculatorActions, value?: string) => void
) => {
  useEffect(() => {
    const keyboardMap: KeyboardMap = {
      "0": "addDigit",
      "1": "addDigit",
      "2": "addDigit",
      "3": "addDigit",
      "4": "addDigit",
      "5": "addDigit",
      "6": "addDigit",
      "7": "addDigit",
      "8": "addDigit",
      "9": "addDigit",
      ".": "addDigit",
      "+": "setOperation",
      "-": "setOperation",
      "*": "setOperation",
      "/": "setOperation",
      Enter: "executeCalculation",
      "=": "executeCalculation",
      Escape: "clearAll",
      Backspace: "deleteLastChar",
      "%": "applyPercentage",
      _: "toggleSign",
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const action = keyboardMap[e.key];

      if (action) {
        e.preventDefault();
        handler(action, e.key === "*" ? "×" : e.key === "/" ? "÷" : e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handler]);
};
