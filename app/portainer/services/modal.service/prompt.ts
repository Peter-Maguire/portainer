import sanitize from 'sanitize-html';
import bootbox from 'bootbox';
import '@@/BoxSelector/BoxSelectorItem.css';

import { applyBoxCSS, ButtonsOptions, confirmButtons } from './utils';

type PromptCallback = ((value: string) => void) | ((value: string[]) => void);

interface InputOption {
  text: string;
  value: string;
}

interface PromptOptions {
  title: string;
  inputType?:
    | 'text'
    | 'textarea'
    | 'email'
    | 'select'
    | 'checkbox'
    | 'date'
    | 'time'
    | 'number'
    | 'password'
    | 'radio'
    | 'range';
  inputOptions: InputOption[];
  buttons: ButtonsOptions;
  value?: string;
  callback: PromptCallback;
}

export async function promptAsync(options: Omit<PromptOptions, 'callback'>) {
  return new Promise((resolve) => {
    prompt({
      ...options,
      callback: (result: string | string[]) => resolve(result),
    });
  });
}

export function prompt(options: PromptOptions) {
  const box = bootbox.prompt({
    title: options.title,
    inputType: options.inputType,
    inputOptions: options.inputOptions,
    buttons: options.buttons ? confirmButtons(options.buttons) : undefined,
    // casting is done because ts definition expects string=>any, but library code can emit different values, based on inputType
    callback: options.callback as (value: string) => void,
    value: options.value,
  });

  applyBoxCSS(box);

  return box;
}

export function confirmContainerDeletion(
  title: string,
  callback: PromptCallback
) {
  const sanitizedTitle = sanitize(title);

  prompt({
    title: sanitizedTitle,
    inputType: 'checkbox',
    inputOptions: [
      {
        text: 'Automatically remove non-persistent volumes<i></i>',
        value: '1',
      },
    ],
    buttons: {
      confirm: {
        label: 'Remove',
        className: 'btn-danger',
      },
    },
    callback,
  });
}

export function selectRegistry(options: PromptOptions) {
  prompt(options);
}

export function confirmContainerRecreation(
  cannotPullImage: boolean | null,
  callback: PromptCallback
) {
  const box = prompt({
    title: 'Are you sure?',

    inputType: 'checkbox',
    inputOptions: [
      {
        text: 'Pull latest image<i></i>',
        value: '1',
      },
    ],
    buttons: {
      confirm: {
        label: 'Recreate',
        className: 'btn-danger',
      },
    },
    callback,
  });

  const message = `You're about to recreate this container and any non-persisted data will be lost. This container will be removed and another one will be created using the same configuration.`;
  box.find('.bootbox-body').prepend(`<p>${message}</p>`);
  const label = box.find('.form-check-label');
  label.css('padding-left', '5px');
  label.css('padding-right', '25px');

  if (cannotPullImage) {
    label.css('cursor', 'not-allowed');
    label.find('i').css('cursor', 'not-allowed');
    const checkbox = box.find('.bootbox-input-checkbox');
    checkbox.prop('disabled', true);
    const formCheck = box.find('.form-check');
    formCheck.prop('style', 'height: 45px;');
    const cannotPullImageMessage = `<div class="fa fa-exclamation-triangle text-warning"/>
               <div class="inline-text text-warning">
                   <span>Cannot pull latest as the image is inaccessible - either it no longer exists or the tag or name is no longer correct.
                   </span>
               </div>`;
    formCheck.append(`${cannotPullImageMessage}`);
  }
}

export function confirmServiceForceUpdate(
  message: string,
  callback: PromptCallback
) {
  const sanitizedMessage = sanitize(message);

  const box = prompt({
    title: 'Are you sure?',
    inputType: 'checkbox',
    inputOptions: [
      {
        text: 'Pull latest image version<i></i>',
        value: '1',
      },
    ],
    buttons: {
      confirm: {
        label: 'Update',
        className: 'btn-primary',
      },
    },
    callback,
  });

  customizeCheckboxPrompt(box, sanitizedMessage);
}

export function confirmStackUpdate(
  message: string,
  defaultDisabled: boolean,
  defaultToggle: boolean,
  confirmButtonClassName: string | undefined,
  callback: PromptCallback
) {
  const box = prompt({
    title: 'Are you sure?',
    inputType: 'checkbox',
    inputOptions: [
      {
        text: 'Pull latest image version<i></i>',
        value: '1',
      },
    ],
    buttons: {
      confirm: {
        label: 'Update',
        className: confirmButtonClassName || 'btn-primary',
      },
    },
    callback,
  });
  box.find('.bootbox-body').prepend(message);
  const checkbox = box.find('.bootbox-input-checkbox');
  checkbox.prop('checked', defaultToggle);
  checkbox.prop('disabled', defaultDisabled);
  const checkboxDiv = box.find('.checkbox');
  checkboxDiv.removeClass('checkbox');
  checkboxDiv.prop(
    'style',
    'position: relative; display: block; margin-top: 10px; margin-bottom: 10px;'
  );
  const checkboxLabel = box.find('.form-check-label');
  checkboxLabel.addClass('switch box-selector-item limited business');
  const switchEle = checkboxLabel.find('i');
  switchEle.prop('style', 'margin-left:20px');
}

function customizeCheckboxPrompt(
  box: JQuery<HTMLElement>,
  message: string,
  toggleCheckbox = false,
  showCheck = false
) {
  box.find('.bootbox-body').prepend(`<p>${message}</p>`);
  const checkbox = box.find('.bootbox-input-checkbox');
  checkbox.prop('checked', toggleCheckbox);

  if (showCheck) {
    checkbox.addClass('visible');
  }
}
