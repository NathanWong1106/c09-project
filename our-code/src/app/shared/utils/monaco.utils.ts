import uniqolor from 'uniqolor';
import { createAbsolutePositionFromRelativePosition, createRelativePositionFromTypeIndex } from 'yjs';
import { Position } from 'monaco-editor';
import { Doc } from 'yjs';
import { style } from '@angular/animations';

/**
 * Update or create the style in the head for the given clients.
 * @param clients yjs Awareness client ids
 */
export const injectStyleForClients = (clients: number[]) => {
  const style =
    document.getElementById('monacoCursorStyles') ||
    document.createElement('style');
  style.id = 'monacoCursorStyles';
  for (const client of clients) {
    const selectionColor = uniqolor(client, {
      lightness: 30,
      saturation: 40,
    }).color;
    const cursorColor = uniqolor(client, {
      lightness: 60,
      saturation: 60,
    }).color;

    const clientStyle = `

      .yRemoteSelection-${client} { 
        background-color: ${selectionColor}
      }

      .yRemoteSelectionHead-${client} {
            position: absolute;
            border-left: ${cursorColor} solid 2px;
            border-top: ${cursorColor} solid 2px;
            border-bottom: ${cursorColor} solid 2px;
            height: 100%;
            box-sizing: border-box;
      }

      `;
    style.innerHTML = clientStyle;
  }
  document.head.appendChild(style);
};

/**
 * Update or create the style in the head for the given comments.
 *
 */
export const injectStyleforComments = () => {
  const style = document.getElementById('monacoCommentStyles') ||
    document.createElement('style');
  style.id = 'monacoCommentStyles';
  const commentStyle = `
    /* width */
    ::-webkit-scrollbar {
      width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      background: #1e1e1e; 
    } 
    
    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: #343434; 
    }

    *,
    ::after,
    ::before {
      /* https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing */
      box-sizing: border-box;
    }

    .comment {
      border-top: 1px solid #0c74bc;
      height: 100%;
      display: flex;
      width: 90vw;
      background-color: #252525; 
      align-items: center; 
      justify-content: center; 
    }

    .end {
      display: flex;
      justify-content: end;
    }

    .user-content {
      height: 100%;
      display: flex; 
      flex-direction: column; 
      justify-content: space-between;
    }

    .comment-email {
      color: #bdbdbd;
      font-weight: bold; 
    }

    .comment-content {
      color: #bdbdbd;
      border: 1px solid #1a4666;
      background-color: #1e1e1e;
      padding: 3px;
      overflow-y: auto; 
      overflow-x: hidden;
      margin-right: 5px;
      height: 50px;
    }

    .button {
      font-size: 20px; 
      margin-top: 5px; 
      color: white; 
      border: none; 
      border-radius: 5px; 
      cursor: pointer;
    }

    .button-col {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .button-row {
      display: flex; 
      align-items: center;    
    }

    .button:hover {
      opacity: 0.7;
    }

    .like {
      background-color: transparent; 
    }

    .dislike {
      background-color: transparent; 
    } 

    .count {
      margin-right: 15px;
      color: white;
    }

    .delete {
      background-color: transparent;
    }
  `;

  style.innerHTML = commentStyle;

  document.head.appendChild(style);
}

/**
 * create a new relative position from a monaco position
 * @param editor monaco editor
 * @param position monaco position
 * @returns Y.RelativePosition
 */
export function createRelativePosFromMonacoPos(editor: any, position: Position, doc: Doc) {
  const relPos = createRelativePositionFromTypeIndex(
    doc.getText('content'),
    editor.getModel().getOffsetAt(position)
  );
  return relPos;
}

/**
 * create a new monaco position from a relative position
 * @param editor monaco editor
 * @param relPos relative position as a string
 * @returns monaco position
 */
export function createMonacoPosFromRelativePos(editor: any, relPos: string, doc: Doc) {
  const decodedRelPos = JSON.parse(relPos);
  const absPos = createAbsolutePositionFromRelativePosition(
    decodedRelPos,
    doc
  );
  if (absPos !== null && absPos.type === doc.getText('content')) {
    const model = editor.getModel();
    const pos = model.getPositionAt(absPos.index);
    return pos;
  }
  return null;
}
