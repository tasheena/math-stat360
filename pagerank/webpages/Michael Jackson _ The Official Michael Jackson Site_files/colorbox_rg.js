/**
 * @file
 * Attaches behaviors for the rg_photo module.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

(function ($) {
  Drupal.behaviors.rgColorbox = {
    attach: function(context, settings) {
      // Photo Gallery.
      $('a.colorbox').once().colorbox({
        maxWidth: '70%',
        maxHeight: '80%',
        current: '', // hide the "slide x of y" text by request
        onOpen: function() {
          $('embed, object, iframe').css('visibility', 'hidden');
        },
        onComplete: function() {
          //Remove overflow hidden on colorbox so title and comment link show up for mobile.
          $('#colorbox').css('overflow', 'visible');
          // Append caption to lightbox.
          var path = '/' + $(this).data('path'),
            comment_text = Drupal.t('Add comment');
          // append add comment text and link to caption
          if(path !== '/undefined'){
            $('#cboxTitle').append('<span class="caption"><a href="'+path+'#comments">'+comment_text+'</a></span>');
          }else{
            $('#cboxTitle').remove();
          }
        },
        onClosed: function() {
          $('embed, object, iframe').css('visibility', 'visible');
        }
      });

      //remove colorbox on phone
      width320Check = window.matchMedia("(max-width: 320px)");
      if (width320Check.matches){
        $('.view-rg-official-galleries.view-display-id-block_1  a.colorbox, .view-social-feed.view-display-id-block_1  a.colorbox').each(function(){
          $(this).replaceWith(this.innerHTML);
        });
      }
    }
  };
})(jQuery);