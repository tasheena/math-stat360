/**
 * Javascript additions for rg_global module.
 */

(function ($) {

  Drupal.behaviors.languageDropdown = {
    attach: function (context, settings) {
      // $("#login").hover(
      //     function () {
      //       $(".login-info", this).fadeIn('fast');
      //       $(this).addClass("hover");
      //     },
      //     function () {
      //       $(".login-info", this).fadeOut('fast');
      //       $(this).removeClass("hover");
      //     }
      // );

      // Language Switcher
      $(".block-locale").hover(
          function () {
            $("ul.links", this).fadeIn('fast');
            $(this).addClass("hover");
          },
          function () {
            $("ul.links", this).fadeOut('fast');
            $(this).removeClass("hover");
          }
      );
    }
  };
})(jQuery);
