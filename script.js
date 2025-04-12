document.getElementById('chemistry-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const reactants = document.getElementById('reactants').value.split(',').map(item => item.trim());
  const products = document.getElementById('products').value.split(',').map(item => item.trim());
  const enthalpyChange = parseFloat(document.getElementById('enthalpy-change').value);

  const enthalpyData = calculateEnthalpy(reactants, products, enthalpyChange);

  // Generate the graph after calculation
  generateGraph(enthalpyData);
});

// Mock function to calculate enthalpy (this can be expanded later)
function calculateEnthalpy(reactants, products, deltaH) {
  // Mock enthalpy values for reactants, products, transition state, and reaction intermediate
  const enthalpyReactants = Array(reactants.length).fill(0);  // H2 and O2
  const enthalpyProducts = Array(products.length).fill(deltaH);  // Using the user input for the products

  const transitionState = [50];  // Activated complex (random value)
  const reactionIntermediate = [10];  // A simple intermediate value

  return {
      reactants: reactants,
      products: products,
      enthalpyReactants: enthalpyReactants,
      enthalpyProducts: enthalpyProducts,
      transitionState: transitionState,
      reactionIntermediate: reactionIntermediate,
  };
}

function generateGraph(data) {
  const ctx = document.getElementById('enthalpyGraph').getContext('2d');
  
  const chartData = {
      labels: ['Reactants', 'Activated Complex', 'Reaction Intermediate', 'Products'],
      datasets: [{
          label: 'Enthalpy (kJ/mol)',
          data: [
              ...data.enthalpyReactants,
              ...data.transitionState,
              ...data.reactionIntermediate,
              ...data.enthalpyProducts
          ],
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
          tension: 0.1
      }]
  };

  const config = {
      type: 'line',
      data: chartData,
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  };

  new Chart(ctx, config);
}
