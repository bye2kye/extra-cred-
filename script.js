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
                pointBackgroundColor: 'black',
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
        plugins: [Chart.registry.getPlugin('annotation')],
        pluginsConfig: {}
    });

    // Delay to ensure chart has rendered before drawing
    setTimeout(() => {
        drawDeltaHArrow(data);
    }, 300);
}

function drawDeltaHArrow(data) {
    const canvas = document.getElementById('potentialEnergyDiagram');
    const ctx = canvas.getContext('2d');

    if (!chartInstance) return;

    const yScale = chartInstance.scales.y;
    const xScale = chartInstance.scales.x;

    const arrowX = xScale.getPixelForValue(1);
    const startY = yScale.getPixelForValue(data.reactantEnergy[0]);
    const endY = yScale.getPixelForValue(data.productEnergy[0]);
    const direction = data.isEndothermic ? -1 : 1;

    ctx.save();

    // Draw arrow line
    ctx.beginPath();
    ctx.moveTo(arrowX, startY);
    ctx.lineTo(arrowX, endY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowX, endY);
    ctx.lineTo(arrowX - 5, endY + 10 * direction);
    ctx.lineTo(arrowX + 5, endY + 10 * direction);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();

    // Draw label
    ctx.font = '16px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(`ΔH = ${data.deltaH} kJ`, arrowX + 10, (startY + endY) / 2);

    ctx.restore();
}
