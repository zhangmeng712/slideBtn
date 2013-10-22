/**
 * @fileoverview
 * @author 思霏<sifei.zm@taobao.com>
 * @module slideBtn
 **/
KISSY.add(function(S, Node, Base, Event) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     *
     * @class SlideBtn
     * @constructor
     * @extends Base
     */

    function SlideBtn(comConfig) {
        var self = this;
        //调用父类构造函数
        SlideBtn.superclass.constructor.call(self, comConfig);
        self.init();
    }
    S.extend(SlideBtn, Base, /** @lends SlideBtn.prototype*/ {
        init: function() {
            this.elem = this.get('baseEl');
            this.disabled = this.get('disabled');
            this.defaultStatus = this.get('defaultStatus');
            this.handleSize = this.get('handleSize');
            this.slideSize = this.get('slideSize');
            this.duration = this.get('duration');
            this.onChange=this.get('onChange');
            if (!this.elem.length) return;
            //考虑要不要把class作为配置项?同css需一致，暂不考虑TODO
            this.disabledClass = 'checkDisabled';
            this.containerClass = 'checkContainer';
            this.labelOnClass = 'checkLabelOn';
            this.labelOffClass = 'checkLabelOff';
            this.handleClass = 'checkHandle';
            this.uncheckedLabel = '';
            this.checkedLabel = '';
            this.setInputElem();
            this._wrapDivs();
            this._attachEvents();
            this._calculateDivsPos();
            this._disableSelectionFocus();
        },
        setInputElem:function(){
            this.elem.prop('checked',this.defaultStatus);
            if(this.disabled){
                this.elem.prop('disabled','disabled');
            }else{
                this.elem.prop('disabled','');

            }
        },
        isDisabled: function() {
            return this.disabled
        },
        getSlideStatus: function() {
            var status=false;
            if(this.elem.prop('checked')=='checked'){
                status=true;
            }
            return status;
        },
        refresh: function() {
            this._didChange();
        },
        /**
         * 生成对应的滑动开关div结构
         * @return {[type]} [description]
         */
        _wrapDivs: function() {

            this.elem.wrap("<div class='" + this.containerClass + "' />");
            this.container = this.elem.parent();
            this.offLabel = $("<label class='" + this.labelOffClass + "'>\n  <span>" + this.uncheckedLabel + "</span>\n</label>").appendTo(this.container);
            this.offSpan = this.offLabel.children('span');
            this.onLabel = $("<label class='" + this.labelOnClass + "'>\n  <span>" + this.checkedLabel + "</span>\n</label>").appendTo(this.container);
            this.onSpan = this.onLabel.children('span');
            this.handle = $("<div class='" + this.handleClass + "'>\n </div>").appendTo(this.container);
            // console.log('this is the content tmpl', this.handle);

        },

        /**
         * 为滑动开关增加事件
         * @return {[type]} [description]
         */
        _attachEvents: function() {
            var localMouseMove, localMouseUp, self;
            self = this;
            localMouseMove = function(event) {
                return self.onGlobalMove.apply(self, arguments);
            };
            localMouseUp = function(event) {
                self.onGlobalUp.apply(self, arguments);
                $(document).detach(Event.Gesture.move, localMouseMove);
                return $(document).detach(Event.Gesture.end, localMouseUp);
            };

            this.elem.on('change', function() {
                return self.refresh();
            });

            this.container.on(Event.Gesture.start, function(event) {
                self.onMouseDown.apply(self, arguments);
                $(document).on(Event.Gesture.move, localMouseMove);
                return $(document).on(Event.Gesture.end, localMouseUp);
            });
        },
        /**
         * 计算开关div的位置
         * @return {[type]} [description]
         */
        _calculateDivsPos: function() {
            this.handleResize(this.handleSize);
            this.containerResize(this.slideSize)
            return this._initialPosition();
        },
        /**
         * 计算开关元素尺寸
         * @param  {[String]} elem []
         */
        handleResize: function(width) {
            return this.handle.css({
                width: width + 'px'
            });
        },
        containerResize: function(width) {
            return this.container.css({
                width: width + 'px'
            });

        },

        _initialPosition: function() {
            var containerWidth, offset;
            containerWidth = this._getDimension(this.container, "width");
            this.offLabel.css({
                width: containerWidth
            });
            offset = 0;

            this.rightSide = containerWidth - this._getDimension(this.handle, "width") - offset;
            if (this.defaultStatus == 'checked') {
                this.handle.css({
                    left: this.rightSide
                });
                this.onLabel.css({
                    width: containerWidth
                });
                this.offSpan.css({
                    marginRight: -this.rightSide
                });
            } else {
                this.onLabel.css({
                    width: 0
                });
                this.onSpan.css({
                    marginLeft: -this.rightSide
                });
            }
            if (this.isDisabled()) {
                return this.container.addClass(this.disabledClass);
            }
        },

        _getDimension: function(elem, dimension) {
            return elem[dimension]();
        },
        _disableSelectionFocus: function() {
            if (S.UA.ie) {
                return $([this.handle, this.offLabel, this.onLabel, this.container]).attr("unselectable", "on");
            }
        },

        /**
         * 事件相关函数
         */
        onMouseDown: function(event) { //设置拖拽的起始位置
            var x;

            event.preventDefault();
            if (this.isDisabled()) {
                return
            }
            //判断是不是右键
            if (event.which == 3) {
                return
            }
            x = event.pageX || event.originalEvent.changedTouches[0].pageX;
            this.currentlyClicking = this.handle;
            this.dragStartPosition = x;
            this.handleLeftOffset = parseInt(this.handle.css('left'), 10) || 0;
        },
        onGlobalMove: function(event) { //判断是否拖拽中
            var x;

            if (this.isDisabled()) {
                return;
            }

            event.preventDefault();
            x = event.pageX || event.originalEvent.changedTouches[0].pageX;


            if (!this.dragging && (Math.abs(this.dragStartPosition - x) > this.dragThreshold)) {
                this.dragging = true;
            }
            return this.onDragMove(event, x);
        },
        onDragMove: function(event, x) { //拖拽过程中的
            var newWidth, p;

            if (this.currentlyClicking !== this.handle) {
                return;
            }
            p = (x + this.handleLeftOffset - this.dragStartPosition) / this.rightSide;
            if (p < 0) {
                p = 0;
            }
            if (p > 1) {
                p = 1;
            }

            newWidth = p * this.rightSide;


            this.handle.css({
                left: newWidth
            });
            this.onLabel.css({
                width: newWidth + parseInt(this.handleSize)/2
            });
            this.offSpan.css({
                marginRight: -newWidth
            });
            return this.onSpan.css({
                marginLeft: -(1 - p) * this.rightSide
            });
        },
        onGlobalUp: function(event) {
            var x;

            if (!this.currentlyClicking) {
                return;
            }
            event.preventDefault();
            x = event.pageX || event.originalEvent.changedTouches[0].pageX;
            this.onDragEnd(event, x);
            return false;
        },
        onDragEnd: function(event, x) {
            var p;

            if (this.currentlyClicking !== this.handle) {
                return;
            }
            if (this.isDisabled()) {
                return;
            }

            if (this.dragging) {
                p = (x - this.dragStartPosition) / this.rightSide;
                this.elem.prop('checked', p >= 0.5);
            } else {
                this.elem.prop('checked', !this.elem.prop('checked'));
            }
            this.currentlyClicking = null;
            this.dragging = null;
            return this._didChange();
        },
        _didChange: function() {
            var new_left;
            if (typeof this.onChange === "function") {
                this.onChange(this.elem, this.elem.prop('checked'));
            }
            if (this.isDisabled()) {
                this.container.addClass(this.disabledClass);
                return false;
            } else {
                this.container.removeClass(this.disabledClass);
            }
           // debugger;
            new_left = this.elem.prop('checked') ? this.rightSide : 0;
            var new_width = this.elem.prop('checked') ? this.rightSide + parseInt(this.handleSize): 0;
            this.handle.animate({
                left: new_left
            }, this.duration);
            this.onLabel.animate({
                width: new_width
            }, this.duration);

        }



    }, {
        ATTRS: /** @lends SlideBtn*/ {
            baseEl: {
                setter: function(el) {
                    return $(el)
                }
            },
            disabled: {
                value: false
            },
            defaultStatus: {
                value: ''
            },
            dragThreshold: {
                value: 5
            },
            handleSize: {
                value: 22
            },
            slideSize: {
                value: 62
            },
            duration: {
                value: 0.2
            },
            onChange:{
                value:function(){},
                setter:function(callback){
                    return callback;
                }
            }
        }
    });
    return SlideBtn;
}, {
    requires: ['node', 'base','event']
});