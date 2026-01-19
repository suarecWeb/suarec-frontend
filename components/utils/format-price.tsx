import React from "react";

interface FormatPriceProps {
  price?: number;
  className?: string;
  currency?: string;
  fractionDigits?: number;
}

export const FormatPrice: React.FC<FormatPriceProps> = ({
  price,
  className = "",
  currency = "COP",
  fractionDigits = 0,
}) => {
  if (price === undefined || price === null || isNaN(price)) {
    return <span className={className}>$ 0</span>;
  }

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(price);

  return <span className={className}>{formattedPrice}</span>;
};

export default FormatPrice;
