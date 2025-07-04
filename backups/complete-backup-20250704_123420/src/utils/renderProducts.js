export function renderProducts(products = []) {
  const grid = document.querySelector('.services-grid');
  if (!grid || !products.length) return;

  console.log(`🎨 Rendering ${products.length} products to grid`);

  // Adjust column class based on number of products
  grid.classList.remove('one-column', 'two-columns', 'three-columns');
  grid.classList.add(
    products.length === 1 ? 'one-column' :
    products.length === 2 ? 'two-columns' : 'three-columns'
  );

  // Clear existing placeholder content
  grid.innerHTML = '';
  
  // Render each product as a service card
  products.forEach(product => {
    const imageUrl = product.image || 'https://via.placeholder.com/300x200';
    const description = product.description || '';
    
    grid.insertAdjacentHTML(
      'beforeend',
      `<div class="service-card">
         <img src="${imageUrl}" alt="${product.name}" loading="lazy">
         <h4>${product.name}</h4>
         <p>${description}</p>
       </div>`
    );
  });

  console.log('✅ Products rendered successfully');
}