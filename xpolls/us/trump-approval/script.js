const csvUrl = 'polls.csv';

let allData = [];
let showingAll = false;

function parseCSVAndRender() {
  Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function (results) {
      allData = results.data.filter(row => row.Date); // Clean empty rows
      renderData(); // initial render with last week data for table, but full for chart
    }
  });
}

function renderData() {
  const filteredData = showingAll ? allData : filterLastWeek(allData);
  renderTable(filteredData);
  renderChart(allData);  // Always use allData for chart
  updateExpandButton();
}

function filterLastWeek(data) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return data.filter(row => {
    const rowDate = new Date(row.Date);
    return rowDate >= oneWeekAgo;
  });
}

function updateExpandButton() {
  let btn = document.getElementById('expandBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'expandBtn';
    btn.style.margin = '10px 0';
    btn.addEventListener('click', () => {
      showingAll = !showingAll;
      renderData();
    });
    document.querySelector('#pollTable').insertAdjacentElement('beforebegin', btn);
  }
  btn.textContent = showingAll ? 'Show Last Week' : 'Show All Polls';
}

function renderTable(data) {
  const thead = document.querySelector('#pollTable thead');
  const tbody = document.querySelector('#pollTable tbody');

  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (data.length === 0) return;

  // Exclude URL column
  const headers = Object.keys(data[0]).filter(h => h !== 'URL');

  // Build header row
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Build body rows
  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');

      if (header === 'Poll' && row['URL']) {
        const a = document.createElement('a');
        a.href = row['URL'];
        a.textContent = row['Poll'];
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        td.appendChild(a);
      } else if (header === 'Rating') {
        td.classList.add('grade-cell');
        td.textContent = row[header];

        // Tooltip text (customize this as needed)
        const tooltip = document.createElement('span');
        tooltip.classList.add('tooltip-text');
        tooltip.textContent = 'Rated by AI';
        td.appendChild(tooltip);
      } else {
        td.textContent = row[header];
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function renderChart(data) {
  const ctx = document.getElementById('pollChart').getContext('2d');

  const parties = Object.keys(data[0]).filter(k =>
    !['Date', 'Poll', 'URL', 'Neutral/No Opinion', 'Sample Size', 'Rating'].includes(k)
  );

  const grouped = {};
  data.forEach(row => {
    const date = row.Date;
    if (!grouped[date]) {
      grouped[date] = {};
      parties.forEach(party => {
        grouped[date][party] = { weightedSum: 0, weightSum: 0 };
      });
    }

    const rating = parseFloat(row.Rating);
    const weight = (!isNaN(rating) && rating > 0) ? rating : 1;

    parties.forEach(party => {
      const val = parseFloat(row[party]);
      if (!isNaN(val)) {
        grouped[date][party].weightedSum += val * weight;
        grouped[date][party].weightSum += weight;
      }
    });
  });

  const labels = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
  const minDate = new Date(labels[0]);
  const maxDate = new Date(labels[labels.length - 1]);

  const datasets = parties.map(party => ({
    label: party,
    data: labels.map(date => {
      const info = grouped[date][party];
      return info.weightSum > 0 ? info.weightedSum / info.weightSum : null;
    }),
    borderColor: getPartyColor(party),
    backgroundColor: getPartyColor(party),
    tension: 0.5
  }));

  // Calculate global min and max for y axis
  let globalMin = Infinity;
  let globalMax = -Infinity;
  datasets.forEach(ds => {
    ds.data.forEach(value => {
      if (value !== null) {
        if (value < globalMin) globalMin = value;
        if (value > globalMax) globalMax = value;
      }
    });
  });

  // Padding (~5% of range) for visual breathing room
  const padding = (globalMax - globalMin) * 0.05 || 5;
  const yMin = Math.max(0, globalMin - padding);
  const yMax = Math.min(100, globalMax + padding);

  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Trend Over Time (Weighted by Rating)' },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: context => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value !== null ? value.toFixed(1) : 'N/A'}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd' },
          min: minDate,
          max: maxDate,
          ticks: { autoSkip: true, maxTicksLimit: 10 }
        },
        y: {
          beginAtZero: false,
          min: yMin,
          max: yMax
        }
      }
    }
  });
}

function getPartyColor(party) {
  const colors = {
    democrat: '#357EDD',
    republican: '#D62E2E',
    independent: '#808080',
    other: '#9C27B0',
    approve: '#4B912D',
    disapprove: '#9E2424',
    neutralnoopinion: '#808080'
  };
  return colors[party.toLowerCase()] || '#333';
}

parseCSVAndRender();
