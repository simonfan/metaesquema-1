const Matter = require('matter-js')

/**
 * Matter submodules
 */
const Engine = Matter.Engine
const Render = Matter.Render
const Runner = Matter.Runner
const Bodies = Matter.Bodies
const World = Matter.World
const Mouse = Matter.Mouse
const MouseConstraint = Matter.MouseConstraint
const Events = Matter.Events
const Common = Matter.Common

const MatterSound = require('./lib/matter-sound')
const MatterCollisionStyles = require('./lib/matter-collision-styles')
const AUDIOS = require('./audios')

function randomAudio() {
	return AUDIOS[Math.floor(Math.random()*AUDIOS.length)].name
}

function setup(options) {
  const CANVAS_WIDTH = options.canvasWidth
  const CANVAS_HEIGHT = options.canvasHeight
  let canvas = options.canvas

  if (!canvas) {
    throw new Error('canvas is required')
  }
  
  if (!CANVAS_WIDTH) {
    throw new Error('CANVAS_WIDTH is required')
  }
  
  if (!CANVAS_HEIGHT) {
    throw new Error('CANVAS_HEIGHT is required')
  }

  if (options.plugins) {
  	options.plugins.forEach(plugin => {
  		Matter.use(plugin)
  	})
  }

  // create engine
  let engine = Engine.create({
  	// enable sleeping as we are collision heavy users
  	// enableSleeping: true
  })

  engine.world.gravity.x = 0
  engine.world.gravity.y = 0

  // create renderer
  let render = Render.create({
  	canvas: canvas,
  	engine: engine,
  	options: {
  		wireframes: false,
      // showAngleIndicator: true,
  		background: '#FFF100',
  		pixelRatio: 2,

  		width: CANVAS_WIDTH,
  		height: CANVAS_HEIGHT,
  	}
  })

  // create runner
  let runner = Runner.create()

  Runner.run(runner, engine)
  Render.run(render)

  let walls = [
  	// ceiling
		Bodies.rectangle(
	    CANVAS_WIDTH / 2, // align center to center
	    -(60 / 2),         
	    CANVAS_WIDTH, // width
	    60,  // height
	    {
	      isStatic: true,
	      restitution: 1,
	    }
	  ),
	  // ground
		Bodies.rectangle(
	    CANVAS_WIDTH / 2, // align center to center
	    CANVAS_HEIGHT + (60 / 2),         
	    CANVAS_WIDTH, // width
	    60,  // height
	    {
	      isStatic: true,
	      restitution: 1,
        friction: 0,
        frictionStatic: 0,
	      // plugin: {
	      // 	sound: {
	      // 		audio: 'FX_001',
	      // 	}
	      // }
	    }
	  ),
    
	  // left
		Bodies.rectangle(
	    -(60 / 2), // align center to center
	    CANVAS_HEIGHT / 2,         
	    60, // width
	    CANVAS_HEIGHT,  // height
	    {
	      isStatic: true,
	      restitution: 1,
	    }
	  ),
	  // right
		Bodies.rectangle(
	    CANVAS_WIDTH + (60 / 2), // align center to center
	    CANVAS_HEIGHT / 2,         
	    60, // width
	    CANVAS_HEIGHT,  // height
	    {
	      isStatic: true,
	      restitution: 1,
	    }
	  ),
	]

  World.add(engine.world, walls)

  /**
   * Sound bodies
   */
  const DEFAULT_BODY_OPTIONS = {
    density: 0.3,
    restitution: 1.05,
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
  }

  function genBodyOptions(options) {
    return Object.assign({}, DEFAULT_BODY_OPTIONS, options)
  }

  let bodies = [
    // mallet-1
    Bodies.rectangle(250, 250, 40, 40, genBodyOptions({
      plugin: {
        sound: { audio: 'limao/mallet-1' },
      },
      render: {
        fillStyle: '#EE2D2C',
      }
    })),
    Bodies.rectangle(250, 250, 40, 40, genBodyOptions({
      plugin: {
        sound: { audio: 'limao/mallet-1' },
      },
      render: {
        fillStyle: '#EE2D2C',
      }
    })),
    Bodies.rectangle(250, 250, 40, 40, genBodyOptions({
      plugin: {
        sound: { audio: 'limao/mallet-1' },
      },
      render: {
        fillStyle: '#EE2D2C',
      }
    })),
    Bodies.rectangle(250, 250, 40, 40, genBodyOptions({
      plugin: {
        sound: { audio: 'limao/mallet-1' },
      },
      render: {
        fillStyle: '#EE2D2C',
      }
    })),

    // pad
    Bodies.circle(250, 250, 100, genBodyOptions({
      plugin: {
        sound: {
          // audio: 'limao/pad',
          alternateAudios: [
            'limao/pad-2',
            'limao/pad-3'
          ]
        }
      },
      render: {
        fillStyle: '#253A7E'
      },
      isStatic: true,
    })),

    // mallet-2
    Matter.Bodies.polygon(250, 250, 3, 20, genBodyOptions({
      plugin: {
        sound: { audio: 'limao/mallet-2' },
      },
      render: {
        fillStyle: '#40AD48'
      }
    })),

    // loop-1
    Matter.Bodies.polygon(250, 250, 3, 20, genBodyOptions({
      plugin: {
        sound: { audio: 'limao/loop-1' },
      },
      render: {
        fillStyle: '#000000'
      }
    }))
  ]
  // bodies.forEach(body => body.plugin.sound.audio = randomAudio())

  World.add(engine.world, bodies)






  // add mouse control
  let mouse = Mouse.create(render.canvas)
  let mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      // allow bodies on mouse to rotate
      angularStiffness: 0,
      render: {
        visible: false
      }
    }
  })

  World.add(engine.world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  return {
  	engine: engine,
  	stop: () => {
	    Matter.Render.stop(render)
	    Matter.Runner.stop(runner)
  	}
  }
}


/**
 * Instantiate MatterSound plugin
 */
let matterSound = new MatterSound({
	audios: AUDIOS,
})


matterSound.ready.then(() => {
	let config = {
	  canvasWidth: window.innerWidth,
	  canvasHeight: window.innerHeight,
	  canvas: document.querySelector('canvas'),
	  plugins: [
	  	matterSound,
	  	new MatterCollisionStyles()
	  ]
	}

	let app = setup(config)
})
