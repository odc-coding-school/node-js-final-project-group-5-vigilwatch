// I Fetching data for Incidents per Location
fetch("/analytics/incidents-per-location")
	.then((response) => response.json())
	.then((data) => {
		const labels = data.map((item) => item.location);
		const counts = data.map((item) => item.incidentCount);
		const ctx = document
			.getElementById("incidentsPerLocationChart")
			.getContext("2d");
		new Chart(ctx, {
			type: "bar",
			data: {
				labels: labels,
				datasets: [
					{
						label: "Number of Incidents",
						data: counts,
						backgroundColor: "rgba(75, 192, 192, 0.2)",
						borderColor: "rgba(75, 192, 192, 1)",
						borderWidth: 1,
					},
				],
			},
		});
	});

// I Fetching data for Specific Incidents per Location
fetch("/analytics/specific-incidents-per-location")
	.then((response) => response.json())
	.then((data) => {
		// now I Getting a list of all unique locations and incident types
		const allLocations = [...new Set(data.map((item) => item.location))];
		const allIncidentTypes = [
			...new Set(data.map((item) => item.incident_type)),
		];

		// I Initializing the groupedData object
		const groupedData = allLocations.reduce((acc, location) => {
			acc[location] = allIncidentTypes.reduce((typeAcc, incidentType) => {
				typeAcc[incidentType] = 0;
				return typeAcc;
			}, {});
			return acc;
		}, {});

		// Populating the groupedData with the actual incident counts from the API response
		data.forEach((item) => {
			groupedData[item.location][item.incident_type] = item.incidentCount;
		});

		// This is the chart dataset
		const labels = allLocations;
		const datasets = allIncidentTypes.map((incidentType) => ({
			label: incidentType,
			data: labels.map((location) => groupedData[location][incidentType] || 0),
			backgroundColor: getRandomColor(),
			borderColor: getRandomColor(),
			borderWidth: 1,
		}));

		// I Rendering the chart
		const ctx = document
			.getElementById("specificIncidentsPerLocationChart")
			.getContext("2d");
		new Chart(ctx, {
			type: "bar",
			data: {
				labels: labels,
				datasets: datasets,
			},
		});
	});

fetch("/analytics/incident-trends")
	.then((response) => response.json())
	.then((data) => {
		const labels = data.map((item) => formatDate(new Date(item.incidentDate)));
		const locations = [...new Set(data.map((item) => item.location))];

		const datasets = locations.map((location) => ({
			label: location,
			data: labels.map((date) => {
				const entry = data.find(
					(item) =>
						formatDate(new Date(item.incidentDate)) === date &&
						item.location === location
				);
				return entry ? entry.incidentCount : 0;
			}),
			borderColor: getRandomColor(),
			fill: false,
		}));

		const ctx = document.getElementById("incidentTrendsChart").getContext("2d");
		new Chart(ctx, {
			type: "line",
			data: {
				labels: labels,
				datasets: datasets,
			},
		});
	});

// Function to format date as "Jan DD, YYYY HH:MM AM/PM"
function formatDate(date) {
	const options = {
		month: "short",
		day: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	};
	return date.toLocaleString("en-US", options);
}

// to get a random color when reload the page
function getRandomColor() {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
