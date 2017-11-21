$( document ).ready(function() {

	var quickMenu = $('#quick-menu');
	var quickMenuLeft = $('#yanjing-left');
	var quickMenuRight = $('#yanjing-right');
	var quickMenuDown = $('#quick-menu-down');
	quickMenu.click(function(){
		quickMenuDown.toggle(1000);
		if(quickMenuLeft.attr("src").endsWith("open.png")){
			quickMenuLeft.attr("src","/blog/assets/ico/yanjing_close.png");
		}else{
			quickMenuLeft.attr("src","/blog/assets/ico/yanjing_open.png");
		}
		if(quickMenuRight.attr("src").endsWith("open.png")){
			quickMenuRight.attr("src","/blog/assets/ico/yanjing_close.png");
		}else{
			quickMenuRight.attr("src","/blog/assets/ico/yanjing_open.png");
		}
	})

	var showQuickMenuDown=$('#show-quick-menu-down');
	var showAttr = showQuickMenuDown.css("display");
	if(showAttr=="none"){
		quickMenuDown.hide();
	}else{
		quickMenuDown.hide(1000);
	}




	/* Secondary contact links */
	var myinfo = $('#myinfo');
	var webinfo = $('#webinfo');
	var resume = $("#resume");
    	if(resume.length>0){ 
		//	alert("display resume");
    	}else{
    		myinfo.removeClass('col-sm-4').addClass('col-sm-6');
			webinfo.removeClass('col-sm-4').addClass('col-sm-6');
		}
	var showInfo  =  $("#show-info");
	var codeImg = $("#code-img");
	myinfo.mouseover(function(){
		codeImg.attr("src","/blog/assets/yoting/image/myinfo_code.png");
	});
	myinfo.mouseout(function(){
		codeImg.attr("src","/blog/assets/yoting/image/home_code.png");
	});
	webinfo.mouseover(function(){
		codeImg.attr("src","/blog/assets/yoting/image/webinfo_code.png");
	});
	webinfo.mouseout(function(){
		codeImg.attr("src","/blog/assets/yoting/image/home_code.png");
	});

	//获得当前时间,刻度为一千分一秒
	var initializationTime=(new Date()).getTime();
	var showTimeLabel = $("#show-time");
	showTime(showTimeLabel);
	
});

function showTime(showTimeLabel){
	var now=new Date();
	var year=now.getYear();
	var month=now.getMonth();
	var day=now.getDate();
	var hours=now.getHours();
	var minutes=now.getMinutes();
	var seconds=now.getSeconds();
	//alert(now);
	showTimeLabel.html(""+hours+":"+minutes+":"+seconds+"");
	//一秒刷新一次显示时间
	//var timeID=setTimeout(showTime(showTimeLabel),1000);
}
