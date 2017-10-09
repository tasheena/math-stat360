/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document, undefined) {


// To understand behaviors, see https://drupal.org/node/756722#behaviors

Drupal.behaviors.frontend = {
  attach: function(context, settings) {
    $(document).ready(function() {
      $("body").once("mjFrontend", function(){
        var scaleTimer;
        mjFrontend = {
          settings: {
            bodyWrapper: $("#page"),
            footerWrapper: $("#footer"),
            ctaWrapperHeight: 0,
            hideCta: (document.cookie.indexOf("hideMjNewsletterCta=hide") > -1)
          },
          init: function(){
            this.menuCard();
            var ncta = $("#newsletter-cta");
            if (mjFrontend.settings.hideCta){
              ncta.css("display", "none");
            } else {
              ncta.css("display", "block");
            }
            this.adjustNewsletter();
            this.adjustHomepage();
            this.footerIconWidth();
            this.adjustToWidth();
            this.footerIconHover();
            this.mjPlayer();
            this.artistFiltersPin();
            this.newsletterCta();
          },
          menuCard: function(){
            $('#main-menu .menu-toggle').live("click", function(e){
              var h = $("#header");
              $('#main-menu .menu-toggle + ul').css("top", h.outerHeight()+h.offset().top);
              var mmo = "mobile-menu-open";
              if($(this).hasClass("open")){
                $("body").addClass(mmo);
              }else{
                $("body").removeClass(mmo);
              }
            });
          },
          adjustNewsletter: function(){
            if($("#newsletter-cta img:eq(0)").length > 0 && $("#newsletter-cta").css("display") != "none"){
              var img = $("#newsletter-cta img:eq(0)");

              var today = new Date();
              var one_month = new Date(today);
                one_month.setMonth(today.getMonth() + 1);
              var one_year = new Date(today);
                one_year.setMonth(today.getMonth() + 12);

              document.cookie = 'hideMjNewsletterCta=hide;expires='+one_month.toUTCString()+';path=/';

              $(img).on("load", function(){
                mjFrontend.settings.ctaWrapperHeight = $("#newsletter-cta img").height();
                mjFrontend.adjustHomepage();
                $("#content").css("margin-top", mjFrontend.settings.ctaWrapperHeight+"px");
                setTimeout(function(){
                  var st = $(window).scrollTop();
                  if(st < mjFrontend.settings.ctaWrapperHeight){
                    $("body,html").animate({
                      scrollTop: mjFrontend.settings.ctaWrapperHeight
                    }, 250);
                  }
                }, 10000);
              });
              $(img).on("click", function(e){
                document.cookie = 'hideMjNewsletterCta=hide;expires='+one_year.toUTCString()+';path=/';
              });
              if ($(img)[0].complete) {
                $(img).load();
              }
            }
          },
          adjustToWidth: function(){
            $(window).on("resize load", function(e){
              
              if(scaleTimer) {
                  window.clearTimeout(scaleTimer);
              }

              scaleTimer = window.setTimeout(function() {
                mjFrontend.footerIconWidth();
                mjFrontend.adjustHomepage();
              }, 200);

            });
          },
          footerIconWidth: function(){
            var bm = $("#block-menu-menu-artist-content-filters");
            var ww = $(window).width();
            var nw = ww/440;
            if(nw < 1){
              bm.css("font-size",nw+"em");
            }else{
              bm.css("font-size","inherit");
            }
            var s = mjFrontend.settings; 
            if(s.footerWrapper.css("position") == "fixed"){
              s.bodyWrapper.css("padding-bottom", s.footerWrapper.height()+16);
            }else{
              s.bodyWrapper.css("padding-bottom", 'inherit');
            }
          },
          footerIconHover: function(){
            $("#block-menu-menu-artist-content-filters").once("footerIconHover", function(){
              $(this).find("li a").each(function(){
                var _this = $(this);
                var item = _this.html();
                var footer = $("#footer");
                _this.after("<span><span>"+item+"<i></i></span></span>");
                _this.hover(function(e){
                  footer.toggleClass("iconHover");
                },
                function(e){
                  footer.toggleClass("iconHover");
                });
              });
            });
          },
          mobileCountryLinks: function(){
            var bl = $("#block-locale-language").clone();
            if(bl){
              var ul = bl.find('ul.like-follow-country-boxes');
              ul.find("li").each(function(e){
                var _this = $(this);
                _this.find('a').append('<h2 class="'+ $(this).attr("class") +'"></h2>')
                _this.removeAttr("class");
              });
              var cl = bl.find("#current-language");
              var li = $('<li class="block-locale"><a href="#" class="collapse-toggle">' + Drupal.t('Country') + '</a></li>');
              var cf = $('<h2 href="#"></h2>').addClass(cl.attr("class"));
              li.find('a').append(cf);
              ul.attr("class",'links collapsible');
              li.append(ul);
              $("#main-menu ul").append(li);
            }
          },
          mjPlayer: function(){
            var block = $("#block-views-mj-player-block");
            var tracks = block.find(".jp-playlist ul li");
            if(tracks.length > 0){
              block.once("mjPlayerPlaylist",function(e){
                var jpc = block.find(".jp-controls");
                var jppl = block.find(".jp-playlist");
                $(".show-playlist", block).live("click", function(e){
                  e.preventDefault();
                  $(this).parent().toggleClass("open");
                });
                jpc.before('<a href="#" class="show-playlist"></a>');
                jpc.after('<span class="song-name"></span>');
                var setTrackTitle = function(e){
                  var track_name = $("#block-views-mj-player-block a.jp-playlist-current").text().trim();
                  $("#block-views-mj-player-block span.song-name").html(track_name);
                }
                $("[id^=jplayer]", block).bind($.jPlayer.event.ready, setTrackTitle);
                $("[id^=jplayer]", block).bind($.jPlayer.event.play, setTrackTitle);
              });
            }
          },
          artistFiltersPin: function(){
            //if($("body").hasClass("section-the-artist")){
            if(true){
              $("body").once("artistFiltersPin",function(){
                $(window).bind("scroll resize load", function(){
                  var footer = $("#footer");
                  var fPos = footer.css("position");
                  var fMenu = $("#block-menu-menu-artist-content-filters", footer);
                  var fHeight = footer.outerHeight();
                  var mHeight = fMenu.outerHeight();
                  var hHeight = $("html").height();
                  var sTop = $(window).scrollTop();
                  var wHeight = $(window).height();
                  var fromBottom = hHeight-sTop-wHeight;
                  var setFooterPadding = function(amt){
                    footer.css("padding-top", amt+"px");
                  }
                  if(fPos == "relative"){
                    if(fMenu.hasClass("pin")){
                      if(fromBottom < fHeight - mHeight){
                        fMenu.removeClass("pin");
                        setFooterPadding(0);
                      }else{
                        fMenu.addClass("pin");
                        setFooterPadding(mHeight);
                      }
                    }else{
                      if(fromBottom > fHeight - mHeight){
                        fMenu.addClass("pin");
                        setFooterPadding(mHeight);
                      }else{
                        fMenu.removeClass("pin");
                        setFooterPadding(0);
                      }
                    }
                  }
                })
              });
            }
          },
          adjustHomepage: function(){
            if($("body").hasClass("front")){
              var conHeight = $("#content").outerHeight(true);
              var fcHeight = $("#footer-copy").outerHeight(true);
              var hpHeight = $("#homepage-columns").outerHeight(true);
              var winHeight = $(window).height();
              var winWidth = $(window).width();
              var tbHeight = $("#top-bar").outerHeight(true);
              var navHeight = $("#navigation-bar").outerHeight(true);
              var headHeight = tbHeight + navHeight + mjFrontend.settings.ctaWrapperHeight;
              var footHeight = $("#footer").outerHeight(true);
              var areaHeight = winHeight - headHeight - footHeight;
              var allHeight = conHeight + hpHeight;
              var mPadding = $("#main").css("padding-top").replace("px","");
              if(mPadding < headHeight && winWidth > 680){
                $("#main").css("padding-top",headHeight+"px");
              }
              if(areaHeight > allHeight){
                $("html").addClass("full-home");
                $("#homepage-columns").css("bottom",fcHeight+"px");
              }else{
                $("html").removeClass("full-home");
              }
              $("body").addClass("adjustHp-init");
            }
          },
          newsletterCta: function(){
            $(window).bind("load scroll", function(){
              var cta = $("#newsletter-cta");
              var sT = $(window).scrollTop();
              var ctaH = mjFrontend.settings.ctaWrapperHeight;
              var h = ctaH-sT;
              var amt = 0;
              if(h<=0 || (sT < 0 && ctaH <= 0)){
                amt = 0;
              }else{
                amt = h > mjFrontend.settings.ctaWrapperHeight ? mjFrontend.settings.ctaWrapperHeight : h;
              }
              cta.height(amt+"px");
            });
          }
        }
          jQuery.fn.reverse = [].reverse;
          mjFrontend.init();
      });
    });
  }
}

Drupal.behaviors.spotlight = {
  attach: function(context, settings) {
    $(document).ready(function() {
      if($("body").hasClass("front")){
          $("body").once("hpSpotlight", function(){
          $("#supersized").remove();
          $("#content .content-wrapper").prepend('<ul id="supersized" />');
          $("#prevslide").live("click", function(e){ e.preventDefault(); api.prevSlide(); api.playToggle(); });
          $("#nextslide").live("click", function(e){ e.preventDefault(); api.nextSlide(); api.playToggle(); });
          var slide_controls = '<div id="slide-controls"><a id="prevslide" href="#">prev</a><a id="nextslide" href="#">next</a></div>';
          $("#content .content-wrapper #supersized").after(slide_controls);
          var ws = $("#content .view-display-id-spotlight_slide");
          var wsr = ws.find(".views-row");
          var slides = function(){
            var all = [];
            $(wsr).each(function(){
              var _this = $(this);
              var i = _this.find(".views-field-field-wideslide").html(); //image
              var m = _this.find(".views-field-field-wideslide-mobile").html(); //mobile
              if($(window).width() < 680 && m){
                i = m;
              }
              var l = _this.find(".views-field-title a"); //link
              var t = l.html(); //title
              var u = l.attr('href');
              var s = { image: i, title: t, url: u }; //slide
              all.push(s);
            });
            return all;
          }
          theme = {
            beforeAnimation: function(direction){
              $("body").addClass("hpSpotlight-loaded");
              $(wsr).hide();
              $(wsr[vars.current_slide]).show();
            },
            afterAnimation: function(){
              if(!vars.is_paused){
                api.playToggle();
              }
            }
          }

          $.supersized({
          
            slideshow               :   1,    //Slideshow on/off
            autoplay        : 1,    //Slideshow starts playing automatically
            start_slide             :   1,    //Start slide (0 is random)
            slide_interval          :   8000, //Length between transitions
            transition              :   3,    //0-None, 1-Fade, 2-Slide Top, 3-Slide Right, 4-Slide Bottom, 5-Slide Left, 6-Carousel Right, 7-Carousel Left
            transition_speed    : 500,  //Speed of transition
            new_window        : 0,    //Image links open in new window/tab
            pause_hover             :   0,    //Pause slideshow on hover
            keyboard_nav            :   1,    //Keyboard navigation on/off
            performance       : 1,    //0-Normal, 1-Hybrid speed/quality, 2-Optimizes image quality, 3-Optimizes transition speed // (Only works for Firefox/IE, not Webkit)
            image_protect     : 1,    //Disables image dragging and right click with Javascript
            image_path        : 'img/', //Default image path

            //Size & Position
            min_width           :   1024,   //Min width allowed (in pixels)
            min_height            :   768,    //Min height allowed (in pixels)
            vertical_center         :   0,    //Vertically center background
            horizontal_center       :   1,    //Horizontally center background
            fit_portrait          :   1,    //Portrait images will not exceed browser height
            fit_landscape     :   1,    //Landscape images will not exceed browser width

            //Components
            navigation              :   1,    //Slideshow controls on/off
            thumbnail_navigation    :   1,    //Thumbnail navigation
            slide_counter           :   1,    //Display slide numbers
            slide_captions          :   1,    //Slide caption (Pull from "title" in slides array)
                                   
            // Components
            slides          :   slides()
            
          });
        });
      }
    });
  }
}

Drupal.behaviors.mobileNewsletter = {
  attach: function(context, settings) {
    $(document).ready(function() {
      
      if($("#mobileNewsletter").length <= 0){
      
        mobileNewsletter = {
          tclose: 'fa fa-play fa-rotate-270',
          topen: 'fa fa-play fa-rotate-90',
          tload: 'fa fa-spinner fa-spin',
          nlink: $('<li id="mobileNewsletter" class="mobile">' + 
                '<a href="#" class="collapse-toggle">Newsletter' +
                '<i class="fa fa-play fa-rotate-90"></i></a>' + 
                '<div class="collapsible inner-wrapper"></div></li>')
        }

        var loadNewsletter = function(e){
          e.preventDefault();
          var _this = $(this);
          var _icon = _this.find('i.fa');
          var _replace = _this.find('.collapsible');
          _icon.attr("class", mobileNewsletter.tload);
          if(!_this.hasClass('loaded')){
            $.ajax({
                url: Drupal.settings.basePath + 'views/ajax',
                type: 'post',
                li: _this,
                icon: _icon,
                data: {
                view_name: 'rg_newsletter',
                view_display_id: 'page'
              },
              dataType: 'json',
              success: function (response, status) {
                this.li.addClass('loaded');
                this.icon.attr("class", mobileNewsletter.tclose);
                if (response[1] !== undefined) {
                  var prepHtml = response[1].data;
                  $("#mobileNewsletter .collapsible form input[type=submit]").live("click", function(e){
                    $(this).parents("form").trigger("submit");
                  });
                  $("#mobileNewsletter .collapsible").html(prepHtml);
                }else{
                  this.icon.attr("class", mobileNewsletter.topen);
                }
              }
            })
          }else{
            if(_this.find('a').hasClass("open")){
              _icon.attr("class", mobileNewsletter.tclose);
            }else{
              _icon.attr("class", mobileNewsletter.topen);
            }
          }
        }

        $('#main-menu > .menu-toggle + ul.links').append(mobileNewsletter.nlink);
        $("#mobileNewsletter").live("click", loadNewsletter);
        mjFrontend.mobileCountryLinks();

      }
      
      });
  }
}

//Adjust timeline order
Drupal.behaviors.adjustTimelineOrder = {
  attach: function(context, settings) {
    $(document).ready(function(){
      $(".simple_timeline .timeline-year").not(":first-child").reverse().each(function(){
        var year = $(this);
        $("<ul>").addClass("view-rows").insertAfter(year.parent()).append(year.nextUntil("li.timeline-year").andSelf());
      });
      $(".simple_timeline ul.view-rows").not(":has(li.timeline-year)").each(function(){
        var ul = $(this);
        ul.parent().prev().find(" > ul").last().append(ul.children());
        if(ul.next().length > 0){
          ul.remove();
        }else{
          ul.parent().remove();
        }
      });
    });
  }
};

function cartDisplay(){
  var ti = $('.right-col .m2-js-mini-cart .m2-cart-count').text();
      if( ti <= 0 ){
        $('.right-col #block-m2-js-m2-js-mini-cart').hide();
      }else {
        $('.right-col #block-m2-js-m2-js-mini-cart').show();
  }
} 

/**
 *  M2 Cart Colorbox functionality
 */
function showCart(container, dropdown) {
  $('.m2-js-mini-cart').find(dropdown).hide();
  var $cart = $(dropdown);
  $(container).colorbox({
    inline: true,
    href: $cart,
    opacity: 0.6,
    width: '80%',
    height: '80%',
    title: 'Your Cart',
    close: Drupal.t('Continue shopping'),
    innerWidth: '100%',
    innerHeight: "100%",
    onOpen: function() {
      $('.m2-js-mini-cart').find(dropdown).show();
      $('embed, object').css('visibility', 'hidden'); // consider including iframe

    },
    onComplete: function() {
     // scrolly box in cart
     boxheight = $('#cboxContent').height();
    $('#colorbox #m2-cart-items').height(boxheight - 90 - 120); // 90 header, 120 footer

    // extra checkout link
    $('.checkout-top').click(function(e){
      e.preventDefault();
      $('.m2-checkout').click();
    });
    },
    onClosed: function() {
      $('embed, object').css('visibility', 'visible'); // consider including iframe
      $('.m2-js-mini-cart').find(dropdown).hide(); 
      cartDisplay();
    }
  });
}

/**
 * The mini cart should be triggered from both the add button
 * as well as the wrapper container.
 */
Drupal.behaviors.m2MiniCart = {attach: function(context, settings) {
  showCart('.m2-js-mini-cart', '#m2-cart');

  // Make the whole wrapper clickable.
  $('.store-details .m2-product-button-wrapper, .product-dropdownlinks .m2-row .m2-product-button-wrapper .cart-wrapper').click(function(e){
    
    if ($(this).find('.m2-sold').length === 0) {
    // always show cart
      $('.m2-js-mini-cart').click();

      // if we're NOT clicking the normal add to cart button
      if ( e.target.className.indexOf('m2-add') < 0 && e.target.className.indexOf('m2-remove') < 0 ){
        // prevent bubbling up into the normal m2-add/m2-remove
        e.stopPropagation();
        // get the id with proper context
        var productid = $('.m2-add', $(this).eq(0)).attr('class').replace('m2-add m2-product-', '');
        console.log(productid);
        // get our store
        var store = (!store) ? $(window).data('m2_js_store') : store;

        // console.log(store);
        // console.log(store);
        // add the item to the store cart
        store.cart.addProduct(productid);
      }
    }
       setTimeout(function() {   //calls click event after a certain time
          var colorbox = $('#colorbox #m2-cart-items');
           if (colorbox.children().length > 0) {
            $('#colorbox').show();
            $('#cboxOverlay').show();
          }
        }, 500);
    // $('.m2-add', this).live('click', function(e){
    //   console.log('yes, clicked');
    // });

  });
  }
};

//Grid view
Drupal.behaviors.grid = {
  attach: function(context, settings) {
    $('.view-artist-content .views-view-grid td .node').each(function (){
      $(this).children('.node-title, .content').wrapAll('<div class="node-wrapper"></div>');
      if ($(this).children('.field-type-image').length > 0) {
        $(this).find('.node-wrapper').css('display', 'none');
      }
       if ($(this).find('.field-name-field-video').length > 0) {
        $(this).find('.node-wrapper').css('display', 'none');
      }
    });
  }
};
    
Drupal.behaviors.carthide = {
  attach: function(context, settings) {
    $(window).load(function() {
        cartDisplay();
    }); 
  }
};


Drupal.behaviors.storeimage = {
  attach: function(context, settings) {
      var $container = $('.store-cover #m2_images_wrap .m2_image a.productimage');
      var cbwidth = '300px';
      var cbheight = '300px';
      if ($(window).width() > '640') {
        var cbwidth = '600px';
        var cbheight = '600px';
      }
      $container.colorbox({
        rel:'product',
        className: 'm2_product_cbox',
        width: cbwidth,
        height: cbheight,
        close: 'x',
      });
  }
};

Drupal.behaviors.videoClick = {
  attach: function(context, settings) {
    // Timeline videos display
    $("#content .simple_timeline .node-video a.play-video").on("click", function(e){
      e.preventDefault();
      _this = $(this);
      _this.parent().find(" > .video_thumbnail").remove();
      _this.remove();
    });
  }
};

$(document).ready(function() {
  
    var bio_height = $('.node-type-m2-product .store-details .field-name-body .field-items').height(),
    album_height = $('.node-album .desc-wrapper .field-type-text-with-summary .field-items').outerHeight();
    if ($('body').hasClass('node-type-m2-product')) {
      if (bio_height <= 197) {
        $('.more').hide();
      }
    }

    if ($('body').hasClass('node-type-album')) {
      if (album_height <= 265) {
        $('.more').hide();
      }
    }
    
   $(".more").toggle(function(){
      $(this).text("Less...");
      $('.node-album .desc-wrapper .field-type-text-with-summary').animate({height: album_height}, 500, function() {$(this).height('auto');});
      $('.node-type-m2-product .store-details .field-name-body').animate({height: bio_height},500,function(){$(this).height('auto');});
    }, function(){
      $(this).text("More...");
      $('.node-type-m2-product .store-details .field-name-body').animate({height: '197px'}, 500);
      $('.node-album .desc-wrapper .field-type-text-with-summary').animate({height: '265px'}, 500);
    });

    //Place holder for search box
    var search_ph = function(){
      var ph = "placeholder" in document.createElement("input");
      var sb = $('#navigation-bar .form-type-textfield input');
      var stext = "Search";
      if(ph){
        sb.attr('placeholder', 'Search');
      }else{
        sb.val(stext);
        sb.bind("focus", function(e){
          if($.trim(sb.val()) == stext){  
            sb.val('');
          }
        });
        sb.bind("blur", function(e){
          if($.trim(sb.val()) == ""){  
            sb.val(stext);
          }
        });
      }
    }
    search_ph();
    $('#search-block-form .form-text').focus(function() {
      $(this).addClass('show-search');
    }).blur(function() {
      if (!$(this).val()) {
        $(this).removeClass('show-search');
      }
    });
    $('#block-views-exp-artist-content-page-1 .form-type-select ul li a').click(function() {
        $('#block-views-exp-artist-content-page-1 .form-type-select ul li a').removeClass('active');
        $(this).addClass('active');
      });
    if ($(window).width() <= 640) {
      $('#sidebar-first').show();
      $('<a class="store-product-tab"></a>').insertBefore('.block-m2-products ul');
      $('<a class="store-product-tab"></a>').insertBefore('#block-views-exp-artist-content-page-1 .form-type-select ul');
      var $menuText = '';
      $('.block-m2-products ul li').each(function() {
        if ($(this).find('a').hasClass('active')) {
          $menuText = $(this).children('a').text();
          $('.store-product-tab').text($menuText);
        }
      });

      //Artist page timeline block
      $('#block-views-exp-artist-content-page-1 .form-type-select ul li a').click(function() {
        $('#block-views-exp-artist-content-page-1 .form-type-select ul li a').removeClass('active');
        $(this).addClass('active');
          $menuText = $(this).text();
          $('.store-product-tab').text($menuText);
      });

      if ($menuText === '') {
        $('.store-product-tab').text('All');
      }
      
       $('#main,#top-bar,.navigation-bar').click(function (){
        $("ul.links").hide();
      });
    }
    $('.store-product-tab').click(function() {
      $('.block-m2-products ul').toggleClass('product-show');
      $('#block-views-exp-artist-content-page-1 .form-type-select ul').toggleClass('product-show');
      $(this).toggleClass('active-product');
    });

    //Collapse toggle
    $(".collapse-toggle").live("click", function(e) {
      e.preventDefault();
      $(this).toggleClass("open");
    });

    //Search box for mobile
    $('#main-menu').append('<div class="search-ui after-search">!</div>');

    $('.search-ui').click(function() {
      $('#navigation-bar .right-col').toggleClass('search-show');
    });

    //Store product block
    $('#block-m2-products-m2-products-search-box input#edit-keyword').attr('placeholder', 'Product Search');
    $('#block-m2-products-m2-products-search-box .form-type-textfield > label').click(function() {
      $(this).hide();
      $(this).siblings('#edit-keyword').show();
      $('#block-m2-products-m2-products-search-box #edit-submit--2').show();
    });

    //Store filter active status
    if($("#block-m2-products-m2-products-store-tabs a.active").length < 1){
      $("#block-m2-products-m2-products-store-tabs ul li:first-child a").addClass("active");
    }

    //Buynow dropdown
    $('.links-dropdown-list h3').on('click', function(e) {
      e.stopPropagation();
      $('.product-dropdownlinks').slideToggle();
    });
    $(document).click(function(){
      $('.product-dropdownlinks').hide();
    });
    $('.product-dropdownlinks').click(function(e){
      e.stopPropagation();
    });
    //Adding playing class for playing track
    $('.views-field-field-audio-file-url .jp-pauseplay').click(function() {
      $('.view-rg-standard-track-list .views-table tr').removeClass('playing');
      $(this).parents('tr').addClass('playing');
      if (!$(this).hasClass('pause')) {
        $('.view-rg-standard-track-list .views-table tr').removeClass('playing');
      }
    });

    $('.product-dropdownlinks .m2-row').each(function() {
      $(this).children('.m2-product-button-wrapper').find('span:nth-child(2), span:nth-child(3)').wrapAll('<div class="text-wrapper"></div>');
      $(this).children('.m2-product-button-wrapper').find('span:nth-child(3), span:nth-child(4)').wrapAll('<div class="cart-wrapper"></div>');
    });

    //Back-to-top
    $('.page-the-artist-timeline #main, .page-the-artist-grid #main').append('<a class="back-to-top" href="#"></a>');
    $(window).scroll(function() {
      if ($(this).scrollTop() > 100) {
        $('.back-to-top').fadeIn(500);
      } else {
        $('.back-to-top').fadeOut(500);
      }
    });
    //Click event to scroll to top
    $('.back-to-top').click(function() {
      $('html, body').animate({scrollTop: 0}, 800);
      return false;
    });

    $(".page-the-artist.page-the-artist-timeline #content").wrapInner("<div id='background-main'></div>");
    $(".page-the-artist.section-the-artist #content").wrapInner("<div id='background-main'></div>");
    var fHeight = $("#footer").outerHeight();
    /*if($(window).width() > 680){
      $("#background-main").css('padding-bottom', fHeight);
    }else{
      $("#background-main").css('padding-bottom', 0);
    }*/

    var cbwidth = '100%';
    var cbheight = '100%';

    if ($(window).width() > '480'){
      var cbwidth = '700px';
      var cbheight = '1000px';
    }
    
    $('.view-fan-gallery .view-header a.colorbox-node-add').colorbox(); 
    $('a.fan-gallery-link').colorbox({
      rel:'fanphoto',
      height:cbheight,
      width:cbwidth,
      href: function() { return $(this).attr("data-imageurl"); },
      title: function () {
          return "COMMENTS".link(this.href);
      }
    });

    $('.upload-photo-link').colorbox({className:'community_upload_cbox',href:"/node/add/photo", iframe: true, height:cbheight, width:cbwidth});
    
  });

  Drupal.behaviors.masonry = {attach: function(context, settings) {
      var $container = $('.view-rg-store .view-content');
      $(window).load(function() {
        $container.masonry({
          columnWidth: 20,
          itemSelector: '.views-row',
          gutter: 20
        });
      });

      $(document).ajaxComplete(function() {
        setInterval(function() {
        $container.masonry('reloadItems');
          $container.masonry();
        }, 1000);

        //jPlayer Track Ajax load
        $('#jquery_jplayer_tracks').once(function() {
          // android compatible fix
          var id = $(this);
          var options = {
            swfPath: "/sites/all/libraries/jplayer",
            supplied: "mp3",
            wmode: "window"
          };
          // cache play selectors
          var playbuttons = $('.jp-pauseplay');
          // first track for initialization

          var first_track = playbuttons.first().attr('href');

          // new android player
          var player_element = new jPlayerAndroidFix(id, {mp3: first_track}, options);

          $('body').on('click', '.jp-pauseplay', function(e) {
            e.preventDefault();

            // always stop all when clicking any play
            player_element.id.jPlayer('stop');

            // stop the main jukebox
            $('.juke-pause').click();

            // if it's already playing
            if (!($(this).hasClass('pause'))) {

              // new android way
              player_element.setMedia({mp3: $(this).attr('href')}).play();
              jukeboxTracks = $(this);

              // remove play from all buttons
              playbuttons.removeClass('pause');
            }

            // this is play visual indicator
            $(this).toggleClass('pause');
          }); // playbuttons.click
        }); //.juke-player.once()
      });
    }
  };

  Drupal.behaviors.brightcove = {attach: function(context, settings) {
      $(document).ready(function() {
        $('.BrightcoveExperience').attr("wmode", "opaque");
      });
      $(document).ajaxComplete(function() {
        brightcove.createExperiences();
        $('.BrightcoveExperience').attr("wmode", "opaque");
      });
    }
  };

  Drupal.behaviors.emptycontent = {attach: function(context, settings) {
      $(document).ready(function() {
        if ($('.page-the-artist.page-the-artist-timeline #main #content .view-artist-content').children('div').hasClass('view-empty')) {
          $('#background-main').css('background', 'none');
        }else{
          $('#background-main').css('background', '');
        }
        if ($('.page-the-artist.section-the-artist #main #content .view-artist-content').children('div').hasClass('view-empty')) {
          $('#background-main').css('background', 'none');
        }else{
          $('#background-main').css('background', '');
        }
      });
    }
  };

  //Album timeline page Playlist title link
  Drupal.behaviors.album = {attach: function(context, settings) {
      $('.track-listing .view-rg-standard-track-list table tr').each(function() {
        var lyrics_link = $(this).find('.views-field-field-lyrics').children('a').attr('href');
        if (!$(this).children('.views-field-title').children('a').hasClass('lyric-link')) {
          $(this).children('.views-field-title').wrapInner('<a class="lyric-link" href=' + lyrics_link + '></a>');
        }
      });
    }
  };
  
  Drupal.behaviors.videos = {attach: function(context, settings) {
      $(window).on("orientationchange", function() {
          var path       = window.location.href,
              nodeLength = $('.node-type-video .field-name-field-video').length;
          if(path.indexOf('the-artist/timeline/video') > -1) {
            window.location.reload(true);
          } 
          if(nodeLength > 0) {
          window.location.reload(true);
        }
      });
    }
  };

})(jQuery, Drupal, this, this.document);
