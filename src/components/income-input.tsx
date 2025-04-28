
"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Edit2 } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '@/lib/utils';

interface IncomeInputProps {
  initialIncome: number;
  onIncomeChange: (newIncome: number) => void;
  currency: string; // Added currency prop
  disabled?: boolean;
}

export function IncomeInput({ initialIncome, onIncomeChange, currency, disabled = false }: IncomeInputProps) {
  const [income, setIncome] = useState(initialIncome.toString());
  const [isEditing, setIsEditing] = useState(false);
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    // Update local state if initialIncome prop changes (e.g., switching quests)
     setIncome(initialIncome.toString());
     // Only start editing if income is 0 AND the quest is not disabled (archived)
     setIsEditing(initialIncome === 0 && !disabled);
  }, [initialIncome, disabled]); // Depend on disabled state too

   // Update input value display if currency changes while not editing
   useEffect(() => {
     if (!isEditing) {
       setIncome(initialIncome.toString()); // Reflect potential formatting changes if needed
     }
   }, [currency, initialIncome, isEditing]);


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and a single decimal point
    const value = event.target.value;
     if (/^\d*\.?\d*$/.test(value)) {
      setIncome(value);
    }
  };

  const handleSave = () => {
    const numericIncome = parseFloat(income) || 0;
    onIncomeChange(numericIncome);
    setIsEditing(false);
  };

  const handleEdit = () => {
     if (!disabled) { // Prevent editing if disabled
       setIsEditing(true);
     }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
     if (event.key === 'Enter') {
        handleSave();
     }
   };


  return (
    <div className="mb-4 p-4 border rounded-lg shadow-sm bg-card">
      <Label htmlFor="income" className="text-lg font-semibold mb-2 block">
        Total Income
      </Label>
      <div className="flex items-center gap-2">
        {isEditing && !disabled ? (
          <>
            <span className="text-muted-foreground text-xl">{currencySymbol}</span>
            <Input
              type="text" // Use text to allow intermediate states like "100."
              id="income"
              value={income}
              onChange={handleInputChange}
              onBlur={handleSave} // Save when losing focus
              onKeyDown={handleKeyDown} // Save on Enter
              placeholder="e.g., 3000"
              className="flex-grow text-xl font-medium"
              inputMode="decimal" // Hint for mobile keyboards
              autoFocus
            />
            <Button size="icon" onClick={handleSave} aria-label="Save Income">
              <Check className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <span className="text-xl font-medium flex-grow">{formatCurrency(initialIncome, currency)}</span>
            {!disabled && (
              <Button size="icon" variant="ghost" onClick={handleEdit} aria-label="Edit Income">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
       {disabled && <p className="text-sm text-muted-foreground mt-1">Income editing is disabled for archived quests.</p>}
    </div>
  );
}
