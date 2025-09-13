import { Button, Input, Label } from "@/shared/components/ui";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function QuantitySelector({
  quantity,
  maxQuantity,
  onQuantityChange,
  disabled = false,
  className = "",
  label = "Quantity",
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (value >= 1 && value <= maxQuantity) {
      onQuantityChange(value);
    }
  };

  return (
    <div className={className}>
      <Label htmlFor="quantity" className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={disabled || quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={maxQuantity}
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-20 text-center"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={disabled || quantity >= maxQuantity}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
