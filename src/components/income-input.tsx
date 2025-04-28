
"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Edit2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Assuming utils file exists

interface IncomeInputProps {
  initialIncome: number;
  onIncomeChange: (newIncome: number) => void;
  disabled?: boolean;
}

export function IncomeInput({ initialIncome, onIncomeChange, disabled = false }: IncomeInputProps) {
  const [income, setIncome] = useState(initialIncome.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Update local state if initialIncome prop changes (e.g., switching quests)
     setIncome(initialIncome.toString());
     setIsEditing(initialIncome === 0); // Start editing if income is 0 for a new quest
  }, [initialIncome]);

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
    setIsEditing(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
     if (event.key === 'Enter') {
        handleSave();
     }
   };


  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm bg-card">
      <Label htmlFor="income" className="text-lg font-semibold mb-2 block">
        Total Income
      </Label>
      <div className="flex items-center gap-2">
        {isEditing && !disabled ? (
          <>
            <span className="text-muted-foreground">$</span>
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
            <span className="text-xl font-medium flex-grow">{formatCurrency(initialIncome)}</span>
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
