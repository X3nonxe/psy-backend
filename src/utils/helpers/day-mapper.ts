// utils/day-mapper.ts
export function mapDayToNumber(indonesianDay: string): number {
	const daysMap: { [key: string]: number } = {
		'senin': 1,
		'selasa': 2,
		'rabu': 3,
		'kamis': 4,
		'jumat': 5,
		'sabtu': 6,
		'minggu': 7
	};

	return daysMap[indonesianDay.toLowerCase()] || 0;
}