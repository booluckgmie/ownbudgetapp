
"use client";

import type { Commitment } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, CircleDollarSign, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Assuming utils file exists
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommitmentListProps {
  commitments: Commitment[];
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (commitment: Commitment) => void; // Function to trigger edit mode
  totalCommitmentsValue: number;
  disabled?: boolean;
}

export function CommitmentList({ commitments, onTogglePaid, onDelete, onEdit, totalCommitmentsValue, disabled = false }: CommitmentListProps) {
  return (
     <Card>
        <CardHeader>
            <CardTitle>Commitment List</CardTitle>
             <CardDescription>Your planned expenses for this quest.</CardDescription>
        </CardHeader>
        <CardContent>
            {commitments.length === 0 ? (
                 <p className="text-muted-foreground text-center py-4">No commitments added yet. Use the form above to add your first one!</p>
            ) : (
                <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center">Paid</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        {!disabled && <TableHead className="w-[100px] text-center">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commitments.map((commitment) => (
                        <TableRow key={commitment.id} className={commitment.paid ? 'opacity-60' : ''}>
                          <TableCell className="text-center">
                            <Checkbox
                              id={`paid-${commitment.id}`}
                              checked={commitment.paid}
                              onCheckedChange={() => onTogglePaid(commitment.id)}
                              aria-label={commitment.paid ? `Mark ${commitment.name} as unpaid` : `Mark ${commitment.name} as paid`}
                              disabled={disabled}
                              className="transition-opacity"
                            />
                          </TableCell>
                          <TableCell className="font-medium flex items-center">
                            {commitment.paid ?
                                <CheckCircle2 className="h-4 w-4 mr-2 text-accent flex-shrink-0" /> :
                                <CircleDollarSign className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                             }
                            <span className={commitment.paid ? 'line-through' : ''}>{commitment.name}</span>
                          </TableCell>
                          <TableCell className={`text-right ${commitment.paid ? 'line-through' : ''}`}>{formatCurrency(commitment.value)}</TableCell>
                          {!disabled && (
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(commitment)}
                                    aria-label={`Edit ${commitment.name}`}
                                     disabled={disabled}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(commitment.id)}
                                    className="text-destructive hover:text-destructive/90"
                                    aria-label={`Delete ${commitment.name}`}
                                     disabled={disabled}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            )}
        </CardContent>
         {commitments.length > 0 && (
            <CardFooter className="flex justify-end pt-4 border-t">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Value of All Commitments</p>
                    <p className="text-lg font-semibold">{formatCurrency(totalCommitmentsValue)}</p>
                </div>
            </CardFooter>
        )}
     </Card>
  );
}
