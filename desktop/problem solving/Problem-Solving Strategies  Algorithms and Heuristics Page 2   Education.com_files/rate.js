/* JSCmprsd Hash:d278d65e57afbc450c3a2e0e2651f751 */
/** 
Copyright (c) 2012 Education.com Holdings, Inc. All Rights Reserved.
Duplication without permission prohibited.
 **/
rate=new Class({Implements:[Options,Events],options:{element:null,postData:Class.empty,RequestFunction:function(){},StateChangeFunction:function(A){},url:"/",idattribute:"rateid",typeattribute:"type",method:"post",autoCancel:true,jsonextra:{}},initialize:function(A){this.setOptions(A);this.element=this.options.element;this.url=window.location.pathname;this.id=this.element.getAttribute(this.options.idattribute)||getEncodedClassVar(this.element,"ratingid-");this.type="";if(thetype=this.element.getAttribute(this.options.typeattribute)){this.type=thetype}this.makeJsonObj()},addRatingsClick:function(A){if(A){A.addEvent("click",this.query.bind(this,A))}},removeRatingsClick:function(A){A.removeEvents("click")},makeJsonObj:function(){this.xhr=new Request({method:this.options.method,url:this.url,evalScripts:false,autoCancel:this.options.autoCancel,onSuccess:function(A){this.process(A)}.bind(this),onRequest:function(){this.options.RequestFunction()}.bind(this),onStateChange:function(A){this.options.StateChangeFunction(A)}.bind(this),onFailure:function(A){this.queryResponseFail(A)}.bind(this)})},process:function(A){if($type(A)!="object"){if(newobj=JSON.decode(A)){A=newobj}}this.queryResponse(A)},query:function(A){this.rating=A.getAttribute("ratevalue")||getEncodedClassVar(A,"ratevalue-");var B={uniqueID:this.id,rating:this.rating,__json:"AddRating"};B=$merge(B,this.options.jsonextra);if(this.type){B.type=this.type}this.xhr.send(Hash.toQueryString(B))},queryResponse:function(A){console.log("please override this function");console.log(A)},queryResponseFail:function(A){console.log("failed : ");console.log(A)}});var starrating=new Class({Extends:rate,options:{starlinkclass:"star",rateittextclass:"rate-text",rateingtextclass:"rating-text",currentratingclass:"current-rating",ratingulclass:"rateable-list",showuserscoreclass:"showuserscore",ratingclickedclass:"rating-clicked",topratingclass:"top-ratings-area",counttextclass:"count-text",starlistclass:"star-list",starrowclass:"starrow",showloading:true,showratedtexttime:2000,jsonextra:{newStarRating:1}},initialize:function(B){this.parent(B);this.stars=this.element.getElements("."+this.options.starlinkclass);this.swaptoptext=false;if(this.toptext=this.element.getElement("."+this.options.rateittextclass)){this.swaptoptext=true;this.toptextbase=this.toptext.getProperty("alt")||this.toptext.getProperty("data-rateprefix")||"";this.origtext=this.toptext.get("text")}this.toprating=false;var A=$(document.body).getElement("."+this.options.topratingclass+" ."+this.options.currentratingclass);if(A){this.toprating=A;this.topcounter=$(document.body).getElement("."+this.options.topratingclass+" ."+this.options.counttextclass);if(this.topcounter){this.counterbase=this.topcounter.getProperty("rel")}this.topstarlist=$(document.body).getElement("."+this.options.topratingclass+" ."+this.options.starlistclass);this.startitlebase=this.topstarlist.getProperty("rel")}this.stars.each(function(C,D){if(this.swaptoptext){C.addEvents({click:function(E){E.stop();this.query(C)}.bind(this),mouseover:function(E){if(!this.toptext.hasClass(this.options.ratingclickedclass)){newtext=this.toptextbase+" "+C.getProperty("title");this.toptext.set("text",newtext)}}.bind(this),mouseout:function(E){if(!this.toptext.hasClass(this.options.ratingclickedclass)){this.toptext.set("text",this.origtext)}}.bind(this)})}}.bind(this));this.current=this.element.getElement("."+this.options.currentratingclass);this.ratetext=false;if(ratetext=this.element.getElement("."+this.options.ratingtextclass)){this.ratetext=ratetext}this.element.getElement("."+this.options.ratingulclass).addEvents({mouseover:function(C){this.current.setStyle("display","none")}.bind(this),mouseout:function(C){this.current.setStyle("display","block")}.bind(this)})},addLoading:function(){if(!this.loader){this.loader=new Element("img",{src:"/themes/sky/i/widgets/loader-arrow-orange.gif","class":"loadingimg",title:"Rating..."})}this.toptext.addClass(this.options.ratingclickedclass).set("text","").adopt(this.loader)},removeLoading:function(){if(this.loader){this.loader.dispose()}},query:function(A){if(this.options.showloading){this.addLoading()}this.parent(A)},queryResponse:function(D){if(D.width&&D.avgrating){if(this.current){if(this.element.hasClass(this.options.showuserscoreclass)){this.current.setStyle("width",(D.yourrating*20)+"%")}else{this.current.setStyle("width",D.width+"%")}}if(this.ratetext&&D.ratetext){this.ratetext.set("html",D.ratetext)}this.toptext.set("text",this.toptext.getProperty("rel")||"");this.toptext.addClass(this.options.ratingclickedclass);this.removeClassFromTopText.delay(this.options.showratedtexttime,this);if(this.toprating){this.toprating.setStyle("width",D.width+"%");if(this.counterbase){var A=D.rating.count;var E=this.counterbase.replace("[NUM]",A).replace("{count}",A);if(A>1){E=E.replace("[S]","s").replace("{s}","s")}else{E=E.replace("[S]","").replace("{s}","")}if(this.topcounter){this.topcounter.set("text",E)}}var C=this.startitlebase.replace("[AVG]",D.avgrating).replace("{avg}",D.avgrating);this.topstarlist.setProperty("title",C)}var B=this.element.getElements("*[data-replacetext]");if(B){B.each(function(G,F){G.set("html",G.getProperty("data-replacetext").replace("{count}",D.rating.count).replace("{s}",(D.rating.count==1?"":"s")).replace("{avg}",D.avgrating))}.bind(this))}var B=this.element.getElements("*[data-replacetitle]");if(B){B.each(function(G,F){G.setProperty("title",G.getProperty("data-replacetitle").replace("{count}",D.rating.count).replace("{s}",(D.rating.count==1?"":"s")).replace("{avg}",D.avgrating))}.bind(this))}var B=this.element.getElements(".rating-count");if(B){B.set("html",D.rating.count)}var B=this.element.getElements(".rating-avg");if(B){B.set("html",D.avgrating)}if(this.options.showloading){this.removeLoading()}}this.fireEvent("ratingUpdated",D)},removeClassFromTopText:function(){this.toptext.removeClass(this.options.ratingclickedclass)}});var updownrating=new Class({Extends:rate,options:{jsonextra:{returnCount:1}},initialize:function(A){this.parent(A);this.downcountel=this.element.getElement(".downcount");this.upcountel=this.element.getElement(".upcount");this.downclickel=this.element.getElement(".downclick");this.upclickel=this.element.getElement(".upclick");this.addRatingsClick(this.downclickel);this.addRatingsClick(this.upclickel);$$(".thumbrating").each(function(B,C){B.addEvent("mouseover",function(){B.addClass("hover")});B.addEvent("mouseout",function(){B.removeClass("hover")})},this)},removeEvents:function(){this.removeRatingsClick(this.downclickel);this.removeRatingsClick(this.upclickel);$$(".thumbrating").each(function(A,B){A.removeEvents("mouseover");A.removeEvents("mouseout")},this)},queryResponse:function(B){if(B.error){var A=new popcontroller({contents:B.error,title:"Sorry",initialWidth:300});A.popit()}this.upcountel.innerHTML=B.up;this.downcountel.innerHTML=B.down}});var Recommend=new Class({Extends:rate,options:{jsonextra:{recommend:1}},initialize:function(A){this.parent(A);this.countel=this.element.getElement(".recommendcount");this.clickel=this.element.getElement(".recommendclick");this.addRatingsClick(this.clickel);this.clickel.addEvents({mouseenter:function(){this.addClass("hover")},mouseleave:function(){this.removeClass("hover")}})},removeEvents:function(){this.removeRatingsClick(this.clickel)},addRatingsClick:function(A){if(A){A.addEvent("click",(function(B){B.stop();this.query(A)}.bind(this)))}},queryResponse:function(B){if(B.error){var A=new popcontroller({contents:B.error,title:"Sorry",initialWidth:300});A.popit()}this.countel.set("html",B.text.replace("[num]",B.up))}});var ratingObjs={};window.addEvent("domready",registerRatings);function registerRatings(A,B){if(!A){A=$(document.body)}A.getElements("div.ratingdiv").each(function(E){if(!E.hasClass("disabled")){if(E.hasClass("updown")){var D=E.getProperty("rateid");if(!ratingObjs[D]){ratingObjs[D]=new updownrating({element:E})}else{if(B){ratingObjs[D].removeEvents();ratingObjs[D]=new updownrating({element:E})}}}else{if(E.hasClass("starrating")&&E.hasClass("rateable")){var C=new starrating({element:E})}else{if(E.hasClass("rate-recommend")){new Recommend({element:E})}}}}})};