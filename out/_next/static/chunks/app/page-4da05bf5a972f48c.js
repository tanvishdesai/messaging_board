(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[974],{218:(t,e,s)=>{Promise.resolve().then(s.bind(s,6975))},6975:(t,e,s)=>{"use strict";s.r(e),s.d(e,{default:()=>p});var n=s(5155),r=s(2115);function i(){return(i=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var s=arguments[e];for(var n in s)Object.prototype.hasOwnProperty.call(s,n)&&(t[n]=s[n])}return t}).apply(this,arguments)}var o={strings:["These are the default values...","You know what you should do?","Use your own!","Have a great day!"],stringsElement:null,typeSpeed:0,startDelay:0,backSpeed:0,smartBackspace:!0,shuffle:!1,backDelay:700,fadeOut:!1,fadeOutClass:"typed-fade-out",fadeOutDelay:500,loop:!1,loopCount:1/0,showCursor:!0,cursorChar:"|",autoInsertCss:!0,attr:null,bindInputFocusEvents:!1,contentType:"html",onBegin:function(t){},onComplete:function(t){},preStringTyped:function(t,e){},onStringTyped:function(t,e){},onLastStringBackspaced:function(t){},onTypingPaused:function(t,e){},onTypingResumed:function(t,e){},onReset:function(t){},onStop:function(t,e){},onStart:function(t,e){},onDestroy:function(t){}},a=new(function(){function t(){}var e=t.prototype;return e.load=function(t,e,s){if(t.el="string"==typeof s?document.querySelector(s):s,t.options=i({},o,e),t.isInput="input"===t.el.tagName.toLowerCase(),t.attr=t.options.attr,t.bindInputFocusEvents=t.options.bindInputFocusEvents,t.showCursor=!t.isInput&&t.options.showCursor,t.cursorChar=t.options.cursorChar,t.cursorBlinking=!0,t.elContent=t.attr?t.el.getAttribute(t.attr):t.el.textContent,t.contentType=t.options.contentType,t.typeSpeed=t.options.typeSpeed,t.startDelay=t.options.startDelay,t.backSpeed=t.options.backSpeed,t.smartBackspace=t.options.smartBackspace,t.backDelay=t.options.backDelay,t.fadeOut=t.options.fadeOut,t.fadeOutClass=t.options.fadeOutClass,t.fadeOutDelay=t.options.fadeOutDelay,t.isPaused=!1,t.strings=t.options.strings.map(function(t){return t.trim()}),t.stringsElement="string"==typeof t.options.stringsElement?document.querySelector(t.options.stringsElement):t.options.stringsElement,t.stringsElement){t.strings=[],t.stringsElement.style.cssText="clip: rect(0 0 0 0);clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px;";var n=Array.prototype.slice.apply(t.stringsElement.children),r=n.length;if(r)for(var a=0;a<r;a+=1)t.strings.push(n[a].innerHTML.trim())}for(var u in t.strPos=0,t.currentElContent=this.getCurrentElContent(t),t.currentElContent&&t.currentElContent.length>0&&(t.strPos=t.currentElContent.length-1,t.strings.unshift(t.currentElContent)),t.sequence=[],t.strings)t.sequence[u]=u;t.arrayPos=0,t.stopNum=0,t.loop=t.options.loop,t.loopCount=t.options.loopCount,t.curLoop=0,t.shuffle=t.options.shuffle,t.pause={status:!1,typewrite:!0,curString:"",curStrPos:0},t.typingComplete=!1,t.autoInsertCss=t.options.autoInsertCss,t.autoInsertCss&&(this.appendCursorAnimationCss(t),this.appendFadeOutAnimationCss(t))},e.getCurrentElContent=function(t){return t.attr?t.el.getAttribute(t.attr):t.isInput?t.el.value:"html"===t.contentType?t.el.innerHTML:t.el.textContent},e.appendCursorAnimationCss=function(t){var e="data-typed-js-cursor-css";if(t.showCursor&&!document.querySelector("["+e+"]")){var s=document.createElement("style");s.setAttribute(e,"true"),s.innerHTML="\n        .typed-cursor{\n          opacity: 1;\n        }\n        .typed-cursor.typed-cursor--blink{\n          animation: typedjsBlink 0.7s infinite;\n          -webkit-animation: typedjsBlink 0.7s infinite;\n                  animation: typedjsBlink 0.7s infinite;\n        }\n        @keyframes typedjsBlink{\n          50% { opacity: 0.0; }\n        }\n        @-webkit-keyframes typedjsBlink{\n          0% { opacity: 1; }\n          50% { opacity: 0.0; }\n          100% { opacity: 1; }\n        }\n      ",document.body.appendChild(s)}},e.appendFadeOutAnimationCss=function(t){var e="data-typed-fadeout-js-css";if(t.fadeOut&&!document.querySelector("["+e+"]")){var s=document.createElement("style");s.setAttribute(e,"true"),s.innerHTML="\n        .typed-fade-out{\n          opacity: 0;\n          transition: opacity .25s;\n        }\n        .typed-cursor.typed-cursor--blink.typed-fade-out{\n          -webkit-animation: 0;\n          animation: 0;\n        }\n      ",document.body.appendChild(s)}},t}()),u=new(function(){function t(){}var e=t.prototype;return e.typeHtmlChars=function(t,e,s){if("html"!==s.contentType)return e;var n,r=t.substring(e).charAt(0);if("<"===r||"&"===r){for(n="<"===r?">":";";t.substring(e+1).charAt(0)!==n&&!(1+ ++e>t.length););e++}return e},e.backSpaceHtmlChars=function(t,e,s){if("html"!==s.contentType)return e;var n,r=t.substring(e).charAt(0);if(">"===r||";"===r){for(n=">"===r?"<":"&";t.substring(e-1).charAt(0)!==n&&!(--e<0););e--}return e},t}()),l=function(){function t(t,e){a.load(this,e,t),this.begin()}var e=t.prototype;return e.toggle=function(){this.pause.status?this.start():this.stop()},e.stop=function(){this.typingComplete||this.pause.status||(this.toggleBlinking(!0),this.pause.status=!0,this.options.onStop(this.arrayPos,this))},e.start=function(){this.typingComplete||this.pause.status&&(this.pause.status=!1,this.pause.typewrite?this.typewrite(this.pause.curString,this.pause.curStrPos):this.backspace(this.pause.curString,this.pause.curStrPos),this.options.onStart(this.arrayPos,this))},e.destroy=function(){this.reset(!1),this.options.onDestroy(this)},e.reset=function(t){void 0===t&&(t=!0),clearInterval(this.timeout),this.replaceText(""),this.cursor&&this.cursor.parentNode&&(this.cursor.parentNode.removeChild(this.cursor),this.cursor=null),this.strPos=0,this.arrayPos=0,this.curLoop=0,t&&(this.insertCursor(),this.options.onReset(this),this.begin())},e.begin=function(){var t=this;this.options.onBegin(this),this.typingComplete=!1,this.shuffleStringsIfNeeded(this),this.insertCursor(),this.bindInputFocusEvents&&this.bindFocusEvents(),this.timeout=setTimeout(function(){0===t.strPos?t.typewrite(t.strings[t.sequence[t.arrayPos]],t.strPos):t.backspace(t.strings[t.sequence[t.arrayPos]],t.strPos)},this.startDelay)},e.typewrite=function(t,e){var s=this;this.fadeOut&&this.el.classList.contains(this.fadeOutClass)&&(this.el.classList.remove(this.fadeOutClass),this.cursor&&this.cursor.classList.remove(this.fadeOutClass));var n=this.humanizer(this.typeSpeed),r=1;!0!==this.pause.status?this.timeout=setTimeout(function(){e=u.typeHtmlChars(t,e,s);var n,i=0,o=t.substring(e);if("^"===o.charAt(0)&&/^\^\d+/.test(o)&&(n=1+(o=/\d+/.exec(o)[0]).length,i=parseInt(o),s.temporaryPause=!0,s.options.onTypingPaused(s.arrayPos,s),t=t.substring(0,e)+t.substring(e+n),s.toggleBlinking(!0)),"`"===o.charAt(0)){for(;"`"!==t.substring(e+r).charAt(0)&&(r++,!(e+r>t.length)););var a=t.substring(0,e),l=t.substring(a.length+1,e+r);t=a+l+t.substring(e+r+1),r--}s.timeout=setTimeout(function(){s.toggleBlinking(!1),e>=t.length?s.doneTyping(t,e):s.keepTyping(t,e,r),s.temporaryPause&&(s.temporaryPause=!1,s.options.onTypingResumed(s.arrayPos,s))},i)},n):this.setPauseStatus(t,e,!0)},e.keepTyping=function(t,e,s){0===e&&(this.toggleBlinking(!1),this.options.preStringTyped(this.arrayPos,this));var n=t.substring(0,e+=s);this.replaceText(n),this.typewrite(t,e)},e.doneTyping=function(t,e){var s=this;this.options.onStringTyped(this.arrayPos,this),this.toggleBlinking(!0),this.arrayPos===this.strings.length-1&&(this.complete(),!1===this.loop||this.curLoop===this.loopCount)||(this.timeout=setTimeout(function(){s.backspace(t,e)},this.backDelay))},e.backspace=function(t,e){var s=this;if(!0!==this.pause.status){if(this.fadeOut)return this.initFadeOut();this.toggleBlinking(!1);var n=this.humanizer(this.backSpeed);this.timeout=setTimeout(function(){e=u.backSpaceHtmlChars(t,e,s);var n=t.substring(0,e);if(s.replaceText(n),s.smartBackspace){var r=s.strings[s.arrayPos+1];s.stopNum=r&&n===r.substring(0,e)?e:0}e>s.stopNum?(e--,s.backspace(t,e)):e<=s.stopNum&&(s.arrayPos++,s.arrayPos===s.strings.length?(s.arrayPos=0,s.options.onLastStringBackspaced(),s.shuffleStringsIfNeeded(),s.begin()):s.typewrite(s.strings[s.sequence[s.arrayPos]],e))},n)}else this.setPauseStatus(t,e,!1)},e.complete=function(){this.options.onComplete(this),this.loop?this.curLoop++:this.typingComplete=!0},e.setPauseStatus=function(t,e,s){this.pause.typewrite=s,this.pause.curString=t,this.pause.curStrPos=e},e.toggleBlinking=function(t){this.cursor&&(this.pause.status||this.cursorBlinking!==t&&(this.cursorBlinking=t,t?this.cursor.classList.add("typed-cursor--blink"):this.cursor.classList.remove("typed-cursor--blink")))},e.humanizer=function(t){return Math.round(Math.random()*t/2)+t},e.shuffleStringsIfNeeded=function(){this.shuffle&&(this.sequence=this.sequence.sort(function(){return Math.random()-.5}))},e.initFadeOut=function(){var t=this;return this.el.className+=" "+this.fadeOutClass,this.cursor&&(this.cursor.className+=" "+this.fadeOutClass),setTimeout(function(){t.arrayPos++,t.replaceText(""),t.strings.length>t.arrayPos?t.typewrite(t.strings[t.sequence[t.arrayPos]],0):(t.typewrite(t.strings[0],0),t.arrayPos=0)},this.fadeOutDelay)},e.replaceText=function(t){this.attr?this.el.setAttribute(this.attr,t):this.isInput?this.el.value=t:"html"===this.contentType?this.el.innerHTML=t:this.el.textContent=t},e.bindFocusEvents=function(){var t=this;this.isInput&&(this.el.addEventListener("focus",function(e){t.stop()}),this.el.addEventListener("blur",function(e){t.el.value&&0!==t.el.value.length||t.start()}))},e.insertCursor=function(){this.showCursor&&(this.cursor||(this.cursor=document.createElement("span"),this.cursor.className="typed-cursor",this.cursor.setAttribute("aria-hidden",!0),this.cursor.innerHTML=this.cursorChar,this.el.parentNode&&this.el.parentNode.insertBefore(this.cursor,this.el.nextSibling)))},t}();let c=t=>{let{isOpen:e,onClose:s,children:r}=t;return e?(0,n.jsx)("div",{className:"fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",children:(0,n.jsxs)("div",{className:"relative bg-gray-800 rounded-lg w-full max-w-2xl",children:[(0,n.jsxs)("div",{className:"sticky top-0 bg-gray-900 rounded-t-lg border-b border-gray-700 p-4 flex justify-between items-center",children:[(0,n.jsx)("h3",{className:"text-lg font-semibold text-white",children:"Full Message"}),(0,n.jsx)("button",{onClick:s,className:"bg-gray-700 text-white hover:bg-red-600 transition-colors duration-200 rounded-lg w-8 h-8 flex items-center justify-center text-xl font-bold","aria-label":"Close modal",children:"\xd7"})]}),(0,n.jsx)("div",{className:"max-h-[calc(80vh-4rem)] overflow-y-auto p-6",children:r})]})}):null},h=t=>{let{content:e}=t,[s,i]=(0,r.useState)(!1),o=e.length>100;return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("div",{className:"flex flex-col bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-105 duration-300",children:[(0,n.jsx)("div",{className:"text-gray-200 text-lg line-clamp-4",style:{minHeight:"120px",maxHeight:"300px",overflowY:"hidden"},children:e}),o&&(0,n.jsx)("button",{onClick:()=>i(!0),className:"mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium focus:outline-none",children:"Read More"})]}),(0,n.jsx)(c,{isOpen:s,onClose:()=>i(!1),children:(0,n.jsx)("div",{className:"text-gray-200 text-lg whitespace-pre-wrap",children:e})})]})};function p(){let[t,e]=(0,r.useState)(""),[s,i]=(0,r.useState)([]),o=(0,r.useRef)(null);return(0,r.useEffect)(()=>{let t=new l(o.current,{strings:["make films","travel","leave a legacy","write"],typeSpeed:80,loop:!0});return()=>{t.destroy()}},[]),(0,r.useEffect)(()=>{fetch("/api/posts").then(t=>t.json()).then(t=>{Array.isArray(t)?i([...t].reverse()):console.error("Received data is not an array:",t)}).catch(t=>console.error("Error fetching posts:",t))},[]),(0,n.jsx)("main",{className:"min-h-screen bg-gradient-to-b from-gray-900 to-black",children:(0,n.jsxs)("div",{className:"container px-4 mx-auto",children:[(0,n.jsx)("section",{className:"py-20 lg:py-32 flex flex-col lg:flex-row items-center justify-between",children:(0,n.jsxs)("div",{className:"w-full lg:w-1/2 text-center lg:text-left",children:[(0,n.jsxs)("h1",{className:"text-4xl lg:text-5xl font-bold text-gray-200 leading-tight",children:[(0,n.jsx)("span",{className:"text-blue-500",children:"Before I Die"}),",",(0,n.jsx)("br",{}),"I want to ",(0,n.jsx)("span",{className:"font-semibold text-blue-400",children:(0,n.jsx)("span",{ref:o})})]}),(0,n.jsxs)("div",{className:"mt-12 w-full max-w-xl mx-auto lg:mx-0",children:[(0,n.jsx)("textarea",{value:t,onChange:t=>e(t.target.value),placeholder:"What do you want to do before you die?",className:"w-full p-4 text-lg bg-gray-800/50 backdrop-blur-sm text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400",rows:3}),(0,n.jsx)("button",{onClick:()=>{t.trim()&&fetch("/api/posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:t})}).then(t=>t.json()).then(()=>{fetch("/api/posts").then(t=>t.json()).then(t=>{Array.isArray(t)?i([...t].reverse()):console.error("Received data is not an array:",t)}),e("")}).catch(t=>console.error("Error posting content:",t))},className:"w-full mt-4 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 font-medium",children:"Share Your Dream"})]})]})}),(0,n.jsx)("section",{className:"pb-20",children:(0,n.jsx)("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center",children:s.length>0?s.map((t,e)=>(0,n.jsx)(h,{content:t},e)):(0,n.jsx)("div",{className:"text-center text-xl text-gray-400 col-span-full",children:"Be the first to share your dream"})})})]})})}}},t=>{var e=e=>t(t.s=e);t.O(0,[441,517,358],()=>e(218)),_N_E=t.O()}]);