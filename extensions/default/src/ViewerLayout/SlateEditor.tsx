import React, { useCallback, useMemo, useState } from 'react';
import isHotkey from 'is-hotkey';
import { Editable, withReact, useSlate, Slate } from 'slate-react';
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
} from 'slate';
import { withHistory } from 'slate-history';

import { Button, Icon, Toolbar } from './slateComponents';
import {
  MdFormatBold,
  MdAccessible,
  MdFormatItalic,
  MdFormatUnderlined,
  MdLooksOne,
  MdLooksTwo,
  MdLooks3,
  MdFormatQuote,
  MdFormatListNumbered,
  MdFormatListBulleted,
} from 'react-icons/md';
import './index.css';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+l': 'bulleted-list',
  'mod+o': 'numbered-list',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

const RichTextExample = () => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const editorAlignement = useState('right');
  //  const initialValue = useMemo(
  //   () =>
  //     JSON.parse(localStorage.getItem('content')) || [
  //       {
  //         type: 'paragraph',
  //         children: [{ text: 'A line of text in a paragraph.' }],
  //       },
  //     ],
  //   []
  // )
  // editor.deleteBackward = (...args) => {
  //   deleteBackward(...args);

  //   const match = Editor.above(editor, {
  //     match: n => unwrapTypes.includes(n.type),
  //   });

  //   if (match) {
  //     // quick fix for list item
  //     Transforms.setNodes(editor, { type: paragraph });
  //   }
  // };

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Toolbar
        style={{
          display: 'flex',
          fontSize: '24px',
          width: '100%',
          justifyContent: 'center',
          gap: '10px',
          padding: '1rem',
          // margin: '10px',
        }}
      >
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        {/* <MarkButton format="code" icon="code" /> */}
        <BlockButton format="heading-one" icon="heading-one" />
        <BlockButton format="heading-two" icon="heading-two" />
        {/* <BlockButton format="heading-three" icon="heading-three" /> */}
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      </Toolbar>
      <div
        style={{ overflowY: 'auto', display: 'flex', justifyContent: 'center' }}
      >
        <Editable
          className="cure-assist-editor"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
          style={{
            margin: '20px',
            maxWidth: '900px',
            minHeight: '900px',
            border: '1px solid rgb(170, 170, 170)',
            borderRadius: '5px',
          }}
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event as any)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
                toggleBlock(editor, mark);
              }
            }
          }}
        />
      </div>
    </Slate>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });
  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case 'title':
      return (
        <h1
          style={style}
          {...attributes}
          contentEditable="false"
          style={{ width: '100%', fontSize: '26px', textAlign: 'center' }}
        >
          {children}
        </h1>
      );
    case 'heading':
      return (
        <h1
          style={style}
          {...attributes}
          contentEditable="false"
          style={{
            width: '100%',
            fontSize: '22px',
            color: '#8968e3',
            margin: '20px 0 10px 0',
          }}
        >
          {children}
        </h1>
      );
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );

    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );

    case 'bulleted-list':
      return (
        <ul
          style={{
            ...style,
            listStyle: 'disc',
            paddingInlineStart: '40px',
            // ma,
          }}
          {...attributes}
        >
          {children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol
          style={{
            ...style,
            listStyle: 'auto',
            paddingInlineStart: '40px',
            // ma,
          }}
          {...attributes}
        >
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

// const BlockButton = ({ format, icon }) => {
//   const editor = useSlate();
//   return (
//     <Button
//       active={isBlockActive(
//         editor,
//         format,
//         TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
//       )}
//       onMouseDown={event => {
//         event.preventDefault();
//         toggleBlock(editor, format);
//       }}
//     >
//       <Icon>{icon}</Icon>
//     </Button>
//   );
// };

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  let iconCompo = null;
  switch (icon) {
    case 'heading-one':
      iconCompo = <MdLooksOne size={24} />;
      break;
    case 'heading-two':
      iconCompo = <MdLooksTwo size={24} />;
      break;
    case 'heading-three':
      iconCompo = <MdLooks3 size={24} />;
      break;
    case 'format_quote':
      iconCompo = <MdFormatQuote size={24} />;
      break;
    case 'format_list_numbered':
      iconCompo = <MdFormatListNumbered size={24} />;
      break;
    case 'format_list_bulleted':
      iconCompo = <MdFormatListBulleted size={24} />;
      break;
  }

  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {iconCompo}
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  let SlateIcon = <MdFormatBold />;
  console.log('Icons', icon);
  switch (icon) {
    case 'format_bold':
      SlateIcon = <MdFormatBold />;
      break;

    case 'format_italic':
      SlateIcon = <MdFormatItalic />;
      break;

    case 'format_underlined':
      SlateIcon = <MdFormatUnderlined />;
      break;

    case 'looks_one':
      SlateIcon = <MdLooksOne />;
      break;
    case 'looks_two':
      SlateIcon = <MdLooksTwo />;
      break;

    default:
      SlateIcon = <MdAccessible />;
      break;
  }
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {SlateIcon}
      {/* <Icon>{icon}</Icon> */}
    </Button>
  );
};

const initialValue: Descendant[] = [
  {
    type: 'title',
    contentEditable: false,
    children: [
      {
        text: 'CT BRAIN PLAIN',
        // bold: true,
        align: 'center',
        center: true,
      },
      // { text: 'rich', bold: true },
      // { text: ' text, ' },
      // { text: 'much', italic: true },
      // { text: ' better than a ' },
      // { text: '<textarea>', code: true },
      // { text: '!' },
    ],
  },
  {
    type: 'heading',
    contentEditable: false,
    children: [
      {
        text: 'History',
        bold: true,
        align: 'center',
        center: true,
      },
      // { text: 'rich', bold: true },
      // { text: ' text, ' },
      // { text: 'much', italic: true },
      // { text: ' better than a ' },
      // { text: '<textarea>', code: true },
      // { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },

  {
    type: 'heading',
    contentEditable: false,
    children: [
      {
        text: 'Technique',
        bold: true,
        align: 'center',
        center: true,
      },
      // { text: 'rich', bold: true },
      // { text: ' text, ' },
      // { text: 'much', italic: true },
      // { text: ' better than a ' },
      // { text: '<textarea>', code: true },
      // { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'heading',
    contentEditable: false,
    children: [
      {
        text: 'Observations',
        bold: true,
        align: 'center',
        center: true,
      },
      // { text: 'rich', bold: true },
      // { text: ' text, ' },
      // { text: 'much', italic: true },
      // { text: ' better than a ' },
      // { text: '<textarea>', code: true },
      // { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'heading',
    contentEditable: false,
    children: [
      {
        text: 'Advice',
        bold: true,
        align: 'center',
        center: true,
      },
      // { text: 'rich', bold: true },
      // { text: ' text, ' },
      // { text: 'much', italic: true },
      // { text: ' better than a ' },
      // { text: '<textarea>', code: true },
      // { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
];

export default RichTextExample;
