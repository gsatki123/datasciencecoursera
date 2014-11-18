var Facebook = new Class({
	
	initialize: function(options) {
		FB.Event.subscribe('auth.login',  this.login.bind(this));
		FB.Event.subscribe('auth.statusChange', this.doConnect.bind(this));
		Facebook = this;
	},
	
	login: function(d) {
		//console.log(d);
	},
	
	doConnect: function(d) {
		//console.log(d);
	},
	
	loadModal: function (redirect)
	{
		window.fireEvent('getPop', function(pop) 
		{
			var send = new jsonsend({
				url: '/',
				returnFormat: 'html',
				evalScripts: false,
				SuccessFunction: function(obj, js, tree) 
				{
					if($('popdiv'))
					{
						$('popdiv').fireEvent('removeloading');
					}
					if(obj) 
					{
						this.pop.options.initialWidth = '450';
						this.loadModalContents(obj, js, tree);
					}
				}.bind(pop)
			});
			var getobj = {'__getData': 'Modal_FacebookConnect', '__redirect': redirect}; /* Can add contexts here to change the resulting modal.*/
			send.requestit(getobj);
		});
	}
});/**
 * Onloads is a useful pattern for use when the same global JS file is called
 * on multiple pages.
 * 
 * A function may be passed to the "add" method, which will cause it to be
 * added as a domready event.  If optional selectors are passed, the function
 * will only be added if the optional selectors are present.
 * 
 * This becomes useful when attempting to attach events to elements which don't
 * exist on every page.  It also provides automatic documentation on which
 * elements are required for each event to function correctly.
 */
var Onloads = new Hash({
	
	checks: [],
	
	options: {},
	
	/**
	 * Adds an event to the domready, assuming certain selectors are present on
	 * the page.
	 *
	 * Syntax:
	 *     Onloads.add(fn,selector1[,selector2, selector3,...]);
	 *     
	 * Arguments:
	 *     fn - The function to be executed should all selectors be present.
	 *     selectors - One or more selectors to ensure the existence of before
	 *                 executing the event.  The function will be passed the
	 *                 first selector as its argument.
	 * 
	 * Examples:
	 *     Onloads.add(function(s) { s.tween('opacity', 1); }, $('fade-in'));
	 *     
	 * This is the public method that should be used, but refer to the check
	 * method to see what happens with the arguments.
	 */
	add: function(fun,selector) {
		//Attach the domready event on first call (method deletes itself).
		if (this.attachDomready) { this.attachDomready(); }
		//Add the arguments to the checks array for later execution.
		this.checks.push(arguments);
	},
	
	/** Used in template files to set backend-defined things. **/
	setOption: function(key, val) {
		this.options.key = val;
	},
	
	/** Used in JS to access backend-defined things. **/
	getOption: function(key, def) {
		return this.options.key || def;
	},
	
	/** 
	 * INTERNAL METHOD - USE add INSTEAD.
	 * 
	 * After the domready event, check is called on every set of arguments in
	 * the checks array.
	 */
	check: function() {
		var a = arguments;
		//If the first arg is a string, wrap the selector and fn with addEvent.
		var index = 0, event=($type(a[0])==="string");
		if (event) { index++; }
		//Check all our selectors.
		for (var i=index;a.length>i;i++) {
			if ($type(a[i])==='array' && (a[i]).length===0) { a[i] = null; }
			if (a[i]===null) { return false; }
		}
		if (event) { (a[2]).addEvent(a[0], a[1]); }
		else { a[index].pass([(a[index+1])])(); }
	},
	
	/* INTERNAL METHOD */
	attachDomready: function() {
		window.addEvent('domready', (function() {
			this.checks.each((function(s){ this.check.pass(s)();}).bind(this));
		}).bind(this));
		//Remove the method after first call.
		this.erase('attachDomready');
	}
	
});/**
 * Catches click events which happen between the element rendering on the page, and the domready event, and fires them on domready if required.
 * 
 * [page starts loading, DOM is being parsed]------->[elements render]-----*click*---->[dom ready event fires]
 * 
 * Any JS which loads on domready and adds a click event to any element, will have missed any clicks which happened in this gap.
 * 
 * There are traditionally 3 ways to deal with these events:
 * 1. Have a non JS default action which accomplishes the same task (which also works for people who dont have JS enabled).
 * 2. Disable or dont show the element until the event is added (will never show a link which wont work for people who have JS disabled).
 * 3. Make the event work immediatly by moving the JS which adds the event out of the domready to just after the element in the dom, 
 *    but this may require moving more JS to the head, which can have performance impacts.
 *  
 * This script adds an automatic 4th way for any elements whos click event you want to be handeled exclusively by a javascript event. 
 * All clicks which happen in this gap are cached and deferred until the JS addEvent is added to the element, then it is immediatly fired.
 * Only requires that you add the class 'catchPreclick' to any element which you like this functionality. It is not as 'complete' as the 
 * other 3 methods, but works in a pinch.
 */
(function(){
	var catchClickClass = 'catchPreclick',
		clickQueue = {},
		addEvent = Element.prototype.addEvent;
	
	var capture = function(e){
		var targ = $(e.target);
		if(targ.hasClass(catchClickClass)) {
			e.preventDefault();
			clickQueue[((window.Slick)?Slick.uidOf(targ):$uid(targ))] = e;
		} else if(targ.getParent('.'+catchClickClass)) {
			e.preventDefault();
			clickQueue[((window.Slick)?Slick.uidOf((targ.getParent('.'+catchClickClass))):$uid((targ.getParent('.'+catchClickClass))))] = e;
		}
	};
	
	$(document.html).addEvent('click', capture);
	
	window.addEvent('domready', function(){
		$(document.html).removeEvent('click', capture);
		(function(){
			Element.implement('addEvent', addEvent); //put it back, this is not required
		}).delay(500);
	});

	Element.implement('addEvent', function(type, fn){
		var result = addEvent.call(this, type, fn),
			previous = clickQueue[((window.Slick)?Slick.uidOf(this):$uid(this))];
		if (type == 'click' && previous) {
			this.fireEvent('click', previous);
			delete clickQueue[((window.Slick)?Slick.uidOf(this):$uid(this))];
		}
		return result;
	});
})();