import BuildCircle from './BuildCircle';
import BuildCenter from './BuildCenter';
import Matter from 'matter-js';
import MatterAttractors from 'matter-attractors';
import Axios from 'axios';

import '../polyfill/path-data-polyfill';
import decomp from 'poly-decomp';
import { ThresholdFilter } from '../utils/Filters';
import * as PIXI from 'pixi.js';

window.decomp = decomp;

Matter.use(MatterAttractors);

function init() {
  
  const { Engine, World, Runner, Bodies, Vertices, Render, Common, Svg } = Matter;

  // create engine
  var engine;
  var world;
  var circles = [];

  function setup() {
    engine = Engine.create({
    });
    world = engine.world;
    world.gravity.y = 1;


  var render = Render.create({
    element: document.body,
    // canvas: canvas,
    engine: engine,
    options: {
      width: 500,
      height: 500,
      showVelocity: true,
      showAngleIndicator: true,
      showCollisions: true,
    }
  });

    
  Render.run(render);
    
    var runner = Runner.create();
    Runner.run(runner, engine);

    // Axios.get('/svg/sample.svg').then(function(res) {
    //   const { data } = res;
    //   const doc = new DOMParser().parseFromString(data, 'text/xml');
    //   const paths = doc.querySelectorAll('polygon');
    //   paths.forEach((path) => {
    //     const points = path.getAttribute('points');
    //     const shape = Matter.Bodies.fromVertices(250, 250, Vertices.fromPath(points), { 
    //       friction: 0,
    //       density: 100,
    //       isStatic: true
    //     })
    //     World.add(world, shape);
    //   })
    // });

    const maze = [
      Bodies.rectangle(0, 250, 10, 500, { isStatic: true, friction: 1 }),
      Bodies.rectangle(500, 250, 10, 500, { isStatic: true, friction: 1 }),
      Bodies.rectangle(200, 100, 400, 10, { isStatic: true, friction: 1, angle: Math.PI * 0.06 }),
      Bodies.rectangle(300, 200, 400, 10, { isStatic: true, friction: 1, angle: -Math.PI * 0.06 }),
      Bodies.rectangle(100, 300, 300, 10, { isStatic: true, friction: 1, angle: Math.PI * 0.06 }),
    ];


    World.add(world, maze);


    var select = function(root, selector) {
      return Array.prototype.slice.call(root.querySelectorAll(selector));
  };

    var loadSvg = function(url) {
      return fetch(url)
          .then(function(response) { return response.text(); })
          .then(function(raw) { return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); });
  };

  loadSvg('../svg/sample.svg').then(function(root) {
    console.log(root)
    var color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

    var vertexSets = select(root, 'path')
    .map(function(path) { 

      console.log(Svg.pathToVertices(path, 30))
      const result = Vertices.scale(Svg.pathToVertices(path, 30), 0.4, 0.4);

      
      return Vertices.scale(Svg.pathToVertices(path, 30), 0.4, 0.4); 
    });
    
    console.log(vertexSets)
    
    World.add(world, Bodies.fromVertices(100, 200, vertexSets, {
        render: {
            fillStyle: color,
            strokeStyle: color,
            lineWidth: 1
        }
    }, true));
});

    const cup = [
      Bodies.rectangle(300, 420, 10, 100, { isStatic: true, friction: 1, angle: -Math.PI * 0.06 }),
      Bodies.rectangle(380, 420, 10, 100, { isStatic: true, friction: 1, angle: Math.PI * 0.06 }),
      Bodies.rectangle(340, 470, 80, 10, { isStatic: true, friction: 1 })
    ];
    World.add(world, cup);

    
    const triggers = [ 
      Bodies.rectangle(300, 380, 10, 10, { isStatic: true, isSensor: true, angle: -Math.PI * 0.06  }),
      Bodies.rectangle(380, 380, 10, 10, { isStatic: true, isSensor: true, angle: Math.PI * 0.06 }),
      Bodies.rectangle(340, 469, 80, 10, { isStatic: true, isSensor: true  })
     ];
    World.add(world, triggers);

    const triggerChecker = triggers.map(_ => false);
    let isTrigger = false;
    Matter.Events.on(engine, 'collisionStart', function (event) {
      const { pairs } = event;
      triggers.forEach((trigger, i) => {
        if (pairs.some(pair => pair.isSensor && (pair.bodyA === trigger || pair.bodyB === trigger))) {
          triggerChecker[i] = true;
        }
      });
      isTrigger = triggerChecker.every(trigger => trigger === true);
      if (isTrigger) {
        console.log('win')
        document.getElementById('result').textContent ='win!!';
      };
    })

    Matter.Events.on(engine, 'collisionEnd', function (event) {
      const { pairs } = event;
      triggers.forEach((trigger, i) => {
        if (pairs.some(pair => pair.isSensor && (pair.bodyA === trigger || pair.bodyB === trigger))) {
          triggerChecker[i] = false;
        }
      });
      isTrigger = triggerChecker.every(trigger => trigger === true);
      if (isTrigger) {
        console.log('win')
        document.getElementById('result').textContent ='win!!';
      };
    })

    // Matter.Events.on(engine, 'collisionEnd', function (event) {
    //   const { pairs } = event;
    //   triggers.forEach((trigger, i) => {
    //     if (pairs.some(pair => pair.bodyA !== trigger && pair.bodyB !== trigger)) {
    //       inTrigger[i] = false;
    //     }
    //   });
    //   console.log(inTrigger)
    // })
    

    // World.add(world, [ Bodies.rectangle(100, 500, 100, 100, { isStatic: true }) ]);
    Matter.Events.on(engine, 'beforeUpdate', function (event) {
      // console.log(event.timestamp)

      circles.forEach((circle, i) => {
        circle.update();
        if (circle.isOffScreen()) {
          circle.removeFromWorld();
          circles.splice(i, 1);
        };
      });
    });

  }
  setup();

  function draw() {
    const app = new PIXI.Application({
      width: 500,
      height: 500,
      backgroundColor: 0x444444,
      forceCanvas: true
    });


    document.body.appendChild(app.view);
  
    const front = new PIXI.Container({
      width: 500,
      height: 500,
    })

    const container = new PIXI.Container({
      width: 500,
      height: 500,
    })
    app.stage.addChild(container, front);
    
    const thresholdFilter = ThresholdFilter(245, 220, 100, 0.2);
    const blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.blur = 10;

    container.filters = [blurFilter, thresholdFilter];

    let isDrag = false;
    let count = 0
    
    app.view.addEventListener('mouseup', () => isDrag = false);

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x00FFFF);
    graphics.drawRect(0, 180, 500, 1);
    graphics.endFill();
    front.addChild(graphics);
    front.sortChildren = true;

    app.view.addEventListener('mousedown', (e) => {
      isDrag = true;
      count = 0;
      const x = e.offsetX
      const y = e.offsetY
      const test = new BuildCenter(x, y, 2, world, container, app.view.height);

      let shotCount = 0;
      function shot() {
        setTimeout(() => {
          if (shotCount < 5) {
            const circle = new BuildCircle(x, y, 5, world, container, app.view.height, test);
            circles.push(circle);
            shotCount+=1;
            shot()
            // circles.pop();
          }
        }, 50);
      }
      shot();
    });

    // app.view.addEventListener('mousemove', e => {
    //   if (isDrag) {
    //   // if (isDrag && count < 10) {
    //     const x = e.offsetX
    //     const y = e.offsetY
    //     const circle = new BuildCircle(x, y, Math.random()*3, world, container, app.view.height);
    //     circles.push(circle);
    //     // count ++;
    //   }
    // })
  }
  draw();
}

const Game = init();
export default Game;