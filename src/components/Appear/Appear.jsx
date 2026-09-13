import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useRef,
} from "react";
import useRiseUpOnScroll from "../../hooks/useRiseUpOnScroll";
import "./Appear.css";

function composeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    });
  };
}

function joinClassNames(...names) {
  return names.filter(Boolean).join(" ");
}

/**
 * Viewport appear animation for case-study blocks: fade in and rise into place.
 *
 * Reuse this across case studies. Prefer `asChild` when the child already has
 * layout classes (grids, absolute placement) so the animated node is the child
 * itself rather than an extra wrapper.
 */
const Appear = forwardRef(function Appear(
  {
    as: Tag = "div",
    asChild = false,
    className = "",
    delay = 0,
    duration,
    start,
    y,
    triggerOnMount = false,
    children,
    ...rest
  },
  forwardedRef,
) {
  const internalRef = useRef(null);

  useRiseUpOnScroll(internalRef, {
    delay,
    duration,
    start,
    y,
    triggerOnMount,
  });

  const appearClassName = joinClassNames("cs-appear", className);

  if (asChild) {
    const child = Children.only(children);

    if (!isValidElement(child)) {
      return children;
    }

    return cloneElement(child, {
      ...rest,
      ref: composeRefs(child.ref, forwardedRef, internalRef),
      className: joinClassNames(child.props.className, appearClassName),
    });
  }

  return (
    <Tag
      ref={composeRefs(forwardedRef, internalRef)}
      className={appearClassName}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Appear;
