export type FeatureIconName = 'coffee' | 'droplets' | 'layout-grid' | 'sun';

export interface WhyFeature {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: FeatureIconName;
}

export const WHY_RASSA_FEATURES: WhyFeature[] = [
  {
    id: 'quality-ingredients',
    number: '01',
    title: 'Quality Ingredients',
    description:
      'Selected coffee beans, fresh dairy, and clean botanicals prepared daily for balanced taste.',
    icon: 'coffee',
  },
  {
    id: 'carefully-crafted',
    number: '02',
    title: 'Carefully Crafted',
    description:
      'Each beverage is brewed to order with thoughtful attention to extraction, milk texture, and temperature.',
    icon: 'droplets',
  },
  {
    id: 'variety-of-choices',
    number: '03',
    title: 'Variety of Choices',
    description:
      'Enjoy classic espresso drinks, signature chilled lattes, non-coffee favorites, and fresh bakery pairings.',
    icon: 'layout-grid',
  },
  {
    id: 'enjoyable-experience',
    number: '04',
    title: 'Enjoyable Experience',
    description:
      'A calm, minimalist atmosphere welcoming students, creatives, and professionals alike.',
    icon: 'sun',
  },
];
