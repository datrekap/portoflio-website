/** Clears focus after a mouse/touch click so :focus hover art does not stick. */
export function blurOnClick(event) {
  event.currentTarget.blur();
}
