/**!
* tippy.js v5.0.3
* (c) 2017-2019 atomiks
* MIT License
*/
import { t as throwErrorWhen, _ as _extends, d as defaultProps, p as preserveInvocation, a as tippy, u as useIfDefined, r as removeProperties, n as normalizeToArray, i as includes, b as isUCBrowser, s as setVisibilityState, w as warnWhen, c as div, B as BACKDROP_CLASS, g as getOwnerDocument, e as isMouseEvent, f as currentInput, h as closestCallback, j as getBasePlacement, k as arrayFrom } from './tippy.chunk.esm.js';
export { m as createTippyWithPlugins, a as default, l as hideAll, R as roundArrow } from './tippy.chunk.esm.js';
import 'popper.js';

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */

function createSingleton(tippyInstances, optionalProps, plugins) {
  if (plugins === void 0) {
    plugins = [];
  }

  if (process.env.NODE_ENV !== "production") {
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

  if (process.env.NODE_ENV !== "production") {
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

          if (process.env.NODE_ENV !== "production") {
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

export { animateFill, createSingleton, delegate, followCursor, inlinePositioning, sticky };
//# sourceMappingURL=tippy.esm.js.map
