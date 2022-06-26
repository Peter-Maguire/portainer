import { number, object, SchemaOf } from 'yup';
import { gpusListValidation } from 'Portainer/views/endpoints/edit/GpusList';

import { metadataValidation } from '../../MetadataFieldset/validation';
import { nameValidation } from '../../NameField';

import { validation as urlValidation } from './PortainerUrlField';
import { FormValues } from './types';

export function validationSchema(): SchemaOf<FormValues> {
  return object().shape({
    name: nameValidation(),
    portainerUrl: urlValidation(),
    pollFrequency: number().required(),
    meta: metadataValidation(),
    gpus: gpusListValidation(),
  });
}
