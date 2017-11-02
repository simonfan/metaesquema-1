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
  	enableSleeping: true
  })

  // create renderer
  let render = Render.create({
  	canvas: canvas,
  	engine: engine,
  	options: {
  		wireframes: false,
  		// background: '#FAFAFA',
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
	    (60 / 2),         
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
	    CANVAS_HEIGHT - (60 / 2),         
	    CANVAS_WIDTH, // width
	    60,  // height
	    {
	      isStatic: true,
	      restitution: 1,
	      // plugin: {
	      // 	sound: {
	      // 		audio: 'FX_001',
	      // 	}
	      // }
	    }
	  ),

	  // left
		Bodies.rectangle(
	    (60 / 2), // align center to center
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
	    CANVAS_WIDTH - (60 / 2), // align center to center
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
  let circle_1 = Bodies.circle(250, 250, 20, {
    restitution: 1,
    density: 0.3,
    plugin: {
    	sound: {
    		audio: 'CYMBAL_001',
    		// audio: randomAudio(),
    	},
    	collisionStyles: {
    		start: {
    			fillStyle: 'red',
    		},
    		active: {
    			fillStyle: 'green',
    		}
    	}
    }
  })

  let circle_2 = Bodies.circle(300, 250, 20, {
    restitution: 1,
    density: 0.3,
    plugin: {
    	sound: {
    		audio: 'FX_001',
    		// audio: randomAudio(),
    	},
    	collisionStyles: {
    		start: {
    			fillStyle: 'red',
    		},
    		active: {
    			fillStyle: 'green',
    		}
    	}
    }
  })

  let circle_3 = Bodies.circle(250, 300, 20, {
    restitution: 1,
    density: 0.3,
    plugin: {
    	sound: {
    		audio: 'FX_002',
    		// audio: randomAudio(),
    	},
    	collisionStyles: {
    		start: {
    			fillStyle: 'red',
    		},
    		active: {
    			fillStyle: 'green',
    		}
    	}
    }
  })

  let circle_4 = Bodies.circle(275, 400, 20, {
    restitution: 1,
    density: 0.3,
    plugin: {
    	sound: {
    		audio: 'FX_003',
    		// audio: randomAudio(),
    	},
    	collisionStyles: {
    		start: {
    			fillStyle: 'red',
    		},
    		active: {
    			fillStyle: 'green',
    		}
    	}
    }
  })

  let bodies = [
  	circle_1,
  	circle_2,
  	circle_3,
  	circle_4
  ]

  bodies.forEach(body => body.plugin.sound.audio = randomAudio())

  World.add(engine.world, bodies)









  // add mouse control
  var mouse = Mouse.create(render.canvas)
  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 1,
      render: {
        visible: false,
      }
    }
  })
  // https://github.com/liabru/matter-js/issues/84
  mouse.element.removeEventListener("mousewheel", mouse.mousewheel)
  mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel)
  
  World.add(engine.world, mouseConstraint)
  
  // mouse events
  var isDragging = false
  var wasDragging = false
  Events.on(mouseConstraint, 'startdrag', function (e) {
    isDragging = true
  })
  Events.on(mouseConstraint, 'enddrag', function (e) {
    isDragging = false
    wasDragging = true
    
    setTimeout(function () {
      wasDragging = false
    }, 500)
  })
  Events.on(mouseConstraint, 'mousemove', function (e) {
    
    if (isDragging) {
      return
    }
    
    // console.log('mousemove', e.mouse.absolute)
    var mousePosition = e.mouse.absolute
    var target = Matter.Query.point(bodies, mousePosition)[0]
    
    if (!target) {
      return
    }
    
    var magnitude = 0.05 * target.mass
    var direction = Matter.Vector.create(0, -1) // always up
    var force = Matter.Vector.mult(direction, magnitude)
    Matter.Body.applyForce(target, target.position, force)
  })
  
  Events.on(mouseConstraint, 'mouseup', function (e) {
    
    if (wasDragging) {
      return
    }
    
    // console.log('mouseup', e)
    var size = Common.random(5, 60)
    // var angle = aux.degreesToRadians(Common.random(0, 45))
    
    var newSquare = Bodies.rectangle(
      e.mouse.mouseupPosition.x,
      e.mouse.mouseupPosition.y,
      size,
      size,
      {
        // angle: angle,
        restitution: 1,
        density: 0.3,
        render: {
          fillStyle: '#3eeeb7',
          strokeStyle: '#0adda6',
          lineWidth: 2,
        },
        plugin: {
        	sound: {
        		audio: randomAudio(),
        	},
        	collisionStyles: {
        		start: {
          		fillStyle: '#efefef',
        		}
        	}
        }
      }
    )
    
    // save to the list of bodies
    bodies.push(newSquare)
    World.add(engine.world, newSquare)
  })

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

	document.querySelector('[data-reset]').addEventListener('click', e => {
		app.stop()
		app = setup(config)
	})
})
