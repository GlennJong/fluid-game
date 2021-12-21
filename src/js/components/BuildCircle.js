import * as PIXI from 'pixi.js';
import Matter from 'matter-js';



function BuildCircle(x, y, radius, world, viewer, outScreen=500, center=null) {
  const { World, Body, Bodies } = Matter;

  this._init = function() {
    const options = {
      friction: 0,
      frictionAir: 0,
      // frictionStatic: 0.5,
      // force: {x: 0, y: 0},
      density: 0.005,
    };
  
    this.graphic = new PIXI.Graphics().beginFill(0xffffff).drawCircle(0, 0, radius);
    this.graphic.x = x
    this.graphic.y = y
    this.graphic.radius = radius;
    viewer.addChild(this.graphic);
    // this.render = new PIXI.Graphics().beginFill(0xffffff).drawCircle(0, 0, radius);
    // this.render.x = x;
    // this.render.y = y;
    // this.physic = Bodies.circle(x, y, radius * Math.random(), options);
    // this.physic = Bodies.circle(x, y, radius, options);

    if (center) {
      this.physic = Bodies.circle(x, y, radius, {
        plugin: {
          attractors: [
            function(bodyA) {
              var force = {
                x: (bodyA.position.x - center.physic.position.x) * 1e-6,
                y: (bodyA.position.y - center.physic.position.y) * 1e-6,
              };

              console.log(bodyA)


              // apply force to both bodies
              Body.applyForce(bodyA, center.physic.position, Matter.Vector.neg(force));
              // Body.applyForce(center.physic, center.physic.position, force);
            }
          ]
        }
      });
    }

    // viewer.addChild(...this.graphics);
  }
  this.update = function() {
    const { position, velocity } = this.physic;
    // console.log(velocity)
    // if (Math.abs(velocity.x < 0.5) || Math.abs(velocity.y < 0.5) ) {
      // this.graphics.forEach(graphic => {
      //   const num = (Math.random() - Math.random());
      //   graphic.x = position.x + (graphic.radius * num * velocity.x / 2);
      //   graphic.y = position.y + (graphic.radius * num * velocity.y / 2);
      // })
    // }
    // else {
        // const num = (Math.random() - Math.random());
        // graphic.x = position.x + (graphic.radius/3 * num/5);
        this.graphic.x = position.x;
        // graphic.y = position.y + (graphic.radius/3 * num/5);
        this.graphic.y = position.y;
    // }
  }
  this._init();
  if (world) {
    World.add(world, this.physic);
  }
  this.isOffScreen = function() {
    return (this.physic.position.y > outScreen + 100);
  }
  this.removeFromWorld = function() {
    World.remove(world, this.physic);
    viewer.removeChild(this.render);
  }
}

export default BuildCircle;