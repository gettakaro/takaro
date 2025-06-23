import { logger } from '@takaro/util';
import { config } from '../../config.js';

export interface PopulationStats {
  currentOnlineCount: number;
  totalPlayerCount: number;
  currentPercentage: number;
  targetPercentage: number;
  shouldConnect: boolean;
  bias: number; // How strongly biased toward connecting (0.0-1.0)
}

export class PlayerPopulationManager {
  private log = logger('PlayerPopulationManager');

  /**
   * Calculate the target online percentage based on current time
   */
  getTargetOnlinePercentage(): number {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0=Sunday, 6=Saturday

    // Base hourly curve (0-23 hours)
    let basePercentage = this.calculateHourlyCurve(hour);

    // Weekend boost: Friday evening through Sunday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    if (isWeekend) {
      basePercentage += config.get('population.weekendBoost');
    }

    // Add some random variance to make it feel more organic
    const varianceRange = config.get('population.variance');
    const variance = (Math.random() - 0.5) * (varianceRange * 2); // ±variance%
    const finalPercentage = basePercentage + variance;

    // Clamp between configurable bounds
    const minThreshold = config.get('population.minThreshold');
    const maxThreshold = config.get('population.maxThreshold');
    return Math.max(minThreshold, Math.min(maxThreshold, Math.round(finalPercentage)));
  }

  /**
   * Calculate base population curve based on hour of day
   * Returns percentage (0-100)
   */
  private calculateHourlyCurve(hour: number): number {
    // Define key points for a realistic daily curve
    const timePoints = [
      { hour: 0, percentage: 50 }, // Midnight - still some players
      { hour: 3, percentage: 10 }, // 3 AM - lowest point
      { hour: 6, percentage: 15 }, // 6 AM - early risers
      { hour: 8, percentage: 30 }, // 8 AM - morning commuters
      { hour: 12, percentage: 45 }, // Noon - lunch break
      { hour: 14, percentage: 35 }, // 2 PM - post-lunch dip
      { hour: 17, percentage: 60 }, // 5 PM - after work
      { hour: 19, percentage: 85 }, // 7 PM - prime time start
      { hour: 21, percentage: 90 }, // 9 PM - peak hours
      { hour: 23, percentage: 65 }, // 11 PM - winding down
    ];

    // Find the two points to interpolate between
    let beforePoint = timePoints[timePoints.length - 1]; // Default to last point
    let afterPoint = timePoints[0]; // Default to first point

    for (let i = 0; i < timePoints.length; i++) {
      if (timePoints[i].hour <= hour) {
        beforePoint = timePoints[i];
      }
      if (timePoints[i].hour > hour) {
        afterPoint = timePoints[i];
        break;
      }
    }

    // Handle wrap-around (e.g., 23:00 to 03:00)
    if (beforePoint.hour > afterPoint.hour) {
      if (hour >= beforePoint.hour) {
        // We're in the late night period (23:00-23:59)
        afterPoint = { hour: 24 + afterPoint.hour, percentage: afterPoint.percentage };
      } else {
        // We're in the early morning period (00:00-03:00)
        beforePoint = { hour: beforePoint.hour - 24, percentage: beforePoint.percentage };
      }
    }

    // Linear interpolation between the two points
    const hourDiff = afterPoint.hour - beforePoint.hour;
    const percentageDiff = afterPoint.percentage - beforePoint.percentage;
    const progress = (hour - beforePoint.hour) / hourDiff;

    return beforePoint.percentage + percentageDiff * progress;
  }

  /**
   * Analyze current population and determine connection bias
   */
  analyzePopulation(currentOnlineCount: number, totalPlayerCount: number): PopulationStats {
    const targetPercentage = this.getTargetOnlinePercentage();
    const currentPercentage = totalPlayerCount > 0 ? (currentOnlineCount / totalPlayerCount) * 100 : 0;

    // Calculate how far we are from target
    const percentageDiff = targetPercentage - currentPercentage;
    const normalizedDiff = percentageDiff / 100; // Convert to -1.0 to 1.0 range

    // Calculate bias toward connecting (0.0 = always disconnect, 1.0 = always connect)
    let bias: number;
    if (Math.abs(percentageDiff) <= 3) {
      // Within 3% of target - use balanced approach
      bias = 0.5;
    } else if (percentageDiff > 0) {
      // Below target - bias toward connecting
      // Stronger bias the further we are from target
      bias = Math.min(0.95, 0.5 + Math.abs(normalizedDiff) * 3);
    } else {
      // Above target - bias toward disconnecting
      // More aggressive disconnection when over target
      bias = Math.max(0.05, 0.5 - Math.abs(normalizedDiff) * 3);
    }

    const shouldConnect = Math.random() < bias;

    const stats: PopulationStats = {
      currentOnlineCount,
      totalPlayerCount,
      currentPercentage: Math.round(currentPercentage * 10) / 10, // Round to 1 decimal
      targetPercentage,
      shouldConnect,
      bias: Math.round(bias * 100) / 100, // Round to 2 decimals
    };

    this.log.debug('Population analysis', {
      time: new Date().toLocaleTimeString(),
      current: `${stats.currentOnlineCount}/${stats.totalPlayerCount} (${stats.currentPercentage}%)`,
      target: `${stats.targetPercentage}%`,
      bias: `${Math.round(bias * 100)}%`,
      action: shouldConnect ? 'CONNECT' : 'DISCONNECT',
    });

    return stats;
  }

  /**
   * Get human-readable description of current time period
   */
  getCurrentTimePeriod(): string {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

    let period: string;
    if (hour >= 3 && hour < 7) period = 'Late Night';
    else if (hour >= 7 && hour < 9) period = 'Morning Commute';
    else if (hour >= 9 && hour < 12) period = 'Morning Work';
    else if (hour >= 12 && hour < 14) period = 'Lunch Break';
    else if (hour >= 14 && hour < 17) period = 'Afternoon Work';
    else if (hour >= 17 && hour < 19) period = 'After Work';
    else if (hour >= 19 && hour < 22) period = 'Prime Time';
    else if (hour >= 22 || hour < 3) period = 'Evening Wind-down';
    else period = 'Unknown';

    return `${period}${isWeekend ? ' (Weekend)' : ''}`;
  }
}
