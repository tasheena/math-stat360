(function ($) {

Drupal.behaviors.m2_js_cart = {
  attach: function (context, settings) {
    if (M2 === undefined || Drupal.settings.m2_js === undefined || Drupal.settings.m2_js.show === false) {
      return;
    }

    // We may be called multiple times if AJAX callbacks are used. Keep a copy of
    // the store object to allow us to do replacements in new content.
    var store = $(window).data('m2_js_store');
    if (!store) {
      store = M2.initialize(Drupal.settings.m2_js);
      $(window).data('m2_js_store', store);

      store.display.cartHtml = '<div class="m2-js-mini-cart">' +
          '<div class="m2-cart-header">' +
            '<span class="m2-cart-title">' + Drupal.t('Cart') + '</span> <span class="m2-cart-count">0</span>' +
          '</div>' +
          '<div id="m2-cart" class="empty">' +
            '<ul id="m2-cart-items"></ul>' +
            '<div class="m2-checkout-wrapper">'+
            '<a href="#" class="checkout-top">Checkout<span> |</span></a>' +
            '<div class="cart-total">Cart Total</div>' +
          '<a class="m2-checkout" href="#">' + Drupal.t('Checkout') + '</a></div>' +
          '</div>' +
        '</div>';
      store.display.itemHtml = '<li class="m2-product-$id">' +
          '<div class="m2-graphic"><img src="$graphic" /></div>' +
          '<div class="m2-title">$title</div>' +
          '<div class="m2-type">$type</div>' +
          '<div class="m2-price">$price</div>' +
          '<div class="m2-quantity">$quantity</div>' +
          '<div class="m2-remove-wrapper"><a class="m2-remove" href="#">' + Drupal.t('Remove') + '</a></div>' +
        '</li>';

      // Little hack since the M2 folks weren't really ready for international
      // sales.
      $("#m2-cart").prepend('<div class="notice">' + Drupal.t('Shopping available U.S. only') + '</div>');
    }
    store.display.render(context);
  }
};
/*jslint browser: true, indent: 2 */

})(jQuery);
