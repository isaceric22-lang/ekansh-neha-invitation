import React from "react";
import styles from "./styles.module.css";
import { CalculatorDisplay } from "./CalculatorDisplay";
import { CalculatorButton } from "./CalculatorButton";
import { useCalculator } from "./useCalculator";
import { useKeyboardInput } from "./useKeyboardInput";

export type CalculatorActions =
  | "addDigit"
  | "setOperation"
  | "executeCalculation"
  | "clearAll"
  | "deleteLastChar"
  | "toggleSign"
  | "applyPercentage";

export const Calculator: React.FC = () => {
  const {
    currentValue,
    previousValue,
    operation,
    showPrevious,
    clearAll,
    deleteLastChar,
    addDigit,
    setOperation,
    executeCalculation,
    toggleSign,
    applyPercentage,
  } = useCalculator();

  const handleAction = (action: CalculatorActions, value?: string) => {
    switch (action) {
      case "addDigit":
        addDigit(value!);
        break;
      case "setOperation":
        setOperation(value!);
        break;
      case "executeCalculation":
        executeCalculation();
        break;
      case "clearAll":
        clearAll();
        break;
      case "deleteLastChar":
        deleteLastChar();
        break;
      case "toggleSign":
        toggleSign();
        break;
      case "applyPercentage":
        applyPercentage();
        break;
    }
  };

  useKeyboardInput(handleAction);

  return (
    <div className={styles.calculator}>
      <CalculatorDisplay
        value={currentValue}
        previousValue={previousValue}
        operation={operation}
        showPrevious={showPrevious}
      />

      <div className={styles.buttonsGrid}>
        <CalculatorButton label="⌫" action="deleteLastChar" color="gray" onClick={handleAction} />
        <CalculatorButton label="C" action="clearAll" color="gray" onClick={handleAction} />
        <CalculatorButton label="%" action="applyPercentage" color="gray" onClick={handleAction} />
        <CalculatorButton label="÷" value="÷" action="setOperation" color="orange" onClick={handleAction} />

        <CalculatorButton label="7" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="8" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="9" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="×" value="×" action="setOperation" color="orange" onClick={handleAction} />

        <CalculatorButton label="4" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="5" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="6" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="−" value="-" action="setOperation" color="orange" onClick={handleAction} />

        <CalculatorButton label="1" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="2" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="3" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="+" value="+" action="setOperation" color="orange" onClick={handleAction} />

        <CalculatorButton label="±" action="toggleSign" color="dark" onClick={handleAction} />
        <CalculatorButton label="0" action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="." action="addDigit" color="dark" onClick={handleAction} />
        <CalculatorButton label="=" action="executeCalculation" color="orange" onClick={handleAction} />
      </div>
    </div>
  );
};
