/**
 * DemandDialog.tsx
 * 
 * Shuttle reservation modal using shadcn Dialog component.
 * Collects date, origin city, party size, and email for prepayment.
 */

import { useState, useEffect } from 'react';
import { format, nextThursday } from 'date-fns';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useDemand } from '../hooks/useDemand';
import { DEBUG_MODE } from '../config';
import type { Village } from '../types';

interface DemandDialogProps {
  village: Village;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemandDialog({ village, open, onOpenChange }: DemandDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [originCity, setOriginCity] = useState('Nicosia');
  const [partySize, setPartySize] = useState(1);
  const [email, setEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { submitDemand, count: demandCount } = useDemand(village.id);

  // Prefill email in debug mode
  useEffect(() => {
    if (DEBUG_MODE && !email) {
      setEmail('debug@debug.com');
    }
  }, [email]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDate(new Date());
      setOriginCity('Nicosia');
      setPartySize(1);
      setEmail(DEBUG_MODE ? 'debug@debug.com' : '');
      setShowConfirmation(false);
    }
  }, [open]);

  // Calculate next Thursday date for confirmation
  const getNextThursday = (): Date => {
    const today = new Date();
    return nextThursday(today);
  };

  // Event handlers
  const handlePrepay = () => {
    if (!date) {
      return;
    }

    if (!email || !email.includes('@')) {
      return;
    }

    try {
      submitDemand({
        villageId: village.id,
        originCity,
        desiredDate: format(date, 'yyyy-MM-dd'),
        partySize,
        email,
      });

      // Show confirmation dialog
      setShowConfirmation(true);
    } catch (error) {
      console.error('[DemandDialog] Failed to submit demand:', error);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    onOpenChange(false);
  };

  // Confirmation dialog
  if (showConfirmation) {
    const nextThursdayDate = getNextThursday();
    return (
      <Dialog open={showConfirmation} onOpenChange={handleCloseConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-600">Reservation Made</DialogTitle>
            <DialogDescription className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">What next?</h3>
                  <p className="text-sm text-muted-foreground">
                    Next Thursday, {format(nextThursdayDate, 'MMMM d, yyyy')}, you will receive
                    an email about your trip.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                  Thank you for reserving with HorioHop.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={handleCloseConfirmation} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reserve Transport to {village.nameEn}</DialogTitle>
          <DialogDescription>
            Reserve your spot by prepaying. Your card will be charged when the trip is confirmed.
          </DialogDescription>
          {demandCount > 0 && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>{demandCount} {demandCount === 1 ? 'person is' : 'people are'}</strong> also waiting for a shuttle to {village.nameEn}
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column: Date Picker */}
          <div className="flex flex-col">
            <Label className="mb-2 block">Desired Travel Date</Label>
            <div className="flex-1 flex items-start justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="flex flex-col space-y-6">
            {/* Origin City */}
            <div>
              <Label className="mb-2 block">Origin City</Label>
              <RadioGroup value={originCity} onValueChange={setOriginCity}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Nicosia" id="nicosia" />
                    <Label htmlFor="nicosia" className="cursor-pointer">Nicosia</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Limassol" id="limassol" />
                    <Label htmlFor="limassol" className="cursor-pointer">Limassol</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Larnaca" id="larnaca" />
                    <Label htmlFor="larnaca" className="cursor-pointer">Larnaca</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Paphos" id="paphos" />
                    <Label htmlFor="paphos" className="cursor-pointer">Paphos</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Party Size */}
            <div>
              <Label htmlFor="party-size" className="mb-2 block">Party Size</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  disabled={partySize <= 1}
                >
                  −
                </Button>
                <Input
                  id="party-size"
                  type="number"
                  min="1"
                  max="8"
                  value={partySize}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setPartySize(Math.min(8, Math.max(1, value)));
                  }}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPartySize(Math.min(8, partySize + 1))}
                  disabled={partySize >= 8}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Email (Required) */}
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required for trip confirmation and updates
              </p>
            </div>

            {/* Payment Explanation */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <strong>Payment Information:</strong> The ticket amount will be held on your card
                until the trip is confirmed or rejected. You will only be charged if the trip is
                confirmed.
              </p>
            </div>

            {/* Prepay Button */}
            <Button
              onClick={handlePrepay}
              disabled={!date || !email || !email.includes('@')}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Prepay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
