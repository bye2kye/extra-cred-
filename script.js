document.getElementById('chemistry-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const reactants = document.getElementById('reactants').value.split(',').map(item => item.trim());
  const products = document.getElementById('products').value.split(',').map(item => item.trim());
  const enthalpyChange = parseFloat(document.getElementById('enthalpy-change').value);

  if (!enthalpyChange || isNaN(enthalpyChange)) {
      alert("Please enter a valid enthalpy change value.");
      return;
  }

  const enthalpyData = generatePotentialEnergyData(reactants, products, enthalpyChange);

  // Generate the potential energy diagram
  generatePotentialEnergyGraph(enthalpyData);
});

// Function to generate potential energy data
function generatePotentialEnergyData(reactants, products, deltaH) {
  const isEndothermic = deltaH > 0;
  const reactantEnergy = [0]; // Reactants start at 0 kJ/mol
  const activatedComplexEnergy = [Math.abs(deltaH) + 50]; // Activation energy peak
  const productEnergy = isEndothermic ? [deltaH] : [0 - Math.abs(deltaH)]; // Adjust for reaction type

  return {
      reactants: reactants,
      products: products,
      reactantEnergy: reactantEnergy,
      activatedComplexEnergy: activatedComplexEnergy,
      productEnergy: productEnergy,
      isEndothermic: isEndothermic // Pass the reaction type for later use
  };
}

// Function to generate the potential energy diagram using Chart.js
function generatePotentialEnergyGraph(data) {
  const ctx = document.getElementById('potentialEnergyDiagram').getContext('2d');

  const chartData = {
      labels: ['Reactants', 'Activated Complex', 'Products'],
      datasets: [{
          label: `Potential Energy Diagram (${data.isEndothermic ? 'Endothermic' : 'Exothermic'})`,
          data: [
              ...data.reactantEnergy,
              ...data.activatedComplexEnergy,
              ...data.productEnergy
          ],
          borderColor: data.isEndothermic ? 'blue' : 'green', // Change color based on reaction type
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
                      text: 'Ep (kJ)'
                  }
              },
              x: {
                  title: {
                      display: true,
                      text: 'Reaction progress'
                  }
              }
          },
          plugins: {
              annotation: {
                  annotations: [{
                      type: 'line',
                      mode: 'horizontal',
                      scaleID: 'y',
                      value: Math.max(...data.activatedComplexEnergy), // Activation energy peak
                      borderColor: 'red',
                      borderWidth: 2,
                      label: {
                          content: data.isEndothermic ? 'Energy Absorbed (Activation Energy)' : 'Energy Released (Activation Energy)',
                          enabled: true,
                          position: 'top'
                      }
                  }]
              }
          }
      }
  };

  new Chart(ctx, config);
}
