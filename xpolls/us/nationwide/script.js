const csvUrl = 'polls.csv';

function parseCSVAndRender() {
  Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function(results) {
      const data = results.data.filter(row => row.Date); // Clean empty rows
      renderTable(data);
      renderChart(data);
    }
  });
}

function renderTable(data) {
  const thead = document.querySelector('#pollTable thead');
  const tbody = document.querySelector('#pollTable tbody');

  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function renderChart(data) {
  const ctx = document.getElementById('pollChart').getContext('2d');

  const labels = data.map(row => row.Date);

  // Filter out non-party keys (leave only Democrat, Republican, Independent)
  const parties = Object.keys(data[0]).filter(k =>
    !['Date', 'Poll', 'SampleSize'].includes(k)
  );

  const datasets = parties.map(party => ({
    label: party,
    data: data.map(row => parseFloat(row[party])),
    borderColor: getPartyColor(party),
    backgroundColor: getPartyColor(party),
    tension: 0.3
  }));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Polling Trends Over Time'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Support (%)'
          }
        }
      }
    }
  });
}

function getPartyColor(party) {
  const colors = {
    Democrat: '#357EDD',
    Republican: '#D62E2E',
    Independent: '#808080',
    Other: '#9C27B0'
  };
  return colors[party] || '#333';
}

parseCSVAndRender();
