import React, { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import isHotkey from 'is-hotkey';
import swal from '@sweetalert/with-react';

import ExampleTheme from './themes/ExampleTheme';

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import {
  MdOpenInNew,
  MdFullscreen,
  MdViewColumn,
  MdCloseFullscreen,
} from 'react-icons/md';
import styled from 'styled-components';

// import {
//   EditorComposer,
//   Editor,
//   ToolbarPlugin,
//   InsertDropdown,
//   AlignDropdown,
// } from 'verbum';
import SlateEditor from './SlateEditor';

// import { ContentEditable } from '@lexical/react/LexicalContentEditable';
// import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
// import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
// import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

// import { Editor, EditorState } from 'draft-js';
// import 'draft-js/dist/Draft.css';

// import './node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import {
  SidePanel,
  ErrorBoundary,
  UserPreferences,
  AboutModal,
  Header,
  useModal,
  LoadingIndicatorProgress,
} from '@ohif/ui';
import i18n from '@ohif/i18n';
import {
  ServicesManager,
  HangingProtocolService,
  hotkeys,
  CommandsManager,
} from '@ohif/core';
import { useAppConfig } from '@state';
import Toolbar from '../Toolbar/Toolbar';
import Button from 'platform/ui/src/components/Button/Button';

const { availableLanguages, defaultLanguage, currentLanguage } = i18n;
const theme = {
  // Theme styling goes here
  // ...
};
// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}
// function Editor() {
//   const initialConfig = {
//     namespace: 'MyEditor',
//     theme,
//     onError,
//   };

//   return (
//     <LexicalComposer initialConfig={initialConfig}>
//       <PlainTextPlugin
//         contentEditable={<ContentEditable />}
//         placeholder={<div>Enter some text...</div>}
//         ErrorBoundary={LexicalErrorBoundary}
//       />
//       <HistoryPlugin />
//       <MyCustomAutoFocusPlugin />
//     </LexicalComposer>
//   );
// }
// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

// const editorConfig = {
//   // The editor theme
//   theme: {},
//   // theme: {},
//   // Handling of errors during update
//   onError(error) {
//     throw error;
//   },
//   // Any custom nodes go here
//   nodes: [
//     HeadingNode,
//     ListNode,
//     ListItemNode,
//     QuoteNode,
//     CodeNode,
//     CodeHighlightNode,
//     TableNode,
//     TableCellNode,
//     TableRowNode,
//     AutoLinkNode,
//     LinkNode,
//   ],
// };

const HOTKEYS = {
  'mod+f': 'fullscreen',
  'mod+j': 'sideBySide',
  'mod+k': 'layeredRight',

  'mod+l': 'layeredLeft',
  'mod+-': 'minimize',
  'mod+m': 'minimize',

  'mod+o': 'layeredRight',
  'mod+r': 'layeredRight',
};

const initialEditorState = {
  position: 'absolute',
  top: 0,
  right: 0,
  height: '100vh',
  width: '50%',
  background: '#fff',
  zIndex: '99',
  visibility: 'visible',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // maxWidth: '900px',
  // border: 'solid 1px #aaa',
  // borderRadius: '5px',
};

const IconButton = styled.button`
  background-color: rgb(32, 35, 67);
  border: transparent;
  color: rgb(255, 255, 255);
  cursor: pointer;
  font-family: ProductSans;
  font-weight: 700;
  letter-spacing: 1.75px;
  position: static;
  text-transform: uppercase;
  border-radius: 1.25rem;
  font-size: 0.625rem;
  padding: 0.5rem 0.5rem;
`;
const EditorLayoutActions = styled.div`
  display: flex;
  gap: 5px;
  font-size: 30px !important;
  width: 150px;
  justify-content: end;
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px;
`;

const PrimaryButton = styled.button`
  display: flex;

  background-color: #2c0472; /* Green */
  border: none;
  color: white;
  padding: 8px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 1rem;
  margin: 1rem;
`;

const editorModes = {
  layered: 'layeredRight',
  fullscreen: 'fullscreen',
  sideBySide: 'sideBySide',
  layeredLeft: 'layeredLeft',
  layeredRight: 'layeredRight',
  minimize: 'minimize',
};

function ViewerLayout({
  // From Extension Module Params
  extensionManager,
  servicesManager,
  hotkeysManager,
  commandsManager,
  // From Modes
  viewports,
  ViewportGridComp,
  leftPanels = [],
  rightPanels = [],
  leftPanelDefaultClosed = false,
  rightPanelDefaultClosed = false,
}): React.FunctionComponent {
  const [appConfig] = useAppConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [editorState, setEditorState] = useState(initialEditorState);
  const [editorMode, setEditorModeState] = useState(editorModes.layered);

  const onClickReturnButton = () => {
    // onChange = editorState => this.setState({editorState});

    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);
    // const search =
    //   dataSourceIdx === -1
    //     ? undefined
    //     : `datasources=${pathname.substring(dataSourceIdx + 1)}`;

    // Todo: Handle parameters in a better way.
    const query = new URLSearchParams(window.location.search);
    const configUrl = query.get('configUrl');

    const searchQuery = new URLSearchParams();
    if (dataSourceIdx !== -1) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }

    if (configUrl) {
      searchQuery.append('configUrl', configUrl);
    }

    navigate({
      pathname: '/',
      search: decodeURIComponent(searchQuery.toString()),
    });
  };

  const { t } = useTranslation();
  const { show, hide } = useModal();

  const [showLoadingIndicator, setShowLoadingIndicator] = useState(
    appConfig.showLoadingIndicator
  );

  const { hangingProtocolService } = servicesManager.services;

  const { hotkeyDefinitions, hotkeyDefaults } = hotkeysManager;
  const versionNumber = process.env.VERSION_NUMBER;
  const commitHash = process.env.COMMIT_HASH;

  const menuOptions = [
    {
      title: t('Header:About'),
      icon: 'info',
      onClick: () =>
        show({
          content: AboutModal,
          title: 'About Cure Assist',
          contentProps: { versionNumber, commitHash },
        }),
    },
    {
      title: t('Header:Preferences'),
      icon: 'settings',
      onClick: () =>
        show({
          title: t('UserPreferencesModal:User Preferences'),
          content: UserPreferences,
          contentProps: {
            hotkeyDefaults: hotkeysManager.getValidHotkeyDefinitions(
              hotkeyDefaults
            ),
            hotkeyDefinitions,
            currentLanguage: currentLanguage(),
            availableLanguages,
            defaultLanguage,
            onCancel: () => {
              hotkeys.stopRecord();
              hotkeys.unpause();
              hide();
            },
            onSubmit: ({ hotkeyDefinitions, language }) => {
              i18n.changeLanguage(language.value);
              hotkeysManager.setHotkeys(hotkeyDefinitions);
              hide();
            },
            onReset: () => hotkeysManager.restoreDefaultBindings(),
            hotkeysModule: hotkeys,
          },
        }),
    },
  ];

  if (appConfig.oidc) {
    menuOptions.push({
      title: t('Header:Logout'),
      icon: 'power-off',
      onClick: async () => {
        navigate(
          `/logout?redirect_uri=${encodeURIComponent(window.location.href)}`
        );
      },
    });
  }

  /**
   * Set body classes (tailwindcss) that don't allow vertical
   * or horizontal overflow (no scrolling). Also guarantee window
   * is sized to our viewport.
   */
  useEffect(() => {
    document.body.classList.add('bg-black');
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('bg-black');
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const getComponent = id => {
    const entry = extensionManager.getModuleEntry(id);

    if (!entry) {
      throw new Error(
        `${id} is not a valid entry for an extension module, please check your configuration or make sure the extension is registered.`
      );
    }

    let content;
    if (entry && entry.component) {
      content = entry.component;
    } else {
      throw new Error(
        `No component found from extension ${id}. Check the reference string to the extension in your Mode configuration`
      );
    }

    return { entry, content };
  };

  const getPanelData = id => {
    const { content, entry } = getComponent(id);

    return {
      id: entry.id,
      iconName: entry.iconName,
      iconLabel: entry.iconLabel,
      label: entry.label,
      name: entry.name,
      content,
    };
  };

  useEffect(() => {
    const { unsubscribe } = hangingProtocolService.subscribe(
      HangingProtocolService.EVENTS.PROTOCOL_CHANGED,

      // Todo: right now to set the loading indicator to false, we need to wait for the
      // hangingProtocolService to finish applying the viewport matching to each viewport,
      // however, this might not be the only approach to set the loading indicator to false. we need to explore this further.
      () => {
        setShowLoadingIndicator(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [hangingProtocolService]);

  useEffect(() => {
    // const { unsubscribe } = hangingProtocolService.subscribe(
    //   HangingProtocolService.EVENTS.PROTOCOL_CHANGED,

    //   // Todo: right now to set the loading indicator to false, we need to wait for the
    //   // hangingProtocolService to finish applying the viewport matching to each viewport,
    //   // however, this might not be the only approach to set the loading indicator to false. we need to explore this further.
    //   () => {
    //     setShowLoadingIndicator(false);
    //   }
    // );

    // return () => {
    //   unsubscribe();
    // };

    console.log('editor mode', editorMode);
    handleEditorSetup(editorMode);
    // if (editorMode === editorModes.fullscreen) {
    //   handleEditorSetup('fullscreen');
    // }
  }, [editorMode]);

  const getViewportComponentData = viewportComponent => {
    const { entry } = getComponent(viewportComponent.namespace);

    return {
      component: entry.component,
      displaySetsToDisplay: viewportComponent.displaySetsToDisplay,
    };
  };

  const leftPanelComponents = leftPanels.map(getPanelData);
  const rightPanelComponents = rightPanels.map(getPanelData);
  const viewportComponents = viewports.map(getViewportComponentData);
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
  };

  const handleEditorSetup = mark => {
    // toggleMark(editor, mark);
    // toggleBlock(editor, mark);
    if (mark === 'fullscreen') {
      setEditorState({ ...initialEditorState, width: '100%' });
    }
    if (mark === 'layeredLeft') {
      setEditorState({ ...initialEditorState, left: 0, right: 'auto' });
    }
    if (mark === 'layeredRight') {
      setEditorState(initialEditorState);
    }
    if (mark === 'minimize') {
      setEditorState({ ...initialEditorState, zIndex: -1 });
    }
    if (mark === 'sideBySide') {
      setEditorState({ ...initialEditorState, display: 'none' });
    }
  };

  const renderEditorActions = (
    <EditorLayoutActions>
      <IconButton
        // active={isBlockActive(editor, format)}
        style={{
          display:
            editorMode === 'sideBySide' || editorMode === 'fullscreen'
              ? 'flex'
              : 'none',
        }}
        onMouseDown={event => {
          event.preventDefault();
          // toggleBlock(editor, format);
          setEditorModeState(editorModes.layered);
        }}
      >
        <MdOpenInNew size={24} />
      </IconButton>
      <IconButton
        // active={isBlockActive(editor, format)}
        style={{ display: editorMode !== 'sideBySide' ? 'flex' : 'none' }}
        onMouseDown={event => {
          event.preventDefault();
          // toggleBlock(editor, format);
          setEditorModeState(editorModes.sideBySide);
        }}
      >
        <MdViewColumn size={24} />
      </IconButton>
      <IconButton
        // active={isBlockActive(editor, format)}
        style={{ display: editorMode !== 'fullscreen' ? 'flex' : 'none' }}
        onMouseDown={event => {
          event.preventDefault();
          setEditorModeState(editorModes.fullscreen);
          // toggleBlock(editor, format);
        }}
      >
        <MdFullscreen size={24} />
      </IconButton>

      <IconButton
        // active={isBlockActive(editor, format)}
        style={{ display: editorMode === 'fullscreen' ? 'flex' : 'none' }}
        onMouseDown={event => {
          event.preventDefault();
          setEditorModeState(editorModes.layered);
          // toggleBlock(editor, format);
        }}
      >
        <MdCloseFullscreen size={24} />
      </IconButton>
    </EditorLayoutActions>
  );

  return (
    <div
      style={{ position: 'relative' }}
      onKeyDown={event => {
        for (const hotkey in HOTKEYS) {
          if (isHotkey(hotkey, event as any)) {
            event.preventDefault();
            const mark = HOTKEYS[hotkey];

            handleEditorSetup(mark);
          }

          // console.log('hot key', mark);
        }
      }}
    >
      <Header
        menuOptions={menuOptions}
        isReturnEnabled={!!appConfig.showStudyList}
        onClickReturnButton={onClickReturnButton}
        WhiteLabeling={appConfig.whiteLabeling}
      >
        <ErrorBoundary context="Primary Toolbar">
          <div className="relative flex justify-center">
            <Toolbar servicesManager={servicesManager} />
          </div>
        </ErrorBoundary>
      </Header>

      <button
        className="open-editor"
        onClick={() => {
          handleEditorSetup('align-right');
        }}
      >
        Open Editor
      </button>
      <div
        className="bg-black flex flex-row items-stretch w-full overflow-hidden flex-nowrap relative"
        style={{ height: 'calc(100vh - 52px' }}
      >
        <React.Fragment>
          {showLoadingIndicator && (
            <LoadingIndicatorProgress className="h-full w-full bg-black" />
          )}
          {/* LEFT SIDEPANELS */}
          {leftPanelComponents.length ? (
            <ErrorBoundary context="Left Panel">
              <SidePanel
                side="left"
                activeTabIndex={leftPanelDefaultClosed ? null : 0}
                tabs={leftPanelComponents}
                servicesManager={servicesManager}
              />
            </ErrorBoundary>
          ) : null}
          {/* TOOLBAR + GRID */}
          <div className="flex flex-col flex-1 h-full">
            <div className="flex items-center justify-center flex-1 h-full overflow-hidden bg-black relative">
              <ErrorBoundary context="Grid">
                <ViewportGridComp
                  servicesManager={servicesManager}
                  viewportComponents={viewportComponents}
                  commandsManager={commandsManager}
                />
              </ErrorBoundary>
            </div>
          </div>
          {rightPanelComponents.length ? (
            <ErrorBoundary context="Right Panel">
              <SidePanel
                side="right"
                activeTabIndex={rightPanelDefaultClosed ? null : 0}
                tabs={rightPanelComponents}
                servicesManager={servicesManager}
              />
            </ErrorBoundary>
          ) : null}
        </React.Fragment>
      </div>
    </div>
  );
}

ViewerLayout.propTypes = {
  // From extension module params
  extensionManager: PropTypes.shape({
    getModuleEntry: PropTypes.func.isRequired,
  }).isRequired,
  commandsManager: PropTypes.instanceOf(CommandsManager),
  servicesManager: PropTypes.instanceOf(ServicesManager),
  // From modes
  leftPanels: PropTypes.array,
  rightPanels: PropTypes.array,
  leftPanelDefaultClosed: PropTypes.bool.isRequired,
  rightPanelDefaultClosed: PropTypes.bool.isRequired,
  /** Responsible for rendering our grid of viewports; provided by consuming application */
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export default ViewerLayout;
