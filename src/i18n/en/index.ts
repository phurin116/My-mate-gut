import { biz } from './biz';
import { common } from './common';
import { pub } from './pub';
import { stu } from './stu';

/** English dictionary. A new locale must export an object with this exact shape. */
export const en = { ...common, pub, stu, biz };
