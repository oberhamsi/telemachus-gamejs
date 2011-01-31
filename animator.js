var gamejs = require('gamejs');

/**
 * @fileoverview The images making up a animation are stored in the column of
 * the spritesheet. a spritesheet can contain multiple columns.
 */

/**
 * Access invidual images on a spritesheet image by index number
 */
var SpriteSheet = exports.SpriteSheet = function(imagePath, sheetSpec) {

   /**
    * @returns {Surface} the requested sub-surface
    */
   this.get = function(id) {
      return surfaceCache[id - offset];
   };

   /**
    * constructor
    */
   var width = sheetSpec.width;
   var height = sheetSpec.height;
   var offset = sheetSpec.offset || 0;

   var image = gamejs.image.load(imagePath);

   var surfaceCache = [];
   for (var i=0; i<image.rect.width; i+=width) {
      for (var j=0;j<image.rect.height;j+=height) {
         var srf = new gamejs.Surface([width, height]);
         var rect = new gamejs.Rect(i, j, width, height);
         srf.blit(image, new gamejs.Rect([0,0],[width,height]), rect);
         surfaceCache.push(srf);
      }
   }

   this.rect = new gamejs.Rect([0, 0], [width, height]);
   return this;
};

/**
 * An animation helper: given a SpriteSheet and a animation specificiation
 * this class helps playing the animation. Use `start(animation)` to start
 * an animation and `update(msDuration)` to update the animation status in
 * your game tick.
 *
 * `animationSheet.image` will always contain the current image.
 *
 * Don't forget to `clone()` an AnimationSheet instead of passing the same
 * one to different actors.
 *
 * AnimationSpec: {'walk': [0, 3], 'walkHit': [4, 6], 'pause': [7]}
 * @param {SpriteSheet}
 * @param {Object}
 * @param {Number}
 */
var AnimationSheet = exports.AnimationSheet = function(spriteSheet, animationSpec, fps) {
   this.fps = fps || 6;
   this.frameDuration = 1000 / this.fps;
   this.spec = animationSpec;

   this.currentFrame = null;
   this.currentFrameDuration = 0;
   this.currentAnimation = null;

   this.spriteSheet = spriteSheet;

   this.image = null;
   return this;
}

AnimationSheet.prototype.start = function(animation) {
   this.currentAnimation = animation;
   this.currentFrame = this.spec[animation][0];
   this.currentFrameDuration = 0;
   return;
};

AnimationSheet.prototype.update = function(msDuration) {
   if (!this.currentAnimation) {
      throw new Error('no animation set');
   }

   this.currentFrameDuration += msDuration;
   if (this.currentFrameDuration >= this.frameDuration) {
      this.currentFrame++;
      this.currentFrameDuration = 0;

      // loop back to first frame if animation finished or single frame
      var aniSpec = this.spec[this.currentAnimation];
      if (aniSpec.length == 1 || this.currentFrame > aniSpec[1]) {
         // unless third argument is false, which means: do not loop
         if (aniSpec.length === 3 && aniSpec[2] === false) {
            this.currentFrame--;
         } else {
            this.currentFrame = aniSpec[0];
         }
      }
   }

   this.image = this.spriteSheet.get(this.currentFrame);
   return;
};

AnimationSheet.prototype.clone = function() {
   return new AnimationSheet(this.spriteSheet, this.spec, this.fps);
};

AnimationSheet.prototype.getSize = function() {
   return [this.spriteSheet.rect.width, this.spriteSheet.rect.height];
};
