// District coordinates for GPS → nearest-district detection (the app is
// location-first: on open we point the feed at the user's district).
export const DISTRICT_GEO: { name: string; lat: number; lng: number }[] = [
  { name: "Durgapur", lat: 23.55, lng: 87.29 },
  { name: "Asansol", lat: 23.68, lng: 86.99 },
  { name: "Kolkata", lat: 22.57, lng: 88.36 },
  { name: "Bardhaman", lat: 23.24, lng: 87.86 },
  { name: "Bankura", lat: 23.23, lng: 87.07 },
];

export function nearestDistrict(lat: number, lng: number): string {
  let best = DISTRICT_GEO[0];
  let bestD = Infinity;
  for (const d of DISTRICT_GEO) {
    const dist = (d.lat - lat) ** 2 + (d.lng - lng) ** 2;
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best.name;
}
