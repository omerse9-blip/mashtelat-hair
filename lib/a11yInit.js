// הגדרות סרגל הנגישות: מפתח האחסון, והסקריפט שרץ בראש הדף כדי להחיל את ההגדרות לפני הציור הראשון
export const A11Y_KEY = "a11y-prefs-v1";

export const A11Y_INIT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem("${A11Y_KEY}")||"{}");var h=document.documentElement;if(p.zoom>0){h.setAttribute("data-a11y-zoom",String(p.zoom));}if(p.contrast){h.classList.add("a11y-contrast");}if(p.links){h.classList.add("a11y-links");}if(p.font){h.classList.add("a11y-font");}if(p.motion){h.setAttribute("data-a11y-motion","off");}}catch(e){}})();`;
