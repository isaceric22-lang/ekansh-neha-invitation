import { Calculator } from "@/components/Calculator/Calculator";

export default function CalculatorPage() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}
    >
      <Calculator />
    </div>
  );
}
