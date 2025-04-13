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

    // Destroy previous chart if it exists
    if (window.enthalpyChart) {
        window.enthalpyChart.destroy();
    }

    window.enthalpyChart = new Chart(ctx, {
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
                pointBackgroundColor: 'black',
                pointRadius: 4,
                fill: false,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                annotation: {
                    annotations: [
                        {
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y',
                            value: 0,
                            borderColor: 'black',
                            borderWidth: 2,
                            borderDash: [5, 5]
                        }
                    ]
                },
                tooltip: {
                    enabled: true
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
            pluginsCustom: {
                afterDraw: chart => {
                    const ctx = chart.ctx;
                    const x = chart.scales.x.getPixelForValue(1); // Middle point (Activated Complex)
                    const startY = chart.scales.y.getPixelForValue(data.reactantEnergy[0]);
                    const endY = chart.scales.y.getPixelForValue(data.productEnergy[0]);
                    const arrowDirection = data.isEndothermic ? -1 : 1;

                    // Arrow line
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, endY);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Arrowhead
                    ctx.beginPath();
                    ctx.moveTo(x, endY);
                    ctx.lineTo(x - 5, endY + 10 * arrowDirection);
                    ctx.lineTo(x + 5, endY + 10 * arrowDirection);
                    ctx.closePath();
                    ctx.fillStyle = 'red';
                    ctx.fill();

                    // Label
                    ctx.font = '16px Arial';
                    ctx.fillStyle = 'red';
                    ctx.fillText(`ΔH = ${data.deltaH} kJ`, x + 10, (startY + endY) / 2);
                    ctx.restore();
                }
            }
        },
        plugins: [{
            id: 'custom-arrow-plugin',
            afterDraw(chart) {
                chart.options.pluginsCustom?.afterDraw?.(chart);
            }
        }]
    });
}
