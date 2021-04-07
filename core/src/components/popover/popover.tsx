import { Component, ComponentInterface, Element, Event, EventEmitter, Host, Method, Prop, h, Watch } from '@stencil/core';

import { getIonMode } from '../../global/ionic-global';
import { AnimationBuilder, ComponentProps, ComponentRef, FrameworkDelegate, OverlayEventDetail, OverlayInterface, PopoverSize } from '../../interface';
import { attachComponent, detachComponent } from '../../utils/framework-delegate';
import { BACKDROP, dismiss, eventMethod, prepareOverlay, present } from '../../utils/overlays';
import { getClassMap } from '../../utils/theme';
import { deepReady } from '../../utils/transition';

import { iosEnterAnimation } from './animations/ios.enter';
import { iosLeaveAnimation } from './animations/ios.leave';
import { mdEnterAnimation } from './animations/md.enter';
import { mdLeaveAnimation } from './animations/md.leave';

const CoreDelegate = () => {
  let Component: any;
  const attachViewToDom = (parentElement: HTMLElement, component: any, componentProps: any = {}, classes?: string[]) => {
    Component = parentElement.closest('ion-popover');
    const app = document.querySelector('ion-app') || document.body;

    if (app && Component) {
      app.appendChild(Component);
      classes;
      componentProps;
      component;
    }

    return Component;
  }

  const removeViewFromDom = () => {
    Component && Component.remove();
    return Promise.resolve();
  }

  return { attachViewToDom, removeViewFromDom }
}

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 */
@Component({
  tag: 'ion-popover',
  styleUrls: {
    ios: 'popover.ios.scss',
    md: 'popover.md.scss'
  },
  scoped: true
})
export class Popover implements ComponentInterface, OverlayInterface {

  private usersElement?: HTMLElement;
  private triggerEl?: HTMLElement | null;
  private triggerCallback?: any;
  private triggerEvent?: string;

  presented = false;
  lastFocus?: HTMLElement;

  @Element() el!: HTMLIonPopoverElement;

  /** @internal */
  @Prop() delegate?: FrameworkDelegate = CoreDelegate();

  /** @internal */
  @Prop() overlayIndex!: number;

  /**
   * Animation to use when the popover is presented.
   */
  @Prop() enterAnimation?: AnimationBuilder;

  /**
   * Animation to use when the popover is dismissed.
   */
  @Prop() leaveAnimation?: AnimationBuilder;

  /**
   * The component to display inside of the popover.
   * @internal
   */
  @Prop() component!: ComponentRef;

  /**
   * The data to pass to the popover component.
   * @internal
   */
  @Prop() componentProps?: ComponentProps;

  /**
   * If `true`, the keyboard will be automatically dismissed when the overlay is presented.
   */
  @Prop() keyboardClose = true;

  /**
   * Additional classes to apply for custom CSS. If multiple classes are
   * provided they should be separated by spaces.
   * @internal
   */
  @Prop() cssClass?: string | string[];

  /**
   * If `true`, the popover will be dismissed when the backdrop is clicked.
   */
  @Prop() backdropDismiss = true;

  /**
   * The event to pass to the popover animation.
   */
  @Prop() event: any;

  /**
   * If `true`, a backdrop will be displayed behind the popover.
   */
  @Prop() showBackdrop = true;

  /**
   * If `true`, the popover will be translucent.
   * Only applies when the mode is `"ios"` and the device supports
   * [`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter#Browser_compatibility).
   */
  @Prop() translucent = false;

  /**
   * If `true`, the popover will animate.
   */
  @Prop() animated = true;

  /**
   * Describes what kind of interaction with the trigger that
   * should cause the popover to open. Does not apply when the `trigger`
   * property is `undefined`.
   * If `'click'`, the popover will be presented when the trigger is left clicked.
   * If `'hover'`, the popover will be presented when a pointer hovers over the trigger.
   * If `'context-menu'`, the popover will be presented when the trigger is right
   * clicked on desktop and long pressed on mobile. This will also prevent your
   * device's normal context menu from appearing.
   */
  @Prop() triggerAction: 'click' | 'hover' | 'context-menu' = 'click';

  /**
   * An ID corresponding to the trigger element that
   * causes the popover to open. Use the `trigger-action`
   * property to customize the interaction that results in
   * the popover opening.
   */
  @Prop() trigger: string | undefined;

  /**
   * Describes how to calculate the popover width.
   * If `'cover'`, the popover width will match the width of the trigger.
   * If `'auto'`, the popover width will be determined by the content in
   * the popover.
   */
  @Prop() size: PopoverSize = 'auto';

  @Watch('trigger')
  @Watch('triggerAction')
  onTriggerChange() {
    this.configureTriggerInteraction();
  }

  /**
   * Emitted after the popover has presented.
   */
  @Event({ eventName: 'ionPopoverDidPresent' }) didPresent!: EventEmitter<void>;

  /**
   * Emitted before the popover has presented.
   */
  @Event({ eventName: 'ionPopoverWillPresent' }) willPresent!: EventEmitter<void>;

  /**
   * Emitted before the popover has dismissed.
   */
  @Event({ eventName: 'ionPopoverWillDismiss' }) willDismiss!: EventEmitter<OverlayEventDetail>;

  /**
   * Emitted after the popover has dismissed.
   */
  @Event({ eventName: 'ionPopoverDidDismiss' }) didDismiss!: EventEmitter<OverlayEventDetail>;

  connectedCallback() {
    prepareOverlay(this.el);
  }

  componentDidLoad() {
    this.configureTriggerInteraction();
  }

  /**
   * Present the popover overlay after it has been created.
   */
  @Method()
  async present(event?: any): Promise<void> {
    if (this.presented) {
      return;
    }
    const container = this.el.querySelector('.popover-content');
    if (!container) {
      throw new Error('container is undefined');
    }
    const data = {
      ...this.componentProps,
      popover: this.el
    };
    this.usersElement = await attachComponent(this.delegate, container, this.component, ['popover-viewport', (this.el as any)['s-sc']], data);
    await deepReady(this.usersElement);
    return present(this, 'popoverEnter', iosEnterAnimation, mdEnterAnimation, {
      event: this.event || event,
      size: this.size,
      trigger: this.triggerEl
    });
  }

  /**
   * Dismiss the popover overlay after it has been presented.
   *
   * @param data Any data to emit in the dismiss events.
   * @param role The role of the element that is dismissing the popover. For example, 'cancel' or 'backdrop'.
   */
  @Method()
  async dismiss(data?: any, role?: string): Promise<boolean> {
    const shouldDismiss = await dismiss(this, data, role, 'popoverLeave', iosLeaveAnimation, mdLeaveAnimation, this.event);
    if (shouldDismiss) {
      await detachComponent(this.delegate, this.usersElement);
    }
    return shouldDismiss;
  }

  /**
   * Returns a promise that resolves when the popover did dismiss.
   */
  @Method()
  onDidDismiss<T = any>(): Promise<OverlayEventDetail<T>> {
    return eventMethod(this.el, 'ionPopoverDidDismiss');
  }

  /**
   * Returns a promise that resolves when the popover will dismiss.
   */
  @Method()
  onWillDismiss<T = any>(): Promise<OverlayEventDetail<T>> {
    return eventMethod(this.el, 'ionPopoverWillDismiss');
  }

  private onDismiss = (ev: UIEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    this.dismiss();
  }

  private onBackdropTap = () => {
    this.dismiss(undefined, BACKDROP);
  }

  private onLifecycle = (modalEvent: CustomEvent) => {
    const el = this.usersElement;
    const name = LIFECYCLE_MAP[modalEvent.type];
    if (el && name) {
      const event = new CustomEvent(name, {
        bubbles: false,
        cancelable: false,
        detail: modalEvent.detail
      });
      el.dispatchEvent(event);
    }
  }

  private destroyTriggerInteraction = () => {
    const { triggerEl, triggerCallback, triggerEvent } = this;

    if (triggerEl && triggerCallback && triggerEvent) {
      triggerEl.removeEventListener(triggerEvent, triggerCallback);
    }
  }

  private configureTriggerInteraction = () => {
    this.destroyTriggerInteraction();

    const { trigger, triggerAction } = this;
    if (!trigger) return;

    const triggerEl = this.triggerEl = document.getElementById(trigger);
    if (!triggerEl) return;

    switch(triggerAction) {
      case 'hover':
        this.triggerCallback = (ev: Event) => this.present(ev);
        this.triggerEvent = 'mouseenter';
        break;
      case 'context-menu':
        this.triggerCallback = (ev: Event) => {
          ev.preventDefault();
          this.present(ev);
        };
        this.triggerEvent = 'contextmenu';
        break;
      case 'click':
      default:
        this.triggerCallback = (ev: Event) => this.present(ev);
        this.triggerEvent = 'click';
        break;
    }

    triggerEl.addEventListener(this.triggerEvent, this.triggerCallback);
    console.log(triggerEl, this.triggerEvent, this.triggerCallback)
  }

  render() {
    const mode = getIonMode(this);
    const { onLifecycle } = this;
    return (
      <Host
        aria-modal="true"
        no-router
        tabindex="-1"
        style={{
          zIndex: `${20000 + this.overlayIndex}`,
        }}
        class={{
          ...getClassMap(this.cssClass),
          [mode]: true,
          'popover-translucent': this.translucent,
          'overlay-hidden': true
        }}
        onIonPopoverDidPresent={onLifecycle}
        onIonPopoverWillPresent={onLifecycle}
        onIonPopoverWillDismiss={onLifecycle}
        onIonPopoverDidDismiss={onLifecycle}
        onIonDismiss={this.onDismiss}
        onIonBackdropTap={this.onBackdropTap}
      >
        <ion-backdrop tappable={this.backdropDismiss} visible={this.showBackdrop}/>

        <div tabindex="0"></div>

        <div class="popover-wrapper ion-overlay-wrapper">
          <div class="popover-arrow"></div>
          <div class="popover-content">
            <slot></slot>
          </div>
        </div>

        <div tabindex="0"></div>
      </Host>
    );
  }
}

const LIFECYCLE_MAP: any = {
  'ionPopoverDidPresent': 'ionViewDidEnter',
  'ionPopoverWillPresent': 'ionViewWillEnter',
  'ionPopoverWillDismiss': 'ionViewWillLeave',
  'ionPopoverDidDismiss': 'ionViewDidLeave',
};
