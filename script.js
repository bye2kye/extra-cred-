document.getElementById('chemistry-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Parse user inputs
    const reactants = document.getElementById('reactants').value.split(',').map(item => item.trim());
    const products = document.getElementById('products').value.split(',').map(item => item.trim());
    const enthalpyChange = parseFloat(document.getElementById('enthalpy-change').value);

    // Validate ΔH input
    if (!enthalpyChange || isNaN(enthalpyChange)) {
        alert("Please enter a valid enthalpy change value.");
        return;
    }

    // Generate data for the enthalpy diagram
    const enthalpyData = generatePotentialEnergyData(reactants, products, enthalpyChange);

    // Generate the potential energy diagram
    generatePotentialEnergyGraph(enthalpyData);
});

function generatePotentialEnergyData(reactants, products, deltaH) {
    const isEndothermic = deltaH > 0;

    // Define energy levels dynamically
    const reactantEnergy = [0];
    const activatedComplexEnergy = [Math.abs(deltaH) + 50]; // Activation energy peak
    const productEnergy = isEndothermic ? [deltaH] : [0 - Math.abs(deltaH)];

    return {
        reactants: reactants.join(' + '), // Combine reactants into a single string
        products: products.join(' + '), // Combine products into a single string
        reactantEnergy: reactantEnergy,
        activatedComplexEnergy: activatedComplexEnergy,
        productEnergy: productEnergy,
        isEndothermic: isEndothermic,
        deltaH: Math.abs(deltaH), // Absolute value of ΔH
    };
}

function generatePotentialEnergyGraph(data) {
    const ctx = document.getElementById('potentialEnergyDiagram').getContext('2d');

    const chartData = {
        labels: [data.reactants, 'Activated Complex', data.products],
        datasets: [{
            label: `Enthalpy Diagram (${data.isEndothermic ? 'Endothermic' : 'Exothermic'})`,
            data: [
                ...data.reactantEnergy,
                ...data.activatedComplexEnergy,
                ...data.productEnergy
            ],
            borderColor: data.isEndothermic ? 'blue' : 'green', // Change color based on reaction type
            fill: false,
            tension: 0.4, // Smoothens the curve
        }]
    };

    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                annotation: {
                    annotations: [
                        // Arrow for ΔH
                        {
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y',
                            xMin: 0.5, // Start of the arrow (around reactants)
                            xMax: 2.5, // End of the arrow (around products)
                            borderColor: 'black',
                            borderWidth: 2,
                            arrowHeads: {
                                end: {
                                    enabled: true,
                                    size: 8,
                                    fill: true,
                                    borderColor: 'black'
                                }
                            },
                            label: {
                                content: `ΔH = ${data.deltaH} kJ`,
                                enabled: true,
                                position: 'top',
                                color: 'black'
                            }
                        },
                        // Dashed horizontal line at 0 kJ
                        {
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y',
                            value: 0, // Y-axis at 0 kJ
                            borderColor: 'red',
                            borderDash: [5, 5], // Dashed line
                        }
                    ]
                }
            },
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
                        text: 'Reaction Progress',
                    },
                },
            },
        }
    };

    new Chart(ctx, config);
}
