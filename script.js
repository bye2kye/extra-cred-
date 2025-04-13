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
        rawDeltaH: deltaH
    };
}

function generatePotentialEnergyGraph(data) {
    const canvas = document.getElementById('potentialEnergyDiagram');
    const ctx = canvas.getContext('2d');

    const overlayCanvas = document.getElementById('overlayCanvas');
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;

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
    });

    setTimeout(() => {
        drawDeltaHArrow(data);
    }, 300);
}

function drawDeltaHArrow(data) {
    const overlayCanvas = document.getElementById('overlayCanvas');
    const ctx = overlayCanvas.getContext('2d');

    if (!chartInstance) return;

    const yScale = chartInstance.scales.y;
    const xScale = chartInstance.scales.x;

    const arrowX = xScale.getPixelForValue(1);
    const startY = yScale.getPixelForValue(data.reactantEnergy[0]);
    const endY = yScale.getPixelForValue(data.productEnergy[0]);
    const isEndo = data.isEndothermic;

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    ctx.save();

    // Draw arrow line
    ctx.beginPath();
    ctx.moveTo(arrowX, isEndo ? startY : endY);
    ctx.lineTo(arrowX, isEndo ? endY : startY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    const headY = isEndo ? endY : startY;
    const direction = isEndo ? -1 : 1;
    ctx.moveTo(arrowX, headY);
    ctx.lineTo(arrowX - 5, headY + 10 * direction);
    ctx.lineTo(arrowX + 5, headY + 10 * direction);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();

    // Label
    ctx.font = '16px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(`ΔH = ${data.rawDeltaH} kJ`, arrowX + 10, (startY + endY) / 2);

    ctx.restore();
}
