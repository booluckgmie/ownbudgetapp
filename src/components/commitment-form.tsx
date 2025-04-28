
"use client";

import { useState, useEffect } from 'react';
import type { Commitment } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlusCircle, Save } from 'lucide-react';
import { z } from 'zod';

interface CommitmentFormProps {
  addCommitment: (name: string, value: number) => void;
  editCommitment?: (commitment: Commitment) => void; // Optional for editing
  commitmentToEdit?: Commitment | null; // Commitment data if editing
  onEditCancel?: () => void; // Function to call when cancelling edit
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
    } else {
        addCommitment(result.data.name, result.data.value);
    }

    // Reset form only if adding, not editing (edit state is handled by useEffect)
    if (!isEditing) {
        setName('');
        setValue('');
    }
    setErrors({}); // Clear errors on successful submit
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-lg shadow-sm bg-card">
      <h3 className="text-md font-semibold mb-3">{isEditing ? 'Edit Commitment' : 'Add New Commitment'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
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
        <div>
            <Label htmlFor="commitmentValue">Value ($)</Label>
            <Input
              id="commitmentValue"
              type="text" // Use text for better control over input format
              value={value}
              onChange={handleValueChange}
              placeholder="e.g., 500.00"
              inputMode="decimal"
              className={`mt-1 ${errors.value ? 'border-destructive' : ''}`}
              disabled={disabled}
               aria-invalid={!!errors.value}
               aria-describedby={errors.value ? "value-error" : undefined}
            />
             {errors.value && <p id="value-error" className="text-sm text-destructive mt-1">{errors.value}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
            {isEditing && (
                <Button type="button" variant="outline" onClick={onEditCancel} disabled={disabled}>
                    Cancel
                </Button>
            )}
            <Button type="submit" disabled={disabled}>
                {isEditing ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isEditing ? 'Save Changes' : 'Add Commitment'}
            </Button>
      </div>

    </form>
  );
}

