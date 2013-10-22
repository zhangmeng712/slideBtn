## 综述

slideBtn是支持PC/移动端的拖拽开关组件，样式可定制，支持点击、拖拽切换开关状态。禁用js的手机端自动降级为input checkbox。

* 版本：1.0
* 作者：思霏
* demo：[http://gallery.kissyui.com/slideBtn/1.0/demo/index.html](http://gallery.kissyui.com/slideBtn/1.0/demo/index.html)

## 初始化组件

    S.use('gallery/slideBtn/1.0/index', function (S, SlideBtn) {
         var slideBtn = new SlideBtn({
            baseEl:'#J_open',//绑定input elem的
            defaultStatus:'checked',//初始状态‘checked’代表开关打开；
            disabled:false,//是否是disabled，
            duration:0.1,//拖拽开关变化速度
            onChange:function(elem,status){ //change时暴露的回调方法
                S.one('#J_result').html(status);
            }
          });
    })

## API说明
* 参数说明

    baseEl{HTMLelement}绑定的input的元素 支持kissy的选择器

    disabled{Boolean}是否禁用开关

    defaultStatus{String}初始状态开关状态；开关打开：'checked'

    duration{String}滑动速度，单位为秒，默认为0.2

    onChange{Function}开关切换时的回调函数

    handleSize{Number}可配置不同css主题的开关拖动按钮宽度；

    slideSize{Number}可配置不同css主题的开关背景的宽度；

* 事件

    getSlideStatus获得当前开关的状态；开关打开返回true；关闭返回false

    refresh切换开关状态
    





    