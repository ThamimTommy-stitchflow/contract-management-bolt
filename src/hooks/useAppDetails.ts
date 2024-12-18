import { useState, useEffect } from 'react';
import { appService } from '../services/apps';
import { App } from '../types/app';

export function useAppDetails(appIds: string[]) {
  const [appDetailsMap, setAppDetailsMap] = useState<Map<string, App>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAppDetails = async () => {
      try {
        setIsLoading(true);
        console.log(appIds)
        const appPromises = appIds.map(id => appService.getAppById(id));
        const apps = await Promise.all(appPromises);
        const newMap = new Map(apps.map(app => [app.id, app]));
        console.log(newMap);
        setAppDetailsMap(newMap);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch app details'));
      } finally {
        setIsLoading(false);
      }
    };

    if (appIds.length > 0) {
      fetchAppDetails();
    }
  }, [appIds.join(',')]);

  return { appDetailsMap, isLoading, error };
}