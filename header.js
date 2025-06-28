(function setupLayout() {
  // Set base styles for html and body
  document.documentElement.style.cssText = `
    height: 100%;
  `;

  document.body.style.cssText = `
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    margin: 0;
    font-family: sans-serif;
  `;

  // Top Header
  const header = document.createElement('header');
  header.id = 'header-container';
  header.style.cssText = `
    background-color: #1a1a1a;
    color: white;
    padding: 12px 20px;
    font-size: 24px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;

  const link = document.createElement('a');
  link.href = '/index.html';  // absolute path from root
  link.textContent = 'XNews';
  link.style.cssText = `
    color: white;
    text-decoration: none;
  `;
  link.addEventListener('mouseover', () => link.style.textDecoration = 'underline');
  link.addEventListener('mouseout', () => link.style.textDecoration = 'none');  

  header.appendChild(link);
  document.body.appendChild(header);
})();
