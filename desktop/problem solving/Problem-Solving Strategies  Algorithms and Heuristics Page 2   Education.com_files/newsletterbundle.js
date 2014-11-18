/* JSCmprsd Hash:65f347209931a3a126f86a97da140ab2 */
/** 
Copyright (c) 2011 Education.com Holdings, Inc. All Rights Reserved.
Duplication without permission prohibited.
 **/
var NewsLetterSignupModule=new Class({Implements:[Options,Events],options:{disableSubmit:false,isOpen:false,emailTextBoxId:"newsletterSignup_email",signUpOptionsId:"newsletterSignup_options",errorId:"newsletterSignup_errorMessage",statusId:"newsletterSignup_statusMessage",submitId:"newsletterSignup_submit",emailDefault:""},initialize:function(){this.emailTextBox=$(this.options.emailTextBoxId);this.signupOptions=$(this.options.signUpOptionsId);this.submitbtn=$(this.options.submitId);this.ns_err=$(this.options.errorId);this.ns_status=$(this.options.statusId);this.errfx=new Fx.Morph(this.ns_err,{duration:500,transition:Fx.Transitions.Quart.easeIn});this.statusfx=new Fx.Morph(this.ns_status,{duration:500,transition:Fx.Transitions.Quart.easeIn});this.isOpen=this.options.isOpen;this.disableSubmit=this.options.disableSubmit;this.submitbtn.addEvent("click",function(A){this.handleNewsletterSubmit()}.bind(this));this.emailTextBox.addEvent("focus",function(A){if(!this.isOpen){if(!this.signupOptionsFx){this.signupOptionsFx=new Fx.Slide(this.signupOptions,{duration:700})}this.signupOptionsFx.cancel();this.signupOptionsFx.hide();this.signupOptions.setStyle("display","block");this.signupOptionsFx.slideIn()}this.isOpen=true;this.emailTextBox.setStyle("color","#000000");if(this.emailTextBox.value==this.options.emailDefault){this.emailTextBox.value=""}}.bind(this));this.nlWebServiceClient=new NewsletterWebServiceClient();this.nlWebServiceClient.onSuccess(this.handleNewsLetterSubmitResponse.bind(this));this.nlWebServiceClient.onFailure(this.handleWebServiceException.bind(this))},isValidEmail:function(A){return(A.indexOf(".")>2)&&(A.indexOf("@")>0)},handleNewsletterSubmit:function(){if(this.disableSubmit){return false}this.disableSubmit=true;var A=this.signupOptions.getElements("input");var B=[];this.signupOptions.getElements("input").each(function(C,D){B[B.length]=[C.value,C.checked]});if(!this.isValidEmail(this.emailTextBox.value)){this.ns_status.setStyle("display","none");this.errfx.start({}).chain(function(){(function(){this.errfx.start({opacity:0})}).delay(10,this)}.bind(this)).chain(function(){this.ns_err.setStyle("display","block");this.ns_err.set("text","Sorry, that is not a valid email address.");(function(){this.errfx.start({opacity:1})}).delay(100,this)}.bind(this));this.disableSubmit=false;return false}this.nlWebServiceClient.signup(this.emailTextBox.value,B,"activity")},handleWebServiceException:function(B,A){this.ns_status.setStyle("display","none");if(A.faultCode==9){msg="Sorry, that email address is used by another member."}else{if(A.faultCode==10){msg="Sorry, that is not a valid email address."}else{msg="Sorry, we are unable to process your request. Please try again later."}}this.errfx.start({}).chain(function(){(function(){this.errfx.start({opacity:0})}).delay(10,this)}.bind(this)).chain(function(){this.ns_err.setStyle("display","block");this.ns_err.set("html",msg);(function(){this.errfx.start({opacity:1})}).delay(100,this)}.bind(this));this.disableSubmit=false},handleNewsLetterSubmitResponse:function(A){this.ns_err.setStyle("display","none");this.statusfx.start({}).chain(function(){(function(){this.statusfx.start({opacity:0})}).delay(10,this)}.bind(this)).chain(function(){this.ns_status.setStyle("display","block");this.ns_status.set("html","Thanks! You have been successfully signed up for the newsletter.");(function(){this.statusfx.start({opacity:1})}).delay(100,this)}.bind(this));if((typeof (window.s)!="undefined")){s.tl(true,"o","newsletter")}this.disableSubmit=false}});/* JSCmprsd Hash:856349accaf9c66ff2332b9da8495e75 */
/** 
Copyright (c) 2012 Education.com Holdings, Inc. All Rights Reserved.
Duplication without permission prohibited.
 **/
var WebServiceClient=new Class({Implements:[Options,Events],options:{url:"/service/service.php",reqf:"json",method:"post",request:{resf:"json",v:1},useCache:false},initialize:function(A){this.setOptions(A)},context:this,cache:{},onSuccessFunction:function(B,A){},onSuccess:function(B,A){this.onSuccessFunction=B;this.context=A},onFailureFunction:function(C,A,B){},onFailure:function(B,A){this.onFailureFunction=B;this.context=A},onRequestFunction:function(A){},onRequest:function(B,A){this.onRequestFunction=B;this.context=A},onStateChangeFunction:function(B,A){},send:function(C){var A;mergedRequest=$merge(this.options.request,C);var B=this.onSuccessFunction;var E=this.onFailureFunction;foo=JSON.encode(mergedRequest);if(this.options.useCache==true){A=this.cache[foo]}if(A){this.processSuccess(foo,A,B,E)}else{var D=new Request({url:this.options.url+"?reqf="+this.options.reqf,link:"cancel",evalScripts:false,method:this.options.method,onSuccess:function(F){this.processSuccess(foo,F,B,E)}.bind(this),onRequest:function(){this.onRequestFunction()}.bind(this),onStateChange:function(F){this.onStateChangeFunction(F)}.bind(this),onFailure:function(G,F){E({faultCode:G.status,faultString:G.statusText,faultType:"error"},F,this.context)}.bind(this)});D.send(foo)}},processSuccess:function(F,C,B,A){var E=null;if(this.options.request.resf=="json"){try{E=JSON.decode(C);if(E.faultCode!=undefined){A(E,E,this.context);return }}catch(D){A({faultCode:0,faultString:"server error",faultType:"error"},C,this.context);return }}else{A({faultCode:0,faultString:"unsupported response format",faultType:"error"},C,this.context);return }if(this.options.useCache==true){this.cache[F]=C}B(E,this.context)}});/* JSCmprsd Hash:b2b97cb4ecd21cc43db3dc3cc6c2c3b6 */
var NewsletterWebServiceClient=new Class({Extends:WebServiceClient,Implements:[Options,Events],options:{request:{sn:"newsletter"}},initialize:function(A){this.parent(A)},getPreferences:function(A,B){this.send({f:"getPreferences",id:A,name:B})},getCodes:function(){this.send({f:"getCodes"})},signup:function(B,C,A){this.send({f:"signup",email:B,options:C,name:A})}});