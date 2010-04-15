/* Xero Login Popup 

   Shows Xero OAuth Authentication in a Javascript popup. Requires Prototype.
   
   Homepage: http://github.com/codetocustomer/XeroLogin
   
   For examples, check out MinuteDock (http://minutedock.com), or the included example.html */

XeroLogin = Class.create({
  
  xero_login_url : "YOUR_XERO_LOGIN_URL",
  
  initialize: function(xero_access_expiry, callback, opts) {
    
    window.xero_login      = this; // for easy invocation
    
    this.opts = opts || {};
    this.login_callback    = callback || function() { window.location.reload(); };
    
    if (xero_access_expiry != false) this.xero_access_expiry = Date.parse(xero_access_expiry)
    
    this.loading_window = $("xero_loading");
    
    this.login();
    
  },
  
  login: function() {
    
    this.loading_window.down(".login_text").show();
    this.loading_window.down(".progress_text").hide();
    
    this.show_loading_window();

    if (this.logged_in_to_xero()) this.logged_in();
    else this.show_login_window();
    
  },
  
  logged_in_to_xero: function() {
    
    return (this.xero_access_expiry && this.xero_access_expiry > new Date());
    
  },
  
  show_login_window: function() {
    
    // reset the state of our two loading window states...
    this.loading_window.down("#reopen_or_cancel").hide();
    this.loading_window.down("#info").show();
    
    var width  = 970;
    var height = 650;

    this.login_window = window.open(this.xero_login_url, "xero_login_popup", 
      "left=\#{left},top=\#{top},width=\#{width},height=\#{height},location=yes,toolbar=0,status=0,menubar=0,scrollbars=0".interpolate({ 
        left:   (document.viewport.getWidth() - width) / 2, 
        top:    (document.viewport.getHeight() - height) / 2,
        width:  width, 
        height: height })
    );
    
    if (this.login_window) { // IE8 doesn't return a value for window.open...
    
      // thanks, quirksmode :)
      if (window.focus) {this.login_window.focus()}
    
      this.window_poller = new PeriodicalExecuter(function(pe) {
    
        if (this.login_window.closed) {
          this.show_reopen_or_cancel();
          pe.stop();
        }
      
      }.bind(this), 1);
    
    }
    
    return;
    
  },
  
  logged_in : function() {
    
    d = new Date();
    this.xero_access_expiry = d.setDate(d.getMinutes() + 29);
    
    if (this.window_poller) this.window_poller.stop();
    
    if (this.login_callback.call()) this.hide_loading_window();
    
    this.loading_window.down(".login_text").hide();
    this.loading_window.down(".progress_text").show();
 
  },
  
  show_loading_window: function() {
    
    this.overlay = this.create_overlay();
    this.loading_window.centerInWindow().show();
    
    window.onresize = function() { this.loading_window.centerInWindow() }.bind(this);
    
  },
  
  hide_loading_window: function() {
    
    this.overlay.remove();
    this.loading_window.hide();
    
    window.onresize = "";
    
  },
  
  show_reopen_or_cancel: function() {
    
    this.loading_window.down("#reopen_or_cancel").show();
    this.loading_window.down("#info").hide();
    
  },
  
  cancel: function() {
    
    this.hide_loading_window();
    
    if (this.opts.onCancel) {
      this.opts.onCancel.call();
    }
    
  },
  
  create_overlay: function() {
    
    overlay = new Element("div", { "class" : "modal_overlay" }).setStyle({ opacity: 0.7 });
    
    $(document.body).insert({ bottom : overlay });
    
    return overlay;
  }
  
  
});

// quick utility function for centering our modals :)
Element.addMethods({
  centerInWindow: function(element) {
    
    var window_width = document.viewport.getDimensions().width;
    var window_height = document.viewport.getDimensions().height;
    
    var element_width = element.getDimensions().width;
    var element_height = element.getDimensions().height;
    
    element.setStyle({
      top  : Math.floor((window_height - element_height) / 2) + "px", 
      left : Math.floor((window_width - element_width) / 2) + "px"
    });
    
    return element;
  }
});