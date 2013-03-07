/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Kangsik Kim <kangsik81.kim@samsung.com>
*/

/*
 * For test... 
 */

window._indentCnt = 0;
window._indents = function () {
	var ret = "";
	for ( var i = 0 ; i < window._indentCnt ; i++ ) {
		ret += "  ";
	}
	return ret;
};


window.log = function ( msg ) {
	if ( window.myLog ) {
		myLog( msg );
	} else {
		console.log( msg );
	}
};

( function ($, window, document, undefined) {


	function getScrollBarWidth() {
		var inner = document.createElement('p');

		inner.style.width = "100%";
		inner.style.height = "200px";

		var outer = document.createElement('div');
		outer.style.position = "absolute";
		outer.style.top = "0px";
		outer.style.left = "0px";
		outer.style.visibility = "hidden";
		outer.style.width = "200px";
		outer.style.height = "150px";
		outer.style.overflow = "hidden";
		outer.appendChild(inner);

		document.body.appendChild(outer);
		var w1 = inner.offsetWidth;
		outer.style.overflow = 'scroll';
		var w2 = inner.offsetWidth;

		if (w1 == w2) {
			w2 = outer.clientWidth;
		}

		document.body.removeChild(outer);
		return (w1 - w2);
	};

	scrollbarWidth = function() {
  var parent, child, width;

  if(width===undefined) {
    parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
    child=parent.children();
    width=child.innerWidth()-child.height(99).innerWidth();
    parent.remove();
  }

 return width;
};

function MomentumTracker(options)
{
	// this.easing = "easeOutQuad";
	this.easing = $.easing['easeOutQuad'] || function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	};
	this.reset();
}

var tstates = {
	scrolling: 0,
	overshot:  1,
	snapback:  2,
	done:      3
};

function getCurrentTime() { return (new Date()).getTime(); }

$.extend(MomentumTracker.prototype, {
	start: function(pos, speed, duration, minPos, maxPos)
	{
		this.state = (speed !== 0) ? ((pos > minPos && pos < maxPos) ? tstates.scrolling : tstates.snapback ) : tstates.done;
		this.pos = pos;
		this.speed = speed;
		this.duration = duration;
		this.minPos = minPos;
		this.maxPos = maxPos;

		this.fromPos = (this.state == tstates.snapback) ? 0 : this.pos;
		this.toPos = (this.state == tstates.snapback) ? ((this.pos < this.minPos) ? this.minPos : this.maxPos) : 0;

		this.startTime = getCurrentTime();
	},

	reset: function()
	{
		this.state = tstates.done;
		this.pos = 0;
		this.speed = 0;
		this.minPos = 0;
		this.maxPos = 0;
		this.duration = 0;
	},

	update: function()
	{
		var state = this.state;
		if (state == tstates.done)
			return this.pos;

		var duration = this.duration;
		var elapsed = getCurrentTime() - this.startTime;
		elapsed = elapsed > duration ? duration : elapsed;

		if (state == tstates.scrolling || state == tstates.overshot)
		{
			// var dx = this.speed * (1 - $.easing[this.easing](elapsed/duration, elapsed, 0, 1, duration));
			var dx = this.speed * (1 - this.easing(elapsed/duration, elapsed, 0, 1, duration));
			var x = this.pos + dx;
	
			var didOverShoot = (state == tstates.scrolling) && (x < this.minPos || x > this.maxPos);
			if (didOverShoot) {
				x = (x < this.minPos) ? this.minPos : this.maxPos;
				console.log("didOverShot : " + state + " - " + x + " px.");
			}
		
			this.pos = x;
	
			if (state == tstates.overshot)
			{
				if (elapsed >= duration)
				{
					this.state = tstates.snapback;
					this.fromPos = this.pos;
					this.toPos = (x < this.minPos) ? this.minPos : this.maxPos;
					this.duration = this.options.snapbackDuration;
					this.startTime = getCurrentTime();
					elapsed = 0;
				}
			}
			else if (state == tstates.scrolling)
			{
				if ( didOverShoot || elapsed >= duration) {
					this.state = tstates.done;
				} else if ( this.pos <= this.minPos || this.pos > this.maxPos ) {
					console.log("min or max " + this.pos);
					this.state = tstates.done;
				}
			}
		}
		else if (state == tstates.snapback)
		{
			this.state = tstates.done;
		}

		return this.pos;
	},

	done: function() { return this.state == tstates.done; },
	getPosition: function(){ return this.pos; }
});


	jQuery.widget ("mobile.virtualgrid", jQuery.mobile.widget, {
		// view
		_$view : null,
		_$clip : null,
		_$content : null,
		_$document : null,
		_template : null,

		_viewSize : 0,
		_itemCount : 1,
		_inheritedSize : null,

		_storedScrollPos : 0,

		_$clipSize : {
			width :0,
			height : 0
		},

		_$templateItemSize : {
			width :0,
			height : 0
		},

		// previous touch/mouse position in page..
		_prevPos : {
			x : 0,
			y : 0,
		},

		// current touch/mouse position in page.
		_curPos : {
			x : 0,
			y : 0,
		},

		// Data
		_itemData : function ( idx ) { return null; },
		_numItemData : 0,
		_cacheItemData : function ( minIdx, maxIdx ) { },
		_totalRowCnt : 0,
		_maxSize : 0,
		_scrollBarWidth :0,

		_headItemIdx :0,
		_tailItemIdx :0,

		// axis - ( true : x , false : y )
		_direction : false,
		_keepGoing : true,

		// timer
		_timerInterval : 10,
		_timerCB : null,

		options : {
			// virtualgrid option
			template : "",
			direction : "y",
			rotation : false,
			initSelector: ":jqmData(role='virtualgrid')"
		},

		//TODO : I will deprecate this function. 
		create : function () {
			this._create.apply( this, arguments );
		},

		_create : function ( args ) {
			var self = this,
				$dom = $( self.element ),
				opts = self.options,
				$item = null;

			// itemData
			// If mandatory options are not given, Do nothing.
			if ( !args ) {
				return ;
			}

			if ( !self._loadData( args ) ) {
				return;
			}

			// make a fragment.
			self._eventType = $.support.touch ? "touch" : "mouse";
			self._scrollBarWidth = getScrollBarWidth() ;
			self._fragment = document.createDocumentFragment();
			self._$document = $( document );

			// self._timerCB = self._handleMomentumScroll;
			self._timerCB = function () {
				self._handleMomentumScroll();
			};

			// read defined properties(width and height) from dom element.
			self._inheritedSize = self._getinheritedSize(self.element);

			// set a scroll direction.
			self._direction = opts.direction === 'x' ? true : false;

			// create trakcer
			self._tracker = new MomentumTracker();

			// make view layer
			self._$clip = $( self.element ).addClass("ui-scrollview-clip").addClass("ui-virtualgrid-view");
			self._$clip.css("overflow", "hidden");

			self._$view = $( document.createElement("div") ).addClass("ui-virtualgrid-overthrow overthrow");
			self._$clip.append(self._$view);

			self._$content = $("<div class='ui-virtulgrid-content' style='position:relative;' ></div>");
			self._$view.append(self._$content);

			self._addEventListener();

			self.refresh();
		},

		// The argument is checked for compliance with the specified format.
		// @param args   : Object
		// @return boolean
		_loadData : function ( args ) {
			var self = this;

			if ( args.itemData && typeof args.itemData === 'function'  ) {
				self._itemData = args.itemData;
			} else {
				return false;
			}
			if ( args.numItemData ) {
				if ( typeof args.numItemData === 'function' ) {
					self._numItemData = args.numItemData( );
				} else if ( typeof args.numItemData === 'number' ) {
					self._numItemData = args.numItemData;
				} else {
					return false;
				}
			} else {
				return false;
			}
			self._getObjectNames( self._itemData(0) );
			return true;
		},

		refresh : function () {
			var self = this,
				opts = self.options,
				width = 0,
				height = 0;

			self._template = $( "#" + opts.template );
			if ( !self._template ) {
				return ;
			}

			width = self._calculateClipSize('width');
			height = self._calculateClipSize('height');
			self._$view.width(width).height(height);
			self._$clip.width(width).height(height);

			self._$clipSize.width = width;
			self._$clipSize.height = height;
			self._calculateTemplateItemSize();
			self._initPageProperty();
		},

		_initPageProperty : function () {
			var self = this,
				rowsPerView = 0,
				$children,
				columnCount = 0,
				totalRowCnt = 0,
				attributeName = self._direction ? "width" : "height",
				clipSize =  self._direction ? self._$clipSize.width : self._$clipSize.height,
				templateSize = self.direction ? self._$templateItemSize.width : self._$templateItemSize.height ;

			columnCount = self._calculateColumnCount();

			totalRowCnt = parseInt(self._numItemData / columnCount , 10 );
			log ( " Row Count :  " + totalRowCnt );
			self._totalRowCnt = self._numItemData % columnCount === 0 ? totalRowCnt : totalRowCnt + 1;
			self._itemCount = columnCount;

			if ( templateSize <= 0) {
				return ;
			}

			rowsPerView = clipSize / templateSize;
			rowsPerView = Math.ceil( rowsPerView );
			self._rowsPerView = parseInt( rowsPerView, 10);

			$children = self._makeRows( rowsPerView + 2 );
			self._$content.append($children);
			self._$content.children().css(attributeName, templateSize + "px");

			self._blockScroll = self._rowsPerView > self._totalRowCnt;
			self._maxSize = self._totalRowCnt * templateSize;

			self._$content.height(self._maxSize);
			self._tailItemIdx = rowsPerView + 2 ;
		},

		_addEventListener : function () {
			var self = this,
				templateItemSize = self._direction ? self._$templateItemSize.width: self._$templateItemSize.height,
				$header = $(".ui-header .ui-title"),
				$footer = $(".ui-footer .ui-title");

			if ( self._eventType === 'mouse' ) { // mouse event.
				self._$view.bind( "scroll", function ( event ) {
					self._setScrollPosition(self._$view[0].scrollLeft, self._$view[0].scrollTop );
				});

				self._$content.delegate( "img", "dragstart", function ( event ) {
					event.preventDefault();
				});

				this._dragStartEvt = "mousedown";
				this._dragStartCB = function(e){
					return self._handleDragStart(e, e.clientX, e.clientY); 
				};

				this._dragMoveEvt = "mousemove";
				this._dragMoveCB = function(e){
					return self._handleDragMove(e, e.clientX, e.clientY);
				};

				this._dragStopEvt = "mouseup";
				this._dragStopCB = function(e){
					return self._handleDragStop(e);
				};
			} else { // touch event.
				self._dragStartEvt = "touchstart";
				self._dragStartCB = function ( e ) {
					var t = e.originalEvent.targetTouches[0];
					log(">> preventDefault ");
					e.preventDefault();
					e.stopPropagation();
					
					return self._handleDragStart(e, t.pageX, t.pageY );
				};

				self._dragMoveEvt = "touchmove";
				self._dragMoveCB = function ( e ) {
					var t = e.originalEvent.targetTouches[0];
					return self._handleDragMove(e, t.pageX, t.pageY );
				};

				self._dragStopEvt = "touchend";
				self._dragStopCB = function ( e ) {
					return self._handleDragStop( e );
				};
			}
				self._$view.bind( self._dragStartEvt, self._dragStartCB );
		},

		_getinheritedSize : function ( elem ) {
			var $target = $(elem),
				height,
				width,
				ret = {
					isDefinedWidth : false,
					isDefinedHeight : false,
					width : 0,
					height : 0
				};

			while ( $target[0].nodeType === Node.ELEMENT_NODE && (ret.isDefinedWidth === false || ret.isHeightDefined === false )) {
				height = $target[0].style.height;
				width = $target[0].style.width;

				if (ret.isDefinedHeight === false && height !== "" ) {
					// Size was defined
					ret.isDefinedHeight = true;
					ret.height = parseInt(height, 10);
				}

				if ( ret.isDefinedWidth === false && width !== "" ) {
					// Size was defined
					ret.isDefinedWidth = true;
					ret.width = parseInt(width, 10);
				}
				$target = $target.parent();
			}
			return ret;
		},

		//----------------------------------------------------//
		//		scroll handler								//
		//----------------------------------------------------//
		_handleMomentumScroll : function ( context ) {
			var self =  this,
				keepGoing = false,
				curScrollPos = self._$view[0].scrollTop,
				templateItemSize = self._direction ? self._$templateItemSize.width : self._$templateItemSize.height,
				$header = $(".ui-header .ui-title"),
				x = 0, y = 0;

			var tracker = this._tracker;
			if ( tracker )
			{
				tracker.update();
				x = tracker.getPosition();
				keepGoing = keepGoing || !tracker.done();
			}

			self._setScrollPosition(self._$view[0].scrollLeft, x );
			
			if ( keepGoing ) {
				$(".ui-footer .ui-title").text( self._prevScrollPos + " : " + curScrollPos );
				self._timerID = setTimeout( self._timerCB, self._timerInterval );
			} else {
				console.log(" stop : current scroll top.... " + self._$view[0].scrollTop);
				self._stopMScroll();
			}
		},

		_handleDragStart : function ( event, x, y ) {
			var self = this;

			log( window._indents() + "handle Drag start");
			window._indentCnt++;
	
			self._stopMScroll();
			$(".ui-header .ui-title").text(" start  x : " + x + "/ y : " + y);
			self._enableTracking();
			self._curPos.x = 0;
			self._curPos.y = 0;
			self._prevPos.x = 0;
			self._prevPos.y = 0;
			// for my control.
			self._scrolling = false; // 2번째 무브부터 이동이 이루어져야 함.
			// log(window._indents() + "current scroll top : "+ self._$view[0].scrollTop  + " - left " + self._$view[0].scrollLeft);
			self._startTime = (new Date()).getTime();
			event.stopPropagation();
		},

		_handleDragMove : function ( event, x, y ) {
			var self = this,
				newY = 0,
				distanceY =0;

			self._lastPos2 = y;
			self._prevPos.x = self._curPos.x;
			self._prevPos.y = self._curPos.y;
			self._curPos.x = x;
			self._curPos.y = y;
			self._startTime = (new Date()).getTime();

			if ( self._scrolling ) {
				distanceY = self._curPos.y - self._prevPos.y;
				newY = self._$view[0].scrollTop - distanceY;
				self._setScrollPosition(self._$view[0].scrollLeft, newY );
			} else {
				self._scrolling = true;
			}

		},

		_handleDragStop : function ( event ) {
			var self = this,
				distanceY = self._curPos.y - self._prevPos.y,
				distanceX = self._curPos.x - self._prevPos.x;

			self._startMScroll(-distanceX, -distanceY);
			window._indentCnt--;
			log(window._indents() +"Event : scroll stop....");
		},

		_stopMScroll: function () {
			if ( this._timerID ) {
				clearTimeout( this._timerID );
			}
			this._timerID = 0;
			this._tracker.reset();
			this._disableTracking();
			window._indentCnt --;
		},

		_startMScroll: function ( speedX, speedY ) {
			var self = this,
				keepGoing = false,
				duration = 1500,
				tracker = this._tracker,
				vt = this._vTracker,
				c, startYPos,
				v;

			self._stopMScroll();

			// if ( ht ) {
				// c = this._$clip.width();
				// v = this._$view.width();
// 
				// if ( (( this._sx === 0 && speedX > 0 ) ||
					// ( this._sx === -(v - c) && speedX < 0 )) &&
						// v > c ) {
					// return;
				// }
// 
				// ht.start( this._sx, speedX,
					// duration, (v > c) ? -(v - c) : 0, 0 );
				// keepGoing = !ht.done();
			// }

			// if ( vt ) {
				// c = this._$clip.height();
				// v = this._getViewHeight();
// 
				// if ( (( this._sy === 0 && speedY > 0 ) ||
					// ( this._sy === -(v - c) && speedY < 0 )) &&
						// v > c ) {
					// return;
				// }
// 
				// vt.start( this._sy, speedY,
					// duration, (v > c) ? -(v - c) : 0, 0 );
				// keepGoing = keepGoing || !vt.done();
			// }
			log( window._indents() + "start pos : " + this._$view[0].scrollTop +" startMScroll - speedX : " + speedX + " - speedY : " + speedY );
			window._indentCnt ++;
			if ( tracker ) {
				c = this._$clip.height();
				v = this._$content.height();
				startYPos = this._$view[0].scrollTop;

				if ( (( startYPos === 0 && speedY > 0 ) ||
					( startYPos === (v - c) && speedY < 0 )) &&
						v > c ) {
					return;
				}

				tracker.start( startYPos, speedY,
					duration, 0, (v > c) ? (v - c) : 0 );
				keepGoing = keepGoing || !tracker.done();
			}

			if ( keepGoing ) {
				this._timerID = setTimeout( this._timerCB, this._timerInterval );
			} else {
				this._stopMScroll();
			}
		},

		_enableTracking: function () {
			var self = this;
			self._$document.bind( self._dragMoveEvt, self._dragMoveCB );
			self._$document.bind( self._dragStopEvt, self._dragStopCB );
		},

		_disableTracking: function () {
			var self = this;
			self._$document.unbind( self._dragMoveEvt, self._dragMoveCB );
			self._$document.unbind( self._dragStopEvt, self._dragStopCB );
		},

		//----------------------------------------------------//
		//		Calculate size about dom element.		//
		//----------------------------------------------------//
		_setScrollPosition: function ( x, y ) {
			var self = this,
				prevPos = self._storedScrollPos,
				curPos = self._direction ? x : y,
				diffPos = 0,
				attrName = null,
				templateItemSize =0,
				di = 0,
				i = 0,
				idx = 0,
				$row = null;

			window._indentCnt++;

			if ( self._direction ) {
				curPos = x;
				templateItemSize = self._$templateItemSize.width;
				attrName = "left";
			} else {
				curPos = y;
				templateItemSize = self._$templateItemSize.height;
				attrName = "top";
			}
			diffPos = curPos - prevPos;
			di = parseInt( diffPos / templateItemSize, 10 );

			// console.log( "[before] storedPos :%s, curPos :%s ,di : %s diffPos : %s, tailItemIdx : %s, headItemIdx : %s ", self._storedScrollPos, curPos ,di, diffPos, self._tailItemIdx, self._headItemIdx );
			// $(".ui-footer .ui-title").text("pos : " + self._storedScrollPos + " - "+ curPos );
			if ( di > 0 && self._tailItemIdx < self._totalRowCnt ) { // scroll down
				if ( self._tailItemIdx + 1 === self._totalRowCnt ) {
						console.log ("break;");
				}
				for ( i = 0; i < di; i++ ) {
					$row = $( "[row-index='"+self._headItemIdx+"']" ,self._$content );
					self._replaceRow( $row, self._tailItemIdx );
					self._tailItemIdx++;
					self._headItemIdx++;
					self._clearSelectedDom();
				}
				self._storedScrollPos += di * templateItemSize;
			} else if ( di < 0 ) { // scroll up
				for ( i = 0; i > di && self._headItemIdx > 0; i-- ) {
					self._tailItemIdx--;
					self._headItemIdx--;
					$row = $( "[row-index='" + self._tailItemIdx + "']" ,self._$content );
					self._replaceRow( $row, self._headItemIdx );
					self._clearSelectedDom();
				}
				self._storedScrollPos += di * templateItemSize;
			}

			if ( diffPos < 0 ) {
				$row =  $( "[row-index='" + self._headItemIdx + "']", self._$content );
				if ( $row.position()[attrName] > curPos ) {
					self._tailItemIdx--;
					self._headItemIdx--;
					$row = $( "[row-index='" + self._tailItemIdx + "']" ,self._$content );
					self._replaceRow( $row, self._headItemIdx );
				}
			}

			if ( self._direction ) {
			} else {
				self._$view[0].scrollTop = y;
				// log("move scroll position : " + y + " px.");
			}

			window._indentCnt--;

			// console.log( " +-- [after] storedPos :%s, curPos :%s ,di : %s diffPos : %s, tailItemIdx : %s, headItemIdx : %s ", self._storedScrollPos, curPos ,di, diffPos, self._tailItemIdx, self._headItemIdx );
		},

		//----------------------------------------------------//
		//		Calculate size about dom element.		//
		//----------------------------------------------------//
		_calculateClipSize : function ( attr ) {
			var self = this,
				paddingValue = 0,
				axis = attr === 'height' ? true : false,
				difinedAttrName = axis ? "isDefinedHeight"  : "isDefinedWidth",
				clipSize = 0,
				paddingName1, paddingName2, header, footer, $parent, $view;

			if ( self._inheritedSize[difinedAttrName] ) {
				return self._inheritedSize[attr];
			}

			$view = self._$clip;
			$parent = $view.parents( ".ui-content" );
			clipSize = window[ "inner" + ( axis ? "Height" : "Width" ) ];

			if ( axis ) {
				header = $parent.siblings(".ui-header");
				footer = $parent.siblings(".ui-footer");
				clipSize = clipSize - ( header.outerHeight( true ) || 0);
				clipSize = clipSize - ( footer.outerHeight( true ) || 0);
				paddingName1 = "padding-top";
				paddingName2 = "padding-bottom";
			} else {
				paddingName1 = "padding-left";
				paddingName2 = "padding-right";
			}

			if ( $parent ) {
				paddingValue = parseInt( $parent.css( paddingName1 ), 10 );
				clipSize = clipSize - ( paddingValue || 0 );
				paddingValue = parseInt( $parent.css( paddingName2 ), 10 );
				clipSize = clipSize - ( paddingValue || 0 );
			} else {
				clipSize = $view[attr]();
			}

			return clipSize;
		},

		// This method will take a size of template-item.
		_calculateTemplateItemSize : function () {
			var self = this,
				$tempBlock,
				$tempItem;

			$tempBlock = $ ( self._makeRow( 0 ) );
			$tempItem = $tempBlock.children().eq( 0 );
			self._$content.append( $tempBlock );
			self._$templateItemSize.width = $tempItem.outerWidth( true );
			self._$templateItemSize.height = $tempItem.outerHeight( true );
			$tempBlock.remove();
		},

		_calculateColumnCount : function ( ) {
			var self = this,
				$view = $(self.element),
				viewSize = self._direction ? $view.innerHeight() : $view.innerWidth(),
				templateSize = self._direction ? self._$templateItemSize.height : self._$templateItemSize.width,
				itemCount = 0 ;

			var pushViewSize = viewSize;
			if ( self._direction ) {
				viewSize = viewSize - ( parseInt( $view.css("padding-top"), 10 ) + parseInt( $view.css("padding-bottom"), 10 ) );
			} else {
				viewSize = viewSize - ( parseInt( $view.css("padding-left"), 10 ) + parseInt( $view.css("padding-right"), 10 ) );
			}
			if ( viewSize < templateSize * self._numItemData ) {
				console.log("[ _calculateColumnCount ] apply scrollbarwidth ... : " + self._scrollBarWidth);
				viewSize = viewSize - ( self._scrollBarWidth );
			}
			itemCount = parseInt( (viewSize / templateSize), 10);
			console.log( " itemCount : %s (viewSize : %s , scrollBar size : %s  templateSize : %s )", itemCount, viewSize, self._scrollBarWidth, templateSize );
			return itemCount > 0 ? itemCount : 1 ;
		},

		//----------------------------------------------------//
		//		DOM Element handle		//
		//----------------------------------------------------//
		_makeRows : function ( count ) {
			var self = this,
				index = 0,
				$row = null,
				children = [];

			for ( index = 0; index < count ; index += 1 ) {
				$row = $( self._makeRow( index ) );

				$row.children().detach().appendTo($row); // <-- layout

				if ( self._direction ) {
					$row.css({
						"top" : 0,
						"left" : ( index * self._cellSize )
					});
				}
				children[ index ] = $row;
			}
			return children;
		},

		// make a single row block
		_makeRow : function ( rowIndex ) {
			var self = this,
				opts = self.options,
				index = rowIndex * self._itemCount,
				htmlData = null,
				itemData = null,
				colIndex = 0,
				attrName = self._direction ? "top" : "left",
				blockClassName = self._direction ? "ui-virtualgrid-wrapblock-x " : "ui-virtualgrid-wrapblock-y ",
				attrName = self._direction ? "top" : "left",
				wrapBlock = self._createElement ( "div" ),
				strWrapInner = "";

			for ( colIndex = 0; colIndex < self._itemCount && index < self._numItemData ; colIndex++ ) {
				strWrapInner += self._makeHtmlData( index, index, attrName ) 
				index += 1;
			}
			wrapBlock.innerHTML = strWrapInner;
			wrapBlock.setAttribute( "class", blockClassName );
			wrapBlock.setAttribute( "row-index", String( rowIndex ) );
			wrapBlock.style.position = "absolute";
			wrapBlock.style.top = ( rowIndex * self._$templateItemSize.height ) + "px";
			// self._fragment.appendChild( wrapBlock );
			return wrapBlock;
		},

		_makeHtmlData : function ( myTemplate, dataIndex, colIndex ) {
			var self = this,
				htmlData = null,
				itemData = null,
				attrName = self._direction ? "top" : "left";

			itemData = self._itemData( dataIndex );
			if ( itemData ) {
				htmlStr = self._convertTmplToStr( itemData );
				htmlStr = self._insertPosToTmplStr( htmlStr, attrName, ( colIndex * self._cellOtherSize ) );
			}
			return htmlStr;
		},

		_insertPosToTmplStr : function ( tmplStr, attrName, posVal ) {
			var tagCloseIdx = tmplStr.indexOf( '>' ),
				classIdx = -1,
				firstPart,
				lastPart,
				result,
				found = false,
				targetIdx = 0,
				firstPartLen,
				i = 0;

			if ( tagCloseIdx === -1 ) {
				return;
			}

			firstPart = tmplStr.slice( 0, tagCloseIdx );
			lastPart = tmplStr.slice( tagCloseIdx, tmplStr.length );

			classIdx = firstPart.indexOf( 'class' );

			if ( classIdx !== -1 ) {
				firstPartLen = firstPart.length;
				for ( i = classIdx + 6; i < firstPartLen; i++ ) {
					if ( firstPart.charAt( i ) === "\"" || firstPart.charAt( i ) === "\'" ) {
						if ( found === false ) {
							found = true;
						} else {
							targetIdx = i;
							break;
						}
					}
				}
				result = firstPart.slice( 0, targetIdx ) + " virtualgrid-item" + firstPart.slice( targetIdx, firstPartLen ) + lastPart;
			} else {
				result = firstPart + " class=\"virtualgrid-item\"" + lastPart;
			}

			if ( !isNaN( posVal ) ) {
				result = result.replace( '>', " style=\"" + attrName + ": " + String( posVal ) + "px\">");
			}

			return result;
 		},

		_replaceRows : function ( curCnt, prevCnt, maxCnt, clipPosition ) {
			var self = this,
				$rows = self._$view.children(),
				prevRowIndex = 0,
				rowIndex = 0,
				diffRowCnt = 0,
				targetCnt = 1,
				filterCondition = ( self._filterRatio * self._cellSize) + self._cellSize,
				idx = 0;

			if ( filterCondition < clipPosition ) {
				targetCnt += 1;
			}

			prevRowIndex = parseInt( $($rows[targetCnt]).attr("row-index"), 10);
			if ( prevRowIndex === 0 ) {
				// only top.
				rowIndex = maxCnt - targetCnt;
			} else {
				rowIndex = Math.round( (prevRowIndex * prevCnt) / curCnt );
				if ( rowIndex + self._rowsPerView >= maxCnt ) {
					// only bottom.
					rowIndex = maxCnt - self._rowsPerView;
				}
				diffRowCnt = prevRowIndex - rowIndex;
				rowIndex -= targetCnt;
			}

			for ( idx = 0 ; idx < $rows.length ; idx += 1 ) {
				self._replaceRow($rows[idx], circularNum( rowIndex, self._totalRowCnt ));
				rowIndex++;
			}
			return -diffRowCnt;
		},

		_replaceRow : function ( block, index ) {
			var self = this,
				$block = block.hasChildNodes ? block : block[0];
				tempBlocks = null;

			while ( $block.hasChildNodes() ) {
				$block.removeChild( $block.lastChild );
 			}

			tempBlocks = self._makeRow( index );
			while ( tempBlocks.children.length ) {
				$block.appendChild( tempBlocks.children[0] );
 			}
 			// $block.innerHTML = tempBlocks.innerHTML;
 			$block.style.top = ( index * self._$templateItemSize.height ) + "px"
 			$block.setAttribute("row-index", index );
			tempBlocks.parentNode.removeChild( tempBlocks );
		},

		_createElement : function ( tag ) {
			var element = document.createElement( tag );
			this._fragment.appendChild( element );
			return element;
		},

		_getObjectNames : function ( obj ) {
			var properties = [],
				name = "";

			for ( name in obj ) {
				properties.push( name );
			}
			this._properties = properties;
		},

		_tmpl : function ( data ){
			var self = this,
				idx = 0,
				plainMsg,
				ret;
			if ( !data ) {
				return ;
			}

			plainMsg = self._template.text();
			for ( idx = 0 ; idx < self._properties.length ; idx++ ) {
				plainMsg = self._strReplace( plainMsg, "${" + self._properties[idx] +"}" , data[ self._properties[ idx ] ] );
			}
			ret = $( plainMsg );
			return ret;
		},

		_convertTmplToStr : function ( data ) {
			var self = this,
				idx = 0,
				plainMsg,
				ret;
			if ( !data ) {
				return ;
			}

			plainMsg = self._template.text();
			for ( idx = 0 ; idx < self._properties.length ; idx++ ) {
				plainMsg = self._strReplace( plainMsg, "${" + self._properties[ idx ] + "}" , data[ self._properties[ idx ] ] );
			}
			return plainMsg;
		},

		_strReplace : function(plainMsg, stringToFind,stringToReplace){
			var temp = plainMsg,
				index = plainMsg.indexOf( stringToFind );
			while (index != -1) {
				temp = temp.replace( stringToFind, stringToReplace );
				index = temp.indexOf( stringToFind );
			}
			return temp;
		},

		_clearSelectedDom : function ( ) {
			if ( window.getSelection ) {
				// Mozilla
				window.getSelection().removeAllRanges();
			} else {
				// IE
				document.selection.empty()
			}
		}

	} );

	$( document ).bind( "pagecreate create", function ( e ) {
		$.mobile.virtualgrid.prototype.enhanceWithin( e.target );
	} );
} (jQuery, window, document) );
