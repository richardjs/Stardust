'use strict';
(function(){

/*	For flexibility, most parameters may be either a literal or a function
	called at the time of use. getValue is used to abstract that process. */
function getValue(x, time){
	if(typeof(x) === 'function'){
		return x(time);
	}else{
		return x;
	}
}

/*	The Stardust object keeps track of emitters, and performs task such as 
	updating, rendering, and removing when their duration ends. */
function Stardust(){
	this.emitters = [];
}

Stardust.prototype.add = function(emitter){
	this.emitters.push(emitter);
}

Stardust.prototype.remove = function(emitter){
	this.emitters.splice(this.emitters.indexOf(emitter), 1);
}

Stardust.prototype.update = function(delta){
	var stillAlive = [];
	this.emitters.forEach(function(emitter){
		emitter.update(delta);
		if(emitter.ttl === null || emitter.ttl > 0 || emitter.particles.length > 0){
			stillAlive.push(emitter);
		}
	});
	this.emitters = stillAlive;
}

Stardust.prototype.render = function(canvas, ctx){
	this.emitters.forEach(function(emitter){
		emitter.render(canvas, ctx);
	});
}

/*	An Emitter object creates and maintaines Particles according to the rules given to it. */
function Emitter(image, x, y, width, height, ttl, emitCount, emitInterval, particleTTL, options){
	this.image = getValue(image);
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.ttl = getValue(ttl);
	this.emitCount = emitCount;
	this.emitInterval = emitInterval;
	this.particleTTL = particleTTL;

	options = options || {};
	this.dx = options.dx || 0;
	this.dy = options.dy || 0;
	this.opacity = options.opacity || 1;

	this.time = 0;
	this.emitTimer = 0;
	this.particles = [];
}

Emitter.prototype.update = function(delta){
	if(this.emitTimer <= 0 && (this.ttl > 0 || this.ttl === null)){
		var count = getValue(this.emitCount, this.time);
		for(var i = 0; i < count; i++){
			this.particles.push(new Particle(
				this,
				getValue(this.image, this.time),
				getValue(this.x, this.time) + Math.random()*getValue(this.width, this.time),
				getValue(this.y, this.time) + Math.random()*getValue(this.height, this.time),
				getValue(this.particleTTL, this.time),
				getValue(this.dx, this.time),
				getValue(this.dy, this.time)
			));
		}

		this.emitTimer += getValue(this.emitInterval, this.time);
	}
	this.emitTimer -= delta;

	var stillAlive = [];
	this.particles.forEach(function(particle){
		particle.update(delta);
		if(particle.ttl === null || particle.ttl > 0){
			stillAlive.push(particle);
		}
	});
	this.particles = stillAlive;
	
	if(this.ttl !== null){
		this.ttl -= delta;
	}

	this.time += delta;
}

Emitter.prototype.render = function(canvas, ctx){
	this.particles.forEach(function(particle){
		particle.render(canvas, ctx);
	});
}

/* A Particle object represents a single object rendered to the screen. */
function Particle(emitter, image, x, y, duration, dx, dy){
	this.emitter = emitter;
	this.image = image;
	this.x = x;
	this.y = y;
	this.ttl = duration;
	this.dx = dx;
	this.dy = dy;

	this.time = 0;
}

Particle.prototype.update = function(delta){
	this.x += getValue(this.dx, this.time) * delta / 1000;
	this.y += getValue(this.dy, this.time) * delta / 1000;
	if(this.ttl !== null){
		this.ttl -= delta;
	}

	this.time += delta;
}

Particle.prototype.render = function(canvas, ctx){
	ctx.save();
	//ctx.translate(getValue(this.x, this.time), getValue(this.y, this.time));
	var image = getValue(this.image, this.time);
	ctx.drawImage(image, this.x-image.width/2, this.y-image.height/2);
	ctx.restore();
}

/* Define public objects. */
window.Stardust = Stardust;
window.Emitter = Emitter;
window.Particle = Particle;

})();
