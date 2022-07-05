import angular from 'angular';

import { r2a } from '@/react-tools/react2angular';
import { Icon } from '@/react/components/Icon';
import { ReactQueryDevtoolsWrapper } from '@/react/components/ReactQueryDevtoolsWrapper';
import { PorAccessControlFormTeamSelector } from '@/react/portainer/access-control/PorAccessControlForm/TeamsSelector';
import { PorAccessControlFormUserSelector } from '@/react/portainer/access-control/PorAccessControlForm/UsersSelector';

import { PageHeader } from '@@/PageHeader';
import { TagSelector } from '@@/TagSelector';
import { Loading } from '@@/Widget/Loading';
import { PasswordCheckHint } from '@@/PasswordCheckHint';
import { ViewLoading } from '@@/ViewLoading';
import { Tooltip } from '@@/Tip/Tooltip';
import { DashboardItem } from '@@/DashboardItem';
import { SearchBar } from '@@/datatables/SearchBar';
import { TeamsSelector } from '@@/TeamsSelector';
import { MultiSelect } from '@@/form-components/MultiSelect';

import { fileUploadField } from './file-upload-field';
import { switchField } from './switch-field';
import { customTemplatesModule } from './custom-templates';

export const componentsModule = angular
  .module('portainer.app.react.components', [customTemplatesModule])
  .component(
    'tagSelector',
    r2a(TagSelector, ['allowCreate', 'onChange', 'value'])
  )
  .component('portainerTooltip', r2a(Tooltip, ['message', 'position']))
  .component('fileUploadField', fileUploadField)
  .component('porSwitchField', switchField)
  .component(
    'passwordCheckHint',
    r2a(PasswordCheckHint, ['forceChangePassword', 'passwordValid'])
  )
  .component('rdLoading', r2a(Loading, []))
  .component('viewLoading', r2a(ViewLoading, ['message']))
  .component(
    'pageHeader',
    r2a(PageHeader, ['title', 'breadcrumbs', 'loading', 'onReload', 'reload'])
  )
  .component(
    'prIcon',
    r2a(Icon, ['className', 'feather', 'icon', 'mode', 'size'])
  )
  .component('reactQueryDevTools', r2a(ReactQueryDevtoolsWrapper, []))
  .component(
    'dashboardItem',
    r2a(DashboardItem, ['featherIcon', 'icon', 'type', 'value', 'children'])
  )
  .component(
    'datatableSearchbar',
    r2a(SearchBar, ['data-cy', 'onChange', 'value', 'placeholder'])
  )
  .component(
    'teamsSelector',
    r2a(TeamsSelector, [
      'onChange',
      'value',
      'dataCy',
      'inputId',
      'name',
      'placeholder',
      'teams',
    ])
  )
  .component(
    'porAccessControlFormTeamSelector',
    r2a(PorAccessControlFormTeamSelector, [
      'inputId',
      'onChange',
      'options',
      'value',
    ])
  )
  .component(
    'porAccessControlFormUserSelector',
    r2a(PorAccessControlFormUserSelector, [
      'inputId',
      'onChange',
      'options',
      'value',
    ])
  )
  .component(
    'porMultiSelect',
    r2a(MultiSelect, [
      'dataCy',
      'inputId',
      'name',
      'value',
      'onChange',
      'options',
      'placeholder',
    ])
  ).name;
