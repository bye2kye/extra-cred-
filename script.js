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

let chartInstance = null;

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
    const canvas = document.getElementById('potentialEnergyDiagram');
    const ctx = canvas.getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
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
                pointBackgroundColor: data.isEndothermic ? 'blue' : 'green',
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 3,
                fill: false,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            return `Ep = ${context.raw} kJ`;
                        }
                    }
                },
                legend: {
                    display: true
                },
                annotation: {
                    annotations: {
                        zeroLine: {
                            type: 'line',
                            yMin: 0,
                            yMax: 0,
                            borderColor: 'black',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                enabled: false
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Ep (kJ)',
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Reaction Progress',
                    }
                }
            }
        },
        plugins: [Chart.registry.getPlugin('annotation')]
    });

    // Draw ΔH arrow on overlay
    setTimeout(() => {
        const arrowStart = chartInstance.scales.y.getPixelForValue(data.reactantEnergy[0]);
        const arrowEnd = chartInstance.scales.y.getPixelForValue(data.productEnergy[0]);
        const arrowX = chartInstance.scales.x.getPixelForValue(1);

        const ctxOverlay = canvas.getContext('2d');
        ctxOverlay.save();

        // Draw red ΔH arrow line
        ctxOverlay.beginPath();
        ctxOverlay.moveTo(arrowX, arrowStart);
        ctxOverlay.lineTo(arrowX, arrowEnd);
        ctxOverlay.strokeStyle = 'red';
        ctxOverlay.lineWidth = 2;
        ctxOverlay.stroke();

        // Draw arrowhead
        const arrowDir = data.isEndothermic ? -1 : 1;
        ctxOverlay.beginPath();
        ctxOverlay.moveTo(arrowX, arrowEnd);
        ctxOverlay.lineTo(arrowX - 5, arrowEnd + 10 * arrowDir);
        ctxOverlay.lineTo(arrowX + 5, arrowEnd + 10 * arrowDir);
        ctxOverlay.closePath();
        ctxOverlay.fillStyle = 'red';
        ctxOverlay.fill();

        // Label
        ctxOverlay.font = '16px Arial';
        ctxOverlay.fillStyle = 'red';
        ctxOverlay.fillText(`ΔH = ${data.deltaH} kJ`, arrowX + 10, (arrowStart + arrowEnd) / 2);

        ctxOverlay.restore();
    }, 300); // Delay to ensure chart has rendered
}
