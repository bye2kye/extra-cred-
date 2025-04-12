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

    generatePotentialEnergyGraph(enthalpyData);
});

function generatePotentialEnergyData(reactants, products, deltaH) {
    const isEndothermic = deltaH > 0;

    const reactantEnergy = [0];
    const activatedComplexEnergy = [Math.abs(deltaH) + 50];
    const productEnergy = isEndothermic ? [deltaH] : [0 - Math.abs(deltaH)];

    return {
        reactants: reactants.join(' + '),
        products: products.join(' + '),
        reactantEnergy: reactantEnergy,
        activatedComplexEnergy: activatedComplexEnergy,
        productEnergy: productEnergy,
        isEndothermic: isEndothermic,
        deltaH: Math.abs(deltaH),
    };
}

function generatePotentialEnergyGraph(data) {
    const ctx = document.getElementById('potentialEnergyDiagram').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [data.reactants, 'Activated Complex', data.products],
            datasets: [{
                label: `Enthalpy Diagram (${data.isEndothermic ? 'Endothermic' : 'Exothermic'})`,
                data: [
                    ...data.reactantEnergy,
                    ...data.activatedComplexEnergy,
                    ...data.productEnergy
                ],
                borderColor: data.isEndothermic ? 'blue' : 'green',
                fill: false,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                annotation: {
                    annotations: [
                        {
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y',
                            value: 0,
                            borderColor: 'red',
                            borderDash: [5, 5],
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
    });

    // Manually draw the ΔH arrow
    const canvas = document.getElementById('potentialEnergyDiagram');
    const ctxOverlay = canvas.getContext('2d');
    ctxOverlay.save();

    // Arrow properties
    const arrowStart = chart.scales.y.getPixelForValue(data.reactantEnergy[0]);
    const arrowEnd = chart.scales.y.getPixelForValue(data.productEnergy[0]);
    const arrowX = chart.scales.x.getPixelForValue(1); // Place arrow near "Activated Complex"

    // Draw the arrow
    ctxOverlay.beginPath();
    ctxOverlay.moveTo(arrowX, arrowStart);
    ctxOverlay.lineTo(arrowX, arrowEnd);
    ctxOverlay.strokeStyle = 'black';
    ctxOverlay.lineWidth = 2;
    ctxOverlay.stroke();

    // Draw arrowhead (pointing up or down depending on ΔH)
    const arrowDirection = data.isEndothermic ? -1 : 1; // Up for endothermic, down for exothermic
    ctxOverlay.beginPath();
    ctxOverlay.moveTo(arrowX, arrowEnd);
    ctxOverlay.lineTo(arrowX - 5, arrowEnd + 10 * arrowDirection);
    ctxOverlay.lineTo(arrowX + 5, arrowEnd + 10 * arrowDirection);
    ctxOverlay.closePath();
    ctxOverlay.fillStyle = 'black';
    ctxOverlay.fill();

    // Label ΔH
    ctxOverlay.font = '16px Arial';
    ctxOverlay.fillStyle = 'black';
    ctxOverlay.fillText(`ΔH = ${data.deltaH} kJ`, arrowX + 10, (arrowStart + arrowEnd) / 2);

    ctxOverlay.restore();
}
