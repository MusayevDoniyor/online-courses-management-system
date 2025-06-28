export interface ServerStatistics {
  totalRequests: number;
  requestsPerMinute: number;
  serverUptime: string;
  currentServerTime: string;
  requestHistoryCount: number;
  averageRequestsPerMinute: number;
}

export interface HelloResponse {
  message: string;
  statistics: ServerStatistics;
}
