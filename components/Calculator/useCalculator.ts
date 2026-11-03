import { useState } from "react";

/**
 * iOS-calculator semantics, which the old version got wrong:
 *
 *  - chaining, so `2 + 3 + 4 =` evaluates 2+3 before applying the second `+`
 *  - pressing an operator twice replaces it instead of evaluating
 *  - pressing `=` twice repeats the last operation
 *  - `=` clears the pending state, and the next digit starts a fresh number
 *  - division by zero shows `Error` and locks the pad until `AC`
 *  - floats are trimmed of binary noise (0.1 + 0.2 = 0.3, not 0.30000000000000004)
 */
type CalculatorState = {
  currentValue: string;
  previousValue: string;
  operation: string | null;
  overwrite: boolean;
  showPrevious: boolean;
  /** Left operand of the pending operation. */
  accumulator: number | null;
  /** Last operation, replayed when `=` is pressed again. */
  repeat: { operand: number; operation: string } | null;
  error: boolean;
};

const INITIAL: CalculatorState = {
  currentValue: "0",
  previousValue: "",
  operation: null,
  overwrite: true,
  showPrevious: false,
  accumulator: null,
  repeat: null,
  error: false,
};

const MAX_DIGITS = 9;

/** Trim float noise and keep the display inside the button grid. */
function toDisplay(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Number(value.toPrecision(12));
  // Very large or very small numbers fall back to exponent notation like iOS.
  if (rounded !== 0 && (Math.abs(rounded) >= 1e12 || Math.abs(rounded) < 1e-6)) {
    return rounded.toExponential(5).replace(/\.?0+e/, "e");
  }
  return String(rounded);
}

const SYMBOL: Record<string, string> = {
  "+": "+",
  "-": "−",
  "×": "×",
  "÷": "÷",
};

function apply(left: number, right: number, operation: string): number {
  switch (operation) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? NaN : left / right;
    default:
      return right;
  }
}

export const useCalculator = () => {
  const [state, setState] = useState<CalculatorState>(INITIAL);

  const clearAll = () => setState(INITIAL);

  const deleteLastChar = () => {
    setState((prev) => {
      if (prev.error) return INITIAL;
      // The result of a calculation is a whole value, not something to shave.
      if (prev.overwrite) {
        return { ...prev, currentValue: "0", overwrite: true };
      }
      const next = prev.currentValue.slice(0, -1);
      if (next === "" || next === "-") {
        return { ...prev, currentValue: "0", overwrite: true };
      }
      return { ...prev, currentValue: next };
    });
  };

  const addDigit = (digit: string) => {
    setState((prev) => {
      if (prev.error) return INITIAL;

      if (digit === ".") {
        if (prev.overwrite) {
          return { ...prev, currentValue: "0.", overwrite: false };
        }
        if (prev.currentValue.includes(".")) return prev;
        return { ...prev, currentValue: `${prev.currentValue}.` };
      }

      if (prev.overwrite) {
        return {
          ...prev,
          currentValue: digit,
          overwrite: false,
          // A fresh number starts a fresh line under the display.
          previousValue: prev.operation ? prev.previousValue : "",
          showPrevious: Boolean(prev.operation),
        };
      }

      if (prev.currentValue.replace(/[^0-9]/g, "").length >= MAX_DIGITS) return prev;
      if (prev.currentValue === "0") return { ...prev, currentValue: digit };
      return { ...prev, currentValue: `${prev.currentValue}${digit}` };
    });
  };

  const setOperation = (operation: string) => {
    setState((prev) => {
      if (prev.error) return INITIAL;
      const typed = parseFloat(prev.currentValue);

      // Operator pressed twice in a row: just swap it.
      if (prev.operation && prev.overwrite) {
        return {
          ...prev,
          operation,
          previousValue: `${toDisplay(prev.accumulator ?? 0)} ${SYMBOL[operation] ?? operation}`,
        };
      }

      // Chaining: settle the pending operation before starting the next one.
      if (prev.operation && prev.accumulator !== null) {
        const result = apply(prev.accumulator, typed, prev.operation);
        if (Number.isNaN(result)) return { ...INITIAL, error: true, currentValue: "Error" };
        return {
          ...prev,
          accumulator: result,
          currentValue: toDisplay(result),
          operation,
          previousValue: `${toDisplay(result)} ${SYMBOL[operation] ?? operation}`,
          showPrevious: true,
          overwrite: true,
          repeat: null,
        };
      }

      return {
        ...prev,
        accumulator: typed,
        operation,
        previousValue: `${toDisplay(typed)} ${SYMBOL[operation] ?? operation}`,
        showPrevious: true,
        overwrite: true,
        repeat: null,
      };
    });
  };

  const executeCalculation = () => {
    setState((prev) => {
      if (prev.error) return INITIAL;
      const typed = parseFloat(prev.currentValue);

      // Nothing pending: replay the previous operation (`=` again).
      if (!prev.operation || prev.accumulator === null) {
        if (!prev.repeat) return prev;
        const replay = apply(typed, prev.repeat.operand, prev.repeat.operation);
        if (Number.isNaN(replay)) return { ...INITIAL, error: true, currentValue: "Error" };
        return {
          ...prev,
          currentValue: toDisplay(replay),
          previousValue: `${toDisplay(typed)} ${SYMBOL[prev.repeat.operation] ?? prev.repeat.operation} ${toDisplay(prev.repeat.operand)} =`,
          showPrevious: true,
          overwrite: true,
        };
      }

      const result = apply(prev.accumulator, typed, prev.operation);
      if (Number.isNaN(result)) return { ...INITIAL, error: true, currentValue: "Error" };

      return {
        ...prev,
        currentValue: toDisplay(result),
        previousValue: `${toDisplay(prev.accumulator)} ${SYMBOL[prev.operation] ?? prev.operation} ${toDisplay(typed)} =`,
        operation: null,
        accumulator: result,
        overwrite: true,
        showPrevious: true,
        repeat: { operand: typed, operation: prev.operation },
      };
    });
  };

  const toggleSign = () => {
    setState((prev) => {
      if (prev.error) return INITIAL;
      if (prev.currentValue === "0") return prev;
      return {
        ...prev,
        currentValue: prev.currentValue.startsWith("-")
          ? prev.currentValue.slice(1)
          : `-${prev.currentValue}`,
      };
    });
  };

  const applyPercentage = () => {
    setState((prev) => {
      if (prev.error) return INITIAL;
      const value = parseFloat(prev.currentValue);
      if (!Number.isFinite(value)) return prev;
      return { ...prev, currentValue: toDisplay(value / 100), overwrite: true };
    });
  };

  return {
    currentValue: state.currentValue,
    previousValue: state.previousValue,
    operation: state.operation,
    showPrevious: state.showPrevious,
    clearAll,
    deleteLastChar,
    addDigit,
    setOperation,
    executeCalculation,
    toggleSign,
    applyPercentage,
  };
};
