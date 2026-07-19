import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { socket } from './lib/socket';

export default function App() {
  const [loading, setLoading] = useState(true);
  const handleDone = useCallback(() => setLoading(false), []);

  useEffect(() => {
    socket.connect();

    const handleEventUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    };

    socket.on('event:updated', handleEventUpdated);
    socket.on('connect_error', (err) => console.error('Socket connect error', err));

    return () => {
      socket.off('event:updated', handleEventUpdated);
      socket.off('connect_error');
      if (socket.connected) socket.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {loading && <LoadingScreen onDone={handleDone} />}
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
