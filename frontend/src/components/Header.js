import TopNavigation from '@cloudscape-design/components/top-navigation';
import { configuration } from '../pages/Configs';
import { applyMode,  Mode } from '@cloudscape-design/global-styles';
import { databaseEngineTitle } from './Functions';

export default function App({sessionInformation,onClickMenu, onClickDisconnect, titleItem = ""}) {


    //-- Navigation settings
    const i18nStrings = {
      searchIconAriaLabel: 'Search',
      searchDismissIconAriaLabel: 'Close search',
      overflowMenuTriggerText: 'More',
      overflowMenuTitleText: 'All',
      overflowMenuBackIconAriaLabel: 'Back',
      overflowMenuDismissIconAriaLabel: 'Close menu',
    };
    
    const handleClickMenu = ({detail}) => {
            
            switch (detail.id) {
              
              case 'themeDark':
                  applyMode(Mode.Dark);
                  localStorage.setItem("themeMode", "dark");
                  break;
                
              case 'themeLight':
                    applyMode(Mode.Light);
                    localStorage.setItem("themeMode", "light");
                    break;
                
              
            }

    };

    //-- Navigate Profiling
    const profileActions = [
      { type: 'button', id: 'profile', text: 'SessionID : ' + sessionInformation["session_id"]},
      { id: 'version', text: 'AppVersion : ' + configuration["apps-settings"]["release"]},
      {
        type: 'menu-dropdown',
        id: 'preferences',
        text: 'Preferences',
        items: [
          { type: 'button', id: 'themeDark', text: 'Theme Dark' },
          { type: 'button', id: 'themeLight', text: 'Theme Light'},
        ]
      },
      {
        type: 'menu-dropdown',
        id: 'support-group',
        text: 'Support',
        items: [
          {id: 'documentation',text: 'Documentation'},
          { id: 'feedback', text: 'Feedback'},
          { id: 'support', text: 'Customer support' },
        ],
      }
    ];
    
   
   
  return (
    <div id="h" style={{ position: 'sticky', top: 0, zIndex: 1002 }}>
          <TopNavigation
                i18nStrings={i18nStrings}
                identity={{
                  href: '#',
                  title: configuration['apps-settings']['application-title'] + " Solution - " + databaseEngineTitle(sessionInformation["rds_engine"]) 
                }}
                
                utilities={[
                  {
                    type: 'button',
                    iconName: 'notification',
                    ariaLabel: 'Notifications',
                    badge: true,
                    disableUtilityCollapse: true,
                  },
                  { type: 'button', iconName: 'settings', title: 'Settings', ariaLabel: 'Settings' },
                  {
                    type: 'menu-dropdown',
                    text: sessionInformation["rds_user"] + " : " + sessionInformation["rds_id"] + " (" + sessionInformation["rds_engine"] + ")",
                    iconName: 'user-profile',
                    items: profileActions,
                    onItemClick : handleClickMenu
                  },
                  {
                    type: 'button',
                    text: 'Disconnect',
                    onClick : onClickDisconnect,
                    variant : "primary-button"
                  },
                ]}
              />
          </div>

  );
}



    
                                                