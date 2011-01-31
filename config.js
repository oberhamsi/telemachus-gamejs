exports.SCROLL_SPEED = 50;
exports.SCREEN_WIDTH = 600;
exports.SCREEN_HEIGHT = 600;

exports.SIDE_SPEED = 200;

exports.ENEMY_SPEED = 150;

exports.SPEAR_SPEED = 500;

exports.LEVEL_DURATION = 30 * 1000;

exports.PLAYER_HITPOINTS = 25;

exports.LEVELS = [
{
   background: 'images/backgrounds/lvl1',
   enemies: ['images/enemies/soldier1', 'images/enemies/soldier2', 'images/enemies/soldier3'],
   obstacles: ['images/obstacles/palmTree', 'images/obstacles/bush', 'images/obstacles/column'],
   nrOfEnemies: 3,
   nrOfObstacles: 4
},{
   background: 'images/backgrounds/lvl2',
   enemies: ['images/enemies/cyclop1', 'images/enemies/cyclop2', 'images/enemies/cyclop3'],
   obstacles: ['images/obstacles/stone1', 'images/obstacles/stone2'],
   nrOfEnemies: 3,
   nrOfObstacles: 5
},{
   background: 'images/backgrounds/lvl3',
   enemies: ['images/enemies/hades1', 'images/enemies/hades2', 'images/enemies/hades3', 'images/enemies/hades4'],
   obstacles: ['images/obstacles/stone1', 'images/obstacles/column'],
   nrOfEnemies: 6,
   nrOfObstacles: 2
},{
   background: 'images/backgrounds/lvl4',
   enemies: ['images/enemies/shepherd2', 'images/enemies/shepherd1', 'images/enemies/shepherd3'],
   obstacles: ['images/obstacles/stone1', 'images/obstacles/cactus'],
   nrOfEnemies: 4,
   nrOfObstacles: 7
},{
   background: 'images/backgrounds/lvl1',
   enemies: ['images/enemies/soldier1', 'images/enemies/soldier2', 'images/enemies/soldier3','images/enemies/cyclop1', 'images/enemies/cyclop2', 'images/enemies/cyclop3'],
   obstacles: ['images/obstacles/palmTree', 'images/obstacles/bush', 'images/obstacles/column','images/obstacles/stone1', 'images/obstacles/column'],
   nrOfEnemies: 7,
   nrOfObstacles: 4
}];
