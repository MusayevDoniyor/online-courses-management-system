import { Injectable } from '@nestjs/common';

interface ServerStatistics {
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

@Injectable()
export class AppService {
  private requestCount = 0;
  private requestTimestamps: Date[] = [];
  private readonly startupTime = new Date();

  getHello(): HelloResponse {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentRequests = this.requestTimestamps.filter(
      (ts) => ts > oneMinuteAgo,
    ).length;

    const uptimeSeconds = Math.floor(
      (now.getTime() - this.startupTime.getTime()) / 1000,
    );
    const uptime = this.formatUptime(uptimeSeconds);

    return {
      message: 'Hello World 🌏!',
      statistics: {
        totalRequests: this.requestCount,
        requestsPerMinute: recentRequests,
        serverUptime: uptime,
        currentServerTime: now.toISOString(),
        requestHistoryCount: this.requestTimestamps.length,
        averageRequestsPerMinute:
          this.calculateAverageRequestsPerMinute(uptimeSeconds),
      },
    };
  }

  recordRequest(): void {
    this.requestCount++;
    this.requestTimestamps.push(new Date());
  }

  public resetCounters(): void {
    this.requestCount = 0;
    this.requestTimestamps = [];
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }

  private calculateAverageRequestsPerMinute(uptimeSeconds: number): number {
    const uptimeMinutes = uptimeSeconds / 60;
    return uptimeMinutes > 0
      ? parseFloat((this.requestCount / uptimeMinutes).toFixed(2))
      : 0;
  }
}
