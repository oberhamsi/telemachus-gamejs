var gamejs = require('gamejs');
var $v = require('gamejs/utils/vectors');
var objects = require('gamejs/utils/objects');
var animator = require('./animator');
var conf = require('./config');

/**
 * @fileoverview
 * Classes in here usually extend gamejs.sprite.Sprite. They are the
 * actors visible on the screen.
 */

/**
 * Actor
 */
var Actor = exports.Actor = function(pos, animationSheet, shadowSheet) {
   Actor.superConstructor.apply(this, arguments);

   this.animationSheet = animationSheet;
   this.animationSheet.start('walk');

   this.shadowSheet = shadowSheet;
   this.shadowSheet.start('walk');

   this.rect = new gamejs.Rect(pos, this.animationSheet.getSize());
   this.moveDelta = [0, 1];
   this.moveSpeed = 10;

   this.isHit = false;
   this.hitDuration = 0;

   this.hitCount = 0;

   return this;
};
objects.extend(Actor, gamejs.sprite.Sprite);

Actor.prototype.update = function(msDuration) {
   this.animationSheet.update(msDuration);
   this.shadowSheet.update(msDuration);

   if (this.isHit) {
      if (this.hitDuration > 50) {
         this.animationSheet.start('walk');
         this.isHit = false;
      }
      this.hitDuration += msDuration;
   }

   var speed = this.moveSpeed * (msDuration / 1000);
   var delta = $v.multiply(this.moveDelta, speed);
   this.rect.moveIp(delta);
   return;
};

Actor.prototype.draw = function(display) {
   display.blit(this.animationSheet.image, this.rect);
   display.blit(this.shadowSheet.image, this.rect.move([0, this.rect.height - 10]));
   return;
};

Actor.prototype.keepInScreen = function(display) {
   var dRect = display.rect;

   var aRect = this.rect;
   var moveDelta = this.moveDelta;
   if (aRect.left < 0 ) {
      aRect.left = 0;
      moveDelta[0] = 0;
   }
   if (aRect.right > dRect.width) {
      aRect.right = dRect.width;
      moveDelta[1] = 0;
   }

   if (aRect.top < 0) {
      aRect.top = 0;
   }
   if (aRect.bottom > dRect.height) {
      aRect.bottom = dRect.height;
   }

   return;
};

Actor.prototype.avoidObstacles = function(obstacles) {
   var obstacleHits = gamejs.sprite.spriteCollide(this, obstacles);
   if (obstacleHits.length < 1) return;

   var obstacle = obstacleHits[0];

   var delta = this.rect.center[0] - obstacle.rect.center[0];
   if (delta > 0) {
      this.rect.moveIp([10, 0]);
   } else {
      this.rect.moveIp([-10, 0]);
   }
};

Actor.prototype.takingDamage = function() {
   if (this.isHit === true) {
      return;
   }

   this.hitCount++;
   this.isHit = true;
   this.hitDuration = 0;
   this.animationSheet.start('walkHit');
   return;
};

/**
 * Spear
 */
var Spear = exports.Spear = function(pos, animationSheet) {
   Spear.superConstructor.apply(this, arguments);

   this.animationSheet = animationSheet;
   this.animationSheet.start('walk');
   this.rect = new gamejs.Rect(pos, this.animationSheet.getSize());
   this.moveDelta = [0, -1];
   this.moveSpeed = conf.SPEAR_SPEED;

   return this;
};
objects.extend(Spear, gamejs.sprite.Sprite);

Spear.prototype.update = function(msDuration) {
   this.animationSheet.update(msDuration);

   var speed = this.moveSpeed * (msDuration / 1000);
   var delta = $v.multiply(this.moveDelta, speed);
   this.rect.moveIp(delta);

   if (this.rect.bottom < 0) {
      this.kill();
   }

   return;
};

Spear.prototype.draw = function(display) {
   display.blit(this.animationSheet.image, this.rect);
   return;
};

/**
 * Obstacle
 */
var Obstacle = exports.Obstacle = function(pos, image, shadowImage) {
   Obstacle.superConstructor.apply(this, arguments);

   this.image = image;
   this.shadowImage = shadowImage;
   this.rect = new gamejs.Rect(pos, image.getSize());
   this.moveDelta = [0, 1];
   this.moveSpeed = conf.SCROLL_SPEED;

   return this;
};
objects.extend(Obstacle, gamejs.sprite.Sprite);

Obstacle.prototype.update = function(msDuration) {

   var speed = this.moveSpeed * (msDuration / 1000);
   var delta = $v.multiply(this.moveDelta, speed);
   this.rect.moveIp(delta[0], delta[1]);
   return;
};

Obstacle.prototype.draw = function(display) {
   display.blit(this.image, this.rect);
   display.blit(this.shadowImage, this.rect.move(0, this.rect.height - 10));
   return;
};

/**
 * Scrolling background, moves at pixelSpeed pixels per second in y direction
 */
var Background = exports.Background = function(image, pixelSpeed) {
   this.backgroundImage = image;
   this.pixelSpeed  = pixelSpeed;
   this.offset = 0;
   this.bgSize = this.backgroundImage.getSize();
   this.image = new gamejs.Surface(this.bgSize);
   return this;
};

Background.prototype.update = function(msDuration) {
   this.offset += this.pixelSpeed * (msDuration / 1000);

   if (this.offset > this.bgSize[1]) {
      this.offset = 0;
   }
   this.image.clear();
   this.image.blit(this.backgroundImage, [0, this.offset]);
   var secondPos = [0, this.offset + this.bgSize[1]];
   if (this.pixelSpeed > 0) {
      secondPos = [0, this.offset - this.bgSize[1]];
   }
   this.image.blit(this.backgroundImage, secondPos);
   return;
};

Background.prototype.setImage = function(image) {
   this.backgroundImage = image;
};
