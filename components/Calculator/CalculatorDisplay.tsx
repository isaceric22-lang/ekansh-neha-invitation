import React from "react";
import styles from "./styles.module.css";

type CalculatorDisplayProps = {
  value: string;
  previousValue: string;
  operation: string | null;
  showPrevious: boolean;
};

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  value,
  previousValue,
  operation,
  showPrevious,
}) => {
  const formatNumber = (numStr: string) => {
    const [integerPart, decimalPart] = numStr.split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return numStr.includes(".")
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  return (
    <div className={styles.display}>
      {showPrevious && (
        <div className={styles.previousOperation}>
          {formatNumber(previousValue)} {operation}
        </div>
      )}
      <div className={styles.currentValue}>{formatNumber(value)}</div>
    </div>
  );
};
