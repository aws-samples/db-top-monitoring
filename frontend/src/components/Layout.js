import { useRef,useState } from 'react';
import * as React from "react";
import AppLayout from "@cloudscape-design/components/app-layout";

export const splitPanelI18nStrings: SplitPanelProps.I18nStrings = {
  preferencesTitle: 'Split panel preferences',
  preferencesPositionLabel: 'Split panel position',
  preferencesPositionDescription: 'Choose the default split panel position for the service.',
  preferencesPositionSide: 'Side',
  preferencesPositionBottom: 'Bottom',
  preferencesConfirm: 'Confirm',
  preferencesCancel: 'Cancel',
  closeButtonAriaLabel: 'Close panel',
  openButtonAriaLabel: 'Open panel',
  resizeHandleAriaLabel: 'Resize split panel',
};


export default function App({pageContent,activeLink,breadCrumbs,contentType,navItems,navHeader,splitPanel,splitPanelSize,splitPanelOpen,onSplitPanelToggle}) {
  
  const appLayout = useRef();
  const [splitPanelSizeInt,setsplitPanelSizeInt] = useState(splitPanelSize);
     
  const onSplitPanelResize = ({ detail: { size } }) => {
        setsplitPanelSizeInt(size);
  };


  return (
          <>
            <AppLayout
                  ref={appLayout}
                  contentType={"table"}
                  content={pageContent}
                  disableContentPaddings={true}
                  toolsHide={true}
                  navigationHide={true}
                  splitPanel={splitPanel}
                  splitPanelOpen={splitPanelOpen}
                  onSplitPanelToggle={onSplitPanelToggle}
                  splitPanelSize={splitPanelSizeInt}
                  onSplitPanelResize={onSplitPanelResize}
            />
          </>
        );
}