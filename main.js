
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 600;

let ants = [];
let food = [];
let obstacles = [];
let pheromones = [];
let stats = { food: 0, workers: 0, soldiers: 0 };
let mode = "human";

class Ant {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = 4;
    this.speed = 1.5;
    this.color = type === "worker" ? "blue" : "red";
    this.hp = type === "worker" ? 1 : 3;
    this.target = null;
    this.hasFood = false;
  }
  move() {
    if (!this.target || Math.random() < 0.01) {
      if (this.type === "worker" && food.length > 0) {
        this.target = food[Math.floor(Math.random() * food.length)];
      } else {
        this.target = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height
        };
      }
    }

    let dx = this.target.x - this.x;
    let dy = this.target.y - this.y;
    let dist = Math.hypot(dx, dy);

    if (dist > 1) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    } else {
      if (this.type === "worker" && !this.hasFood) {
        let index = food.indexOf(this.target);
        if (index > -1) {
          food.splice(index, 1);
          this.hasFood = true;
          this.target = { x: canvas.width / 2, y: canvas.height / 2 };
        }
      } else if (this.type === "worker" && this.hasFood) {
        stats.food++;
        this.hasFood = false;
        this.target = null;
      }
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    if (mode === "ai") drawEyes(this);
  }
}

function drawEyes(ant) {
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(ant.x, ant.y);
  if (ant.target) ctx.lineTo(ant.target.x, ant.target.y);
  ctx.stroke();
}

function spawnAnt(type) {
  const ant = new Ant(canvas.width / 2, canvas.height / 2, type);
  ants.push(ant);
  stats[type + "s"]++;
}

function spawnFood() {
  if (food.length < 30) {
    food.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
  }
}

function drawFood() {
  ctx.fillStyle = "green";
  for (let f of food) {
    ctx.beginPath();
    ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function toggleMode() {
  mode = mode === "human" ? "ai" : "human";
  document.querySelector("button").textContent = "Mode: " + (mode === "human" ? "Human" : "AI");
}

function updateStats() {
  document.getElementById("stats").textContent = `🍖 Food: ${stats.food} | 👷‍♂️ Workers: ${stats.workers} | 🪖 Soldiers: ${stats.soldiers} | Mode: ${mode.toUpperCase()}`;
}

function resetGame() {
  ants = [];
  food = [];
  stats = { food: 0, workers: 0, soldiers: 0 };
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFood();
  for (let ant of ants) {
    ant.move();
    ant.draw();
  }
  updateStats();
  requestAnimationFrame(gameLoop);
}

setInterval(spawnFood, 3000);
gameLoop();
