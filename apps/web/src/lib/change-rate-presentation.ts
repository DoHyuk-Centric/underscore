export type ChangeSign = "plus" | "minus" | "zero";

function getChangeRateColor(sign: ChangeSign): string {
  if (sign === "plus") {
    return "text-[#f04452]";
  }

  if (sign === "minus") {
    return "text-[#3182f6]";
  }

  return "text-[#8b95a1]";
}

export function getChangeRatePresentation(changeRate: number) {
  const value = Number(changeRate.toFixed(2));

  if (value > 0) {
    return {
      sign: "plus" as const,
      className: getChangeRateColor("plus"),
      text: `+${value.toFixed(2)}%`,
    };
  }

  if (value < 0) {
    return {
      sign: "minus" as const,
      className: getChangeRateColor("minus"),
      text: `${value.toFixed(2)}%`,
    };
  }

  return {
    sign: "zero" as const,
    className: getChangeRateColor("zero"),
    text: "0.00%",
  };
}
