/**
 * DataView.tsx
 * 
 * Data view page showing village demand organized by departure cities.
 * Includes projected payout calculations and proximity grouping indicators.
 */

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Database, MapPin, Users, Euro, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { useVillages } from '../hooks/useVillages';
import { getDemands, type DemandRecord } from '../lib/demand';
import { haversineDistance } from '../lib/geo';
import { DEBUG_MODE } from '../config';
import { cn } from '../lib/utils';

interface DemandByCity {
  city: string;
  totalPeople: number;
  records: DemandRecord[];
}

export function DataView() {
  const { villages, loading } = useVillages();
  const [ticketPrice, setTicketPrice] = useState([15]);
  const [proximityRadius, setProximityRadius] = useState([10]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    DEBUG_MODE ? new Date('2026-01-24') : undefined
  );

  const allDemands = useMemo(() => {
    const demands = getDemands();
    if (!selectedDate) return demands;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return demands.filter((d) => d.desiredDate === dateStr);
  }, [selectedDate]);

      // Group demand by village, then by city
  const villageDemandData = useMemo(() => {
    if (!villages.length) return [];

    return villages.map((village) => {
      const villageDemands = allDemands.filter((d) => d.villageId === village.id);
      
      // Group by city only
      const byCity: Record<string, DemandByCity> = {};
      villageDemands.forEach((demand) => {
        if (!byCity[demand.originCity]) {
          byCity[demand.originCity] = {
            city: demand.originCity,
            totalPeople: 0,
            records: [],
          };
        }
        byCity[demand.originCity].totalPeople += demand.partySize;
        byCity[demand.originCity].records.push(demand);
      });

      const groupedDemand = Object.values(byCity).sort((a, b) => 
        b.totalPeople - a.totalPeople || a.city.localeCompare(b.city)
      );

      // Calculate projected payout by city
      const payoutByCity: Record<string, number> = {};
      villageDemands.forEach((demand) => {
        if (!payoutByCity[demand.originCity]) {
          payoutByCity[demand.originCity] = 0;
        }
        payoutByCity[demand.originCity] += demand.partySize * ticketPrice[0];
      });

      // Calculate total projected payout
      const totalPeople = villageDemands.reduce((sum, d) => sum + d.partySize, 0);
      const projectedPayout = totalPeople * ticketPrice[0];

      // Find nearby villages for grouping
      const nearbyVillages = villages
        .map((otherVillage) => {
          if (otherVillage.id === village.id) return null;
          const distance = haversineDistance(
            village.lat,
            village.lng,
            otherVillage.lat,
            otherVillage.lng
          );
          if (distance <= proximityRadius[0]) {
            return {
              village: otherVillage,
              distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            };
          }
          return null;
        })
        .filter((item): item is { village: typeof villages[0]; distance: number } => item !== null)
        .sort((a, b) => a.distance - b.distance);

      return {
        village,
        demand: groupedDemand,
        totalPeople,
        projectedPayout,
        payoutByCity,
        nearbyVillages,
      };
    })
    .sort((a, b) => b.totalPeople - a.totalPeople); // Sort by most requested first
  }, [villages, allDemands, ticketPrice, proximityRadius]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center pt-16">
        <div className="text-lg text-slate-600">Loading villages...</div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8 text-amber-600" />
              Data View
            </h1>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="lg"
                  className={cn(
                    'w-[280px] justify-start text-left font-semibold bg-amber-600 hover:bg-amber-700 text-white',
                    !selectedDate && 'bg-amber-500'
                  )}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Select Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
                {selectedDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedDate(undefined)}
                    >
                      Clear filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Ticket Price
                </CardTitle>
                <CardDescription>Set ticket price for payout calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>€{ticketPrice[0]}</Label>
                    </div>
                    <Slider
                      value={ticketPrice}
                      onValueChange={setTicketPrice}
                      min={5}
                      max={25}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>€5</span>
                      <span>€25</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Proximity Grouping
                </CardTitle>
                <CardDescription>Radius for grouping nearby villages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>{proximityRadius[0]} km</Label>
                    </div>
                    <Slider
                      value={proximityRadius}
                      onValueChange={setProximityRadius}
                      min={2}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>2 km</span>
                      <span>20 km</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Village Cards */}
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {villageDemandData.map(({ village, demand, totalPeople, projectedPayout, payoutByCity, nearbyVillages }) => (
              <Card key={village.id} className="relative">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {village.nameEn}
                    <span className="text-sm text-muted-foreground ml-2">({village.nameEl})</span>
                  </CardTitle>
                  <CardDescription>{village.district} District</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Demand</div>
                        <div className="text-2xl font-bold flex items-center gap-1">
                          <Users className="h-5 w-5" />
                          {totalPeople}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Payout</div>
                        <div className="text-2xl font-bold flex items-center gap-1 text-amber-600">
                          <Euro className="h-5 w-5" />
                          {projectedPayout.toFixed(0)}
                        </div>
                      </div>
                    </div>

                    {/* Payout by City */}
                    {Object.keys(payoutByCity).length > 0 && (
                      <div>
                        <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Euro className="h-4 w-4" />
                          Payout by Departure City
                        </div>
                        <div className="space-y-2">
                          {Object.entries(payoutByCity)
                            .sort(([, a], [, b]) => b - a)
                            .map(([city, payout]) => (
                              <div
                                key={city}
                                className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-200"
                              >
                                <span className="font-medium text-sm">{city}</span>
                                <span className="font-bold text-amber-700">
                                  €{payout.toFixed(0)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Demand by City */}
                  {demand.length > 0 ? (
                    <div>
                      <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Demand by City
                      </div>
                      <div className="space-y-2">
                        {demand.map((group, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-medium">{group.city}</div>
                              <Badge variant="secondary">
                                {group.totalPeople} {group.totalPeople === 1 ? 'person' : 'people'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No demand recorded yet
                    </div>
                  )}

                  {/* Proximity Grouping */}
                  {nearbyVillages.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-300">
                        <div className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          May be grouped with nearby villages
                        </div>
                        <div className="space-y-1.5">
                          {nearbyVillages.map(({ village: nearbyVillage, distance }) => (
                            <div
                              key={nearbyVillage.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-amber-800">
                                {nearbyVillage.nameEn}
                                <span className="text-xs text-amber-600 ml-1">
                                  ({nearbyVillage.nameEl})
                                </span>
                              </span>
                              <Badge variant="outline" className="bg-amber-100 border-amber-300 text-amber-800">
                                {distance} km
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Development Notice - Permanent Popup */}
      <div className="fixed bottom-4 left-4 z-30 max-w-sm">
        <div className="bg-green-50 border-2 border-green-400 rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-green-900 mb-2">Development Notice</p>
              <ul className="space-y-1 text-green-800 text-xs list-disc list-inside">
                <li>
                  Demand data is fictional and only for demonstration purposes.
                </li>
                <li>
                  Information about villages and population may be inaccurate.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
