/**
 * @file
 * JS for M2 API module.
 */

(function ($) {
Drupal.behaviors.m2_api = {
  attach: function (context, settings) {
    if(typeof jQuery.cookies.get('mj_store_country') == 'undefined' || (jQuery.cookies.get('mj_store_country') == null)) {
      jQuery.ajax({
        url: "/ajax/set-country-cookie",
        type: 'GET',
        success: function(data) {
          // do nothing.
          Drupal.settings.m2_js.country = data;
        }
      });
    }
    else {
      Drupal.settings.m2_js.country = jQuery.cookies.get('mj_store_country');
    }
    jQuery.ajax({
      url: "/ajax/generate-m2-tab",
      type: 'GET',
      success: function(data) {
        var bId = "#block-m2-products-m2-products-store-tabs";
        jQuery(bId).once(function(){
          if(jQuery(bId + ' > ul').length == 0){
            jQuery(bId).append(data);
          }
        });
      }
    });
  }
};
})(jQuery);

// Deliberately global.
var M2 = M2 || {};

(function(window, jQuery, undefined) {
"use strict";

jQuery.extend(M2, {
  requestFrequency: 10,
  stores: [],

  initialize: function (options) {
    // Use asynchronous recursion to avoid setInterval() which might fire
    // more frequently than the requests can complete.
    (function worker() {
      M2.processRequests();
      setTimeout(worker, M2.requestFrequency);
    }());

    // Get a store object. If no country is specified, M2's country is used.
    // Finally, we are returning the store, not an M2 object.
    return M2.getStore(options);
  },

  // Retrieves or instantiates a 'store' within M2.
  // Accepts a string (permalink) or an object
  getStore: function (options) {
    options = options || {};
    if (typeof options === 'string') {
      options = {store: options};
    }
    if (options.store === undefined) {
      throw new Error("Store's permalink is required.");
    }

    // Create a new store if it does not exist...
    if (this.stores[options.store] === undefined) {
      M2.stores[options.store] = new M2.Store(options);
    }

    return M2.stores[options.store];
  },

  log: function (object) {
    if (window.console !== undefined) {
      window.console.log(object);
    }
  },

  debug: function (object) {
    M2.log(object);
  },

  extractCallbacks: function (params) {
    // basic guaranteed return object
    var callbacks = {
      beforeSend: null,
      success: null,
      error: null
    };

    // If there is no argument, then we are done.
    if (params === undefined) {
      return callbacks;
    }

    // a single function as an argument is success,
    // otherwise it is assumed to be an object literal with success and error
    if (typeof params === 'function') {
      callbacks.success = params;
    }
    else {
      if (params.success !== undefined) {
        callbacks.success = params.success;
      }
      if (params.error !== undefined) {
        callbacks.error = params.error;
      }
      if (params.beforeSend !== undefined) {
        callbacks.beforeSend = params.beforeSend;
      }
    }

    return callbacks;
  },

  /**
   * Wrapper for JSONP requests.
   *
   * @event Fires 'm2_request_start' event
   * @event {String} May fire 'm2_request_error' event with an error message.
   * @event May fire 'm2_request_complete' event.
   */
  request: function (uri, params, callbacks) {
    var config,
        uri_length,
        queue;

    params = params || {};

    // About 28 extra characters are added for the callback.
    uri_length = (uri + "?" + jQuery.param(params)).length + 28;
    if (uri_length > 2048) {
      jQuery(window).trigger('m2_error', ["The URI you are about to send (" + uri_length + ") exceeds the 2048 character limit."]);
      // We return here because we do not want to just send a bad request.
      return;
    }

    config = {
      url: uri,
      timeout: 5000,
      data: params,
      callbackParameter: "callback",
      traditional: true,

      beforeSend: function (xOptions) {
        if (callbacks.beforeSend) {
          callbacks.beforeSend(xOptions);
        }
        jQuery(window).trigger('m2_request_start');
      },

      success: function (response, textStatus) {
        // Handle server reported errors through the error handler.
        if (typeof response.error !== 'undefined') {
          jQuery(window).trigger('m2_request_error', [response.error]);
          if (callbacks.error) {
            callbacks.error(response, this);
          }
        }
        else if (callbacks.success) {
          callbacks.success(response, this);
        }
      },

      error: function (xOptions, textStatus) {
        jQuery(window).trigger('m2_request_error', ['Remote server error.']);
        if (callbacks.error) {
          callbacks.error({}, this);
        }
      },

      complete: function (xOptions, textStatus) {
        if (jQuery.queue(window, 'requests').length === 0) {
          jQuery(window).trigger('m2_request_complete');
        }
      }
    };

    queue = jQuery.queue(window, 'requests', function () {
      jQuery.jsonp(config);
    });

    M2.log('[queue] Added request to queue ('+ queue.length +') -> ' + uri);
  },

  // This is what manages queued synchronous requests
  processRequests: function () {
    var queue = jQuery.queue(window, 'requests');
    if (queue.length !== 0) {
      M2.log('[dequeue] Dequeueing request (' + queue.length + ').');
      jQuery.dequeue(window, 'requests');
    }
  }
});
}(window, jQuery));
(function(window, jQuery, M2, undefined) {
"use strict";

M2.Display = function (store) {
  var display = this;

  display.store = store;
  display.cartSelector = '.m2-cart-placeholder';
  display.priceSelector = '.m2-price-placeholder';
  display.buySelector = '.m2-button-placeholder';
  display.cartHtml = '<div class="m2-js-mini-cart">' +
      '<div class="m2-cart-header">' +
        '<span class="m2-cart-title">Cart</span> <span class="m2-cart-count">0</span>' +
      '</div>' +
      '<div id="m2-cart" class="empty">' +
        '<ul id="m2-cart-items"></ul>' +
        '<div class="m2-checkout-wrapper"><a class="m2-checkout" href="#">Checkout</a></div>' +
      '</div>' +
    '</div>';
  display.itemHtml = '<li class="m2-product-$id">' +
      '<div class="m2-graphic"><img src="$graphic" /></div>' +
      '<div class="m2-title">$title</div>' +
      '<div class="m2-type">$type</div>' +
      '<div class="m2-price">$price</div>' +
      '<div class="m2-quantity">$quantity</div>' +
      '<div class="m2-remove-wrapper"><a class="m2-remove" href="#">Remove</a></div>' +
    '</li>';

  // Handle cart clearing.
  jQuery(window).bind('m2_cart_emptied.' + store.name, function (event) {
    jQuery('ul#m2-cart-items li').remove();
    jQuery(".m2-add").show();
    jQuery(".m2-remove").hide();

    display.updateCounts();
  });

  // Handle product added.
  jQuery(window).bind('m2_cart_product_added.' + store.name, function (event, productId) {
    var items = display.store.cart.getCartItems();

    if (items[productId]) {
      display.renderCartListItem(display, items[productId])
        .hide()
        .appendTo("ul#m2-cart-items")
        .slideDown();
    }

    jQuery(".m2-add.m2-product-" + productId).hide();
    jQuery(".m2-remove.m2-product-" + productId).show();

    display.updateCounts();
  });

  // Handle product removed.
  jQuery(window).bind('m2_cart_product_removed.' + store.name, function (event, productId) {
    // Remove the item from the cart.
    jQuery("ul#m2-cart-items li.m2-product-" + productId).slideUp('fast', function () {
      jQuery(this).remove();
    });

    jQuery(".m2-add.m2-product-" + productId).show();
    jQuery(".m2-remove.m2-product-" + productId).hide();

    display.updateCounts();
  });
};

M2.Display.prototype = {
  render: function (scope) {
    var display = this,
        ids = [],
        id,
        temp = {};

    scope = scope || window.document;
    display.replaceCartPlaceholder(scope);

    // Gather all the ids of products to get prices for. Run them through a
    // hash to remove duplicates.
    jQuery(display.priceSelector, scope).add(display.buySelector, scope).each(function (i, element) {
      var id = jQuery(element).attr("product_id");
      if (id) {
        temp[id] = true;
      }
    });
 
    for (id in temp) {
      if (temp.hasOwnProperty(id)) {
        ids.push(id);
      }
    }

    // If we found ids, fetch the details then replace the placeholders.
    if (ids.length) {
      display.store.getProducts(ids, {success: function (products) {
        display.replacePricePlaceHolders(products, scope);
        display.replaceButtonPlaceHolders(products, scope);
      }});
    }
  },

  replaceCartPlaceholder: function (scope) {
    var display = this,
        items = display.store.cart.getCartItems();

    // There should only be one but the each handles 0 nicely.
    jQuery(display.cartSelector, scope).each(function (i, element) {
      var $cart = display.renderCart(display, items);
      jQuery(element).replaceWith($cart);
    });

    display.updateCounts();
  },

  replacePricePlaceHolders: function (products, scope) {
    var display = this;

    // Try to find the pricing and assign it to the element.
    jQuery(display.priceSelector, scope).filter(':not(.m2-replacement-failed)').each(function (i, element) {
      var $source = jQuery(element),
          productId = display.extractValidProductId($source, products);

      if (!productId) {
        $source.addClass('m2-replacement-failed').hide();
        return;
      }
      if (products[productId].album_only) {
        $source.addClass('m2-album-only').hide();
        return;
      }
      if(products[productId].stock_info[0].summary == 'Sold Out'){
        if (jQuery( "body" ).hasClass( "page-store" )) {
          $source.replaceWith('<span class="m2-price">' + products[productId].pricing.display + '</span>');
        }
        else {
          $source.replaceWith('<span class="m2-sold">' + products[productId].stock_info[0].summary + '</span>');
        }
      }
      else {
        $source.replaceWith('<span class="m2-price">' + products[productId].pricing.display + '</span>');
      }
    });
  },

  replaceButtonPlaceHolders: function (products, scope) {
    var display = this,
        cartItems = display.store.cart.getCartItems();

    jQuery(display.buySelector, scope).filter(':not(.m2-replacement-failed)').each(function (i, element) {
      var $source = jQuery(element),
          productId = display.extractValidProductId($source, products),
          inCart = (cartItems[productId] !== undefined),
          $addLink, $removeLink;

      if (!productId) {
        $source.addClass('m2-replacement-failed').hide();
        return;
      }
      if (products[productId].album_only) {
        $source.addClass('m2-album-only').hide();
        return;
      }

      $addLink = jQuery('<a href="#"></a>')
        .html($source.attr("add_text") || "Add")
        .addClass('m2-add m2-product-' + productId)
        .click(function (event) {
          display.store.cart.addProduct(productId);
          event.preventDefault();
          setTimeout(function() {   //calls click event after a certain time
          var colorbox = jQuery('#colorbox #m2-cart-items');
           if (colorbox.children().length > 0) {
            jQuery('#colorbox').show();
            jQuery('#cboxOverlay').show();
          }
        }, 500);
        })
        .toggle(!inCart);
      $removeLink = jQuery('<a href="#"></a>')
        .html($source.attr("remove_text") || "Remove")
        .addClass('m2-remove m2-product-' + productId)
        .click(function (event) {
          display.store.cart.removeProduct(productId);
          event.preventDefault();
        })
        .toggle(inCart);
        
      if(products[productId].stock_info[0].summary == 'Sold Out'){
        $source.replaceWith('');
      }
      else {
        $source.replaceWith(jQuery('<span class="m2-product-button"></span>').append($addLink).append($removeLink));
      }
    });
  },

  updateCounts: function () {
    var count = Number(this.store.cart.itemCount);
    var sumtotal = this.store.cart.getCartTotal(); // cart counts
    var currency = '';
    jQuery('#m2-cart').toggleClass('empty', count === 0);
    jQuery('.m2-cart-count').html(count);
    if (count === 0) {
      jQuery('.m2-checkout-wrapper').slideUp();
    }
    else {
      jQuery('.m2-checkout-wrapper').slideDown();
    }
    
    
    var items = this.store.cart.items;
    jQuery.each(items, function(key, value){
      currency = value.pricing.currency;
    });
    // update cart total with counts
    jQuery('.m2-checkout').text(sumtotal.toFixed(2)).append(' ' + currency);
    
  },

  extractValidProductId: function ($element, products) {
    // Make sure we have and ID to work with, otherwise all is lost
    var productId = $element.attr("product_id");
    if (!productId) {
      M2.log($element + " has no product_id attribute.");
      return null;
    }
    else if (!products[productId] || !products[productId].pricing) {
      M2.log(productId + " has no pricing.");
      return null;
    }
    return productId;
  },

  renderCart: function (display, items) {
    var $cart = jQuery(display.cartHtml).find('a.m2-checkout').click(function (event) {
          display.store.checkout();
          event.preventDefault();
        }).end(),
        $cartUl = jQuery('#m2-cart-items', $cart);

    jQuery.each(items, function (index, value) {
      $cartUl.append(display.renderCartListItem(display, value));
    });

    return $cart;
  },

  renderCartListItem: function (display, item) {
    var replacements = {
        '$id': item.id,
        '$title': item.title,
        '$type': item.product_type,
        '$graphic': item.graphic,
        '$price': (item.pricing ? item.pricing.display : 'n/a'),
        '$quantity': item.quantity
      },
      html = display.itemHtml,
      $li,
      key;

    for (key in replacements) {
      if (replacements.hasOwnProperty(key)) {
        html = html.replace(key, replacements[key]);
      }
    }

    $li = jQuery(html);

    // If the item is locked hide the price and remove button.
    if (item.locked) {
      $li.find('.m2-price,.m2-remove-wrapper').hide();
    }
    else {
      $li.find('a.m2-remove').click(function (event) {
        display.store.cart.removeProduct(item.id);
        event.preventDefault();
        setTimeout(function() {   //calls click event after a certain time
          var colorbox = jQuery('#colorbox #m2-cart-items');
          if (colorbox.children().length < 1) {
            jQuery('#colorbox').hide();
            jQuery('#cboxOverlay').hide();
              var ti = jQuery('.right-col .m2-js-mini-cart .m2-cart-count').text();
              if (ti <= 0) {
                jQuery('.right-col #block-m2-js-m2-js-mini-cart').hide();
              } else {
                jQuery('.right-col #block-m2-js-m2-js-mini-cart').show();
              }
          }
        }, 500);
      });
    }

    return $li;
  }
  
};

}(window, jQuery, M2));
(function(window, jQuery, M2, undefined) {
"use strict";

M2.Cart = function (store) {
  var cart = this;

  cart.store = store;
  cart.cartIdKey = store.name + "-cart-id";
  cart.cartId = jQuery.cookies.get(cart.cartIdKey);
  cart.items = {};
  cart.itemCount = 0;

  // This happens asynchronously, but since we queue requests,
  // this should not be problem.
  if (!cart.cartId) {
    cart.create();
  }
  else {
    cart.show();
  }
};

M2.Cart.prototype = {
  /**
   * This method checks for the existance of the cart, asking for a token if
   * necessary.
   */
  create: function (options) {
    this._request('cart/create', options, {
      success: function (response) {
        this.cartId = response.results[0].cart_id;
        jQuery.cookies.set(this.cartIdKey, this.cartId);
      }
    });
  },

  destroy: function () {
    this.cartId = null;
    jQuery.cookies.del(this.cartIdKey);
  },

  /**
   * Show the cart contents via API call
   *
   * @param {Function | Object} Takes a function or object literal with callbacks
   * @event {Object} Fires 'm2_cart_shown' event on store and passes in a cart object
   * @event {Object} Fires 'm2_cart_updated' on store and passes in the items
   */
  show: function (options) {
    if (this.cartId) {
      this._request('cart/' + this.cartId + '/show', options, {
        success: function (response) {
          jQuery(window).trigger('m2_cart_shown.' + this.store.name, [this.items]);
        }
      });
    }
  },

  /**
   * Empties the local cart
   *
   * @param {Function | Object} Takes a function or object literal with callbacks
   * @event {Object} Fires 'm2_cart_updated' on store and passes in the items
   * @event {Object} Fires 'm2_cart_emptied' event on store
   */
  empty: function (options) {
    if (this.cartId) {
      this._request('cart/' + this.cartId + '/empty', options, {
        success: function (response) {
          // setCartItems() will be called twice (first by _success()). This
          // second call will fire the cart.emptied event.
          this.setCartItems(null);
        }
      });
    }
  },

  /**
   * Add a product to the cart by product id via API call
   *
   * @param {Integer} product_id ID of the product to add/remove
   * @param {Function | Object} Takes a function or object literal with callbacks
   * @event {Integer} Fires 'm2_cart_product_added' on store and passes in a product_id
   * @event {Object} Fires 'm2_cart_updated' on store and passes in the items
   */
  addProduct: function (product_id, options) {
    if (this.cartId) {
      this._request('cart/' + this.cartId + '/add/' + product_id, options);
    }
  },

  /**
   * Remove a product to the cart by product id via API call
   *
   * @param {Integer} product_id ID of the product to add/remove
   * @param {Function | Object} Takes a function or object literal with callbacks
   * @event {Integer} Fires 'm2_cart_product_removed' on store and passes in a product_id
   * @event {Object} Fires 'm2_cart_updated' on store and passes in the items
   * @event {Object} May fire 'm2_cart_emptied' event on store
   */
  removeProduct: function (product_id, options) {
    if (this.cartId) {
      this._request('cart/' + this.cartId + '/remove/' + product_id, options);
    }
  },

  /**
   * How many items are in the cart?
   *
   * @return {Integer} number of items.
   */
  size: function () {
    return this.itemCount;
  },

  /**
   * Assign the cart contents.
   *
   * A single request might result in several changes to the cart, e.g
   * if a digial_album is added to the cart after its tracks have been
   * added the tracks will be removed. Or, adding a removing a PECO might
   * remove a free download. We need to fire events correctly so the
   * cart and buy links can be updated.
   *
   * @param {Array} Takes an array of item objects. A null value will empty the cart.
   * @event {Object} Fires 'm2_cart_updated' on store and passes in the items
   * @event {Integer} May fire 'm2_cart_product_added' on store and passes in a product_id
   * @event {Integer} May fire 'm2_cart_product_removed' on store and passes in a product_id
   * @event {Object} May fire 'm2_cart_emptied' event on store
   */
  setCartItems: function (items) {
    var store = this.store,
      old_items = this.items || {},
      new_items = {},
      count = 0,
      id, i, item;

    // Handle the empty cart as a special case.
    if (items === null || items === undefined || items.length === undefined || items.length < 1) {
      this.items = {};
      this.itemCount = 0;
      jQuery(window).trigger('m2_cart_emptied.' + store.name, [this.items]);
      return;
    }

    // Move the items into a hash for easy lookup.
    for (i in items) {
      if (items.hasOwnProperty(i)) {
        item = items[i];
        new_items[item.id] = item;
        count++;
      }
    }

    this.items = new_items;
    this.itemCount = count;

    // Check for removals.
    for (id in old_items) {
      if (old_items.hasOwnProperty(id) && !new_items[id]) {
        jQuery(window).trigger('m2_cart_product_removed.' + store.name, [id]);
      }
    }
    // Check for additions.
    for (id in new_items) {
      if (new_items.hasOwnProperty(id) && !old_items[id]) {
        jQuery(window).trigger('m2_cart_product_added.' + store.name, [id]);
      }
    }

    jQuery(window).trigger('m2_cart_updated.' + store.name, [this.items]);
  },

  /**
   * Get an object with the cart items as properties.
   *
   * @return {Object} The cart items.
   */
  getCartItems: function () {
    return this.items || {};
  },

  /**
   * Get the total value of the cart
   * @return {String} Cart total as string
   */
  getCartTotal: function(){
    var cartsum = 0;
    for (var key in this.items){
      cartsum += this.items[key].pricing.amount;
    }
    return cartsum;
  },
  
  /**
   * Wrap store requests with our own callbacks.
   */
  _request: function (path, params, callbacks) {
    var cart = this,
      func_callbacks = M2.extractCallbacks(callbacks),
      user_callbacks = M2.extractCallbacks(params);

    params = params || {};
    jQuery.extend(params, {'graphic_size': '85x85'});

    // We always want to expand the items.
    if (params.expand && params.length) {
      params.expand += ',items';
    }
    else {
      params.expand = 'items';
    }

    // We get tricky here and make sure our callbacks run first then run the
    // function and user's callbacks.
    callbacks = {
      // The xOptions object is an object containing all the options passed to
      // the function plus defaults for those not provided.
      beforeSend: function (xOptions) {
        // We are passing back the params only...
        if (func_callbacks.beforeSend) {
          func_callbacks.beforeSend.apply(cart, [xOptions.data]);
        }
        if (user_callbacks.beforeSend) {
          user_callbacks.beforeSend.apply(cart, [xOptions.data]);
        }
      },
      success: function (response) {
        // Here we magically extract the items from the response and make sure
        // all the events get fired.
        cart.setCartItems(response.results[0].items);

        if (func_callbacks.success) {
          func_callbacks.success.apply(cart, [response]);
        }
        if (user_callbacks.success) {
          user_callbacks.success.apply(cart, [cart, response]);
        }
      },
      error: function (response) {
        if (func_callbacks.error) {
          func_callbacks.error(response);
        }
        if (user_callbacks.error) {
          user_callbacks.error(response);
        }
      }
    };

    this.store.request(path, params, callbacks);
  }
};

}(window, jQuery, M2));

(function(window, jQuery, M2, undefined) {
"use strict";

// Store class definition
M2.Store = function (options) {
  var store = this;

  options = options || {};
  if (options.store === undefined) {
    throw new Error("Permalink is required to create a store.");
  }
  
  store.name          = options.store;
  store.key           = options.key || '109177db7055de2e42958238572b4454';
  store.country       = Drupal.settings.m2_js.country || 'US';  
  store.host          = options.host || 'api.myplaydirect.com';
  store.checkout_host = options.checkout_host || 'www.myplaydirect.com';
  store.version       = options.version || 'v1';
  store.cache         = {};
  store.cart          = new M2.Cart(store);
  store.display       = new M2.Display(store);
  jQuery(window).trigger('m2_store_init.' + store.name, store);
};



// These instance methods could also be declared in the contructor...
// But since the instance of the store is being passed to its related objects -
// this.cart, this.display, the prototype assures that these functions are
// available in the contructor, and thus have been added to the objects

M2.Store.prototype = {
  /**
   * Get the manifest for the store via API call
   *
   * @param {Function | Object} Takes a function or object literal with callbacks.
   * @event {Integer} Fires 'm2_store_manifest' on store and passes in the response object from the server.
   */
  getManifest: function (callbacks) {
    var store = this;

    callbacks = M2.extractCallbacks(callbacks);

    this.request('manifest', {}, {
      beforeSend: callbacks.beforeSend,
      success: function (response) {
        callbacks.success(response);
        jQuery(window).trigger('m2_store_manifest.' + store.name, [store, response]);
      },
      error: callbacks.error
    });
  },

  /**
   * Get product information for the store via API call.
   *
   * @param {Array} of product ids.
   * @param {Function | Object} Takes a function or object literal with
   *   callbacks. The success callback will be passed an object with the product
   *   ids as keys.
   * @event {Integer} Fires 'manifest.shown' on store and passes in the
   *   response object from the server.
   */
  getProducts: function (ids, callbacks) {
    var store = this,
        cache =store.cache,
        missingIds = [],
        products = {},
        i, id;

    // Grab any products already in the cache and make a list of those we need
    // to request.
    for (i = 0; i < ids.length; i++) {
      id = ids[i];
      if (cache[id] === undefined) {
        missingIds.push(id);
      }
      else {
        products[id] = cache[id];
      }
    }

    callbacks = M2.extractCallbacks(callbacks);

    if (missingIds.length === 0) {
      // No need to make a request.
      callbacks.success(products);
    }
    else {
      store.request('products', {"ids[]": missingIds}, {
        beforeSend: callbacks.beforeSend,
        success: function (response) {
          // Merge the rest of the products in and put a copy in the cache.
          var product;
          for (i = 0; i < response.results.length; i++) {
            product = response.results[i];
            if (product) {
              cache[product.id] = product;
              products[product.id] = product;
            }
          }
          callbacks.success(products);
          jQuery(window).trigger('m2_store_products.' + store.name, [products]);
        },
        error: callbacks.error
      });
    }
  },

  /**
   * Redirect to the Generator Music Digital site for checkout.
   *
   * @event {Object} Fires 'm2_store_checkout' on store and passes in the cart.
   */
  checkout: function () {
    var store = this,
      params = {
        cart_id: this.cart.cartId,
        current_country: this.country
      };

    if (store.cart.size() === 0) {
      return false;
    }
    jQuery(window).trigger('m2_store_checkout.' + store.name, [store.cart]);
    
    // analytics fix 2014/01/07
    var destURL = document.location.protocol + '//' + store.checkout_host + '/' + store.name + '/cart' + "?" + jQuery.param(params);
    _gaq.push(['_link', destURL]);
    window.document.location = destURL;
    //window.document.location = document.location.protocol + '//' + store.checkout_host + '/' + store.name + '/cart' + "?" + jQuery.param(params);

    return true;
  },

  // This is a light wrapper around the main request object that sets up some
  // params that are common to stores.
  request: function (path, params, callbacks) {
    var store = this,
      uri = document.location.protocol + '//' + store.host + '/' + store.name + '/api/' + store.version + '/' + path;

    params = params || {};
    params.current_country = store.country;
    params.key = store.key;

    M2.request(uri, params, callbacks);
  }
};

}(window, jQuery, M2));
