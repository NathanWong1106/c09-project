import uniqolor from 'uniqolor';
import { createAbsolutePositionFromRelativePosition, createRelativePositionFromTypeIndex } from 'yjs';
import { Position } from 'monaco-editor';
import { Doc } from 'yjs';

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
