/**
 * @file
 * Facebok related JS for the rg_connect module.
 */

(function($) {

$( document ).ready(function() {
Drupal.rgConnect.facebook = {
  loaded: false,

  init: function() {
    if (!Drupal.rgConnect.facebook.loaded) {
      Drupal.rgConnect.facebook.loaded = true;
      // Create the necessary hidden container to avoid the document.write()
      // that the connect.facebook.net js will do otherwise.
      $('<div id="FB_HiddenContainer"></div>')
        .css({
          width: 0,
          height: 0,
          position: 'absolute',
          top: -10000
        }).prependTo($('body'));

      // Adding #fb-root condition, if that exists on the page than don't
      // override the language file loaded by fb_like module.
      if ($('#fb-root').length === 0) {
        // Load the connect.facebook.net js library.
        $.getScript('//connect.facebook.net/en_US/all.js');
      }
    }
  }
};

});
})(jQuery);
