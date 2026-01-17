/**
 * VillageSheet.tsx
 * 
 * Consolidated sidebar/drawer using shadcn Sheet component.
 * Displays village info, routes, taxis, tours, and demand section.
 * Desktop: Always visible fixed sidebar (420px wide)
 * Mobile: Bottom sheet that opens/closes
 */

import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { useAppContext } from '../context/AppContext';
import { useDemand } from '../hooks/useDemand';
import { useResponsive } from '../hooks/useResponsive';
import { DemandDialog } from './DemandDialog';
import alternativesData from '../data/alternatives.json';
import { 
  X, Users, Bus, ArrowRight, Car, MapPin, Phone, ExternalLink, Map
} from 'lucide-react';
import { useState } from 'react';
import { RouteItineraryCard } from './RouteItineraryCard';

const CITIES = ['Nicosia', 'Limassol', 'Larnaca', 'Paphos'] as const;


function SidebarContent() {
  const {
    selectedVillage,
    setSelectedVillage,
    userLocation,
    selectedCity,
    setSelectedCity,
    routesToVillage,
    routesFromVillage,
    loadingRoutes,
    selectedRoute,
    setSelectedRoute,
  } = useAppContext();

  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [showAllRoutesTo, setShowAllRoutesTo] = useState(false);
  const [showAllRoutesFrom, setShowAllRoutesFrom] = useState(false);
  const { count: demandCount, loading: demandLoading } = useDemand(selectedVillage?.id || null);

  // Sort routes by duration (shortest first) and track original indices
  const sortedRoutesTo = routesToVillage
    .map((itinerary, index) => ({ itinerary, originalIndex: index }))
    .sort((a, b) => a.itinerary.duration - b.itinerary.duration);
  const sortedRoutesFrom = routesFromVillage
    .map((itinerary, index) => ({ itinerary, originalIndex: index }))
    .sort((a, b) => a.itinerary.duration - b.itinerary.duration);
  
  // Show only shortest route initially
  const displayedRoutesTo = showAllRoutesTo ? sortedRoutesTo : sortedRoutesTo.slice(0, 1);
  const displayedRoutesFrom = showAllRoutesFrom ? sortedRoutesFrom : sortedRoutesFrom.slice(0, 1);

  if (!selectedVillage) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <div className="text-center p-8">
          <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Click a village marker to see details</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hidden title/description for accessibility */}
      <div className="sr-only">
        <h2>{selectedVillage.nameEl} - {selectedVillage.nameEn}</h2>
        <p>Transport options and information for {selectedVillage.nameEn}</p>
      </div>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{selectedVillage.nameEl}</h2>
              <p className="text-sm text-slate-500 mt-1">{selectedVillage.nameEn}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-amber-500 hover:bg-amber-600">
                  {selectedVillage.district}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {selectedVillage.population.toLocaleString()}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedVillage(null);
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <p className="text-sm text-slate-700 leading-relaxed">
              {selectedVillage.description}
            </p>

            {/* City selector */}
            {!userLocation && (
              <div className="space-y-2">
                <Label htmlFor="city-select">Where are you starting from?</Label>
                <Select value={selectedCity || ''} onValueChange={setSelectedCity}>
                  <SelectTrigger id="city-select">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Getting There */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Getting There
              </h3>
              {loadingRoutes ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                  <p className="text-sm text-muted-foreground">
                    Finding routes from {userLocation ? 'your location' : (selectedCity || 'your location')}...
                  </p>
                </div>
              ) : routesToVillage.length > 0 ? (
                <div className="space-y-3">
                  {displayedRoutesTo.map(({ itinerary, originalIndex }) => (
                    <RouteItineraryCard
                      key={originalIndex}
                      itinerary={itinerary}
                      index={originalIndex}
                      direction="to"
                      isSelected={selectedRoute?.direction === 'to' && selectedRoute?.index === originalIndex}
                      onSelect={() => {
                        if (selectedRoute?.direction === 'to' && selectedRoute?.index === originalIndex) {
                          setSelectedRoute(null);
                        } else {
                          setSelectedRoute({ direction: 'to', index: originalIndex });
                        }
                      }}
                      onShowOnMap={() => setSelectedRoute({ direction: 'to', index: originalIndex })}
                    />
                  ))}
                  {sortedRoutesTo.length > 1 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAllRoutesTo(!showAllRoutesTo)}
                    >
                      {showAllRoutesTo ? 'Show Less' : `Show All (${sortedRoutesTo.length} routes)`}
                    </Button>
                  )}
                </div>
              ) : (userLocation || selectedCity) ? (
                <p className="text-sm text-muted-foreground">No public transport routes found</p>
              ) : (
                <p className="text-sm text-muted-foreground">Select your starting point to see routes</p>
              )}
            </div>

            {/* Getting Back */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Getting Back
              </h3>
              {loadingRoutes ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : routesFromVillage.length > 0 ? (
                <div className="space-y-3">
                  {displayedRoutesFrom.map(({ itinerary, originalIndex }) => (
                    <RouteItineraryCard
                      key={originalIndex}
                      itinerary={itinerary}
                      index={originalIndex}
                      direction="from"
                      isSelected={selectedRoute?.direction === 'from' && selectedRoute?.index === originalIndex}
                      onSelect={() => {
                        if (selectedRoute?.direction === 'from' && selectedRoute?.index === originalIndex) {
                          setSelectedRoute(null);
                        } else {
                          setSelectedRoute({ direction: 'from', index: originalIndex });
                        }
                      }}
                      onShowOnMap={() => setSelectedRoute({ direction: 'from', index: originalIndex })}
                    />
                  ))}
                  {sortedRoutesFrom.length > 1 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAllRoutesFrom(!showAllRoutesFrom)}
                    >
                      {showAllRoutesFrom ? 'Show Less' : `Show All (${sortedRoutesFrom.length} routes)`}
                    </Button>
                  )}
                </div>
              ) : (userLocation || selectedCity) ? (
                <p className="text-sm text-muted-foreground">No public transport routes found</p>
              ) : (
                <p className="text-sm text-muted-foreground">Select your starting point to see routes</p>
              )}
            </div>

            {/* Taxi Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Taxi Services
              </h3>
              <div className="space-y-3">
                {(selectedVillage.taxiContacts.length > 0
                  ? selectedVillage.taxiContacts
                  : alternativesData.taxis.slice(0, 3)
                ).map((taxi, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {taxi.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a
                        href={`tel:${taxi.phone}`}
                        className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        {taxi.phone}
                      </a>
                      {taxi.notes && (
                        <Badge variant="secondary" className="text-xs mt-2">
                          {taxi.notes}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedVillage.nearestHub && selectedVillage.hubDistanceKm && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                  From <strong>{selectedVillage.nearestHub}</strong>: ~{selectedVillage.hubDistanceKm}km, approximately €{Math.round(selectedVillage.hubDistanceKm)}
                </div>
              )}
            </div>

            {/* Tour Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Organized Tours
              </h3>
              <div className="space-y-3">
                {(selectedVillage.tourOperators.length > 0
                  ? selectedVillage.tourOperators
                  : alternativesData.tours.slice(0, 2)
                ).map((operator, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{operator.name}</CardTitle>
                      <CardDescription className="text-amber-600 font-semibold">
                        {operator.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{operator.description}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit website
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Sticky footer */}
        <div className="flex-shrink-0 p-4 border-t bg-white">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader>
              <CardTitle className="text-lg">No good options? Request a shuttle.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {demandLoading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <p className="text-sm text-slate-700 font-medium">
                  {demandCount} {demandCount === 1 ? 'person wants' : 'people want'} to visit {selectedVillage.nameEn} this month
                </p>
              )}
              <Button
                onClick={() => setDemandModalOpen(true)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                Request a Shuttle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedVillage && (
        <DemandDialog
          village={selectedVillage}
          open={demandModalOpen}
          onOpenChange={setDemandModalOpen}
        />
      )}
    </>
  );
}

export function VillageSheet() {
  const { isDesktop } = useResponsive();
  const { sidebarOpen, setSidebarOpen, setSelectedVillage, selectedVillage } = useAppContext();

  // Desktop: Show/hide sidebar based on village selection
  if (isDesktop) {
    if (!selectedVillage) {
      return null;
    }
    return (
      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-[420px] bg-white border-l border-slate-200 shadow-lg z-40 flex flex-col transition-transform duration-300 ease-out">
        <SidebarContent />
      </div>
    );
  }

  // Mobile: Use Sheet that opens/closes
  return (
    <Sheet
      open={sidebarOpen && !!selectedVillage}
      onOpenChange={(open) => {
        setSidebarOpen(open);
        if (!open) setSelectedVillage(null);
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[85vh] p-0"
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>
        <SheetTitle className="sr-only">
          {selectedVillage ? `${selectedVillage.nameEl} - ${selectedVillage.nameEn}` : 'Village Details'}
        </SheetTitle>
        <SheetDescription className="sr-only">
          {selectedVillage ? `Transport options and information for ${selectedVillage.nameEn}` : 'Village information'}
        </SheetDescription>
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
