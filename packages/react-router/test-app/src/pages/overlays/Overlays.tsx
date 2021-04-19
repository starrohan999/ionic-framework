import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonButton,
  IonPopover,
} from '@ionic/react';
import PopoverContent from './PopoverContent';

const Overlays: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Overlays</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent class="ion-padding" fullscreen={true}>

        <IonButton id="my-trigger">Open Popover</IonButton>
        <IonPopover
          trigger="my-trigger"
          side="right"
          alignment="start"
        >
          <PopoverContent />
        </IonPopover>
      </IonContent>
    </IonPage>
  );
};

export default Overlays;
