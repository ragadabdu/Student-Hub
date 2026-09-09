import { api } from './api';

export interface HealthStatus {
  status: string;
}

export const healthService = {
  // Check API health
  checkHealth: async (): Promise<HealthStatus> => {
    return api.get<HealthStatus>('/health');
  },
};