/**
 * App.tsx
 * 
 * Root component. Sets up providers and renders Map + Sidebar/Drawer based on screen size.
 * 
 * Layout: Map takes full viewport. Sidebar (desktop) or Drawer (mobile) overlays when village selected.
 */

import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { DataView } from './components/DataView';
import { VillageSheet } from './components/VillageSheet';
import { Toaster } from './components/ui/toaster';
import { useAppContext } from './context/AppContext';

function AppContent() {
  const { currentView } = useAppContext();

  return (
    <>
      <Header />
      {currentView === 'map' ? (
        <>
          <MapView />
          <VillageSheet />
        </>
      ) : (
        <DataView />
      )}
      <Toaster />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
