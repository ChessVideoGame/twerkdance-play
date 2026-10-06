(function () {
  "use strict";

  var unsupported = document.getElementById("td-unsupported");
  var inapp = document.getElementById("td-inapp");
  var canvas = document.getElementById("unity-canvas");
  var progressBar = document.getElementById("td-progress-bar");

  function showUnsupported() {
    document.body.classList.add("td-unsupported");
    if (unsupported) unsupported.hidden = false;
  }

  function isUnsupportedBrowser() {
    var ua = navigator.userAgent || "";
    if (typeof WebAssembly === "undefined") return true;
    try {
      var c = document.createElement("canvas");
      var gl = c.getContext("webgl2");
      if (!gl) return true;
    } catch (e) {
      return true;
    }
    // Safari / iOS WebKit older than 16
    var m = ua.match(/Version\/(\d+)/);
    if (m && parseInt(m[1], 10) < 16 && /Safari/i.test(ua) && !/Chrome|CriOS|Edg/i.test(ua)) {
      return true;
    }
    var ios = ua.match(/OS (\d+)[_\s]/);
    if (ios && parseInt(ios[1], 10) < 16 && /iPhone|iPad|iPod/i.test(ua)) {
      return true;
    }
    return false;
  }

  function isInAppBrowser() {
    var ua = navigator.userAgent || "";
    return /FBAN|FBAV|Instagram|TikTok|BytedanceWebview|Line\//i.test(ua);
  }

  if (isUnsupportedBrowser()) {
    showUnsupported();
    return;
  }

  if (isInAppBrowser() && inapp) {
    inapp.hidden = false;
    var closeBtn = document.getElementById("td-inapp-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        inapp.hidden = true;
      });
    }
  }

  // First tap unlocks audio; never treat as a game input here.
  function unlockAudioOnce() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
      ctx.close();
    } catch (e) { /* ignore */ }
    window.removeEventListener("pointerdown", unlockAudioOnce, true);
    window.removeEventListener("keydown", unlockAudioOnce, true);
  }
  window.addEventListener("pointerdown", unlockAudioOnce, true);
  window.addEventListener("keydown", unlockAudioOnce, true);

  var buildUrl = "Build";
  var loaderUrl = buildUrl + "/a3f9840048920159206742b079511833.loader.js";
  var config = {
    arguments: [],
    dataUrl: buildUrl + "/815b3c1c9ae9ec923eac31bb2fa0d6c2.data",
    frameworkUrl: buildUrl + "/b138b66a4e66ab9f0115e3767afd970c.framework.js",
    codeUrl: buildUrl + "/2d75bad1c9ca88d70585601e2b37af11.wasm",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "Ai-Blockchain",
    productName: "Twerk Dance",
    productVersion: "0.1.0",
  };

  function loadScript(src, onload, onerror) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = onload;
    s.onerror = onerror;
    document.body.appendChild(s);
  }

  loadScript(loaderUrl, function () {
    if (typeof createUnityInstance !== "function") {
      showUnsupported();
      return;
    }
    createUnityInstance(canvas, config, function (progress) {
      if (progressBar) progressBar.style.width = Math.round(100 * progress) + "%";
    }).then(function () {
      document.body.classList.add("td-ready");
    }).catch(function () {
      showUnsupported();
    });
  }, function () {
    showUnsupported();
  });
})();
