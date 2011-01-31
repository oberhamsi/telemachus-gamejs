Telemachus
============

  * Play: http://gamejs.org/apps/telemachus/
  * Code: http://github.com/oberhamsi/telemachus-gamejs/

I reused @michalbe's <http://michalbe.blogspot.com/> artwork and game design for this game.

SpriteSheets
-------------

Multiple images are often stored in one big image to limit the number of HTTP requests. Such a big image with sub-images is called a sprite sheet. The class SpriteSheet of the animator.js module let's you conviniently access those sub-images:

    var sheet = new SpriteSheet('images/odys.png', {width: 80, height: 90});
    var firstSubImage = sheet.get(0);

The SpriteSheet keeps cached copies of all images on the sheet; you can efficiently get() them per index number. This is useful by itself and surprisingly trivial to implement once you understand the possibilities of gamejs.Surface.blit(); namely, in this case, we use blit()'s ability to copy only a sub-section of the source image (clipping).

Animations
-----------

An AnimationSheet helps me deal with stepping through the single images of an animation. It requires a SpriteSheet and the animation specification in object form to construct:

    var animation = new animator.AnimationSheet(
                     spriteSheet,
                     {walk: [0,3], die: [4,6]}
                   );
    animation.start('walk');
    animation.update(durationMilliseconds);
    display.blit(animation.image);

The AnimationSheep will loop through the appropriate images of the active animation at a definable frame rate. We rely on the GameJs convention of providing an update() method to update model data and an 'image' property to advertise the currently valid Surface to draw. This helps keeping the mental overhead small when introducing new abstractions.
