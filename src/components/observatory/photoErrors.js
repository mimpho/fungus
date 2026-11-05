import { PHOTOS_MAX } from '../../lib/cornerKinds'

/** Why a photo action failed, in words: every kind the API can answer has its own. */
export function photoErrorText(t, error) {
  switch (error?.kind) {
    case 'conflict': return t.obsPhotoErrFull.replace('{n}', PHOTOS_MAX)
    case 'too_large': return t.obsPhotoErrTooLarge
    case 'unsupported': return t.obsPhotoErrUnsupported
    case 'limit': return t.obsPhotoErrLimit
    case 'storage': return t.obsPhotoErrStorage
    case 'unavailable': return t.obsPhotoErrOff
    case 'network': return t.obsPhotoErrNetwork
    default: return t.obsPhotoErrGeneric
  }
}
