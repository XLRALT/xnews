const csvUrl = 'xpolls/us/trump-approval/polls.csv'; // Adjust path to your CSV

function getPartyColor(party) {
    const colors = {
        'Approve': '#4B912D',
        'Disapprove': '#D62E2E',
        'Neutral/No Opinion': '#666666',
    };
    return colors[party] || '#888888';
}

function parseCSVAndRender() {
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const data = results.data.filter(row => row.Date && (row.Approve || row.Disapprove || row['Neutral/No Opinion']));
            if (!data.length) {
                alert('No valid data found in CSV');
                return;
            }

            const keys = ['Approve', 'Disapprove', 'Neutral/No Opinion'];
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
                    if (vals.length === 0) return null;
                    const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
                    return avg;
                }),
                borderColor: getPartyColor(key),
                backgroundColor: getPartyColor(key),
                tension: 0.3,
                spanGaps: false,
                fill: false,
                borderWidth: 2,
                pointRadius: 3,
            }));

            const ctx = document.getElementById('pollChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    interaction: { mode: 'nearest', intersect: false },
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Trump Approval Rating Over Time' },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1) ?? 'N/A'}`,
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd', displayFormats: { day: 'MMM dd' } },
                            ticks: { autoSkip: true, maxTicksLimit: 10 }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            beginAtZero: true
                        }
                    }
                }
            });
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
