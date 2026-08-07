//#region src/js/common/functions.js
function addLoadedAttr() {
	if (!document.documentElement.hasAttribute("data-att-preloader-loading")) window.addEventListener("load", function() {
		setTimeout(function() {
			document.documentElement.setAttribute("data-att-loaded", "");
		}, 0);
	});
}
var slideUp = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains("--slide")) {
		target.classList.add("--slide");
		target.style.transitionProperty = "height, margin, padding";
		target.style.transitionDuration = duration + "ms";
		target.style.height = `${target.offsetHeight}px`;
		target.offsetHeight;
		target.style.overflow = "hidden";
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(() => {
			target.hidden = !showmore ? true : false;
			!showmore && target.style.removeProperty("height");
			target.style.removeProperty("padding-top");
			target.style.removeProperty("padding-bottom");
			target.style.removeProperty("margin-top");
			target.style.removeProperty("margin-bottom");
			!showmore && target.style.removeProperty("overflow");
			target.style.removeProperty("transition-duration");
			target.style.removeProperty("transition-property");
			target.classList.remove("--slide");
			document.dispatchEvent(new CustomEvent("slideUpDone", { detail: { target } }));
		}, duration);
	}
};
var slideDown = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains("--slide")) {
		target.classList.add("--slide");
		target.hidden = target.hidden ? false : null;
		showmore && target.style.removeProperty("height");
		let height = target.offsetHeight;
		target.style.overflow = "hidden";
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.transitionProperty = "height, margin, padding";
		target.style.transitionDuration = duration + "ms";
		target.style.height = height + "px";
		target.style.removeProperty("padding-top");
		target.style.removeProperty("padding-bottom");
		target.style.removeProperty("margin-top");
		target.style.removeProperty("margin-bottom");
		window.setTimeout(() => {
			target.style.removeProperty("height");
			target.style.removeProperty("overflow");
			target.style.removeProperty("transition-duration");
			target.style.removeProperty("transition-property");
			target.classList.remove("--slide");
			document.dispatchEvent(new CustomEvent("slideDownDone", { detail: { target } }));
		}, duration);
	}
};
var slideToggle = (target, duration = 500) => {
	if (target.hidden) return slideDown(target, duration);
	else return slideUp(target, duration);
};
var bodyLockStatus = true;
var bodyLockToggle = (delay = 500) => {
	if (document.documentElement.hasAttribute("data-att-scrolllock")) bodyUnlock(delay);
	else bodyLock(delay);
};
var bodyUnlock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll("[data-att-lp]");
		setTimeout(() => {
			lockPaddingElements.forEach((lockPaddingElement) => {
				lockPaddingElement.style.paddingRight = "";
			});
			document.body.style.paddingRight = "";
			document.documentElement.removeAttribute("data-att-scrolllock");
		}, delay);
		bodyLockStatus = false;
		setTimeout(function() {
			bodyLockStatus = true;
		}, delay);
	}
};
var bodyLock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll("[data-att-lp]");
		const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
		lockPaddingElements.forEach((lockPaddingElement) => {
			lockPaddingElement.style.paddingRight = lockPaddingValue;
		});
		document.body.style.paddingRight = lockPaddingValue;
		document.documentElement.setAttribute("data-att-scrolllock", "");
		bodyLockStatus = false;
		setTimeout(function() {
			bodyLockStatus = true;
		}, delay);
	}
};
function dataMediaQueries(array, dataSetValue) {
	const media = Array.from(array).map((item) => {
		const value = item.dataset?.[dataSetValue];
		if (!value) return null;
		return {
			value,
			item
		};
	}).filter(Boolean).map((item) => {
		const [value, type = "max"] = item.value.split(",");
		return {
			value,
			type,
			item
		};
	});
	if (media.length === 0) return [];
	const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
	return [...new Set(breakpointsArray)].map((query) => {
		const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
		const matchMedia = window.matchMedia(mediaQuery);
		return {
			itemsArray: media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType),
			matchMedia
		};
	});
}
//#endregion
//#region src/components/layout/popup/popup.js
var Popup = class {
	constructor(options) {
		let config = {
			logging: true,
			init: true,
			attributeOpenButton: "data-att-popup-link",
			attributeCloseButton: "data-att-popup-close",
			fixElementSelector: "[data-att-lp]",
			attributeMain: "data-att-popup",
			youtubeAttribute: "data-att-popup-youtube",
			youtubePlaceAttribute: "data-att-popup-youtube-place",
			setAutoplayYoutube: true,
			classes: {
				popup: "popup",
				popupContent: "data-att-popup-body",
				popupActive: "data-att-popup-active",
				bodyActive: "data-att-popup-open"
			},
			focusCatch: true,
			closeEsc: true,
			bodyLock: true,
			hashSettings: {
				location: false,
				goHash: false
			},
			on: {
				beforeOpen: function() {},
				afterOpen: function() {},
				beforeClose: function() {},
				afterClose: function() {}
			}
		};
		this.isOpen = false;
		this.targetOpen = {
			selector: false,
			element: false
		};
		this.previousOpen = {
			selector: false,
			element: false
		};
		this.lastClosed = {
			selector: false,
			element: false
		};
		this._dataValue = false;
		this.hash = false;
		this._reopen = false;
		this._selectorOpen = false;
		this.lastFocusEl = false;
		this._focusEl = [
			"a[href]",
			"input:not([disabled]):not([type=\"hidden\"]):not([aria-hidden])",
			"button:not([disabled]):not([aria-hidden])",
			"select:not([disabled]):not([aria-hidden])",
			"textarea:not([disabled]):not([aria-hidden])",
			"area[href]",
			"iframe",
			"object",
			"embed",
			"[contenteditable]",
			"[tabindex]:not([tabindex^=\"-\"])"
		];
		this.options = {
			...config,
			...options,
			classes: {
				...config.classes,
				...options?.classes
			},
			hashSettings: {
				...config.hashSettings,
				...options?.hashSettings
			},
			on: {
				...config.on,
				...options?.on
			}
		};
		this.bodyLock = false;
		this.options.init && this.initPopups();
	}
	initPopups() {
		this.buildPopup();
		this.eventsPopup();
	}
	buildPopup() {}
	eventsPopup() {
		document.addEventListener("click", function(e) {
			const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
			if (buttonOpen) {
				e.preventDefault();
				this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
				if (this._dataValue !== "error") {
					if (!this.isOpen) this.lastFocusEl = buttonOpen;
					this.targetOpen.selector = `${this._dataValue}`;
					this._selectorOpen = true;
					this.open();
					return;
				}
				return;
			}
			if (e.target.closest(`[${this.options.attributeCloseButton}]`) || !e.target.closest(`[${this.options.classes.popupContent}]`) && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
		}.bind(this));
		document.addEventListener("keydown", function(e) {
			if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
			if (this.options.focusCatch && e.which == 9 && this.isOpen) {
				this._focusCatch(e);
				return;
			}
		}.bind(this));
		if (this.options.hashSettings.goHash) {
			window.addEventListener("hashchange", function() {
				if (window.location.hash) this._openToHash();
				else this.close(this.targetOpen.selector);
			}.bind(this));
			if (window.location.hash) this._openToHash();
		}
	}
	open(selectorValue) {
		if (bodyLockStatus) {
			this.bodyLock = document.documentElement.hasAttribute("data-att-scrolllock") && !this.isOpen ? true : false;
			if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
				this.targetOpen.selector = selectorValue;
				this._selectorOpen = true;
			}
			if (this.isOpen) {
				this._reopen = true;
				this.close();
			}
			if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
			if (!this._reopen) this.previousActiveElement = document.activeElement;
			this.targetOpen.element = document.querySelector(`[${this.options.attributeMain}=${this.targetOpen.selector}]`);
			if (this.targetOpen.element) {
				if (this.options.hashSettings.location) {
					this._getHash();
					this._setHash();
				}
				this.options.on.beforeOpen(this);
				document.dispatchEvent(new CustomEvent("beforePopupOpen", { detail: { popup: this } }));
				this.targetOpen.element.setAttribute(this.options.classes.popupActive, "");
				document.documentElement.setAttribute(this.options.classes.bodyActive, "");
				if (!this._reopen) !this.bodyLock && bodyLock();
				else this._reopen = false;
				this.targetOpen.element.setAttribute("aria-hidden", "false");
				this.previousOpen.selector = this.targetOpen.selector;
				this.previousOpen.element = this.targetOpen.element;
				this._selectorOpen = false;
				this.isOpen = true;
				setTimeout(() => {
					this._focusTrap();
				}, 50);
				this.options.on.afterOpen(this);
				document.dispatchEvent(new CustomEvent("afterPopupOpen", { detail: { popup: this } }));
			}
		}
	}
	close(selectorValue) {
		if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") this.previousOpen.selector = selectorValue;
		if (!this.isOpen || !bodyLockStatus) return;
		this.options.on.beforeClose(this);
		document.dispatchEvent(new CustomEvent("beforePopupClose", { detail: { popup: this } }));
		if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) setTimeout(() => {
			this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
		}, 500);
		this.previousOpen.element.removeAttribute(this.options.classes.popupActive);
		this.previousOpen.element.setAttribute("aria-hidden", "true");
		if (!this._reopen) {
			document.documentElement.removeAttribute(this.options.classes.bodyActive);
			!this.bodyLock && bodyUnlock();
			this.isOpen = false;
		}
		this._removeHash();
		if (this._selectorOpen) {
			this.lastClosed.selector = this.previousOpen.selector;
			this.lastClosed.element = this.previousOpen.element;
		}
		this.options.on.afterClose(this);
		document.dispatchEvent(new CustomEvent("afterPopupClose", { detail: { popup: this } }));
		setTimeout(() => {
			this._focusTrap();
		}, 50);
	}
	_getHash() {
		if (this.options.hashSettings.location) this.hash = `#${this.targetOpen.selector}`;
	}
	_openToHash() {
		let classInHash = window.location.hash.replace("#", "");
		document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`);
		if (classInHash) this.open(classInHash);
	}
	_setHash() {
		history.pushState("", "", this.hash);
	}
	_removeHash() {
		history.pushState("", "", window.location.href.split("#")[0]);
	}
	_focusCatch(e) {
		const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
		const focusArray = Array.prototype.slice.call(focusable);
		const focusedIndex = focusArray.indexOf(document.activeElement);
		if (e.shiftKey && focusedIndex === 0) {
			focusArray[focusArray.length - 1].focus();
			e.preventDefault();
		}
		if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
			focusArray[0].focus();
			e.preventDefault();
		}
	}
	_focusTrap() {
		const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
		if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus();
		else focusable[0].focus();
	}
};
document.querySelector("[data-att-popup]") && window.addEventListener("load", () => window.flsPopup = new Popup({}));
//#endregion
//#region src/components/layout/menu/menu.js
function menuInit() {
	document.addEventListener("click", function(e) {
		if (bodyLockStatus && e.target.closest("[data-att-menu]")) {
			bodyLockToggle();
			document.documentElement.toggleAttribute("data-att-menu-open");
		}
	});
}
document.querySelector("[data-att-menu]") && window.addEventListener("load", menuInit);
//#endregion
//#region src/components/layout/header/header.js
addLoadedAttr();
//#endregion
//#region src/components/layout/header/plugins/scroll/scroll.js
function headerScroll() {
	const header = document.querySelector("[data-att-header-scroll]");
	const headerShow = header.hasAttribute("data-att-header-scroll-show");
	const headerShowTimer = header.dataset.attHeaderScrollShow ? header.dataset.attHeaderScrollShow : 500;
	const startPoint = header.dataset.attHeaderScroll ? header.dataset.attHeaderScroll : 1;
	let scrollDirection = 0;
	let timer;
	document.addEventListener("scroll", function(e) {
		const scrollTop = window.scrollY;
		clearTimeout(timer);
		if (scrollTop >= startPoint) {
			!header.classList.contains("--header-scroll") && header.classList.add("--header-scroll");
			if (headerShow) {
				if (scrollTop > scrollDirection) header.classList.contains("--header-show") && header.classList.remove("--header-show");
				else !header.classList.contains("--header-show") && header.classList.add("--header-show");
				timer = setTimeout(() => {
					!header.classList.contains("--header-show") && header.classList.add("--header-show");
				}, headerShowTimer);
			}
		} else {
			header.classList.contains("--header-scroll") && header.classList.remove("--header-scroll");
			if (headerShow) header.classList.contains("--header-show") && header.classList.remove("--header-show");
		}
		scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
	});
}
document.querySelector("[data-att-header-scroll]") && window.addEventListener("load", headerScroll);
//#endregion
//#region src/components/forms/_functions.js
var formValidate = {
	getErrors(form) {
		let error = 0;
		let formRequiredItems = form.querySelectorAll("[required]");
		if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem) => {
			if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) error += this.validateInput(formRequiredItem);
		});
		return error;
	},
	validateInput(formRequiredItem) {
		let error = 0;
		if (formRequiredItem.type === "email") {} else if (formRequiredItem.type === "tel") if (this.phoneTest(formRequiredItem)) {
			this.addError(formRequiredItem);
			this.removeSuccess(formRequiredItem);
			error++;
		} else {
			this.removeError(formRequiredItem);
			this.addSuccess(formRequiredItem);
		}
		else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {} else if (!formRequiredItem.value.trim()) {
			this.addError(formRequiredItem);
			this.removeSuccess(formRequiredItem);
			error++;
		} else {
			this.removeError(formRequiredItem);
			this.addSuccess(formRequiredItem);
		}
		return error;
	},
	addError(formRequiredItem) {
		formRequiredItem.classList.add("--form-error");
		formRequiredItem.parentElement.classList.add("--form-error");
		let inputError = formRequiredItem.parentElement.querySelector("[data-att-form-error]");
		if (inputError) formRequiredItem.parentElement.removeChild(inputError);
		if (formRequiredItem.dataset.attFormErrtext) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div data-att-form-error>${formRequiredItem.dataset.attFormErrtext}</div>`);
	},
	removeError(formRequiredItem) {
		formRequiredItem.classList.remove("--form-error");
		formRequiredItem.parentElement.classList.remove("--form-error");
		if (formRequiredItem.parentElement.querySelector("[data-att-form-error]")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector("[data-att-form-error]"));
	},
	addSuccess(formRequiredItem) {
		formRequiredItem.classList.add("--form-success");
		formRequiredItem.parentElement.classList.add("--form-success");
	},
	removeSuccess(formRequiredItem) {
		formRequiredItem.classList.remove("--form-success");
		formRequiredItem.parentElement.classList.remove("--form-success");
	},
	removeFocus(formRequiredItem) {
		formRequiredItem.classList.remove("--form-focus");
		formRequiredItem.parentElement.classList.remove("--form-focus");
	},
	formClean(form) {
		form.reset();
		setTimeout(() => {
			let inputs = form.querySelectorAll("input,textarea");
			for (let index = 0; index < inputs.length; index++) {
				const el = inputs[index];
				formValidate.removeFocus(el);
				formValidate.removeSuccess(el);
				formValidate.removeError(el);
			}
		}, 0);
	},
	phoneTest(formRequiredItem) {
		const value = formRequiredItem.value.trim();
		return !/^\+?[\d\s()-]{9,20}$/.test(value) || value.replace(/\D/g, "").length < 9;
	}
};
//#endregion
//#region src/components/forms/form/form.js
function formInit() {
	function formSubmit() {
		const forms = document.forms;
		if (forms.length) for (const form of forms) {
			!form.hasAttribute("data-att-form-novalidate") && form.setAttribute("novalidate", true);
			form.addEventListener("submit", function(e) {
				const form = e.target;
				formSubmitAction(form, e);
			});
			form.addEventListener("reset", function(e) {
				const form = e.target;
				formValidate.formClean(form);
			});
		}
		async function formSubmitAction(form, e) {
			if (formValidate.getErrors(form) === 0) {
				if (form.dataset.attForm === "ajax") {
					e.preventDefault();
					const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
					const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
					const formData = new FormData(form);
					form.classList.add("--sending");
					const response = await fetch(formAction, {
						method: formMethod,
						body: formData
					});
					if (response.ok) {
						let responseResult = await response.json();
						form.classList.remove("--sending");
						formSent(form, responseResult);
					} else form.classList.remove("--sending");
				} else if (form.dataset.attForm === "dev") {
					e.preventDefault();
					formSent(form);
				}
			} else e.preventDefault();
		}
		function formSent(form, responseResult = ``) {
			document.dispatchEvent(new CustomEvent("formSent", { detail: { form } }));
			const formWrapper = form.closest(".popup-form");
			if (formWrapper) {
				formWrapper.classList.add("--form-sent");
				clearTimeout(formWrapper.formSentTimer);
				formWrapper.formSentTimer = setTimeout(() => {
					formWrapper.classList.remove("--form-sent");
				}, 1e4);
			}
			formValidate.formClean(form);
		}
	}
	function formFieldsInit() {
		document.body.addEventListener("focusin", function(e) {
			const targetElement = e.target;
			if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
				if (!targetElement.hasAttribute("data-att-form-nofocus")) {
					targetElement.classList.add("--form-focus");
					targetElement.parentElement.classList.add("--form-focus");
				}
				targetElement.hasAttribute("data-att-form-validatenow") && formValidate.removeError(targetElement);
			}
		});
		document.body.addEventListener("focusout", function(e) {
			const targetElement = e.target;
			if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
				if (!targetElement.hasAttribute("data-att-form-nofocus")) {
					targetElement.classList.remove("--form-focus");
					targetElement.parentElement.classList.remove("--form-focus");
				}
				targetElement.hasAttribute("data-att-form-validatenow") && formValidate.validateInput(targetElement);
			}
		});
	}
	formSubmit();
	formFieldsInit();
}
document.querySelector("[data-att-form]") && window.addEventListener("load", formInit);
//#endregion
export { slideToggle as n, slideUp as r, dataMediaQueries as t };
