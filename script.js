document.getElementById('chemistry-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const reactants = document.getElementById('reactants').value.split(',').map(item => item.trim());
  const products = document.getElementById('products').value.split(',').map(item => item.trim());
  const enthalpyChange = parseFloat(document.getElementById('enthalpy-change').value);

  const enthalpyData = generatePotentialEnergyData(reactants, products, enthalpyChange);

  // Generate the potential energy diagram
  generatePotentialEnergyGraph(enthalpyData);
});

// Function to generate potential energy data
function generatePotentialEnergyData(reactants, products, deltaH) {
  // Assigning example values for potential energy (Ep)
  const reactantEnergy = [0]; // Reactants start at 0 kJ/mol
  const productEnergy = [deltaH]; // Products have the energy change value

  // Peak energy for activated complex (this will be a fixed value higher than reactants)
  const activatedComplexEnergy = [50]; // Energy at activated complex

  return {
      reactants: reactants,
      products: products,
      reactantEnergy: reactantEnergy,
      productEnergy: productEnergy,
      activatedComplexEnergy: activatedComplexEnergy,
  };
}

// Function to generate the potential energy diagram using Chart.js
function generatePotentialEnergyGraph(data) {
  const ctx = document.getElementById('potentialEnergyDiagram').getContext('2d');
  
  const chartData = {
      labels: ['Reactants', 'Activated Complex', 'Products'],
      datasets: [{
          label: 'Potential Energy (Ep)',
          data: [
              ...data.reactantEnergy,
              ...data.activatedComplexEnergy,
              ...data.productEnergy
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
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true,
                  title: {
                      display: true,
                      text: 'Ep (kJ)',
                  },
              },
              x: {
                  title: {
                      display: true,
                      text: 'Reaction progress',
                  },
              },
          },
          annotation: {
              annotations: [{
                  type: 'line',
                  mode: 'horizontal',
                  scaleID: 'y',
                  value: 50, // Activator complex peak
                  borderColor: 'red',
                  borderWidth: 2,
                  label: {
                      content: 'Energy Absorbed (Activation Energy)',
                      enabled: true,
                      position: 'top'
                  }
              }]
          }
      }
  };

  new Chart(ctx, config);
}
