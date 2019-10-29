/**!
* tippy.js v5.0.3
* (c) 2017-2019 atomiks
* MIT License
*/
var tippy = (function (Popper) {
  'use strict';

  Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

  var css = ".tippy-tooltip[data-animation=fade][data-state=hidden]{opacity:0}.tippy-iOS{cursor:pointer!important;-webkit-tap-highlight-color:transparent}.tippy-popper{pointer-events:none;max-width:calc(100vw - 10px);transition-timing-function:cubic-bezier(.165,.84,.44,1);transition-property:transform}.tippy-tooltip{position:relative;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;background-color:#333;transition-property:visibility,opacity,transform;outline:0}.tippy-tooltip[data-placement^=top]>.tippy-arrow{border-width:8px 8px 0;border-top-color:#333;margin:0 3px;transform-origin:50% 0;bottom:-7px}.tippy-tooltip[data-placement^=bottom]>.tippy-arrow{border-width:0 8px 8px;border-bottom-color:#333;margin:0 3px;transform-origin:50% 7px;top:-7px}.tippy-tooltip[data-placement^=left]>.tippy-arrow{border-width:8px 0 8px 8px;border-left-color:#333;margin:3px 0;transform-origin:0 50%;right:-7px}.tippy-tooltip[data-placement^=right]>.tippy-arrow{border-width:8px 8px 8px 0;border-right-color:#333;margin:3px 0;transform-origin:7px 50%;left:-7px}.tippy-tooltip[data-interactive][data-state=visible]{pointer-events:auto}.tippy-tooltip[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{position:absolute;border-color:transparent;border-style:solid}.tippy-content{padding:5px 9px}";

  /**
   * Injects a string of CSS styles to a style node in <head>
   */
  function injectCSS(css) {
    var style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-tippy-stylesheet', '');
    var head = document.head;
    var firstStyleOrLinkTag = document.querySelector('head>style,head>link');

    if (firstStyleOrLinkTag) {
      head.insertBefore(style, firstStyleOrLinkTag);
    } else {
      head.appendChild(style);
    }
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  var PASSIVE = {
    passive: true
  };
  var ROUND_ARROW = '<svg viewBox="0 0 18 7" xmlns="http://www.w3.org/2000/svg"><path d="M0 7s2.021-.015 5.253-4.218C6.584 1.051 7.797.007 9 0c1.203-.007 2.416 1.035 3.761 2.782C16.012 7.005 18 7 18 7H0z"/></svg>';
  var IOS_CLASS = "tippy-iOS";
  var POPPER_CLASS = "tippy-popper";
  var TOOLTIP_CLASS = "tippy-tooltip";
  var CONTENT_CLASS = "tippy-content";
  var BACKDROP_CLASS = "tippy-backdrop";
  var ARROW_CLASS = "tippy-arrow";
  var SVG_ARROW_CLASS = "tippy-svg-arrow";
  var POPPER_SELECTOR = "." + POPPER_CLASS;
  var TOOLTIP_SELECTOR = "." + TOOLTIP_CLASS;
  var CONTENT_SELECTOR = "." + CONTENT_CLASS;
  var ARROW_SELECTOR = "." + ARROW_CLASS;
  var SVG_ARROW_SELECTOR = "." + SVG_ARROW_CLASS;

  var currentInput = {
    isTouch: false
  };
  var lastMouseMoveTime = 0;
  /**
   * When a `touchstart` event is fired, it's assumed the user is using touch
   * input. We'll bind a `mousemove` event listener to listen for mouse input in
   * the future. This way, the `isTouch` property is fully dynamic and will handle
   * hybrid devices that use a mix of touch + mouse input.
   */

  function onDocumentTouchStart() {
    if (currentInput.isTouch) {
      return;
    }

    currentInput.isTouch = true;

    if (window.performance) {
      document.addEventListener('mousemove', onDocumentMouseMove);
    }
  }
  /**
   * When two `mousemove` event are fired consecutively within 20ms, it's assumed
   * the user is using mouse input again. `mousemove` can fire on touch devices as
   * well, but very rarely that quickly.
   */

  function onDocumentMouseMove() {
    var now = performance.now();

    if (now - lastMouseMoveTime < 20) {
      currentInput.isTouch = false;
      document.removeEventListener('mousemove', onDocumentMouseMove);
    }

    lastMouseMoveTime = now;
  }
  /**
   * When an element is in focus and has a tippy, leaving the tab/window and
   * returning causes it to show again. For mouse users this is unexpected, but
   * for keyboard use it makes sense.
   * TODO: find a better technique to solve this problem
   */

  function onWindowBlur() {
    var _document = document,
        activeElement = _document.activeElement;
    var instance = activeElement._tippy;

    if (activeElement && activeElement.blur && instance && !instance.state.isVisible) {
      activeElement.blur();
    }
  }
  /**
   * Adds the needed global event listeners
   */

  function bindGlobalEventListeners() {
    document.addEventListener('touchstart', onDocumentTouchStart, _extends({}, PASSIVE, {
      capture: true
    }));
    window.addEventListener('blur', onWindowBlur);
  }

  var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  var ua = isBrowser ? navigator.userAgent : '';
  var isIE = /MSIE |Trident\//.test(ua);
  var isUCBrowser = /UCBrowser\//.test(ua);
  var isIOS = isBrowser && /iPhone|iPad|iPod/.test(navigator.platform);
  function updateIOSClass(isAdd) {
    var shouldAdd = isAdd && isIOS && currentInput.isTouch;
    document.body.classList[shouldAdd ? 'add' : 'remove'](IOS_CLASS);
  }

  var version = "5.0.3";

  var defaultProps = {
    allowHTML: true,
    animation: 'fade',
    appendTo: function appendTo() {
      return document.body;
    },
    aria: 'describedby',
    arrow: true,
    boundary: 'scrollParent',
    content: '',
    delay: 0,
    distance: 10,
    duration: [300, 250],
    flip: true,
    flipBehavior: 'flip',
    flipOnUpdate: false,
    hideOnClick: true,
    ignoreAttributes: false,
    inertia: false,
    interactive: false,
    interactiveBorder: 2,
    interactiveDebounce: 0,
    lazy: true,
    maxWidth: 350,
    multiple: false,
    offset: 0,
    onAfterUpdate: function onAfterUpdate() {},
    onBeforeUpdate: function onBeforeUpdate() {},
    onCreate: function onCreate() {},
    onDestroy: function onDestroy() {},
    onHidden: function onHidden() {},
    onHide: function onHide() {},
    onMount: function onMount() {},
    onShow: function onShow() {},
    onShown: function onShown() {},
    onTrigger: function onTrigger() {},
    onUntrigger: function onUntrigger() {},
    placement: 'top',
    popperOptions: {},
    role: 'tooltip',
    showOnCreate: false,
    theme: '',
    touch: true,
    trigger: 'mouseenter focus',
    triggerTarget: null,
    updateDuration: 0,
    zIndex: 9999
  };
  /**
   * If the setProps() method encounters one of these, the popperInstance must be
   * recreated
   */

  var POPPER_INSTANCE_DEPENDENCIES = ['arrow', 'boundary', 'distance', 'flip', 'flipBehavior', 'flipOnUpdate', 'offset', 'placement', 'popperOptions'];
  function getExtendedProps(props, plugins) {
    return _extends({}, props, {}, plugins.reduce(function (acc, plugin) {
      var name = plugin.name,
          defaultValue = plugin.defaultValue;

      if (name) {
        acc[name] = props[name] !== undefined ? props[name] : defaultValue;
      }

      return acc;
    }, {}));
  }

  var keys = Object.keys(defaultProps);
  /**
   * Returns an object of optional props from data-tippy-* attributes
   */

  function getDataAttributeProps(reference, plugins) {
    var props = (plugins ? Object.keys(getExtendedProps(defaultProps, plugins)) : keys).reduce(function (acc, key) {
      var valueAsString = (reference.getAttribute("data-tippy-" + key) || '').trim();

      if (!valueAsString) {
        return acc;
      }

      if (key === 'content') {
        acc[key] = valueAsString;
      } else {
        try {
          acc[key] = JSON.parse(valueAsString);
        } catch (e) {
          acc[key] = valueAsString;
        }
      }

      return acc;
    }, {});
    return props;
  }

  /**
   * Determines if the value is a reference element
   */

  function isReferenceElement(value) {
    return !!(value && value._tippy && value._tippy.reference === value);
  }
  /**
   * Safe .hasOwnProperty check, for prototype-less objects
   */

  function hasOwnProperty(obj, key) {
    return {}.hasOwnProperty.call(obj, key);
  }
  /**
   * Returns an array of elements based on the value
   */

  function getArrayOfElements(value) {
    if (isElement(value)) {
      return [value];
    }

    if (isNodeList(value)) {
      return arrayFrom(value);
    }

    if (Array.isArray(value)) {
      return value;
    }

    return arrayFrom(document.querySelectorAll(value));
  }
  /**
   * Returns a value at a given index depending on if it's an array or number
   */

  function getValueAtIndexOrReturn(value, index, defaultValue) {
    if (Array.isArray(value)) {
      var v = value[index];
      return v == null ? Array.isArray(defaultValue) ? defaultValue[index] : defaultValue : v;
    }

    return value;
  }
  /**
   * Prevents errors from being thrown while accessing nested modifier objects
   * in `popperOptions`
   */

  function getModifier(obj, key) {
    return obj && obj.modifiers && obj.modifiers[key];
  }
  /**
   * Determines if the value is of type
   */

  function isType(value, type) {
    var str = {}.toString.call(value);
    return str.indexOf('[object') === 0 && str.indexOf(type + "]") > -1;
  }
  /**
   * Determines if the value is of type Element
   */

  function isElement(value) {
    return isType(value, 'Element');
  }
  /**
   * Determines if the value is of type NodeList
   */

  function isNodeList(value) {
    return isType(value, 'NodeList');
  }
  /**
   * Determines if the value is of type MouseEvent
   */

  function isMouseEvent(value) {
    return isType(value, 'MouseEvent');
  }
  /**
   * Firefox extensions don't allow setting .innerHTML directly, this will trick
   * it
   */

  function innerHTML() {
    return 'innerHTML';
  }
  /**
   * Evaluates a function if one, or returns the value
   */

  function invokeWithArgsOrReturn(value, args) {
    return typeof value === 'function' ? value.apply(void 0, args) : value;
  }
  /**
   * Sets a popperInstance `flip` modifier's enabled state
   */

  function setFlipModifierEnabled(modifiers, value) {
    modifiers.filter(function (m) {
      return m.name === 'flip';
    })[0].enabled = value;
  }
  /**
   * Returns a new `div` element
   */

  function div() {
    return document.createElement('div');
  }
  /**
   * Applies a transition duration to a list of elements
   */

  function setTransitionDuration(els, value) {
    els.forEach(function (el) {
      if (el) {
        el.style.transitionDuration = value + "ms";
      }
    });
  }
  /**
   * Sets the visibility state to elements so they can begin to transition
   */

  function setVisibilityState(els, state) {
    els.forEach(function (el) {
      if (el) {
        el.setAttribute('data-state', state);
      }
    });
  }
  /**
   * Evaluates the props object by merging data attributes and disabling
   * conflicting props where necessary
   */

  function evaluateProps(reference, props, plugins) {
    var out = _extends({}, props, {
      content: invokeWithArgsOrReturn(props.content, [reference])
    }, props.ignoreAttributes ? {} : getDataAttributeProps(reference, plugins));

    if (out.interactive) {
      out.aria = null;
    }

    return out;
  }
  /**
   * Debounce utility. To avoid bloating bundle size, we're only passing 1
   * argument here, a more generic function would pass all arguments. Only
   * `onMouseMove` uses this which takes the event object for now.
   */

  function debounce(fn, ms) {
    // Avoid wrapping in `setTimeout` if ms is 0 anyway
    if (ms === 0) {
      return fn;
    }

    var timeout;
    return function (arg) {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn(arg);
      }, ms);
    };
  }
  /**
   * Preserves the original function invocation when another function replaces it
   */

  function preserveInvocation(originalFn, currentFn, args) {
    if (originalFn && originalFn !== currentFn) {
      originalFn.apply(void 0, args);
    }
  }
  /**
   * Deletes properties from an object (pure)
   */

  function removeProperties(obj, keys) {
    var clone = _extends({}, obj);

    keys.forEach(function (key) {
      delete clone[key];
    });
    return clone;
  }
  /**
   * Ponyfill for Array.from - converts iterable values to an array
   */

  function arrayFrom(value) {
    return [].slice.call(value);
  }
  /**
   * Works like Element.prototype.closest, but uses a callback instead
   */

  function closestCallback(element, callback) {
    while (element) {
      if (callback(element)) {
        return element;
      }

      element = element.parentElement;
    }

    return null;
  }
  /**
   * Determines if an array or string includes a string
   */

  function includes(a, b) {
    return a.indexOf(b) > -1;
  }
  /**
   * Creates an array from string of values separated by whitespace
   */

  function splitBySpaces(value) {
    return value.split(/\s+/).filter(Boolean);
  }
  /**
   * Returns the `nextValue` if `nextValue` is not `undefined`, otherwise returns
   * `currentValue`
   */

  function useIfDefined(nextValue, currentValue) {
    return nextValue !== undefined ? nextValue : currentValue;
  }
  /**
   * Converts a value that's an array or single value to an array
   */

  function normalizeToArray(value) {
    // @ts-ignore
    return [].concat(value);
  }
  /**
   * Returns the ownerDocument of the first available element, otherwise global
   * document
   */

  function getOwnerDocument(elementOrElements) {
    var _normalizeToArray = normalizeToArray(elementOrElements),
        element = _normalizeToArray[0];

    return element ? element.ownerDocument || document : document;
  }
  /**
   * Adds item to array if array does not contain it
   */

  function pushIfUnique(arr, value) {
    if (arr.indexOf(value) === -1) {
      arr.push(value);
    }
  }
  /**
   * Adds `px` if value is a number, or returns it directly
   */

  function appendPxIfNumber(value) {
    return typeof value === 'number' ? value + "px" : value;
  }

  /**
   * Sets the innerHTML of an element
   */

  function setInnerHTML(element, html) {
    element[innerHTML()] = isElement(html) ? html[innerHTML()] : html;
  }
  /**
   * Sets the content of a tooltip
   */

  function setContent(contentEl, props) {
    if (isElement(props.content)) {
      setInnerHTML(contentEl, '');
      contentEl.appendChild(props.content);
    } else if (typeof props.content !== 'function') {
      var key = props.allowHTML ? 'innerHTML' : 'textContent';
      contentEl[key] = props.content;
    }
  }
  /**
   * Returns the child elements of a popper element
   */

  function getChildren(popper) {
    return {
      tooltip: popper.querySelector(TOOLTIP_SELECTOR),
      content: popper.querySelector(CONTENT_SELECTOR),
      arrow: popper.querySelector(ARROW_SELECTOR) || popper.querySelector(SVG_ARROW_SELECTOR)
    };
  }
  /**
   * Adds `data-inertia` attribute
   */

  function addInertia(tooltip) {
    tooltip.setAttribute('data-inertia', '');
  }
  /**
   * Removes `data-inertia` attribute
   */

  function removeInertia(tooltip) {
    tooltip.removeAttribute('data-inertia');
  }
  /**
   * Creates an arrow element and returns it
   */

  function createArrowElement(arrow) {
    var arrowElement = div();

    if (arrow === true) {
      arrowElement.className = ARROW_CLASS;
    } else {
      arrowElement.className = SVG_ARROW_CLASS;

      if (isElement(arrow)) {
        arrowElement.appendChild(arrow);
      } else {
        setInnerHTML(arrowElement, arrow);
      }
    }

    return arrowElement;
  }
  /**
   * Adds interactive-related attributes
   */

  function addInteractive(tooltip) {
    tooltip.setAttribute('data-interactive', '');
  }
  /**
   * Removes interactive-related attributes
   */

  function removeInteractive(tooltip) {
    tooltip.removeAttribute('data-interactive');
  }
  /**
   * Add/remove transitionend listener from tooltip
   */

  function updateTransitionEndListener(tooltip, action, listener) {
    var eventName = isUCBrowser && document.body.style.webkitTransition !== undefined ? 'webkitTransitionEnd' : 'transitionend';
    tooltip[action + 'EventListener'](eventName, listener);
  }
  /**
   * Returns the popper's placement, ignoring shifting (top-start, etc)
   */

  function getBasePlacement(placement) {
    return placement.split('-')[0];
  }
  /**
   * Triggers reflow
   */

  function reflow(popper) {
    void popper.offsetHeight;
  }
  /**
   * Adds/removes theme from tooltip's classList
   */

  function updateTheme(tooltip, action, theme) {
    splitBySpaces(theme).forEach(function (name) {
      tooltip.classList[action](name + "-theme");
    });
  }
  /**
   * Constructs the popper element and returns it
   */

  function createPopperElement(id, props) {
    var popper = div();
    popper.className = POPPER_CLASS;
    popper.style.position = 'absolute';
    popper.style.top = '0';
    popper.style.left = '0';
    var tooltip = div();
    tooltip.className = TOOLTIP_CLASS;
    tooltip.id = "tippy-" + id;
    tooltip.setAttribute('data-state', 'hidden');
    tooltip.setAttribute('tabindex', '-1');
    updateTheme(tooltip, 'add', props.theme);
    var content = div();
    content.className = CONTENT_CLASS;
    content.setAttribute('data-state', 'hidden');

    if (props.interactive) {
      addInteractive(tooltip);
    }

    if (props.arrow) {
      tooltip.setAttribute('data-arrow', '');
      tooltip.appendChild(createArrowElement(props.arrow));
    }

    if (props.inertia) {
      addInertia(tooltip);
    }

    setContent(content, props);
    tooltip.appendChild(content);
    popper.appendChild(tooltip);
    updatePopperElement(popper, props, props);
    return popper;
  }
  /**
   * Updates the popper element based on the new props
   */

  function updatePopperElement(popper, prevProps, nextProps) {
    var _getChildren = getChildren(popper),
        tooltip = _getChildren.tooltip,
        content = _getChildren.content,
        arrow = _getChildren.arrow;

    popper.style.zIndex = '' + nextProps.zIndex;
    tooltip.setAttribute('data-animation', nextProps.animation);
    tooltip.style.maxWidth = appendPxIfNumber(nextProps.maxWidth);

    if (nextProps.role) {
      tooltip.setAttribute('role', nextProps.role);
    } else {
      tooltip.removeAttribute('role');
    }

    if (prevProps.content !== nextProps.content) {
      setContent(content, nextProps);
    } // arrow


    if (!prevProps.arrow && nextProps.arrow) {
      // false to true
      tooltip.appendChild(createArrowElement(nextProps.arrow));
      tooltip.setAttribute('data-arrow', '');
    } else if (prevProps.arrow && !nextProps.arrow) {
      // true to false
      tooltip.removeChild(arrow);
      tooltip.removeAttribute('data-arrow');
    } else if (prevProps.arrow !== nextProps.arrow) {
      // true to 'round' or vice-versa
      tooltip.removeChild(arrow);
      tooltip.appendChild(createArrowElement(nextProps.arrow));
    } // interactive


    if (!prevProps.interactive && nextProps.interactive) {
      addInteractive(tooltip);
    } else if (prevProps.interactive && !nextProps.interactive) {
      removeInteractive(tooltip);
    } // inertia


    if (!prevProps.inertia && nextProps.inertia) {
      addInertia(tooltip);
    } else if (prevProps.inertia && !nextProps.inertia) {
      removeInertia(tooltip);
    } // theme


    if (prevProps.theme !== nextProps.theme) {
      updateTheme(tooltip, 'remove', prevProps.theme);
      updateTheme(tooltip, 'add', nextProps.theme);
    }
  }
  /**
   * Determines if the mouse cursor is outside of the popper's interactive border
   * region
   */

  function isCursorOutsideInteractiveBorder(popperTreeData, event) {
    var clientX = event.clientX,
        clientY = event.clientY;
    return popperTreeData.every(function (_ref) {
      var popperRect = _ref.popperRect,
          interactiveBorder = _ref.interactiveBorder;
      var exceedsTop = popperRect.top > clientY + interactiveBorder;
      var exceedsBottom = popperRect.bottom < clientY - interactiveBorder;
      var exceedsLeft = popperRect.left > clientX + interactiveBorder;
      var exceedsRight = popperRect.right < clientX - interactiveBorder;
      return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
    });
  }

  function createMemoryLeakWarning(method) {
    var txt = method === 'destroy' ? 'n already-' : ' ';
    return "\n    " + method + "() was called on a" + txt + "destroyed instance. This is a no-op but\n    indicates a potential memory leak.\n  ";
  }
  function clean(value) {
    var spacesAndTabs = /[ \t]{2,}/g;
    var lineStartWithSpaces = /^[ \t]*/gm;
    return value.replace(spacesAndTabs, ' ').replace(lineStartWithSpaces, '').trim();
  }

  function getDevMessage(message) {
    return clean("\n  %ctippy.js\n\n  %c" + clean(message) + "\n\n  %c\uD83D\uDC77\u200D This is a development-only message. It will be removed in production.\n  ");
  }

  function getFormattedMessage(message) {
    return [getDevMessage(message), // title
    'color: #00C584; font-size: 1.3em; font-weight: bold;', // message
    'line-height: 1.5', // footer
    'color: #a6a095;'];
  }
  /**
   * Helpful wrapper around `console.warn()`.
   * TODO: Should we use a cache so it only warns a single time and not spam the
   * console? (Need to consider hot reloading and invalidation though). Chrome
   * already batches warnings as well.
   */

  function warnWhen(condition, message) {
    if (condition) {
      var _console;

      (_console = console).warn.apply(_console, getFormattedMessage(message));
    }
  }
  /**
   * Helpful wrapper around thrown errors
   */

  function throwErrorWhen(condition, message) {
    if (condition) {
      throw new Error(clean(message));
    }
  }
  /**
   * Validates props with the valid `defaultProps` object
   */

  function validateProps(partialProps, plugins) {
    if (partialProps === void 0) {
      partialProps = {};
    }

    if (plugins === void 0) {
      plugins = [];
    }

    Object.keys(partialProps).forEach(function (prop) {
      var value = partialProps[prop];
      var didSpecifyPlacementInPopperOptions = prop === 'popperOptions' && value && hasOwnProperty(value, 'placement');
      var didPassUnknownProp = !hasOwnProperty(getExtendedProps(defaultProps, plugins), prop) && !includes(['a11y', 'arrowType', 'showOnInit', 'size', 'target', 'touchHold'], prop);
      warnWhen(prop === 'target', "The `target` prop was removed in v5 and replaced with the delegate()\n      addon in order to conserve bundle size.\n      \n      See: https://atomiks.github.io/tippyjs/addons/#event-delegation");
      warnWhen(prop === 'a11y', "The `a11y` prop was removed in v5. Make sure the element you are giving\n      a tippy to is natively focusable, such as <button> or <input>, not <div>\n      or <span>.");
      warnWhen(prop === 'showOnInit', "The `showOnInit` prop was renamed to `showOnCreate` in v5.");
      warnWhen(prop === 'arrowType', "The `arrowType` prop was removed in v5 in favor of overloading the\n      `arrow` prop.\n\n      \"round\" string was replaced with importing the string from the package.\n\n      * import {roundArrow} from 'tippy.js'; (ESM version)\n      * const {roundArrow} = tippy; (IIFE CDN version)\n\n      Before: {arrow: true, arrowType: \"round\"}\n      After: {arrow: roundArrow}");
      warnWhen(prop === 'touchHold', "The `touchHold` prop was removed in v5 in favor of overloading the\n      `touch` prop.\n      \n      Before: {touchHold: true}\n      After: {touch: \"hold\"}");
      warnWhen(prop === 'size', "The `size` prop was removed in v5. Instead, use a theme that specifies\n      CSS padding and font-size properties.");
      warnWhen(prop === 'theme' && value === 'google', "The included theme \"google\" was renamed to \"material\" in v5.");
      warnWhen(didSpecifyPlacementInPopperOptions, "Specifying placement in `popperOptions` is not supported. Use the\n      base-level `placement` prop instead.\n      \n      Before: {popperOptions: {placement: \"bottom\"}}\n      After: {placement: \"bottom\"}");
      warnWhen(didPassUnknownProp, "`" + prop + "` is not a valid prop. You may have spelled it incorrectly,\n      or if it's a plugin, forgot to pass it in an array as a 3rd argument to\n      `tippy()`.\n\n      In v5, the following props were turned into plugins:\n\n      * animateFill\n      * followCursor\n      * sticky\n\n      All props: https://atomiks.github.io/tippyjs/all-props/\n      Plugins: https://atomiks.github.io/tippyjs/plugins/");
    });
  }
  /**
   * Validates the `targets` value passed to `tippy()`
   */

  function validateTargets(targets) {
    var didPassFalsyValue = !targets;
    var didPassPlainObject = Object.prototype.toString.call(targets) === '[object Object]' && !targets.addEventListener;
    throwErrorWhen(didPassFalsyValue, "tippy() was passed `" + targets + "` as its targets (first) argument.\n\n    Valid types are: String, Element, Element[], or NodeList.");
    throwErrorWhen(didPassPlainObject, "tippy() was passed a plain object which is no longer supported as an\n    argument.\n    \n    See https://atomiks.github.io/tippyjs/misc/#custom-position");
  }

  var mountedInstances = [];
  var idCounter = 1; // Workaround for IE11's lack of new MouseEvent constructor

  var mouseMoveListeners = [];
  /**
   * Creates and returns a Tippy object. We're using a closure pattern instead of
   * a class so that the exposed object API is clean without private members
   * prefixed with `_`.
   */

  function createTippy(reference, collectionProps, plugins) {
    if (plugins === void 0) {
      plugins = [];
    }

    var props = getExtendedProps(evaluateProps(reference, collectionProps, plugins), plugins); // If the reference shouldn't have multiple tippys, return null early

    if (!props.multiple && reference._tippy) {
      return null;
    }
    /* ======================= 🔒 Private members 🔒 ======================= */


    var showTimeout;
    var hideTimeout;
    var scheduleHideAnimationFrame;
    var isBeingDestroyed = false;
    var didHideDueToDocumentMouseDown = false;
    var popperUpdates = 0;
    var lastTriggerEvent;
    var currentMountCallback;
    var currentTransitionEndListener;
    var listeners = [];
    var debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce);
    var currentTarget; // Support iframe contexts
    // Static check that assumes any of the `triggerTarget` or `reference`
    // nodes will never change documents, even when they are updated

    var doc = getOwnerDocument(props.triggerTarget || reference);
    /* ======================= 🔑 Public members 🔑 ======================= */

    var id = idCounter++;
    var popper = createPopperElement(id, props);
    var popperChildren = getChildren(popper);
    var popperInstance = null; // These two elements are static

    var tooltip = popperChildren.tooltip,
        content = popperChildren.content;
    var transitionableElements = [tooltip, content];
    var state = {
      // The current real placement (`data-placement` attribute)
      currentPlacement: null,
      // Is the instance currently enabled?
      isEnabled: true,
      // Is the tippy currently showing and not transitioning out?
      isVisible: false,
      // Has the instance been destroyed?
      isDestroyed: false,
      // Is the tippy currently mounted to the DOM?
      isMounted: false,
      // Has the tippy finished transitioning in?
      isShown: false
    };
    var instance = {
      // properties
      id: id,
      reference: reference,
      popper: popper,
      popperChildren: popperChildren,
      popperInstance: popperInstance,
      props: props,
      state: state,
      plugins: plugins,
      // methods
      clearDelayTimeouts: clearDelayTimeouts,
      setProps: setProps,
      setContent: setContent,
      show: show,
      hide: hide,
      enable: enable,
      disable: disable,
      destroy: destroy
    };
    /* ==================== Initial instance mutations =================== */

    reference._tippy = instance;
    popper._tippy = instance;
    var pluginsHooks = plugins.map(function (plugin) {
      return plugin.fn(instance);
    });
    addListenersToTriggerTarget();
    handleAriaExpandedAttribute();

    if (!props.lazy) {
      createPopperInstance();
    }

    invokeHook('onCreate', [instance]);

    if (props.showOnCreate) {
      scheduleShow();
    } // Prevent a tippy with a delay from hiding if the cursor left then returned
    // before it started hiding


    popper.addEventListener('mouseenter', function () {
      if (instance.props.interactive && instance.state.isVisible) {
        instance.clearDelayTimeouts();
      }
    });
    popper.addEventListener('mouseleave', function () {
      if (instance.props.interactive && includes(instance.props.trigger, 'mouseenter')) {
        doc.addEventListener('mousemove', debouncedOnMouseMove);
      }
    });
    return instance;
    /* ======================= 🔒 Private methods 🔒 ======================= */

    function getNormalizedTouchSettings() {
      var touch = instance.props.touch;
      return Array.isArray(touch) ? touch : [touch, 0];
    }

    function getIsCustomTouchBehavior() {
      return getNormalizedTouchSettings()[0] === 'hold';
    }

    function getCurrentTarget() {
      return currentTarget || reference;
    }

    function getDelay(isShow) {
      // For touch or keyboard input, force `0` delay for UX reasons
      // Also if the instance is mounted but not visible (transitioning out),
      // ignore delay
      if (instance.state.isMounted && !instance.state.isVisible || currentInput.isTouch || (lastTriggerEvent ? lastTriggerEvent.type === 'focus' : true)) {
        return 0;
      }

      return getValueAtIndexOrReturn(instance.props.delay, isShow ? 0 : 1, defaultProps.delay);
    }

    function invokeHook(hook, args, shouldInvokePropsHook) {
      if (shouldInvokePropsHook === void 0) {
        shouldInvokePropsHook = true;
      }

      pluginsHooks.forEach(function (pluginHooks) {
        if (hasOwnProperty(pluginHooks, hook)) {
          // @ts-ignore
          pluginHooks[hook].apply(pluginHooks, args);
        }
      });

      if (shouldInvokePropsHook) {
        var _instance$props;

        // @ts-ignore
        (_instance$props = instance.props)[hook].apply(_instance$props, args);
      }
    }

    function handleAriaDescribedByAttribute() {
      var aria = instance.props.aria;

      if (!aria) {
        return;
      }

      var attr = "aria-" + aria;
      var id = tooltip.id;
      var nodes = normalizeToArray(instance.props.triggerTarget || reference);
      nodes.forEach(function (node) {
        var currentValue = node.getAttribute(attr);

        if (instance.state.isVisible) {
          node.setAttribute(attr, currentValue ? currentValue + " " + id : id);
        } else {
          var nextValue = currentValue && currentValue.replace(id, '').trim();

          if (nextValue) {
            node.setAttribute(attr, nextValue);
          } else {
            node.removeAttribute(attr);
          }
        }
      });
    }

    function handleAriaExpandedAttribute() {
      var nodes = normalizeToArray(instance.props.triggerTarget || reference);
      nodes.forEach(function (node) {
        if (instance.props.interactive) {
          node.setAttribute('aria-expanded', instance.state.isVisible && node === getCurrentTarget() ? 'true' : 'false');
        } else {
          node.removeAttribute('aria-expanded');
        }
      });
    }

    function cleanupInteractiveMouseListeners() {
      doc.body.removeEventListener('mouseleave', scheduleHide);
      doc.removeEventListener('mousemove', debouncedOnMouseMove);
      mouseMoveListeners = mouseMoveListeners.filter(function (listener) {
        return listener !== debouncedOnMouseMove;
      });
    }

    function onDocumentMouseDown(event) {
      // Clicked on interactive popper
      if (instance.props.interactive && popper.contains(event.target)) {
        return;
      } // Clicked on the event listeners target


      if (getCurrentTarget().contains(event.target)) {
        if (currentInput.isTouch) {
          return;
        }

        if (instance.state.isVisible && includes(instance.props.trigger, 'click')) {
          return;
        }
      }

      if (instance.props.hideOnClick === true) {
        instance.clearDelayTimeouts();
        instance.hide(); // `mousedown` event is fired right before `focus` if pressing the
        // currentTarget. This lets a tippy with `focus` trigger know that it
        // should not show

        didHideDueToDocumentMouseDown = true;
        setTimeout(function () {
          didHideDueToDocumentMouseDown = false;
        }); // The listener gets added in `scheduleShow()`, but this may be hiding it
        // before it shows, and hide()'s early bail-out behavior can prevent it
        // from being cleaned up

        if (!instance.state.isMounted) {
          removeDocumentMouseDownListener();
        }
      }
    }

    function addDocumentMouseDownListener() {
      doc.addEventListener('mousedown', onDocumentMouseDown, true);
    }

    function removeDocumentMouseDownListener() {
      doc.removeEventListener('mousedown', onDocumentMouseDown, true);
    }

    function onTransitionedOut(duration, callback) {
      onTransitionEnd(duration, function () {
        if (!instance.state.isVisible && popper.parentNode && popper.parentNode.contains(popper)) {
          callback();
        }
      });
    }

    function onTransitionedIn(duration, callback) {
      onTransitionEnd(duration, callback);
    }

    function onTransitionEnd(duration, callback) {
      /**
       * Listener added as the `transitionend` handler
       */
      function listener(event) {
        if (event.target === tooltip) {
          updateTransitionEndListener(tooltip, 'remove', listener);
          callback();
        }
      } // Make callback synchronous if duration is 0
      // `transitionend` won't fire otherwise


      if (duration === 0) {
        return callback();
      }

      updateTransitionEndListener(tooltip, 'remove', currentTransitionEndListener);
      updateTransitionEndListener(tooltip, 'add', listener);
      currentTransitionEndListener = listener;
    }

    function on(eventType, handler, options) {
      if (options === void 0) {
        options = false;
      }

      var nodes = normalizeToArray(instance.props.triggerTarget || reference);
      nodes.forEach(function (node) {
        node.addEventListener(eventType, handler, options);
        listeners.push({
          node: node,
          eventType: eventType,
          handler: handler,
          options: options
        });
      });
    }

    function addListenersToTriggerTarget() {
      if (getIsCustomTouchBehavior()) {
        on('touchstart', onTrigger, PASSIVE);
        on('touchend', onMouseLeave, PASSIVE);
      }

      splitBySpaces(instance.props.trigger).forEach(function (eventType) {
        if (eventType === 'manual') {
          return;
        }

        on(eventType, onTrigger);

        switch (eventType) {
          case 'mouseenter':
            on('mouseleave', onMouseLeave);
            break;

          case 'focus':
            on(isIE ? 'focusout' : 'blur', onBlur);
            break;
        }
      });
    }

    function removeListenersFromTriggerTarget() {
      listeners.forEach(function (_ref) {
        var node = _ref.node,
            eventType = _ref.eventType,
            handler = _ref.handler,
            options = _ref.options;
        node.removeEventListener(eventType, handler, options);
      });
      listeners = [];
    }

    function onTrigger(event) {
      if (!instance.state.isEnabled || isEventListenerStopped(event) || didHideDueToDocumentMouseDown) {
        return;
      }

      lastTriggerEvent = event;
      currentTarget = event.currentTarget;
      handleAriaExpandedAttribute();

      if (!instance.state.isVisible && isMouseEvent(event)) {
        // If scrolling, `mouseenter` events can be fired if the cursor lands
        // over a new target, but `mousemove` events don't get fired. This
        // causes interactive tooltips to get stuck open until the cursor is
        // moved
        mouseMoveListeners.forEach(function (listener) {
          return listener(event);
        });
      } // Toggle show/hide when clicking click-triggered tooltips


      if (event.type === 'click' && instance.props.hideOnClick !== false && instance.state.isVisible) {
        scheduleHide(event);
      } else {
        var _getNormalizedTouchSe = getNormalizedTouchSettings(),
            value = _getNormalizedTouchSe[0],
            duration = _getNormalizedTouchSe[1];

        if (currentInput.isTouch && value === 'hold' && duration) {
          // We can hijack the show timeout here, it will be cleared by
          // `scheduleHide()` when necessary
          showTimeout = setTimeout(function () {
            scheduleShow(event);
          }, duration);
        } else {
          scheduleShow(event);
        }
      }
    }

    function onMouseMove(event) {
      var isCursorOverReferenceOrPopper = closestCallback(event.target, function (el) {
        return el === reference || el === popper;
      });

      if (isCursorOverReferenceOrPopper) {
        return;
      }

      var popperTreeData = arrayFrom(popper.querySelectorAll(POPPER_SELECTOR)).concat(popper).map(function (popper) {
        return {
          popperRect: popper.getBoundingClientRect(),
          interactiveBorder: popper._tippy.props.interactiveBorder
        };
      });

      if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
        cleanupInteractiveMouseListeners();
        scheduleHide(event);
      }
    }

    function onMouseLeave(event) {
      if (isEventListenerStopped(event)) {
        return;
      }

      if (instance.props.interactive) {
        doc.body.addEventListener('mouseleave', scheduleHide);
        doc.addEventListener('mousemove', debouncedOnMouseMove);
        pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);
        return;
      }

      scheduleHide(event);
    }

    function onBlur(event) {
      if (event.target !== getCurrentTarget()) {
        return;
      } // If focus was moved to within the popper


      if (instance.props.interactive && event.relatedTarget && popper.contains(event.relatedTarget)) {
        return;
      }

      scheduleHide(event);
    }

    function isEventListenerStopped(event) {
      var supportsTouch = 'ontouchstart' in window;
      var isTouchEvent = includes(event.type, 'touch');
      var isCustomTouch = getIsCustomTouchBehavior();
      return supportsTouch && currentInput.isTouch && isCustomTouch && !isTouchEvent || currentInput.isTouch && !isCustomTouch && isTouchEvent;
    }

    function createPopperInstance() {
      var popperOptions = instance.props.popperOptions;
      var arrow = instance.popperChildren.arrow;

      function applyMutations(data) {
        instance.state.currentPlacement = data.placement;

        if (instance.props.flip && !instance.props.flipOnUpdate) {
          if (data.flipped) {
            instance.popperInstance.options.placement = data.placement;
          }

          setFlipModifierEnabled(instance.popperInstance.modifiers, false);
        }

        tooltip.setAttribute('data-placement', data.placement);

        if (data.attributes['x-out-of-boundaries'] !== false) {
          tooltip.setAttribute('data-out-of-boundaries', '');
        } else {
          tooltip.removeAttribute('data-out-of-boundaries');
        }

        var basePlacement = getBasePlacement(data.placement);
        var distance = appendPxIfNumber(instance.props.distance);
        var padding = {
          bottom: distance + " 0 0 0",
          left: "0 " + distance + " 0 0",
          top: "0 0 " + distance + " 0",
          right: "0 0 0 " + distance
        };
        popper.style.padding = padding[basePlacement];
      }

      var config = _extends({
        eventsEnabled: false,
        placement: instance.props.placement
      }, popperOptions, {
        modifiers: _extends({}, popperOptions && popperOptions.modifiers, {
          preventOverflow: _extends({
            boundariesElement: instance.props.boundary
          }, getModifier(popperOptions, 'preventOverflow')),
          arrow: _extends({
            element: arrow,
            enabled: !!arrow
          }, getModifier(popperOptions, 'arrow')),
          flip: _extends({
            enabled: instance.props.flip,
            behavior: instance.props.flipBehavior
          }, getModifier(popperOptions, 'flip')),
          offset: _extends({
            offset: instance.props.offset
          }, getModifier(popperOptions, 'offset'))
        }),
        onCreate: function onCreate(data) {
          applyMutations(data);
          preserveInvocation(popperOptions && popperOptions.onCreate, config.onCreate, [data]);
          runMountCallback();
        },
        onUpdate: function onUpdate(data) {
          applyMutations(data);
          preserveInvocation(popperOptions && popperOptions.onUpdate, config.onUpdate, [data]);
          runMountCallback();
        }
      });

      instance.popperInstance = new Popper(reference, popper, config);
    }

    function runMountCallback() {
      // Only invoke currentMountCallback after 2 updates
      // This fixes some bugs in Popper.js (TODO: aim for only 1 update)
      if (popperUpdates === 0) {
        popperUpdates++; // 1

        instance.popperInstance.update();
      } else if (currentMountCallback && popperUpdates === 1) {
        popperUpdates++; // 2

        reflow(popper);
        currentMountCallback();
      }
    }

    function mount() {
      // The mounting callback (`currentMountCallback`) is only run due to a
      // popperInstance update/create
      popperUpdates = 0;
      var appendTo = instance.props.appendTo;
      var parentNode; // By default, we'll append the popper to the triggerTargets's parentNode so
      // it's directly after the reference element so the elements inside the
      // tippy can be tabbed to
      // If there are clipping issues, the user can specify a different appendTo
      // and ensure focus management is handled correctly manually

      var node = getCurrentTarget();

      if (instance.props.interactive && appendTo === defaultProps.appendTo || appendTo === 'parent') {
        parentNode = node.parentNode;
      } else {
        parentNode = invokeWithArgsOrReturn(appendTo, [node]);
      } // The popper element needs to exist on the DOM before its position can be
      // updated as Popper.js needs to read its dimensions


      if (!parentNode.contains(popper)) {
        parentNode.appendChild(popper);
      }

      {
        // Accessibility check
        warnWhen(instance.props.interactive && appendTo === defaultProps.appendTo && node.nextElementSibling !== popper, "Interactive tippy element may not be accessible via keyboard\n        navigation because it is not directly after the reference element in\n        the DOM source order.\n\n        Using a wrapper <div> or <span> tag around the reference element solves\n        this by creating a new parentNode context.\n        \n        Specifying `appendTo: document.body` silences this warning, but it\n        assumes you are using a focus management solution to handle keyboard\n        navigation.\n        \n        See: https://atomiks.github.io/tippyjs/accessibility/#interactivity");
      }

      if (instance.popperInstance) {
        setFlipModifierEnabled(instance.popperInstance.modifiers, instance.props.flip);
        instance.popperInstance.enableEventListeners(); // Mounting callback invoked in `onUpdate`

        instance.popperInstance.update();
      } else {
        // Mounting callback invoked in `onCreate`
        createPopperInstance();
        instance.popperInstance.enableEventListeners();
      }
    }

    function scheduleShow(event) {
      instance.clearDelayTimeouts();

      if (!instance.popperInstance) {
        createPopperInstance();
      }

      if (event) {
        invokeHook('onTrigger', [instance, event]);
      }

      addDocumentMouseDownListener();
      var delay = getDelay(true);

      if (delay) {
        showTimeout = setTimeout(function () {
          instance.show();
        }, delay);
      } else {
        instance.show();
      }
    }

    function scheduleHide(event) {
      instance.clearDelayTimeouts();
      invokeHook('onUntrigger', [instance, event]);

      if (!instance.state.isVisible) {
        removeDocumentMouseDownListener();
        return;
      }

      var delay = getDelay(false);

      if (delay) {
        hideTimeout = setTimeout(function () {
          if (instance.state.isVisible) {
            instance.hide();
          }
        }, delay);
      } else {
        // Fixes a `transitionend` problem when it fires 1 frame too
        // late sometimes, we don't want hide() to be called.
        scheduleHideAnimationFrame = requestAnimationFrame(function () {
          instance.hide();
        });
      }
    }
    /* ======================= 🔑 Public methods 🔑 ======================= */


    function enable() {
      instance.state.isEnabled = true;
    }

    function disable() {
      // Disabling the instance should also hide it
      // https://github.com/atomiks/tippy.js-react/issues/106
      instance.hide();
      instance.state.isEnabled = false;
    }

    function clearDelayTimeouts() {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      cancelAnimationFrame(scheduleHideAnimationFrame);
    }

    function setProps(partialProps) {
      {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('setProps'));
      }

      if (instance.state.isDestroyed) {
        return;
      }

      {
        validateProps(partialProps, plugins);
      }

      invokeHook('onBeforeUpdate', [instance, partialProps]);
      removeListenersFromTriggerTarget();
      var prevProps = instance.props;
      var nextProps = evaluateProps(reference, _extends({}, instance.props, {}, partialProps, {
        ignoreAttributes: true
      }), plugins);
      nextProps.ignoreAttributes = useIfDefined(partialProps.ignoreAttributes, prevProps.ignoreAttributes);
      instance.props = nextProps;
      addListenersToTriggerTarget();

      if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
        cleanupInteractiveMouseListeners();
        debouncedOnMouseMove = debounce(onMouseMove, nextProps.interactiveDebounce);
      }

      updatePopperElement(popper, prevProps, nextProps);
      instance.popperChildren = getChildren(popper); // Ensure stale aria-expanded attributes are removed

      if (prevProps.triggerTarget && !nextProps.triggerTarget) {
        normalizeToArray(prevProps.triggerTarget).forEach(function (node) {
          node.removeAttribute('aria-expanded');
        });
      } else if (nextProps.triggerTarget) {
        reference.removeAttribute('aria-expanded');
      }

      handleAriaExpandedAttribute();

      if (instance.popperInstance) {
        if (POPPER_INSTANCE_DEPENDENCIES.some(function (prop) {
          return hasOwnProperty(partialProps, prop) && partialProps[prop] !== prevProps[prop];
        })) {
          instance.popperInstance.destroy();
          createPopperInstance();

          if (instance.state.isVisible) {
            instance.popperInstance.enableEventListeners();
          }
        } else {
          instance.popperInstance.update();
        }
      }

      invokeHook('onAfterUpdate', [instance, partialProps]);
    }

    function setContent(content) {
      instance.setProps({
        content: content
      });
    }

    function show(duration) {
      if (duration === void 0) {
        duration = getValueAtIndexOrReturn(instance.props.duration, 0, defaultProps.duration);
      }

      {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('show'));
      } // Early bail-out


      var isAlreadyVisible = instance.state.isVisible;
      var isDestroyed = instance.state.isDestroyed;
      var isDisabled = !instance.state.isEnabled;
      var isTouchAndTouchDisabled = currentInput.isTouch && !instance.props.touch;

      if (isAlreadyVisible || isDestroyed || isDisabled || isTouchAndTouchDisabled) {
        return;
      } // Normalize `disabled` behavior across browsers.
      // Firefox allows events on disabled elements, but Chrome doesn't.
      // Using a wrapper element (i.e. <span>) is recommended.


      if (getCurrentTarget().hasAttribute('disabled')) {
        return;
      }

      invokeHook('onShow', [instance], false);

      if (instance.props.onShow(instance) === false) {
        return;
      }

      addDocumentMouseDownListener();
      popper.style.visibility = 'visible';
      instance.state.isVisible = true; // Prevent a transition of the popper from its previous position and of the
      // elements at a different placement
      // Check if the tippy was fully unmounted before `show()` was called, to
      // allow for smooth transition for `createSingleton()`

      if (!instance.state.isMounted) {
        setTransitionDuration(transitionableElements.concat(popper), 0);
      }

      currentMountCallback = function currentMountCallback() {
        if (!instance.state.isVisible) {
          return;
        }

        setTransitionDuration([popper], instance.props.updateDuration);
        setTransitionDuration(transitionableElements, duration);
        setVisibilityState(transitionableElements, 'visible');
        handleAriaDescribedByAttribute();
        handleAriaExpandedAttribute();
        pushIfUnique(mountedInstances, instance);
        updateIOSClass(true);
        instance.state.isMounted = true;
        invokeHook('onMount', [instance]);
        onTransitionedIn(duration, function () {
          instance.state.isShown = true;
          invokeHook('onShown', [instance]);
        });
      };

      mount();
    }

    function hide(duration) {
      if (duration === void 0) {
        duration = getValueAtIndexOrReturn(instance.props.duration, 1, defaultProps.duration);
      }

      {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hide'));
      } // Early bail-out


      var isAlreadyHidden = !instance.state.isVisible && !isBeingDestroyed;
      var isDestroyed = instance.state.isDestroyed;
      var isDisabled = !instance.state.isEnabled && !isBeingDestroyed;

      if (isAlreadyHidden || isDestroyed || isDisabled) {
        return;
      }

      invokeHook('onHide', [instance], false);

      if (instance.props.onHide(instance) === false && !isBeingDestroyed) {
        return;
      }

      removeDocumentMouseDownListener();
      popper.style.visibility = 'hidden';
      instance.state.isVisible = false;
      instance.state.isShown = false;
      setTransitionDuration(transitionableElements, duration);
      setVisibilityState(transitionableElements, 'hidden');
      handleAriaDescribedByAttribute();
      handleAriaExpandedAttribute();
      onTransitionedOut(duration, function () {
        instance.popperInstance.disableEventListeners();
        instance.popperInstance.options.placement = instance.props.placement;
        popper.parentNode.removeChild(popper);
        mountedInstances = mountedInstances.filter(function (i) {
          return i !== instance;
        });

        if (mountedInstances.length === 0) {
          updateIOSClass(false);
        }

        instance.state.isMounted = false;
        invokeHook('onHidden', [instance]);
      });
    }

    function destroy() {
      {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('destroy'));
      }

      if (instance.state.isDestroyed) {
        return;
      }

      isBeingDestroyed = true;
      instance.clearDelayTimeouts();
      instance.hide(0);
      removeListenersFromTriggerTarget();
      delete reference._tippy;

      if (instance.popperInstance) {
        instance.popperInstance.destroy();
      }

      isBeingDestroyed = false;
      instance.state.isDestroyed = true;
      invokeHook('onDestroy', [instance]);
    }
  }

  /**
   * Exported module
   */
  function tippy(targets, optionalProps, plugins) {
    if (plugins === void 0) {
      plugins = [];
    }

    {
      validateTargets(targets);
      validateProps(optionalProps, plugins);
    }

    bindGlobalEventListeners();

    var props = _extends({}, defaultProps, {}, optionalProps);

    var elements = getArrayOfElements(targets);

    {
      var isSingleContentElement = isElement(props.content);
      var isMoreThanOneReferenceElement = elements.length > 1;
      warnWhen(isSingleContentElement && isMoreThanOneReferenceElement, "tippy() was passed an Element as the `content` prop, but more than one\n      tippy instance was created by this invocation. This means the content\n      element will only be appended to the last tippy instance.\n      \n      Instead, pass the .innerHTML of the element, or use a function that\n      returns a cloned version of the element instead.\n      \n      1) content: () => element.cloneNode(true)\n      2) content: element.innerHTML");
    }

    var instances = elements.reduce(function (acc, reference) {
      var instance = reference && createTippy(reference, props, plugins);

      if (instance) {
        acc.push(instance);
      }

      return acc;
    }, []);
    return isElement(targets) ? instances[0] : instances;
  }

  tippy.version = version;
  tippy.defaultProps = defaultProps;
  tippy.setDefaultProps = setDefaultProps;
  tippy.currentInput = currentInput;
  /**
   * Mutates the defaultProps object by setting the props specified
   */

  function setDefaultProps(partialProps) {
    {
      validateProps(partialProps, []);
    }

    Object.keys(partialProps).forEach(function (key) {
      defaultProps[key] = partialProps[key];
    });
  }
  /**
   * Returns a proxy wrapper function that passes the plugins
   */


  function createTippyWithPlugins(outerPlugins) {
    var tippyPluginsWrapper = function tippyPluginsWrapper(targets, optionalProps, innerPlugins) {
      if (innerPlugins === void 0) {
        innerPlugins = [];
      }

      return tippy(targets, optionalProps, [].concat(outerPlugins, innerPlugins));
    };

    tippyPluginsWrapper.version = version;
    tippyPluginsWrapper.defaultProps = defaultProps;
    tippyPluginsWrapper.setDefaultProps = setDefaultProps;
    tippyPluginsWrapper.currentInput = currentInput;
    return tippyPluginsWrapper;
  }
  /**
   * Hides all visible poppers on the document
   */

  function hideAll(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        excludedReferenceOrInstance = _ref.exclude,
        duration = _ref.duration;

    mountedInstances.forEach(function (instance) {
      var isExcluded = false;

      if (excludedReferenceOrInstance) {
        isExcluded = isReferenceElement(excludedReferenceOrInstance) ? instance.reference === excludedReferenceOrInstance : instance.popper === excludedReferenceOrInstance.popper;
      }

      if (!isExcluded) {
        instance.hide(duration);
      }
    });
  }

  /**
   * Re-uses a single tippy element for many different tippy instances.
   * Replaces v4's `tippy.group()`.
   */

  function createSingleton(tippyInstances, optionalProps, plugins) {
    if (plugins === void 0) {
      plugins = [];
    }

    {
      throwErrorWhen(!Array.isArray(tippyInstances), "The first argument passed to createSingleton() must be an array of tippy\n      instances.\n  \n      The passed value was: " + tippyInstances);
    }

    tippyInstances.forEach(function (instance) {
      instance.disable();
    });
    var currentAria;
    var currentTarget;
    var userProps = {};

    function setUserProps(props) {
      Object.keys(props).forEach(function (prop) {
        userProps[prop] = useIfDefined(props[prop], userProps[prop]);
      });
    }

    setUserProps(_extends({}, defaultProps, {}, optionalProps));

    function handleAriaDescribedByAttribute(id, isInteractive, isShow) {
      if (!currentAria) {
        return;
      }

      if (isShow && !isInteractive) {
        currentTarget.setAttribute("aria-" + currentAria, id);
      } else {
        currentTarget.removeAttribute("aria-" + currentAria);
      }
    }

    var references = tippyInstances.map(function (instance) {
      return instance.reference;
    });

    var props = _extends({}, optionalProps, {
      aria: null,
      triggerTarget: references,
      onMount: function onMount(instance) {
        preserveInvocation(userProps.onMount, instance.props.onMount, [instance]);
        handleAriaDescribedByAttribute(instance.popperChildren.tooltip.id, instance.props.interactive, true);
      },
      onUntrigger: function onUntrigger(instance, event) {
        preserveInvocation(userProps.onUntrigger, instance.props.onUntrigger, [instance, event]);
        handleAriaDescribedByAttribute(instance.popperChildren.tooltip.id, instance.props.interactive, false);
      },
      onTrigger: function onTrigger(instance, event) {
        preserveInvocation(userProps.onTrigger, instance.props.onTrigger, [instance, event]);
        var target = event.currentTarget;
        var index = references.indexOf(target);
        currentTarget = target;
        currentAria = userProps.aria;

        if (instance.state.isVisible) {
          handleAriaDescribedByAttribute(instance.popperChildren.tooltip.id, instance.props.interactive, true);
        }

        instance.setContent(tippyInstances[index].props.content); // Due to two updates performed upon mount, the second update will use
        // this object

        instance.popperInstance.reference = {
          // @ts-ignore - awaiting popper.js@1.16.0 release
          referenceNode: target,
          clientHeight: 0,
          clientWidth: 0,
          getBoundingClientRect: function getBoundingClientRect() {
            return target.getBoundingClientRect();
          }
        };
      },
      onAfterUpdate: function onAfterUpdate(instance, partialProps) {
        preserveInvocation(userProps.onAfterUpdate, instance.props.onAfterUpdate, [instance, partialProps]);
        setUserProps(partialProps);
      },
      onDestroy: function onDestroy(instance) {
        preserveInvocation(userProps.onDestroy, instance.props.onDestroy, [instance]);
        tippyInstances.forEach(function (instance) {
          instance.enable();
        });
      }
    });

    return tippy(document.createElement('div'), props, plugins);
  }

  var BUBBLING_EVENTS_MAP = {
    mouseover: 'mouseenter',
    focusin: 'focus',
    click: 'click'
  };
  /**
   * Creates a delegate instance that controls the creation of tippy instances
   * for child elements (`target` CSS selector).
   */

  function delegate(targets, props, plugins) {
    if (plugins === void 0) {
      plugins = [];
    }

    {
      throwErrorWhen(!props || !props.target, "You must specify a `target` prop indicating the CSS selector string\n      matching the target elements that should receive a tippy.");
    }

    var listeners = [];
    var childTippyInstances = [];
    var target = props.target;
    var nativeProps = removeProperties(props, ['target']);

    var parentProps = _extends({}, nativeProps, {
      trigger: 'manual'
    });

    var childProps = _extends({}, nativeProps, {
      showOnCreate: true
    });

    var returnValue = tippy(targets, parentProps, plugins);
    var normalizedReturnValue = normalizeToArray(returnValue);

    function onTrigger(event) {
      if (!event.target) {
        return;
      }

      var targetNode = event.target.closest(target);

      if (!targetNode) {
        return;
      } // Get relevant trigger with fallbacks:
      // 1. Check `data-tippy-trigger` attribute on target node
      // 2. Fallback to `trigger` passed to `delegate()`
      // 3. Fallback to `defaultProps.trigger`


      var trigger = targetNode.getAttribute('data-tippy-trigger') || props.trigger || defaultProps.trigger; // Only create the instance if the bubbling event matches the trigger type

      if (!includes(trigger, BUBBLING_EVENTS_MAP[event.type])) {
        return;
      }

      var instance = tippy(targetNode, childProps, plugins);

      if (instance) {
        childTippyInstances = childTippyInstances.concat(instance);
      }
    }

    function on(element, eventType, listener, options) {
      if (options === void 0) {
        options = false;
      }

      element.addEventListener(eventType, listener, options);
      listeners.push({
        element: element,
        eventType: eventType,
        listener: listener,
        options: options
      });
    }

    function addEventListeners(instance) {
      var reference = instance.reference;
      on(reference, 'mouseover', onTrigger);
      on(reference, 'focusin', onTrigger);
      on(reference, 'click', onTrigger);
    }

    function removeEventListeners() {
      listeners.forEach(function (_ref) {
        var element = _ref.element,
            eventType = _ref.eventType,
            listener = _ref.listener,
            options = _ref.options;
        element.removeEventListener(eventType, listener, options);
      });
      listeners = [];
    }

    function applyMutations(instance) {
      var originalDestroy = instance.destroy;

      instance.destroy = function (shouldDestroyChildInstances) {
        if (shouldDestroyChildInstances === void 0) {
          shouldDestroyChildInstances = true;
        }

        if (shouldDestroyChildInstances) {
          childTippyInstances.forEach(function (instance) {
            instance.destroy();
          });
        }

        childTippyInstances = [];
        removeEventListeners();
        originalDestroy();
      };

      addEventListeners(instance);
    }

    normalizedReturnValue.forEach(applyMutations);
    return returnValue;
  }

  var animateFill = {
    name: 'animateFill',
    defaultValue: false,
    fn: function fn(instance) {
      var _instance$popperChild = instance.popperChildren,
          tooltip = _instance$popperChild.tooltip,
          content = _instance$popperChild.content;
      var backdrop = instance.props.animateFill && !isUCBrowser ? createBackdropElement() : null;

      function addBackdropToPopperChildren() {
        instance.popperChildren.backdrop = backdrop;
      }

      return {
        onCreate: function onCreate() {
          if (backdrop) {
            addBackdropToPopperChildren();
            tooltip.insertBefore(backdrop, tooltip.firstElementChild);
            tooltip.setAttribute('data-animatefill', '');
            tooltip.style.overflow = 'hidden';
            instance.setProps({
              animation: 'shift-away',
              arrow: false
            });
          }
        },
        onMount: function onMount() {
          if (backdrop) {
            var transitionDuration = tooltip.style.transitionDuration;
            var duration = Number(transitionDuration.replace('ms', '')); // The content should fade in after the backdrop has mostly filled the
            // tooltip element. `clip-path` is the other alternative but is not
            // well-supported and is buggy on some devices.

            content.style.transitionDelay = Math.round(duration / 10) + "ms";
            backdrop.style.transitionDuration = transitionDuration;
            setVisibilityState([backdrop], 'visible'); // Warn if the stylesheets are not loaded

            {
              warnWhen(getComputedStyle(backdrop).position !== 'absolute', "The `tippy.js/dist/backdrop.css` stylesheet has not been\n              imported!\n              \n              The `animateFill` plugin requires this stylesheet to work.");
              warnWhen(getComputedStyle(tooltip).transform === 'none', "The `tippy.js/animations/shift-away.css` stylesheet has not\n              been imported!\n              \n              The `animateFill` plugin requires this stylesheet to work.");
            }
          }
        },
        onShow: function onShow() {
          if (backdrop) {
            backdrop.style.transitionDuration = '0ms';
          }
        },
        onHide: function onHide() {
          if (backdrop) {
            setVisibilityState([backdrop], 'hidden');
          }
        },
        onAfterUpdate: function onAfterUpdate() {
          // With this type of prop, it's highly unlikely it will be changed
          // dynamically. We'll leave out the diff/update logic it to save bytes.
          // `popperChildren` is assigned a new object onAfterUpdate
          addBackdropToPopperChildren();
        }
      };
    }
  };

  function createBackdropElement() {
    var backdrop = div();
    backdrop.className = BACKDROP_CLASS;
    setVisibilityState([backdrop], 'hidden');
    return backdrop;
  }

  var followCursor = {
    name: 'followCursor',
    defaultValue: false,
    fn: function fn(instance) {
      var reference = instance.reference,
          popper = instance.popper; // Support iframe contexts
      // Static check that assumes any of the `triggerTarget` or `reference`
      // nodes will never change documents, even when they are updated

      var doc = getOwnerDocument(instance.props.triggerTarget || reference); // Internal state

      var lastMouseMoveEvent;
      var triggerEvent = null;
      var isInternallySettingControlledProp = false; // These are controlled by this plugin, so we need to store the user's
      // original prop value

      var userProps = instance.props;

      function setUserProps(props) {
        Object.keys(props).forEach(function (prop) {
          userProps[prop] = useIfDefined(props[prop], userProps[prop]);
        });
      } // Due to `getVirtualOffsets()`, we need to reverse the placement if it's
      // shifted (start -> end, and vice-versa)


      function setNormalizedPlacement() {
        var placement = userProps.placement;

        if (!placement) {
          return;
        }

        var shift = placement.split('-')[1];
        isInternallySettingControlledProp = true;
        instance.setProps({
          placement: getIsEnabled() && shift ? placement.replace(shift, shift === 'start' ? 'end' : 'start') : placement
        });
        isInternallySettingControlledProp = false;
      }

      function getIsEnabled() {
        return instance.props.followCursor && isMouseEvent(triggerEvent) && !(triggerEvent.clientX === 0 && triggerEvent.clientY === 0);
      }

      function getIsInitialBehavior() {
        return currentInput.isTouch || instance.props.followCursor === 'initial' && instance.state.isVisible;
      }

      function resetReference() {
        if (instance.popperInstance) {
          instance.popperInstance.reference = reference;
        }
      }

      function handleListeners() {
        if (!instance.popperInstance) {
          return;
        } // Popper's scroll listeners make sense for `true` only. TODO: work out
        // how to only listen horizontal scroll for "horizontal" and vertical
        // scroll for "vertical"


        if (getIsEnabled() && (getIsInitialBehavior() || instance.props.followCursor !== true)) {
          instance.popperInstance.disableEventListeners();
        }
      }

      function triggerLastMouseMove() {
        if (getIsEnabled()) {
          onMouseMove(lastMouseMoveEvent);
        }
      }

      function addListener() {
        doc.addEventListener('mousemove', onMouseMove);
      }

      function removeListener() {
        doc.removeEventListener('mousemove', onMouseMove);
      }

      function onMouseMove(event) {
        var _lastMouseMoveEvent = lastMouseMoveEvent = event,
            clientX = _lastMouseMoveEvent.clientX,
            clientY = _lastMouseMoveEvent.clientY;

        if (!instance.popperInstance || !instance.state.currentPlacement) {
          return;
        } // If the instance is interactive, avoid updating the position unless it's
        // over the reference element


        var isCursorOverReference = closestCallback(event.target, function (el) {
          return el === reference;
        });
        var rect = reference.getBoundingClientRect();
        var followCursor = instance.props.followCursor;
        var isHorizontal = followCursor === 'horizontal';
        var isVertical = followCursor === 'vertical';
        var isVerticalPlacement = includes(['top', 'bottom'], getBasePlacement(instance.state.currentPlacement)); // The virtual reference needs some size to prevent itself from overflowing

        var _getVirtualOffsets = getVirtualOffsets(popper, isVerticalPlacement),
            size = _getVirtualOffsets.size,
            x = _getVirtualOffsets.x,
            y = _getVirtualOffsets.y;

        if (isCursorOverReference || !instance.props.interactive) {
          instance.popperInstance.reference = {
            // @ts-ignore - awaiting popper.js@1.16.0 release
            referenceNode: reference,
            // These `client` values don't get used by Popper.js if they are 0
            clientWidth: 0,
            clientHeight: 0,
            getBoundingClientRect: function getBoundingClientRect() {
              return {
                width: isVerticalPlacement ? size : 0,
                height: isVerticalPlacement ? 0 : size,
                top: (isHorizontal ? rect.top : clientY) - y,
                bottom: (isHorizontal ? rect.bottom : clientY) + y,
                left: (isVertical ? rect.left : clientX) - x,
                right: (isVertical ? rect.right : clientX) + x
              };
            }
          };
          instance.popperInstance.update();
        }

        if (getIsInitialBehavior()) {
          removeListener();
        }
      }

      return {
        onAfterUpdate: function onAfterUpdate(_, partialProps) {
          if (!isInternallySettingControlledProp) {
            setUserProps(partialProps);

            if (partialProps.placement) {
              setNormalizedPlacement();
            }
          } // A new placement causes the popperInstance to be recreated


          if (partialProps.placement) {
            handleListeners();
          } // Wait for `.update()` to set `instance.state.currentPlacement` to
          // the new placement


          requestAnimationFrame(triggerLastMouseMove);
        },
        onMount: function onMount() {
          triggerLastMouseMove();
          handleListeners();
        },
        onTrigger: function onTrigger(_, event) {
          // Tapping on touch devices can trigger `mouseenter` then `focus`
          if (triggerEvent) {
            return;
          }

          triggerEvent = event;

          if (isMouseEvent(event)) {
            lastMouseMoveEvent = event;
          } // With "initial" behavior, flipping may be incorrect for the first show


          if (getIsEnabled() && getIsInitialBehavior()) {
            isInternallySettingControlledProp = true;
            instance.setProps({
              flipOnUpdate: true
            });
            isInternallySettingControlledProp = false;
          } else {
            instance.setProps({
              flipOnUpdate: userProps.flipOnUpdate
            });
          }

          setNormalizedPlacement();

          if (getIsEnabled()) {
            // Ignore any trigger events fired immediately after the first one
            // e.g. `focus` can be fired right after `mouseenter` on touch devices
            if (event === triggerEvent) {
              addListener();
            }
          } else {
            resetReference();
          }
        },
        onUntrigger: function onUntrigger() {
          // If untriggered before showing (`onHidden` will never be invoked)
          if (!instance.state.isVisible) {
            removeListener();
            triggerEvent = null;
          }
        },
        onHidden: function onHidden() {
          removeListener();
          resetReference();
          triggerEvent = null;
        }
      };
    }
  };
  function getVirtualOffsets(popper, isVerticalPlacement) {
    var size = isVerticalPlacement ? popper.offsetWidth : popper.offsetHeight;
    return {
      size: size,
      x: isVerticalPlacement ? size : 0,
      y: isVerticalPlacement ? 0 : size
    };
  }

  // position. This will require the `followCursor` plugin's fixes for overflow
  // due to using event.clientX/Y values. (normalizedPlacement, getVirtualOffsets)

  var inlinePositioning = {
    name: 'inlinePositioning',
    defaultValue: false,
    fn: function fn(instance) {
      var reference = instance.reference;

      function getIsEnabled() {
        return instance.props.inlinePositioning;
      }

      return {
        onHidden: function onHidden() {
          if (getIsEnabled()) {
            instance.popperInstance.reference = reference;
          }
        },
        onTrigger: function onTrigger() {
          if (!getIsEnabled()) {
            return;
          }

          instance.popperInstance.reference = {
            // @ts-ignore - awaiting popper.js@1.16.0 release
            referenceNode: reference,
            clientWidth: 0,
            clientHeight: 0,
            getBoundingClientRect: function getBoundingClientRect() {
              return getInlineBoundingClientRect(instance.state.currentPlacement && getBasePlacement(instance.state.currentPlacement), reference.getBoundingClientRect(), arrayFrom(reference.getClientRects()));
            }
          };
        }
      };
    }
  };
  function getInlineBoundingClientRect(currentBasePlacement, boundingRect, clientRects) {
    // Not an inline element, or placement is not yet known
    if (clientRects.length < 2 || currentBasePlacement === null) {
      return boundingRect;
    }

    var rectToUse;

    switch (currentBasePlacement) {
      case 'top':
      case 'bottom':
        {
          var firstRect = clientRects[0];
          var lastRect = clientRects[clientRects.length - 1];
          var isTop = currentBasePlacement === 'top';
          var top = firstRect.top;
          var bottom = lastRect.bottom;
          var left = isTop ? firstRect.left : lastRect.left;
          var right = isTop ? firstRect.right : lastRect.right;
          var width = right - left;
          var height = bottom - top;
          rectToUse = {
            top: top,
            bottom: bottom,
            left: left,
            right: right,
            width: width,
            height: height
          };
          break;
        }

      case 'left':
      case 'right':
        {
          var minLeft = Math.min.apply(Math, clientRects.map(function (rects) {
            return rects.left;
          }));
          var maxRight = Math.max.apply(Math, clientRects.map(function (rects) {
            return rects.right;
          }));
          var measureRects = clientRects.filter(function (rect) {
            return currentBasePlacement === 'left' ? rect.left === minLeft : rect.right === maxRight;
          });
          var _top = measureRects[0].top;
          var _bottom = measureRects[measureRects.length - 1].bottom;
          var _left = minLeft;
          var _right = maxRight;

          var _width = _right - _left;

          var _height = _bottom - _top;

          rectToUse = {
            top: _top,
            bottom: _bottom,
            left: _left,
            right: _right,
            width: _width,
            height: _height
          };
          break;
        }

      default:
        {
          rectToUse = boundingRect;
        }
    }

    return rectToUse;
  }

  var sticky = {
    name: 'sticky',
    defaultValue: false,
    fn: function fn(instance) {
      var reference = instance.reference,
          popper = instance.popper;

      function shouldCheck(value) {
        return instance.props.sticky === true || instance.props.sticky === value;
      }

      var prevRefRect = null;
      var prevPopRect = null;

      function updatePosition() {
        var currentRefRect = shouldCheck('reference') ? reference.getBoundingClientRect() : null;
        var currentPopRect = shouldCheck('popper') ? popper.getBoundingClientRect() : null;

        if (currentRefRect && areRectsDifferent(prevRefRect, currentRefRect) || currentPopRect && areRectsDifferent(prevPopRect, currentPopRect)) {
          instance.popperInstance.update();
        }

        prevRefRect = currentRefRect;
        prevPopRect = currentPopRect;

        if (instance.state.isMounted) {
          requestAnimationFrame(updatePosition);
        }
      }

      return {
        onMount: function onMount() {
          if (instance.props.sticky) {
            updatePosition();
          }
        }
      };
    }
  };

  function areRectsDifferent(rectA, rectB) {
    if (rectA && rectB) {
      return rectA.top !== rectB.top || rectA.right !== rectB.right || rectA.bottom !== rectB.bottom || rectA.left !== rectB.left;
    }

    return true;
  }

  if (isBrowser) {
    injectCSS(css);
  }

  var extendedTippy = createTippyWithPlugins([animateFill, followCursor, inlinePositioning, sticky]);
  extendedTippy.createSingleton = createSingleton;
  extendedTippy.delegate = delegate;
  extendedTippy.hideAll = hideAll;
  extendedTippy.roundArrow = ROUND_ARROW;

  return extendedTippy;

}(Popper));
//# sourceMappingURL=tippy-bundle.iife.js.map
