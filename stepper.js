var Stepper = function($item, opts) {
    this.opts = $.extend({
        prevButtonSel : '#stepper-prev',
        nextButtonSel : '#stepper-next',
        currentIndex : 0,
        autoStart : true,
        nextable : false,
        prevable : true,
        circularMode : false,
        hideFirstAndLastButton : true,
        lateBinding : false,
        stepHintMode : false,
        stepHintSel : '.stepper-hint',
        stepHintFormat : 'Step {current}/{total}',
        stepCallback : false // need nextCallbacks array for functions
    }, opts);

    this.$item = $item;
    this.itemSize = this.$item.size();
    this.currentIndex = this.opts.currentIndex;
    this.nextable = this.opts.nextable;
    this.prevable = this.opts.prevable;
    this.stepCallback = this.opts.stepCallback;

    var that = this;

    if ( this.opts.autoStart ) {
        this.setStepHint();
        this.hideAndShowSlides();
    }

    // TODO: it's not finished, need to add some judge part into next() / prev() 
    if ( this.opts.circularMode ) {
        this.nextable = true;
        this.prevable = true;
    }

    if ( this.opts.hideFirstAndLastButton ) {
        this.hidePrevButton();
    }

    if ( !this.opts.lateBinding ) {
        this.bindClickEvent();
    }

    if ( this.opts.stepCallback ) {
        // we will use this callback all the time
        if ( this.opts.nextCallbacks.length === 1 ) {

            this.nextCallbacks = this.opts.nextCallbacks;
        }
        // n items with n - 1 partitions
        else if ( this.opts.nextCallbacks.length !== this.itemSize - 1 ) {

            throw 'Your callback size is different with your step size !';
        }
        else {

            this.nextCallbacks = this.opts.nextCallbacks;
        }
    }
};

Stepper.prototype = {

    isNextable : function() {
        return ( this.nextable === true ) ? true : false;
    },

    isPrevable : function() {
        return ( this.prevable === true ) ? true : false;
    },
    
    isFirstSlide : function() {
        return ( this.currentIndex === 0 ) ? true : false;
    },

    isLastSlide : function () {
        return ( this.currentIndex === this.itemSize - 1 ) ? true : false;
    },

    isLateBinding : function() {
        return this.opts.lateBinding;
    },

    hasCallback : function() {
        return ( this.stepCallback === true ) ? true : false;
    },

    increaseIndex : function() {
        if (this.currentIndex >= this.itemSize - 1) {
            // TODO: need to judge with 'round' attribute
            // Do nothing now
        }
        else {
            this.currentIndex ++;
        }
    },

    decreaseIndex : function() {
        if (this.currentIndex <= 0 ) {
            // TODO: need to judge with 'round' attribute
            // this.currentIndex = this.itemSize - 1;
            // Do nothing now
        }
        else {
            this.currentIndex --;
        }
    },

    hideAndShowSlides : function() {
        var i = this.currentIndex;

        this.$item.eq(i).fadeIn();
        this.$item.not(':eq('+ i +')').hide();
    },

    resetNextClickEvent : function( id ) {
        var old = this.prevButtonSel;
        $(old).unbind('click.stepperNext');

        this.nextButtonSel = id;
        this.bindNextClickEvent();
    },

    resetPrevClickEvent : function( id ) {
        var old = this.prevButtonSel;
        $(old).unbind('click.stepperPrev');

        this.nextButtonSel = id;
        this.bindPrevClickEvent();
    },

    bindClickEvent : function() {
        this.bindPrevClickEvent();
        this.bindNextClickEvent();
    },

    bindLateClickEvent : function() {
        this.opts.lateBinding = false; 
        this.bindClickEvent();
    },

    bindNextClickEvent : function() {
        var that = this;
        var sel = this.opts.nextButtonSel;

        $.each( sel, function(i, id) {
            $( id ).bind('click.stepperNext',  function() {
                that.next();
            });
        });
    },

    bindPrevClickEvent : function() {
        var that = this;
        var sel = this.opts.prevButtonSel;

        $.each( sel, function(i, id) {
            $( id ).bind('click.stepperPrev',  function() {
                that.prev();
            });
        });
    },

    next : function() {

        if ( this.hasCallback() ) {

            // block when not passed
            if (!this.execAftCallback()) {
                return false;
            }
        }

        if ( this.isNextable() ) {

            this.increaseIndex(); 
            this.showPrevButton();
            this.hideAndShowSlides();

            // block nextable until next pass() is triggered
            if ( !this.opts.circularMode ) {
                this.nextable = false;
            }

            this.prevable = true;
        }

        if ( this.isLastSlide() ) {

            this.nextable = false;

            if ( this.opts.hideFirstAndLastButton ) {
                this.hideNextButton();
            }
        }

        this.roundAction();
    },

    prev : function() {
        if ( this.isPrevable() ) {

            this.decreaseIndex();  
            this.showNextButton();
            this.hideAndShowSlides();

            this.nextable = true;
        }

        if ( this.isFirstSlide() ) {

            this.prevable = false;

            if (  this.opts.hideFirstAndLastButton ) {
                this.hidePrevButton();
            }
        }

        this.roundAction();
    },

    /*
     *  var stepper = new Stepper( $('.slides') );
     *  
     *  if ( blahblah is true ) {
     *      slides.pass();
     *  }
     *
     *  You can freely use stepper.pass() if there is a validation event before
     */
    pass : function() {
        this.nextable = true;
    },

    roundAction : function() {
        this.setStepHint();
    },
    
    hideNextButton : function() {
        $( this.opts.nextButtonSel[0] ).hide();
    },

    showNextButton : function() {
        $( this.opts.nextButtonSel[0] ).show(); 
    },

    hidePrevButton : function() {
        var last = this.opts.prevButtonSel.length - 1;
        $( this.opts.prevButtonSel[ last ] ).hide(); 
    },

    showPrevButton : function() {
        var last = this.opts.prevButtonSel.length - 1;
        $( this.opts.prevButtonSel[ last ] ).show();
    },

    setStepHint : function() {
        if ( this.opts.stepHintMode ) {

            var hint = this.opts.stepHintFormat;
            hint = hint.replace(/\{current\}/, this.currentIndex + 1);
            hint = hint.replace(/\{total\}/, this.itemSize);

            $( this.opts.stepHintSel).html( hint );
        }
    },

    setStepCallback : function() {
                
    },

    execAftCallback : function() {
        var cb;

        if ( this.nextCallbacks.length === 1 ) {
            cb = this.nextCallbacks[0];
        }
        else {
            cb = this.nextCallbacks[ this.currentIndex ];
        }

        if ( cb !== null && cb !== undefined ) {
            return cb();
        }
    }
};
