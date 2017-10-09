/**
 * @file
 * Main js file for rg_connect module.
 */

(function($) {

if (typeof window.console != 'object') {
  window.console = {
    log: function() {},
    debug: function() {},
    error: function() {},
    dir: function() {}
  };
}

$(document).ready(function() {
Drupal.rgConnect = {
  onPopupClose: function() {
    var settings = Drupal.settings.rgConnect.networks[Drupal.rgConnect.activeNetwork];
    // Create a hidden link to make opening the popup easier. ugh.
    var context = $('<div><a href="' + settings.authorize.close_url + '" class="ctools-use-modal"></a></div>').appendTo($('body'));
    console.dir(settings.authorize.close_url);
    Drupal.attachBehaviors(context);
    $('a.ctools-use-modal', context).click();
  },

  openPopup: function(network) {
    if (typeof Popups != 'undefined') {
      Popups.addOverlay();
      Popups.addLoading();
    }

    Drupal.rgConnect.activeNetwork = network;
    var defaultHandler = true;
    if (typeof Drupal.rgConnect[network].connect == 'function') {
      defaultHandler = Drupal.rgConnect[network].connect();
    }

    if (defaultHandler === false) {
      return;
    }

    var settings = Drupal.settings.rgConnect.networks[network];
    var options = 'toolbar=0,scrollbars=0,statusbar=0,menubar=0,resizable=0';
    options += ',width=' + settings.authorize.width;
    options += ',height=' + settings.authorize.height;
    var popup = window.open(settings.authorize.open_url, 'connect', options);
    if (popup == null || typeof popup == 'undefined') {
    }
    else {
      popup.focus();
    }
  },

  activeNetwork: null
};

  $.each(Drupal.settings.rgConnect.networks, function(k, v) {
  if (typeof Drupal.rgConnect[k] !== 'undefined' && typeof Drupal.rgConnect[k].init == 'function') {
      Drupal.rgConnect[k].init();
    }
  })
});

Drupal.behaviors.rgConnect = {
  attach: function (context, settings) {
    $.each(Drupal.settings.rgConnect.networks, function(k, v) {
      $('.rg-connect-' + k + ':not(.rg-connect-processed)', context)
        .addClass('rg-connect-processed')
        .click(function() {
          if (window.location.protocol == 'https:') {
            this.blur();
            Drupal.rgConnect.openPopup(this.rel);
            return false;
          }
          else {
            window.location.href = Drupal.settings.basePath + 'user';
            return false;
          }
        });
    });
  }
};

Drupal.behaviors.rgConnectLogout = {
  attach: function (context, settings) {
    var settings = Drupal.settings.rgConnect;
    if (settings.current && settings.current.network && settings.current.network == 'facebook') {
      $('a[href*="/user/logout"]:not(.rg-connect-logout-processed)')
        .addClass('rg-connect-logout-processed')
        .click(function() {
          FB.Connect.logoutAndRedirect(this.href);
          return false;
        });
    }
  }
};

})(jQuery);
