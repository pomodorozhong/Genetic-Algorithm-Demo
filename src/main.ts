export { }

import { MovingSquare } from "./movingSquare";
import { GeneticAlgorithm } from "./geneticAlgorithm";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let ga: GeneticAlgorithm = null;
let squares: Array<MovingSquare> = null;
let population: number = 10;
let movesetLength: number = 12;
const CHARACTER_WIDTH: number = 10;
const CHARACTER_HEIGHT: number = 10;
const FPS: number = 60;
const UPDATE_INTERVAL_MS: number = 1000 / FPS;
let generation: number = 0;

function initialization() {
  // Initialization of MovingSquare
  canvas = <HTMLCanvasElement>document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 400;
  squares = [];
  for (let i: number = 0; i < population; i++) {
    let mDot: MovingSquare = new MovingSquare(
      ctx,
      canvas.width,
      canvas.height,
      CHARACTER_WIDTH,
      CHARACTER_HEIGHT,
      movesetLength);
    mDot.setRandomMoveset();

    squares.push(mDot)

    // Draw the squares.
    mDot.draw();
  }

  // Initialization of GA
  let mutationRate: number = 0.1;
  let crossOverRate: number = 0.3;
  ga = new GeneticAlgorithm(
    mutationRate,
    crossOverRate,
    movesetLength,
    population);
  for (let i: number = 0; i < movesetLength; i++) {
    ga.setGeneBoundry(i, 0, 3);
  }
  ga.setBinaryEncodeParm();
  for (let i: number = 0; i < population; i++) {
    let chromosome: Array<number> = new Array();
    for (let j: number = 0; j < movesetLength; j++) {
      chromosome.push(squares[i].moveset[j])
    }
    ga.setChromosome(i, chromosome);
  }

  run();
}

function run() {
  updateText();

  // Wipe the canvas.
  canvas.width = canvas.width;

  // Draw the squares.
  for (let i: number = 0; i < population; i++) {
    squares[i].move();
    squares[i].draw();
  }

  generation++;
  let maxGeneration: number = 500;
  if (generation > maxGeneration) {
    generation = 0;

    // Set fitness of each gene, according to the lifespan of the square 
    // that got the gene.
    for (let i: number = 0; i < population; i++) {
      // 立方加權。這搭配 "Resampling Wheel"，會讓稍微多活一點的個體，產生更多的後代
      let fitness: number = Math.pow(squares[i].lifespan, 3);
      ga.setFitness(i, fitness);
    }

    ga.produceNextGeneration();

    // Produce new squares.
    squares = [];
    for (let j: number = 0; j < population; j++) {
      let mDot: MovingSquare = new MovingSquare(
        ctx,
        canvas.width,
        canvas.height,
        CHARACTER_WIDTH,
        CHARACTER_HEIGHT,
        movesetLength);
      squares.push(mDot)
    }

    // Set new moveset using new gene.
    for (let i: number = 0; i < population; i++) {
      for (let j: number = 0; j < movesetLength; j++) {
        squares[i].moveset[j] = ga.chromosomes[i][j];
      }
    }
  }

  setTimeout(run, UPDATE_INTERVAL_MS);
}

function updateText(){
  document.getElementById('movesetLength').innerHTML = movesetLength.toString();
}

initialization();