(function(window, document, undefined) {
    /**
     * _mergeObj
     * @description Mrge objects
     */
    var _mergeObj = function(to, from) {
        for (var p in from) {
            if (from.hasOwnProperty(p)) {
                to[p] = (typeof from[p] === 'object') ? _mergeObj(to[p], from[p]) : from[p];
            }
        }
        return to;
    };


    /**
     * _throttle
     * @description Borrowed from Underscore.js
     */
    var _throttle = function(func, wait) {
        var _now = Date.now || function() {
            return new Date().getTime();
        };
        var context, args, result;
        var timeout = null;
        var previous = 0;
        var later = function() {
            previous = _now();
            timeout = null;
            result = func.apply(context, args);
            context = args = null;
        };
        return function() {
            var now = _now();
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                context = args = null;
            } else if (!timeout) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };


    /**
     * _getScrollY
     * @description Get current Y posistion
     */
    var _getScrollY = function() {
        return (window.pageYOffset !== undefined) ?
            window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    };


    /**
     * _getElemY
     * @description Get Y posistion of an element
     */
    function _getElemY(elem) {
        var top = 0;
        while (elem) {
            top += elem.offsetTop;
            elem = elem.offsetParent;
        }
        return top;
    }
    'use strict';

    //= helpers.js

    /**
     * Constructor
     */
    var Headhesive = function(elem, options) {

        // Return if feature test fails
        if (!('querySelector' in document && 'addEventListener' in window)) {
            return;
        }

        // Initial state
        this.visible = false;

        // Options
        this.options = {
            offset: 300,
            classes: {
                clone: 'headhesive',
                stick: 'headhesive--stick',
                unstick: 'headhesive--unstick'
            },
            throttle: 250,
            onInit: function() {},
            onStick: function() {},
            onUnstick: function() {},
            onDestroy: function() {},
        };

        // Get elem, check if string, if not assume object passed in
        this.elem = (typeof elem === 'string') ? document.querySelector(elem) : elem;

        // Merge user options with default options
        this.options = _mergeObj(this.options, options);

        // Self init
        this.init();
    };


    /**
     * Headhesive prototype methods
     */
    Headhesive.prototype = {

        constructor: Headhesive,

        /**
         * Initialise Headhesive
         */
        init: function() {

            // Clone element
            this.clonedElem = this.elem.cloneNode(true);
            this.clonedElem.className += ' ' + this.options.classes.clone;
            document.body.insertBefore(this.clonedElem, document.body.firstChild);

            // Determin offset value
            if (typeof this.options.offset === 'number') {
                this.scrollOffset = this.options.offset;

            } else if (typeof this.options.offset === 'string') {
                this.scrollOffset = _getElemY(document.querySelector(this.options.offset));

            } else {
                throw new Error('Invalid offset: ' + this.options.offset);
            }

            // Throttled scroll
            this._throttleUpdate = _throttle(this.update.bind(this), this.options.throttle);

            window.addEventListener('scroll', this._throttleUpdate, false);
            this.options.onInit.call(this);
        },

        /**
         * Clean up DOM and remove events
         */
        destroy: function() {
            document.body.removeChild(this.clonedElem);
            window.removeEventListener('scroll', this._throttleUpdate);
            this.options.onDestroy.call(this);
        },

        /**
         * Logic for sticking element
         */
        stick: function() {
            if (!this.visible) {
                this.clonedElem.className = this.clonedElem.className.replace(new RegExp('(^|\\s)*' + this.options.classes.unstick + '(\\s|$)*', 'g'), '');
                this.clonedElem.className += ' ' + this.options.classes.stick;
                this.visible = true;
                this.options.onStick.call(this);
            }
        },

        /**
         * Logic for unsticking element
         */
        unstick: function() {
            if (this.visible) {
                this.clonedElem.className = this.clonedElem.className.replace(new RegExp('(^|\\s)*' + this.options.classes.stick + '(\\s|$)*', 'g'), '');
                this.clonedElem.className += ' ' + this.options.classes.unstick;
                this.visible = false;
                this.options.onUnstick.call(this);
            }
        },

        /**
         * Update status of elem
         */
        update: function() {
            if (_getScrollY() > this.scrollOffset) {
                this.stick();
            } else {
                this.unstick();
            }
        },

    };

    window.Headhesive = Headhesive;

}(window, document));