
/* 
rGenerator Analytics
Version: v4.0, Date: 10/30/2013
*/

var dataLayer  = [{ 
'siteGAId': 'UA-5947906-103',
'divisionGAId': 'UA-5947938-1',
'companyGAId': 'UA-5480202-1',
'globalGAId': 'UA-44195105-1',
'cust01': 'michaeljackson.com',
'cust02': 'Sony Music|Legacy Recordings|Michael Jackson',
'cust03': 'Drupal 6|Custom - D6'
}];

var sDataLayerObj = window['_rgdataLayer'];	
if (sDataLayerObj) {dataLayer = dataLayer.concat(sDataLayerObj);}


// Start Google Tag
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P6RVR4');
// End Google Tag





// Start comScore Tag
var _comscore = _comscore || [];
_comscore.push({ c1: "2", c2: "3005645" });
(function() {
var s = document.createElement("script"), el = document.getElementsByTagName("script")[0]; s.async = true;
s.src = (document.location.protocol == "https:" ? "https://sb" : "http://b") + ".scorecardresearch.com/beacon.js";
el.parentNode.insertBefore(s, el);
})();
// End comScore Tag



// Start Quantcast Tag
var _qevents = _qevents || [];
(function() {
var elem = document.createElement('script');
elem.src = (document.location.protocol == "https:" ? "https://secure" : "http://edge") + ".quantserve.com/quant.js";
elem.async = true;
elem.type = "text/javascript";
var scpt = document.getElementsByTagName('script')[0];
scpt.parentNode.insertBefore(elem, scpt);
})();

_qevents.push(
{qacct:"p-11fACDX9S5kvU",labels:""}
);
// End Quantcast tag


