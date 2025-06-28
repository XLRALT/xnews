const csvUrl = 'xpolls/us/trump-approval/polls.csv'; // Adjust path to your CSV

function getPartyColor(party) {
    const colors = {
        'Approve': '#4B912D',
        'Disapprove': '#D62E2E',
        'Neutral/No Opinion': '#666666',
    };
    return colors[party] || '#888888';
}

function adjustYScale(chart) {
    const xMin = chart.scales.x.min;
    const xMax = chart.scales.x.max;

    const visibleYValues = [];

    chart.data.datasets.forEach(dataset => {
        dataset.data.forEach((value, index) => {
            const time = new Date(chart.data.labels[index]).getTime();
            if (time >= xMin && time <= xMax && value != null) {
                visibleYValues.push(value);
            }
        });
    });

    if (visibleYValues.length) {
        const minY = Math.min(...visibleYValues);
        const maxY = Math.max(...visibleYValues);
        const padding = (maxY - minY) * 0.1 || 5;

        chart.options.scales.y.min = Math.max(0, minY - padding);
        chart.options.scales.y.max = Math.min(100, maxY + padding);
        chart.update('none');
    }
}

function parseCSVAndRender() {
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const data = results.data.filter(row => row.Date && (row.Approve || row.Disapprove));
            if (!data.length) {
                alert('No valid data found in CSV');
                return;
            }

            const keys = ['Approve', 'Disapprove'];
            const grouped = {};

            data.forEach(row => {
                if (!grouped[row.Date]) grouped[row.Date] = {};
                keys.forEach(k => {
                    if (!grouped[row.Date][k]) grouped[row.Date][k] = [];
                    const val = parseFloat(row[k]);
                    if (!isNaN(val)) grouped[row.Date][k].push(val);
                });
            });

            const labels = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

            const datasets = keys.map(key => ({
                label: key,
                data: labels.map(date => {
                    const vals = grouped[date][key] || [];
                    return vals.length ? vals.reduce((sum, v) => sum + v, 0) / vals.length : null;
                }),
                borderColor: getPartyColor(key),
                backgroundColor: getPartyColor(key),
                tension: 0.3,
                spanGaps: false,
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
            }));

            const ctx = document.getElementById('pollChart').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'nearest', intersect: false },
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Trump Approval Rating Over Time' },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1) ?? 'N/A'}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd', displayFormats: { day: 'MMM dd' } },
                            ticks: { autoSkip: true, maxTicksLimit: 12 }
                        },
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });

            adjustYScale(chart); // Set initial Y-axis zoom

            // Redirect when chart is clicked
            document.getElementById('pollChart').onclick = () => {
                window.location.href = 'xpolls/us/trump-approval/index.html'; // 👈 your target subsite
            };  
        },
        error: (err) => {
            console.error('CSV load error:', err);
            alert('Failed to load CSV data');
        }
    });
}

window.onload = () => {
    parseCSVAndRender();
};
