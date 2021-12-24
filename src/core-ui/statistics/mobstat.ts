export let BaiduMobStat = (function () {
    let invokeNatvieMethod = function (action, obj) {
      if (window["webkit"]) {
        window["webkit"].messageHandlers.bmtj.postMessage({
          action: action,
          obj: obj,
        });
      } else {
        // call native method
        let cmd = {
          action: action,
          obj: obj,
        };
  
        let iFrame: any = document.createElement("iframe");
        iFrame.setAttribute("src", "bmtj:" + JSON.stringify(cmd));
        iFrame.setAttribute("style", "display:none;");
        iFrame.setAttribute("height", "0px");
        iFrame.setAttribute("width", "0px");
        iFrame.setAttribute("frameborder", "0");
  
        document.body.appendChild(iFrame);
  
        // 发起请求后这个iFrame就没用了，所以把它从dom上移除掉
        iFrame.parentNode!.removeChild(iFrame);
        iFrame = null;
      }
    };
  
    return {
      onPageStart: function (page) {
        let obj = {
          page: page,
        };
  
        invokeNatvieMethod("onPageStart", obj);
      },
      onPageEnd: function (page) {
        let obj = {
          page: page,
        };
  
        invokeNatvieMethod("onPageEnd", obj);
      },
      onEvent: function (id, label) {
        let obj = {
          event_id: id,
          label: label,
        };
  
        invokeNatvieMethod("onEvent", obj);
      },
      onEventStart: function (id, label) {
        let obj = {
          event_id: id,
          label: label,
        };
  
        invokeNatvieMethod("onEventStart", obj);
      },
      onEventEnd: function (id, label) {
        let obj = {
          event_id: id,
          label: label,
        };
  
        invokeNatvieMethod("onEventEnd", obj);
      },
      onEventDuration: function (id, label, duration) {
        let obj = {
          event_id: id,
          label: label,
          duration: typeof duration === "number" ? duration : 0,
        };
  
        invokeNatvieMethod("onEventDuration", obj);
      },
      onEventWithAttributes: function (id, label, attributes) {
        let obj = {
          event_id: id,
          label: label,
          attributes: typeof attributes === "object" ? attributes : {},
        };
  
        invokeNatvieMethod("onEventWithAttributes", obj);
      },
      onEventEndWithAttributes: function (id, label, attributes) {
        let obj = {
          event_id: id,
          label: label,
          attributes: typeof attributes === "object" ? attributes : {},
        };
  
        invokeNatvieMethod("onEventEndWithAttributes", obj);
      },
      onEventDurationWithAttributes: function (id, label, duration, attributes) {
        let obj = {
          event_id: id,
          label: label,
          duration: typeof duration === "number" ? duration : 0,
          attributes: typeof attributes === "object" ? attributes : {},
        };
  
        invokeNatvieMethod("onEventDurationWithAttributes", obj);
      },
    };
  })();
  