(this.webpackJsonp=this.webpackJsonp||[]).push([[18,22],{15:function(e,t,s){"use strict";s.r(t),s.d(t,"RootScope",(function(){return r}));var i=s(57),n=s(27);class r extends i.a{constructor(){super(),this.overlaysActive=0,this.myId=0,this.idle={isIDLE:!0,deactivated:!1,focusPromise:Promise.resolve(),focusResolve:()=>{}},this.connectionStatus={},this.peerId=0,this.config={forwarded_count_max:100,edit_time_limit:172800,pinned_dialogs_count_max:5,pinned_infolder_count_max:100,message_length_max:4096,caption_length_max:1024},this.addEventListener("peer_changed",e=>{this.peerId=e}),this.addEventListener("user_auth",e=>{this.myId=e.id}),this.addEventListener("connection_status_change",e=>{const t=e;this.connectionStatus[e.name]=t}),this.addEventListener("idle",e=>{e?this.idle.focusPromise=new Promise(e=>{this.idle.focusResolve=e}):this.idle.focusResolve()})}setThemeListener(){try{const e=window.matchMedia("(prefers-color-scheme: dark)"),t=()=>{this.systemTheme=e.matches?"night":"day",this.myId?this.dispatchEvent("theme_change"):this.setTheme()};"addEventListener"in e?e.addEventListener("change",t):"addListener"in e&&e.addListener(t),t()}catch(e){}}setTheme(){const e="night"===this.getTheme().name,t=document.head.querySelector('[name="color-scheme"]');t&&t.setAttribute("content",e?"dark":"light"),document.documentElement.classList.toggle("night",e)}get isOverlayActive(){return this.overlaysActive>0}set isOverlayActive(e){this.overlaysActive+=e?1:-1,this.dispatchEvent("overlay_toggle",this.isOverlayActive)}getTheme(e=("system"===this.settings.theme?this.systemTheme:this.settings.theme)){return this.settings.themes.find(t=>t.name===e)}}const o=new r;n.a.rootScope=o,t.default=o},17:function(e,t,s){"use strict";s.r(t),s.d(t,"ripple",(function(){return a}));var i=s(5),n=s(99),r=s(1),o=s(15);let c=0;function a(e,t=(()=>Promise.resolve()),s=null,a=!1){if(e.querySelector(".c-ripple"))return;e.classList.add("rp");let l=document.createElement("div");l.classList.add("c-ripple");let d;e.classList.contains("rp-square")&&l.classList.add("is-square"),e[a?"prepend":"append"](l);const u=(e,i)=>{const o=Date.now(),a=document.createElement("div"),u=c++,h=1e3*+window.getComputedStyle(l).getPropertyValue("--ripple-duration").replace("s","");d=()=>{let e=Date.now()-o;const t=()=>{n.a.mutate(()=>{a.remove()}),s&&s(u)};if(e<h){let s=Math.max(h-e,h/2);setTimeout(()=>a.classList.add("hiding"),Math.max(s-h/2,0)),setTimeout(t,s)}else a.classList.add("hiding"),setTimeout(t,h/2);r.isTouchSupported||window.removeEventListener("contextmenu",d),d=null,m=!1},t&&t(u),window.requestAnimationFrame(()=>{const t=l.getBoundingClientRect();a.classList.add("c-ripple__circle");const s=e-t.left,n=i-t.top,r=Math.sqrt(Math.pow(Math.abs(n-t.height/2)+t.height/2,2)+Math.pow(Math.abs(s-t.width/2)+t.width/2,2)),o=s-r/2,c=n-r/2;a.style.width=a.style.height=r+"px",a.style.left=o+"px",a.style.top=c+"px",l.append(a)})},h=t=>t.target!==e&&(["BUTTON","A"].includes(t.target.tagName)||Object(i.a)(t.target,"c-ripple")!==l);let m=!1;if(r.isTouchSupported){let t=()=>{d&&d()};e.addEventListener("touchstart",s=>{if(!o.default.settings.animationsEnabled)return;if(s.touches.length>1||m||h(s))return;m=!0;let{clientX:i,clientY:n}=s.touches[0];u(i,n),e.addEventListener("touchend",t,{once:!0}),window.addEventListener("touchmove",s=>{s.cancelBubble=!0,s.stopPropagation(),t(),e.removeEventListener("touchend",t)},{once:!0})},{passive:!0})}else e.addEventListener("mousedown",t=>{if(![0,2].includes(t.button))return;if(!o.default.settings.animationsEnabled)return;if("0"===e.dataset.ripple||h(t))return;if(m)return void(m=!1);let{clientX:s,clientY:i}=t;u(s,i),window.addEventListener("mouseup",d,{once:!0,passive:!0}),window.addEventListener("contextmenu",d,{once:!0,passive:!0})},{passive:!0})}},27:function(e,t,s){"use strict";s.d(t,"a",(function(){return n}));const i=s(53).a.debug,n="undefined"!=typeof window?window:self;t.b=i},43:function(e,t,s){"use strict";let i,n;function r(e){i?i.push(e):(i=[e],requestAnimationFrame(()=>{const e=i;i=void 0,e.forEach(e=>e())}))}function o(){return n||(n=new Promise(requestAnimationFrame),n.then(()=>{n=void 0}),n)}function c(){return new Promise(e=>{r(()=>{r(e)})})}s.d(t,"b",(function(){return r})),s.d(t,"c",(function(){return o})),s.d(t,"a",(function(){return c}))},44:function(e,t,s){"use strict";function i(){let e={isFulfilled:!1,isRejected:!1,notify:()=>{},notifyAll:(...t)=>{e.lastNotify=t,e.listeners.forEach(e=>e(...t))},lastNotify:void 0,listeners:[],addNotifyListener:t=>{e.lastNotify&&t(...e.lastNotify),e.listeners.push(t)}},t=new Promise((s,i)=>{e.resolve=e=>{t.isFulfilled||(t.isFulfilled=!0,s(e))},e.reject=(...e)=>{t.isRejected||(t.isRejected=!0,i(...e))}});return t.finally(()=>{t.notify=null,t.listeners.length=0,t.lastNotify=null,t.cancel&&(t.cancel=()=>{})}),Object.assign(t,e),t}s.d(t,"a",(function(){return i}))},53:function(e,t,s){"use strict";const i={test:location.search.indexOf("test=1")>0,debug:location.search.indexOf("debug=1")>0,http:!1,ssl:!0,multipleConnections:!0,asServiceWorker:!1};t.a=i},57:function(e,t,s){"use strict";s.d(t,"a",(function(){return i}));class i{constructor(e){this._constructor(e)}_constructor(e=!1){this.reuseResults=e,this.listeners={},this.listenerResults={}}addEventListener(e,t,s){var i,n;(null!==(i=this.listeners[e])&&void 0!==i?i:this.listeners[e]=[]).push({callback:t,options:s}),this.listenerResults.hasOwnProperty(e)&&(t(...this.listenerResults[e]),null===(n=s)||void 0===n?void 0:n.once)&&this.listeners[e].pop()}addMultipleEventsListeners(e){for(const t in e)this.addEventListener(t,e[t])}removeEventListener(e,t,s){this.listeners[e]&&this.listeners[e].findAndSplice(e=>e.callback===t)}dispatchEvent(e,...t){this.reuseResults&&(this.listenerResults[e]=t);const s=[],i=this.listeners[e];if(i){i.slice().forEach(n=>{var r;-1!==i.findIndex(e=>e.callback===n.callback)&&(s.push(n.callback(...t)),(null===(r=n.options)||void 0===r?void 0:r.once)&&this.removeEventListener(e,n.callback))})}return s}cleanup(){this.listeners={},this.listenerResults={}}}},84:function(e,t,s){"use strict";function i(e){return null==e?void 0:e.isConnected}s.d(t,"a",(function(){return i}))},99:function(e,t,s){"use strict";var i=s(43),n=s(44),r=s(27),o=s(84);const c=new class{constructor(){this.promises={},this.raf=i.b.bind(null),this.scheduled=!1}do(e,t){let s=this.promises[e];return s||(this.scheduleFlush(),s=this.promises[e]=Object(n.a)()),void 0!==t&&s.then(()=>t()),s}measure(e){return this.do("read",e)}mutate(e){return this.do("write",e)}mutateElement(e,t){const s=Object(o.a)(e)?this.mutate():Promise.resolve();return void 0!==t&&s.then(()=>t()),s}scheduleFlush(){this.scheduled||(this.scheduled=!0,this.raf(()=>{this.promises.read&&this.promises.read.resolve(),this.promises.write&&this.promises.write.resolve(),this.scheduled=!1,this.promises={}}))}};r.a&&(r.a.sequentialDom=c),t.a=c}}]);
//# sourceMappingURL=18.5254cd580ebeef66d533.chunk.js.map