import { h } from '../dom';
import { t } from '../i18n';

/**
 * Asks for confirmation in a modal dialog.
 * @param title Dialog title.
 * @param text Explanation of what happens.
 * @param danger Styles the confirm button as destructive.
 * @returns Promise resolving to `true` when confirmed.
 * @example if (await confirmDialog('Reset?', 'The timer stops.', true)) reset();
 */
export const confirmDialog = (title: string, text: string, danger = false) =>
  new Promise<boolean>(resolve => {
    const close = (result: boolean) => {
      dialog.close();
      dialog.remove();
      resolve(result);
    };
    const okBtn = h('button', {
      class: ['dt-btn', danger ? 'dt-btn--danger' : 'dt-btn--primary'],
      text: t('confirm'),
      attrs: { type: 'button' },
      on: { click: () => close(true) },
    });
    const dialog = h('dialog', { class: 'dt-dialog' }, [
      h('h3', { text: title }),
      h('p', { text }),
      h('div', { class: 'dt-dialog-actions' }, [
        h('button', { class: 'dt-btn', text: t('cancel'), attrs: { type: 'button' }, on: { click: () => close(false) } }),
        okBtn,
      ]),
    ]);
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      close(false);
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) close(false);
    });
    document.body.append(dialog);
    dialog.showModal();
    okBtn.focus();
  });
