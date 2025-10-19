/**
 * Type definitions for the View Transition API
 * https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
 */

interface ViewTransition {
  /**
   * A Promise that fulfills once the transition animation is finished,
   * and the new page view is visible and interactive to the user.
   */
  finished: Promise<void>;

  /**
   * A Promise that fulfills once the pseudo-element tree is created
   * and the transition animation is about to start.
   */
  ready: Promise<void>;

  /**
   * A Promise that fulfills when the promise returned by the
   * document.startViewTransition()'s callback fulfills.
   */
  updateCallbackDone: Promise<void>;

  /**
   * Skips the animation part of the view transition.
   */
  skipTransition(): void;
}

interface Document {
  /**
   * Starts a new view transition and returns a ViewTransition object to represent it.
   * When the transition is triggered, the callback will be called to update the DOM.
   */
  startViewTransition(callback: () => Promise<void> | void): ViewTransition;
}
