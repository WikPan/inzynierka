import { Controller, Get, Query } from '@nestjs/common';
import data from 'polskie-miejscowosci';

@Controller('geo')
export class GeoController {
  @Get('autocomplete')
  async autocomplete(@Query('query') query: string) {
    if (!query || query.trim().length < 2) return [];

    const input = query.toLowerCase();

    const results = data
      .filter((item: any) =>
        item.Name.toLowerCase().includes(input)
      )
      .slice(0, 10)
      .map((item: any) => ({
        label: `${item.Name}, ${item.Province}`,
        city: item.Name,
        province: item.Province,
        type: item.Type,
        district: item.District,
        commune: item.Commune,
        lat: item.Latitude,
        lon: item.Longitude,
      }));

    return results;
  }

  @Get('reverse')
  async reverse(@Query('lat') lat: string, @Query('lon') lon: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (isNaN(latitude) || isNaN(longitude)) return [];

    const nearest = (data as any[]).reduce((closest, current) => {
      const dLat = latitude - current.Latitude;
      const dLon = longitude - current.Longitude;
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      return !closest || dist < closest.dist ? { ...current, dist } : closest;
    }, null);

    if (!nearest) return [];

    return {
      label: `${nearest.Name}, ${nearest.Province}`,
      city: nearest.Name,
      province: nearest.Province,
      lat: nearest.Latitude,
      lon: nearest.Longitude,
    };
  }
}
