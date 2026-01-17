/**
 * RouteItineraryCard.tsx
 * 
 * Displays a single route option with duration, transfers, and leg summary.
 * Used in VillageSheet to show available routes to/from a selected village.
 */

import { format, parseISO } from 'date-fns';
import { Map, Navigation } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { Itinerary } from '../types';

interface RouteItineraryCardProps {
  itinerary: Itinerary;
  index: number;
  direction: 'to' | 'from';
  isSelected: boolean;
  onSelect: () => void;
  onShowOnMap: () => void;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
}

function formatTime(timeString: string): string {
  try {
    return format(parseISO(timeString), 'HH:mm');
  } catch {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  }
}

function getLegSummary(legs: Itinerary['legs']): string {
  return legs
    .map((leg) => {
      if (leg.mode === 'WALK') {
        const mins = Math.round(leg.duration / 60);
        return `🚶 ${mins}min`;
      } else {
        return `🚌 ${leg.routeShortName || 'Bus'}`;
      }
    })
    .join(' → ');
}

export function RouteItineraryCard({
  itinerary,
  isSelected,
  onSelect,
  onShowOnMap,
}: RouteItineraryCardProps) {
  // Derived values
  const startTime = formatTime(itinerary.startTime);
  const endTime = formatTime(itinerary.endTime);
  const duration = formatDuration(Math.round(itinerary.duration / 60));
  const firstLeg = itinerary.legs[0];
  const firstDeparture = firstLeg ? formatTime(firstLeg.departureTime) : startTime;

  // Event handlers
  const handleShowOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowOnMap();
  };

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-amber-500 border-amber-500' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{duration}</CardTitle>
            <CardDescription className="mt-1">
              {startTime} → {endTime}
            </CardDescription>
          </div>
          {itinerary.transfers > 0 ? (
            <Badge variant="secondary" className="ml-2">
              {itinerary.transfers} {itinerary.transfers === 1 ? 'change' : 'changes'}
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-2">
              Direct
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm font-medium">{getLegSummary(itinerary.legs)}</div>
        <div className="text-sm text-muted-foreground">Departs {firstDeparture}</div>
        {itinerary.walkDistance > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Navigation className="h-3 w-3" />
            {Math.round(itinerary.walkDistance)}m walking
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full" onClick={handleShowOnMap}>
          <Map className="h-4 w-4 mr-2" />
          Show on map
        </Button>
      </CardContent>
    </Card>
  );
}
