
if (isPreview()) {
	window.addEventListener("message", function(e) {
		show(e.data);
	});
}
else {
	window.addEventListener('storage', function(e) {
		const display = getStorageDisplay();
		show(display);
	}, false);
}


$(function() {
	fitscale();
	if (!isPreview()) {
		const display = getStorageDisplay();
		show(display);
	}
});

$(window).on('resize', function() {
	fitscale();
});

// windowサイズに合わせて拡大縮小
function fitscale() {
	// var stdheight = 768;	// 基準の高さ
	var stdwidth = 1366;
	// var scale = $(window).height() / stdheight;
	var scale = $(window).width() / stdwidth;
	$("body").css({"transform": "scale(" + scale + ")"});
}


// ストレージ内容に合わせて表示内容更新
function show(display) {
	if(display == null)
		return;

	$("section").css({"display": "none"});		// 表示オフ
	$("[id^=" + display.scene + "_]").html("");	// 全消去
	fill(display);								// 全埋め
	$("#" + display.scene).css({"display": "block"});	// 今のsceneだけ表示オン
}

// 要素に値を埋めていく
function fill(display) {
	for(var attr in display.content) {
		var id = "#" + display.scene + "_" + attr; 
		$(id).html(display.content[attr]);
	}
}


function getStorageDisplay() {
	const display = getLocalStorage().display;
	if(display == undefined)
		display = null;
	return display;
}


function isPreview() {
	const params = new URLSearchParams(window.location.search);
	const is_preview = params.get('is_preview');
	if (is_preview && is_preview.toLowerCase() == "true") {
		return true;
	}
	return false;
}
