
"use client";

import { useState, useEffect } from 'react';
import type { Commitment } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlusCircle, Save, X } from 'lucide-react'; // Added X for cancel
import { z } from 'zod';

interface CommitmentFormProps {
  addCommitment: (name: string, value: number) => void;
  editCommitment?: (commitment: Commitment) => void; // Optional for editing
  commitmentToEdit?: Commitment | null; // Commitment data if editing
  onEditCancel?: () => void; // Function to call when cancelling edit
  currencySymbol: string; // Added currency symbol prop
  disabled?: boolean;
}

const commitmentSchema = z.object({
    name: z.string().min(1, "Commitment name cannot be empty."),
    value: z.number().positive("Commitment value must be a positive number."),
});


export function CommitmentForm({
    addCommitment,
    editCommitment,
    commitmentToEdit,
    onEditCancel,
    currencySymbol,
    disabled = false
}: CommitmentFormProps) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<{ name?: string; value?: string }>({});

  const isEditing = !!commitmentToEdit;

  useEffect(() => {
    if (isEditing && commitmentToEdit) {
      setName(commitmentToEdit.name);
      setValue(commitmentToEdit.value.toString());
      setErrors({}); // Clear errors when starting edit
    } else {
       // Clear form when switching from edit to add mode or initially
       setName('');
       setValue('');
       setErrors({});
    }
  }, [commitmentToEdit, isEditing]);


  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const rawValue = e.target.value;
      // Allow only numbers and a single decimal point
      if (/^\d*\.?\d*$/.test(rawValue)) {
        setValue(rawValue);
        // Clear value error when user types
         if (errors.value) {
             setErrors(prev => ({ ...prev, value: undefined }));
         }
      }
  };

   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      // Clear name error when user types
      if (errors.name) {
          setErrors(prev => ({ ...prev, name: undefined }));
      }
   };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    const parsedValue = parseFloat(value);

    const result = commitmentSchema.safeParse({ name: name.trim(), value: parsedValue });

    if (!result.success) {
        const fieldErrors: { name?: string; value?: string } = {};
        result.error.errors.forEach(err => {
            if (err.path[0] === 'name') fieldErrors.name = err.message;
            if (err.path[0] === 'value') fieldErrors.value = err.message;
        });
        setErrors(fieldErrors);
        return;
    }


    if (isEditing && commitmentToEdit && editCommitment) {
        editCommitment({ ...commitmentToEdit, name: result.data.name, value: result.data.value });
        // onEditCancel will be called by parent to clear edit state typically
    } else {
        addCommitment(result.data.name, result.data.value);
         // Reset form only if adding
        setName('');
        setValue('');
    }
    setErrors({}); // Clear errors on successful submit
  };

  const handleCancel = () => {
      if(onEditCancel) {
          onEditCancel();
      }
      // Also reset local form state on explicit cancel
      setName('');
      setValue('');
      setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-lg shadow-sm bg-card">
      <h3 className="text-md font-semibold mb-3">{isEditing ? 'Edit Commitment' : 'Add New Commitment'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-4 gap-y-2 items-start">
        {/* Name Input - takes full width */}
        <div className="sm:col-span-2">
            <Label htmlFor="commitmentName">Item Name</Label>
            <Input
              id="commitmentName"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., Rent, Groceries"
              className={`mt-1 ${errors.name ? 'border-destructive' : ''}`}
              disabled={disabled}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
             {errors.name && <p id="name-error" className="text-sm text-destructive mt-1">{errors.name}</p>}
        </div>

         {/* Value Input */}
         <div className="flex-grow">
             <Label htmlFor="commitmentValue">Value ({currencySymbol})</Label>
             <div className="flex items-center mt-1">
                <span className="text-muted-foreground mr-1">{currencySymbol}</span>
                 <Input
                   id="commitmentValue"
                   type="text" // Use text for better control over input format
                   value={value}
                   onChange={handleValueChange}
                   placeholder="e.g., 500.00"
                   inputMode="decimal"
                   className={`flex-grow ${errors.value ? 'border-destructive' : ''}`}
                   disabled={disabled}
                    aria-invalid={!!errors.value}
                    aria-describedby={errors.value ? "value-error" : undefined}
                 />
            </div>
              {errors.value && <p id="value-error" className="text-sm text-destructive mt-1">{errors.value}</p>}
         </div>

         {/* Action Buttons - align to the right of value input on larger screens */}
          <div className="flex justify-end gap-2 mt-1 sm:mt-6 sm:self-end">
             {isEditing && (
                 <Button type="button" variant="outline" size="icon" onClick={handleCancel} disabled={disabled} aria-label="Cancel Edit">
                     <X className="h-4 w-4"/>
                 </Button>
             )}
             <Button type="submit" disabled={disabled || (!name && !value && !isEditing)} className="flex-grow sm:flex-grow-0">
                 {isEditing ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                 {isEditing ? 'Save' : 'Add'}
             </Button>
       </div>
      </div>
    </form>
  );
}
