import uniqolor from 'uniqolor';

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
