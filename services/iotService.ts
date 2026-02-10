
import { EagleTraxTelemetry } from "../types";

export const iotService = {
  getTelemetryStream: (assetId: string): EagleTraxTelemetry => {
    const now = Date.now();
    const timeComponent = now / 10000; 
    const hash = assetId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    
    // Simulação de anomalia baseada no ID do Ativo (Ativos específicos "falham" para teste)
    const isAnomalous = hash % 7 === 0;

    const baseTemp = isAnomalous ? 102.5 : 99.2;
    const tempFluctuation = Math.sin(timeComponent) * 0.6 + (Math.random() * 0.15);
    
    const baseHum = 52.5;
    const humFluctuation = Math.cos(timeComponent * 0.4) * 1.5;

    const co2Base = isAnomalous ? 1400 : 800;
    const co2Noise = Math.abs(Math.sin(timeComponent * 1.5)) * 400;

    const simulatedDay = (hash % 21) + 1;

    return {
      temperature: Number((baseTemp + tempFluctuation).toFixed(1)),
      humidity: Number((baseHum + humFluctuation).toFixed(1)),
      co2: Math.round(co2Base + co2Noise),
      damper: Math.abs(Math.round(Math.sin(timeComponent) * 100)),
      turning: Math.sin(timeComponent * 4) > 0.4 ? 'LEFT' : (Math.sin(timeComponent * 4) < -0.4 ? 'RIGHT' : 'LEVEL'),
      programStep: simulatedDay, 
      totalDays: 21,
      lastUpdate: new Date().toISOString()
    };
  }
};
