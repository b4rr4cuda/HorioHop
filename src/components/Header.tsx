/**
 * Header.tsx
 * 
 * Top navigation bar with HorioHop branding and About/Contact links.
 * Fixed at the top of the viewport with z-index above map but below dialogs.
 */

import { useState } from 'react';
import { Bus, Info, Mail, Database } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useAppContext } from '../context/AppContext';

export function Header() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { currentView, setCurrentView } = useAppContext();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-amber-600" />
            <span className="text-2xl font-bold text-gray-900">HorioHop</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Button
              variant={currentView === 'data' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('data')}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Data View
            </Button>
            <Button
              variant={currentView === 'map' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('map')}
              className="flex items-center gap-2"
            >
              <Bus className="h-4 w-4" />
              Map View
            </Button>
            <Button
              variant="ghost"
              onClick={() => setAboutOpen(true)}
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              About
            </Button>
            <Button
              variant="ghost"
              onClick={() => setContactOpen(true)}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact Us
            </Button>
          </nav>
        </div>
      </header>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Bus className="h-6 w-6 text-amber-600" />
              About HorioHop
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="space-y-4 text-base">
                <p>
                  <strong>HorioHop</strong> is a community-driven shuttle service connecting Cyprus's
                  major cities with the beautiful mountain villages of Troodos. We make it easy to
                  explore traditional Cypriot villages, experience authentic culture, and enjoy the
                  natural beauty of the mountains.
                </p>

                <div>
                  <h3 className="font-semibold text-lg mb-2">How It Works</h3>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>
                      <strong>Browse Villages:</strong> Explore 25+ traditional Troodos villages
                      on our interactive map
                    </li>
                    <li>
                      <strong>Check Routes:</strong> See available public transport options and
                      journey times
                    </li>
                    <li>
                      <strong>Reserve Your Spot:</strong> Prepay to reserve a seat on our shuttle
                      service
                    </li>
                    <li>
                      <strong>Get Confirmed:</strong> We'll email you when enough people have
                      reserved for your chosen date
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
                  <p>
                    We believe that everyone should have easy access to Cyprus's cultural heritage.
                    By connecting demand and organizing group transport, we make village tourism
                    sustainable and accessible for locals and visitors alike.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Why HorioHop?</h3>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>No need to rent a car or navigate mountain roads</li>
                    <li>Affordable group rates when demand is met</li>
                    <li>Support local village economies and tourism</li>
                    <li>Eco-friendly shared transport</li>
                    <li>Flexible booking with prepayment protection</li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    HorioHop is currently in beta. Routes and availability are subject to demand and
                    seasonal schedules.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Contact Us Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Mail className="h-6 w-6 text-amber-600" />
              Contact Us
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="space-y-6 text-base">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Get in Touch</h3>
                  <p>
                    Have questions about our service, need help with a booking, or want to suggest a
                    new village route? We'd love to hear from you!
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Email</h4>
                    <p className="text-amber-600">
                      <a
                        href="mailto:hello@horiohop.com"
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        hello@horiohop.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Phone</h4>
                    <p>
                      <a
                        href="tel:+35722123456"
                        className="text-amber-600 hover:underline"
                      >
                        +357 22 123 456
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monday - Friday, 9:00 AM - 6:00 PM EET
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Office Address</h4>
                    <p className="text-muted-foreground">
                      HorioHop Transport Services
                      <br />
                      123 Makarios Avenue
                      <br />
                      Nicosia, 1065
                      <br />
                      Cyprus
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Common Questions</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium">How do I know if my trip is confirmed?</p>
                      <p className="text-muted-foreground">
                        You'll receive an email confirmation when enough people have reserved for
                        your chosen date, typically by the Thursday before your trip.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">What if not enough people book?</p>
                      <p className="text-muted-foreground">
                        Your prepayment will be fully refunded if we don't reach the minimum number
                        of reservations. You'll be notified via email.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Can I cancel my reservation?</p>
                      <p className="text-muted-foreground">
                        Yes, you can cancel up to 48 hours before your trip for a full refund.
                        Contact us at hello@horiohop.com to cancel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

