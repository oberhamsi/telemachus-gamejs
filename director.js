var gamejs = require('gamejs');
var objects = require('gamejs/utils/objects');

var conf = require('./config');
var animator = require('./animator');
var Obstacle = require('./actor').Obstacle;
var Actor = require('./actor').Actor;

/**
 * @fileoverview
 * The director arranges what the player sees and experiences - level changes,
 * enemies, game state, ...
 */

exports.Director = function(enemies, obstacles, background) {

   var idx = 0;
   var levelDuration = 0;

   var spawnPause = 0;

   var animationSheets = {};
   conf.LEVELS.forEach(function(level) {
      // preload enemy animations & shadow animations
      // FIXME: width/ height should be stored with unit definition
      level.enemies.forEach(function(enemyBase) {
         var wh = {width: 57, height: 80};
         if (enemyBase.indexOf('cyclop') > -1) {
            wh = {width: 108, height:140};
         } else if (enemyBase.indexOf('hades') > -1) {
            wh = {width: 68, height: 102};
         } else if (enemyBase.indexOf('shepherd') > -1) {
            wh = {width: 68, height: 90};
         }
         // console.log('loading enemy ', wh, enemyBase);
         var spriteSheet = new animator.SpriteSheet(enemyBase + '.png',
            wh
         );
         animationSheets[enemyBase] = {};
         animationSheets[enemyBase].character = new animator.AnimationSheet(spriteSheet,
            {walk: [0, 3], walkHit: [4, 6]}
         );
         var shadowSpriteSheet = new animator.SpriteSheet(
            enemyBase.substr(0, enemyBase.length-1) + '_shadow.png',
            wh
         );
         animationSheets[enemyBase].shadow = new animator.AnimationSheet(shadowSpriteSheet,
            {walk: [0,3], walkHit: [4,6]});
      });
   });

   this.addRandomEnemy = function() {
      if (Math.random() < 0.9) return;

      var pos = [10 + (Math.random() * (600 - 80 - 10)), -200];
      var randomBase = this.level.enemies[parseInt(Math.random() * this.level.enemies.length, 10)];
      var enemy = new Actor(
         pos,
         animationSheets[randomBase].character.clone(),
         animationSheets[randomBase].shadow.clone()
      );
      enemy.moveDelta = [0, 1];
      enemy.moveSpeed = conf.ENEMY_SPEED;
      enemies.add(enemy);
      enemies.sprites().sort(function(a,b) {
         return a.rect.top < b.rect.top ? -1 : 1;
      });
      return;
   };

   this.addRandomObstacle = function() {

      var pos = [10 + (Math.random() * (600 - 90)), -400];
      var obstacleBase = this.level.obstacles[parseInt(Math.random() * this.level.obstacles.length, 10)];
      var obstacle = new Obstacle(
         pos,
         gamejs.image.load(obstacleBase + '.png'),
         gamejs.image.load(obstacleBase + '_shadow.png')
      );
      obstacles.add(obstacle);
      obstacles.sprites().sort(function(a,b) {
         return a.rect.top < b.rect.top ? -1 : 1;
      });
   };

   this.update = function(msDuration) {
      levelDuration += msDuration;

      if (levelDuration >= conf.LEVEL_DURATION || levelDuration ===  null) {
         gamejs.log('level #' + idx);
         idx++;
         if (this.levelsFinished()) {
            // game won
            return;
         }
         background.setImage(gamejs.image.load(this.level.background + '.png'));
         levelDuration = 0;
      }

      if (enemies.sprites().length < this.level.nrOfEnemies) {
         this.addRandomEnemy();
      }

      spawnPause += msDuration;
      if (spawnPause > 3000) {
         if (obstacles.sprites().length < this.level.nrOfObstacles) {
            this.addRandomObstacle();
         }
         spawnPause = 0;
      }
      return;
   };

   this.levelsFinished = function() {
      return (idx >= conf.LEVELS.length);
   };

   this.reset = function() {
      idx = 0;
      levelDuration = null;
      enemies.empty();
      obstacles.empty();
      return;
   };

   function getLevel() {
      return conf.LEVELS[idx];
   }

   objects.accessor(this, 'level', getLevel);

   return this;
}
