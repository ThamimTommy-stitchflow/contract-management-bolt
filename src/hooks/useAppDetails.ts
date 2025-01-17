import { useState, useEffect } from 'react';
import { appService } from '../services/apps';
import { App } from '../types/app';
import { useCompany } from '../context/CompanyContext';

export function useAppDetails(appIds: string[]) {
  const [appDetailsMap, setAppDetailsMap] = useState<Map<string, App>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { company } = useCompany();

  useEffect(() => {
    const fetchAppDetails = async () => {
      if (!company?.id || appIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get all company apps in a single request
        const allApps = await appService.getCompanyAppsWithDetails(company.id);
        
        // Filter and map only the requested apps
        const newMap = new Map<string, App>();
        allApps.forEach((app: App) => {
          if (appIds.includes(app.id)) {
            newMap.set(app.id, app);
          }
        });
        
        setAppDetailsMap(newMap);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch app details'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppDetails();
  }, [company?.id, JSON.stringify(appIds)]);

  return { appDetailsMap, isLoading, error };
}