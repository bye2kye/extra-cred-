const canvas = document.getElementById("enthalpyGraph");
const ctx = canvas.getContext("2d");

document.getElementById("reaction-select").addEventListener("change", drawGraph);
drawGraph();

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const reaction = document.getElementById("reaction-select").value;

  let points = [];

  if (reaction === "ch4") {
    // CH4 + 2O2 → CO2 + 2H2O (exothermic)
    points = [
      { x: 50, y: 300, label: "Reactants" },
      { x: 200, y: 100, label: "Activated Complex" },
      { x: 350, y: 200, label: "Intermediate" },
      { x: 500, y: 250, label: "Products" }
    ];
  } else if (reaction === "h2") {
    // H2 + Cl2 → 2HCl (exothermic)
    points = [
      { x: 50, y: 280, label: "Reactants" },
      { x: 200, y: 120, label: "Activated Complex" },
      { x: 500, y: 180, label: "Products" }
    ];
  }

  // Draw line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = "#007bff";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw points and labels
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ff0000";
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.fillText(point.label, point.x - 30, point.y - 10);
  });

  // ΔH arrow
  ctx.beginPath();
  ctx.moveTo(points[0].x + 10, points[0].y);
  ctx.lineTo(points[points.length - 1].x + 10, points[points.length - 1].y);
  ctx.strokeStyle = "green";
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillText("ΔH", points[0].x + 20, (points[0].y + points[points.length - 1].y) / 2);
}
