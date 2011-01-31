// lib
var gamejs = require('gamejs');
// custom
var animator = require('./animator');
var Actor = require('./actor').Actor;
var Background = require('./actor').Background;
var Director = require('./director').Director;
var Spear = require('./actor').Spear;
var conf = require('./config');

function main() {
   var display = gamejs.display.setMode([conf.SCREEN_WIDTH, conf.SCREEN_HEIGHT]);

   // create animation sheets for player odysseus
   var odySheet = new animator.SpriteSheet('images/odys.png',  {width: 80, height: 90});
   var odyAnimation = new animator.AnimationSheet(odySheet, {walk: [0,3], walkHit: [4,6]});
   var odyShadowSheet = new animator.SpriteSheet('images/odys_shadow.png', {width: 80, height: 90});
   var odyShadowAnimation = new animator.AnimationSheet(odyShadowSheet, {walk: [0,3]});
   var player = new Actor([50, conf.SCREEN_HEIGHT - 100], odyAnimation, odyShadowAnimation);
   player.moveDelta = [0, 0];
   player.moveSpeed = 1;

   // director takes care creating enemies & obstacles
   var background = new Background(gamejs.image.load('images/backgrounds/lvl1.png'), conf.SCROLL_SPEED);
   var enemies = new gamejs.sprite.Group();
   var obstacles = new gamejs.sprite.Group();
   var director = new Director(enemies, obstacles, background);

   // spear throwing
   var spears = new gamejs.sprite.Group();
   var spearSheet = new animator.SpriteSheet('images/spear.png', {width: 10, height: 60});
   var spearAnimation = new animator.AnimationSheet(spearSheet, {walk: [0, 1]}, 3);
   var lastSpearThrowMs = null;

   // lay those over the screen to display low health
   var damageOverlay = gamejs.image.load('images/damage.png');
   var damageLightOverlay = gamejs.image.load('images/damage_light.png');

   /**
    * change player move delta depending on keyboard status
    */
   var keysDown = {};
   function handleEvent(event) {
      if (event.type === gamejs.event.KEY_DOWN) {
         keysDown[event.key] = true;
      } else if (event.type === gamejs.event.KEY_UP) {
         keysDown[event.key] = false;
      };

      // pause
      if (event.type === gamejs.event.MOUSE_DOWN) {
         GAME_PAUSED = true;
      }

      // left, right
      if (keysDown[gamejs.event.K_LEFT]) {
         player.moveDelta[0] = -conf.SIDE_SPEED;
      } else if (keysDown[gamejs.event.K_RIGHT]) {
         player.moveDelta[0] = +conf.SIDE_SPEED;
      } else {
         player.moveDelta[0] = 0;
      }

      // up / down
      if (keysDown[gamejs.event.K_UP]) {
         player.moveDelta[1] = -conf.SCROLL_SPEED * 3;
      } else if (keysDown[gamejs.event.K_DOWN]) {
         player.moveDelta[1] = +conf.SCROLL_SPEED * 3;
      } else if (keysDown[gamejs.event.K_z] || keysDown[gamejs.event.K_y]) {
         if (lastSpearThrowMs === null || Date.now() - lastSpearThrowMs > 200) {
            var spear = new Spear(player.rect.center, spearAnimation.clone());
            spears.add(spear);
            lastSpearThrowMs = Date.now();
         }
      } else {
         player.moveDelta[1] = 0;
      }
   };

   // draw score to the screen
   var numberSheet = new animator.SpriteSheet('images/numbers.png', {width: 31, height: 41});
   var frags = 0;
   function drawScore(display) {
      var scorePos = new gamejs.Rect((conf.SCREEN_WIDTH / 2) - 10, 0);
      frags.toString().split('').forEach(function(c) {
         var numberImg = numberSheet.get(parseInt(c, 10));
         display.blit(numberImg, scorePos);
         scorePos.moveIp([numberImg.rect.width, 0]);
      });
   }

   /**
    * loop
    */
   var GAME_PAUSED = true;
   function tick(msDuration) {
      // blitting background below effictively clears
      //display.clear();

      function checkForReset() {
         function checkEvent(event) {
            if (event.type === gamejs.event.MOUSE_DOWN) {
               director.reset();
               keysDown = {};
               frags = 0;
               player.hitCount = 0;
               player.moveDelta = [0, 0];
            }
         }
         gamejs.event.get().forEach(checkEvent);
      };

      // various states of the game that make me bail out tick() early
      if (director.levelsFinished()) {
         display.blit(gamejs.image.load('images/boards/finish.png'));
         drawScore(display);
         checkForReset();
         return;
      } else if (player.hitCount > conf.PLAYER_HITPOINTS) {
         display.blit(gamejs.image.load('images/boards/gameover.png'));
         drawScore(display);
         checkForReset();
         return;
      } else if(GAME_PAUSED === true) {
         function checkEvent(event) {
            if (event.type === gamejs.event.MOUSE_DOWN) {
               GAME_PAUSED = false;
            }
         }
         gamejs.event.get().forEach(checkEvent);
         display.blit(gamejs.image.load('images/boards/introStart.png'));
         drawScore(display);
         return;
      }
      // in-game event handler
      gamejs.event.get().forEach(handleEvent);

      // if player & enemy collide: take damage = change animation + hitpoint--
      if (gamejs.sprite.spriteCollide(player, enemies).length) {
         player.takingDamage();
      }

      // enemy logic
      enemies.forEach(function(enemy) {

         enemy.avoidObstacles(obstacles);

         // kill out-of-view enemys
         if (enemy.rect.top > display.rect.height) {
            enemy.kill();
         }
         // kill enemy after 2 hits
         // 3rd argument true = kill spear in any case
         if (gamejs.sprite.spriteCollide(enemy, spears, true).length) {
            enemy.takingDamage();
            if (enemy.hitCount > 1) {
               enemy.kill();
               frags++;
            }
         }
      });

      // kill out-of-view obstacles
      obstacles.forEach(function(obstacle) {
         if (obstacle.rect.top > display.rect.height) {
            obstacle.kill();
         }
      });

      // model updates
      director.update(msDuration);
      enemies.update(msDuration);
      obstacles.update(msDuration);
      player.update(msDuration);
      player.keepInScreen(display);
      player.avoidObstacles(obstacles);
      background.update(msDuration);
      spears.update(msDuration);

      // draw
      display.blit(background.image);
      enemies.draw(display);
      obstacles.draw(display);
      spears.draw(display);
      player.draw(display);

      drawScore(display);
      if (player.hitCount > conf.PLAYER_HITPOINTS * 0.3) {
         display.blit(damageLightOverlay);
      }
      if (player.hitCount > conf.PLAYER_HITPOINTS * 0.6) {
         display.blit(damageOverlay);
      }
      return;
   };

   gamejs.time.fpsCallback(tick, this, 30);
};

var IMAGES = [
   'images/odys.png',
   'images/odys_shadow.png',

   'images/spear.png',

   'images/numbers.png',

   'images/damage.png',
   'images/damage_light.png',

   'images/boards/finish.png',
   'images/boards/gameover.png',
   'images/boards/introStart.png',
];

// weird logic to automatically add all images to the preloader
conf.LEVELS.forEach(function(level) {
   var enemiesRaw = [];
   level.enemies.forEach(function(m) {
      enemiesRaw = enemiesRaw.concat([m, m.substr(0, m.length-1) + '_shadow']);
   });
   var obstaclesRaw = [];
   level.obstacles.forEach(function(m) {
      obstaclesRaw = obstaclesRaw.concat([m, m + '_shadow']);
   });
   var raw = [];
   raw = raw.concat([
      level.background,
   ], enemiesRaw, obstaclesRaw).map(function(p) {
      return p + '.png';
   });
   IMAGES = IMAGES.concat(raw);
});

// startup
gamejs.preload(IMAGES);
gamejs.ready(main);
