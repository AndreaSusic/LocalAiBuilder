export function renderProducts(products = []) {
  console.log(`🎨 Rendering ${products.length} products to grid`);

  // Wait for DOM to be ready if needed
  setTimeout(() => {
    const grid = document.querySelector('.services-grid');
    if (!grid) {
      console.log('⚠️ Services grid not found, skipping product rendering');
      return;
    }

    if (!products.length) {
      console.log('⚠️ No products to render, keeping existing content');
      return;
    }

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
  }, 100); // Small delay to ensure DOM is ready
}