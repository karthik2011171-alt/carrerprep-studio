import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import useSettings from './hooks/useSettings';

export default function App() {
  const [settings] = useSettings();

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const apply = () => {
      const light = settings.theme === 'light' || (settings.theme === 'system' && media.matches);
      document.documentElement.classList.toggle('light', light);
      document.documentElement.classList.toggle('dark', !light);
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [settings.theme]);

  return <AppRoutes />;
}
