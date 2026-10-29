import { useState } from "react";

type CalculatorState = {
  currentValue: string;
  previousValue: string;
  operation: string | null;
  overwrite: boolean;
  showPrevious: boolean;
};

export const useCalculator = () => {
  const [state, setState] = useState<CalculatorState>({
    currentValue: "0",
    previousValue: "",
    operation: null,
    overwrite: false,
    showPrevious: false,
  });

  const clearAll = () => {
    setState({
      currentValue: "0",
      previousValue: "",
      operation: null,
      overwrite: false,
      showPrevious: false,
    });
  };

  const deleteLastChar = () => {
    if (
      state.currentValue.length === 1 ||
      (state.currentValue.length === 2 && state.currentValue.startsWith("-"))
    ) {
      setState((prev) => ({ ...prev, currentValue: "0" }));
    } else {
      setState((prev) => ({
        ...prev,
        currentValue: prev.currentValue.slice(0, -1),
      }));
    }
  };

  const addDigit = (digit: string) => {
    if (state.overwrite) {
      setState({
        ...state,
        currentValue: digit,
        overwrite: false,
      });
      return;
    }

    const digitCount = state.currentValue.replace(/[^0-9]/g, "").length;
    if (digitCount >= 7 && digit !== ".") {
      return;
    }

    if (digit === "0" && state.currentValue === "0") return;
    if (digit === "." && state.currentValue.includes(".")) return;

    if (state.currentValue === "0" && digit !== ".") {
      setState((prev) => ({ ...prev, currentValue: digit }));
    } else {
      setState((prev) => ({
        ...prev,
        currentValue: `${prev.currentValue}${digit}`,
      }));
    }
  };

  const setOperation = (operation: string) => {
    if (state.currentValue === "0" && state.previousValue === "") return;

    setState((prev) => ({
      ...prev,
      operation,
      previousValue: prev.currentValue,
      currentValue: "0",
      showPrevious: false,
    }));
  };

  const calculate = (): number => {
    const prev = parseFloat(state.previousValue);
    const current = parseFloat(state.currentValue);

    if (isNaN(prev) || isNaN(current)) return 0;

    let result = 0;
    switch (state.operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "×":
        result = prev * current;
        break;
      case "÷":
        result = prev / current;
        break;
      default:
        return current;
    }

    return result;
  };

  const executeCalculation = () => {
    if (state.operation === null || state.previousValue === "") return;

    const result = calculate();

    setState({
      currentValue: result.toString(),
      previousValue: `${state.previousValue}${state.operation}${state.currentValue}`,
      operation: null,
      overwrite: true,
      showPrevious: true,
    });
  };

  const toggleSign = () => {
    setState((prev) => ({
      ...prev,
      currentValue: prev.currentValue.startsWith("-")
        ? prev.currentValue.slice(1)
        : `-${prev.currentValue}`,
    }));
  };

  const applyPercentage = () => {
    const value = parseFloat(state.currentValue);
    setState((prev) => ({
      ...prev,
      currentValue: (value / 100).toString(),
    }));
  };

  return {
    ...state,
    clearAll,
    deleteLastChar,
    addDigit,
    setOperation,
    executeCalculation,
    toggleSign,
    applyPercentage,
  };
};
