import { h, defineComponent, ref, onMounted } from 'vue';

export const IonPopover = defineComponent({
  name: 'IonPopover',
  emits: ['on-will-present', 'on-did-present', 'on-will-dismiss', 'on-did-dismiss'],
  setup(_, { emit, attrs, slots }) {
    const popoverRef = ref();
    let shouldMount = ref(false);
    onMounted(() => {
      popoverRef.value.addEventListener('ion-popover-will-present', () => {
        shouldMount.value = true;
        emit('on-will-present');
      });

      popoverRef.value.addEventListener('ion-popover-did-present', () => {
        emit('on-did-present');
      });

      popoverRef.value.addEventListener('ion-popover-will-dismiss', () => {
        emit('on-will-dismiss');
      });

      popoverRef.value.addEventListener('ion-popover-did-dismiss', () => {
        shouldMount.value = false;
        emit('on-did-dismiss');
      });
    });

    return () => {
      return h(
        'ion-popover',
        {
          ...attrs,
          ref: popoverRef
        },
        (shouldMount.value) ? slots.default && slots.default() : []
      )
    }
  }
});
