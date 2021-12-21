import * as PIXI from 'pixi.js';
import Matter from 'matter-js';

function Init(object) {
  engine = Engine.create();
  world = engine.world;
  box = Bodies.rectangle(10, 10, 20, 20);
  Engine.run(engine);
  console.log(world)
  World.add(world, box)
  World.add(world, [ Bodies.rectangle(250, 500, 800, 100, { isStatic: true }) ]);

  Matter.Events.on(engine, 'beforeUpdate', function() {
    object.forEach(item => item.update());
  });

  return {
    world: World
    // update: Matter
  };
}

const MatterWorld = new Init();

export default MatterWorld;
