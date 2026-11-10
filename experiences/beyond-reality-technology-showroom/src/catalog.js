import phaseA from '../../beyond-reality-phase-a/data.json';
import { DISPLAYS } from './world.js';

const labels = {
  headphones: {
    features: {
      en: ['Padded over-ear cups', 'Metal headband', 'Display stand'],
      ar: ['وسائد تحيط بالأذن', 'طوق معدني', 'حامل عرض'],
    },
    code: { en: 'SOUND', ar: 'الصوت' },
  },
  watch: {
    features: {
      en: ['Round dial', 'Metal crown', 'Wraparound strap'],
      ar: ['ميناء دائري', 'تاج معدني', 'سوار ملتف'],
    },
    code: { en: 'TIME', ar: 'الوقت' },
  },
  camera: {
    features: {
      en: ['Stacked lens rings', 'Textured grip', 'Top control dials'],
      ar: ['حلقات عدسة متدرجة', 'قبضة محببة', 'أقراص تحكم علوية'],
    },
    code: { en: 'IMAGING', ar: 'التصوير' },
  },
};

export const products = DISPLAYS.map(({ id }, index) => {
  const product = phaseA.products.find(item => item.id === id);
  return {
    id,
    number: String(index + 1).padStart(2, '0'),
    name: { en: product.en, ar: product.ar },
    description: { en: product.descriptionEn, ar: product.descriptionAr },
    ...labels[id],
  };
});
