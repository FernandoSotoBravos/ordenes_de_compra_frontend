import React from "react";
import { FormControl, InputLabel, OutlinedInput } from "@mui/material";
import { NumericFormat } from "react-number-format";

interface CurrencyInputProps {
  label: string;
  value: number | undefined | string;
  onChange: (value: number) => void;
  width?: number | string;
  textAlign?: "left" | "right" | "center";
  disabled?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  width = 200,
  textAlign = "right",
  disabled = false
}) => {
  return (
    <FormControl sx={{ width }}>
      <InputLabel htmlFor={`currency-${label}`}>{label}</InputLabel>
      <NumericFormat
        customInput={OutlinedInput}
        id={`currency-${label}`}
        label={label}
        value={value ?? ""}
        thousandSeparator
        decimalSeparator="."
        decimalScale={2}
        disabled={disabled}
        fixedDecimalScale
        allowNegative={false}
        prefix="$"
        onValueChange={(values: any) => {
          const { floatValue } = values;
          if (floatValue !== undefined) {
            onChange(floatValue);
          } else {
            onChange(0);
          }
        }}
        inputProps={{
          style: { textAlign: textAlign },
        }}
      />
    </FormControl>
  );
};

export default CurrencyInput;
