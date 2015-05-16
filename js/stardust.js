'use strict';
(function(){

/*	For flexibility, most parameters may be either a literal or a function
	called at the time of use. getValue is used to abstract that process. */
function getValue(x){
	if(typeof(x) === 'function'){
		return x();
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
function Emitter(image, x, y, width, height, ttl, emitCount, emitInterval, particleTTL){
	this.image = getValue(image);
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.ttl = getValue(ttl);
	this.emitCount = emitCount;
	this.emitInterval = emitInterval;
	this.particleTTL = particleTTL;

	this.emitTimer = 0;

	this.particles = [];
}

Emitter.prototype.update = function(delta){
	if(this.emitTimer <= 0 && (this.ttl > 0 || this.ttl === null)){
		var count = getValue(this.emitCount);
		for(var i = 0; i < count; i++){
			this.particles.push(new Particle(
				this,
				getValue(this.x) + Math.random()*getValue(this.width),
				getValue(this.y) + Math.random()*getValue(this.height),
				getValue(this.particleTTL)
			));
		}

		this.emitTimer += getValue(this.emitInterval);
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
}

Emitter.prototype.render = function(canvas, ctx){
	this.particles.forEach(function(particle){
		particle.render(canvas, ctx);
	});
}

/* A Particle object represents a single object rendered to the screen. */
function Particle(emitter, x, y, duration){
	this.emitter = emitter;
	this.x = x;
	this.y = y;
	this.ttl = duration;
}

Particle.prototype.update = function(delta){
	//this.x += this.dx * delta / 1000;
	//this.y += this.dy * delta / 1000;
	if(this.ttl !== null){
		this.ttl -= delta;
	}
}

Particle.prototype.render = function(canvas, ctx){
	ctx.save();
	ctx.translate(this.x, this.y);
	var image = getValue(this.emitter.image);
	ctx.drawImage(image, -image.width/2, -image.height/2);
	ctx.restore();
}

/* Define public objects. */
window.Stardust = Stardust;
window.Emitter = Emitter;
window.Particle = Particle;

})();
