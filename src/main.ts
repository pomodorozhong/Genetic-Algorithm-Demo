export { }

import { MovingSquare } from "./movingSquare";
import { GeneticAlgorithm } from "./geneticAlgorithm";

let canvas;
let ctx: CanvasRenderingContext2D;
let ga: GeneticAlgorithm = null;
let squares: Array<MovingSquare> = null;
let population = 10;
let movesetLength = 12;
let CHARACTER_WIDTH = 10;
let CHARACTER_HEIGHT = 10;
let FPS = 60;
let time = 0;

function initialization() {
  // Initialization of MovingSquare
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 400;
  squares = [];
  for (let i = 0; i < population; i++) {
    let mDot = new MovingSquare(
      ctx,
      canvas.width,
      canvas.height,
      CHARACTER_WIDTH,
      CHARACTER_HEIGHT,
      movesetLength);
    mDot.setRandomMoveset();

    squares.push(mDot)
  }

  // Initialization of GA
  let mutationRate: number = 0.1;
  let crossOverRate: number = 0.3;
  ga = new GeneticAlgorithm(
    mutationRate,
    crossOverRate,
    movesetLength,
    population);
  for (let i = 0; i < movesetLength; i++) {
    ga.setGeneBoundry(i, 0, 3);
  }
  ga.setBinaryEncodeParm();
  for (let i = 0; i < population; i++) {
    let chromosome: Array<number> = new Array();
    for (let j = 0; j < movesetLength; j++) {
      chromosome.push(squares[i].moveset[j])
    }
    ga.setChromosome(i, chromosome);
  }

  run();
}

function run() {
  // wipe the canvas.
  canvas.width = canvas.width;

  // 畫框框
  for (let i = 0; i < population; i++) {
    squares[i].draw();
    squares[i].move();
  }

  time++;
  if (time > 500) {
    time = 0;

    // 根據各個基因體的存活時間設定"適存性"
    for (let i = 0; i < population; i++) {
      // 平方加權
      // 搭配 "Resampling Wheel"，會讓稍微多活一點的個體，產生更多的後代
      ga.setFitness(i, Math.pow(squares[i].lifespan, 2));
      // ga.fitness[i] = Math.pow(mDots[i].lifespan, 2);
    }

    // 基因算法
    ga.produceNextGeneration();

    // 產生新的移動矩形
    squares = [];
    for (let j = 0; j < population; j++) {
      let mDot = new MovingSquare(
        ctx,
        canvas.width,
        canvas.height,
        CHARACTER_WIDTH,
        CHARACTER_HEIGHT,
        movesetLength);
      squares.push(mDot)
    }

    // 在新的移動矩形上套用新的移動模式
    for (let i = 0; i < population; i++) {
      let chromosome = [];
      for (let j = 0; j < movesetLength; j++) {
        squares[i].moveset[j] = ga.chromosomes[i][j];
      }
    }
  }

  setTimeout(run, 1000 / FPS);
}

initialization();