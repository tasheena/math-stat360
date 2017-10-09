var pageRank = (function() {
	$(document).ready(function() {
		$(document).click(function(event) {
			if (!$(event.target).is("#vector_button")) {
				$("#vector_button").attr('checked', false);
				$("#vector_display").hide();
			}
		});

		$("#graph_button").click(function() {
			$("#results_list").hide();
			$("#vector_display").hide();
			$("#link_graph").show();
		});

		$("#vector_button").click(function() {
			$("#results_list").hide();
			$("#link_graph").hide();
			var table_rows = $("#vector_table").find("tr");
			var vec = vectors[currentVector];
			if (currentVector < vectors.length) currentVector++;
			var i = 0;
			$(table_rows).each(function() {
				$(this).find('td').html(vec[i]);
				i++;
			});
			$("#vector_display").show();
		});

		// $("#rank_button").click(function() {
		// 	$("#results_list").hide();
		// 	$("#link_graph").hide();
		// 	$("#vector_display").hide();
		// });

	$("#search_button").click(function() {
		$("#search_bar").val("");
		$("#link_graph").hide();
		$("#vector_display").hide();
		var pageDivs = $(".list-group-item");
		var currentPages = pages[currentVector-1];
		$(pageDivs).each(function(index){
			$(this).find('a').html(currentPages[index].title);
			$(this).find('a').attr("href", currentPages[index].link);
			$("#results_list").show();
		});
	});
	$("body").keyup(function(event){
		if(event.keyCode == 13){
			$("#search_button").click();
		}
	});

		// $("#graph_button").hover(function() {
		// 	$("#results_list").hide();
		// 	$("#link_graph").show();
		// }, function() {
		// 	$("#link_graph").hide();
		// });

		// $("#vector_button").hover(function() {
		// 	$("#results_list").hide();
		// 	$("#vector_display").show();
		// }, function() {
		// 	$("#vector_display").hide();
		// });

});

function Page(title, link, rank) {
	this.title = title;
	this.link = link;
}

var numPages = 3;
var pageFour = new Page("Michael Jackson, Plumbing Engineer - Facebook", "https://www.facebook.com/Michael-Jackson-Heating-and-Plumbing-Engineer-189975057767412/");
var pageTwo = new Page("Michael Jackson - Google+", "https://plus.google.com/+MichaelJackson/posts");
var pageOne = new Page("Michael Jackson - Wikipedia, the free encyclopedia", "https://en.wikipedia.org/wiki/Michael_Jackson");
var pageThree = new Page("keep-michaeling.com: Michael Jackson fanpage", "keep-michaeling.com: Michael Jackson fanpage");

var pagesOne = [pageFour, pageThree, pageTwo, pageOne];
var pagesTwo = [pageTwo, pageOne, pageThree, pageFour];
var pagesThree = [pageOne, pageTwo, pageThree, pageFour];
var pages = [pagesOne, pagesTwo, pagesThree];

var vectorOne = [0.25, 0.25, 0.25, 0.25];
var vectorTwo = [0.33, 0.39, 0.16, 0.12];
var vectorThree = [0.38, 0.12, 0.29, 0.19];

var vectors = [vectorOne, vectorTwo, vectorThree];
var currentVector = 0;

})();