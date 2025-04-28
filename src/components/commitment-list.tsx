
"use client";

import type { Commitment } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, CircleDollarSign, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


interface CommitmentListProps {
  commitments: Commitment[];
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (commitment: Commitment) => void; // Function to trigger edit mode
  totalCommitmentsValue: number;
  currency: string; // Added currency prop
  disabled?: boolean;
}

export function CommitmentList({ commitments, onTogglePaid, onDelete, onEdit, totalCommitmentsValue, currency, disabled = false }: CommitmentListProps) {
  return (
     <Card>
        <CardHeader>
            <CardTitle>Commitment List</CardTitle>
             <CardDescription>Your planned expenses for this quest.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6"> {/* Remove horizontal padding on small screens */}
            {commitments.length === 0 ? (
                 <p className="text-muted-foreground text-center py-4 px-6">No commitments added yet. Use the form above to add your first one!</p>
            ) : (
                <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center pl-2 pr-1 sm:pl-4">Paid</TableHead>
                        <TableHead className="px-1 sm:px-4">Item</TableHead>
                        <TableHead className="text-right px-1 sm:px-4">Value</TableHead>
                        <TableHead className="w-[80px] text-center pl-1 pr-2 sm:pr-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commitments.map((commitment) => (
                        <TableRow key={commitment.id} data-state={commitment.paid ? 'paid' : 'unpaid'} className="data-[state=paid]:opacity-60">
                          <TableCell className="text-center pl-2 pr-1 sm:pl-4">
                            <Checkbox
                              id={`paid-${commitment.id}`}
                              checked={commitment.paid}
                              onCheckedChange={() => onTogglePaid(commitment.id)}
                              aria-label={commitment.paid ? `Mark ${commitment.name} as unpaid` : `Mark ${commitment.name} as paid`}
                              disabled={disabled && !commitment.paid} // Allow unchecking if archived, but not checking
                              className="transition-opacity"
                            />
                          </TableCell>
                          <TableCell className="font-medium flex items-center px-1 sm:px-4">
                            {commitment.paid ?
                                <CheckCircle2 className="h-4 w-4 mr-2 text-accent flex-shrink-0" /> :
                                <CircleDollarSign className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                             }
                            <span className={commitment.paid ? 'line-through' : ''}>{commitment.name}</span>
                          </TableCell>
                          <TableCell className={`text-right px-1 sm:px-4 ${commitment.paid ? 'line-through' : ''}`}>{formatCurrency(commitment.value, currency)}</TableCell>
                          <TableCell className="text-center pl-1 pr-2 sm:pr-4">
                                <div className="flex justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(commitment)}
                                    aria-label={`Edit ${commitment.name}`}
                                     disabled={disabled} // Disable edit button if archived
                                     className="h-8 w-8 disabled:text-muted-foreground/50"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(commitment.id)}
                                    className="text-destructive hover:text-destructive/90 h-8 w-8 disabled:text-destructive/50"
                                    aria-label={`Delete ${commitment.name}`}
                                     disabled={disabled} // Disable delete button if archived
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            )}
        </CardContent>
         {commitments.length > 0 && (
            <CardFooter className="flex justify-end pt-4 border-t px-6">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Value of All Commitments</p>
                    <p className="text-lg font-semibold">{formatCurrency(totalCommitmentsValue, currency)}</p>
                </div>
            </CardFooter>
        )}
     </Card>
  );
}
