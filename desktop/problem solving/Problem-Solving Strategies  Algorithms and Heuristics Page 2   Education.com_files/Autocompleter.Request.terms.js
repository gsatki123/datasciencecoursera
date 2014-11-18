/**
 * Autocompleter.Request
 *
 * http://digitarald.de/project/autocompleter/
 *
 * @version		1.1.2
 *
 * @license		MIT-style license
 * @author		Harald Kirschner <mail [at] digitarald.de>
 * @copyright	Author
 */

if(typeof(Autocompleter.Request) == 'undefined')
{
	Autocompleter.Request = new Class({
	
		Extends: Autocompleter,
	
		options: {/*
			indicator: null,
			indicatorClass: null,
			onRequest: $empty,
			onComplete: $empty,*/
			postData: {},
			ajaxOptions: {},
			postVar: 'value'
	
		},
	
		query: function(){
			var data = $unlink(this.options.postData) || {};
			data[this.options.postVar] = this.queryValue;
			var indicator = $(this.options.indicator);
			if (indicator) { indicator.setStyles({'display': '', 'opacity':0.7}); }
			var cls = this.options.indicatorClass;
			if (cls) { this.element.addClass(cls); }
			this.fireEvent('onRequest', [this.element, this.request, data, this.queryValue]);
			this.request.send({'data': data});
		},
	
		/**
		 * queryResponse - abstract
		 *
		 * Inherated classes have to extend this function and use this.parent()
		 */
		queryResponse: function() {
			var indicator = $(this.options.indicator);
			if (indicator) { indicator.setStyle('display', 'none'); }
			var cls = this.options.indicatorClass;
			if (cls) { this.element.removeClass(cls); }
			return this.fireEvent('onComplete', [this.element, this.request]);
		}
	
	});
}

/* terms extention of Autocompelter: */

Autocompleter.Request.terms = new Class({

	Extends: Autocompleter.Request,
	
	options: {
		loadingHeight : 26, //pixels
		loadingOpacity: 0.5,
		loadingClass: 'results-loading',
		loadingFadeDuration: 200,
		maskDiv: false,
		dropdownWrapClass: 'autocomplete-wrap',
		addShadow: true,
		shadowSize: 3
	},
	
	build: function() {
		/* overrode parent build method to add fancy loading overlay- this requires adding an extra wrapping div: this.autoParent - Also added text mask*/
		this.autoParent = new Element('div', {'class':this.options.dropdownWrapClass, 'styles':{'zIndex':this.options.zIndex} }).inject(document.body);
		if(this.options.addShadow) {
			// detect box-shadow property:
			this.boxShadowSupport = (document.createElement("detect").style.boxShadow === "")?true:false;
			this.shadow = [];
			if(this.boxShadowSupport) {
				this.autoParent.setStyle('box-shadow', '0 2px '+this.options.shadowSize+'px');
			} else {
				var opcy = Math.floor((0.5/(this.options.shadowSize+1))*100)/100;
				for(var i=0; i< this.options.shadowSize; i++) {
				//var opcy = Math.round((.8-((i+1)/(this.options.shadowSize+1)))*10)/10;
					this.shadow[i] = new Element('div', {'class':'autocomplete-shadow autocomplete-shadow'+i, 'styles':{'opacity':(opcy), 'background-color':'#000000', 'position':'absolute', 'top':(i+1), 'left':((-1 * i))}, 'zIndex':(this.options.zIndex-(i+1)) }).inject(this.autoParent);
				}
			}
		}
		//div used for overlaying over the results when results are updating.
		this.loadingDiv = new Element('div', {'class':this.options.loadingClass, 'styles':{'display':'none','z-index':this.options.zIndex+3 }}).inject(this.autoParent);
		this.loadingDivFx = new Fx.Tween(this.loadingDiv , {'duration': this.options.loadingFadeDuration, 'link':'cancel', 'property': 'opacity'}).addEvent('onStart', Chain.prototype.clearChain).set(0);
		if(this.options.maskDiv) {
			this.textMask = $(this.options.maskDiv).set('tween', {'link': 'cancel'}).addEvent('click', function(){ this.element.focus(); }.bind(this));
			this.showingMask = false;
			if(!this.element.hasClass('focused')) { this.showHideMask(false); }
		}
		this.showingLoading = false;
		this.visible = false;
		if ($(this.options.customChoices)) {
			this.choices = this.options.customChoices;
		} else {
			this.choices = new Element('ul', {
				'class': this.options.className,
				'styles': {
					'zIndex': this.options.zIndex
				}
			}).inject(this.autoParent);
			this.relative = false;
			if (this.options.relative) {
				this.choices.inject(this.element, 'after');
				this.relative = this.element.getOffsetParent();
			}
			this.fix = new OverlayFix(this.choices);
		}
		if (!this.options.separator.test(this.options.separatorSplit)) {
			this.options.separatorSplit = this.options.separator;
		}
		this.fx = (!this.options.fxOptions) ? null : new Fx.Tween(this.autoParent, $merge({
			'property': 'opacity',
			'link': 'cancel',
			'duration': 200
		}, this.options.fxOptions)).addEvent('onStart', Chain.prototype.clearChain).set(0);
		this.element.setProperty('autocomplete', 'off')
			.addEvent((Browser.Engine.trident || Browser.Engine.webkit) ? 'keydown' : 'keypress', this.onCommand.bind(this))
			.addEvent('click', this.onCommand.bind(this, [false]))
			.addEvent('focus', (function(){ this.showHideMask(true); this.toggleFocus.delay(100, this, true); }).bind(this));
		if(Browser.Engine.trident) {
			//dont add it here, might be scrolling and that scroll bar causes a blur event in ie
			//IE will fire blur when clicking on the scroll bars of the type-ahead box: need to listen to click unfortunitly
			this.elementFormId = this.element.getParent('form').get('id');
			this.ieBlurCheck = function(e) {
				if(!$(e.target).getParent(this.options.dropdownWrapClass)) {
					//clicked outside:
					if(!$(e.target).getParent('form') || $(e.target).getParent('form').get('id') != this.elementFormId) {
						this.showHideMask(false); this.toggleFocus.delay(100, this, false);
					}
				}
			}.bind(this); //this fn is added onshow.
			this.addedIEBlurEvent = false;
		} else {
			this.element.addEvent('blur', (function(){ this.showHideMask(false); this.toggleFocus.delay(100, this, false); }).bind(this));
		}
		window.addEvent('resize', function(){ this.setParentStyles(false); }.bind(this) );
	},
	
	showHideMask: function(focused) {
		if(this.textMask) {
			if(!focused && !this.showingMask && this.element.get('value') == '') {
				this.textMask.fade('hide').setStyle('display', '').fade('in');
				this.showingMask = true;
			} else if(this.showingMask) {
				//we have focus and we are showing it:
				this.textMask.setStyle('display', 'none');
				this.showingMask = false;
			}
		}
	},
	
	showLoading: function() {
		if(!this.showingLoading) {
			if(!this.visible) {
				this.setParentStyles(true); //set the parents width to match the input.
				this.autoParent.setStyle('display', '');
				if (this.fx) { this.fx.start(1); }
			}
			var dropDownSize = this.autoParent.getSize();
			if(dropDownSize.y < 20) {
				//choice is empty most likely, so expand it a bit to fit the loading.
				dropDownSize.y = this.options.loadingHeight;
				this.autoParent.setStyle('height', dropDownSize.y);
			}
			this.loadingDiv.setStyles({'display': '', 'height':dropDownSize.y, 'width':dropDownSize.x});
			this.loadingDivFx.set(this.options.loadingOpacity);
			this.showingLoading = true;
		}
	},
	
	hideLoading: function() {
		if(this.showingLoading) {
			this.loadingDivFx.start(0).chain(function(){
				this.loadingDiv.setStyle('display', 'none');
				this.showingLoading = false;
			}.bind(this));
		}
	},
	
	setParentStyles: function(cache, fixheight) {
		if(fixheight) {
			this.autoParent.setStyles({'height':'auto'});
		}
		//lets cache this as its not likely to change
		if(cache && this.pos) { return this.pos; }
		
	
		this.pos = this.element.getCoordinates(this.relative);
		var width = this.options.width || 'auto';
		this.correctedWidth = this.pos.width - this.autoParent.getStyle('border-left').toInt() - this.autoParent.getStyle('border-right').toInt() - this.autoParent.getStyle('padding-right').toInt() - this.autoParent.getStyle('padding-left').toInt();
		
		this.autoParent.setStyles({
			'left': this.pos.left,
			'top': this.pos.bottom,
			'width': (width === true || width == 'inherit') ? this.correctedWidth : width,
			'height': 'auto'
		});
		
		return this.pos;
	},
	
	//this function has been set to return false (original v too), I guess caching was never perfected.
	fetchCached: function() {
		return false;
	},
	
	update: function(response, skipevents) {
		this.choices.empty();
		tokens = response.results;
		this.cached = response;
		var type = tokens && $type(tokens);
		if (!type || (type == 'array' && !tokens.length) || (type == 'hash' && !tokens.getLength())) {
			(this.options.emptyChoices || this.hideChoices).call(this);
		} else {
			if (this.options.maxChoices < tokens.length && !this.options.overflow) { tokens.length = this.options.maxChoices; }
			tokens.each(this.options.injectChoice || function(token, ind){
				var choice = new Element('li', {'html': this.markQueryValue(token), 'class':(response['classes'] && response.classes[ind])?response.classes[ind]:''});
				choice.inputValue = token;
				if(response.links) choice.redirectValue = response.links[ind]; //store the link
				if(response.ids) choice.termId=response.ids[ind];
				if(skipevents) { choice.inject(this.choices); }
				else {this.addChoiceEvents(choice).inject(this.choices); }
			}, this);
			this.showChoices();
		}
	},
	
	showChoices: function() {
		var match = this.options.choicesMatch, first = this.choices.getFirst(match);
		this.selected = this.selectedValue = null;
		if (this.fix) {
			this.setParentStyles(true, true); 
		}
		if (!first) { return; }
		if (!this.visible) {
			this.visible = true;
			this.autoParent.setStyle('display', '');
			if (this.fx) { this.fx.start(1); }
			this.fireEvent('onShow', [this.element, this.choices]);
		}
		if (this.options.selectFirst || this.typeAhead || first.inputValue == this.queryValue) { this.choiceOver(first, this.typeAhead); }
		var items = this.choices.getChildren(match), max = this.options.maxChoices;
		var styles = {'overflowY': 'hidden', 'height': '', 'position':'relative'};
		this.overflown = false;
		if (items.length > max) {
			var item = items[max - 1];
			styles.overflowY = 'scroll';
			styles.height = item.getCoordinates(this.choices).bottom;
			this.overflown = true;
		}
		
		if(Browser.Engine.trident && !this.addedIEBlurEvent) {
			//could also check for overflown here, but would require removing the events incase overflown changes
			$(document.body).addEvent('click', this.ieBlurCheck);
			this.addedIEBlurEvent = true;
		}
		
			
		this.choices.setStyles(styles);
		//this.autoParent.setStyles(styles);
		this.fix.show();
		if (this.options.visibleChoices) {
			var scroll = document.getScroll(),
			size = document.getSize(),
			coords = this.choices.getCoordinates();
			if (coords.right > scroll.x + size.x) { scroll.x = coords.right - size.x; }
			if (coords.bottom > scroll.y + size.y) { scroll.y = coords.bottom - size.y; }
			window.scrollTo(Math.min(scroll.x, coords.left), Math.min(scroll.y, coords.top));
		}
		if(this.options.addShadow) {
			this.resizeShadow();
		}
	},
	
	resizeShadow: function() {
		if(this.boxShadowSupport) { return; }
		
		var sizes = this.autoParent.getSize();
		//if(!this.lastSize || this.lastSize.y == sizes.y) {
			//this.lastSize = sizes;
			this.shadow.each(function(el, ind){
				el.setStyles({'width':(sizes.x+((ind*2)-1)), 'height':(sizes.y+(this.options.shadowSize-1-(ind*2))) });
			}, this);
		//}
	},
	
	hideChoices: function(clear) {
		if (clear) {
			var value = this.element.value;
			if (this.options.forceSelect) { value = this.opted; }
			if (this.options.autoTrim) {
				value = value.split(this.options.separatorSplit).filter($arguments(0)).join(this.options.separator);
			}
			this.observer.setValue(value);
		}
		if (!this.visible) { return; }
		this.visible = false;
		if (this.selected)  { this.selected.removeClass('autocompleter-selected'); }
		this.observer.clear();
		var hide = function(){
			this.autoParent.setStyle('display', 'none');
			this.fix.hide();
		}.bind(this);
		if (this.fx) { this.fx.start(0).chain(hide); }
		else { hide(); }
		this.fireEvent('onHide', [this.element, this.choices]);
		
		//if(Browser.Engine.trident) $(document.body).removeEvent('click', this.ieBlurCheck);
	},
	
	onCommand: function(e) {
		if (!e && this.focussed) { return this.prefetch(); }
		if (e && e.key && !e.shift) {
			switch (e.key) {
				case 'enter':
					if (this.element.value != this.opted) { return true; }
					if (this.selected && this.visible) {
						this.choiceSelect(this.selected);
						this.fireEvent('chosen', [this.selected]);
						return !!(this.options.autoSubmit);
					}
					break;
				case 'up': case 'down':
					if (!this.prefetch() && this.queryValue !== null) {
						var up = (e.key == 'up');
						this.choiceOver((this.selected || this.choices)[
							(this.selected) ? ((up) ? 'getPrevious' : 'getNext') : ((up) ? 'getLast' : 'getFirst')
						](this.options.choicesMatch), true);
					}
					return false;
				case 'esc': case 'tab':
					this.hideChoices(true);
					break;
			}
		}
		return true;
	},
	
	addChoiceEvents: function(el) {
		el.addEvents({
			'mouseover': this.choiceOver.bind(this, [el]),
			//'mouseenter': this.choiceHover.bind(this, [true, el]),
			//'mouseleave': this.choiceHover.bind(this, [false, el]),
			'click': (function(){ this.choiceSelect(el); this.fireEvent('chosen', el); }).bind(this)
		});
		//el.set('morph', {link: 'cancel'});
		return el;
	},
	
	choiceHover: function(over, el) {
		el[(over)?'addClass':'removeClass'](this.options.hoverClass);
		return el;
	},
	// overridden because for some reason IE doesnt get the extended Element with the selectRange.
	setSelection: function(finish) {
		var input = this.selected.inputValue, value = input;
		var start = this.queryValue.length, end = input.length;
		if (input.substr(0, start).toLowerCase() != this.queryValue.toLowerCase()) start = 0;
		if (this.options.multiple) {
			var split = this.options.separatorSplit;
			value = this.element.value;
			start += this.queryIndex;
			end += this.queryIndex;
			var old = value.substr(this.queryIndex).split(split, 1)[0];
			value = value.substr(0, this.queryIndex) + input + value.substr(this.queryIndex + old.length);
			if (finish) {
				var tokens = value.split(this.options.separatorSplit).filter(function(entry) {
					return this.test(entry);
				}, /[^\s,]+/);
				if (!this.options.allowDupes) tokens = [].combine(tokens);
				var sep = this.options.separator;
				value = tokens.join(sep) + sep;
				end = value.length;
			}
		}
		this.observer.setValue(value);
		this.opted = value;
		if (finish || this.selectMode == 'pick') start = end;
		this.selectRange(start, end);  // <--  HERE
		this.fireEvent('onSelection', [this.element, this.selected, value, input]);
	},
	
	selectRange: function(start, end) {
		if (Browser.Engine.trident) {
			var diff = this.element.value.substr(start, end - start).replace(/\r/g, '').length;
			start = this.element.value.substr(0, start).replace(/\r/g, '').length;
			var range = this.element.createTextRange();
			range.collapse(true);
			range.moveEnd('character', start + diff);
			range.moveStart('character', start);
			range.select();
		} else {
			this.element.focus();
			this.element.setSelectionRange(start, end);
		}
		return this.element;
	}
	
});



Autocompleter.Request.terms.JSON = new Class({

	Extends: Autocompleter.Request.terms,

	initialize: function(el, url, options) {
		this.parent(el, options);
		this.request = new Request.JSON($merge({
			'url': url,
			'link': 'cancel'
		}, this.options.ajaxOptions)).addEvent('onComplete', this.queryResponse.bind(this));
	},

	queryResponse: function(response) {
		this.parent();
		if(response.status == 1) {
			this.update(response, false);
		} else {
			this.update(response, true);
		}
	}

});

Autocompleter.Request.HTML = new Class({

	Extends: Autocompleter.Request,

	initialize: function(el, url, options) {
		this.parent(el, options);
		this.request = new Request.HTML($merge({
			'url': url,
			'link': 'cancel',
			'update': this.choices
		}, this.options.ajaxOptions)).addEvent('onComplete', this.queryResponse.bind(this));
	},

	queryResponse: function(tree, elements) {
		this.parent();
		if (!elements || !elements.length) {
			this.hideChoices();
		} else {
			this.choices.getChildren(this.options.choicesMatch).each(this.options.injectChoice || function(choice) {
				var value = choice.innerHTML;
				choice.inputValue = value;
				this.addChoiceEvents(choice.set('html', this.markQueryValue(value)));
			}, this);
			this.showChoices();
		}

	}

});

/* compatibility */

Autocompleter.Ajax = {
	Base: Autocompleter.Request,
	Json: Autocompleter.Request.JSON,
	Xhtml: Autocompleter.Request.HTML
};


